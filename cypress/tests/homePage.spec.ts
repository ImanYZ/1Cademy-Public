import { tagsAutoCompleteCovid, tagsAutoCompletePopular } from "../../testUtils/mockData/tags.data";

describe("Home page", () => {
  it("Should render basic elements the first time the page is open", () => {
    cy.visit("/");
    //It should show header navbar
    cy.findByTestId("app-nav-bar").should("exist");
    //It should show the search section
    cy.findByTestId("home-search").should("exist");
    //The stats should show
    cy.findByTestId("stats").should("exist");
    //It should show 10 node items by default
    cy.findAllByTestId("node-item").should("have.length", 10);
    //it should show the pagination
    cy.findByTestId("pagination").should("exist");
  });

  it("Should allow search", () => {
    const textToSearch = "covid";
    cy.visit("/");
    //Let's enter some text to search
    cy.findByTestId("home-search")
      .findByPlaceholderText("What do you want to learn today?")
      .type(`${textToSearch}{enter}`);
    //the actual serach should show
    cy.findAllByTestId("node-item").should("have.length", 10);
    //the url should have the text entered as a parameter
    cy.url().should("include", `q=${textToSearch}`);
    //it should be on the first page
    cy.url().should("include", `page=1`);
    //let's change the page
    cy.findByLabelText("page 2").click();
    //assert the page number changed in the url
    cy.url().should("include", `page=2`);
    // //assert the second page is selected in the pagination component
    // cy.findByLabelText("page 2").should("have.class", "Mui-selected");
    //let's click in the first node, it should redirect to the node page
    cy.findAllByTestId("node-item").eq(0).click();
    cy.findByTestId("node-item-container").should("exist");
  });

  it("Should search by tags", () => {
    //let's intercept the data to get consistent results for the test
    cy.intercept("GET", "/api/tagsAutocomplete?q=", { statusCode: 200, body: tagsAutoCompletePopular }).as(
      "tagsAutocompleteResponseMostPopular"
    );

    cy.intercept("GET", "/api/tagsAutocomplete?q=covid", { statusCode: 200, body: tagsAutoCompleteCovid }).as(
      "tagsAutocompleteResponseCovid"
    );

    cy.visit("/");
    cy.wait("@tagsAutocompleteResponseMostPopular");
    cy.findByLabelText("Tags").click();
    //By default there should show 10 items if nothing has been searched
    cy.findAllByTestId("tag-option").should("have.length", 10);
    //Asert the most popular tags appear the first time
    cy.findByText((tagsAutoCompletePopular.results || [])[9]).should("exist");
    //just to close the autocomplete options
    cy.clickOutside();
    //let's search by the tag covid
    cy.findByLabelText("Tags").type("covid");
    cy.wait("@tagsAutocompleteResponseCovid");

    //Choose the first option
    cy.findByText((tagsAutoCompleteCovid.results || [])[1]).click();
    //Assert the selected tag has been passed in the url
    cy.url().should("include", `tags=${(tagsAutoCompleteCovid.results || [])[1]}`);
    //let's choose another tag
    cy.findByLabelText("Tags").click();
    cy.findByText((tagsAutoCompleteCovid.results || [])[0]).click();
    const tagsSelected = encodeURIComponent(
      `${(tagsAutoCompleteCovid.results || [])[1]},${(tagsAutoCompleteCovid.results || [])[0]}`
    );
    cy.url().should("include", `tags=${tagsSelected}`);
  });
});
