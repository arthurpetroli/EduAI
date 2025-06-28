# EduAI

## Relatório Técnico Final

### Visão Geral

O **EduAI** é uma plataforma educacional que utiliza inteligência artificial para facilitar a criação, gestão e distribuição de materiais didáticos, avaliações e conteúdos personalizados. O sistema foi desenvolvido com uma arquitetura moderna, utilizando **FastAPI** no backend e **React** no frontend, proporcionando uma experiência eficiente para professores e alunos.

---

## Explicação Geral do Código

O projeto EduAI está dividido em duas principais partes: **frontend** e **backend**.

### Backend

O backend, desenvolvido em Python com FastAPI, é responsável por toda a lógica de negócio, autenticação, integração com a inteligência artificial (Google Gemini) e exportação de documentos. Ele expõe uma API RESTful que permite ao frontend criar, consultar, editar e excluir materiais didáticos, listas de exercícios e avaliações.  
Principais módulos do backend:
- **models/**: define os modelos de dados e tabelas do banco (SQLAlchemy).
- **schemas/**: define os formatos de entrada e saída das requisições (Pydantic).
- **routes/**: implementa os endpoints da API.
- **services/**: lógica de integração com IA e exportação de arquivos.
- **auth/**: autenticação e autorização via JWT.

### Frontend

O frontend, desenvolvido em React com Vite e Chakra UI, é responsável pela interface do usuário. Ele consome a API do backend para exibir, criar e gerenciar os materiais.  
Principais módulos do frontend:
- **components/**: componentes reutilizáveis da interface.
- **pages/**: páginas principais do sistema (login, dashboard, biblioteca, etc).
- **services/**: funções para comunicação com a API.
- **assets/**: imagens e arquivos estáticos.

### Fluxo Geral

1. O usuário acessa a interface web, faz login e navega pelas funcionalidades.
2. Ao solicitar a geração de um material, o frontend envia os dados para o backend.
3. O backend processa a requisição, utiliza a IA para gerar o conteúdo e armazena no banco de dados.
4. O usuário pode visualizar, editar, exportar ou excluir os materiais criados.
5. Todas as operações são protegidas por autenticação JWT.

Essa arquitetura permite escalabilidade, segurança e facilidade de manutenção.

---

## 1. Detalhamento Técnico

### 1.1 Arquitetura

- **Frontend:**  
  - React (Vite)
  - Chakra UI para componentes visuais
  - Integração via REST API com backend
  - Funcionalidades: geração de materiais, listas de exercícios, avaliações, exportação (PDF/DOCX), biblioteca de materiais, autenticação JWT

- **Backend:**  
  - Python 3.10+  
  - FastAPI  
  - SQLAlchemy (ORM)  
  - Banco de dados: PostgreSQL (Railway)  
  - Integração com Google Generative AI (Gemini) para geração de conteúdo  
  - Exportação de documentos usando ReportLab (PDF) e python-docx (DOCX)  
  - Autenticação JWT  
  - Endpoints RESTful para CRUD de usuários, materiais, listas e avaliações

- **Infraestrutura:**  
  - Deploy do frontend: Vercel  
  - Deploy do backend: Railway  
  - Variáveis sensíveis via `.env`  
  - CORS configurado para integração segura entre frontend e backend

### 1.2 Estrutura de Diretórios

```
ProjetoFinal/
├── src/
│   ├── back/        # Backend (API FastAPI, modelos, schemas, exportação)
│   └── front/       # Frontend (React, componentes, páginas, serviços)
│       ├── assets/      # Imagens e SVGs
│       ├── components/  # Componentes reutilizáveis
│       ├── pages/       # Páginas principais
│       └── services/    # Serviços de integração com API
├── public/          # Arquivos públicos do frontend
├── index.html       # HTML principal do frontend
├── package.json     # Configurações do frontend
├── vite.config.js   # Configuração do Vite
└── ...
```

### 1.3 Principais Funcionalidades

- Autenticação de usuários (login, registro, perfil)
- Geração automática de textos de apoio e listas de exercícios via IA
- Criação e gerenciamento de avaliações
- Biblioteca pessoal de materiais
- Exportação de materiais em PDF e DOCX
- Dashboard com estatísticas do usuário
- Interface responsiva e moderna

### 1.4 Tecnologias Utilizadas

- **Frontend:** React, Vite, Chakra UI, Axios
- **Backend:** FastAPI, SQLAlchemy, Pydantic, python-docx, ReportLab, Google Generative AI
- **Banco de Dados:** PostgreSQL (Railway)
- **Deploy:** Vercel (frontend), Railway (backend)

---

## 2. Divisão de Papéis

- **Deivid e Petroli:**  
  - Desenvolvimento do frontend (React)
  - Integração frontend-backend (API REST)
  - Testes de usabilidade e interface

- **Ale:**  
  - Desenvolvimento do backend (FastAPI)
  - Modelagem do banco de dados e ORM
  - Implementação da integração com IA (Google Generative AI)
  - Lógica de exportação de documentos (PDF/DOCX)

- **Petroli:**
   - Publicação do frontend (Vercel)
   - Publicação do backend (Railway)
   - Mudança de banco para PostgreSQL
---

## 3. Referências

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [Chakra UI](https://chakra-ui.com/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [python-docx Documentation](https://python-docx.readthedocs.io/en/latest/)
- [ReportLab User Guide](https://www.reportlab.com/docs/reportlab-userguide.pdf)
- [Google Generative AI](https://ai.google.dev/)
- [Vercel](https://vercel.com/)
- [Railway](https://railway.app/)

---

## 4. Instalação e Execução

### Pré-requisitos

- Node.js (recomendado: versão 18+)
- Python 3.10+

### Backend (API)

1. Acesse o diretório do backend:
   ```bash
   cd ProjetoFinal/src/back
   ```
2. Instale as dependências:
   ```bash
   pip install -r requirements.txt
   ```
3. Configure o arquivo `.env` com as variáveis necessárias.
4. Execute o servidor FastAPI:
   ```bash
   uvicorn main:app --reload
   ```
   O backend estará disponível em `http://localhost:8000`.

### Frontend (Web)

1. Acesse o diretório do frontend:
   ```bash
   cd ProjetoFinal/src/front
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
   O frontend estará disponível em `http://localhost:5173`.


### Site (Deploy)

1. Acesse o site do projeto: [EduAI](https://edu-ai-drab.vercel.app/)
2. Faça login com as credenciais desejadas e explore as funcionalidades disponíveis.
3. Segue video demonstrativo: [Vídeo](https://youtu.be/fMDOiGlW-8Q)

---

## 5. Licença

Este projeto está sob a licença MIT.

---