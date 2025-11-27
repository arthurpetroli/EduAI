# EduAI (Projeto Final)

Plataforma educacional que utiliza IA para gerar textos de apoio, listas de exercícios e avaliações personalizadas. O projeto está dentro de `ProjetoFinal/src` e combina um backend em **FastAPI** com um frontend em **React (Vite + Chakra UI)**, preparado para execução local ou implantação em serviços como Railway e Vercel.

## Estrutura do Projeto

```
ProjetoFinal/
├── public/                       # Arquivos estáticos do frontend (favicons, manifest, fontes)
└── src/
    ├── back/                     # API FastAPI + integração Gemini
    │   ├── main.py               # Instancia FastAPI, CORS, rotas de geração e exportação
    │   ├── auth.py               # Rotas de autenticação, criação/validação de JWT
    │   ├── security.py           # Helpers de senha/JWT (OAuth2PasswordBearer, hashing)
    │   ├── crud.py               # Operações de banco (usuários, textos, exercícios, avaliações)
    │   ├── models.py             # Modelos SQLAlchemy (User, Perfil, TextoGerado, ListaExercicios)
    │   ├── schemas.py            # Modelos Pydantic para requests/responses
    │   ├── database.py           # Configuração do SQLAlchemy + leitura de `DATABASE_URL`
    │   ├── export_services.py    # Exportação para PDF/DOCX via reportlab e python-docx
    │   ├── fix_exercise_type.py  # Utilitário para corrigir tipos de exercícios salvos
    │   ├── requirements.txt      # Dependências do backend
    │   └── app.log               # Gerado em runtime: logs de erros
    └── front/                    # Aplicação React
        ├── App.jsx / App.css     # Shell da aplicação (tema Chakra + rotas)
        ├── main.jsx              # Ponto de entrada Vite
        ├── pages/                # Páginas principais (Home, Dashboard, Library, Login, Register, etc.)
        ├── components/           # Navbar, Footer, Login/Register forms
        ├── services/             # Clientes Axios (api.js) e serviços de autenticação/conteúdo
        ├── assets/               # Imagens e SVGs utilizados no layout
        ├── index.html            # Template HTML do Vite
        ├── package.json          # Scripts e dependências do frontend
        └── vite.config.js        # Configuração de build
```

## Principais Funcionalidades
- **Geração assistida por IA** com Google Gemini 2.5 Flash para textos de apoio, listas de exercícios e avaliações.
- **Exportação** de materiais em PDF ou DOCX.
- **Autenticação JWT** com cadastro, login, recuperação do perfil e proteção das rotas de geração.
- **Persistência** de textos e exercícios/avaliações em banco PostgreSQL (ou outro dialeto compatível com SQLAlchemy).
- **UI responsiva** em React + Chakra UI com páginas de login, dashboard, biblioteca e construtores de materiais.

## Backend (FastAPI)

### Requisitos
- Python 3.10+
- PostgreSQL (padrão) ou SQLite (ajuste `DATABASE_URL`)
- Chave de API do Google Generative AI (`GOOGLE_API_KEY`)

### Configuração
1. Acesse o diretório do backend:
   ```bash
   cd ProjetoFinal/src/back
   ```
2. (Opcional) Crie e ative um ambiente virtual:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # Windows: .venv\Scripts\activate
   ```
3. Instale dependências:
   ```bash
   pip install -r requirements.txt
   ```
4. Crie um arquivo `.env` (no mesmo diretório) com as variáveis:
   ```bash
   SECRET_KEY="sua-chave-secreta"            # Assinatura do JWT
   GOOGLE_API_KEY="sua-chave-gemini"         # Necessária para as rotas de geração
   DATABASE_URL="postgresql://user:senha@host:porta/banco"  # Opcional: usa padrão do Railway se vazio
   ```
5. Inicie a API:
   ```bash
   uvicorn main:app --reload
   ```
   Por padrão, a API roda em `http://localhost:8000`.

