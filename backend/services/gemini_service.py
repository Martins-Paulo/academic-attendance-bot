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
        "GREETING",
        "SET_NAME",
        "SET_TONE",
        "GENERAL_QUERY",
        "UNKNOWN"
    ] = Field(description="Tipo de intenção principal detectada na mensagem do estudante.")
    subject_name: Optional[str] = Field(
        default=None,
        description="Nome aproximado, código ou sigla da matéria citada."
    )
    status: Optional[Literal["present", "absence", "cancelled", "justified"]] = Field(
        default=None,
        description="Status de frequência pretendido se for registro de presença ou falta."
    )
    extracted_name: Optional[str] = Field(
        default=None,
        description="Nome ou apelido informado pelo aluno caso esteja se apresentando (ex: 'Pode me chamar de Paulo' -> 'Paulo')."
    )
    extracted_tone: Optional[Literal["queer", "neutral"]] = Field(
        default=None,
        description="Tom ou estilo de linguagem solicitado pelo aluno caso intent seja SET_TONE ('queer' para gírias/descontraído ou 'neutral' para formal/sério)."
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

        # 1. Definição ou alteração de preferência de tom/personalidade (SET_TONE)
        neutral_tone_terms = [
            "fala serio", "fale serio", "falar serio", "seja formal", "prefiro formal",
            "modo formal", "prefiro sem girias", "sem girias", "sem giria", "nao use girias",
            "nao use giria", "nao gosto de girias", "fala direito", "fale direito",
            "tom neutro", "modo neutro", "seja neutro", "menos giria", "sem brincadeira"
        ]
        queer_tone_terms = [
            "pode usar girias", "pode usar giria", "use girias", "use giria", "modo queer",
            "tom queer", "gosto de girias", "gosto de giria", "fala como diva", "modo diva",
            "solta a franga", "fala informal", "pode ser informal", "adoro girias",
            "foco no diploma", "quero girias", "quero giria"
        ]
        if any(term in text for term in neutral_tone_terms):
            return ParsedStudentIntent(
                intent="SET_TONE",
                extracted_tone="neutral",
                confidence=0.98,
                explanation="Aluno solicitou tom formal/neutro sem gírias."
            )
        if any(term in text for term in queer_tone_terms):
            return ParsedStudentIntent(
                intent="SET_TONE",
                extracted_tone="queer",
                confidence=0.98,
                explanation="Aluno solicitou tom descontraído/queer com gírias."
            )

        # 2. Apresentação ou definição de apelido / nome preferido
        name_match = re.search(
            r"(?:pode me chamar de|me chame de|meu nome e|meu nome eh|me chamo|sou o|sou a)\s+([A-Za-zÀ-ÿ0-9_\-]+)",
            text,
            re.IGNORECASE
        )
        if name_match:
            raw_name = name_match.group(1).strip()
            return ParsedStudentIntent(
                intent="SET_NAME",
                extracted_name=raw_name.capitalize(),
                confidence=0.98,
                explanation="Apresentação ou definição de apelido/nome preferido pelo estudante."
            )

        # 3. Saudações puras e primeiro contato
        pure_greetings = {
            "oi", "ola", "olaa", "oie", "opa", "salve", "e ai", "eae", "hello", "hey",
            "bom dia", "boa tarde", "boa noite", "comecar", "start", "menu", "ajuda",
            "tudo bem", "como vai", "fala ai"
        }
        if text in pure_greetings or any(text.startswith(g + " ") for g in ["oi", "ola", "bom dia", "boa tarde", "boa noite", "e ai"]):
            # Se não menciona presença, falta ou disciplina específica, classifica como saudação
            has_academic_keyword = any(
                kw in text for kw in ["aula", "falta", "presenca", "materia", "prova", "nota", "trabalho"]
            )
            if not has_academic_keyword:
                return ParsedStudentIntent(
                    intent="GREETING",
                    confidence=0.98,
                    explanation="Saudação inicial acolhedora."
                )

        # 4. Identificar disciplina mais provável no texto considerando apenas a grade real do estudante
        detected_subject = None
        for sub_name in available_subjects:
            clean_sub = norm(sub_name)
            if clean_sub in text or text in clean_sub:
                detected_subject = sub_name
                break

        # Siglas dinâmicas contra as matérias reais do aluno (desconsiderando stopwords)
        if not detected_subject and available_subjects:
            stopwords = {"de", "da", "do", "dos", "das", "e", "em", "para", "com"}
            for sub_name in available_subjects:
                words = [w for w in norm(sub_name).split() if w not in stopwords]
                acronym = "".join(w[0] for w in words if w)
                if acronym and re.search(rf"\b{re.escape(acronym)}\b", text):
                    detected_subject = sub_name
                    break

        # 5. Verificar intenções de consulta de faltas/limites
        if any(term in text for term in ["quantas faltas", "limite", "posso faltar", "saldo de falta", "estou no limite", "faltas restantes"]):
            return ParsedStudentIntent(
                intent="CHECK_LIMITS",
                subject_name=detected_subject,
                confidence=0.95,
                explanation="Consulta de limite e margem de faltas solicitada."
            )

        # 6. Verificar intenções de eventos/entregas
        if any(term in text for term in ["proxima entrega", "proximas entregas", "entregas", "trabalho", "prova", "seminario", "provas"]):
            return ParsedStudentIntent(
                intent="CHECK_EVENTS",
                subject_name=detected_subject,
                confidence=0.95,
                explanation="Consulta de entregas e eventos pendentes."
            )

        # 7. Verificar intenções de agenda/horários
        if any(term in text for term in ["que aula tenho", "aulas de hoje", "horario", "grade de hoje", "minha grade", "minhas materias"]):
            return ParsedStudentIntent(
                intent="CHECK_SCHEDULE",
                confidence=0.90,
                explanation="Consulta de horários e grade acadêmica."
            )

        # 8. Registro de Falta (verificar antes de presença para evitar falso positivo em 'não fui')
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

        # 9. Cancelamento de Aula
        cancelled_keywords = ["aula cancelada", "nao teve aula", "professor faltou", "cancelou", "aula suspensa"]
        if any(term in text for term in cancelled_keywords):
            return ParsedStudentIntent(
                intent="REGISTER_ATTENDANCE",
                subject_name=detected_subject,
                status="cancelled",
                confidence=0.95,
                explanation="Registro de aula cancelada."
            )

        # 10. Registro de Presença
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
        available_subjects: Optional[List[str]] = None,
        bot_tone: str = "queer"
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

        tone_guidelines = (
            "Tom de Voz: QUEER (Padrão)\n"
            "Sua comunicação é cheia de energia, empática, acolhedora e recheada de gírias pop/queer universitárias "
            "('diva', 'mona', 'babado', 'arrasa', 'foco no diploma'). Celebre conquistas e mantenha o clima vibrante e motivador."
            if bot_tone == "queer" else
            "Tom de Voz: NEUTRO / FORMAL\n"
            "Sua comunicação é polida, profissional, sem gírias ou vocativos informais, mantendo clareza, respeito e sobriedade técnica."
        )

        system_instruction = f"""Você é o assistente inteligente do UniGag, um gestor acadêmico universitário parceiro de estudos.
Sua postura é empática, prestativa e inclusiva.
Você prioriza a precisão rigorosa nos dados de presença, cálculo de faltas e datas de entregas acadêmicas.

{tone_guidelines}

Disciplinas ativas do aluno no semestre:
[{subjects_str}]

Classificação de Intenções:
1. Se o usuário estiver apenas saudando ou iniciando contato ('oi', 'olá', 'boa tarde', 'e aí', 'opa', 'começar'), classifique como GREETING.
2. Se o usuário estiver informando como prefere ser chamado ou se apresentando ('pode me chamar de X', 'me chame de Y', 'meu nome é Z'), classifique como SET_NAME e extraia o nome em extracted_name.
3. Se o aluno pedir para mudar o estilo de linguagem, tom ou tratamento (ex: 'fala sério comigo', 'prefiro sem gírias', 'seja formal' -> extracted_tone='neutral'; ou 'pode usar gírias', 'fala como diva', 'modo queer' -> extracted_tone='queer'), classifique como SET_TONE e preencha extracted_tone.
4. Se o aluno disser que compareceu, assistiu ou foi à aula, classifique como REGISTER_ATTENDANCE com status='present'.
5. Se o aluno disser que faltou, perdeu a aula ou dormiu, classifique como REGISTER_ATTENDANCE com status='absence'.
6. Se a aula foi cancelada ou dispensada pelo professor, classifique como REGISTER_ATTENDANCE com status='cancelled'.
7. Se perguntar quantas faltas tem ou quantas ainda pode ter, classifique como CHECK_LIMITS.
8. Se perguntar sobre trabalhos, entregas, provas ou prazos, classifique como CHECK_EVENTS.
9. Se perguntar quais aulas tem hoje ou a grade, classifique como CHECK_SCHEDULE.
10. Associe sempre que possível ao 'subject_name' correspondente na lista de disciplinas ativas."""

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
