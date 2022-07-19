import { createTheme } from "@mui/material/styles";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import { deepmerge } from "@mui/utils";
import React, { createContext, FC, ReactNode, useContext, useMemo, useState } from "react";
import { ThemeActions } from "src/knowledgeTypes";

import { getDesignTokens, getThemedComponents } from "@/lib/theme/brandingTheme";

const ThemeActionsContext = createContext<ThemeActions | undefined>(undefined);

type Props = {
  children: ReactNode;
};
const ThemeProvider: FC<Props> = ({ children }) => {
  const [themeMode, setThemeMode] = useState<"light" | "dark">("light");

  const theme = useMemo(() => {
    const brandingDesignTokens = getDesignTokens(themeMode);
    let nextTheme = createTheme({
      ...brandingDesignTokens,
      palette: {
        ...brandingDesignTokens.palette,
        mode: themeMode
      }
    });

    nextTheme = deepmerge(nextTheme, getThemedComponents(nextTheme));
    return nextTheme;
  }, [themeMode]);

  return (
    <MuiThemeProvider theme={theme}>
      <ThemeActionsContext.Provider value={{ setThemeMode }}>{children}</ThemeActionsContext.Provider>
    </MuiThemeProvider>
  );
};

function useThemeDispatch() {
  const context = useContext(ThemeActionsContext);
  if (context === undefined) {
    throw new Error("ThemeActionsContext must be used within a ThemeProvides");
  }
  return context;
}

const use1AcademyTheme = (): [ThemeActions] => [useThemeDispatch()];

export { ThemeProvider, use1AcademyTheme };
