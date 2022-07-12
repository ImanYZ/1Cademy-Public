import React, { ReactNode } from "react";

import { AuthLayout } from "../components/layouts/AuthLayout";
import { SignUpForm } from "../components/SignUpForm";

const signUp = () => {
  return <SignUpForm />;
};

signUp.getLayout = (page: ReactNode) => {
  return <AuthLayout>{page}</AuthLayout>;
};

export default signUp;
