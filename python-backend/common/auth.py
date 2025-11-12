import os
import sys
from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext

from common import database
from common.models import User, TokenData

# --- Configuração de Senha ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login") # Aponta para o endpoint de login

# --- Configuração do JWT ---
# Em produção, use segredos fortes e carregue-os do .env
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "seu_segredo_super_secreto_aqui_mude_isso")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 # 7 dias

if SECRET_KEY == "seu_segredo_super_secreto_aqui_mude_isso":
    print("AVISO: Usando chave JWT secreta padrão. Defina JWT_SECRET_KEY no .env para produção.", file=sys.stderr)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def authenticate_user(email: str, password: str) -> Optional[User]:
    user = database.get_user_by_email(email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user

async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Não foi possível validar as credenciais",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: Optional[int] = payload.get("user_id")
        if user_id is None:
            raise credentials_exception
        
        token_data = TokenData(user_id=user_id, sub=payload.get("sub"))
    
    except JWTError:
        raise credentials_exception
    
    user = database.get_user_by_id(user_id=token_data.user_id)
    if user is None:
        raise credentials_exception
    
    # Retorna o modelo Pydantic do usuário
    return user