/* global describe, it, cy, Cypress */

describe("Navegação dos módulos e autorização", () => {
  it("permite que usuário consulte catálogo, autores, empréstimos, histórico e multas", () => {
    cy.loginAs("user");

    cy.get(".catalog-toolbar").should("be.visible").and("not.contain", "Carregando...");
    cy.visit("/authors");
    cy.contains("h1", "Autores").should("be.visible");
    cy.get(".catalog-toolbar").should("be.visible").and("not.contain", "Carregando...");

    cy.visit("/loans");
    cy.contains("h1", "Meus empréstimos").should("be.visible");
    cy.contains("h2", "Solicitar um livro").should("be.visible");

    cy.visit("/history");
    cy.contains("h1", "Meu histórico").should("be.visible");

    cy.visit("/fines");
    cy.contains("h1", "Multas").should("be.visible");
  });

  it("permite ao administrador abrir formulários e relatórios", () => {
    cy.loginAs("admin");

    cy.visit("/books/new");
    cy.contains("h1", "Novo livro").should("be.visible");
    cy.get("#isbn").should("be.visible");
    cy.get("#title").should("be.visible");
    cy.get("#genre").should("be.visible");
    cy.get("#author").should("be.visible");
    cy.get("#quantity").should("be.visible");

    cy.visit("/authors/new");
    cy.contains("h1", "Novo autor").should("be.visible");
    cy.get("#name").should("be.visible");
    cy.get("#nationality").should("be.visible");

    cy.visit("/reports/most-borrowed");
    cy.contains("h1", "Livros Mais Emprestados").should("be.visible");
    cy.visit("/reports/recommended");
    cy.contains("h1", "Recomendados").should("be.visible");
    cy.visit("/reports/categories");
    cy.contains("h1", "Livros por Categoria").should("be.visible");
    cy.visit("/reports/active-users");
    cy.contains("h1", "Usuários Ativos").should("be.visible");
  });

  it("bloqueia operações administrativas da API para usuário comum", () => {
    cy.apiLoginAs("user").then((token) => {
      cy.request({
        method: "GET",
        url: `${Cypress.expose("apiUrl")}/loans/users`,
        headers: { Authorization: `Bearer ${token}` },
        failOnStatusCode: false,
      }).its("status").should("eq", 403);
    });
  });

  it("rejeita acesso anônimo aos recursos protegidos da API", () => {
    cy.request({
      method: "GET",
      url: `${Cypress.expose("apiUrl")}/books`,
      failOnStatusCode: false,
    }).its("status").should("eq", 401);
  });
});
