import { render, screen } from "@testing-library/react";

import { useSignUpFormData } from "../../../testUtils/mockData/signup.data";
import { SignUpBasicInfo } from "../SignUpBasicInfo";

const RenderComponent = () => {
  const { signUpFormik } = useSignUpFormData();
  return <SignUpBasicInfo formikProps={signUpFormik} />;
};

describe("SignUpBasicInfo component", () => {
  it("should show initial basic info form", () => {
    render(<RenderComponent />);

    expect(screen.getByLabelText("First Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Last Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Username")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Re-enter Password")).toBeInTheDocument();
  });
});
