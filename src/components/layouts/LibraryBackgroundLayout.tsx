import { Box, ThemeProvider } from "@mui/material";
import Image from "next/image";
import { FC, ReactNode } from "react";

import { brandingDarkTheme } from "@/lib/theme/brandingTheme";

import libraryImage from "../../../public/LibraryBackground.jpg";

type Props = {
  children: ReactNode;
};

const LibraryFullBackgroundLayout: FC<Props> = ({ children }) => {
  return (
    <ThemeProvider theme={brandingDarkTheme}>
      <Box
        data-testid="library-background-layout"
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
      {children}
    </ThemeProvider>
  );
};

export default LibraryFullBackgroundLayout;
