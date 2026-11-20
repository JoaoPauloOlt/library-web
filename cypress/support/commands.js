/* global Cypress, cy */

Cypress.Commands.add("loginAs", (role) => {
  const passwordKey = `${role}Password`;
  const email = Cypress.expose(`${role}Email`);

  return cy.env([passwordKey]).then((secrets) => {
    cy.visit("/");
    cy.get('input[placeholder="Email"]').should("be.visible").type(email);
    cy.get('input[placeholder="Senha"]').should("be.visible").type(secrets[passwordKey], { log: false });
    cy.contains("button", "Entrar").click();
    cy.location("pathname").should("eq", "/books");
    cy.contains("h1", "Livros").should("be.visible");
  });
});

Cypress.Commands.add("apiLoginAs", (role) => {
  const passwordKey = `${role}Password`;
  const apiUrl = Cypress.expose("apiUrl");
  const email = Cypress.expose(`${role}Email`);

  return cy.env([passwordKey]).then((secrets) => (
    cy.request("POST", `${apiUrl}/auth/login`, {
      email,
      password: secrets[passwordKey],
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.accessToken).to.be.a("string").and.not.be.empty;
      return response.body.accessToken;
    })
  ));
});
