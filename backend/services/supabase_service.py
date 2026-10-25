"""
Serviço de integração com banco de dados Supabase (PostgreSQL) para o bot UniGag.
Gerencia consultas a estudantes, disciplinas, faltas, limites e registro de presenças.
"""

from datetime import date
from typing import Any, Dict, List, Optional
import unicodedata
from supabase import create_client, Client
from config import settings

# Inicializa cliente Supabase
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

VALID_ATTENDANCE_STATUSES = {"present", "absence", "justified", "cancelled"}

def normalize_text(text: str) -> str:
    """Normaliza texto removendo acentos e pontuação para busca aproximada."""
    text = text.lower().strip()
    return "".join(
        c for c in unicodedata.normalize("NFD", text) if unicodedata.category(c) != "Mn"
    )

def get_student(student_id: int = settings.DEFAULT_STUDENT_ID) -> Optional[Dict[str, Any]]:
    """Recupera dados do estudante."""
    try:
        res = supabase.table("students").select("*").eq("id", student_id).limit(1).execute()
        return res.data[0] if res.data else None
    except Exception as e:
        print(f"❌ Erro ao buscar estudante ID {student_id}: {e}")
        return None

def get_student_subjects(student_id: int = settings.DEFAULT_STUDENT_ID) -> List[Dict[str, Any]]:
    """Recupera a grade de disciplinas cadastradas para o estudante."""
    try:
        # Tenta filtrar por student_id caso a coluna exista
        try:
            res = supabase.table("subjects").select("*").eq("student_id", student_id).execute()
            if res.data:
                return res.data
        except Exception:
            pass
        # Fallback para todas as matérias cadastradas caso ainda em modo unificado
        res = supabase.table("subjects").select("*").execute()
        return res.data or []
    except Exception as e:
        print(f"❌ Erro ao buscar disciplinas: {e}")
        return []

def find_subject_by_query(query: str, student_id: int = settings.DEFAULT_STUDENT_ID) -> Optional[Dict[str, Any]]:
    """
    Busca inteligente por disciplina baseada em texto livre, código ou sigla.
    Exemplo: 'BD', 'banco', 'estruturas', 'ED', 'INF0123'.
    """
    subjects = get_student_subjects(student_id)
    if not subjects or not query:
        return None

    clean_query = normalize_text(query)

    # Siglas acadêmicas comuns
    acronym_map = {
        "ed": "estruturas de dados",
        "bd": "banco de dados",
        "ia": "inteligencia artificial",
        "so": "sistemas operacionais",
        "poo": "programacao orientada a objetos",
        "calc": "calculo",
        "calculo": "calculo",
    }

    expanded_query = acronym_map.get(clean_query, clean_query)

    # 1. Busca por código exato (case-insensitive)
    for sub in subjects:
        if normalize_text(sub.get("code", "")) == clean_query:
            return sub

    # 2. Busca por nome exato normalizado
    for sub in subjects:
        if normalize_text(sub.get("name", "")) == expanded_query:
            return sub

    # 3. Busca por substring no nome
    for sub in subjects:
        norm_name = normalize_text(sub.get("name", ""))
        if expanded_query in norm_name or norm_name in expanded_query:
            return sub

    # 4. Busca por palavras individuais (match parcial)
    query_words = set(expanded_query.split())
    best_match = None
    max_shared = 0

    for sub in subjects:
        sub_words = set(normalize_text(sub.get("name", "")).split())
        shared = len(query_words.intersection(sub_words))
        if shared > max_shared:
            max_shared = shared
            best_match = sub

    if max_shared > 0:
        return best_match

    return None

def register_attendance(
    subject_id: int,
    student_id: int = settings.DEFAULT_STUDENT_ID,
    status: str = "present",
    attendance_date: Optional[str] = None
) -> Dict[str, Any]:
    """
    Registra presença, falta ou cancelamento na tabela attendances.
    Garante que o status respeite a constraint do banco.
    """
    status_clean = status.lower().strip()
    if status_clean not in VALID_ATTENDANCE_STATUSES:
        raise ValueError(
            f"Status inválido: '{status}'. Valores permitidos: {VALID_ATTENDANCE_STATUSES}"
        )

    date_val = attendance_date or date.today().isoformat()

    payload = {
        "student_id": student_id,
        "subject_id": subject_id,
        "status": status_clean,
        "date": date_val,
    }

    try:
        res = supabase.table("attendances").insert(payload).execute()
        if not res.data:
            raise RuntimeError("Nenhum dado retornado ao registrar frequência.")
        return res.data[0]
    except Exception as e:
        print(f"❌ Erro ao registrar presença no Supabase: {e}")
        raise e

def get_absence_margins(
    subject_id: int,
    student_id: int = settings.DEFAULT_STUDENT_ID
) -> Dict[str, Any]:
    """
    Calcula a margem de faltas, total de aulas e se o aluno está em risco.
    Retorna métricas em conformidade com as regras de negócio do UniGag.
    """
    # 1. Recupera disciplina
    sub_res = supabase.table("subjects").select("*").eq("id", subject_id).limit(1).execute()
    if not sub_res.data:
        raise ValueError(f"Disciplina ID {subject_id} não encontrada.")
    
    subject = sub_res.data[0]
    total_classes = subject.get("total_classes") or 64
    max_absences = subject.get("max_absences") or int(total_classes * 0.25)

    # 2. Recupera histórico de presenças da matéria
    att_res = supabase.table("attendances").select("status").eq("subject_id", subject_id).execute()
    records = att_res.data or []

    absences_count = sum(1 for r in records if r.get("status") == "absence")
    presents_count = sum(1 for r in records if r.get("status") == "present")

    remaining_absences = max(0, max_absences - absences_count)
    total_registered = absences_count + presents_count
    attendance_rate = (
        round((presents_count / total_registered) * 100, 1) if total_registered > 0 else 100.0
    )

    is_critical = (remaining_absences <= 3) or (
        max_absences > 0 and (absences_count / max_absences) >= 0.75
    )

    return {
        "subject_id": subject_id,
        "subject_name": subject.get("name"),
        "subject_code": subject.get("code"),
        "total_classes": total_classes,
        "max_absences": max_absences,
        "absences_count": absences_count,
        "presents_count": presents_count,
        "remaining_absences": remaining_absences,
        "attendance_rate": attendance_rate,
        "is_critical": is_critical,
    }

def get_pending_events(student_id: int = settings.DEFAULT_STUDENT_ID) -> List[Dict[str, Any]]:
    """Recupera as próximas entregas e provas pendentes do estudante."""
    try:
        res = (
            supabase.table("academic_events")
            .select("*, subjects(name, code)")
            .eq("completed", False)
            .order("event_date", desc=False)
            .limit(5)
            .execute()
        )
        return res.data or []
    except Exception as e:
        print(f"❌ Erro ao buscar eventos acadêmicos: {e}")
        return []
