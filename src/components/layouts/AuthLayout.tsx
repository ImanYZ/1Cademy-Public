import { Button, Typography } from "@mui/material";
import { brown } from "@mui/material/colors";
import { Box, ThemeProvider } from "@mui/system";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { ReactNode } from "react";

import { getDesignTokens } from "../../lib/theme/brandingTheme";

type AuthProps = {
  children: ReactNode;
};

export const AuthLayout = ({ children }: AuthProps) => {
  const router = useRouter();

  const leftPanelAuth = () => {
    return (
      <>
        <Box
          sx={{
            width: "100%",
            height: "100%",
            position: "fixed",
            filter: "brightness(0.6)",
            zIndex: -1
          }}
        >
          <Image alt="Library" src="/LibraryBackground.jpg" layout="fill" objectFit="cover" quality={100} />
        </Box>

        <Box
          sx={{
            width: "100%",
            height: "100%",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            color: theme => theme.palette.common.white,

            ":before": {
              content: '""',
              width: "100%",
              height: "100%",
              position: "absolute",
              background: brown[700],
              backgroundImage: `url(${"/LibraryBackground.jpg"})`,
              backgroundPosition: "center",
              backgroundSize: "cover",
              filter: "brightness(0.6)"
            }
          }}
        >
          <Box sx={{ zIndex: 1 }}>
            <Typography textAlign={"center"} variant="h4">
              Welcome to 1Cademy
            </Typography>
            <Typography textAlign={"center"} variant="subtitle1">
              We Visualize Learning Pathways from Books & Research Papers.
            </Typography>
          </Box>
        </Box>
      </>
    );
  };

  const rightPanelAuth = () => {
    return (
      <Box
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
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
            <Link href={"/signin"}>
              <Button
                color="secondary"
                sx={{
                  width: "50%",
                  p: "12px 16px",
                  textAlign: "center",
                  backgroundColor: router.pathname === "/signin" ? "common.white" : "inherit",
                  color: router.pathname === "/signin" ? "common.darkGrayBackground" : "common.white"
                }}
              >
                LOG IN
              </Button>
            </Link>
            <Link href={"/signup"}>
              <Button
                color="secondary"
                sx={{
                  width: "50%",
                  p: "12px 16px",
                  textAlign: "center",
                  backgroundColor: router.pathname === "/signup" ? "common.white" : "inherit",
                  color: router.pathname === "/signup" ? "common.darkGrayBackground" : "common.white"
                }}
              >
                SIGN UP
              </Button>
            </Link>
          </Box>
          {children}
        </Box>
      </Box>
    );
  };

  return (
    <ThemeProvider theme={getDesignTokens("dark")}>
      <Box
        sx={{
          width: "100vw",
          height: "100vh",
          position: "fixed",
          filter: "brightness(0.25)",
          zIndex: -2
        }}
      >
        <Image alt="Library" src="/LibraryBackground.jpg" layout="fill" objectFit="cover" quality={100} />
      </Box>

      <Box
        sx={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <Box
          sx={{
            width: "1300px",
            height: "auto",
            display: "grid",
            gridTemplateColumns: "auto auto"
          }}
        >
          {leftPanelAuth()}
          {rightPanelAuth()}
        </Box>
      </Box>
    </ThemeProvider>
  );
};
