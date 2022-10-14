import { Box, Card, CardContent, CardHeader, Link } from "@mui/material";
import Container from "@mui/material/Container";
import { applyActionCode, getAuth, verifyPasswordResetCode } from "firebase/auth";
import { GetServerSideProps, NextPage } from "next";
import Image from "next/image";
import NextLink from "next/link";
import { useRouter } from "next/router";

import PasswordResetForm from "@/components/PasswordResetForm";
import ROUTES from "@/lib/utils/routes";
import { getQueryParameter } from "@/lib/utils/utils";

import libraryImage from "../../public/darkModeLibraryBackground.jpg";

type Props = {
  mode: "verifyEmail" | "resetPassword";
  hasErrors: boolean;
  email: string;
};

const FirebaseUserManagementPage: NextPage<Props> = ({ mode, hasErrors, email }) => {
  const router = useRouter();

  const actionCode = getQueryParameter(router.query.oobCode) || "";

  return (
    <Box>
      <Box
        data-testid="library-background-layout"
        sx={{
          width: "100vw",
          height: "100vh",
          position: "fixed",
          zIndex: -2,
        }}
      >
        <Image alt="Library" src={libraryImage} layout="fill" objectFit="cover" priority />
      </Box>
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
    </Box>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
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
      return {
        redirect: {
          permanent: false,
          destination: "/",
        },
      };
  }

  return { props: { mode, hasErrors, email } };
};

async function handleResetPassword(actionCode: string) {
  let email = "";
  let hasErrors = false;

  try {
    email = await verifyPasswordResetCode(getAuth(), actionCode);
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
    await applyActionCode(getAuth(), actionCode);
  } catch (error) {
    //TODO: Send error to error managemenet google cloud to analyze it"
    console.error("Error verifying email", error);
    hasErrors = true;
  }
  return hasErrors;
}
export default FirebaseUserManagementPage;
