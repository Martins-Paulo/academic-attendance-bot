# 🤖 UniGag - Backend Service

Este diretório contém a camada de serviços em Python do **UniGag**:
* **FastAPI Webhook Server** (`webhook_server.py`)
* **Agendador de Presença em Background** (`bot/scheduler.py`)
* **Roteador e Agente de IA Conversacional** (`bot/dispatcher.py` e `services/gemini_service.py`)
* **Camada de Banco de Dados Supabase** (`services/supabase_service.py`)
* **Gateway WhatsApp Evolution API** (`services/evolution_service.py`)
* **Scripts de Teste Automatizado** (`test_lifecycle_e2e.py` e `test_bot_flow.py`)

Para a documentação completa, instruções de instalação e execução unificada com `./run_dev.sh`, consulte o arquivo principal:
👉 **[README.md](../../README.md) na raiz do repositório**.