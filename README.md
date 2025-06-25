# EduAI

## Visão Geral
O EduAI é uma plataforma educacional que utiliza inteligência artificial para facilitar a criação, gestão e distribuição de materiais didáticos, avaliações e conteúdos personalizados. O sistema possui uma arquitetura moderna, com backend em Python (FastAPI) e frontend em React, proporcionando uma experiência interativa e eficiente para professores e alunos.

## Tecnologias Utilizadas
- **Frontend:** React, Vite, JavaScript, CSS
- **Backend:** Python, FastAPI, SQLite
- **Outros:** ESLint, SVG Assets

## Funcionalidades Principais
- Autenticação de usuários (login e registro)
- Criação e gerenciamento de avaliações
- Geração e biblioteca de materiais didáticos
- Dashboard com informações do usuário
- Exportação de dados e relatórios
- Interface responsiva e moderna

## Instalação e Execução

### Pré-requisitos
- Node.js (recomendado: versão 18+)
- Python 3.10+

### Backend (API)
1. Acesse o diretório do backend:
   ```bash
   cd ProjetoFinal/src/back
   ```
2. Instale as dependências necessárias (recomenda-se uso de ambiente virtual):
   ```bash
   pip install fastapi uvicorn sqlalchemy pydantic
   ```
3. Execute o servidor FastAPI:
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

## Estrutura dos Diretórios
```
ProjetoFinal/
├── src/
│   ├── back/        # Backend (API FastAPI, banco de dados, modelos, schemas)
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

## Contribuição
Contribuições são bem-vindas! Para contribuir:
1. Faça um fork do repositório
2. Crie uma branch para sua feature ou correção (`git checkout -b minha-feature`)
3. Commit suas alterações (`git commit -m 'Minha contribuição'`)
4. Faça push para a branch (`git push origin minha-feature`)
5. Abra um Pull Request

## Licença
Este projeto está sob a licença MIT.

## Contato
Dúvidas ou sugestões? Entre em contato pelo e-mail: [seu-email@exemplo.com]

---
Sinta-se à vontade para adaptar este README conforme a evolução do projeto.