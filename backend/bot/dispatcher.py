"""
Roteador e despachante de comandos e mensagens do Bot WhatsApp.
Coordena o fluxo: Mensagem WhatsApp -> Gemini Intent Parser -> Supabase Service -> Resposta Formatada.
"""

from typing import Any, Dict, Optional
from services import supabase_service
from services.gemini_service import gemini_service
from config import settings

class BotDispatcher:
    def __init__(self):
        pass

    async def handle_message(
        self,
        phone: str,
        message_text: str,
        student_id: Optional[int] = None
    ) -> str:
        """
        Processa uma mensagem recebida de um estudante e retorna a resposta formatada.
        Identifica dinamicamente o aluno pelo telefone do remetente, com fallback seguro para config.
        """
        if not message_text or not message_text.strip():
            return "Olá! Envie uma mensagem para registrar presença ou consultar suas matérias."

        # Identifica dinamicamente o aluno pelo número de telefone cadastrado
        effective_student_id = student_id or settings.DEFAULT_STUDENT_ID
        try:
            if phone:
                student = supabase_service.get_student_by_phone(phone)
                if student and student.get("id"):
                    effective_student_id = student["id"]
        except Exception as lookup_err:
            print(f"⚠️ Erro ao consultar estudante pelo telefone '{phone}': {lookup_err}")

        # 1. Recupera lista de disciplinas ativas do aluno
        subjects = supabase_service.get_student_subjects(effective_student_id)
        subject_names = [sub.get("name", "") for sub in subjects if sub.get("name")]

        # 2. Interpreta a intenção usando Gemini (ou fallback heurístico)
        parsed = await gemini_service.parse_student_intent(message_text, subject_names)

        # 3. Executa a ação conforme a intenção mapeada
        if parsed.intent == "REGISTER_ATTENDANCE":
            return await self._handle_attendance_registration(
                parsed.subject_name or message_text,
                parsed.status or "present",
                effective_student_id,
                subjects
            )

        elif parsed.intent == "CHECK_LIMITS":
            return await self._handle_check_limits(
                parsed.subject_name,
                effective_student_id,
                subjects
            )

        elif parsed.intent == "CHECK_EVENTS":
            return await self._handle_check_events(effective_student_id)

        elif parsed.intent == "CHECK_SCHEDULE":
            return await self._handle_check_schedule(subjects)

        # Intenção desconhecida ou ajuda geral
        return self._get_help_message(subject_names)

    async def _handle_attendance_registration(
        self,
        subject_query: str,
        status: str,
        student_id: int,
        subjects: list
    ) -> str:
        """Registra presença ou falta na disciplina correta."""
        # Tenta localizar a disciplina
        matched_subject = supabase_service.find_subject_by_query(subject_query, student_id)

        # Se não encontrou e o aluno só tem 1 matéria, utiliza ela por conveniência
        if not matched_subject and len(subjects) == 1:
            matched_subject = subjects[0]

        if not matched_subject:
            # Lista as matérias disponíveis para o aluno escolher
            list_text = "\n".join([f"• {s.get('name')} ({s.get('code')})" for s in subjects])
            return (
                "🤔 Não consegui identificar a disciplina mencionada.\n\n"
                "Em qual destas matérias você deseja registrar?\n"
                f"{list_text}\n\n"
                "💡 Exemplo: *'Presença em Banco de Dados'* ou *'Faltei em ED'*"
            )

        subject_id = matched_subject["id"]
        subject_name = matched_subject["name"]

        try:
            # Insere no Supabase (acionando imediatamente o Supabase Realtime no Dashboard Web)
            supabase_service.register_attendance(
                subject_id=subject_id,
                student_id=student_id,
                status=status
            )

            # Consulta métricas atualizadas
            margin = supabase_service.get_absence_margins(subject_id, student_id)

            if status == "present":
                return (
                    f"✅ *Presença confirmada!* 🎉\n\n"
                    f"📚 *Disciplina:* {subject_name}\n"
                    f"📊 *Frequência atual:* {margin['attendance_rate']}%\n"
                    f"🛡️ *Saldo de faltas:* {margin['absences_count']} de {margin['max_absences']} utilizadas ({margin['remaining_absences']} restantes).\n\n"
                    "O seu painel Web UniGag já foi atualizado em tempo real!"
                )
            elif status == "absence":
                alert = ""
                if margin["is_critical"]:
                    alert = "\n🚨 *ALERTA CRÍTICO:* Você atingiu o limiar de risco nesta matéria!"

                return (
                    f"⚠️ *Falta registrada.* 📋\n\n"
                    f"📚 *Disciplina:* {subject_name}\n"
                    f"📊 *Frequência atual:* {margin['attendance_rate']}%\n"
                    f"⚠️ *Faltas:* {margin['absences_count']} de {margin['max_absences']} permitidas ({margin['remaining_absences']} restantes).{alert}\n\n"
                    "O registro foi sincronizado com seu dashboard."
                )
            elif status == "justified":
                return (
                    f"📝 *Falta justificada registrada* para *{subject_name}*! 📄\n\n"
                    f"📚 *Disciplina:* {subject_name}\n"
                    f"📊 *Frequência atual:* {margin['attendance_rate']}%\n"
                    "A ausência foi registrada como justificada e não penaliza seu limite de faltas."
                )
            else:
                return (
                    f"ℹ️ *Aula cancelada registrada* para *{subject_name}*.\n"
                    "Esse registro não consome seu limite de faltas."
                )

        except Exception as e:
            print(f"❌ Erro ao processar registro de chamada no dispatcher: {e}")
            return "❌ Ocorreu um erro ao salvar sua presença no banco de dados. Tente novamente em instantes."

    async def _handle_check_limits(
        self,
        subject_query: Optional[str],
        student_id: int,
        subjects: list
    ) -> str:
        """Consulta margem de faltas em uma disciplina ou em todas."""
        if subject_query:
            matched = supabase_service.find_subject_by_query(subject_query, student_id)
            if matched:
                m = supabase_service.get_absence_margins(matched["id"], student_id)
                risk_tag = "🚨 *EM RISCO*" if m["is_critical"] else "✅ *SEGURO*"
                return (
                    f"📊 *Status de Frequência — {m['subject_name']}*\n\n"
                    f"• Status: {risk_tag}\n"
                    f"• Faltas ocorridas: *{m['absences_count']}*\n"
                    f"• Limite máximo permitido: *{m['max_absences']}*\n"
                    f"• Margem de faltas restantes: *{m['remaining_absences']}*\n"
                    f"• Frequência consolidada: *{m['attendance_rate']}%*"
                )

        # Relatório geral de todas as matérias
        if not subjects:
            return "📚 Você ainda não possui disciplinas cadastradas no UniGag."

        lines = ["📊 *Visão Geral de Limite de Faltas — UniGag*\n"]
        for s in subjects:
            try:
                m = supabase_service.get_absence_margins(s["id"], student_id)
                icon = "🚨" if m["is_critical"] else "🟢"
                lines.append(
                    f"{icon} *{m['subject_name']}*: {m['absences_count']}/{m['max_absences']} faltas ({m['remaining_absences']} restantes)"
                )
            except Exception:
                continue

        return "\n".join(lines)

    async def _handle_check_events(self, student_id: int) -> str:
        """Consulta próximas entregas e provas."""
        events = supabase_service.get_pending_events(student_id)
        if not events:
            return "🎉 Você não possui entregas ou provas pendentes cadastradas no momento!"

        lines = ["📅 *Próximas Entregas e Provas Cadastradas:*\n"]
        for ev in events:
            sub = ev.get("subjects") or {}
            sub_name = sub.get("name", "Geral")
            lines.append(
                f"• *{ev.get('title')}* ({ev.get('type', 'Trabalho')})\n"
                f"  📚 Matéria: {sub_name}\n"
                f"  ⏰ Data limite: {ev.get('event_date')}\n"
            )

        return "\n".join(lines)

    async def _handle_check_schedule(self, subjects: list) -> str:
        """Retorna as matérias cadastradas da grade."""
        if not subjects:
            return "📚 Nenhuma disciplina cadastrada na sua grade."

        lines = ["🕒 *Disciplinas Cadastradas na sua Grade:*\n"]
        for s in subjects:
            lines.append(f"• *{s.get('name')}* (Código: {s.get('code')}) — Total: {s.get('total_classes', 64)} aulas")

        return "\n".join(lines)

    def _get_help_message(self, subjects: list) -> str:
        """Mensagem padrão de suporte e comandos rápidos."""
        subs_hint = f" ({len(subjects)} ativas)" if subjects else ""
        return (
            f"👋 Olá! Eu sou o assistente acadêmico do *UniGag*{subs_hint}.\n\n"
            "Como posso te ajudar hoje? Experimente mandar:\n\n"
            "✅ *'Tô na aula de Banco de Dados'* (registra presença)\n"
            "❌ *'Faltei na aula de ED hoje'* (registra falta)\n"
            "📊 *'Quantas faltas ainda posso ter?'* (consulta limites)\n"
            "📅 *'Quais são minhas próximas entregas?'* (lista trabalhos/provas)\n\n"
            "💬 Você também pode interagir em linguagem natural!"
        )

dispatcher = BotDispatcher()
