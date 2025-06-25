from sqlalchemy.orm import Session
import models
import schemas
import json
import datetime


def get_texto_gerado_by_id(db: Session, texto_id: int):
    return db.query(models.TextoGerado).filter(models.TextoGerado.id == texto_id).first()

def create_texto_gerado(db: Session, texto: schemas.TextoGeradoCreate):
    db_texto = models.TextoGerado(tema=texto.tema, conteudo=texto.conteudo)
    db.add(db_texto)
    db.commit()
    db.refresh(db_texto)
    return db_texto

def get_lista_exercicios_by_id(db: Session, lista_id: int):
    return db.query(models.Avaliacao).filter(models.Avaliacao.id == lista_id).first()

def create_lista_exercicios(db: Session, request, dados_ia: str, user_id: int = None, tipo: str = "exercicio") -> models.Avaliacao:
    """
    Cria os exercícios a partir do JSON da IA e os agrupa em uma nova Lista de Exercícios.
    """
    try:
        # Parse dos dados da IA (formato JSON)
        dados = json.loads(dados_ia)
        exercicios_data = dados.get('exercicios', [])
        
        # Criar título combinando matéria e tópico
        titulo = f"{request.materia}: {request.topico}"
        
        # Criar o objeto Avaliacao apenas com campos válidos no modelo
        db_lista = models.Avaliacao(
            titulo=titulo,
            nivel_dificuldade=request.nivel,
            user_id=user_id,
            data_criacao=datetime.datetime.now(),
            tipo=tipo
        )
        
        # Adicionar ao banco de dados e obter ID
        db.add(db_lista)
        db.commit()
        db.refresh(db_lista)
        
        # Criar exercícios e associá-los à lista
        for ex_data in exercicios_data:
            db_exercicio = create_exercicio(db, ex_data)
            db_lista.exercicios.append(db_exercicio)
        
        db.commit()
        db.refresh(db_lista)
        return db_lista
        
    except json.JSONDecodeError:
        raise ValueError(f"Dados inválidos fornecidos pela IA: {dados_ia}")
    except Exception as e:
        db.rollback()
        raise e



def get_user_by_username(db: Session, username: str):
    """Busca um usuário pelo seu nome de usuário."""
    return db.query(models.User).filter(models.User.username == username).first()

def create_user(db: Session, user: schemas.UserCreate):
    """Cria um novo usuário com senha com hash."""
    import security
    hashed_password = security.get_password_hash(user.password)
    db_user = models.User(username=user.username, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def create_exercicio(db: Session, exercicio_data: dict):
    """
    Cria um novo exercício no banco de dados.
    """
    # Criar objeto Exercicio apenas com campos que existem no modelo
    db_exercicio = models.Exercicio(
        enunciado=exercicio_data.get('enunciado'),
        tipo=exercicio_data.get('tipo', 'objetiva'),
        opcoes=exercicio_data.get('opcoes', {}),
        resposta_correta=exercicio_data.get('resposta_correta', '')
        # Removido o campo explicacao que não existe no modelo
    )
    
    # Adicionar ao banco de dados
    db.add(db_exercicio)
    db.commit()
    db.refresh(db_exercicio)
    
    return db_exercicio