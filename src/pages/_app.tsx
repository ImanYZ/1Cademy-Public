import "../global.css";

import { CacheProvider } from "@emotion/react";
import CssBaseline from "@mui/material/CssBaseline";
// import axios from "axios";
import Head from "next/head";
import { SnackbarProvider } from "notistack";
import { useEffect, useState } from "react";
import { Hydrate, QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { AppPropsWithLayout } from "src/knowledgeTypes";

import ErrorBoundary from "@/components/ErrorBoundary";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { initFirebaseClientSDK } from "@/lib/firestoreClient/firestoreClient.config";
import { createEmotionCache } from "@/lib/theme/createEmotionCache";

const clientSideEmotionCache = createEmotionCache();

// axios.defaults.baseURL = "/api";

initFirebaseClientSDK();

const App = (props: AppPropsWithLayout) => {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: false,
          },
        },
      })
  );

  const getLayout = Component.getLayout ?? (page => page);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/service-worker.js");
      const firebaseConfig = encodeURIComponent(
        JSON.stringify({
          apiKey: "AIzaSyAyfoXvWQIsK1_BTzoTaPMPnBhjr6ZtZpY",
          authDomain: "onecademy-dev.firebaseapp.com",
          databaseURL: "https://onecademy-dev-default-rtdb.firebaseio.com",
          projectId: "onecademy-dev",
          storageBucket: "onecademy-dev.appspot.com",
          messagingSenderId: "735079871954",
          appId: "1:735079871954:web:d7de111435f188126e840b",
          measurementId: "G-0CNKQJY7Y2",
        })
      );
      navigator.serviceWorker
        .register(`../../../firebase-messaging-sw.js?firebaseConfig=${firebaseConfig}`)
        .then(function (registration) {
          console.info("Registration successful, scope is:", registration.scope);
        })
        .catch(function (err) {
          console.info("Service worker registration failed, error:", err);
        });
    }
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Hydrate state={pageProps.dehydratedState}>
          <CacheProvider value={emotionCache}>
            <Head>
              <meta name="viewport" content="initial-scale=1, width=device-width" />
            </Head>
            {/* <ThemeProvider> */}
            <SnackbarProvider
              anchorOrigin={{
                vertical: "top",
                horizontal: "center",
              }}
              maxSnack={3}
            >
              <AuthProvider>
                <ThemeProvider>
                  <CssBaseline />
                  {getLayout(<Component {...pageProps} />)}
                  <div id="portal"></div>
                </ThemeProvider>
              </AuthProvider>
            </SnackbarProvider>
            {/* </ThemeProvider> */}
          </CacheProvider>
        </Hydrate>
        <ReactQueryDevtools />
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
