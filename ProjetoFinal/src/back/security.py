import os
from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from dotenv import load_dotenv
from passlib.context import CryptContext
import bcrypt

load_dotenv()

# Configuração do contexto de senha
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise ValueError("A variável de ambiente SECRET_KEY não foi definida. Crie um arquivo .env ou exporte a variável.")
    
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30  

def verify_password(plain_password, hashed_password):
    # Garantir que a senha não exceda 72 bytes (limite do bcrypt)
    if isinstance(plain_password, str):
        password_bytes = plain_password.encode('utf-8')
    else:
        password_bytes = plain_password
    
    # Truncar para 72 bytes (limite do bcrypt)
    password_bytes = password_bytes[:72]
    
    # Usar bcrypt diretamente para evitar problemas com a passlib
    if isinstance(hashed_password, str):
        hashed_bytes = hashed_password.encode('utf-8')
    else:
        hashed_bytes = hashed_password
    
    try:
        return bcrypt.checkpw(password_bytes, hashed_bytes)
    except ValueError:
        # Fallback para o método anterior caso ocorra algum problema
        return pwd_context.verify(plain_password[:72], hashed_password)

def get_password_hash(password):
    # Garantir que a senha não exceda 72 bytes (limite do bcrypt)
    if isinstance(password, str):
        password_bytes = password.encode('utf-8')
    else:
        password_bytes = password
    
    # Truncar para 72 bytes (limite do bcrypt)
    password_bytes = password_bytes[:72]
    
    # Usar bcrypt diretamente para evitar problemas com a passlib
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Cria um novo token de acesso JWT."""
    to_encode = data.copy()
    
    # Aumentar tempo de expiração para testes
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        # Aumentar para 24 horas em vez de 30 minutos
        expire = datetime.now(timezone.utc) + timedelta(hours=24)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt