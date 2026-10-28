"""
Roteador e despachante de comandos e mensagens do Bot WhatsApp UniGag.
Implementa uma experiência conversacional acolhedora, adaptativa e neutra.
Coordena o fluxo: Mensagem WhatsApp -> Gemini Intent Parser -> Supabase Service -> Resposta Formatada.
"""

from typing import Any, Dict, List, Optional
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
        Processa mensagens recebidas do WhatsApp com abordagem adaptativa:
        1. Se remetente NÃO cadastrado: onboarding neutro, acolhedor e orientativo.
        2. Se remetente CADASTRADO: boas-vindas dinâmicas com a grade real e comandos naturais.
        """
        text = (message_text or "").strip()
        if not text:
            return "Olá! Envie uma mensagem para registrar presença ou consultar suas matérias. 🎓"

        # ----------------------------------------------------------------------
        # 1. Identificação do estudante no Supabase (sem fallback forçado)
        # ----------------------------------------------------------------------
        student = None
        try:
            if phone:
                student = supabase_service.get_student_by_phone(phone)
            elif student_id:
                student = supabase_service.get_student(student_id)
        except Exception as lookup_err:
            print(f"⚠️ Erro ao consultar estudante no banco (phone='{phone}', id={student_id}): {lookup_err}")

        # ----------------------------------------------------------------------
        # 2. Fluxo para Remetente NÃO Cadastrado (Diretriz 2)
        # ----------------------------------------------------------------------
        if not student:
            # Interpretação prévia para verificar se o usuário respondeu como quer ser chamado ou tom
            parsed_initial = await gemini_service.parse_student_intent(text, [])
            if parsed_initial.intent == "SET_NAME" and parsed_initial.extracted_name:
                name = parsed_initial.extracted_name
                return (
                    f"Prazer em te conhecer, {name}! 🤝 Já guardei seu nome por aqui.\n\n"
                    "Para que eu possa sincronizar suas disciplinas e acompanhar suas frequências em tempo real, "
                    f"crie sua conta no UniGag com este mesmo número:\n\n"
                    f"🌐 Acesse: {settings.FRONTEND_URL}\n\n"
                    "Assim que cadastrar suas matérias e salvar seu perfil, me mande uma mensagem aqui para começarmos! 🚀"
                )

            if parsed_initial.intent == "SET_TONE":
                tone_pref = "formal e sem gírias" if parsed_initial.extracted_tone == "neutral" else "descontraído com gírias"
                return (
                    f"Anotado! Já sei que você prefere nosso papo {tone_pref}. ✍️\n\n"
                    "Para que eu possa salvar seu perfil e sincronizar suas matérias:\n\n"
                    f"🌐 Crie sua conta aqui: {settings.FRONTEND_URL}\n\n"
                    "Assim que terminar de cadastrar sua grade, me mande um 'oi' para começarmos!"
                )

            return (
                "Olá! Boas-vindas ao UniGag! 🎓✨\n\n"
                "Sou o assistente que te ajuda a gerenciar presenças, limites de faltas e entregas sem complicação.\n\n"
                "Ainda não encontrei o seu número cadastrado na nossa plataforma. Para começar a acompanhar suas matérias em tempo real:\n\n"
                f"🌐 Crie sua conta aqui: {settings.FRONTEND_URL}\n\n"
                "Depois de cadastrar suas disciplinas e salvar seu WhatsApp no perfil, me envie uma mensagem por aqui para começarmos!\n\n"
                "(Ah, e me conta: como prefere que eu te chame por aqui?)"
            )

        # ----------------------------------------------------------------------
        # 3. Fluxo para Remetente CADASTRADO (Diretriz 3)
        # ----------------------------------------------------------------------
        effective_student_id = student["id"]
        preferred_name = (student.get("preferred_name") or student.get("name") or "").strip()
        first_name = preferred_name.split()[0] if preferred_name else ""
        bot_tone = student.get("bot_tone") or "queer"

        # Recupera disciplinas REAIS cadastradas para o estudante
        subjects = supabase_service.get_student_subjects(effective_student_id)
        subject_names = [sub.get("name", "") for sub in subjects if sub.get("name")]

        # Interpretação semântica com o Gemini (ou fallback heurístico inteligente)
        parsed = await gemini_service.parse_student_intent(text, subject_names, bot_tone=bot_tone)

        # 3.1 Aluno alterando a preferência de tom/personalidade (SET_TONE)
        if parsed.intent == "SET_TONE":
            new_tone = parsed.extracted_tone or "queer"
            supabase_service.update_student_tone(effective_student_id, new_tone)
            student["bot_tone"] = new_tone
            if new_tone == "neutral":
                return (
                    "Preferência atualizada com sucesso. A partir de agora, nossa comunicação será formal, direta e sem gírias.\n\n"
                    "Como posso ajudá-lo(a) em suas disciplinas hoje?"
                )
            else:
                return (
                    "Entendido, diva! 💅✨ Modo UniGag ativado com muito brilho e energia! Pode deixar que o babado aqui agora é com gíria e foco no diploma.\n\n"
                    "O que vamos ver hoje, mona? Arrasa!"
                )

        # 3.2 Aluno informando preferência de nome / apelido
        if parsed.intent == "SET_NAME":
            new_name = parsed.extracted_name or text.split()[-1]
            supabase_service.update_student_name_or_preference(effective_student_id, new_name)
            if bot_tone == "queer":
                return (
                    f"Perfeito, {new_name}! 😊 Já anotei aqui, diva! Arrasou.\n\n"
                    "No que posso te ajudar hoje com suas matérias, mona?"
                )
            return (
                f"Perfeito, {new_name}! 😊 Já anotei aqui como prefere ser chamado(a).\n\n"
                "No que posso te ajudar hoje?"
            )

        # 3.3 Saudação e primeiro contato de usuário cadastrado
        if parsed.intent == "GREETING":
            if subjects:
                materias_str = "\n".join([f"📌 {s.get('name')}" for s in subjects])
                exemplo_materia = subjects[0].get("name", "sua matéria")
                if bot_tone == "queer":
                    return (
                        f"E aí, {first_name or 'diva'}! Que bom te ter no UniGag! 📚✨\n\n"
                        "O babado acadêmico tá todo sincronizado. Suas disciplinas ativas neste semestre:\n"
                        f"{materias_str}\n\n"
                        "Você pode falar comigo de forma direta e natural, por exemplo:\n"
                        f"• 'Tô na aula de {exemplo_materia}' (pra cravar presença e arrasar)\n"
                        "• 'Faltei na aula de hoje' (pra gente não perder o foco no diploma)\n"
                        "• 'Quantas faltas ainda posso ter?' (pra não vacilar no limite)\n\n"
                        "No que posso te ajudar hoje, mona?"
                    )
                else:
                    return (
                        "Tudo certo por aí? Que bom te ter no UniGag! 📚\n\n"
                        "Já sincronizei suas informações. Suas disciplinas ativas neste semestre:\n"
                        f"{materias_str}\n\n"
                        "Você pode falar comigo de forma direta e natural, por exemplo:\n"
                        f"• 'Tô na aula de {exemplo_materia}' (para marcar presença)\n"
                        "• 'Faltei na aula de hoje' (para recalcularmos o saldo)\n"
                        "• 'Quantas faltas ainda posso ter?' (para conferir o limite)\n\n"
                        "No que posso te ajudar hoje?"
                    )
            else:
                greeting_name = f", {first_name}" if first_name else ""
                if bot_tone == "queer":
                    return (
                        f"Olá{greeting_name}, diva! Que bom te ter no UniGag! 📚✨\n\n"
                        "Vi que sua conta tá on, mas você ainda não cadastrou nenhuma disciplina neste semestre.\n\n"
                        f"🌐 Corre pro painel web pra adicionar suas matérias: {settings.FRONTEND_URL}\n\n"
                        "Assim que cadastrar suas matérias, é só me chamar pra gente lacrar nas presenças!"
                    )
                return (
                    f"Olá{greeting_name}! Que bom te ter no UniGag! 📚\n\n"
                    "Vi que sua conta está ativa, mas você ainda não cadastrou nenhuma disciplina neste semestre.\n\n"
                    f"🌐 Acesse o painel web para adicionar suas matérias: {settings.FRONTEND_URL}\n\n"
                    "Assim que cadastrar suas matérias por lá, você poderá registrar presença e acompanhar suas faltas diretamente por aqui!"
                )

        # 3.4 Ações acadêmicas quando o aluno ainda não possui matérias cadastradas
        if not subjects and parsed.intent in ("REGISTER_ATTENDANCE", "CHECK_LIMITS", "CHECK_SCHEDULE"):
            return (
                "📚 Você ainda não possui disciplinas cadastradas na sua grade.\n\n"
                f"Acesse o painel web para adicionar suas matérias: {settings.FRONTEND_URL}"
            )

        # 3.5 Registro de presença ou falta
        if parsed.intent == "REGISTER_ATTENDANCE":
            return await self._handle_attendance_registration(
                parsed.subject_name or text,
                parsed.status or "present",
                effective_student_id,
                subjects,
                bot_tone=bot_tone
            )

        # 3.6 Consulta de limites e faltas
        elif parsed.intent == "CHECK_LIMITS":
            return await self._handle_check_limits(
                parsed.subject_name,
                effective_student_id,
                subjects,
                bot_tone=bot_tone
            )

        # 3.7 Consulta de entregas e provas
        elif parsed.intent == "CHECK_EVENTS":
            return await self._handle_check_events(effective_student_id, bot_tone=bot_tone)

        # 3.8 Consulta de horários e grade
        elif parsed.intent == "CHECK_SCHEDULE":
            return await self._handle_check_schedule(subjects, bot_tone=bot_tone)

        # 3.9 Intenção desconhecida / Ajuda geral
        return self._get_help_message(subjects, first_name, bot_tone=bot_tone)

    async def _handle_attendance_registration(
        self,
        subject_query: str,
        status: str,
        student_id: int,
        subjects: List[Dict[str, Any]],
        bot_tone: str = "queer"
    ) -> str:
        """Registra presença ou falta na disciplina correta da grade real do aluno."""
        if not subjects:
            return (
                "📚 Você ainda não possui disciplinas cadastradas na sua grade.\n\n"
                f"Cadastre suas matérias no painel web: {settings.FRONTEND_URL}"
            )

        # Localiza a disciplina correspondente
        matched_subject = supabase_service.find_subject_by_query(subject_query, student_id)

        # Se não encontrou e o aluno só tem 1 matéria, utiliza ela por conveniência
        if not matched_subject and len(subjects) == 1:
            matched_subject = subjects[0]

        if not matched_subject:
            list_text = "\n".join([f"• {s.get('name')} ({s.get('code') or 'Ativa'})" for s in subjects])
            return (
                "🤔 Não consegui identificar a disciplina mencionada.\n\n"
                "Em qual destas matérias da sua grade você deseja registrar?\n"
                f"{list_text}\n\n"
                f"💡 Exemplo: *'Presença em {subjects[0].get('name')}'*"
            )

        subject_id = matched_subject["id"]
        subject_name = matched_subject["name"]

        try:
            # Registra no Supabase (com fallback resiliente integrado para RLS)
            supabase_service.register_attendance(
                subject_id=subject_id,
                student_id=student_id,
                status=status
            )

            # Consulta métricas atualizadas
            margin = supabase_service.get_absence_margins(subject_id, student_id, subject_data=matched_subject)

            if status == "present":
                cheer = "\nArrasou, diva! Foco no diploma! 💅🎓" if bot_tone == "queer" else ""
                return (
                    f"✅ *Presença confirmada!* 🎉\n\n"
                    f"📚 *Disciplina:* {subject_name}\n"
                    f"📊 *Frequência atual:* {margin['attendance_rate']}%\n"
                    f"🛡️ *Saldo de faltas:* {margin['absences_count']} de {margin['max_absences']} utilizadas ({margin['remaining_absences']} restantes).\n\n"
                    f"O seu painel Web UniGag já foi atualizado em tempo real!{cheer}"
                )
            elif status == "absence":
                alert = ""
                if margin.get("is_critical"):
                    alert = (
                        "\n🚨 *Babado forte, mona:* Você atingiu o limiar de risco nesta matéria! Foco no diploma!"
                        if bot_tone == "queer" else
                        "\n🚨 *ALERTA CRÍTICO:* Você atingiu o limiar de risco nesta matéria!"
                    )
                elif bot_tone == "queer":
                    alert = "\nCuidado pra não vacilar no saldo de faltas, diva! 💅"

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
                    "A ausência foi registrada como justificada e não consome seu limite de faltas."
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
        subjects: List[Dict[str, Any]],
        bot_tone: str = "queer"
    ) -> str:
        """Consulta margem de faltas em uma disciplina específica ou na grade completa."""
        if not subjects:
            return "📚 Você ainda não possui disciplinas cadastradas no UniGag."

        if subject_query:
            matched = supabase_service.find_subject_by_query(subject_query, student_id)
            if matched:
                m = supabase_service.get_absence_margins(matched["id"], student_id, subject_data=matched)
                if bot_tone == "queer":
                    risk_tag = "🚨 *EM RISCO (BABADO, MONA!)*" if m.get("is_critical") else "✅ *SEGURO (ARRASOU, DIVA!)*"
                else:
                    risk_tag = "🚨 *EM RISCO*" if m.get("is_critical") else "✅ *SEGURO*"
                return (
                    f"📊 *Status de Frequência — {m['subject_name']}*\n\n"
                    f"• Status: {risk_tag}\n"
                    f"• Faltas ocorridas: *{m['absences_count']}*\n"
                    f"• Limite máximo permitido: *{m['max_absences']}*\n"
                    f"• Margem de faltas restantes: *{m['remaining_absences']}*\n"
                    f"• Frequência consolidada: *{m['attendance_rate']}%*"
                )

        lines = ["📊 *Visão Geral de Limite de Faltas — UniGag*\n"]
        for s in subjects:
            try:
                m = supabase_service.get_absence_margins(s["id"], student_id, subject_data=s)
                icon = "🚨" if m.get("is_critical") else "🟢"
                lines.append(
                    f"{icon} *{m['subject_name']}*: {m['absences_count']}/{m['max_absences']} faltas ({m['remaining_absences']} restantes)"
                )
            except Exception:
                continue

        return "\n".join(lines)

    async def _handle_check_events(self, student_id: int, bot_tone: str = "queer") -> str:
        """Consulta próximas entregas e provas reais do estudante."""
        events = supabase_service.get_pending_events(student_id)
        if not events:
            if bot_tone == "queer":
                return "🎉 Zero entregas ou provas pendentes no momento! Tá tudo no grau, diva!"
            return "🎉 Você não possui entregas ou provas pendentes cadastradas no momento!"

        header = "📅 *Próximas Entregas e Provas Cadastradas (Foco no Diploma!):*\n" if bot_tone == "queer" else "📅 *Próximas Entregas e Provas Cadastradas:*\n"
        lines = [header]
        for ev in events:
            sub = ev.get("subjects") or {}
            sub_name = sub.get("name", "Geral")
            lines.append(
                f"• *{ev.get('title')}* ({ev.get('type', 'Trabalho')})\n"
                f"  📚 Matéria: {sub_name}\n"
                f"  ⏰ Data limite: {ev.get('event_date')}\n"
            )

        return "\n".join(lines)

    async def _handle_check_schedule(self, subjects: List[Dict[str, Any]], bot_tone: str = "queer") -> str:
        """Retorna as matérias cadastradas da grade real do aluno."""
        if not subjects:
            return "📚 Nenhuma disciplina cadastrada na sua grade."

        lines = ["🕒 *Disciplinas Cadastradas na sua Grade:*\n"]
        for s in subjects:
            code_str = f" ({s.get('code')})" if s.get('code') else ""
            lines.append(f"• *{s.get('name')}*{code_str} — Total: {s.get('total_classes', 64)} aulas")

        return "\n".join(lines)

    def _get_help_message(self, subjects: List[Dict[str, Any]], first_name: str = "", bot_tone: str = "queer") -> str:
        """Mensagem padrão de suporte e comandos rápidos adaptada à grade do aluno."""
        if bot_tone == "queer":
            greeting = f"👋 E aí, {first_name or 'diva'}! Eu sou o assistente acadêmico do *UniGag* com foco total no seu diploma! ✨"
        else:
            greeting = f"👋 Olá{', ' + first_name if first_name else ''}! Eu sou o assistente acadêmico do *UniGag*."

        if not subjects:
            return (
                f"{greeting}\n\n"
                "Para começar a registrar presenças e acompanhar faltas em tempo real, "
                f"adicione suas disciplinas no painel web: {settings.FRONTEND_URL}"
            )

        materia_exemplo = subjects[0].get("name", "sua matéria")
        return (
            f"{greeting}\n\n"
            "Como posso te ajudar hoje? Você pode me mandar:\n\n"
            f"✅ *'Tô na aula de {materia_exemplo}'* (registra presença)\n"
            "❌ *'Faltei na aula de hoje'* (registra falta)\n"
            "📊 *'Quantas faltas ainda posso ter?'* (consulta limites)\n"
            "📅 *'Quais são minhas próximas entregas?'* (lista trabalhos e provas)\n"
            "🎭 *'Prefiro sem gírias'* ou *'Pode usar gírias'* (configura o tom do bot)\n\n"
            "💬 Pode falar comigo de forma natural!"
        )

dispatcher = BotDispatcher()
