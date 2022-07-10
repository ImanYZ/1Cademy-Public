import "../global.css";

import type { EmotionCache } from "@emotion/cache";
// ** Emotion Imports
import { CacheProvider } from "@emotion/react";
import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { deepmerge } from "@mui/utils";
import type { NextPage } from "next";
import type { AppProps } from "next/app";
import Head from "next/head";
import { SnackbarProvider } from "notistack";
import { useMemo, useState } from "react";
import { Hydrate, QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";

import { AuthProvider } from "@/context/AuthContext";

import { getDesignTokens, getThemedComponents } from "../brandingTheme";
import { createEmotionCache } from "../createEmotionCache";

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

// ** Extend App Props with Emotion
type ExtendedAppProps = AppProps & {
  Component: NextPage;
  emotionCache: EmotionCache;
};

// ** Configure JSS & ClassName
const App = (props: ExtendedAppProps) => {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: false
          }
        }
      })
  );
  const theme = useMemo(() => {
    const brandingDesignTokens = getDesignTokens("light");
    let nextTheme = createTheme({
      ...brandingDesignTokens,
      palette: {
        ...brandingDesignTokens.palette,
        mode: "light"
      }
    });

    nextTheme = deepmerge(nextTheme, getThemedComponents());
    return nextTheme;
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Hydrate state={pageProps.dehydratedState}>
        <CacheProvider value={emotionCache}>
          <Head>
            <meta name="viewport" content="initial-scale=1, width=device-width" />
          </Head>
          <ThemeProvider theme={theme}>
            <SnackbarProvider maxSnack={3}>
              <CssBaseline />
              <AuthProvider>
                <Component {...pageProps} />
              </AuthProvider>
            </SnackbarProvider>
          </ThemeProvider>
        </CacheProvider>
      </Hydrate>
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
};

export default App;
