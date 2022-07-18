import { Box, Card, CardContent, CardHeader, Link } from "@mui/material";
import Container from "@mui/material/Container";
import { applyActionCode } from "firebase/auth";
import { GetServerSideProps, NextPage } from "next";
import NextLink from "next/link";

import PagesNavbar from "@/components/PagesNavbar";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firestoreServer/admin";
import ROUTES from "@/lib/utils/routes";
import { getQueryParameter } from "@/lib/utils/utils";

type Props = {
  mode: "verifyEmail";
  hasErrors: boolean;
};

const FirebaseUserManagementPage: NextPage<Props> = ({ mode, hasErrors }) => {
  const [{ isAuthenticated, isAuthInitialized, user }] = useAuth();
  console.log("FirebaseUserManagementPage user", user);
  console.log("isAuthenticated", isAuthenticated);
  console.log("isAuthInitialized", isAuthInitialized);

  return (
    <PagesNavbar showSearch={false}>
      <Container maxWidth="sm" data-testid="container-usermgnt" sx={{ py: 10 }}>
        {mode === "verifyEmail" && !hasErrors && (
          <Card>
            <CardHeader sx={{ textAlign: "center" }} title="Your email has been verified" />
            <CardContent sx={{ textAlign: "center", mb: 5 }}>
              <Box>Thank you for joining 1Cademy!</Box>
              <Box sx={{ mb: 5 }}>You can now start contributing to your community </Box>
              <NextLink href={ROUTES.home} passHref>
                <Link>Go Home</Link>
              </NextLink>
            </CardContent>
          </Card>
        )}
        {mode === "verifyEmail" && hasErrors && (
          <Card>
            <CardHeader sx={{ textAlign: "center" }} title="Try verifying your email again" />
            <CardContent sx={{ textAlign: "center", mb: 5 }}>
              <Box sx={{ mb: 5 }}>Your request to verify your email has expired or the link has already been used </Box>
              <NextLink href={ROUTES.home} passHref>
                <Link>Go Home</Link>
              </NextLink>
            </CardContent>
          </Card>
        )}
      </Container>
    </PagesNavbar>
  );
};

export const getServerSideProps: GetServerSideProps<any> = async ({ query, params }) => {
  console.log("params", params);
  console.log("query", query);
  const mode = getQueryParameter(query.mode || "verifyEmail");
  const actionCode = getQueryParameter(query.oobCode) || "";
  let hasErrors = true;
  switch (mode) {
    // case 'resetPassword':
    //   // Display reset password handler and UI.
    //   handleResetPassword(auth, actionCode, continueUrl, lang);
    //   break;
    // case 'recoverEmail':
    //   // Display email recovery handler and UI.
    //   handleRecoverEmail(auth, actionCode, lang);
    //   break;
    case "verifyEmail":
      hasErrors = await handleVerifyEmail(actionCode);
      break;
    default:
    // Error: invalid mode.
  }

  return { props: { mode, hasErrors } };
};

async function handleVerifyEmail(actionCode: string) {
  let hasErrors = false;
  try {
    await applyActionCode(auth, actionCode);
  } catch (error) {
    //TODO: Send error to error managemenet google cloud to analyze it"
    console.error("Error verifying email", error);
    hasErrors = true;
  }
  return hasErrors;
}
export default FirebaseUserManagementPage;
