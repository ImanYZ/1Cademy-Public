describe("SignIn page", () => {
  it("Should render basic elements the first time the signIn is open", () => {
    cy.visit("/signin");
    // It should show layout component
    cy.findByTestId("auth-layout").should("exist");
    // It should show left panel with messages
    cy.findByText("Welcome to 1Cademy").should("exist");
    cy.findByText("We Visualize Learning Pathways from Books & Research Papers.").should("exist");
    // it should show sign in form
    cy.findByTestId("signin-form").should("exist");
  });

  it("Should allow sign in to the user", () => {
    const invalidEmail = "unknow@g.com";
    const invalidPassword = "1234567890";
    const validEmail = Cypress.env("CYPRESS_TEST_VALID_EMAIL");
    const validPassword = Cypress.env("CYPRESS_TEST_VALID_PASSWORD");

    cy.visit("/signin");
    // Let's try to sign in without an email and password
    cy.findByRole("button", { name: "submit" }).click();
    // it should show error message
    cy.findByText("Your email address provided by your academic/research institutions is required!").should("exist");
    cy.findByText("A secure password is required!").should("exist");

    // Let's try to enter any text as email
    cy.findByTestId("signin-form").findByLabelText("Email").type("any text");
    // it should show error message
    cy.findByText("Invalid email address!").should("exist");
    // Let's clear email
    cy.findByTestId("signin-form").findByLabelText("Email").clear();

    // Let's enter a invalid email and password
    cy.findByTestId("signin-form").findByLabelText("Email").type(invalidEmail);
    cy.findByTestId("signin-form").findByLabelText("Password").type(`${invalidPassword}{enter}`);
    // it should show error message
    cy.findByText("There is no user record corresponding to this identifier.").should("exist");
    // Let's clear email and password
    cy.findByTestId("signin-form").findByLabelText("Email").clear();
    cy.findByTestId("signin-form").findByLabelText("Password").clear();

    // Let's enter a valid email and password
    cy.findByTestId("signin-form").findByLabelText("Email").type(validEmail);
    cy.findByTestId("signin-form").findByLabelText("Password").type(`${validPassword}{enter}`);
    // it should show success message
    // cy.findByText("User authenticated");
    // it should redirect to home page so it isn't the signin page
    cy.url().should("not.contain", `signin`);
    // should sign out in home page
    cy.findByRole("button", { name: /Sign out/ }).click();
  });
});
