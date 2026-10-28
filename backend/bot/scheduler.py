"""
Rotina de agendamento e disparo proativo de lembretes de aula via WhatsApp.
Executa verificações de horários para enviar enquetes interativas aos estudantes reais.
Integrado ao ciclo de vida (lifespan) assíncrono do FastAPI.
"""

import asyncio
from datetime import datetime, date
from typing import Any, Dict, List, Optional, Set, Tuple
from services import supabase_service
from services.evolution_service import evolution_service
from config import settings

class AttendanceScheduler:
    def __init__(self):
        self._is_running = False
        self._notified_today: Set[Tuple[str, int, int]] = set()  # (date_str, subject_id, student_id)
        self._current_date_str = date.today().isoformat()

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
        if not phone:
            return False

        question = f"🎓 UniGag: Você compareceu à aula de {subject_name} hoje?"
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
        target_time: Optional[datetime] = None
    ) -> int:
        """
        Analisa a grade dos estudantes reais cadastrados no Supabase com telefone ativo
        e dispara enquetes para disciplinas cujo horário bate com o dia atual.
        Evita notificações repetidas no mesmo dia para o mesmo estudante.
        """
        now = target_time or datetime.now()
        today_str = now.date().isoformat()

        # Reseta o registro se mudou de dia
        if today_str != self._current_date_str:
            self._notified_today.clear()
            self._current_date_str = today_str

        # Busca estudantes cadastrados que possuam telefone registrado
        students: List[Dict[str, Any]] = []
        try:
            res = (
                supabase_service.supabase.table("students")
                .select("id, name, phone")
                .not_.is_("phone", "null")
                .execute()
            )
            students = res.data or []
        except Exception as err:
            print(f"⚠️ [SCHEDULER] Falha ao consultar estudantes cadastrados: {err}")
            return 0

        if not students:
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

        total_dispatched = 0

        for st in students:
            st_id = st.get("id")
            st_phone = (st.get("phone") or "").strip()
            if not st_id or not st_phone:
                continue

            subjects = supabase_service.get_student_subjects(st_id)
            if not subjects:
                continue

            for sub in subjects:
                sub_id = sub.get("id")
                sub_name = sub.get("name")
                if not sub_id or not sub_name:
                    continue

                dedup_key = (today_str, sub_id, st_id)
                if dedup_key in self._notified_today:
                    continue

                schedule_str = (sub.get("schedule") or "").strip()
                is_scheduled_for_today = (
                    not schedule_str
                    or today_weekday.lower() in schedule_str.lower()
                )

                if is_scheduled_for_today:
                    success = await self.send_attendance_check(
                        phone=st_phone,
                        subject_name=sub_name,
                        subject_id=sub_id
                    )
                    if success:
                        self._notified_today.add(dedup_key)
                        total_dispatched += 1
                        print(
                            f"\033[1;36m[⏰ SCHEDULER]\033[0m Enquete de presença enviada para '{sub_name}' "
                            f"(Aluno {st_id}, Telefone: {st_phone})."
                        )

        return total_dispatched

    async def run_periodic_checker(self, interval_seconds: int = 60):
        """
        Loop assíncrono executado em segundo plano no ciclo de vida do FastAPI.
        Verifica periodicamente os horários para disparo de enquetes aos estudantes reais.
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
        student_id: Optional[int] = None
    ) -> int:
        """
        Dispara manualmente confirmações de presença para as disciplinas reais do estudante.
        """
        resolved_student_id = student_id
        if not resolved_student_id and phone:
            st = supabase_service.get_student_by_phone(phone)
            if st:
                resolved_student_id = st.get("id")

        if not resolved_student_id:
            return 0

        subjects = supabase_service.get_student_subjects(resolved_student_id)
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
