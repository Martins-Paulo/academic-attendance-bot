#!/usr/bin/env bash

# ==============================================================================
# 🚀 UNIGAG - SCRIPT DE INICIALIZAÇÃO UNIFICADA (DEV ENVIRONMENT)
# ==============================================================================
# Inicia simultaneamente:
# 1. Backend FastAPI + Scheduler + Bot WhatsApp (Porta 8000)
# 2. Frontend Next.js 16 com Turbopack (Porta 3000)
# Trata encerramento gracioso (Ctrl+C / SIGINT) liberando portas sem zumbis.
# ==============================================================================

set -m # Habilita job control para gerenciamento de processos filhos

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

# Cores ANSI para Logs Estruturados
BOLD="\033[1m"
RESET="\033[0m"
GREEN="\033[0;32m"
CYAN="\033[0;36m"
BLUE="\033[0;34m"
YELLOW="\033[1;33m"
MAGENTA="\033[0;35m"
RED="\033[0;31m"

PREFIX_SYS="${BOLD}${YELLOW}[UNIGAG SYSTEM]${RESET}"
PREFIX_API="${BOLD}${MAGENTA}[FASTAPI :8000]${RESET}"
PREFIX_WEB="${BOLD}${CYAN}[NEXTJS  :3000]${RESET}"

echo -e "\n${BOLD}${CYAN}======================================================================${RESET}"
echo -e "${BOLD}${CYAN}       🎓 UniGag - Plataforma de Gestão Acadêmica Omnichannel         ${RESET}"
echo -e "${BOLD}${CYAN}======================================================================${RESET}\n"

# ------------------------------------------------------------------------------
# 1. VERIFICAÇÃO DE DEPENDÊNCIAS
# ------------------------------------------------------------------------------
echo -e "${PREFIX_SYS} Verificando dependências do ambiente..."

# Python e Backend Venv
PYTHON_BIN="$PROJECT_ROOT/backend/venv/bin/python3"
if [ ! -f "$PYTHON_BIN" ]; then
    echo -e "${PREFIX_SYS} ${RED}Ambiente virtual Python não encontrado em backend/venv.${RESET}"
    echo -e "${PREFIX_SYS} Criando venv e instalando requirements..."
    python3 -m venv "$PROJECT_ROOT/backend/venv"
    "$PROJECT_ROOT/backend/venv/bin/pip" install -r "$PROJECT_ROOT/backend/requirements.txt"
fi

# Node / PNPM e Frontend
if ! command -v pnpm &> /dev/null; then
    echo -e "${PREFIX_SYS} ${RED}pnpm não está instalado globalmente. Instale com 'npm i -g pnpm'.${RESET}"
    exit 1
fi

if [ ! -d "$PROJECT_ROOT/frontend/node_modules" ]; then
    echo -e "${PREFIX_SYS} Instalando dependências do front-end com pnpm..."
    (cd "$PROJECT_ROOT/frontend" && pnpm install)
fi

# Variáveis de Ambiente
if [ ! -f "$PROJECT_ROOT/backend/.env" ]; then
    echo -e "${PREFIX_SYS} ${YELLOW}Aviso: backend/.env não encontrado. Copiando do example...${RESET}"
    cp "$PROJECT_ROOT/backend/.env.example" "$PROJECT_ROOT/backend/.env" 2>/dev/null || true
fi

if [ ! -f "$PROJECT_ROOT/frontend/.env" ]; then
    echo -e "${PREFIX_SYS} ${YELLOW}Aviso: frontend/.env não encontrado. Copiando do example...${RESET}"
    cp "$PROJECT_ROOT/frontend/.env.example" "$PROJECT_ROOT/frontend/.env" 2>/dev/null || true
fi

# ------------------------------------------------------------------------------
# 2. LIMPEZA PREVENTIVA DE PORTAS
# ------------------------------------------------------------------------------
free_port() {
    local port=$1
    local pids=$(lsof -ti :"$port" 2>/dev/null)
    if [ -n "$pids" ]; then
        echo -e "${PREFIX_SYS} Liberando porta $port ocupada pelos processos: $pids"
        kill -9 $pids 2>/dev/null || true
        sleep 1
    fi
}

free_port 8000
free_port 3000

# ------------------------------------------------------------------------------
# 3. TRATAMENTO DE ENCERRAMENTO GRACIOSO (TRAP SIGINT / SIGTERM)
# ------------------------------------------------------------------------------
FASTAPI_PID=""
NEXTJS_PID=""

cleanup() {
    echo -e "\n\n${PREFIX_SYS} ${YELLOW}Recebido sinal de encerramento (Ctrl+C). Finalizando serviços...${RESET}"
    
    if [ -n "$FASTAPI_PID" ] && kill -0 "$FASTAPI_PID" 2>/dev/null; then
        echo -e "${PREFIX_SYS} Encerrando FastAPI (PID: $FASTAPI_PID)..."
        kill -TERM "$FASTAPI_PID" 2>/dev/null || true
    fi

    if [ -n "$NEXTJS_PID" ] && kill -0 "$NEXTJS_PID" 2>/dev/null; then
        echo -e "${PREFIX_SYS} Encerrando Next.js (PID: $NEXTJS_PID)..."
        kill -TERM "$NEXTJS_PID" 2>/dev/null || true
    fi

    sleep 1.5

    # Garante que portas 8000 e 3000 não fiquem presas
    free_port 8000
    free_port 3000

    echo -e "${PREFIX_SYS} ${GREEN}Todos os processos foram encerrados com segurança. Até logo! 👋${RESET}\n"
    exit 0
}

trap cleanup SIGINT SIGTERM EXIT

# ------------------------------------------------------------------------------
# 4. INICIALIZAÇÃO DOS PROCESSOS
# ------------------------------------------------------------------------------

echo -e "${PREFIX_SYS} ${GREEN}Iniciando servidores em paralelo...${RESET}\n"

# Inicia FastAPI (Backend + Scheduler + Webhook)
(
    cd "$PROJECT_ROOT/backend" && \
    PYTHONUNBUFFERED=1 "$PYTHON_BIN" webhook_server.py 2>&1 | while IFS= read -r line; do
        echo -e "${PREFIX_API} $line"
    done
) &
FASTAPI_PID=$!

# Aguarda 2 segundos para o FastAPI subir
sleep 2

# Inicia Next.js (Frontend)
(
    cd "$PROJECT_ROOT/frontend" && \
    pnpm dev 2>&1 | while IFS= read -r line; do
        echo -e "${PREFIX_WEB} $line"
    done
) &
NEXTJS_PID=$!

echo -e "${PREFIX_SYS} ${BOLD}${GREEN}Ambiente UniGag pronto para uso:${RESET}"
echo -e "${PREFIX_SYS} 🌐 Frontend Web:      ${BOLD}${CYAN}http://localhost:3000${RESET}"
echo -e "${PREFIX_SYS} 🤖 FastAPI Webhook:   ${BOLD}${MAGENTA}http://localhost:8000${RESET}"
echo -e "${PREFIX_SYS} ⏰ Scheduler Ativo:   ${BOLD}${YELLOW}Verificação contínua em background${RESET}"
echo -e "${PREFIX_SYS} Pressione ${BOLD}Ctrl+C${RESET} a qualquer momento para encerrar ambos os serviços.\n"

# Aguarda ambos os processos em background
wait $FASTAPI_PID $NEXTJS_PID
