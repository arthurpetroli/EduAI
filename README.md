# EduAI

Plataforma educacional com IA para professores gerarem textos de apoio, listas de exercícios e avaliações personalizadas. Combina um backend **FastAPI** com um frontend **React + Chakra UI**, implantado no Railway (backend) e Vercel (frontend).

## Estrutura do Projeto

```
ProjetoFinal/
└── src/
    ├── back/                     # API FastAPI
    │   ├── main.py               # App FastAPI: rotas de geração, exportação e CORS
    │   ├── auth.py               # Autenticação JWT (OAuth2PasswordBearer)
    │   ├── security.py           # Hashing de senha e criação de tokens
    │   ├── crud.py               # Operações de banco de dados
    │   ├── models.py             # Modelos SQLAlchemy (User, TextoGerado, Avaliacao…)
    │   ├── schemas.py            # Schemas Pydantic para request/response
    │   ├── database.py           # Configuração SQLAlchemy via DATABASE_URL
    │   ├── export_services.py    # Exportação PDF/DOCX (reportlab + python-docx)
    │   └── requirements.txt      # Dependências Python
    └── front/                    # React + Vite + Chakra UI
        ├── pages/                # Home, Dashboard, Library, Login, Register…
        ├── components/           # Navbar, Footer, forms
        ├── services/             # Clientes Axios para a API
        ├── App.jsx               # Rotas e shell da aplicação
        └── main.jsx              # Ponto de entrada + tema Chakra
```

## Backend (FastAPI)

### Requisitos
- Python 3.10+
- Chave de API do Google Gemini (`GOOGLE_API_KEY`)
- PostgreSQL (produção) ou SQLite (desenvolvimento local)

### Configuração local

```bash
cd ProjetoFinal/src/back
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Crie um arquivo `.env` (nunca commite este arquivo):

```env
SECRET_KEY="uma-chave-secreta-longa"
GOOGLE_API_KEY="sua-chave-gemini"
DATABASE_URL="sqlite:///./eduai.db"
FRONTEND_URL="http://localhost:5173"   # Libera CORS para desenvolvimento local
```

Inicie a API:

```bash
uvicorn main:app --reload
# Disponível em http://localhost:8000
# Documentação interativa em http://localhost:8000/docs
```

### Variáveis de ambiente obrigatórias (produção)

| Variável | Descrição |
|---|---|
| `SECRET_KEY` | Chave para assinatura dos tokens JWT |
| `GOOGLE_API_KEY` | Chave da API do Google Gemini |
| `DATABASE_URL` | URL do banco PostgreSQL (Railway fornece automaticamente) |
| `FRONTEND_URL` | *(opcional)* Origem extra liberada no CORS — necessária apenas em dev local |

### Modelo de IA

O modelo configurado é **`gemini-3.1-flash-lite-preview`** (Google Gemini 3.1 Flash Lite), que oferece:
- 500 requisições por dia (RPD)
- 15 requisições por minuto (RPM)
- 250K tokens por minuto (TPM)

O backend implementa:
- **Cache por usuário** para textos de apoio (evita regerar conteúdo idêntico)
- **Retry com backoff exponencial** para erros 429 (quota) e 503 (indisponibilidade)

### Endpoints principais

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/` | Status da API |
| `POST` | `/auth/users/register` | Cadastro de usuário |
| `POST` | `/auth/token` | Login — retorna JWT |
| `GET` | `/auth/users/me` | Dados do usuário autenticado |
| `GET/POST` | `/auth/users/profile` | Perfil do usuário |
| `POST` | `/textos-apoio` | Gera texto de apoio (9 seções em Markdown) |
| `PUT` | `/textos-apoio/{id}` | Edita texto de apoio |
| `POST` | `/listas-exercicios` | Gera lista de exercícios com gabarito comentado |
| `POST` | `/avaliacoes` | Gera avaliação com distribuição de dificuldade |
| `GET` | `/materiais` | Lista materiais do usuário |
| `GET` | `/listas-exercicios` | Lista exercícios/avaliações do usuário |
| `GET` | `/listas-exercicios/{id}/exportar/{fmt}` | Exporta exercício em `pdf` ou `docx` |
| `GET` | `/textos-apoio/{id}/exportar/{fmt}` | Exporta texto em `pdf` ou `docx` |
| `GET` | `/dashboard` | Estatísticas agregadas do usuário |

