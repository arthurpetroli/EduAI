from pydantic import BaseModel, ConfigDict
from typing import Any, Dict, List, Optional
from datetime import datetime

class GeracaoTextoRequest(BaseModel):
    materia: str
    nivel: str  
    topico: str

class GeracaoListaExerciciosRequest(BaseModel):
    materia: str
    nivel: str
    topico: str
    quantidade_exercicios: int = 5
    tipo_exercicio: str = "Múltipla Escolha"

class TextoGeradoBase(BaseModel):
    tema: str
    conteudo: str

class TextoGeradoCreate(TextoGeradoBase):
    pass

class TextoGerado(TextoGeradoBase):
    id: int
    data_criacao: datetime
    model_config = ConfigDict(from_attributes=True)

class ExercicioBase(BaseModel):
    enunciado: str
    tipo: str
    opcoes: Optional[Dict[str, Any]] = None
    resposta_correta: str

class ExercicioCreate(ExercicioBase):
    pass


class ListaExerciciosBase(BaseModel):
    titulo: str
    nivel_dificuldade: Optional[str] = None

class ListaExerciciosCreate(ListaExerciciosBase):
    exercicio_ids: List[int]

class ExercicioSimples(ExercicioBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class ListaExercicios(ListaExerciciosBase):
    id: int
    data_criacao: datetime
    exercicios: List[ExercicioSimples] = []
    model_config = ConfigDict(from_attributes=True)


class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class GeracaoAvaliacaoRequest(BaseModel):
    materia: str
    nivel: str
    topico: str
    quantidade_exercicios: int = 5
    dificuldade: str = "medio"

class TextoUpdateRequest(BaseModel):
    tema: Optional[str] = None
    materia: Optional[str] = None
    nivel: Optional[str] = None
    conteudo: Optional[str] = None

class UserProfileBase(BaseModel):
    nickname: str
    profile_image: Optional[str] = None
    username: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    university: Optional[str] = None
    degree: Optional[str] = None
    grad_year: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None

class UserProfileCreate(UserProfileBase):
    pass

class UserProfile(UserProfileBase):
    id: int
    user_id: int
    model_config = ConfigDict(from_attributes=True)