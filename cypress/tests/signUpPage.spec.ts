// import { registeredUser } from "../../testUtils/mockData/user.data";
import {
  lookupResponse,
  signInWithPasswordResponse,
  signUpEmailRegistered,
  signUpResponse,
  signUpUsernameRegistered
} from "../../testUtils/mockData/signup.data";

describe("SignUp page", () => {
  it("Should render basic elements the first time the signUp is open", () => {
    cy.visit("/signup");
    // It should show layout component
    cy.findByTestId("auth-layout").should("exist");
    // It should show left panel with messages
    cy.findByText("Welcome to 1Cademy").should("exist");
    cy.findByText("We Visualize Learning Pathways from Books & Research Papers.").should("exist");
    // it should show sign up form
    cy.findByTestId("signup-form").should("exist");
  });

  it("Should show error messages when username or email exist", () => {
    cy.intercept("POST", "/api/signup", req => {
      const { email, uname } = req.body.data;
      if (email === "registeredEmail@gmail.com")
        return req.reply({
          statusCode: 400,
          body: signUpEmailRegistered
        });
      if (uname === "registeredUsername")
        return req.reply({
          statusCode: 400,
          body: signUpUsernameRegistered
        });
      return req.reply(signUpResponse);
    }).as("signUp");

    cy.intercept("POST", "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword*", {
      statusCode: 200,
      body: signInWithPasswordResponse
    }).as("signIn");

    cy.intercept(
      "POST",
      "https://firestore.googleapis.com/google.firestore.v1.Firestore/Listen/channel?database=projects%2Fonecademy-dev%2Fdatabases%2F(default)&gsessionid=Ow1SVUHIT6lSQ2F31vy_SBs9UcKEQJeZ8FgW9iYT8rc&VER=8&RID=rpc&SID=OZ0PN0lTJBP1BfyuJVd7gA&CI=0&AID=446&TYPE=xmlhttp&zx=hoed4f42grnx&t=1",
      {
        statusCode: 200,
        body: {}
      }
    );
    cy.intercept("POST", "https://identitytoolkit.googleapis.com/v1/accounts:lookup*", {
      statusCode: 200,
      body: lookupResponse
    });

    cy.visit("/signup");

    // ---------------------------------
    // step 1
    // ---------------------------------
    // should fill with valid fields step 1 with an registered email
    cy.findByTestId("signup-form").findByLabelText("First Name").type("Sam");
    cy.findByTestId("signup-form").findByLabelText("Last Name").type("Flores Cornell");
    cy.findByTestId("signup-form").findByLabelText("Email").type("registeredEmail@gmail.com");
    cy.findByTestId("signup-form").findByLabelText("Username").type("registeredUsername");
    cy.findByTestId("signup-form").findByLabelText("Password").type("sam12345678");
    cy.findByTestId("signup-form").findByLabelText("Re-enter Password").type("sam12345678");

    // should click in next button
    cy.findByRole("button", { name: /Next/i }).click();

    // ---------------------------------
    // step 2
    // ---------------------------------
    // should fill with valid fields step 2
    // cy.findByTestId("signup-form").findByLabelText("Birth Date").clear();
    cy.findByTestId("signup-form").findByLabelText("Birth Date").type(`05/01/1990`);

    cy.findByTestId("signup-form").findByLabelText("Gender").click();
    cy.findByRole("presentation").findByText("Male").click();

    cy.findByTestId("signup-form").findByLabelText("Ethnicity").click();
    cy.findByRole("presentation").findByText("Hispanic or Latino").click();

    // cy.findByTestId("signup-form").findByLabelText("Please specify your ethnicity.").clear().type("unknown");

    cy.findByTestId("signup-form").findByLabelText("Country").clear();
    cy.findByTestId("signup-form").findByLabelText("Country").click().type("Mexi");
    cy.findByRole("presentation").findByText("Mexico").click();

    cy.findByTestId("signup-form").findByLabelText("State").clear();
    cy.findByTestId("signup-form").findByLabelText("State").click().type("Jalis");
    cy.findByRole("presentation").findByText("Jalisco").click();

    cy.findByTestId("signup-form").findByLabelText("City").clear();
    cy.findByTestId("signup-form").findByLabelText("City").click().type("Agua");
    cy.findByRole("presentation").findByText("Agua Caliente").click();

    cy.findByTestId("signup-form").findByLabelText("Reason for Joining").type("I want to improve my learning");

    cy.findByTestId("signup-form").findByLabelText("How did you hear about us?").click();
    cy.findByRole("presentation").findByText("Prefer not to say").click();

    // should click in next button
    cy.findByRole("button", { name: /Next/i }).click();

    // ---------------------------------
    // step 3
    // ---------------------------------
    // should fill with valid fields step 3
    cy.findByTestId("signup-form").findByLabelText("Occupation").type("Engineer");

    cy.findByTestId("signup-form").findByLabelText("Education Level").click();
    cy.findByRole("presentation").findByText("Prefer not to say").click();

    cy.findByTestId("signup-form").findByLabelText("Institution").clear();
    cy.findByTestId("signup-form").findByLabelText("Institution").type("MIT");

    cy.findByTestId("signup-form").findByLabelText("Major").type("Computer Science");

    cy.findByTestId("signup-form")
      .findByLabelText("Research field of interest (if any)")
      .type("Informatics and Computer");

    cy.findByTestId("signup-form").findByRole("checkbox").check();

    cy.findByTestId("signup-form")
      .findByRole("button", { name: /Sign up/i })
      .click();

    // should wait until a user is register
    cy.wait("@signUp");

    cy.findByText("This email address is already in use").should("exist");

    // should go to step 1 and change to a valid email
    cy.findByTestId("signup-form").findByRole("button", { name: /Prev/i }).click();
    cy.findByTestId("signup-form").findByRole("button", { name: /Prev/i }).click();
    cy.findByTestId("signup-form").findByLabelText("Email").clear().type("Samcito2022@gmail.com");

    // should go to step 3 and try again
    cy.findByRole("button", { name: /Next/i }).click();
    cy.findByRole("button", { name: /Next/i }).click();
    cy.findByTestId("signup-form")
      .findByRole("button", { name: /Sign up/i })
      .click();
    cy.wait("@signUp");

    cy.findByText("This username is already in use").should("exist");

    // should go to step 1 and change to a valid username
    cy.findByTestId("signup-form").findByRole("button", { name: /Prev/i }).click();
    cy.findByTestId("signup-form").findByRole("button", { name: /Prev/i }).click();
    cy.findByTestId("signup-form").findByLabelText("Username").clear().type("Sam22");

    // should go to step 3 and try again
    cy.findByRole("button", { name: /Next/i }).click();
    cy.findByRole("button", { name: /Next/i }).click();
    cy.findByTestId("signup-form")
      .findByRole("button", { name: /Sign up/i })
      .click();

    // should wait until a user is register
    cy.wait("@signUp");
    cy.wait("@signIn");

    // should show success message
    // cy.findByText(
    //   "We have sent an email with a confirmation link to your email address. Please verify it to start contributing."
    // ).should("exist");

    // should sign out in home page
    cy.findByRole("button", { name: /Sign out/ }).click();
  });

  it("Should show error messages and pass through every step and register a user", () => {
    //let's intercept the data to get consistent results for the test
    cy.intercept("POST", "/api/signup", {
      statusCode: 200,
      body: signUpResponse
    }).as("signUp");
    cy.intercept("POST", "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword*", {
      statusCode: 200,
      body: signInWithPasswordResponse
    }).as("signIn");

    cy.intercept(
      "POST",
      "https://firestore.googleapis.com/google.firestore.v1.Firestore/Listen/channel?database=projects%2Fonecademy-dev%2Fdatabases%2F(default)&gsessionid=Ow1SVUHIT6lSQ2F31vy_SBs9UcKEQJeZ8FgW9iYT8rc&VER=8&RID=rpc&SID=OZ0PN0lTJBP1BfyuJVd7gA&CI=0&AID=446&TYPE=xmlhttp&zx=hoed4f42grnx&t=1",
      {
        statusCode: 200,
        body: {}
      }
    );
    cy.intercept("POST", "https://identitytoolkit.googleapis.com/v1/accounts:lookup*", {
      statusCode: 200,
      body: lookupResponse
    });

    cy.visit("/signup");

    // ---------------------------------
    // step 1
    // ---------------------------------
    // it should show default configuration in step 1
    cy.findByTestId("signup-form").findByTestId("signup-form-step-1").should("exist");
    cy.findByTestId("signup-form").findByTestId("signup-form-step-2").should("not.exist");
    cy.findByTestId("signup-form").findByTestId("signup-form-step-3").should("not.exist");
    cy.findByTestId("signup-form").findByLabelText("Theme: 🌜").should("be.checked");
    cy.findByTestId("signup-form").findByLabelText("Background: Color").should("be.checked");
    cy.findByTestId("signup-form").findByLabelText("Display name: Your Full Name").should("not.be.checked");
    cy.findByTestId("signup-form").findByTestId("tree-view").should("exist");

    // It should show click in next button
    cy.findByRole("button", { name: /Next/i }).click();
    // it should show the required error messages
    cy.findByText("Please enter your first name").should("exist");
    cy.findByText("Please enter your last name").should("exist");
    cy.findByText("Your email address provided by your academic/research institutions is required").should("exist");
    cy.findByText("Your desired username is required").should("exist");
    cy.findByText("A secure password is required").should("exist");
    cy.findByText("Re-enter password is required").should("exist");

    // It should fill invalid email and show error message
    cy.findByTestId("signup-form").findByLabelText("Email").type("any text");
    cy.findByText("Invalid email address").should("exist");

    // it should fill invalid username with less than 4 characters and show error message
    cy.findByTestId("signup-form").findByLabelText("Username").type("abc");
    cy.findByText("A username with at least 4 characters is required").should("exist");

    cy.findByTestId("signup-form").findByLabelText("Username").clear();

    // it should fill invalid username with invalid characters and show error message
    cy.findByTestId("signup-form").findByLabelText("Username").type("__myusername__");
    cy.findByText("Usernames should not contain . or / or __").should("exist");

    // it should fill insecure password with less than 7 characters
    cy.findByTestId("signup-form").findByLabelText("Password").type("1234");
    cy.findByText("Password must be at least 7 characters").should("exist");

    // it should fill a valid password and an invalid password and show error messages
    cy.findByTestId("signup-form").findByLabelText("Password").clear();
    cy.findByTestId("signup-form").findByLabelText("Password").type("123456789");
    cy.findByTestId("signup-form").findByLabelText("Re-enter Password").type("1234-error");
    cy.findByText("Password must match re-entered password").should("exist");

    // it should fill correctly all fields from step 1
    cy.findByTestId("signup-form").findByLabelText("First Name").clear();
    cy.findByTestId("signup-form").findByLabelText("First Name").type("Sam");
    cy.findByTestId("signup-form").findByLabelText("Last Name").clear();
    cy.findByTestId("signup-form").findByLabelText("Last Name").type("Flores Cornell");
    cy.findByTestId("signup-form").findByLabelText("Email").clear();
    cy.findByTestId("signup-form").findByLabelText("Email").type("Samcito2022@gmail.com");
    cy.findByTestId("signup-form").findByLabelText("Username").clear();
    cy.findByTestId("signup-form").findByLabelText("Username").type("Sam22");
    cy.findByTestId("signup-form").findByLabelText("Password").clear();
    cy.findByTestId("signup-form").findByLabelText("Password").type("sam12345678");
    cy.findByTestId("signup-form").findByLabelText("Re-enter Password").clear();
    cy.findByTestId("signup-form").findByLabelText("Re-enter Password").type("sam12345678");

    cy.findByText("Display name: Sam Flores Cornell").should("exist");

    // should select a tag by autocomplete
    cy.findByTestId("tree-view").findByLabelText("Search for Tags").type("moocs", { force: true });
    cy.findByRole("presentation").findByLabelText("MOOCs").click();
    cy.findByText("You're going to be a member of: MOOCs").should("exist");

    // should select a tag by tree view
    cy.findByTestId("tree-view").findByLabelText("1Cademy").click();
    cy.findByText("You're going to be a member of: 1Cademy").should("exist");

    cy.findByRole("button", { name: /Next/i }).click();

    // ---------------------------------
    // step 2
    // ---------------------------------
    // it should show default configuration in step 2
    cy.findByTestId("signup-form").findByTestId("signup-form-step-1").should("not.exist");
    cy.findByTestId("signup-form").findByTestId("signup-form-step-2").should("exist");
    cy.findByTestId("signup-form").findByTestId("signup-form-step-3").should("not.exist");
    cy.findByTestId("signup-form").findByLabelText("Please specify your gender.").should("not.exist");
    cy.findByTestId("signup-form").findByLabelText("Please specify your ethnicity.").should("not.exist");
    cy.findByTestId("signup-form").findByLabelText("Please specify, How did you hear about us?").should("not.exist");

    // It should show click in next button
    cy.findByRole("button", { name: /Next/i }).click();
    // it should show the required error messages
    cy.findByText("Please enter your birth date").should("exist");
    cy.findByText("Please enter your gender").should("exist");
    cy.findByText("Please select at least 1 option").should("exist");
    cy.findByText("Please enter your reason for joining 1Cademy").should("exist");
    cy.findByText("Please enter how you heard about us").should("exist");

    // it should fill an invalid birthday with an age less than 10 years and show error messages
    cy.findByTestId("signup-form").findByLabelText("Birth Date").clear();
    cy.findByTestId("signup-form").findByLabelText("Birth Date").type(`01/01/2020`);
    cy.findByText("Your age should be greater than or equal to 10 years").should("exist");
    // it should full an invalid birthday with an age greater than 100 years and show error messages
    cy.findByTestId("signup-form").findByLabelText("Birth Date").clear();
    cy.findByTestId("signup-form").findByLabelText("Birth Date").type(`01/01/1910`);
    cy.findByText("Your age should be less than or equal to 100 years").should("exist");

    // it should enable the genderOtherValue
    cy.findByLabelText("Gender").click();
    cy.findByRole("presentation").findByText("Not listed (Please specify)").click();
    cy.findByTestId("signup-form").findByLabelText("Please specify your gender.").should("exist");

    // it should enable the ethnicityOtherValue
    cy.findByLabelText("Ethnicity").click();
    cy.findByRole("presentation").findByText("Not listed (Please specify)").click();
    cy.findByTestId("signup-form").findByLabelText("Please specify your ethnicity.").should("exist");

    // it should enable the foundFromOtherValue
    cy.findByLabelText("How did you hear about us?").click();
    cy.findByRole("presentation").findByText("Not listed (Please specify)").click();
    cy.findByTestId("signup-form").findByLabelText("Please specify, How did you hear about us?").should("exist");

    // it should fill correctly all fields from step 2
    cy.findByTestId("signup-form").findByLabelText("Birth Date").clear();
    cy.findByTestId("signup-form").findByLabelText("Birth Date").type(`05/01/1990`);

    cy.findByTestId("signup-form").findByLabelText("Gender").clear();
    cy.findByRole("presentation").findByText("Male").click();

    cy.findByTestId("signup-form").findByLabelText("Ethnicity").clear();
    cy.findByRole("presentation").findByText("Hispanic or Latino").click();

    cy.findByTestId("signup-form").findByLabelText("Please specify your ethnicity.").clear().type("unknown");

    cy.findByTestId("signup-form").findByLabelText("Country").clear();
    cy.findByTestId("signup-form").findByLabelText("Country").click().type("Mexi");
    cy.findByRole("presentation").findByText("Mexico").click();

    cy.findByTestId("signup-form").findByLabelText("State").clear();
    cy.findByTestId("signup-form").findByLabelText("State").click().type("Jalis");
    cy.findByRole("presentation").findByText("Jalisco").click();

    cy.findByTestId("signup-form").findByLabelText("City").clear();
    cy.findByTestId("signup-form").findByLabelText("City").click().type("Agua");
    cy.findByRole("presentation").findByText("Agua Caliente").click();

    cy.findByTestId("signup-form").findByLabelText("Reason for Joining").type("I want to improve my learning");

    cy.findByTestId("signup-form").findByLabelText("How did you hear about us?").clear();
    cy.findByRole("presentation").findByText("Prefer not to say").click();

    cy.findByRole("button", { name: /Next/i }).click();

    // ---------------------------------
    // step 3
    // ---------------------------------
    // it should show default configuration in step 3
    cy.findByTestId("signup-form").findByTestId("signup-form-step-1").should("not.exist");
    cy.findByTestId("signup-form").findByTestId("signup-form-step-2").should("not.exist");
    cy.findByTestId("signup-form").findByTestId("signup-form-step-3").should("exist");

    cy.findByTestId("signup-form")
      .findByRole("button", { name: /Sign up/i })
      .click();

    // it should show the required error messages
    cy.findByText("Please enter your occupation").should("exist");
    cy.findByText("Please enter your educational status").should("exist");
    cy.findByText("Please enter your major").should("exist");
    cy.findByText("Please enter your field of interest").should("exist");
    cy.findByText("Please accept terms to continue").should("exist");

    // it should fill correctly all fields from step 3
    cy.findByTestId("signup-form").findByLabelText("Occupation").type("Engineer");

    cy.findByTestId("signup-form").findByLabelText("Education Level").click();
    cy.findByRole("presentation").findByText("Prefer not to say").click();

    cy.findByTestId("signup-form").findByLabelText("Institution").clear();
    cy.findByTestId("signup-form").findByLabelText("Institution").type("MIT");

    cy.findByTestId("signup-form").findByLabelText("Major").type("Computer Science");

    cy.findByTestId("signup-form")
      .findByLabelText("Research field of interest (if any)")
      .type("Informatics and Computer");

    cy.findByTestId("signup-form").findByRole("checkbox").check();

    // cy.findByRole('button', { name: /Sign up/i }).click()
    cy.findByTestId("signup-form")
      .findByRole("button", { name: /Sign up/i })
      .click();

    // should wait until a user is register
    cy.wait("@signUp");
    cy.wait("@signIn");

    // should show success message
    // cy.findByText(
    //   "We have sent an email with a confirmation link to your email address. Please verify it to start contributing."
    // ).should("exist");

    // should sign out in home page
    cy.findByRole("button", { name: /Sign out/ }).click();
  });
});
