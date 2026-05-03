import os
import time
from fastapi import FastAPI, Depends, HTTPException, Path, Request
from sqlalchemy.orm import Session
from google import genai
from google.genai import types
from fastapi.responses import Response
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import traceback
import logging

import models
import schemas
import crud
import export_services
from database import engine
from auth import router as auth_router, get_current_active_user, get_db

# Configuração de logging mais detalhada
logging.basicConfig(
    filename='app.log',
    level=logging.ERROR,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

load_dotenv()
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="API de Geração de Conteúdo Educacional",
    description="Gere textos de apoio, listas de exercícios e exporte em DOCX ou PDF.",
    version="2.0.0"
)

allowed_origins = [
    "https://edu-ai-drab.vercel.app",
    "https://eduai-production-afcf.up.railway.app",
]
extra_origin = os.getenv("FRONTEND_URL")
if extra_origin:
    allowed_origins.append(extra_origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    raise RuntimeError("A variável de ambiente GOOGLE_API_KEY não foi definida.")

MODEL_NAME = "gemini-3.1-flash-lite-preview"
gemini_client = genai.Client(api_key=api_key)

def get_genai_client():
    return gemini_client


def generate_with_retry(client, prompt, config=None, max_retries=3):
    for attempt in range(max_retries):
        try:
            return client.models.generate_content(
                model=MODEL_NAME,
                contents=prompt,
                config=config,
            )
        except Exception as e:
            err = str(e)
            is_retryable = (
                "429" in err or "quota" in err.lower() or "resource_exhausted" in err.lower()
                or "503" in err or "unavailable" in err.lower()
            )
            if is_retryable and attempt < max_retries - 1:
                wait = 2 ** attempt
                logging.warning(f"Gemini indisponível (tentativa {attempt + 1}/{max_retries}). Aguardando {wait}s...")
                time.sleep(wait)
                continue
            raise
    raise RuntimeError("Limite de tentativas da API Gemini atingido")


app.include_router(auth_router, prefix="/auth")

@app.get("/", tags=["Status"])
def read_root():
    return {"message": "Bem-vindo à API de Geração de Conteúdo v2.0!"}


@app.post("/textos-apoio", response_model=schemas.TextoGerado, tags=["Geração"])
def gerar_texto_de_apoio(
    request: schemas.GeracaoTextoRequest,
    db: Session = Depends(get_db),
    client: genai.Client = Depends(get_genai_client),
    current_user: schemas.User = Depends(get_current_active_user)
):
    """
    Gera um texto de apoio ou resumo sobre um tópico específico.
    """
    try:
        tema = f"{request.topico} ({request.materia} - {request.nivel})"

        cached = db.query(models.TextoGerado).filter(
            models.TextoGerado.user_id == current_user.id,
            models.TextoGerado.tema == tema
        ).first()
        if cached:
            return cached

        nivel_instrucao = {
            "Fundamental": "Use linguagem simples, analogias do cotidiano e exemplos concretos. Evite jargão técnico sem explicação imediata.",
            "Médio": "Equilibre teoria e prática. Apresente vocabulário técnico sempre acompanhado de explicação. Inclua conexões entre disciplinas.",
            "Superior": "Adote rigor conceitual. Cite correntes teóricas ou pesquisas relevantes. Estimule leitura crítica e reflexão.",
        }.get(request.nivel, f"Adapte ao nível {request.nivel}.")

        area_instrucao = {
            "Matemática": "Inclua ≥2 fórmulas com demonstração e ≥3 exemplos numéricos resolvidos passo a passo.",
            "Física": "Inclua ≥2 fórmulas com demonstração e ≥3 exercícios numéricos resolvidos. Relacione com fenômenos observáveis.",
            "Química": "Inclua ≥2 equações ou fórmulas explicadas e exemplos de reações ou cálculos estequiométricos.",
            "História": "Organize uma linha do tempo clara. Apresente causas, consequências e múltiplas perspectivas históricas.",
            "Geografia": "Use dados, mapas descritivos e relações entre espaço, sociedade e ambiente.",
            "Biologia": "Use analogias para abstrações. Apresente classificações hierárquicas e relações causa-efeito nos sistemas vivos.",
            "Literatura": "Inclua trechos ou exemplos de obras. Compare estilos, períodos ou autores.",
            "Português": "Apresente exemplos contrastantes de uso. Explique regras com exceções e contextualização histórica da língua.",
        }.get(request.materia, "Apresente exemplos práticos e contextualizados à disciplina.")

        prompt = f"""Você é um especialista em pedagogia e em {request.materia}. Elabore um texto de apoio didático completo e aprofundado sobre "{request.topico}" para professores do ensino {request.nivel} usarem diretamente em sala de aula.

NÍVEL: {nivel_instrucao}
ÁREA: {area_instrucao}

ESTRUTURA OBRIGATÓRIA em Markdown (use exatamente estes subtítulos ##):

## 1. Objetivos de Aprendizagem
Liste 3–4 objetivos claros e mensuráveis usando verbos de ação (identificar, calcular, comparar, explicar, analisar, aplicar). O que o aluno deve ser capaz de fazer ao final da aula.

## 2. Introdução
Contextualize o tema com uma situação-problema ou pergunta motivadora que desperte curiosidade. Conecte ao conhecimento prévio do aluno.

## 3. Fundamentos
Explique os conceitos essenciais com rigor; termos centrais em **negrito**, secundários em *itálico*. 2–3 parágrafos densos e estruturados.

## 4. Aprofundamento
Desenvolva o conteúdo com detalhes, dados, derivações ou análises conforme a área. Relacione subtemas entre si e mostre a lógica interna do conteúdo.

## 5. Exemplos e Aplicações
Mínimo 3 situações reais ou do cotidiano onde o conteúdo aparece. Para ciências exatas: resolva ao menos 2 problemas numéricos passo a passo com explicação de cada etapa.

## 6. Erros Comuns e Pontos de Atenção
Liste 3–5 equívocos frequentes de estudantes neste tópico. Para cada um: descreva o erro, explique por que ocorre e como corrigi-lo.

## 7. Resumo
Sintetize os pontos-chave em até 8 tópicos numerados. Inclua as definições e fórmulas mais importantes.

## 8. Conexões Interdisciplinares
Relacione com outras disciplinas, temas do currículo ou competências gerais da BNCC.

## 9. Sugestões Didáticas para o Professor
2–3 estratégias práticas de ensino para este tópico (experimento simples, dinâmica de grupo, debate, problema aberto, mapa mental, etc.). Indique o tempo estimado de cada estratégia.

FORMATO:
- Markdown estrito: ## para seções, **negrito**, *itálico*, listas `-` e `1.`
- 2–3 parágrafos por seção, separados por linha em branco
- Garantia absoluta de precisão factual — nenhum erro conceitual é aceitável"""

        response = generate_with_retry(
            client,
            prompt,
            config=types.GenerateContentConfig(
                max_output_tokens=6144,
                thinking_config=types.ThinkingConfig(thinking_budget=16384),
            ),
        )

        # Limpa possíveis blocos de código da resposta da IA
        cleaned_response = response.text.strip().replace("```markdown", "").replace("```", "").strip()

        # Criação do texto gerado
        db_texto = models.TextoGerado(
            tema=tema, 
            conteudo=cleaned_response,
            materia=request.materia,
            nivel=request.nivel,
            user_id=current_user.id
        )
        
        db.add(db_texto)
        db.commit()
        db.refresh(db_texto)
        
        return db_texto
    except Exception as e:
        error_location = f"Erro em gerar_texto_de_apoio: {str(e)}"
        logging.error(error_location, exc_info=True)
        raise HTTPException(status_code=500, detail=error_location)

@app.post("/listas-exercicios", response_model=schemas.ListaExercicios, tags=["Geração"])
def gerar_lista_exercicios(
    request: schemas.GeracaoListaExerciciosRequest,
    db: Session = Depends(get_db),
    client: genai.Client = Depends(get_genai_client),
    current_user: schemas.User = Depends(get_current_active_user)
):
    """
    Gera uma lista de exercícios sobre um tópico específico.
    """
    try:
        tipo = request.tipo_exercicio.lower()
        if "múltipla" in tipo or "multipla" in tipo:
            tipo_instrucao = (
                'Todas as questões devem ser de MÚLTIPLA ESCOLHA (tipo="multipla_escolha"). '
                '5 alternativas A–E; somente 1 correta; os 4 distratores devem ser erros conceituais plausíveis — nunca respostas óbvias ou absurdas. '
                'resposta_correta = letra correta seguida de "—" e explicação curta de por que está correta (ex: "B — O calor específico da água é alto porque...").'
            )
            formato_exemplo = (
                '{"enunciado": "[Médio] texto da questão", "tipo": "multipla_escolha", '
                '"opcoes": {"A": "...", "B": "...", "C": "...", "D": "...", "E": "..."}, '
                '"resposta_correta": "B — explicação de por que B é correto"}'
            )
        elif "dissertat" in tipo:
            tipo_instrucao = (
                'Todas as questões devem ser DISSERTATIVAS (tipo="dissertativa", opcoes=null). '
                'O enunciado deve exigir análise, comparação ou aplicação — nunca apenas definição. '
                'resposta_correta deve conter: (1) resposta modelo completa e (2) critérios de correção numerados.'
            )
            formato_exemplo = (
                '{"enunciado": "[Médio] texto da questão", "tipo": "dissertativa", '
                '"opcoes": null, "resposta_correta": "Resposta modelo: [...]. Critérios: 1) [...] 2) [...]"}'
            )
        else:
            tipo_instrucao = (
                'Alterne entre múltipla escolha e dissertativa. '
                'Múltipla escolha: tipo="multipla_escolha", 5 alternativas A–E, distratores plausíveis, resposta_correta = "letra — explicação". '
                'Dissertativa: tipo="dissertativa", opcoes=null, resposta_correta com resposta modelo e critérios de correção numerados.'
            )
            formato_exemplo = (
                '{"enunciado": "[Fácil] texto da questão", "tipo": "multipla_escolha", '
                '"opcoes": {"A": "...", "B": "...", "C": "...", "D": "...", "E": "..."}, '
                '"resposta_correta": "A — explicação de por que A é correto"}'
            )

        prompt = f"""Você é um professor experiente de {request.materia} no ensino {request.nivel}.
Crie {request.quantidade_exercicios} exercícios sobre "{request.topico}" com gabarito comentado.

TIPO: {tipo_instrucao}

DISTRIBUIÇÃO DE DIFICULDADE:
- Prefixe cada enunciado com o nível entre colchetes: [Fácil], [Médio] ou [Difícil]
- ~40% Fácil: aplicação direta de 1 conceito básico
- ~40% Médio: relação entre 2 conceitos ou 2–3 passos de raciocínio
- ~20% Difícil: integração de múltiplos conceitos; análise ou caso não trivial

QUALIDADE OBRIGATÓRIA:
- Questões devem testar compreensão, análise e aplicação — não apenas memorização
- Enunciados claros, precisos e sem ambiguidade
- Todas as respostas devem ser factualmente corretas
- Vocabulário e complexidade adequados ao nível {request.nivel}
- Para múltipla escolha: os distratores errados devem representar equívocos conceituais reais que estudantes cometem

Retorne SOMENTE JSON válido, sem nenhum texto antes ou depois:
{{
  "exercicios": [
    {formato_exemplo}
  ]
}}"""

        response = generate_with_retry(
            client,
            prompt,
            config=types.GenerateContentConfig(
                max_output_tokens=6144,
                thinking_config=types.ThinkingConfig(thinking_budget=4096),
            ),
        )

        cleaned_ia_response = response.text.strip().replace("```json", "").replace("```", "").strip()

        return crud.create_lista_exercicios(
            db=db, 
            request=request, 
            dados_ia=cleaned_ia_response, 
            user_id=current_user.id,
            tipo="exercicio"
        )
        
    except Exception as e:
        error_location = f"Erro em gerar_lista_exercicios: {str(e)}"
        logging.error(error_location, exc_info=True)
        raise HTTPException(status_code=500, detail=error_location)


@app.post("/avaliacoes", response_model=schemas.ListaExercicios, tags=["Geração"])
def gerar_avaliacao(
    request: schemas.GeracaoAvaliacaoRequest,
    db: Session = Depends(get_db),
    client: genai.Client = Depends(get_genai_client),
    current_user: schemas.User = Depends(get_current_active_user)
):
    try:
        n = request.quantidade_exercicios
        n_facil = int(n * 0.5)
        n_medio = int(n * 0.3)
        n_dificil = n - n_facil - n_medio
        n_mc = int(n * 0.8)
        n_essay = n - n_mc

        prompt = f"""Você é um professor experiente e avaliador pedagógico de {request.materia} no ensino {request.nivel}.
Crie uma avaliação formal com exatamente {n} questões sobre "{request.topico}" com gabarito comentado.

DISTRIBUIÇÃO OBRIGATÓRIA — gere exatamente {n} questões:
- {n_facil} FÁCEIS: prefixe o enunciado com [Fácil] — aplicação direta de 1 conceito básico; vocabulário simples
- {n_medio} MÉDIAS: prefixe com [Médio] — relação entre 2 conceitos; 2–3 passos de raciocínio
- {n_dificil} DIFÍCEIS: prefixe com [Difícil] — múltiplos conceitos integrados; análise aprofundada; situações não triviais

FORMATO DAS QUESTÕES:
- {n_mc} de MÚLTIPLA ESCOLHA (tipo="multipla_escolha"):
  * 5 alternativas A–E; somente 1 correta
  * Os 4 distratores devem ser erros conceituais plausíveis que estudantes realmente cometem — nunca respostas absurdas
  * resposta_correta = "letra — explicação objetiva de por que está correta e por que as demais não estão"
- {n_essay} DISSERTATIVAS (tipo="dissertativa", opcoes=null):
  * Enunciado que exija análise, comparação, aplicação ou síntese — nunca apenas definição
  * resposta_correta deve conter: resposta modelo completa + critérios de correção numerados com pontuação sugerida

Distribua as {n_essay} dissertativas proporcionalmente entre os três níveis de dificuldade.

QUALIDADE PEDAGÓGICA:
- Todas as questões devem testar compreensão real e capacidade de aplicação — não memorização
- Garanta precisão factual absoluta em enunciados e gabaritos
- As questões devem ser adequadas para uma avaliação formal do nível {request.nivel}
- Cubra diferentes aspectos e subtópicos de "{request.topico}"

Retorne SOMENTE JSON válido, sem nenhum texto antes ou depois:
{{
  "exercicios": [
    {{
      "enunciado": "[Fácil] texto da questão de múltipla escolha",
      "tipo": "multipla_escolha",
      "opcoes": {{"A": "...", "B": "...", "C": "...", "D": "...", "E": "..."}},
      "resposta_correta": "B — explicação de por que B está correto e as outras alternativas não"
    }},
    {{
      "enunciado": "[Médio] texto da questão dissertativa",
      "tipo": "dissertativa",
      "opcoes": null,
      "resposta_correta": "Resposta modelo: [...]. Critérios de correção: 1) [...] (X pts) 2) [...] (Y pts)"
    }}
  ]
}}"""

        response = generate_with_retry(
            client,
            prompt,
            config=types.GenerateContentConfig(
                max_output_tokens=10240,
                thinking_config=types.ThinkingConfig(thinking_budget=16384),
                safety_settings=[
                    types.SafetySetting(category="HARM_CATEGORY_HARASSMENT", threshold="BLOCK_MEDIUM_AND_ABOVE"),
                    types.SafetySetting(category="HARM_CATEGORY_HATE_SPEECH", threshold="BLOCK_MEDIUM_AND_ABOVE"),
                    types.SafetySetting(category="HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold="BLOCK_MEDIUM_AND_ABOVE"),
                    types.SafetySetting(category="HARM_CATEGORY_DANGEROUS_CONTENT", threshold="BLOCK_MEDIUM_AND_ABOVE"),
                ],
            ),
        )

        cleaned_ia_response = response.text.strip().replace("```json", "").replace("```", "").strip()

        return crud.create_lista_exercicios(
            db=db,
            request=request,
            dados_ia=cleaned_ia_response,
            user_id=current_user.id,
            tipo="avaliacao"
        )

    except Exception as e:
        error_location = f"Erro em gerar_avaliacao: {str(e)}"
        logging.error(error_location, exc_info=True)
        raise HTTPException(status_code=500, detail=error_location)

@app.middleware("http")
async def log_requests(request, call_next):
    print(f"Request: {request.method} {request.url}")
    print(f"Headers: {request.headers}")
    # Não tente ler o corpo aqui, deixe os handlers fazerem isso
    
    response = await call_next(request)
    return response

def to_naive(dt):
    """Converte um datetime para formato sem timezone (naive)"""
    if dt is None:
        return datetime.now()
    if hasattr(dt, 'tzinfo') and dt.tzinfo is not None:
        return dt.replace(tzinfo=None)
    return dt

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
            key=lambda x: to_naive(getattr(x, 'data_criacao', None)),
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