import os
from fastapi import FastAPI, Depends, HTTPException, Path, Request
from sqlalchemy.orm import Session
import google.generativeai as genai
from fastapi.responses import StreamingResponse, Response
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime  # Adicione esta linha
import traceback
import logging

import models
import schemas
import crud
import export_services
from database import engine
from auth import router as auth_router, get_current_active_user, get_db

logging.basicConfig(filename='app.log', level=logging.ERROR)

load_dotenv()
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="API de Geração de Conteúdo Educacional",
    description="Gere textos de apoio, listas de exercícios e exporte em DOCX ou PDF.",
    version="2.0.0"
)

# Configuração CORS corrigida
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://edu-ai-kappa.vercel.app/"],  # Adicionar ambos os endereços
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],  # Permitir todos os cabeçalhos
)

api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    raise RuntimeError("A variável de ambiente GOOGLE_API_KEY não foi definida.")
genai.configure(api_key=api_key)

def get_generative_model():
    return genai.GenerativeModel('gemini-1.5-flash')

app.include_router(auth_router, prefix="/auth")

@app.get("/", tags=["Status"])
def read_root():
    return {"message": "Bem-vindo à API de Geração de Conteúdo v2.0!"}


@app.post("/textos-apoio", response_model=schemas.TextoGerado, tags=["Geração"])
def gerar_texto_de_apoio(
    request: schemas.GeracaoTextoRequest,
    db: Session = Depends(get_db),
    model: genai.GenerativeModel = Depends(get_generative_model),
    current_user: schemas.User = Depends(get_current_active_user)
):
    """
    Gera um texto de apoio ou resumo sobre um tópico específico.
    """
    # Ajustes específicos baseados na matéria
    estilo_especifico = ""
    if request.materia.lower() == "matemática":
        estilo_especifico = """
        - Use exemplos numéricos claros para ilustrar conceitos
        - Quando incluir fórmulas matemáticas, formate-as em negrito e separadas em linhas próprias
        - Evite notações complexas, prefira explicações passo a passo
        - Use marcadores para listar propriedades ou regras importantes
        """
    elif request.materia.lower() in ["física", "química"]:
        estilo_especifico = """
        - Inclua exemplos práticos do cotidiano para ilustrar conceitos
        - Quando mencionar fórmulas, explique o significado de cada variável
        - Use marcadores para listar fenômenos ou reações importantes
        - Divida temas complexos em partes menores e mais digeríveis
        """
    elif request.materia.lower() in ["história", "geografia"]:
        estilo_especifico = """
        - Organize o conteúdo em ordem cronológica (para história) ou espacial (para geografia)
        - Destaque datas, locais e personagens importantes em negrito
        - Use subtópicos para separar períodos históricos ou regiões geográficas
        - Inclua contextos relevantes para facilitar a compreensão
        """
    elif request.materia.lower() == "português":
        estilo_especifico = """
        - Use exemplos de texto para ilustrar regras gramaticais ou conceitos literários
        - Destaque exceções às regras em um formato visual diferente
        - Organize regras gramaticais em tabelas quando apropriado
        - Use comparações entre termos semelhantes para evitar confusões comuns
        """
    elif request.materia.lower() == "biologia":
        estilo_especifico = """
        - Use analogias para explicar processos biológicos complexos
        - Organize informações sobre taxonomia ou classificações em listas
        - Destaque termos científicos em negrito na primeira menção
        - Use estrutura hierárquica para mostrar relações entre conceitos
        """

    prompt = f"""
    Crie um texto de apoio didático e claro sobre o tópico '{request.topico}' da matéria de '{request.materia}', para alunos do ensino {request.nivel}.

    **Instruções de Formatação OBRIGATÓRIAS:**
    - Utilize o formato Markdown para estruturar o texto.
    - Use um título principal claro e relevante
    - Divida o conteúdo em seções lógicas com subtítulos ('##')
    - O texto DEVE conter parágrafos distintos (separados por uma linha em branco).
    - Use subtítulos com '##' para as seções mais importantes.
    - Se fizer sentido, use listas com marcadores (usando '*' ou '-') para listar exemplos ou pontos-chave.
    - Use negrito (com '**texto**') para destacar os termos mais importantes.
    - Utilize itálico para termos secundários quando apropriado.
    - Use espaçamento adequado para melhorar a legibilidade.

    {estilo_especifico}

    **Estrutura Sugerida:**
    1. Introdução ao conceito (contextualização)
    2. Explicação principal do tópico
    3. Exemplos ou aplicações práticas
    4. Resumo ou pontos-chave para lembrar

    Mantenha uma linguagem adequada ao nível de ensino especificado. Gere o texto estruturado agora.
    """
    try:
        response = model.generate_content(prompt)
        tema = f"{request.topico} ({request.materia} - {request.nivel})"
        
        # Limpa possíveis blocos de código da resposta da IA
        cleaned_response = response.text.strip().replace("```markdown", "").replace("```", "").strip()

        # Ao criar o objeto TextoGerado, adicione o user_id
        db_texto = models.TextoGerado(
            tema=tema, 
            conteudo=cleaned_response,
            materia=request.materia,
            nivel=request.nivel,
            user_id=current_user.id  # Adicione esta linha
        )
        
        db.add(db_texto)
        db.commit()
        db.refresh(db_texto)
        
        return db_texto
    except Exception as e:
        logging.error(str(e), exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/listas-exercicios", response_model=schemas.ListaExercicios, tags=["Geração"])
def gerar_lista_exercicios(
    request: schemas.GeracaoListaExerciciosRequest,
    db: Session = Depends(get_db),
    model: genai.GenerativeModel = Depends(get_generative_model),
    current_user: schemas.User = Depends(get_current_active_user)
):
    """
    Gera uma lista de exercícios sobre um tópico específico.
    """
    prompt = f"""
    Com base no tópico '{request.topico}' da matéria de '{request.materia}' para o ensino {request.nivel}, gere {request.quantidade_exercicios} exercícios do tipo '{request.tipo_exercicio}'.

    Instruções de Formato:
    - Sua resposta deve ser um único objeto JSON.
    - Este objeto deve ter uma única chave: "exercicios".
    - O valor de "exercicios" deve ser uma LISTA de objetos, onde cada objeto representa um exercício.
    - Cada exercício DEVE ter EXATAMENTE as seguintes chaves: "enunciado", "tipo", "opcoes", "resposta_correta".
    - O campo "opcoes" deve ser um dicionário como {{"A": "...", "B": "..."}}. Se for dissertativo, use null.
    """
    try:
        response = model.generate_content(prompt)
        
        cleaned_ia_response = response.text.strip().replace("```json", "").replace("```", "").strip()

        return crud.create_lista_exercicios(
            db=db, 
            request=request, 
            dados_ia=cleaned_ia_response, 
            user_id=current_user.id,
            tipo="exercicio"  # Especificar explicitamente o tipo como "exercicio"
        )
        
    except Exception as e:
        logging.error(str(e), exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/avaliacoes", response_model=schemas.ListaExercicios, tags=["Geração"])
def gerar_avaliacao(
    request: schemas.GeracaoAvaliacaoRequest,
    db: Session = Depends(get_db),
    model: genai.GenerativeModel = Depends(get_generative_model),
    current_user: schemas.User = Depends(get_current_active_user)
):
    """
    Gera uma avaliação com exercícios aleatórios com base no nível de dificuldade.
    """
    prompt = f"""
    Com base no tópico '{request.topico}' da matéria de '{request.materia}' para o ensino {request.nivel}, gere {request.quantidade_exercicios} exercícios com o nível de dificuldade '{request.dificuldade}'.

    Instruções de Formato OBRIGATÓRIAS:
    - Sua resposta deve ser um único objeto JSON.
    - Este objeto deve ter uma única chave: "exercicios".
    - O valor de "exercicios" deve ser uma LISTA de objetos, onde cada objeto representa um exercício.
    - Cada exercício DEVE ter EXATAMENTE as seguintes chaves: "enunciado", "tipo", "opcoes", "resposta_correta".
    - O campo "opcoes" deve ser um dicionário como {{"A": "...", "B": "..."}}. Se for dissertativo, use null.
    - Os exercícios devem ser todos do nível {request.dificuldade}.
    """
    try:
        response = model.generate_content(prompt)
        
        cleaned_ia_response = response.text.strip().replace("```json", "").replace("```", "").strip()

        return crud.create_lista_exercicios(
            db=db, 
            request=request, 
            dados_ia=cleaned_ia_response,
            user_id=current_user.id,
            tipo="avaliacao"  # Especificar explicitamente o tipo como "avaliacao"
        )
        
    except Exception as e:
        logging.error(str(e), exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/export/assessment", response_class=Response, tags=["Exportação"])
async def export_assessment(
    request: Request,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_active_user)
):
    """
    Exporta uma avaliação para PDF ou DOCX.
    """
    try:
        # Obter dados do corpo da requisição
        data = await request.json()
        assessment_data = data.get("assessment")
        export_format = data.get("format", "pdf").lower()
        include_answers = data.get("includeAnswers", False)
        
        if export_format == "pdf":
            # Usar o serviço de geração de PDF
            file_content = export_services.generate_assessment_pdf(
                assessment_data, 
                include_answers
            )
            media_type = "application/pdf"
            filename = f"avaliacao.pdf"
        elif export_format == "docx":
            # Usar o serviço de geração de DOCX
            file_content = export_services.generate_assessment_docx(
                assessment_data, 
                include_answers
            )
            media_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            filename = f"avaliacao.docx"
        else:
            raise HTTPException(
                status_code=400, 
                detail="Formato de arquivo não suportado"
            )
            
        # Registrar a exportação no banco de dados
        export_record = schemas.ExportCreate(
            user_id=current_user.id,
            content_type="assessment",
            export_format=export_format
        )
        crud.create_export_record(db=db, export_record=export_record)
        
        # Retornar o arquivo gerado
        return Response(
            content=file_content,
            media_type=media_type,
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )
    except Exception as e:
        logging.error(str(e), exc_info=True)
        raise HTTPException(
            status_code=500, 
            detail=f"Erro ao exportar avaliação: {str(e)}"
        )

@app.middleware("http")
async def log_requests(request, call_next):
    print(f"Request: {request.method} {request.url}")
    print(f"Headers: {request.headers}")
    # Não tente ler o corpo aqui, deixe os handlers fazerem isso
    
    response = await call_next(request)
    return response
@app.get("/dashboard", tags=["Usuário"])
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_active_user)
):
    try:
        print(f"Usuário autenticado: {current_user.username}")
        
        # Filtrar por textos criados pelo usuário atual
        textos = db.query(models.TextoGerado).filter(
            models.TextoGerado.user_id == current_user.id
        ).all()
        print(f"Textos encontrados: {len(textos)}")
        
        # Filtrar por listas de exercícios criadas pelo usuário atual
        listas_exercicios = db.query(models.Avaliacao).filter(
            models.Avaliacao.user_id == current_user.id,
            models.Avaliacao.tipo == "exercicio"
        ).all()
        print(f"Listas de exercícios encontradas: {len(listas_exercicios)}")
        
        # Filtrar por avaliações criadas pelo usuário atual
        avaliacoes = db.query(models.Avaliacao).filter(
            models.Avaliacao.user_id == current_user.id,
            models.Avaliacao.tipo == "avaliacao"
        ).all()
        print(f"Avaliações encontradas: {len(avaliacoes)}")

        # Total de todos os materiais
        listas = listas_exercicios + avaliacoes
        
        # Dados de exportação
        exportacoes = 0
        
        # Para evitar erro em listas vazias
        num_exercicios = 0
        if listas:
            for lista in listas:
                if hasattr(lista, 'exercicios'):
                    num_exercicios += len(lista.exercicios)
        
        # Todos os materiais juntos para ordenação
        todos_materiais = textos + listas
        materiais_recentes = sorted(
            todos_materiais,
            key=lambda x: getattr(x, 'data_criacao', datetime.now()),
            reverse=True
        )[:5]
        
        materiais_formatados = []
        for m in materiais_recentes:
            if hasattr(m, 'tema'):  # É um TextoGerado
                item = {
                    "id": m.id,
                    "title": m.tema,
                    "type": "material",
                    "date": m.data_criacao,
                    "discipline": m.materia if hasattr(m, 'materia') else "Geral",
                    "content": m.conteudo if hasattr(m, 'conteudo') else None
                }
            else:  # É uma Avaliacao
                item = {
                    "id": m.id,
                    "title": m.titulo if hasattr(m, 'titulo') else f"Lista #{m.id}",
                    "type": "exercise" if m.tipo == "exercicio" else "assessment",
                    "date": m.data_criacao if hasattr(m, 'data_criacao') else None,
                    "discipline": "Geral"
                }
            materiais_formatados.append(item)

        return {
            "materiaisCriados": len(textos),
            "exercicios": num_exercicios,
            "avaliacoes": len(listas),
            "exportacoes": exportacoes,
            "materiaisRecentes": materiais_formatados
        }
    except Exception as e:
        print(f"Erro ao processar dashboard: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Erro ao processar dashboard: {str(e)}")
