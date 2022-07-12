import React, { ReactNode } from "react";

import { AuthLayout } from "@/components/layouts/AuthLayout";
import { SignInForm } from "@/components/SignInForm";
import { signIn } from "@/lib/firestoreClient/auth";

const SignInPage = () => {
  const handleSignIn = async (email: string, password: string) => {
    const res = await signIn(email, password);
    console.log("res", res);
  };

  return (
    <div>
      <SignInForm onSignIn={handleSignIn} />
    </div>
  );
};

SignInPage.getLayout = (page: ReactNode) => {
  return <AuthLayout>{page}</AuthLayout>;
};

export default SignInPage;
