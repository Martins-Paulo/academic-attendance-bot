"""
Servidor Webhook FastAPI para integração com a Evolution API (WhatsApp Gateway).
Recebe mensagens em tempo real, encaminha para o dispatcher de IA e responde no WhatsApp.
"""

import asyncio
import re
import traceback
from contextlib import asynccontextmanager
from typing import Any, Dict, Optional
import uvicorn
from fastapi import FastAPI, Request, BackgroundTasks, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from config import settings
from bot.dispatcher import dispatcher
from bot.scheduler import attendance_scheduler
from services.evolution_service import evolution_service

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Ciclo de vida assíncrono do FastAPI: inicia e encerra tarefas em background."""
    print("\033[1;36m[⏰ SCHEDULER]\033[0m Inicializando agendador de presença em segundo plano...")
    scheduler_task = asyncio.create_task(attendance_scheduler.run_periodic_checker(interval_seconds=60))
    try:
        yield
    finally:
        attendance_scheduler.stop()
        scheduler_task.cancel()
        try:
            await scheduler_task
        except asyncio.CancelledError:
            pass
        print("\033[1;33m[⏰ SCHEDULER]\033[0m Agendador de presença finalizado com sucesso.")

app = FastAPI(
    title="UniGag WhatsApp Bot API",
    description="Serviço de automação de presença e suporte acadêmico via WhatsApp e Gemini.",
    version="1.0.0",
    lifespan=lifespan
)

# Habilita CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def extract_message_text(data: Dict[str, Any]) -> Optional[str]:
    """
    Extrai o conteúdo textual a partir dos múltiplos formatos de payload da Evolution API:
    - Mensagem de texto simples (conversation)
    - Mensagem estendida com formatação (extendedTextMessage.text)
    - Resposta de botões ou listas
    - Resposta de enquete (pollUpdateMessage)
    """
    msg_container = data.get("message") or {}

    # 1. Texto direto simples
    if "conversation" in msg_container and msg_container["conversation"]:
        return str(msg_container["conversation"]).strip()

    # 2. Mensagem estendida
    ext_msg = msg_container.get("extendedTextMessage") or {}
    if "text" in ext_msg and ext_msg["text"]:
        return str(ext_msg["text"]).strip()

    # 3. Resposta de botão
    btn_resp = msg_container.get("buttonsResponseMessage") or {}
    if "selectedDisplayText" in btn_resp:
        return str(btn_resp["selectedDisplayText"]).strip()

    # 4. Resposta de enquete / lista
    list_resp = msg_container.get("listResponseMessage") or {}
    if "title" in list_resp:
        return str(list_resp["title"]).strip()

    return None

# Padrões para detecção de comandos ou menções explícitas ao bot em grupos (@g.us)
GROUP_TRIGGER_REGEX = re.compile(
    r"(\b@bot\b|\bbot\b|@unigag|/presenca|/presença|/falta|/faltas|/unigag|/ajuda|/grade|/entregas|/notas|/nota|/status|/start)",
    re.IGNORECASE
)

async def process_and_reply_task(reply_jid: str, sender_identifier: str, message_text: str):
    """
    Tarefa assíncrona em background para processamento sem bloquear o webhook HTTP.
    - reply_jid: destino original exato para envio da resposta (@s.whatsapp.net, @lid ou @g.us)
    - sender_identifier: identificador ou telefone do autor para localização cadastral do estudante
    - message_text: conteúdo textual da mensagem
    """
    try:
        reply = await dispatcher.handle_message(
            phone=sender_identifier,
            message_text=message_text,
            student_id=None
        )
        if reply:
            await evolution_service.send_text(recipient=reply_jid, text=reply)
    except Exception:
        print(f"❌ [BACKGROUND TASK ERROR] Falha ao processar mensagem para '{reply_jid}':\n{traceback.format_exc()}")

@app.get("/health")
async def health_check():
    """Endpoint de checagem de saúde da aplicação."""
    return {
        "status": "online",
        "app": "UniGag WhatsApp Bot Gateway",
        "instance": settings.EVOLUTION_INSTANCE_NAME,
        "frontend_url": settings.FRONTEND_URL
    }

@app.post("/webhook/whatsapp")
async def receive_whatsapp_webhook(request: Request, background_tasks: BackgroundTasks):
    """
    Endpoint principal receptor de Webhooks da Evolution API v2.
    - Preserva o remoteJid exato (@s.whatsapp.net, @lid, @g.us) para retorno de mensagem.
    - Resolve @lid utilizando campos alternativos (remoteJidAlt, participant) para identificação do aluno.
    - Permite grupos (@g.us) filtrando apenas menções ou comandos explícitos (/presenca, @bot).
    - Habilita testes no próprio chat (fromMe=True) exclusivamente quando ALLOW_SELF_TEST=True.
    """
    try:
        payload = await request.json()
    except Exception:
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content={"error": "JSON inválido"})

    data = payload.get("data") or {}

    # Se a Evolution API enviar payload direto na raiz
    if not data and "key" in payload:
        data = payload

    key_data = data.get("key") or {}

    # 1. Filtro de auto-mensagens (fromMe: true) para evitar loops, salvo em modo de teste local
    from_me = key_data.get("fromMe", False)
    if from_me and not settings.ALLOW_SELF_TEST:
        return {"status": "ignored", "reason": "sent_by_bot"}

    # 2. Captura o JID original completo para envio da resposta (mantém estritamente como destino)
    reply_jid = (key_data.get("remoteJid") or data.get("remoteJid") or "").strip()
    if not reply_jid:
        return {"status": "ignored", "reason": "empty_remote_jid"}

    # 3. Extração do remetente com prioridade para senderPn e fallbacks ordenados
    sender_raw = (
        key_data.get("senderPn")  # Prioridade para o telefone real em contas com LID
        or data.get("senderPn")
        or key_data.get("remoteJidAlt")
        or data.get("remoteJidAlt")
        or key_data.get("participant")
        or data.get("participant")
        or data.get("sender")
        or key_data.get("remoteJid", "")
        or reply_jid
    )
    if isinstance(sender_raw, str):
        sender_raw = sender_raw.strip()
    else:
        sender_raw = str(sender_raw or "").strip()

    # Extraia apenas dígitos do sender_raw
    sender_phone = re.sub(r"\D", "", sender_raw.split("@")[0])
    sender_identifier = sender_phone if sender_phone else (sender_raw or reply_jid)

    # 4. Extrai o conteúdo textual da mensagem
    text = extract_message_text(data)
    if not text:
        return {"status": "ignored", "reason": "empty_or_unsupported_message_type"}

    # 5. Tratamento de mensagens em grupos (@g.us)
    is_group = "@g.us" in reply_jid
    if is_group:
        context_info = (data.get("message") or {}).get("extendedTextMessage", {}).get("contextInfo") or {}
        mentioned_jids = context_info.get("mentionedJid") or []
        has_mention_or_command = bool(
            GROUP_TRIGGER_REGEX.search(text) or mentioned_jids
        )
        if not has_mention_or_command:
            return {"status": "ignored", "reason": "group_message_without_mention"}

    # 6. Log Informativo
    print(
        f"[WHATSAPP WEBHOOK] Mensagem recebida [Destino: {reply_jid} | Telefone: {sender_phone}]: '{text}'"
    )

    # 7. Enfileira o processamento em background sem bloquear o retorno HTTP da Evolution API
    background_tasks.add_task(
        process_and_reply_task,
        reply_jid=reply_jid,
        sender_identifier=sender_identifier,
        message_text=text
    )

    return {
        "status": "queued",
        "remoteJid": reply_jid,
        "sender": sender_raw or reply_jid,
        "phone": sender_phone or sender_identifier
    }

class TriggerRemindersPayload(BaseModel):
    phone: str
    student_id: Optional[int] = None

@app.post("/api/reminders/trigger")
async def trigger_reminders(payload: TriggerRemindersPayload):
    """Endpoint administrativo para disparar enquetes de chamada de aula."""
    sent = await attendance_scheduler.trigger_daily_reminders_for_student(
        phone=payload.phone,
        student_id=payload.student_id
    )
    return {"status": "success", "polls_sent": sent, "phone": payload.phone}

if __name__ == "__main__":
    uvicorn.run("webhook_server:app", host=settings.HOST, port=settings.PORT, reload=True)
