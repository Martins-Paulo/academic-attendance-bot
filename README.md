# 🎓 UniGag — Gestor Acadêmico Inteligente & Bot Omnichannel WhatsApp

> **Plataforma completa de controle de frequência, notas, faltas e entregas para universitários, combinando um Dashboard Web reativo de alta performance (Next.js 16) com um Agente de IA Conversacional no WhatsApp (FastAPI + Google Gemini + Evolution API) integrado ao Supabase PostgreSQL.**

---

## 🏛️ Arquitetura do Sistema

```
                         +-----------------------------------+
                         |      Estudante (WhatsApp)         |
                         +-----------------+-----------------+
                                           |
                                           v
                         +-----------------+-----------------+
                         |    Evolution API (WhatsApp)       |
                         +-----------------+-----------------+
                                           |
                                  (Webhooks HTTP)
                                           |
                                           v
+-----------------------------------------------------------------------------------+
| Backend Python (FastAPI na porta 8000)                                            |
|                                                                                   |
|  +----------------------------+             +----------------------------------+  |
|  |    Agente IA (Gemini)      |             |    Scheduler & Attendance Engine |  |
|  | - Classificação de intenção|             | - Checagem proativa de horários  |  |
|  | - Parser de gírias acadêm. |             | - Envio de enquetes de presença  |  |
|  +--------------+-------------+             +-----------------+----------------+  |
+-----------------|---------------------------------------------|-------------------+
                  |                                             |
                  +---------------------+-----------------------+
                                        | (Persistência / Consultas)
                                        v
                         +--------------+--------------------+
                         |   Supabase PostgreSQL Database    |
                         |  (subjects, attendances, evals)   |
                         +--------------+--------------------+
                                        ^
                                        | (Sincronização em tempo real via WebSockets)
                                        |
                         +--------------+--------------------+
                         |   Painel Web (UniGag Next.js 16)  |
                         |  - Dashboard e Calculadoras       |
                         |  - Avatares Reativos de Humor     |
                         |  - Gestão Otimista de Entregas    |
                         |  (Porta 3000 - Turbopack)         |
                         +-----------------------------------+
```

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia | Detalhes |
| :--- | :--- | :--- |
| **Frontend Web** | Next.js 16 (App Router) + React 19 | Turbopack, SSR/CSR híbrido, estado reativo sem recarregar (Zero F5). |
| **Linguagem Frontend** | TypeScript 5.7 + Zod 4 | Tipagem estrita de contratos, schemas de validação para todos os modais. |
| **Backend API** | FastAPI + Uvicorn (Python 3.10+) | API assíncrona com lifespan para agendador em background. |
| **Banco de Dados** | Supabase (PostgreSQL 15+) | Row Level Security (RLS), CHECK constraints e canais Realtime WebSockets. |
| **Gateway WhatsApp** | Evolution API (Baileys) | Gateway REST para envio/recebimento de mensagens, botões e enquetes. |
| **Orquestração de IA** | Google Gemini 1.5 Flash (`google-genai`) | Structured Outputs para classificação de intenções e fallback heurístico. |

---

## 📁 Estrutura do Repositório

```text
academic-attendance-bot/
├── run_dev.sh                     # 🚀 Script de inicialização unificada (FastAPI + Next.js)
├── .gitignore                     # 🛡️ Blindagem global de segredos e credenciais
├── backend/
│   ├── .env.example               # Modelo seguro de variáveis do backend
│   ├── config.py                  # Configurações globais via Pydantic Settings
│   ├── webhook_server.py          # Servidor HTTP FastAPI (porta 8000)
│   ├── bot/
│   │   ├── dispatcher.py          # Roteador de intenções e respostas do bot
│   │   └── scheduler.py           # Agendador de lembretes e enquetes de aula
│   ├── services/
│   │   ├── supabase_service.py    # Camada de banco de dados (regras e queries)
│   │   ├── evolution_service.py   # Gateway HTTP da Evolution API
│   │   └── gemini_service.py      # IA conversacional (Gemini + Regex fallback)
│   ├── migrations/
│   │   └── 01_security_hardening_rls.sql # DDL, CHECK constraints e RLS
│   ├── test_lifecycle_e2e.py      # Teste automatizado de ciclo de vida e matemática
│   ├── test_bot_flow.py           # Teste automatizado do fluxo do bot WhatsApp
│   └── requirements.txt           # Dependências Python instaladas
└── frontend/
    ├── .env.example               # Modelo seguro de variáveis do frontend
    ├── package.json               # Dependências do Next.js
    └── src/
        ├── app/(frontend)/        # Dashboard principal e estilos
        ├── components/modals/     # Modais modulares (Course, Attendance, Criteria, etc.)
        ├── hooks/                 # Hook unificado useModalState
        ├── lib/                   # Cliente Supabase tipado
        └── types/                 # Interfaces TypeScript e payloads de modais
```

---

## 📋 Pré-requisitos de Sistema

