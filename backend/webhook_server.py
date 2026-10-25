"""
Servidor Webhook FastAPI para integração com a Evolution API (WhatsApp Gateway).
Recebe mensagens em tempo real, encaminha para o dispatcher de IA e responde no WhatsApp.
"""

import asyncio
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

async def process_and_reply_task(phone: str, message_text: str):
    """Tarefa assíncrona em background para processamento sem bloquear o webhook."""
    try:
        reply = await dispatcher.handle_message(
            phone=phone,
            message_text=message_text,
            student_id=settings.DEFAULT_STUDENT_ID
        )
        if reply:
            await evolution_service.send_text_message(phone=phone, text=reply)
    except Exception as e:
        print(f"❌ Erro ao processar mensagem em background: {e}")

@app.get("/health")
async def health_check():
    """Endpoint de checagem de saúde da aplicação."""
    return {
        "status": "online",
        "app": "UniGag WhatsApp Bot Gateway",
        "instance": settings.EVOLUTION_INSTANCE_NAME,
        "default_student_id": settings.DEFAULT_STUDENT_ID
    }

@app.post("/webhook/whatsapp")
async def receive_whatsapp_webhook(request: Request, background_tasks: BackgroundTasks):
    """
    Endpoint principal receptor de Webhooks da Evolution API.
    Processa mensagens de alunos no WhatsApp de forma não bloqueante.
    """
    try:
        payload = await request.json()
    except Exception:
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content={"error": "JSON inválido"})

    # Valida o evento (ex: 'messages.upsert')
    event_type = payload.get("event")
    data = payload.get("data") or {}

    # Se a Evolution API enviar payload direto na raiz
    if not data and "key" in payload:
        data = payload

    key = data.get("key") or {}

    # Ignora mensagens enviadas pelo próprio bot para evitar loop infinito
    if key.get("fromMe", False):
        return {"status": "ignored", "reason": "sent_by_bot"}

    # Extrai o número do remetente
    remote_jid = key.get("remoteJid", "")
    if not remote_jid or "@g.us" in remote_jid:  # Ignora grupos caso não seja chat privado
        return {"status": "ignored", "reason": "group_or_empty_sender"}

    phone = remote_jid.split("@")[0]

    # Extrai o texto da mensagem
    text = extract_message_text(data)
    if not text:
        return {"status": "ignored", "reason": "empty_or_unsupported_message_type"}

    print(f"\033[1;32m[WHATSAPP WEBHOOK]\033[0m 📩 Mensagem recebida de [\033[1;37m{phone}\033[0m]: '{text}'")

    # Enfileira o processamento em background para responder imediatamente HTTP 200 à Evolution API
    background_tasks.add_task(process_and_reply_task, phone, text)

    return {"status": "queued", "phone": phone}

class TriggerRemindersPayload(BaseModel):
    phone: str
    student_id: Optional[int] = settings.DEFAULT_STUDENT_ID

@app.post("/api/reminders/trigger")
async def trigger_reminders(payload: TriggerRemindersPayload):
    """Endpoint administrativo para disparar enquetes de chamada de aula."""
    sent = await attendance_scheduler.trigger_daily_reminders_for_student(
        phone=payload.phone,
        student_id=payload.student_id or settings.DEFAULT_STUDENT_ID
    )
    return {"status": "success", "polls_sent": sent, "phone": payload.phone}

if __name__ == "__main__":
    uvicorn.run("webhook_server:app", host=settings.HOST, port=settings.PORT, reload=True)
