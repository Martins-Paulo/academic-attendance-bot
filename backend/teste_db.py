import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Carrega as variáveis do ficheiro .env
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

print("Tentando conectar ao Supabase...")
print(f"URL: {SUPABASE_URL}")

try:
    # Inicializa o cliente do Supabase
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    # Faz uma consulta simples à tabela 'students' criada anteriormente
    response = supabase.table("students").select("*").limit(1).execute()
    
    print("\n✅ Conexão bem-sucedida ao Supabase!")
    print(f"Resultado da consulta (deve estar vazia [] por enquanto): {response.data}")

except Exception as error:
    print("\n❌ Erro ao conectar ao Supabase:")
    print(error)