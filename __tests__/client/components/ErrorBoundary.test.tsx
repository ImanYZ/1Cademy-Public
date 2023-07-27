/**
 * @jest-environment jsdom
 */

import "react";
import "@testing-library/jest-dom";

import { render, screen } from "@testing-library/react";
import * as errorsFirestore from "src/client/firestore/errors.firestore";

// import firestore from "firebase/firestore";
import ErrorBoundary from "@/components/ErrorBoundary";

jest.mock("firebase/firestore", () => {
  // const originalModule = jest.requireActual("../foo-bar-baz");

  return {
    __esModule: true,
    getFirestore: jest.fn(),
  };
});

const ProblematicComponent = () => {
  throw Error("this is an error");
  return <div>this has error</div>;
};

describe("should test error management", () => {
  const consoleErrorSpy = jest.spyOn(global.console, "error").mockImplementation(() => {});
  const errorFirestoreSpy = jest.spyOn(errorsFirestore, "addClientErrorLog").mockImplementation(jest.fn());

  it("should test error boundary", () => {
    render(
      <ErrorBoundary>
        <ProblematicComponent />
      </ErrorBoundary>
    );

    const mainMessage = screen.getByText("Oops, there is an error!");
    expect(mainMessage).toBeInTheDocument();

    const secondaryMessage = screen.getByText(
      "Our team is actively working to fix the issue. Please try again later. Thank you for your patience."
    );
    expect(secondaryMessage).toBeInTheDocument();

    const tryAgainButton = screen.getByRole("button", { name: /Try again?/i });
    expect(tryAgainButton).toBeInTheDocument();

    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(errorFirestoreSpy).toBeCalled();
  });
});
