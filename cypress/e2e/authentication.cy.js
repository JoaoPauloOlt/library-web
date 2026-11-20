describe("Autenticação e controle de acesso", () => {
  const login = (email, password) => {
    cy.visit("/");
    cy.get('input[placeholder="Email"]').should("be.visible").type(email);
    cy.get('input[placeholder="Senha"]').should("be.visible").type(password);
    cy.contains("button", "Entrar").click();
  };

  it("permite que um administrador entre e acesse a criação de livros", () => {
    login(Cypress.env("adminEmail"), Cypress.env("adminPassword"));

    cy.location("pathname").should("eq", "/books");
    cy.contains("h1", "Livros").should("be.visible");
    cy.contains("a", "Novo Livro").should("be.visible");
    cy.get(".catalog-toolbar").should("be.visible");
    cy.get(".catalog-toolbar").should("not.contain", "Carregando...");
  });

  it("permite que um usuário comum entre, mas oculta ações administrativas", () => {
    login(Cypress.env("userEmail"), Cypress.env("userPassword"));

    cy.location("pathname").should("eq", "/books");
    cy.contains("h1", "Livros").should("be.visible");
    cy.contains("a", "Novo Livro").should("not.exist");
    cy.get(".catalog-toolbar").should("be.visible");
    cy.get(".catalog-toolbar").should("not.contain", "Carregando...");
  });
});