Todas as rotas de geração, exportação e dashboard exigem `Authorization: Bearer <token>`.

## Frontend (React + Vite + Chakra UI)

### Requisitos
- Node.js 18+

### Configuração local

```bash
cd ProjetoFinal/src/front
npm install
```

Crie um arquivo `.env` no diretório do frontend:

```env
VITE_API_URL=http://localhost:8000
```

Sem este arquivo, o frontend aponta para a URL de produção do Railway automaticamente.

Inicie o servidor de desenvolvimento:

```bash
npm run dev
# Disponível em http://localhost:5173
```

### Páginas e rotas

| Rota | Página | Auth |
|---|---|---|
| `/` | Home — landing page | Não |
| `/login` | Login | Não |
| `/register` | Cadastro | Não |
| `/sobre` | Sobre a plataforma | Não |
| `/dashboard` | Dashboard do professor | Sim |
| `/generate-material` | Gerador de textos de apoio | Sim |
| `/create-exercises` | Criador de exercícios | Sim |
| `/create-assessment` | Criador de avaliações | Sim |
| `/library` | Biblioteca de materiais | Sim |
| `/profile` | Perfil do usuário | Sim |

### Serviços

| Arquivo | Função |
|---|---|
| `services/api.js` | Instância Axios com interceptor JWT. URL base via `VITE_API_URL` env var. |
| `authService.js` | Login, registro, logout, leitura do usuário atual |
| `contentService.js` | Geração de textos, exercícios e avaliações |
| `materialsService.js` | CRUD de materiais e exportação |
| `dashboardService.js` | Dados agregados para o dashboard |

## Execução local completa

```bash
# Terminal 1 — backend
cd ProjetoFinal/src/back
source venv/bin/activate
uvicorn main:app --reload

# Terminal 2 — frontend
cd ProjetoFinal/src/front
npm run dev
```

Acesse `http://localhost:5173` e crie uma conta antes de gerar materiais.

## Implantação

### Backend — Railway
1. Conecte o repositório ao Railway.
2. Configure as variáveis de ambiente: `SECRET_KEY`, `GOOGLE_API_KEY`, `DATABASE_URL` (o Railway PostgreSQL fornece a URL automaticamente ao adicionar o serviço de banco).
3. O comando de start deve ser: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Frontend — Vercel
1. Conecte o repositório ao Vercel apontando para `ProjetoFinal/src/front`.
2. **Não defina `VITE_API_URL`** nas variáveis do Vercel — o fallback para a URL de produção do Railway é usado automaticamente.
3. O arquivo `vercel.json` já está configurado com o rewrite para SPA.

## Solução de problemas

| Problema | Causa provável | Solução |
|---|---|---|
| `SECRET_KEY não definida` | Arquivo `.env` ausente ou com typo | Verifique o `.env` no diretório `back/` |
| `GOOGLE_API_KEY não definida` | Chave não configurada | Adicione ao `.env` ou variáveis do Railway |
| `DATABASE_URL não definida` | Banco não configurado | Use `sqlite:///./eduai.db` localmente |
| Erro 503 da API Gemini | Alta demanda temporária | O backend tenta automaticamente até 3 vezes com backoff |
| CORS bloqueado localmente | `FRONTEND_URL` não definida | Adicione `FRONTEND_URL=http://localhost:5173` ao `.env` do backend |
| 401 no frontend | Token expirado | Faça logout e login novamente |

## Scripts úteis

```bash
# Backend
uvicorn main:app --reload        # Desenvolvimento
pytest                           # Testes

# Frontend
npm run dev                      # Desenvolvimento
npm run build                    # Build de produção
npm run preview                  # Preview do build
npm run lint                     # Lint
```

## Licença

[MIT License](https://opensource.org/licenses/MIT)
