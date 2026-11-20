/* global describe, it, before, after, cy, Cypress, expect */

describe("Carga funcional em lote do catálogo (API real)", () => {
  const apiUrl = () => Cypress.expose("apiUrl");
  const createdAuthorIds = [];
  const createdBookIds = [];
  let adminToken;
  let runId;
  let bulkSize;

  const authHeaders = () => ({
    Authorization: `Bearer ${adminToken}`,
    "Content-Type": "application/json",
  });

  const makeIsbn13 = (sequence) => {
    const firstTwelve = `978${String(sequence).padStart(9, "0").slice(-9)}`;
    const sum = [...firstTwelve].reduce((total, digit, index) => (
      total + Number(digit) * (index % 2 === 0 ? 1 : 3)
    ), 0);
    return `${firstTwelve}${(10 - (sum % 10)) % 10}`;
  };

  before(() => {
    const localApi = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(apiUrl());
    if (!localApi) {
      throw new Error("O teste bulk só pode ser executado contra uma API local (localhost ou 127.0.0.1).");
    }

    bulkSize = Number(Cypress.expose("bulkSize") || 10);
    expect(bulkSize, "CYPRESS_BULK_SIZE deve estar entre 1 e 50").to.be.within(1, 50);
    runId = Date.now() % 1_000_000_000;

    cy.apiLoginAs("admin").then((token) => {
      adminToken = token;
    });
  });

  after(() => {
    // Remove only records created by this run; books are deleted before their authors.
    [...createdBookIds].reverse().forEach((id) => {
      cy.request({
        method: "DELETE",
        url: `${apiUrl()}/books/${id}`,
        headers: authHeaders(),
        failOnStatusCode: false,
      }).then((response) => {
        expect([204, 404]).to.include(response.status);
      });
    });

    [...createdAuthorIds].reverse().forEach((id) => {
      cy.request({
        method: "DELETE",
        url: `${apiUrl()}/authors/${id}`,
        headers: authHeaders(),
        failOnStatusCode: false,
      }).then((response) => {
        expect([204, 404]).to.include(response.status);
      });
    });
  });

  it("cria, consulta e remove um lote controlado de autores e livros", () => {
    const authorIds = [];

    cy.wrap(Array.from({ length: bulkSize }, (_, index) => index)).each((index) => {
      return cy.request({
        method: "POST",
        url: `${apiUrl()}/authors`,
        headers: authHeaders(),
        body: {
          name: `Cypress Bulk ${runId} Author ${index}`,
          nationality: "Brazilian",
        },
      }).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body.id).to.be.a("number");
        createdAuthorIds.push(response.body.id);
        authorIds.push(response.body.id);
      });
    });

    cy.wrap(Array.from({ length: bulkSize }, (_, index) => index)).each((index) => {
      const isbn = makeIsbn13(runId + index);
      return cy.request({
        method: "POST",
        url: `${apiUrl()}/books`,
        headers: authHeaders(),
        body: {
          isbn,
          title: `Cypress Bulk ${runId} Book ${index}`,
          genre: "CLASSIC",
          description: "Temporary Cypress bulk-test fixture.",
          coverUrl: null,
          quantity: 1,
          authorIds: [authorIds[index]],
        },
      }).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body.isbn).to.eq(isbn);
        createdBookIds.push(response.body.id);
      });
    });

    cy.wrap(createdBookIds).each((id) => {
      cy.request({
        method: "GET",
        url: `${apiUrl()}/books/${id}`,
        headers: authHeaders(),
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.title).to.contain(`Cypress Bulk ${runId}`);
      });
    });

    cy.then(() => {
      expect(createdAuthorIds).to.have.length(bulkSize);
      expect(createdBookIds).to.have.length(bulkSize);
    });
  });
});
