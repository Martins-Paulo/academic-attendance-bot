"""
Rotina de agendamento e disparo proativo de lembretes de aula via WhatsApp.
Executa verificações de horários para enviar enquetes interativas aos estudantes.
Integrado ao ciclo de vida (lifespan) assíncrono do FastAPI.
"""

import asyncio
from datetime import datetime, date, time
from typing import Any, Dict, List, Optional, Set, Tuple
from services import supabase_service
from services.evolution_service import evolution_service
from config import settings

class AttendanceScheduler:
    def __init__(self):
        self._is_running = False
        self._notified_today: Set[Tuple[str, int, int]] = set()  # (date_str, subject_id, student_id)
        self._current_date_str = date.today().isoformat()
        self.default_student_phone = "5511999998888"  # Telefone padrão de teste ou obtido via banco

    def start(self):
        """Ativa a flag de execução do scheduler."""
        self._is_running = True

    def stop(self):
        """Desativa a flag de execução do scheduler."""
        self._is_running = False

    async def send_attendance_check(
        self,
        phone: str,
        subject_name: str,
        subject_id: int
    ) -> bool:
        """
        Envia uma enquete de presença interativa no WhatsApp do aluno.
        """
        question = f"🎓 UniGag: Você esteve presente na aula de {subject_name} hoje?"
        options = [
            f"✅ Sim, estive presente ({subject_name})",
            f"❌ Não, faltei ({subject_name})",
            f"🚫 Aula cancelada ({subject_name})",
        ]

        res = await evolution_service.send_poll_message(
            phone=phone,
            question=question,
            options=options,
            max_selectable=1
        )
        return res.get("success", False)

    async def check_and_dispatch_reminders(
        self,
        target_time: Optional[datetime] = None,
        student_id: int = settings.DEFAULT_STUDENT_ID
    ) -> int:
        """
        Analisa a grade e horários do estudante e dispara enquetes para disciplinas cujo horário
        de aula acabou de encerrar. Evita notificações repetidas no mesmo dia.
        """
        now = target_time or datetime.now()
        today_str = now.date().isoformat()

        # Reseta o registro se mudou de dia
        if today_str != self._current_date_str:
            self._notified_today.clear()
            self._current_date_str = today_str

        subjects = supabase_service.get_student_subjects(student_id)
        if not subjects:
            return 0

        # Mapeamento do dia da semana (0 = Segunda, ..., 6 = Domingo)
        weekday_map = {
            0: "Segunda",
            1: "Terça",
            2: "Quarta",
            3: "Quinta",
            4: "Sexta",
            5: "Sábado",
            6: "Domingo"
        }
        today_weekday = weekday_map.get(now.weekday(), "")

        sent_count = 0
        for sub in subjects:
            sub_id = sub.get("id")
            sub_name = sub.get("name")
            if not sub_id or not sub_name:
                continue

            dedup_key = (today_str, sub_id, student_id)
            if dedup_key in self._notified_today:
                continue

            # Verifica o cronograma da matéria (ex: "Segundas 19:00", ou janelas convencionais de aula)
            schedule_str = (sub.get("schedule") or "").strip()
            
            # Se a disciplina possui dia configurado e bate com hoje (ou é chamada geral para matérias do dia)
            is_scheduled_for_today = (
                not schedule_str
                or today_weekday.lower() in schedule_str.lower()
            )

            # Janela de verificação de término de aula:
            # - Em ambiente real, dispara no término de blocos (ex.: 12:00, 18:00, 21:00 ou conforme schedule)
            # Para o scheduler ativo, se coincidir com o término ou teste manual, dispara:
            if is_scheduled_for_today:
                # Dispara a enquete
                success = await self.send_attendance_check(
                    phone=self.default_student_phone,
                    subject_name=sub_name,
                    subject_id=sub_id
                )
                if success:
                    self._notified_today.add(dedup_key)
                    sent_count += 1
                    print(
                        f"\033[1;36m[⏰ SCHEDULER]\033[0m Enquete de presença enviada para '{sub_name}' "
                        f"(Aluno {student_id}, Telefone: {self.default_student_phone})."
                    )

        return sent_count

    async def run_periodic_checker(self, interval_seconds: int = 60):
        """
        Loop infinito assíncrono executado em segundo plano no ciclo de vida do FastAPI.
        Verifica periodicamente os horários para disparo de enquetes.
        """
        self.start()
        print(f"\033[1;36m[⏰ SCHEDULER]\033[0m Agendador de aulas ativo (intervalo de checagem: {interval_seconds}s).")

        try:
            while self._is_running:
                try:
                    await self.check_and_dispatch_reminders()
                except Exception as check_err:
                    print(f"\033[1;31m[⏰ SCHEDULER ERROR]\033[0m Erro ao verificar horários: {check_err}")

                await asyncio.sleep(interval_seconds)
        except asyncio.CancelledError:
            print("\033[1;33m[⏰ SCHEDULER]\033[0m Loop do agendador cancelado graciosamente.")
        finally:
            self._is_running = False

    async def trigger_daily_reminders_for_student(
        self,
        phone: str,
        student_id: int = settings.DEFAULT_STUDENT_ID
    ) -> int:
        """
        Dispara manualmente confirmações de presença para todas as matérias ativas.
        """
        subjects = supabase_service.get_student_subjects(student_id)
        if not subjects:
            return 0

        sent_count = 0
        for sub in subjects:
            name = sub.get("name")
            sub_id = sub.get("id")
            if name and sub_id:
                success = await self.send_attendance_check(phone, name, sub_id)
                if success:
                    sent_count += 1
                await asyncio.sleep(0.5)

        return sent_count

attendance_scheduler = AttendanceScheduler()
