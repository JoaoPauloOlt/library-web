# Testes E2E locais com Cypress

O Cypress valida a aplicação pelo navegador e complementa os testes unitários existentes do frontend e os testes automatizados do backend.

## Pré-requisitos

- Node.js e npm compatíveis com o projeto.
- Docker Engine e Docker Compose.
- Java 21 e Maven Wrapper, caso prefira executar a API fora do Docker.

## 1. Iniciar a API e suas dependências

Na raiz do repositório `library-api`:

```bash
docker compose up -d --build
```

Esse comando inicia PostgreSQL, RabbitMQ e a API com o perfil `dev`. Aguarde os containers ficarem saudáveis e confirme a API em:

- API: http://localhost:8080
- Swagger: http://localhost:8080/swagger-ui/index.html

O perfil `dev` aplica o schema e os dados demonstrativos no PostgreSQL. Os testes usam contas locais já documentadas no README da API.

Para acompanhar a inicialização:

```bash
docker compose logs -f library-api
```

## 2. Iniciar o frontend

Na raiz do repositório `library-web`:

```bash
npm ci
cp .env.example .env
npm run dev
```

A configuração padrão aponta para `http://localhost:8080` e o Vite disponibiliza o frontend em http://localhost:5173.

## 3. Executar o Cypress

Modo interativo:

```bash
npm run cypress:open
```

Execução headless pelo terminal:

```bash
npm run cypress:run
```

Na primeira execução, o `npx` baixa a versão estável do Cypress. É necessária conexão com a internet nessa primeira execução.

## Credenciais de teste

Por padrão, os cenários usam as contas de desenvolvimento do backend:

| Perfil | E-mail | Senha |
|---|---|---|
| Administrador | admin@library.com | Admin123! |
| Usuário | user@library.com | User123! |

Essas credenciais são exclusivas do ambiente local descartável. Não as utilize em produção.

É possível sobrescrever credenciais e URL sem editar os testes:

```bash
CYPRESS_ADMIN_EMAIL=admin@library.com \
CYPRESS_ADMIN_PASSWORD='Admin123!' \
CYPRESS_USER_EMAIL=user@library.com \
CYPRESS_USER_PASSWORD='User123!' \
CYPRESS_BASE_URL=http://localhost:5173 \
npm run cypress:run
```

Os e-mails são disponibilizados por `Cypress.expose()`; as senhas são lidas com `cy.env()`, conforme a API do Cypress 16 ou superior.

## Cenários incluídos

- Login com perfil administrador e visibilidade da ação de criação de livros.
- Login com perfil de usuário e restrição visual da ação administrativa.
- Carregamento da página de catálogo após autenticação.

Os testes exercitam o frontend e a API real em execução. Eles não substituem testes de autorização no backend: as regras de segurança devem continuar cobertas por testes de integração da API.

## Encerrar o ambiente

Na raiz do repositório `library-api`:

```bash
docker compose down
```

Para apagar também os dados locais do PostgreSQL e RabbitMQ (operação destrutiva):

```bash
docker compose down -v
```
