from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from jose import JWTError, jwt

import models  # Adicione esta linha
import crud
import schemas
import security
from database import SessionLocal

router = APIRouter(
    tags=["Autenticação"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(token: Annotated[str, Depends(oauth2_scheme)], db: Session = Depends(get_db)):
    """Decodifica o token JWT para obter o usuário atual."""
    credentials_exception = HTTPException(
        status_code=401,
        detail="Credenciais inválidas",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Log para depuração
        print(f"Verificando token: {token[:20]}...")
        
        # Decodifica o token
        payload = jwt.decode(token, security.SECRET_KEY, algorithms=[security.ALGORITHM])
        username: str = payload.get("sub")
        
        if username is None:
            raise credentials_exception
            
        print(f"Token válido para usuário: {username}")
    except JWTError as e:
        print(f"Erro ao decodificar token JWT: {str(e)}")
        raise credentials_exception
        
    # Busca o usuário no banco de dados
    user = crud.get_user_by_username(db, username=username)
    if user is None:
        print(f"Usuário {username} não encontrado no banco de dados")
        raise credentials_exception
        
    return user

async def get_current_active_user(current_user: Annotated[schemas.User, Depends(get_current_user)]):
    """Verifica se o usuário atual está ativo (pode ser expandido no futuro)."""
    return current_user


@router.post("/token", response_model=schemas.Token)
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()], 
    db: Session = Depends(get_db)
):
    """
    Endpoint de login. Recebe username e password, retorna um access_token.
    """
    user = crud.get_user_by_username(db, username=form_data.username)
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=401,
            detail="Nome de usuário ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = security.create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/users/register", response_model=schemas.User)
def create_new_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """
    Endpoint de registro para criar um novo usuário.
    """
    db_user = crud.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Nome de usuário já registrado")
    return crud.create_user(db=db, user=user)

@router.get("/users/me", response_model=schemas.User)
async def read_users_me(current_user: Annotated[schemas.User, Depends(get_current_active_user)]):
    """Retorna os dados do usuário atualmente logado."""
    return current_user

@router.get("/users/profile", response_model=schemas.UserProfile)
def get_user_profile(current_user: Annotated[schemas.User, Depends(get_current_active_user)], db: Session = Depends(get_db)):
    """Retorna o perfil do usuário logado."""
    try:
        # Tentar buscar o perfil existente
        profile = db.query(models.UserProfile).filter(models.UserProfile.user_id == current_user.id).first()
        
        # Se não existir, criar um novo com dados básicos
        if not profile:
            profile = models.UserProfile(
                user_id=current_user.id,
                nickname=current_user.username
            )
            db.add(profile)
            db.commit()
            db.refresh(profile)
        
        return profile
    except Exception as e:
        print(f"Erro ao buscar perfil: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")

# Adicionar junto aos outros endpoints
@router.post("/users/profile", response_model=schemas.UserProfile)
def update_user_profile(
    profile_data: schemas.UserProfileCreate,
    current_user: Annotated[schemas.User, Depends(get_current_active_user)],
    db: Session = Depends(get_db)
):
    """Atualiza o perfil do usuário logado."""
    try:
        profile = db.query(models.UserProfile).filter(models.UserProfile.user_id == current_user.id).first()
        
        if not profile:
            # Criar novo perfil
            profile = models.UserProfile(user_id=current_user.id)
            db.add(profile)
        
        # Atualizar campos
        profile.nickname = profile_data.nickname
        profile.profile_image = profile_data.profile_image
        profile.username = profile_data.username
        profile.bio = profile_data.bio
        profile.location = profile_data.location
        profile.university = profile_data.university
        profile.degree = profile_data.degree
        profile.grad_year = profile_data.grad_year
        profile.linkedin = profile_data.linkedin
        profile.github = profile_data.github
        
        db.commit()
        db.refresh(profile)
        return profile
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao atualizar perfil: {str(e)}")