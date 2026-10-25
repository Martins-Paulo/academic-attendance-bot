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

    def _sanitize_phone(self, phone: str) -> str:
        """Limpa e formata o número do telefone."""
        digits = "".join(ch for ch in phone if ch.isdigit())
        return digits

    async def send_text_message(self, phone: str, text: str) -> Dict[str, Any]:
        """
        Envia mensagem de texto simples para um contato no WhatsApp.
        Endpoint: POST /message/sendText/{instance}
        """
        clean_phone = self._sanitize_phone(phone)
        url = f"{self.base_url}/message/sendText/{self.instance}"
        payload = {
            "number": clean_phone,
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
                print(f"⚠️ Evolution API retornou status {response.status_code}: {response.text}")
                return {"success": False, "status_code": response.status_code, "error": response.text}
        except httpx.ConnectError:
            print(f"ℹ️ Evolution API offline em {self.base_url}. Mensagem mockada simulada com sucesso.")
            return {"success": True, "mocked": True, "phone": clean_phone, "text": text}
        except Exception as e:
            print(f"❌ Erro ao enviar mensagem WhatsApp via Evolution API: {e}")
            return {"success": False, "error": str(e)}

    async def send_poll_message(
        self,
        phone: str,
        question: str,
        options: List[str],
        max_selectable: int = 1
    ) -> Dict[str, Any]:
        """
        Envia enquete interativa com botões de resposta rápida.
        Endpoint: POST /message/sendPoll/{instance}
        """
        clean_phone = self._sanitize_phone(phone)
        url = f"{self.base_url}/message/sendPoll/{self.instance}"
        payload = {
            "number": clean_phone,
            "name": question,
            "selectableCount": max_selectable,
            "values": options,
        }

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(url, json=payload, headers=self._get_headers())
                if response.status_code in (200, 201):
                    return {"success": True, "data": response.json()}
                return {"success": False, "status_code": response.status_code, "error": response.text}
        except httpx.ConnectError:
            print(f"ℹ️ Evolution API offline. Enquete simulada: '{question}' opções: {options}")
            return {"success": True, "mocked": True, "question": question, "options": options}
        except Exception as e:
            print(f"❌ Erro ao enviar enquete WhatsApp: {e}")
            return {"success": False, "error": str(e)}

evolution_service = EvolutionService()
