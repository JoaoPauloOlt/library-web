# 📚 Library Web

Frontend da plataforma de gestão de biblioteca. Aplicação React + Vite integrada à `library-api`, com autenticação JWT, RBAC, catálogo, circulação, histórico, relatórios e dashboard.

## Stack

- React
- Vite
- React Router
- Axios
- React Hot Toast
- ESLint
- CSS modular por área

## Estrutura

```text
src/
├── api/                  # contratos/helpers de API
├── components/layout/    # Layout, Header e Sidebar
├── contexts/             # estado de autenticação
├── hooks/                # hooks compartilhados
├── pages/
│   ├── auth/
│   ├── authors/
│   ├── books/
│   ├── dashboard/
│   ├── loans/
│   └── reports/
├── routes/               # proteção por autenticação/permissão
├── services/             # Axios e serviços HTTP
├── styles/               # estilos específicos
└── utils/
```

## Funcionalidades

### Autenticação e RBAC

- Login, registro e logout.
- JWT enviado automaticamente pelo Axios.
- Menus e rotas administrativas condicionados às permissões do usuário.
- `BOOK_CREATE` controla criação de livros.
- `AUTHOR_CREATE` controla criação de autores.
- `LOAN_READ_ALL` controla empréstimos/histórico gerais e relatórios.
- `LOAN_CREATE_FOR_USER` controla a criação de empréstimos em nome de terceiros.

### Catálogo

- Busca e paginação de livros.
- Capas por URL.
- Cadastro de quantidade de exemplares físicos.
- Página individual em `/books/:id`.
- Página de detalhes mostra capa, autores, gênero, ISBN, disponibilidade e descrição.
- Livros disponíveis oferecem acesso à solicitação de empréstimo.

### Dashboard

- Total de livros no acervo.
- Empréstimos realizados pelo usuário no mês.
- Empréstimos vencidos.
- Gêneros mais lidos e livros associados.

### Circulação

- Usuários consultam seus próprios empréstimos e podem solicitar livros disponíveis.
- Funcionários com `LOAN_READ_ALL` consultam todos os empréstimos.
- Funcionários com `LOAN_CREATE_FOR_USER` podem localizar usuários ativos e registrar empréstimos em nome deles.
- Ações de aprovação, devolução e cancelamento respeitam as permissões RBAC.
- Histórico segue a mesma regra de RBAC.
- A partir dos detalhes de um livro, o ID é encaminhado à tela de empréstimos para pré-seleção.
- Sidebar possui submenus recolhíveis para Empréstimos e Histórico.

### Relatórios

Disponíveis apenas para funcionários/admins com `LOAN_READ_ALL`:

- Mais emprestados
- Recomendados
- Livros por categoria
- Usuários ativos

## Rotas principais

| Rota | Acesso |
|---|---|
| `/home` | autenticado |
| `/books` | autenticado |
| `/books/:id` | autenticado |
| `/books/new` | `BOOK_CREATE` |
| `/authors` | autenticado |
| `/authors/new` | `AUTHOR_CREATE` |
| `/loans` | autenticado |
| `/loans/all` | `LOAN_READ_ALL` |
| `/history` | autenticado |
| `/history/all` | `LOAN_READ_ALL` |
| `/reports/*` | `LOAN_READ_ALL` |

## Configuração

Copie o arquivo de exemplo para criar sua configuração local:

```bash
cp .env.example .env
```

O arquivo `.env` deve apontar para a URL da API:

```env
VITE_API_URL=http://localhost:8080
```

Não coloque credenciais ou segredos do backend no frontend.

## Desenvolvimento

```bash
npm install
npm run dev
```

Frontend: `http://localhost:5173`

## Validação

```bash
npm test
npm run lint
npm run build
```

O comando `npm run build` também executa os testes por meio do script `prebuild`. O CI executa lint, testes e build antes do merge em `develop`.

## Integração com a API

O frontend espera a `library-api` disponível em `VITE_API_URL`. O fluxo de circulação utiliza:

```http
GET  /loans/my
GET  /loans
GET  /loans/users
POST /loans
POST /loans/for-user
PUT  /loans/{id}/approve
PUT  /loans/{id}/return
PUT  /loans/{id}/cancel
```

A listagem de usuários ativos e a criação de empréstimos em nome de terceiros exigem `LOAN_CREATE_FOR_USER`. O endpoint retorna somente usuários com status `ACTIVE`; a API valida novamente o status do usuário no momento da criação do empréstimo.

A listagem global de empréstimos e o histórico administrativo exigem `LOAN_READ_ALL`. A API também fornece os detalhes do catálogo:

```http
GET /books/{id}
```

A versão atual usa `description` no modelo de livro; a configuração do banco deve refletir a versão atual do backend.

## Git workflow

As alterações devem ser desenvolvidas em branches de feature/fix, passar pelo CI e então ser integradas via Pull Request em `develop`.
