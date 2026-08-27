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

- Usuários consultam seus próprios empréstimos.
- Funcionários com `LOAN_READ_ALL` consultam todos os empréstimos.
- Histórico segue a mesma regra de RBAC.
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

Crie `.env` a partir de `.env.example` quando disponível:

```env
VITE_API_URL=http://localhost:8080
```

## Desenvolvimento

```bash
npm install
npm run dev
```

Frontend: `http://localhost:5173`

## Validação

```bash
npm run lint
npm run build
```

O CI deve executar lint e build antes do merge em `develop`.

## Integração com a API

O frontend espera a `library-api` disponível em `VITE_API_URL`. O endpoint de detalhes do catálogo já existe na API:

```http
GET /books/{id}
```

A versão atual também usa `description` no modelo de livro. A API deve executar a migration `V10__add_book_description.sql` antes de usar esse campo em banco existente.

## Git workflow

As alterações devem ser desenvolvidas em branches de feature/fix, passar pelo CI e então ser integradas via Pull Request em `develop`.
