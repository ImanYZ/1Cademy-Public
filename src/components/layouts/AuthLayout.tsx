import { Button, Paper, Typography } from "@mui/material";
import { Box } from "@mui/system";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useState
} from "react";

import { useAuth } from "@/context/AuthContext";

import libraryImage from "../../../public/LibraryBackground.jpg";
import logoGoogleCloud from "../../../public/logo-google-cloud.svg";
import logoHonor from "../../../public/logo-honor.svg";
import logoSchoolOfInformation from "../../../public/logo-school-of-information.svg";
import { AppBackground, AuthLayoutActions } from "../../knowledgeTypes";
import ROUTES from "../../lib/utils/routes";
import FullPageLogoLoading from "../FullPageLogoLoading";

const AuthLayoutContext = createContext<AuthLayoutActions | undefined>(undefined);

type AuthProps = {
  children: ReactNode;
};

export const AuthLayout = ({ children }: AuthProps) => {
  const [background, setBackground] = useState<AppBackground>("Image");
  const [{ isAuthenticated, isAuthInitialized }] = useAuth();
  const router = useRouter();

  const redirectToHome = useCallback(() => {
    router.replace(ROUTES.home);
  }, [router]);

  useEffect(() => {
    if (isAuthenticated && isAuthInitialized) {
      redirectToHome();
    }
  }, [isAuthenticated, isAuthInitialized, redirectToHome]);

  if (!isAuthInitialized || isAuthenticated) {
    return <FullPageLogoLoading />;
  }

  return (
    <AuthLayoutContext.Provider value={{ setBackground }}>
      <Box>
        <Box
          data-testid="auth-layout"
          sx={{
            width: "100vw",
            height: "100vh",
            position: "fixed",
            filter: "brightness(0.25)",
            zIndex: -2
          }}
        >
          {background === "Image" && (
            <Image alt="Library" src={libraryImage} layout="fill" objectFit="cover" priority />
          )}
        </Box>

        <Box
          sx={{
            width: "100vw",
            height: { xs: "auto", md: "100vh" },
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <Box
            sx={{
              width: "1300px",
              minHeight: "auto",
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gridTemplateRows: { xs: "297px auto", md: "auto" }
            }}
          >
            {/* left panel */}
            <Box
              sx={{
                width: "100%",
                height: "100%",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                color: theme => theme.palette.common.white
              }}
            >
              {/* this this image has absolute position, by their configuration */}
              <Image
                alt="Library"
                src={libraryImage}
                layout="fill"
                objectFit="cover"
                priority
                style={{ filter: "brightness(0.6)" }}
              />
              <Box
                sx={{
                  width: "200px",
                  height: "40px",
                  position: "absolute",
                  bottom: "15px",
                  left: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}
              >
                <a
                  rel="noreferrer"
                  target="_blank"
                  href="https://www.si.umich.edu/"
                  aria-label="Go to School of information"
                >
                  <Image src={logoSchoolOfInformation} alt="School of Information" height={41} width={47} />
                </a>
                <a
                  rel="noreferrer"
                  target="_blank"
                  href="https://www.honor.education/"
                  aria-label="Go to Honor Education"
                >
                  <Image src={logoHonor} alt="Honor Education" height={41} width={41} />
                </a>
                <a
                  rel="noreferrer"
                  target="_blank"
                  href="https://cloud.google.com/edu/researchers"
                  aria-label="Go to Google Cloud"
                >
                  <Image src={logoGoogleCloud} alt="Google Cloud" height={41} width={49} />
                </a>
              </Box>
              <Box sx={{ zIndex: 1 }}>
                <Typography textAlign={"center"} variant="h4">
                  Welcome to 1Cademy
                </Typography>
                <Typography textAlign={"center"} variant="subtitle1">
                  We Visualize Learning Pathways from Books & Research Papers.
                </Typography>
              </Box>
            </Box>
            {/* right panel */}
            <Paper
              sx={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                py: "54px"
              }}
            >
              <Box sx={{ maxWidth: "400px" }}>
                <Box
                  aria-label="basic tabs example"
                  sx={{
                    border: "solid 2px",
                    borderColor: "common.white"
                  }}
                >
                  <Link href={ROUTES.signIn}>
                    <Button
                      color="secondary"
                      sx={{
                        width: "50%",
                        p: "12px 16px",
                        textAlign: "center",
                        backgroundColor: router.pathname === ROUTES.signIn ? "common.white" : "inherit",
                        color: router.pathname === ROUTES.signIn ? "common.darkGrayBackground" : "common.white"
                      }}
                    >
                      LOG IN
                    </Button>
                  </Link>
                  <Link href={ROUTES.signUp}>
                    <Button
                      color="secondary"
                      sx={{
                        width: "50%",
                        p: "12px 16px",
                        textAlign: "center",
                        backgroundColor: router.pathname === ROUTES.signUp ? "common.white" : "inherit",
                        color: router.pathname === ROUTES.signUp ? "common.darkGrayBackground" : "common.white"
                      }}
                    >
                      SIGN UP
                    </Button>
                  </Link>
                </Box>
                {children}
              </Box>
            </Paper>
          </Box>
        </Box>
      </Box>
    </AuthLayoutContext.Provider>
  );
};

const useAppDispatch = () => {
  const context = useContext(AuthLayoutContext);
  if (context) return context;
  throw new Error("AuthLayoutContext must be used within a AuthLayoutProvider");
};

export const useAuthLayout = (): [setBackground: Dispatch<SetStateAction<AppBackground>>] => [
  useAppDispatch().setBackground
];
