import "../global.css";

import type { EmotionCache } from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { deepmerge } from "@mui/utils";
import type { NextPage } from "next";
import type { AppProps } from "next/app";
import Head from "next/head";
import { SnackbarProvider } from "notistack";
import { ReactElement, ReactNode, useMemo, useState } from "react";
import { Hydrate, QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";

import { AuthProvider } from "@/context/AuthContext";
import { createEmotionCache } from "@/lib/theme/createEmotionCache";

import { getDesignTokens, getThemedComponents } from "../lib/theme/brandingTheme";

const clientSideEmotionCache = createEmotionCache();

export type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};

// ** Extend App Props with Emotion
type ExtendedAppProps = AppProps & {
  Component: NextPageWithLayout;
  emotionCache: EmotionCache;
};

// export type NextPageWithLayout = NextPage & {
//   getLayout?: (page: ReactElement) => ReactNode
// }

// type AppPropsWithLayout = AppProps & {
//   Component: NextPageWithLayout
// }

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
    const nextTheme = deepmerge(getDesignTokens("light"), getThemedComponents());
    return nextTheme;
  }, []);

  const getLayout = Component.getLayout ?? (page => page);

  return (
    <QueryClientProvider client={queryClient}>
      <Hydrate state={pageProps.dehydratedState}>
        <CacheProvider value={emotionCache}>
          <Head>
            <meta name="viewport" content="initial-scale=1, width=device-width" />
          </Head>
          <ThemeProvider theme={theme}>
            <SnackbarProvider
              anchorOrigin={{
                vertical: "top",
                horizontal: "center"
              }}
              maxSnack={3}
            >
              <CssBaseline />
              <AuthProvider>{getLayout(<Component {...pageProps} />)}</AuthProvider>
            </SnackbarProvider>
          </ThemeProvider>
        </CacheProvider>
      </Hydrate>
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
};

export default App;
