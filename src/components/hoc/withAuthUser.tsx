import { useRouter } from "next/router";
import { useCallback, useEffect } from "react";

import FullPageLogoLoading from "@/components/FullPageLogoLoading";
import { useAuth } from "@/context/AuthContext";
import ROUTES from "@/lib/utils/routes";

type Props = {
  shouldRedirectToLogin?: boolean;
  shouldRedirectToHomeIfAuthenticated?: boolean;
};

const withAuthUser =
  ({ shouldRedirectToHomeIfAuthenticated = true, shouldRedirectToLogin }: Props) =>
  (ChildComponent: any) => {
    const WithAuthUserHOC = (): JSX.Element => {
      const [{ isAuthenticated, isAuthInitialized }] = useAuth();
      const router = useRouter();

      const redirectToHome = useCallback(() => {
        router.replace(ROUTES.home);
      }, [router]);

      const redirectToLogin = useCallback(() => {
        router.replace({ pathname: ROUTES.signIn, query: { from: router.asPath } });
      }, [router]);

      useEffect(() => {
        if (shouldRedirectToHomeIfAuthenticated && isAuthenticated && isAuthInitialized) {
          redirectToHome();
        }
      }, [isAuthInitialized, isAuthenticated, redirectToHome]);

      useEffect(() => {
        if (shouldRedirectToLogin && !isAuthenticated && isAuthInitialized) {
          redirectToLogin();
        }
      }, [isAuthInitialized, isAuthenticated, redirectToLogin]);

      let returnVal = <ChildComponent />;

      if (
        !isAuthInitialized ||
        (shouldRedirectToLogin && !isAuthenticated) ||
        (shouldRedirectToHomeIfAuthenticated && isAuthenticated)
      ) {
        returnVal = <FullPageLogoLoading />;
      }

      return returnVal;
    };

    WithAuthUserHOC.displayName = "WithAuthUserHOC";

    return WithAuthUserHOC;
  };
export default withAuthUser;