@app.get("/materiais", response_model=list[schemas.TextoGerado], tags=["Usuário"])
def listar_materiais(
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_active_user)
):
    # Filtrar por usuário logado
    return db.query(models.TextoGerado).filter(
        models.TextoGerado.user_id == current_user.id
    ).all()

@app.get("/listas-exercicios", response_model=list[schemas.ListaExercicios], tags=["Usuário"])
def listar_listas_exercicios(
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_active_user)
):
    # Filtrar por usuário logado e pelo tipo "exercicio"
    return db.query(models.Avaliacao).filter(
        models.Avaliacao.user_id == current_user.id,
        models.Avaliacao.tipo == "exercicio"
    ).all()

@app.get("/avaliacoes", response_model=list[schemas.ListaExercicios], tags=["Usuário"])
def listar_avaliacoes(
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_active_user)
):
    # Filtrar por usuário logado e pelo tipo "avaliacao"
    return db.query(models.Avaliacao).filter(
        models.Avaliacao.user_id == current_user.id,
        models.Avaliacao.tipo == "avaliacao"
    ).all()

@app.get("/textos-apoio/{texto_id}", response_model=schemas.TextoGerado, tags=["Visualização"])
def visualizar_texto(
    texto_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_active_user)
):
    """
    Retorna um texto específico para visualização.
    """
    texto = db.query(models.TextoGerado).filter(models.TextoGerado.id == texto_id).first()
    if not texto:
        raise HTTPException(status_code=404, detail="Texto não encontrado")
    
    # Verificar se o texto pertence ao usuário atual
    if texto.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Acesso não autorizado a este material")
    
    return texto

