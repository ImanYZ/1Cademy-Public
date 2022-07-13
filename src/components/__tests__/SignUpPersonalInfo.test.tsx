import { render, screen } from "@testing-library/react";
import { act } from "react-dom/test-utils";

import { useSignUpFormData } from "../../../testUtils/mockData/signup.data";
import { SignUpPersonalInfo } from "../SignUpPersonalInfo";

const RenderComponent = () => {
  const { signUpFormik } = useSignUpFormData();
  return <SignUpPersonalInfo formikProps={signUpFormik} />;
};

describe("SignUpPersonalInfo component", () => {
  it("should show initial Personal info form", () => {
    // const getStatsMock = jest.spyOn(api, "getStats");

    render(<RenderComponent />);
    act(() => {
      expect(screen.getByLabelText("Language")).toBeInTheDocument();
    });

    // expect(screen.getByLabelText('Age')).toBeInTheDocument()
    // expect(screen.getByLabelText('Gender')).toBeInTheDocument()
    // expect(screen.getByLabelText('Ethnicity')).toBeInTheDocument()
    // expect(screen.getByLabelText('Country')).toBeInTheDocument()
    // expect(screen.getByLabelText('State')).toBeInTheDocument()
    // expect(screen.getByLabelText('City')).toBeInTheDocument()
    // expect(screen.getByLabelText('Reason for Joining')).toBeInTheDocument()
    // expect(screen.getByLabelText('How did you hear about us?')).toBeInTheDocument()
  });

  // it('should show specify fields when select "Not listed (Please specify)"', () => {

  //   render(<RenderComponent />)

  //   expect(screen.getByLabelText('Language')).toBeInTheDocument()
  //   expect(screen.getByLabelText('Age')).toBeInTheDocument()
  //   expect(screen.getByLabelText('Gender')).toBeInTheDocument()
  //   expect(screen.getByLabelText('Ethnicity')).toBeInTheDocument()
  //   expect(screen.getByLabelText('Country')).toBeInTheDocument()
  //   expect(screen.getByLabelText('State')).toBeInTheDocument()
  //   expect(screen.getByLabelText('City')).toBeInTheDocument()
  //   expect(screen.getByLabelText('Reason for Joining')).toBeInTheDocument()
  //   expect(screen.getByLabelText('How did you hear about us?')).toBeInTheDocument()

  // });
});
