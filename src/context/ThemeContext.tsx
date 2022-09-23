import { createTheme } from "@mui/material/styles";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import { deepmerge } from "@mui/utils";
import React, { FC, ReactNode, useMemo } from "react";
import { UserTheme } from "src/knowledgeTypes";

import { getDesignTokens, getThemedComponents } from "@/lib/theme/brandingTheme";

import { useAuth } from "./AuthContext";

// const ThemeActionsContext = createContext<ThemeActions | undefined>(undefined);

type Props = {
  children: ReactNode;
};
const ThemeProvider: FC<Props> = ({ children }) => {
  const [{ settings }] = useAuth();
  // const [themeMode, setThemeMode] = useState<AppTheme>("dark");

  const getMUIModeTheme = (theme?: UserTheme) => {
    if (theme === "Dark") return "dark";
    if (theme === "Light") return "light";
    return "dark";
  };
  const theme = useMemo(() => {
    const currentTheme = getMUIModeTheme(settings.theme);
    const brandingDesignTokens = getDesignTokens(currentTheme);
    let nextTheme = createTheme({
      ...brandingDesignTokens,
      palette: {
        ...brandingDesignTokens.palette,
        mode: currentTheme,
      },
    });

    nextTheme = deepmerge(nextTheme, getThemedComponents(nextTheme));
    return nextTheme;
  }, [settings.theme]);

  return <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>;
};

// function useThemeDispatch() {
//   const context = useContext(ThemeActionsContext);
//   if (context === undefined) {
//     throw new Error("ThemeActionsContext must be used within a ThemeProvides");
//   }
//   return context;
// }

// const use1AcademyTheme = (): [ThemeActions] => [useThemeDispatch()];

export { ThemeProvider /*, use1AcademyTheme*/ };
