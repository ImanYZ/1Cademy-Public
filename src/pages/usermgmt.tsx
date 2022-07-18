import { Box, Card, CardContent, CardHeader, Link } from "@mui/material";
import Container from "@mui/material/Container";
import { applyActionCode, verifyPasswordResetCode } from "firebase/auth";
import { GetServerSideProps, NextPage } from "next";
import NextLink from "next/link";
import { useRouter } from "next/router";

import LibraryFullBackgroundLayout from "@/components/layouts/LibraryBackgroundLayout";
import PasswordResetForm from "@/components/PasswordResetForm";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firestoreServer/admin";
import ROUTES from "@/lib/utils/routes";
import { getQueryParameter } from "@/lib/utils/utils";

type Props = {
  mode: "verifyEmail" | "resetPassword";
  hasErrors: boolean;
  email: string;
};

const FirebaseUserManagementPage: NextPage<Props> = ({ mode, hasErrors, email }) => {
  const router = useRouter();
  const [{ isAuthenticated, isAuthInitialized, user }] = useAuth();

  const actionCode = getQueryParameter(router.query.oobCode) || "";
  console.log("Client side actionCode", actionCode);

  console.log("FirebaseUserManagementPage user", user);
  console.log("isAuthenticated", isAuthenticated);
  console.log("isAuthInitialized", isAuthInitialized);

  return (
    <LibraryFullBackgroundLayout>
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
        {mode === "resetPassword" && !hasErrors && <PasswordResetForm email={email} actionCode={actionCode} />}
        {mode === "resetPassword" && hasErrors && (
          <Card>
            <CardHeader sx={{ textAlign: "center" }} title="Try resetting your password again" />
            <CardContent sx={{ textAlign: "center", mb: 5 }}>
              <Box sx={{ mb: 5 }}>
                Your request to reset your password has expired or the link has already been used
              </Box>
              <NextLink href={ROUTES.signIn} passHref>
                <Link>Go to sign in page</Link>
              </NextLink>
            </CardContent>
          </Card>
        )}
      </Container>
    </LibraryFullBackgroundLayout>
  );
};

export const getServerSideProps: GetServerSideProps<any> = async ({ query, params }) => {
  console.log("params", params);
  console.log("query", query);
  const mode = getQueryParameter(query.mode || "");
  const actionCode = getQueryParameter(query.oobCode) || "";
  let hasErrors = false;
  let email = "";
  switch (mode) {
    case "resetPassword":
      const res = await handleResetPassword(actionCode);
      email = res.email;
      hasErrors = res.hasErrors;
      break;
    case "verifyEmail":
      hasErrors = await handleVerifyEmail(actionCode);
      break;
    default:
    // Error: invalid mode.
  }

  return { props: { mode, hasErrors, email } };
};

async function handleResetPassword(actionCode: string) {
  let email = "";
  let hasErrors = false;

  try {
    email = await verifyPasswordResetCode(auth, actionCode);
  } catch (error) {
    //TODO: Send error to error managemenet google cloud to analyze it"
    console.error("Error verifying password reset code", error);
    hasErrors = true;
  }
  return { email, hasErrors };
}

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
