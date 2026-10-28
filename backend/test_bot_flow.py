"""
Script de Teste e Simulação do Fluxo do Bot WhatsApp UniGag (Abordagem Adaptativa).
Valida:
1. Remetente NÃO cadastrado -> Boas-vindas neutras, link oficial e pergunta sobre nome/apelido
2. Remetente NÃO cadastrado se apresentando -> Acolhimento amigável do nome e incentivo ao cadastro
3. Remetente CADASTRADO enviando saudação ("Oi") -> Boas-vindas dinâmicas com as matérias reais da grade
4. Remetente CADASTRADO registrando presença -> Confirmação precisa e métricas em tempo real
5. Remetente CADASTRADO consultando faltas -> Saldo e margem de faltas da matéria
6. Simulação HTTP via Webhook FastAPI (POST /webhook/whatsapp)
"""

import asyncio
import os
import sys
from pathlib import Path

# Ajusta path para importar módulos do backend
current_dir = Path(__file__).resolve().parent
if str(current_dir) not in sys.path:
    sys.path.insert(0, str(current_dir))

from bot.dispatcher import dispatcher
from services import supabase_service
from webhook_server import app
from config import settings
import httpx

async def run_bot_flow_tests():
    print("=" * 75)
    print("🤖 INICIANDO SIMULAÇÃO DO BOT WHATSAPP UNIGAG (DESIGN ADAPTATIVO & NEUTRO)")
    print("=" * 75)

    registered_phone = "5511999990001"
    unregistered_phone = "5511988887777"
    test_student_id = 101

    # Configuração de mock de estudante para ambiente de teste
    mock_student = {
        "id": test_student_id,
        "name": "Paulo Cesar",
        "preferred_name": "Paulo",
        "phone": registered_phone,
        "course": "Engenharia de Software",
        "semester": 4
    }

    mock_subjects = [
        {
            "id": 10,
            "student_id": test_student_id,
            "name": "Banco de Dados",
            "code": "INF0124",
            "total_classes": 64,
            "max_absences": 16
        },
        {
            "id": 11,
            "student_id": test_student_id,
            "name": "Estruturas de Dados",
            "code": "INF0123",
            "total_classes": 64,
            "max_absences": 16
        }
    ]

    # Monkeypatch dos métodos de consulta para ambiente de teste isolado
    orig_get_student_by_phone = supabase_service.get_student_by_phone
    orig_get_student_subjects = supabase_service.get_student_subjects
    orig_get_student = supabase_service.get_student
    orig_update_student_tone = supabase_service.update_student_tone

    def mock_get_student_by_phone(phone: str):
        if phone and registered_phone in phone:
            if not mock_student.get("bot_tone"):
                mock_student["bot_tone"] = "queer"
            return mock_student
        return None

    def mock_get_student_subjects(student_id: int):
        if student_id == test_student_id:
            return mock_subjects
        return []

    def mock_get_student(student_id: int):
        if student_id == test_student_id:
            if not mock_student.get("bot_tone"):
                mock_student["bot_tone"] = "queer"
            return mock_student
        return None

    def mock_update_student_tone(student_id: int, tone: str):
        if student_id == test_student_id:
            mock_student["bot_tone"] = tone
            return True
        return False

    supabase_service.get_student_by_phone = mock_get_student_by_phone
    supabase_service.get_student_subjects = mock_get_student_subjects
    supabase_service.get_student = mock_get_student
    supabase_service.update_student_tone = mock_update_student_tone

    try:
        # ----------------------------------------------------------------------
        # CENÁRIO 1: Usuário NÃO Cadastrado (Onboarding Neutro e Amigável)
        # ----------------------------------------------------------------------
        print("\n[Cenário 1/6] 📩 Remetente NÃO cadastrado enviando mensagem inicial...")
        reply_unreg = await dispatcher.handle_message(
            phone=unregistered_phone,
            message_text="Oi, como funciona o UniGag?"
        )
        print("  💬 Resposta do Bot UniGag:")
        for line in reply_unreg.split("\n"):
            print(f"    {line}")

        assert "Boas-vindas ao UniGag" in reply_unreg, "Deve conter saudação de boas-vindas"
        assert settings.FRONTEND_URL in reply_unreg, "Deve conter o link do frontend oficial"
        assert "como prefere que eu te chame" in reply_unreg, "Deve perguntar como o aluno prefere ser chamado"
        assert "diva" not in reply_unreg.lower() and "mona" not in reply_unreg.lower(), "Não deve conter vocativos divisivos"
        print("  ✅ Cenário 1 (Onboarding Neutro) aprovado com sucesso!")

        # ----------------------------------------------------------------------
        # CENÁRIO 2: Usuário NÃO Cadastrado Informando Apelido
        # ----------------------------------------------------------------------
        print("\n[Cenário 2/6] 📩 Remetente NÃO cadastrado informando apelido/nome...")
        reply_name = await dispatcher.handle_message(
            phone=unregistered_phone,
            message_text="Pode me chamar de Paulo"
        )
        print("  💬 Resposta do Bot UniGag:")
        for line in reply_name.split("\n"):
            print(f"    {line}")

        assert "Paulo" in reply_name, "Deve acolher o nome informado"
        assert settings.FRONTEND_URL in reply_name, "Deve direcionar para criar a conta"
        print("  ✅ Cenário 2 (Captura de Apelido Não Cadastrado) aprovado com sucesso!")

        # ----------------------------------------------------------------------
        # CENÁRIO 3: Usuário CADASTRADO (Boas-vindas Dinâmicas com Grade Real)
        # ----------------------------------------------------------------------
        print("\n[Cenário 3/6] 📩 Remetente CADASTRADO enviando saudação ('Oi')...")
        reply_reg = await dispatcher.handle_message(
            phone=registered_phone,
            message_text="Oi"
        )
        print("  💬 Resposta do Bot UniGag:")
        for line in reply_reg.split("\n"):
            print(f"    {line}")

        assert "Que bom te ter no UniGag" in reply_reg, "Deve dar boas-vindas calorosas"
        assert "Banco de Dados" in reply_reg, "Deve listar a matéria real 1 da grade"
        assert "Estruturas de Dados" in reply_reg, "Deve listar a matéria real 2 da grade"
        assert "Tô na aula de" in reply_reg, "Deve dar exemplos de comandos com a própria grade"
        print("  ✅ Cenário 3 (Saudação Dinâmica com Grade Real) aprovado com sucesso!")

        # ----------------------------------------------------------------------
        # CENÁRIO 4: Usuário CADASTRADO Registrando Presença
        # ----------------------------------------------------------------------
        print("\n[Cenário 4/6] 📩 Remetente CADASTRADO registrando presença em linguagem natural...")
        reply_att = await dispatcher.handle_message(
            phone=registered_phone,
            message_text="Tô na aula de Banco de Dados"
        )
        print("  💬 Resposta do Bot UniGag:")
        for line in reply_att.split("\n"):
            print(f"    {line}")

        assert "Presença confirmada" in reply_att, "Deve confirmar presença"
        assert "Banco de Dados" in reply_att, "Deve indicar a disciplina correta"
        print("  ✅ Cenário 4 (Registro de Presença) aprovado com sucesso!")

        # ----------------------------------------------------------------------
        # CENÁRIO 5: Usuário CADASTRADO Consultando Faltas
        # ----------------------------------------------------------------------
        print("\n[Cenário 5/6] 📩 Remetente CADASTRADO consultando limite de faltas...")
        reply_lim = await dispatcher.handle_message(
            phone=registered_phone,
            message_text="Quantas faltas ainda posso ter em BD?"
        )
        print("  💬 Resposta do Bot UniGag:")
        for line in reply_lim.split("\n"):
            print(f"    {line}")

        assert "Status de Frequência" in reply_lim or "Banco de Dados" in reply_lim, "Deve trazer status de faltas"
        print("  ✅ Cenário 5 (Consulta de Faltas) aprovado com sucesso!")

        # ----------------------------------------------------------------------
        # CENÁRIO 6: Usuário CADASTRADO Alterando Preferência de Tom (SET_TONE)
        # ----------------------------------------------------------------------
        print("\n[Cenário 6/7] 🎭 Remetente CADASTRADO alterando tom para FORMAL/NEUTRO...")
        reply_tone_formal = await dispatcher.handle_message(
            phone=registered_phone,
            message_text="Prefiro sem gírias, seja formal comigo"
        )
        print("  💬 Resposta do Bot UniGag:")
        for line in reply_tone_formal.split("\n"):
            print(f"    {line}")

        assert "formal" in reply_tone_formal.lower() or "sem gírias" in reply_tone_formal.lower() or "sem girias" in reply_tone_formal.lower(), "Deve confirmar tom formal"
        assert mock_student.get("bot_tone") == "neutral", "bot_tone deve ter sido atualizado para 'neutral'"

        # Mensagem seguinte deve estar no tom formal sem gírias
        reply_att_formal = await dispatcher.handle_message(
            phone=registered_phone,
            message_text="Tô na aula de Banco de Dados"
        )
        assert "diva" not in reply_att_formal.lower() and "mona" not in reply_att_formal.lower(), "Tom formal não deve conter gírias"
        print("  ✅ Mudança para tom formal validada com sucesso!")

        print("\n[Cenário 6/7 b] 💅 Remetente CADASTRADO retornando tom para QUEER/DESCONTRAÍDO...")
        reply_tone_queer = await dispatcher.handle_message(
            phone=registered_phone,
            message_text="Pode usar gírias agora, modo diva"
        )
        print("  💬 Resposta do Bot UniGag:")
        for line in reply_tone_queer.split("\n"):
            print(f"    {line}")

        assert "diva" in reply_tone_queer.lower() or "mona" in reply_tone_queer.lower() or "diploma" in reply_tone_queer.lower(), "Deve confirmar tom queer com energia"
        assert mock_student.get("bot_tone") == "queer", "bot_tone deve ter sido atualizado para 'queer'"
        print("  ✅ Mudança para tom queer validada com sucesso!")

        # ----------------------------------------------------------------------
        # CENÁRIO 7: Simulação de Requisição HTTP no Webhook FastAPI
        # ----------------------------------------------------------------------
        print("\n[Cenário 7/7] 🌐 Simulando Webhook HTTP da Evolution API (POST /webhook/whatsapp)...")
        evolution_payload = {
            "event": "messages.upsert",
            "instance": "unigag",
            "data": {
                "key": {
                    "remoteJid": f"{registered_phone}@s.whatsapp.net",
                    "fromMe": False,
                    "id": "MSG_SIM_100"
                },
                "pushName": "Paulo Cesar",
                "message": {
                    "conversation": "Oi"
                },
                "messageType": "conversation"
            }
        }

        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
            res_health = await client.get("/health")
            assert res_health.status_code == 200
            print(f"  ✅ Health check OK: {res_health.json()}")

            res_webhook = await client.post("/webhook/whatsapp", json=evolution_payload)
            assert res_webhook.status_code == 200
            data = res_webhook.json()
            assert data.get("status") == "queued"
            assert data.get("remoteJid") == f"{registered_phone}@s.whatsapp.net"
            print(f"  ✅ Webhook Evolution API aceito com sucesso: {data}")

    finally:
        # Restaura métodos originais
        supabase_service.get_student_by_phone = orig_get_student_by_phone
        supabase_service.get_student_subjects = orig_get_student_subjects
        supabase_service.get_student = orig_get_student
        supabase_service.update_student_tone = orig_update_student_tone

    print("\n" + "=" * 75)
    print("🎉 TODOS OS 7 CENÁRIOS DO BOT WHATSAPP ADAPTATIVO & TOM FORAM APROVADOS!")
    print("=" * 75)

if __name__ == "__main__":
    asyncio.run(run_bot_flow_tests())
