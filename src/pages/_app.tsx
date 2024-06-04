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
      // const firebaseConfig = encodeURIComponent(
      //   JSON.stringify({
      //     apiKey: process.env.NEXT_PUBLIC_API_KEY,
      //     authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
      //     databaseURL: process.env.NEXT_PUBLIC_DATA_BASE_URL,
      //     projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
      //     storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
      //     messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
      //     appId: process.env.NEXT_PUBLIC_APP_ID,
      //     measurementId: process.env.NEXT_PUBLIC_MEASUREMENT_ID,
      //   })
      // );
      // navigator.serviceWorker
      //   .register(`../../../firebase-messaging-sw.js?firebaseConfig=${firebaseConfig}`)
      //   .then(function (registration) {
      //     console.info("Registration successful, scope is:", registration.scope);
      //   })
      //   .catch(function (err) {
      //     console.error("Service worker registration failed, error:", err);
      //   });

      navigator.serviceWorker.register("../../../firebase-messaging-sw.js").catch(err => {
        console.error("Service Worker registration failed:", err);
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
