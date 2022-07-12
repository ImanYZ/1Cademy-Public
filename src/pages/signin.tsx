import React, { ReactNode } from "react";

import { AuthLayout } from "../components/layouts/AuthLayout";
import { SignInForm } from "../components/SignInForm";

const signIn = () => {
  return (
    <div>
      <SignInForm />
    </div>
  );
};

signIn.getLayout = (page: ReactNode) => {
  return <AuthLayout>{page}</AuthLayout>;
};

export default signIn;