### Endpoints principais
- `GET /` — Status da API.
- `POST /auth/users/register` — Criação de usuário.
- `POST /auth/token` — Login (OAuth2 password flow) e obtenção de JWT.
- `GET /auth/users/me` — Dados do usuário autenticado.
- `GET/POST /auth/users/profile` — Consulta/atualização de perfil.
- `POST /textos-apoio` — Gera texto de apoio (Markdown estruturado) e persiste em `TextoGerado`.
- `POST /listas-exercicios` — Gera lista de exercícios e salva em `ListaExercicios` (tipo "exercicio").
- `POST /avaliacoes` — Gera avaliação com distribuição de dificuldade e salva em `ListaExercicios` (tipo "avaliacao").
- `POST /exportar/pdf` e `POST /exportar/docx` — Exporta materiais em PDF ou DOCX.

Todas as rotas de geração/exportação exigem `Authorization: Bearer <token>`.

### Notas sobre CORS e Gemini
- As origens liberadas estão em `main.py` (`https://edu-ai-drab.vercel.app`, `https://eduai-production-afcf.up.railway.app`). Ajuste `allow_origins` se for usar domínios diferentes em desenvolvimento.
- O modelo Gemini configurado é `gemini-2.5-flash`. Sem `GOOGLE_API_KEY` a API não inicia.

## Frontend (React + Vite + Chakra UI)

### Requisitos
- Node.js 18+

### Configuração
1. Acesse o diretório do frontend:
   ```bash
   cd ProjetoFinal/src/front
   ```
2. Instale dependências:
   ```bash
   npm install
   ```
3. Ajuste o endpoint da API em `services/api.js` caso rode a API localmente:
   ```js
   const API_URL = 'http://localhost:8000';
   ```
4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
   A aplicação fica em `http://localhost:5173`.

### Páginas e fluxos principais
- **Home/About:** apresentação do produto.
- **Register/Login:** cria e autentica usuários; tokens são salvos no `localStorage` via `authService.js`.
- **Dashboard:** visão geral de conteúdos gerados e atalhos para criação.
- **MaterialGenerator / ExerciseBuilder / AssessmentCreator:** formulários que consomem as rotas `/textos-apoio`, `/listas-exercicios` e `/avaliacoes`.
- **MaterialsLibrary:** lista materiais salvos, com botões de exportação.
- **UserProfile:** permite visualizar/atualizar dados do perfil autenticado.

### Serviços
- `services/api.js`: instancia Axios com interceptor para anexar o JWT.
- `authService.js`: login, registro e recuperação de usuário atual.
- `contentService.js`: chamadas de geração (textos, exercícios, avaliações).
- `materialsService.js`: recuperação/exportação de materiais salvos.
- `dashboardService.js`: dados agregados para o dashboard.

## Execução simultânea (dev)
1. Inicie o backend em `ProjetoFinal/src/back` com `uvicorn main:app --reload`.
2. Em outro terminal, inicie o frontend em `ProjetoFinal/src/front` com `npm run dev` (ajuste `API_URL` para `http://localhost:8000`).
3. Acesse `http://localhost:5173` e use o fluxo de cadastro/login antes de gerar materiais.

## Implantação
- **Backend:** pode ser implantado em Railway/Render/Heroku; defina `GOOGLE_API_KEY`, `SECRET_KEY` e `DATABASE_URL` nas variáveis de ambiente e abra a porta do `uvicorn` configurada pelo provedor.
- **Frontend:** pronto para deploy no Vercel/Netlify. Configure a variável de ambiente (ou substitua em build) para apontar `API_URL` para o domínio público da API.
- Ajuste as origens CORS no backend para incluir o domínio público do frontend.

## Solução de problemas
- **API não inicia por falta de chave:** verifique `GOOGLE_API_KEY` no `.env`.
- **Erro de banco:** confirme `DATABASE_URL` e se o usuário possui permissões de criação de tabelas; por padrão, `models.Base.metadata.create_all` cria as tabelas na inicialização.
- **403/401 no frontend:** assegure que o token JWT está presente em `localStorage` e que a base URL da API está correta.
- **CORS bloqueado:** adicione a origem do frontend em `allow_origins` no `main.py`.

## Scripts úteis
- **Backend:** `uvicorn main:app --reload` (desenvolvimento), `pytest` (quando testes existirem).
- **Frontend:** `npm run dev`, `npm run build`, `npm run preview`, `npm run lint`.

## Licença
Projeto licenciado sob a [MIT License](https://opensource.org/licenses/MIT).
