/// <reference types="cypress" />
import "@testing-library/cypress/add-commands";

Cypress.Commands.add("clickOutside", () => {
  return cy.get("body").click(0, 0); //0,0 here are the x and y coordinates
});

declare global {
  namespace Cypress {
    interface Chainable {
      clickOutside: () => Chainable<JQuery<HTMLBodyElement>>;
    }
  }
}
