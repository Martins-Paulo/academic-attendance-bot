from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

# Diretório base do backend
BASE_DIR = Path(__file__).resolve().parent

class Settings(BaseSettings):
    """Configurações globais da aplicação UniGag Backend."""
    
    # Supabase PostgreSQL
    SUPABASE_URL: str = Field(default="", description="URL do projeto Supabase")
    SUPABASE_KEY: str = Field(default="", description="Chave anônima do Supabase")
    SUPABASE_SERVICE_ROLE_KEY: str = Field(default="", description="Chave service_role do Supabase para bypass de RLS no backend")
    
    # Evolution API (WhatsApp Gateway)
    WHATSAPP_API_URL: str = Field(default="http://localhost:8080", description="URL da Evolution API")
    WHATSAPP_API_KEY: str = Field(default="sua-chave-api-whatsapp", description="API Key da Evolution API")
    EVOLUTION_INSTANCE_NAME: str = Field(default="unigag", description="Nome da instância na Evolution API")
    ALLOW_SELF_TEST: bool = Field(default=False, description="Permite processar auto-mensagens (fromMe=True) para testes no WhatsApp")
    
    # Google Gemini AI
    GEMINI_API_KEY: str = Field(default="", description="Chave de API do Google Gemini AI")
    GEMINI_MODEL: str = Field(default="gemini-1.5-flash", description="Modelo padrão do Gemini")
    
    # Servidor Webhook
    PORT: int = Field(default=8000, description="Porta HTTP do servidor")
    HOST: str = Field(default="0.0.0.0", description="Host de binding do servidor")
    
    # Portal Web UniGag
    FRONTEND_URL: str = Field(default="https://unigag.vercel.app", description="URL do painel web UniGag")
    
    # Estudante Padrão para testes e scripts manuais
    DEFAULT_STUDENT_ID: int = Field(default=1, description="ID do estudante padrão para scripts")

    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
