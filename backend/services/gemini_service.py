"""
Serviço de Inteligência Artificial Conversacional utilizando Google Gemini.
Responsável pela interpretação em linguagem natural das mensagens recebidas pelo WhatsApp.
"""

import json
import re
from typing import List, Literal, Optional
from pydantic import BaseModel, Field
from config import settings

class ParsedStudentIntent(BaseModel):
    """Schema estruturado para a intenção do estudante."""
    intent: Literal[
        "REGISTER_ATTENDANCE",
        "CHECK_LIMITS",
        "CHECK_SCHEDULE",
        "CHECK_EVENTS",
        "GENERAL_QUERY",
        "UNKNOWN"
    ] = Field(description="Tipo de intenção principal detectada na mensagem do estudante.")
    subject_name: Optional[str] = Field(
        default=None,
        description="Nome aproximado, código ou sigla da matéria citada (ex: Banco de Dados, Cálculo, ED, BD)."
    )
    status: Optional[Literal["present", "absence", "cancelled", "justified"]] = Field(
        default=None,
        description="Status de frequência pretendido se for registro de presença ou falta."
    )
    confidence: float = Field(
        default=1.0,
        description="Grau de confiança na interpretação da intenção (0.0 a 1.0)."
    )
    explanation: Optional[str] = Field(
        default=None,
        description="Breve explicação do raciocínio ou mensagem amigável de retorno."
    )

