from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# Obter URL de conexão do ambiente
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:QElEUUyQpnwAcNAYUINtWQFaJHyePFHW@yamabiko.proxy.rlwy.net:35449/railway")

# Configuração específica para PostgreSQL
if DATABASE_URL.startswith("postgresql"):
    connect_args = {}
else:
    # SQLite needs check_same_thread=False
    connect_args = {"check_same_thread": False}

engine = create_engine(
    DATABASE_URL, connect_args=connect_args
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """Retorna uma sessão do banco de dados."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