Antes de iniciar, certifique-se de possuir instalado em sua máquina:
* **Node.js** `>= 20.9.0`
* **pnpm** `>= 9.0.0` (`npm install -g pnpm`)
* **Python** `>= 3.10`
* **Conta/Projeto no Supabase** (gratuito em [supabase.com](https://supabase.com))

---

## 🚀 Passo a Passo de Instalação e Execução

### 1. Configurar Variáveis de Ambiente

Copie os modelos de variáveis de ambiente tanto no `backend/` quanto no `frontend/`:

```bash
# Na raiz do projeto:
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Preencha os arquivos `.env` com suas credenciais:
* **`backend/.env`**: configure `SUPABASE_URL`, `SUPABASE_KEY` e opcionalmente `GEMINI_API_KEY`.
* **`frontend/.env`**: configure `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

---

### 2. Executar a Migração de Banco de Dados no Supabase

1. Acesse o painel do seu projeto no [Supabase Dashboard](https://supabase.com/dashboard).
2. Abra a aba **SQL Editor**.
3. Abra o arquivo [`backend/migrations/01_security_hardening_rls.sql`](backend/migrations/01_security_hardening_rls.sql), copie todo o seu conteúdo e cole no SQL Editor.
4. Clique em **Run**.
5. O script criará as tabelas, índices de integridade, CHECK constraints (`attendances.status`, notas de 0 a 10) e ativará as políticas de **Row Level Security (RLS)**.

---

### 3. Iniciar Todo o Ecossistema com Comando Único

Graças ao script [`run_dev.sh`](run_dev.sh), o front-end e o backend sobem de forma coordenada e sincronizada:

```bash
./run_dev.sh
```

O script cuidará de:
* Verificar dependências e criar o ambiente virtual Python se necessário.
* Liberar portas preventivamente caso estejam ocupadas.
* Iniciar o **FastAPI** (`http://localhost:8000`) com o **Scheduler ativo em segundo plano**.
* Iniciar o **Next.js 16** (`http://localhost:3000`) com Turbopack.
* Exibir logs coloridos e organizados por serviço.
* **Encerramento gracioso:** Pressione `Ctrl+C` a qualquer momento para derrubar ambos os serviços sem deixar portas presas.

---

## 📱 Integração com WhatsApp (Evolution API & ngrok)

Para testar o bot em um smartphone físico via WhatsApp:

### 1. Iniciar a Evolution API (via Docker)
Caso ainda não tenha a Evolution API rodando:
```bash
docker run -d --name evolution-api -p 8080:8080 \
  -e AUTHENTICATION_API_KEY="sua-chave-api-evolution" \
  atendai/evolution-api:latest
```

### 2. Criar Instância e Conectar WhatsApp
Acesse `http://localhost:8080` ou faça a chamada HTTP para criar a instância `unigag` e escanear o QR Code no seu aplicativo do WhatsApp.

### 3. Expor o Webhook Local com ngrok
Em outro terminal, crie um túnel HTTP para a porta do FastAPI:
```bash
ngrok http 8000
```
Copie a URL HTTPS gerada (ex.: `https://abc1234.ngrok-free.app`).

### 4. Configurar o Webhook na Evolution API
Cadastre o webhook para a sua instância apontando para:
* **URL:** `https://<seu-subdominio>.ngrok-free.app/webhook/whatsapp`
* **Eventos habilitados:** `MESSAGES_UPSERT` e `POLL_RESPONSE_UPSERT`

Agora envie uma mensagem para o bot como:
* *"Tô na aula de Estruturas de Dados"*
* *"Quantas faltas ainda posso ter em ED?"*
* *"Quais são minhas próximas entregas?"*

O bot responderá imediatamente e o seu painel web em `http://localhost:3000` atualizará a contagem de faltas e o avatar em tempo real via WebSockets!

---

## 🧪 Bateria de Testes Automatizados

O UniGag possui suítes automatizadas de testes independentes:

### 1. Teste de Ciclo de Vida e Regras Matemáticas (E2E)
Testa o ciclo acadêmico completo contra a API do Supabase (criação de matéria, 7 presenças, 3 faltas, rejeição de status inválido por CHECK constraint, cálculo da média ponderada proporcional $7.75$ e margem de faltas):
```bash
backend/venv/bin/python3 backend/test_lifecycle_e2e.py
```

### 2. Teste do Fluxo do Bot e Webhook
Testa a interpretação de linguagem natural, registro de faltas, detecção de estado crítico, consulta de eventos e endpoint HTTP do webhook:
```bash
backend/venv/bin/python3 backend/test_bot_flow.py
```

### 3. Validação de Tipagem Estrita (TypeScript)
Garante 0 erros no front-end em tempo de compilação:
```bash
cd frontend && pnpm exec tsc --noEmit
```

---

## 🔒 Hardening de Segurança & Proteção de Segredos

O projeto segue padrões de segurança DevOps (GitGuardian Compliant):
* **Zero Segredos Versionados:** Todas as chaves e tokens residem exclusivamente em arquivos `.env` locais, blindados por arquivos `.gitignore` na raiz, no `backend/` e no `frontend/`.
* **Row Level Security (RLS):** As tabelas do banco contam com políticas de isolamento por estudante com `auth.uid()`.
* **CHECK Constraints:** Validação de enums no PostgreSQL impedindo estados inconsistentes ou dados malformados.
