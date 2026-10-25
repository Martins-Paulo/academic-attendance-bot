"""
Script de Teste e Simulação Local do Bot WhatsApp UniGag.
Valida o fluxo ponta a ponta sem requerer o WhatsApp conectado:
Payload mockado -> Parser de IA / Regex -> Inserção em attendances -> Geração da Resposta Formatada.
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
from webhook_server import app, extract_message_text
import httpx

async def run_bot_flow_tests():
    print("=" * 75)
    print("🤖 INICIANDO SIMULAÇÃO DE FLUXO DO BOT WHATSAPP UNIGAG")
    print("=" * 75)

    test_phone = "5511999998888"
    student_id = 1
    inserted_attendance_ids = []

    try:
        # ----------------------------------------------------------------------
        # CENÁRIO 1: Registro de Presença em Linguagem Natural
        # ----------------------------------------------------------------------
        msg_1 = "Tive aula de Estruturas de Dados hoje e compareci"
        print(f"\n[Cenário 1/5] 📩 Mensagem recebida: \"{msg_1}\"")
        
        reply_1 = await dispatcher.handle_message(
            phone=test_phone,
            message_text=msg_1,
            student_id=student_id
        )
        print("  💬 Resposta do Bot UniGag:")
        for line in reply_1.split("\n"):
            print(f"    {line}")

        assert "Presença confirmada" in reply_1, "Falha ao confirmar presença"
        assert "Estruturas de Dados" in reply_1, "Disciplina incorreta na confirmação"
        print("  ✅ Cenário 1 aprovado com sucesso!")

        # ----------------------------------------------------------------------
        # CENÁRIO 2: Registro de Falta com Verificação de Limites
        # ----------------------------------------------------------------------
        msg_2 = "Faltei na aula de Estruturas de Dados hoje porque perdi o ônibus"
        print(f"\n[Cenário 2/5] 📩 Mensagem recebida: \"{msg_2}\"")

        reply_2 = await dispatcher.handle_message(
            phone=test_phone,
            message_text=msg_2,
            student_id=student_id
        )
        print("  💬 Resposta do Bot UniGag:")
        for line in reply_2.split("\n"):
            print(f"    {line}")

        assert "Falta registrada" in reply_2, "Falha ao registrar falta"
        assert "Estruturas de Dados" in reply_2, "Disciplina incorreta no registro de falta"
        print("  ✅ Cenário 2 aprovado com sucesso!")

        # ----------------------------------------------------------------------
        # CENÁRIO 3: Consulta de Margem e Limite de Faltas
        # ----------------------------------------------------------------------
        msg_3 = "Quantas faltas ainda posso ter em ED?"
        print(f"\n[Cenário 3/5] 📩 Mensagem recebida: \"{msg_3}\"")

        reply_3 = await dispatcher.handle_message(
            phone=test_phone,
            message_text=msg_3,
            student_id=student_id
        )
        print("  💬 Resposta do Bot UniGag:")
        for line in reply_3.split("\n"):
            print(f"    {line}")

        assert "Status de Frequência" in reply_3 or "faltas" in reply_3, "Falha na consulta de faltas"
        print("  ✅ Cenário 3 aprovado com sucesso!")

        # ----------------------------------------------------------------------
        # CENÁRIO 4: Consulta de Próximas Entregas e Provas
        # ----------------------------------------------------------------------
        msg_4 = "Quais são minhas próximas entregas da semana?"
        print(f"\n[Cenário 4/5] 📩 Mensagem recebida: \"{msg_4}\"")

        reply_4 = await dispatcher.handle_message(
            phone=test_phone,
            message_text=msg_4,
            student_id=student_id
        )
        print("  💬 Resposta do Bot UniGag:")
        for line in reply_4.split("\n"):
            print(f"    {line}")

        assert "Entregas" in reply_4 or "não possui" in reply_4, "Falha na consulta de entregas"
        print("  ✅ Cenário 4 aprovado com sucesso!")

        # ----------------------------------------------------------------------
        # CENÁRIO 5: Simulação de Requisição HTTP no Webhook FastAPI
        # ----------------------------------------------------------------------
        print("\n[Cenário 5/5] 🌐 Simulando Webhook HTTP da Evolution API (POST /webhook/whatsapp)...")
        evolution_payload = {
            "event": "messages.upsert",
            "instance": "unigag",
            "data": {
                "key": {
                    "remoteJid": f"{test_phone}@s.whatsapp.net",
                    "fromMe": False,
                    "id": "MSG_SIMULATED_001"
                },
                "pushName": "Estudante UniGag",
                "message": {
                    "conversation": "Tô na aula de Estruturas de Dados"
                },
                "messageType": "conversation"
            }
        }

        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
            # 1. Health check
            res_health = await client.get("/health")
            assert res_health.status_code == 200, f"Health check falhou: {res_health.status_code}"
            print(f"  ✅ Health check OK: {res_health.json()}")

            # 2. Webhook post
            res_webhook = await client.post("/webhook/whatsapp", json=evolution_payload)
            assert res_webhook.status_code == 200, f"Webhook falhou: {res_webhook.status_code}"
            webhook_data = res_webhook.json()
            assert webhook_data.get("status") == "queued", "Status de enfileiramento incorreto"
            print(f"  ✅ Webhook Evolution API aceito com sucesso: {webhook_data}")

    except Exception as e:
        print(f"\n❌ ERRO NA SIMULAÇÃO DO BOT: {e}")
        import traceback
        traceback.print_exc()
        raise e

    finally:
        # ----------------------------------------------------------------------
        # LIMPEZA DOS REGISTROS DE TESTE
        # ----------------------------------------------------------------------
        print("\n🧹 Executando limpeza dos registros temporários gerados na simulação...")
        try:
            # Busca matéria Estruturas de Dados
            sub = supabase_service.find_subject_by_query("estruturas de dados", student_id)
            if sub:
                # Remove presenças criadas hoje para o aluno no teste
                today_str = supabase_service.date.today().isoformat()
                supabase_service.supabase.table("attendances") \
                    .delete() \
                    .eq("subject_id", sub["id"]) \
                    .eq("student_id", student_id) \
                    .eq("date", today_str) \
                    .execute()
                print("  ✅ Registros temporários de hoje limpos com sucesso.")
        except Exception as clean_err:
            print(f"  ⚠️ Aviso na limpeza: {clean_err}")

    print("\n" + "=" * 75)
    print("🎉 TODAS AS SIMULAÇÕES DO BOT WHATSAPP FORAM CONCLUÍDAS COM SUCESSO!")
    print("=" * 75)

if __name__ == "__main__":
    asyncio.run(run_bot_flow_tests())
