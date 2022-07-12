import { FirebaseError } from "firebase/app";
import React, { ReactNode, useState } from "react";

import { AuthLayout } from "@/components/layouts/AuthLayout";
import { SignInForm } from "@/components/SignInForm";
import { useAuth } from "@/context/AuthContext";
import { signIn } from "@/lib/firestoreClient/auth";

const SignInPage = () => {
  const [, { handleError }] = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      await signIn(email, password);
    } catch (error) {
      setIsLoading(false);
      handleError({ error, errorMessage: (error as FirebaseError).message });
    }
  };

  return (
    <div>
      <SignInForm onSignIn={handleSignIn} isLoading={isLoading} />
    </div>
  );
};

SignInPage.getLayout = (page: ReactNode) => {
  return <AuthLayout>{page}</AuthLayout>;
};

export default SignInPage;
