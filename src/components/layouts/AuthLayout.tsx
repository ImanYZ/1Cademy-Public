import { Box, Typography } from "@mui/material";
import { brown } from "@mui/material/colors";
import { ThemeProvider } from "@mui/material/styles";
import { deepmerge } from "@mui/utils";
import { FirebaseError } from "firebase-admin";
import React, { useMemo } from "react";

import { useAuth } from "@/context/AuthContext";
import { signIn } from "@/lib/firestoreClient/auth";
import { getDesignTokens, getThemedComponents } from "@/lib/theme/brandingTheme";

const AuthPage = () => {
  const [, { handleError }] = useAuth();
  const [value, setValue] = React.useState(0);

  const handleSignIn = async (email: string, password: string) => {
    try {
      const res = await signIn(email, password);
      console.log("res", res);
    } catch (error) {
      handleError({ error, errorMessage: (error as FirebaseError).message });
    }
  };

  const theme = useMemo(() => {
    const nextTheme = deepmerge(getDesignTokens("light"), getThemedComponents());
    return nextTheme;
  }, []);

  return (
    <ThemeProvider theme={getDesignTokens("dark")}>
      <Box
        sx={{
          width: "100vw",
          height: "100vh",
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          ":before": {
            content: '""',
            width: "100vw",
            height: "100vh",
            position: "absolute",
            background: brown[700],
            backgroundImage: `url(${"/LibraryBackground.jpg"})`,
            backgroundPosition: "center",
            filter: "brightness(0.25)"
          }
        }}
      >
        <Box
          sx={{
            width: "100%",
            height: "100%",
            position: "absolute",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <Box
            sx={{
              width: "1300px",
              height: "800px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr"
            }}
          >
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
            <Box
              sx={{
                width: "650px",
                height: "100%",
                p: "63px 125px",
                background: theme => theme.palette.common.darkGrayBackground
              }}
            >
              <Box sx={{ border: "dashed 2px royalBlue" }}>{children}</Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};