class GeminiService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.client = None

        if self.api_key and self.api_key.strip():
            try:
                from google import genai
                self.client = genai.Client(api_key=self.api_key)
            except Exception as e:
                print(f"⚠️ Erro ao inicializar Google GenAI Client: {e}")

    def _parse_heuristic(
        self,
        message: str,
        available_subjects: List[str]
    ) -> ParsedStudentIntent:
        """
        Parser heurístico determinístico com Regex de alta precisão.
        Atua como fallback caso a chave do Gemini não esteja configurada ou haja instabilidade de rede.
        """
        import unicodedata

        def norm(t: str) -> str:
            t_low = t.lower().strip()
            return "".join(
                c for c in unicodedata.normalize("NFD", t_low) if unicodedata.category(c) != "Mn"
            )

        text = norm(message)

        # 1. Identificar disciplina mais provável no texto
        detected_subject = None
        for sub_name in available_subjects:
            clean_sub = norm(sub_name)
            if clean_sub in text or text in clean_sub:
                detected_subject = sub_name
                break

        # Siglas comuns
        if not detected_subject:
            if re.search(r"\b(ed|estrutura|dados)\b", text):
                detected_subject = "Estruturas de Dados"
            elif re.search(r"\b(bd|banco|dados)\b", text):
                detected_subject = "Banco de Dados"
            elif re.search(r"\b(ia|inteligencia)\b", text):
                detected_subject = "Inteligência Artificial"
            elif re.search(r"\b(calc|calculo)\b", text):
                detected_subject = "Cálculo"

        # 2. Verificar intenções de consulta de faltas/limites
        if any(term in text for term in ["quantas faltas", "limite", "posso faltar", "saldo de falta", "estou no limite", "faltas restantes"]):
            return ParsedStudentIntent(
                intent="CHECK_LIMITS",
                subject_name=detected_subject,
                confidence=0.95,
                explanation="Consulta de limite e margem de faltas solicitada."
            )

        # 3. Verificar intenções de eventos/entregas
        if any(term in text for term in ["proxima entrega", "proximas entregas", "entregas", "trabalho", "prova", "seminario", "provas"]):
            return ParsedStudentIntent(
                intent="CHECK_EVENTS",
                subject_name=detected_subject,
                confidence=0.95,
                explanation="Consulta de entregas e eventos pendentes."
            )

        # 4. Verificar intenções de agenda/horários
        if any(term in text for term in ["que aula tenho", "aulas de hoje", "horario", "grade de hoje"]):
            return ParsedStudentIntent(
                intent="CHECK_SCHEDULE",
                confidence=0.90,
                explanation="Consulta de horários e grade acadêmica."
            )

        # 5. Registro de Falta (verificar antes de presença para evitar falso positivo em 'não fui')
        absence_keywords = [
            "faltei", "falta", "nao fui", "perdi a aula", "dormi", "matei aula",
            "nao assisti", "lanca falta", "marca falta", "perdi a chamada"
        ]
        if any(term in text for term in absence_keywords):
            return ParsedStudentIntent(
                intent="REGISTER_ATTENDANCE",
                subject_name=detected_subject,
                status="absence",
                confidence=0.98,
                explanation="Registro de ausência/falta em aula."
            )

        # 6. Cancelamento de Aula
        cancelled_keywords = ["aula cancelada", "nao teve aula", "professor faltou", "cancelou", "aula suspensa"]
        if any(term in text for term in cancelled_keywords):
            return ParsedStudentIntent(
                intent="REGISTER_ATTENDANCE",
                subject_name=detected_subject,
                status="cancelled",
                confidence=0.95,
                explanation="Registro de aula cancelada."
            )

        # 7. Registro de Presença
        present_keywords = [
            "compareci", "estive presente", "presenca", "presente", "fui na aula", "fui para aula", "fui pra aula",
            "to na aula", "estou na aula", "assisti", "participei", "cheguei", "lanca presenca", "marca presenca"
        ]
        if any(term in text for term in present_keywords) or (detected_subject and "fui" in text.split()):
            return ParsedStudentIntent(
                intent="REGISTER_ATTENDANCE",
                subject_name=detected_subject,
                status="present",
                confidence=0.98,
                explanation="Confirmação de presença em aula."
            )

        return ParsedStudentIntent(
            intent="UNKNOWN",
            subject_name=detected_subject,
            confidence=0.5,
            explanation="Não foi possível mapear a intenção com clareza."
        )

    async def parse_student_intent(
        self,
        message_text: str,
        available_subjects: Optional[List[str]] = None
    ) -> ParsedStudentIntent:
        """
        Interpreta a mensagem do estudante via Google Gemini com Structured Outputs.
        Recai graciosamente sobre o motor heurístico se a API do Gemini não estiver configurada.
        """
        subjects = available_subjects or []
        subjects_str = ", ".join(subjects) if subjects else "Nenhuma listada especificamente"

        # Se não há cliente configurado, utiliza o motor heurístico
        if not self.client:
            return self._parse_heuristic(message_text, subjects)

        system_instruction = f"""Você é o Agente de Presença e Suporte do UniGag, um gestor acadêmico para universitários.
Sua função é analisar mensagens de estudantes enviadas via WhatsApp e classificar com precisão sua intenção acadêmica.

Disciplinas ativas do aluno no semestre:
[{subjects_str}]

Regras:
1. Se o aluno disser que esteve presente, assistiu à aula, foi ou chegou, classifique como REGISTER_ATTENDANCE com status='present'.
2. Se o aluno disser que faltou, não foi, perdeu a aula ou dormiu, classifique como REGISTER_ATTENDANCE com status='absence'.
3. Se perguntar quantas faltas tem ou quantas ainda pode ter, classifique como CHECK_LIMITS.
4. Se perguntar sobre trabalhos, entregas, provas ou seminários, classifique como CHECK_EVENTS.
5. Se perguntar quais aulas tem hoje ou a grade, classifique como CHECK_SCHEDULE.
6. Associe sempre que possível ao 'subject_name' correspondente na lista de disciplinas ativas."""

        try:
            # Chamada estruturada ao Gemini via SDK google-genai
            response = self.client.models.generate_content(
                model=settings.GEMINI_MODEL,
                contents=f"Mensagem do estudante: \"{message_text}\"",
                config={
                    "system_instruction": system_instruction,
                    "response_mime_type": "application/json",
                    "response_schema": ParsedStudentIntent,
                    "temperature": 0.1,
                }
            )

            if response.text:
                data = json.loads(response.text)
                return ParsedStudentIntent(**data)

            return self._parse_heuristic(message_text, subjects)

        except Exception as err:
            print(f"⚠️ Chamada ao Gemini falhou ({err}). Utilizando fallback heurístico...")
            return self._parse_heuristic(message_text, subjects)

gemini_service = GeminiService()
