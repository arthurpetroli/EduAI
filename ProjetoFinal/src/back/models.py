from sqlalchemy import Table, Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import datetime


from database import Base

avaliacao_exercicio_association = Table(
    'avaliacao_exercicio', Base.metadata,
    Column('avaliacao_id', Integer, ForeignKey('avaliacoes.id'), primary_key=True),
    Column('exercicio_id', Integer, ForeignKey('exercicios.id'), primary_key=True)
)


class TextoGerado(Base):
    __tablename__ = "textos_gerados"
    
    id = Column(Integer, primary_key=True, index=True)
    tema = Column(String, index=True)
    conteudo = Column(Text)
    materia = Column(String, nullable=True)
    nivel = Column(String, nullable=True)
    data_criacao = Column(DateTime, default=datetime.datetime.now)
    
    # Adicione estas linhas para relacionamento com usuário
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    user = relationship("User", back_populates="textos")

    exercicios = relationship("Exercicio", back_populates="texto_associado")



class Avaliacao(Base):
    __tablename__ = "avaliacoes"
    
    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(255), nullable=False)
    nivel_dificuldade = Column(String(100))
    tipo = Column(String(50), default="avaliacao")  # Adicionar este campo se não existir
    data_criacao = Column(DateTime(timezone=True), server_default=func.now())
    # Relação com usuário
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    user = relationship("User", back_populates="avaliacoes")

    exercicios = relationship(
        "Exercicio",
        secondary=avaliacao_exercicio_association,
        back_populates="avaliacoes"
    )

class Exercicio(Base):
    __tablename__ = "exercicios"


    id = Column(Integer, primary_key=True, index=True)
    enunciado = Column(Text, nullable=False)
    tipo = Column(String(100), default="dissertativo")
    opcoes = Column(JSON, nullable=True)
    resposta_correta = Column(Text, nullable=False)
    data_criacao = Column(DateTime(timezone=True), server_default=func.now())
    texto_associado_id = Column(Integer, ForeignKey("textos_gerados.id"))

    
    texto_associado = relationship("TextoGerado", back_populates="exercicios")
    
    avaliacoes = relationship(
        "Avaliacao",
        secondary=avaliacao_exercicio_association,
        back_populates="exercicios"
    )
    

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)

    # Relacionamentos
    textos = relationship("TextoGerado", back_populates="user")
    avaliacoes = relationship("Avaliacao", back_populates="user")


class UserProfile(Base):
    __tablename__ = "user_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    nickname = Column(String(100), default="Usuário")
    profile_image = Column(String, nullable=True)
    username = Column(String(255), nullable=True)  # Nome completo opcional
    bio = Column(Text, nullable=True)
    location = Column(String(255), nullable=True)
    university = Column(String(255), nullable=True)
    degree = Column(String(255), nullable=True)
    grad_year = Column(String(10), nullable=True)
    linkedin = Column(String(255), nullable=True)
    github = Column(String(255), nullable=True)
    
    # Relacionamento com o usuário
    user = relationship("User", backref="profile")