@app.delete("/materiais/{material_id}", tags=["Usuário"])
def excluir_material(
    material_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_active_user)
):
    # Verificar se o material existe e pertence ao usuário
    material = db.query(models.TextoGerado).filter(
        models.TextoGerado.id == material_id,
        models.TextoGerado.user_id == current_user.id
    ).first()
    
    if not material:
        raise HTTPException(status_code=404, detail="Material não encontrado ou não pertence a este usuário")
    
    # Excluir o material
    db.delete(material)
    db.commit()
    
    return {"message": "Material excluído com sucesso"}

@app.delete("/listas-exercicios/{lista_id}", tags=["Usuário"])
def excluir_lista_exercicios(
    lista_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_active_user)
):
    # Verificar se a lista existe e pertence ao usuário
    lista = db.query(models.Avaliacao).filter(
        models.Avaliacao.id == lista_id,
        models.Avaliacao.user_id == current_user.id,
        models.Avaliacao.tipo == "exercicio"  # Supondo que há um campo para diferenciar
    ).first()
    
    if not lista:
        raise HTTPException(status_code=404, detail="Lista de exercícios não encontrada ou não pertence a este usuário")
    
    # Excluir a lista
    db.delete(lista)
    db.commit()
    
    return {"message": "Lista de exercícios excluída com sucesso"}

