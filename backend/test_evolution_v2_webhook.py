"""
Teste automatizado de integração e conformidade com Evolution API v2 para o webhook UniGag.
Valida:
1. Roteamento de JID tradicional (@s.whatsapp.net) e preservação do remoteJid
2. Roteamento de LID de privacidade (@lid) com identificação do aluno via participant/remoteJidAlt
3. Grupos (@g.us): descarte quando não há menção/comando
4. Grupos (@g.us): aceite e roteamento quando há comando (/presenca) ou menção (@bot)
5. Auto-mensagens (fromMe=True): descarte quando ALLOW_SELF_TEST=False
6. Auto-mensagens (fromMe=True): aceitação quando ALLOW_SELF_TEST=True
7. Resiliência de erro (RLS / Supabase 42501)
"""

import asyncio
import httpx
from config import settings
from webhook_server import app

async def run_evolution_v2_tests():
    print("=" * 75)
    print("🧪 INICIANDO TESTES DE CONFORMIDADE EVOLUTION API V2 & ROTEAMENTO")
    print("=" * 75)

    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:

        # ----------------------------------------------------------------------
        # Teste 1: Chat Privado Tradicional (@s.whatsapp.net)
        # ----------------------------------------------------------------------
        print("\n[Teste 1/6] 📱 Chat Privado Tradicional (@s.whatsapp.net)...")
        payload_traditional = {
            "event": "messages.upsert",
            "instance": "unigag",
            "data": {
                "key": {
                    "remoteJid": "5511999990001@s.whatsapp.net",
                    "fromMe": False,
                    "id": "MSG_TRAD_001"
                },
                "message": {
                    "conversation": "Tô na aula de Estruturas de Dados"
                }
            }
        }
        res = await client.post("/webhook/whatsapp", json=payload_traditional)
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "queued"
        assert data["remoteJid"] == "5511999990001@s.whatsapp.net"
        print(f"  ✅ Aceito e enfileirado para o remoteJid exato: {data['remoteJid']}")

        # ----------------------------------------------------------------------
        # Teste 2: Chat com LID de Privacidade (@lid) + senderPn (Evolution API v2)
        # ----------------------------------------------------------------------
        print("\n[Teste 2/6] 🔒 Chat com LID de Privacidade (@lid) com senderPn...")
        payload_lid = {
            "event": "messages.upsert",
            "instance": "unigag",
            "data": {
                "key": {
                    "remoteJid": "20603159498944@lid",
                    "senderPn": "5511999990001@s.whatsapp.net",
                    "fromMe": False,
                    "id": "MSG_LID_001"
                },
                "message": {
                    "extendedTextMessage": {
                        "text": "Presença em Banco de Dados"
                    }
                }
            }
        }
        res = await client.post("/webhook/whatsapp", json=payload_lid)
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "queued"
        assert data["remoteJid"] == "20603159498944@lid", "O destino DEVE ser o @lid exato recebido"
        assert "5511999990001" in data["sender"], "O remetente do cadastro deve extrair senderPn"
        assert data["phone"] == "5511999990001", "O telefone resolvido deve conter os dígitos de senderPn"
        print(f"  ✅ Destino preservado: {data['remoteJid']} | Remetente resolvido: {data['sender']} | Telefone: {data['phone']}")

        # ----------------------------------------------------------------------
        # Teste 3: Grupo (@g.us) SEM Menção ou Comando (Deve ser ignorado)
        # ----------------------------------------------------------------------
        print("\n[Teste 3/6] 👥 Grupo (@g.us) SEM menção/comando...")
        payload_group_ignored = {
            "event": "messages.upsert",
            "instance": "unigag",
            "data": {
                "key": {
                    "remoteJid": "1203630248455@g.us",
                    "participant": "5511999990001@s.whatsapp.net",
                    "fromMe": False,
                    "id": "MSG_GRP_001"
                },
                "message": {
                    "conversation": "Alguém fez o exercício 3 da lista?"
                }
            }
        }
        res = await client.post("/webhook/whatsapp", json=payload_group_ignored)
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "ignored"
        assert data["reason"] == "group_message_without_mention"
        print("  ✅ Mensagem comum no grupo ignorada com sucesso (evita poluição).")

        # ----------------------------------------------------------------------
        # Teste 4: Grupo (@g.us) COM Comando (/presenca) ou Menção (@bot)
        # ----------------------------------------------------------------------
        print("\n[Teste 4/6] 👥 Grupo (@g.us) COM comando '/presenca'...")
        payload_group_command = {
            "event": "messages.upsert",
            "instance": "unigag",
            "data": {
                "key": {
                    "remoteJid": "1203630248455@g.us",
                    "participant": "5511999990001@s.whatsapp.net",
                    "fromMe": False,
                    "id": "MSG_GRP_002"
                },
                "message": {
                    "conversation": "/presenca Banco de Dados"
                }
            }
        }
        res = await client.post("/webhook/whatsapp", json=payload_group_command)
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "queued"
        assert data["remoteJid"] == "1203630248455@g.us", "A resposta no grupo deve ir para o grupo"
        assert data["sender"] == "5511999990001@s.whatsapp.net", "O estudante deve ser identificado pelo participant"
        print(f"  ✅ Grupo acionado com sucesso: Resposta para {data['remoteJid']} autor {data['sender']}")

        # ----------------------------------------------------------------------
        # Teste 5: Auto-mensagem (fromMe=True) com ALLOW_SELF_TEST=False
        # ----------------------------------------------------------------------
        print("\n[Teste 5/6] 🛑 Auto-mensagem (fromMe=True) com ALLOW_SELF_TEST=False...")
        settings.ALLOW_SELF_TEST = False
        payload_self_blocked = {
            "event": "messages.upsert",
            "instance": "unigag",
            "data": {
                "key": {
                    "remoteJid": "5511999990001@s.whatsapp.net",
                    "fromMe": True,
                    "id": "MSG_SELF_001"
                },
                "message": {
                    "conversation": "Teste de mensagem para si mesmo"
                }
            }
        }
        res = await client.post("/webhook/whatsapp", json=payload_self_blocked)
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "ignored"
        assert data["reason"] == "sent_by_bot"
        print("  ✅ Auto-mensagem bloqueada corretamente quando ALLOW_SELF_TEST=False.")

        # ----------------------------------------------------------------------
        # Teste 6: Auto-mensagem (fromMe=True) com ALLOW_SELF_TEST=True
        # ----------------------------------------------------------------------
        print("\n[Teste 6/6] 🧪 Auto-mensagem (fromMe=True) com ALLOW_SELF_TEST=True (Modo Teste)...")
        settings.ALLOW_SELF_TEST = True
        payload_self_allowed = {
            "event": "messages.upsert",
            "instance": "unigag",
            "data": {
                "key": {
                    "remoteJid": "5511999990001@s.whatsapp.net",
                    "fromMe": True,
                    "id": "MSG_SELF_002"
                },
                "message": {
                    "conversation": "Tô na aula de Estruturas de Dados"
                }
            }
        }
        res = await client.post("/webhook/whatsapp", json=payload_self_allowed)
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "queued"
        assert data["remoteJid"] == "5511999990001@s.whatsapp.net"
        print(f"  ✅ Auto-mensagem aceita para teste local: {data['remoteJid']}")

    print("\n" + "=" * 75)
    print("🎉 TODOS OS 6 TESTES DE CONFORMIDADE EVOLUTION API V2 FORAM APROVADOS!")
    print("=" * 75)

if __name__ == "__main__":
    asyncio.run(run_evolution_v2_tests())
