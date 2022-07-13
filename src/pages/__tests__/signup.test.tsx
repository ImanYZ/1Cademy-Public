import { render, screen } from "@testing-library/react";

import SignUpPage from "../signup";

describe("SignUpPage component", () => {
  it("should pass first step", () => {
    render(<SignUpPage />);
    expect(screen.getByLabelText("a")).toBeInTheDocument();
  });
});