@app.delete("/avaliacoes/{avaliacao_id}", tags=["Usuário"])
def excluir_avaliacao(
    avaliacao_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_active_user)
):
    # Verificar se a avaliação existe e pertence ao usuário
    avaliacao = db.query(models.Avaliacao).filter(
        models.Avaliacao.id == avaliacao_id,
        models.Avaliacao.user_id == current_user.id,
        models.Avaliacao.tipo == "avaliacao"  # Supondo que há um campo para diferenciar
    ).first()
    
    if not avaliacao:
        raise HTTPException(status_code=404, detail="Avaliação não encontrada ou não pertence a este usuário")
    
    # Excluir a avaliação
    db.delete(avaliacao)
    db.commit()
    
    return {"message": "Avaliação excluída com sucesso"}

# Adicione ou corrija estes endpoints:

@app.get("/textos-apoio/{texto_id}/exportar/{formato}", response_class=Response, tags=["Exportação"])
async def exportar_texto(
    texto_id: int,
    formato: str,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_active_user)
):
    """
    Exporta um texto de apoio para PDF ou DOCX.
    """
    try:
        # Verificar se o texto existe
        texto = db.query(models.TextoGerado).filter(
            models.TextoGerado.id == texto_id,
            models.TextoGerado.user_id == current_user.id
        ).first()
        
        if not texto:
            raise HTTPException(status_code=404, detail="Texto de apoio não encontrado")
            
        if formato.lower() == "pdf":
            # Usar o serviço de geração de PDF
            file_content = export_services.gerar_pdf_texto_apoio(texto)
            media_type = "application/pdf"
            filename = f"texto_apoio_{texto_id}.pdf"
        elif formato.lower() == "docx":
            # Usar o serviço de geração de DOCX
            file_content = export_services.gerar_docx_texto_apoio(texto)
            media_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            filename = f"texto_apoio_{texto_id}.docx"
        else:
            raise HTTPException(
                status_code=400, 
                detail="Formato de arquivo não suportado. Use 'pdf' ou 'docx'."
            )

        # Registrar a exportação no banco de dados
        try:
            crud.register_export(db, current_user.id, "texto", formato.lower())
        except Exception as e:
            print(f"Erro ao registrar exportação: {e}")
            
        # Retornar o arquivo gerado
        return Response(
            content=file_content.getvalue(),
            media_type=media_type,
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        logging.error(str(e), exc_info=True)
        print(f"Erro ao exportar texto: {e}")
        traceback.print_exc()
        raise HTTPException(
            status_code=500, 
            detail=f"Erro ao exportar texto: {str(e)}"
        )

@app.get("/listas-exercicios/{lista_id}/exportar/{formato}", response_class=Response, tags=["Exportação"])
async def exportar_lista_exercicios(
    lista_id: int,
    formato: str,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_active_user)
):
    """
    Exporta uma lista de exercícios ou avaliação para PDF ou DOCX.
    """
    try:
        # Verificar se a lista existe
        lista = db.query(models.Avaliacao).filter(
            models.Avaliacao.id == lista_id,
            models.Avaliacao.user_id == current_user.id
        ).first()
        
        if not lista:
            raise HTTPException(status_code=404, detail="Lista de exercícios não encontrada")
            
        # Carregar os exercícios
        db.refresh(lista)
            
        if formato.lower() == "pdf":
            # Usar o serviço de geração de PDF
            file_content = export_services.gerar_pdf_lista_exercicios(lista)
            media_type = "application/pdf"
            filename = f"lista_exercicios_{lista_id}.pdf"
        elif formato.lower() == "docx":
            # Usar o serviço de geração de DOCX
            file_content = export_services.gerar_docx_lista_exercicios(lista)
            media_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            filename = f"lista_exercicios_{lista_id}.docx"
        else:
            raise HTTPException(
                status_code=400, 
                detail="Formato de arquivo não suportado. Use 'pdf' ou 'docx'."
            )

        # Registrar a exportação no banco de dados
        try:
            crud.register_export(db, current_user.id, "exercicio", formato.lower())
        except Exception as e:
            print(f"Erro ao registrar exportação: {e}")
            
        # Retornar o arquivo gerado
        return Response(
            content=file_content.getvalue() if hasattr(file_content, 'getvalue') else file_content.read(),
            media_type=media_type,
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        logging.error(str(e), exc_info=True)
        print(f"Erro ao exportar lista de exercícios: {e}")
        traceback.print_exc()
        raise HTTPException(
            status_code=500, 
            detail=f"Erro ao exportar lista de exercícios: {str(e)}"
        )

@app.put("/materiais/{material_id}", response_model=schemas.TextoGerado, tags=["Materiais"])
def atualizar_material(
    material_id: int,
    material_update: schemas.TextoUpdateRequest,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_active_user)
):
    """
    Atualiza um texto de apoio existente.
    """
    # Verificar se o material existe e pertence ao usuário
    material = db.query(models.TextoGerado).filter(
        models.TextoGerado.id == material_id,
        models.TextoGerado.user_id == current_user.id
    ).first()
    
    if not material:
        raise HTTPException(status_code=404, detail="Material não encontrado ou não pertence a este usuário")
    
    # Atualizar campos
    if material_update.tema is not None:
        material.tema = material_update.tema
    if material_update.materia is not None:
        material.materia = material_update.materia
    if material_update.nivel is not None:
        material.nivel = material_update.nivel
    if material_update.conteudo is not None:
        material.conteudo = material_update.conteudo
    
    # Atualizar a data de modificação
    material.data_atualizacao = datetime.now()
    
    db.commit()
    db.refresh(material)
    return material

# Adicione este endpoint após os outros endpoints relacionados a materiais

@app.get("/materiais/{material_id}", response_model=schemas.TextoGerado, tags=["Materiais"])
def obter_material(
    material_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_active_user)
):
    """
    Recupera um texto de apoio específico pelo ID.
    """
    # Verificar se o material existe e pertence ao usuário
    material = db.query(models.TextoGerado).filter(
        models.TextoGerado.id == material_id,
        models.TextoGerado.user_id == current_user.id
    ).first()
    
    if not material:
        raise HTTPException(status_code=404, detail="Material não encontrado ou não pertence a este usuário")
    
    return material

@app.get("/listas-exercicios/{lista_id}", response_model=schemas.ListaExercicios, tags=["Visualização"])
def visualizar_lista_exercicios(
    lista_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_active_user)
):
    """
    Retorna uma lista de exercícios específica para visualização.
    """
    lista = db.query(models.Avaliacao).filter(models.Avaliacao.id == lista_id).first()
    if not lista:
        raise HTTPException(status_code=404, detail="Lista de exercícios não encontrada")
    
    # Verificar se a lista pertence ao usuário atual
    if lista.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Acesso não autorizado a este material")
    
    return lista