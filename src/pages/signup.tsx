import React, { ReactNode } from "react";
import { SignUpFormValues } from "src/knowledgeTypes";

import { AuthLayout } from "../components/layouts/AuthLayout";
import { SignUpForm } from "../components/SignUpForm";

const SignUpPage = () => {
  const handleSignUp = (values: SignUpFormValues) => {
    console.log("Should handle signup", values);
  };
  return <SignUpForm onSignup={handleSignUp} />;
};

SignUpPage.getLayout = (page: ReactNode) => {
  return <AuthLayout>{page}</AuthLayout>;
};

export default SignUpPage;
