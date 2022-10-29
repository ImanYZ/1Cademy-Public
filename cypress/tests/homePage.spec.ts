// import { tagsAutoCompleteCovid, tagsAutoCompletePopular } from "../../testUtils/mockData/tags.data";

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
    cy.wait(2000);
    cy.findAllByTestId("node-item").eq(0).click();
    cy.findByTestId("node-item-container").should("exist");
  });

  it("Should search by tags", () => {
    cy.visit("/");

    // lets select a tag in autocomplete
    cy.findByLabelText("Search for Tags").click().type("covid");
    cy.findByRole("presentation").findByText("SARS-CoV-2 (COVID-19)").click();
    cy.url().should("include", `tags=SARS-CoV-2+%28COVID-19%29`);

    // lets select a tag in tree view
    cy.findByTestId("tree-view").findByLabelText("Psychology").click();
    cy.url().should("include", `tags=Psychology%2CSARS-CoV-2+%28COVID-19%29`);

    //lets unselect a tag in tree view
    cy.findByTestId("tree-view").findByLabelText("Psychology").click();
    cy.url().should("not.include", `Psychology`);
  });

  it("Should search by node Types, contributors and institutions", () => {
    cy.visit("/");

    // lets select a tag in autocomplete
    cy.findByLabelText("Node types").click().type("con");
    cy.findByRole("presentation").findByText("Concept").click({ force: true });
    cy.url().should("include", `nodeTypes=Concept`);
    // lets unselect a tag in tree view
    cy.findByRole("button", { name: "Concept" }).findByTestId("CloseIcon").click();
    cy.findByLabelText("Node types").blur();
    cy.url().should("not.include", `nodeTypes=Concept`);

    // lets select contributor autocomplete
    cy.findByLabelText("Contributors").click().type("elij");
    cy.findByRole("presentation").findByText("Elijah Fox").click({ force: true });
    cy.url().should("include", `contributors=elijah-fox`);
    // lets unselect a contributor in tree view
    cy.findByRole("button", { name: /Elijah Fox/ })
      .findByTestId("CloseIcon")
      .click();
    cy.findByLabelText("Contributors").blur();
    cy.url().should("not.include", `contributors=elijah-fox`);

    // lets select institutions autocomplete
    cy.findByLabelText("Institutions").click().type("michi");
    cy.findByRole("presentation").findByText("University of Michigan - Ann Arbor").click({ force: true });
    cy.url().should("include", `institutions=SrFGUXJBzcQFXUsAJRpp`);
    // lets add other institution
    cy.findByLabelText("Institutions").click().type("mass");
    cy.findByRole("presentation").findByText("Massachusetts Institute of Technology").click({ force: true });
    cy.url().should("include", `institutions=SrFGUXJBzcQFXUsAJRpp%2C86pdSRShx8lprHfc6S26`);
    // lets unselect the first institution
    cy.findByRole("button", { name: /University of Michigan - Ann Arbor/ })
      .findByTestId("CloseIcon")
      .click();
    cy.findByLabelText("Institutions").blur();
    cy.url().should("not.include", `SrFGUXJBzcQFXUsAJRpp%2C`);
  });

  it("Should search by references", () => {
    cy.visit("/");

    // lets select a wikipedia reference
    cy.findByLabelText("References").click().type("wiki");
    cy.findByRole("presentation").findByText("Microeconomics - Wikipedia").click({ force: true });
    cy.url().should("include", `reference=Microeconomics+-+Wikipedia`);

    // lets select other reference
    cy.findByLabelText("References").clear().type("book of why");
    cy.findByRole("presentation").findByText("The Book of Why").click({ force: true });
    cy.url().should("not.include", `reference=Microeconomics+-+Wikipedia`);
    cy.url().should("include", `reference=The+Book+of+Why`);

    // TODO: Be sure wich we have test DB to expect some node appear when apply some filters
  });
});
