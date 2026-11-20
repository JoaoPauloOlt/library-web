/* global describe, it, cy, Cypress */

describe("Navegação do catálogo e autorização", () => {
  it("permite consultar livros e autores como usuário autenticado", () => {
    cy.loginAs("user");

    cy.get(".catalog-toolbar").should("be.visible").and("not.contain", "Carregando...");
    cy.visit("/authors");
    cy.contains("h1", "Autores").should("be.visible");
    cy.get(".catalog-toolbar").should("be.visible").and("not.contain", "Carregando...");
  });

  it("permite ao administrador abrir o formulário de cadastro de livro", () => {
    cy.loginAs("admin");
    cy.visit("/books/new");

    cy.contains("h1", "Novo livro").should("be.visible");
    cy.get("#isbn").should("be.visible");
    cy.get("#title").should("be.visible");
    cy.get("#genre").should("be.visible");
    cy.get("#author").should("be.visible");
    cy.get("#quantity").should("be.visible");
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
