# Testes E2E e de volume com Cypress

O Cypress valida a aplicação no navegador e também executa cenários de integração HTTP contra a API real. A suíte complementa os testes unitários do frontend e os testes automatizados do backend.

## Pré-requisitos

- Node.js e npm compatíveis com o projeto.
- Docker Engine e Docker Compose.
- Java 21 e Maven Wrapper, caso prefira executar a API fora do Docker.

## 1. Iniciar a API e suas dependências

Na raiz do repositório `library-api`:

```bash
docker compose up -d --build
```

Esse comando inicia PostgreSQL, RabbitMQ e a API com o perfil `dev`. Aguarde os containers ficarem saudáveis e confirme:

- API: http://localhost:8080
- Swagger: http://localhost:8080/swagger-ui/index.html

O perfil `dev` inicializa schema e dados demonstrativos no PostgreSQL. As credenciais abaixo são exclusivas do banco local descartável.

## 2. Iniciar o frontend

Na raiz do repositório `library-web`:

```bash
npm ci
cp .env.example .env
npm run dev
```

O Vite disponibiliza o frontend em http://localhost:5173. A variável `VITE_API_URL` deve apontar para a API que será testada (por padrão, http://localhost:8080). Reinicie o Vite após alterar o arquivo `.env`.

## 3. Executar os testes

Na raiz de `library-web`:

Modo interativo:

```bash
npm run cypress:open
```

Suíte completa headless:

```bash
npm run cypress:run
```

Somente o cenário de volume do catálogo:

```bash
npm run cypress:run:bulk
```

Na primeira execução, o `npx` baixa a versão estável do Cypress. É necessária conexão com a internet.

## Credenciais e configuração

| Perfil | E-mail | Senha |
|---|---|---|
| Administrador | admin@library.com | Admin123! |
| Usuário | user@library.com | User123! |

Sobrescreva os valores por variáveis de ambiente, sem editar os testes:

```bash
CYPRESS_ADMIN_EMAIL=admin@library.com \
CYPRESS_ADMIN_PASSWORD='Admin123!' \
CYPRESS_USER_EMAIL=user@library.com \
CYPRESS_USER_PASSWORD='User123!' \
CYPRESS_BASE_URL=http://localhost:5173 \
CYPRESS_API_URL=http://localhost:8080 \
npm run cypress:run
```

Os e-mails e configurações não sensíveis são disponibilizados por `Cypress.expose()`; as senhas são lidas com `cy.env()` e não são registradas nos comandos de digitação.

## Cobertura atual

- Login administrativo e de usuário comum.
- Rejeição de credenciais inválidas.
- Redirecionamento de sessão não autenticada.
- Visibilidade de ações conforme RBAC.
- Consulta do catálogo e da listagem de autores.
- Abertura e validação estrutural do formulário de criação de livro.
- Verificação HTTP de endpoint protegido para usuário sem permissão.
- Rejeição de chamadas anônimas à API.
- Criação, leitura e exclusão de lote temporário de autores e livros diretamente na API.

## Teste em lote (bulk)

O cenário cria autores e livros com nomes/ISBNs exclusivos, consulta os livros criados e remove somente os registros daquele próprio teste. Os livros são excluídos antes dos autores para respeitar a relação entre as entidades.

Por padrão, o teste cria 10 autores e 10 livros. Para ajustar o volume:

```bash
CYPRESS_BULK_SIZE=25 npm run cypress:run:bulk
```

O limite permitido é de 1 a 50 registros por entidade por execução. O teste precisa de uma API local em perfil `dev`, com usuário administrador e permissões de catálogo. Não execute esse cenário contra produção ou uma base compartilhada: ele cria e exclui registros.

Se uma falha externa interromper a execução antes da limpeza, os registros têm o prefixo `Cypress Bulk` e podem ser identificados para remoção manual no ambiente descartável.

## Limites e responsabilidades

- Cypress valida fluxos funcionais e operações em lote de volume moderado.
- Cypress não é ferramenta de carga concorrente; o teste de usuários simultâneos será mantido no repositório da API com k6.
- Testes de autorização do backend continuam obrigatórios, independentemente da visibilidade dos elementos no frontend.
- O CI atual do frontend executa lint, testes unitários e build; os testes Cypress permanecem locais neste estágio.

## Encerrar o ambiente

Na raiz do repositório `library-api`:

```bash
docker compose down
```

Para apagar também os volumes locais do PostgreSQL e RabbitMQ (operação destrutiva):

```bash
docker compose down -v
```
