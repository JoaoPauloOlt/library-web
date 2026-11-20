/* global describe, it, cy */

describe("Autenticação e controle de acesso", () => {
  it("permite que um administrador entre e acesse a criação de livros", () => {
    cy.loginAs("admin");

    cy.contains("a", "Novo Livro").should("be.visible");
    cy.get(".catalog-toolbar").should("be.visible");
    cy.get(".catalog-toolbar").should("not.contain", "Carregando...");
  });

  it("permite que um usuário comum entre, mas oculta ações administrativas", () => {
    cy.loginAs("user");

    cy.contains("a", "Novo Livro").should("not.exist");
    cy.get(".catalog-toolbar").should("be.visible");
    cy.get(".catalog-toolbar").should("not.contain", "Carregando...");
  });

  it("mantém o usuário na tela de login quando as credenciais são inválidas", () => {
    cy.visit("/");
    cy.window().then((window) => cy.stub(window, "alert").as("loginAlert"));

    cy.get('input[placeholder="Email"]').type("invalid-user@library.local");
    cy.get('input[placeholder="Senha"]').type("invalid-password", { log: false });
    cy.contains("button", "Entrar").click();

    cy.get("@loginAlert").should("have.been.called");
    cy.location("pathname").should("eq", "/");
    cy.contains("h1", "Login").should("be.visible");
  });

  it("redireciona usuários não autenticados ao tentar abrir uma rota protegida", () => {
    cy.visit("/books");
    cy.location("pathname").should("eq", "/");
    cy.contains("h1", "Login").should("be.visible");
  });
});
