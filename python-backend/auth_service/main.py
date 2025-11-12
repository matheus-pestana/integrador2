from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
import sys
import os
from typing import List

# Adiciona a pasta 'common' ao sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from common.models import User, UserCreate, Token, UserProfileUpdate
from common import database
from common import auth
from common.database import init_db

app = FastAPI(
    title="MarketWise - Serviço de Autenticação",
    description="Microsserviço para login, registro e gerenciamento de usuários."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    """Inicializa o banco de dados (cria tabelas) quando o servidor inicia."""
    # Este serviço será o responsável por criar as tabelas
    print("Inicializando banco de dados...", file=sys.stderr)
    init_db()
    print("Banco de dados inicializado.", file=sys.stderr)

@app.post("/api/auth/register", response_model=Token)
async def register_user(user_in: UserCreate):
    """
    Registra um novo usuário.
    """
    db_user = database.get_user_by_email(user_in.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email já registrado",
        )
    
    user = database.create_user(user_in)
    access_token = auth.create_access_token(
        data={"sub": user.email, "user_id": user.id}
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/auth/login", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Fornece um token JWT para um usuário válido.
    """
    user = auth.authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = auth.create_access_token(
        data={"sub": user.email, "user_id": user.id}
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/auth/me", response_model=User)
async def read_users_me(current_user: User = Depends(auth.get_current_user)):
    """
    Retorna os dados do usuário autenticado.
    """
    return current_user

@app.put("/api/auth/profile", response_model=User)
async def update_user_profile(
    profile_data: UserProfileUpdate,
    current_user: User = Depends(auth.get_current_user)
):
    """
    Atualiza o nome e/ou avatar_url do usuário autenticado.
    """
    updated_user = database.update_user_profile(current_user.id, profile_data)
    if not updated_user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return updated_user

@app.get("/")
def read_root():
    return {"Hello": "Serviço de Autenticação MarketWise AI"}

# Para rodar este serviço:
# uvicorn auth_service.main:app --reload --port 8000