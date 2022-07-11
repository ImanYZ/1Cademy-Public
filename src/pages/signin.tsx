import React from "react";
import { ReactElement } from "react-markdown/lib/react-markdown";
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
