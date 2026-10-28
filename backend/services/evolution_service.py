"""
Serviço de integração com a Evolution API (WhatsApp Gateway).
Responsável pelo envio de mensagens de texto, botões e enquetes interativas.
"""

from typing import Any, Dict, List, Optional
import httpx
from config import settings

class EvolutionService:
    def __init__(self):
        self.base_url = settings.WHATSAPP_API_URL.rstrip("/")
        self.api_key = settings.WHATSAPP_API_KEY
        self.instance = settings.EVOLUTION_INSTANCE_NAME

    def _get_headers(self) -> Dict[str, str]:
        return {
            "Content-Type": "application/json",
            "apikey": self.api_key,
        }

    def _resolve_target(self, recipient: str) -> str:
        """
        Resolve o destinatário para a Evolution API v2.
        Preserva rigorosamente o JID original completo (@s.whatsapp.net, @lid, @g.us)
        sem remover caracteres ou quebrar a rota de entrega.
        Apenas para telefones crus (sem @) sanitiza caracteres de máscara.
        """
        if not recipient:
            return ""
        clean = str(recipient).strip()
        if "@" in clean:
            return clean
        return "".join(ch for ch in clean if ch.isdigit())

    async def send_text_message(
        self,
        recipient: Optional[str] = None,
        text: str = "",
        phone: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Envia mensagem de texto para um contato, LID ou grupo no WhatsApp.
        Endpoint: POST /message/sendText/{instance}
        """
        target = self._resolve_target(recipient or phone or "")
        if not target:
            return {"success": False, "error": "Destinatário vazio"}

        url = f"{self.base_url}/message/sendText/{self.instance}"
        payload = {
            "number": target,
            "text": text,
            "options": {
                "delay": 1200,
                "presence": "composing",
                "linkPreview": False,
            },
        }

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(url, json=payload, headers=self._get_headers())
                if response.status_code in (200, 201):
                    return {"success": True, "data": response.json()}
                print(f"⚠️ Evolution API retornou status {response.status_code} para '{target}': {response.text}")
                return {"success": False, "status_code": response.status_code, "error": response.text}
        except httpx.ConnectError:
            print(f"ℹ️ Evolution API offline em {self.base_url}. Mensagem mockada simulada para '{target}'.")
            return {"success": True, "mocked": True, "phone": target, "text": text}
        except Exception as e:
            print(f"❌ Erro ao enviar mensagem WhatsApp via Evolution API para '{target}': {e}")
            return {"success": False, "error": str(e)}

    async def send_text(
        self,
        recipient: Optional[str] = None,
        text: str = "",
        phone: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Envia mensagem de texto aceitando e preservando o remoteJid exato
        (contato tradicional @s.whatsapp.net, LID de privacidade @lid ou grupo @g.us).
        """
        return await self.send_text_message(recipient=recipient, text=text, phone=phone)

    async def send_poll_message(
        self,
        recipient: Optional[str] = None,
        question: str = "",
        options: Optional[List[str]] = None,
        max_selectable: int = 1,
        phone: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Envia enquete interativa com botões de resposta rápida.
        Endpoint: POST /message/sendPoll/{instance}
        """
        target = self._resolve_target(recipient or phone or "")
        if not target:
            return {"success": False, "error": "Destinatário vazio"}

        opts = options or []
        url = f"{self.base_url}/message/sendPoll/{self.instance}"
        payload = {
            "number": target,
            "name": question,
            "selectableCount": max_selectable,
            "values": opts,
        }

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(url, json=payload, headers=self._get_headers())
                if response.status_code in (200, 201):
                    return {"success": True, "data": response.json()}
                return {"success": False, "status_code": response.status_code, "error": response.text}
        except httpx.ConnectError:
            print(f"ℹ️ Evolution API offline. Enquete simulada para '{target}': '{question}' opções: {opts}")
            return {"success": True, "mocked": True, "question": question, "options": opts}
        except Exception as e:
            print(f"❌ Erro ao enviar enquete WhatsApp para '{target}': {e}")
            return {"success": False, "error": str(e)}

evolution_service = EvolutionService()
