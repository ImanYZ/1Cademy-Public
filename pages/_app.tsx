import "../styles/global.css";

import type { EmotionCache } from "@emotion/cache";
// ** Emotion Imports
import { CacheProvider } from "@emotion/react";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { createTheme } from "@mui/material/styles";
import { deepmerge } from "@mui/utils";
import type { NextPage } from "next";
import type { AppProps } from "next/app";
import Head from "next/head";
import { SnackbarProvider } from "notistack";
import { useMemo, useState } from "react";
import { Hydrate, QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";

import { getDesignTokens, getThemedComponents } from "../src/brandingTheme";
import { createEmotionCache } from "../src/createEmotionCache";

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

// ** Extend App Props with Emotion
type ExtendedAppProps = AppProps & {
  Component: NextPage;
  emotionCache: EmotionCache;
};

// ** Configure JSS & ClassName
const App = (props: ExtendedAppProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
              {/* <Component {...pageProps} /> */}
              <link href="https://fonts.googleapis.com/css?family=Open+Sans" rel="stylesheet" type="text/css" />
              <div
                style={{
                  margin: "0px auto",
                  width: "400px"
                }}
                id="maintenance-page"
              >
                <h1 className="nl_open-sans">Planned Upgrade Today</h1>
                <img src="/asset/maintenance.png" />
                <p>
                  This tool is temporarily unavailable due to a planned upgrade.
                  <br />
                  <br />
                  We expect to be finished with maintenance by midnight (Pacific time), Saturday night.
                  <br />
                  <br />
                  We apologize for any inconvenience.
                </p>
              </div>
            </SnackbarProvider>
          </ThemeProvider>
        </CacheProvider>
      </Hydrate>
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
};

export default App;
