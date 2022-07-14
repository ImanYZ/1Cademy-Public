import { Button, Typography } from "@mui/material";
import { Box, ThemeProvider } from "@mui/system";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { ReactNode, useCallback, useEffect } from "react";

import { useAuth } from "@/context/AuthContext";

import libraryImage from "../../../public/LibraryBackground.jpg";
import { brandingDarkTheme } from "../../lib/theme/brandingTheme";
import ROUTES from "../../lib/utils/routes";

type AuthProps = {
  children: ReactNode;
};

export const AuthLayout = ({ children }: AuthProps) => {
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
    return null;
  }

  return (
    <ThemeProvider theme={brandingDarkTheme}>
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
        <Image alt="Library" src={libraryImage} layout="fill" objectFit="cover" priority />
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
          <Box
            sx={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              py: "54px",
              background: theme => theme.palette.common.darkGrayBackground
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
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};
