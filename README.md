# Nunes Sports - Backend

Este é o backend da aplicação Nunes Sports, um sistema de gerenciamento de produtos esportivos.

## Tecnologias Utilizadas

- Node.js
- Express.js
- Sequelize (ORM)
- SQLite (banco de dados)
- Multer (para upload de arquivos)
- CORS

## Pré-requisitos

- Node.js (versão 14.x ou superior)
- npm (geralmente vem com o Node.js)

## Configuração

## Clone o repositório:

   git clone https://github.com/seu-usuario/nunes-sports-backend.git
   cd nunes-sports-backend

## Instale as dependências:

  npm install

Crie um arquivo .env na raiz do projeto e adicione as seguintes variáveis:

   PORT=5000
   DB_PATH=./database.sqlite

## Executando o Projeto

Inicie o servidor:

   npm start

O servidor estará rodando em http://localhost:5000

## Rotas da API

GET /api/produtos: Lista todos os produtos
GET /api/produtos/:id: Busca um produto específico
POST /api/produtos: Cria um novo produto
PUT /api/produtos/:id: Atualiza um produto existente
DELETE /api/produtos/:id: Remove um produto
POST /api/produtos/:id/imagens: Faz upload de imagens para um produto

# Scripts Disponíveis

npm start: Inicia o servidor
npm run dev: Inicia o servidor em modo de desenvolvimento (com Nodemon)

## Estrutura do Projeto

- server.js: Ponto de entrada da aplicação
- src/database.js: Configuração do banco de dados
- src/middleware/imageUpload.js: Middleware para upload de imagens

