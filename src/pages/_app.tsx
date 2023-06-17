import "../global.css";

import { CacheProvider } from "@emotion/react";
import CssBaseline from "@mui/material/CssBaseline";
import { getAuth } from "firebase/auth";
// import axios from "axios";
import Head from "next/head";
import { SnackbarProvider } from "notistack";
import { useEffect, useState } from "react";
import { Hydrate, QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { AppPropsWithLayout } from "src/knowledgeTypes";

import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { initFirebaseClientSDK } from "@/lib/firestoreClient/firestoreClient.config";
import { createEmotionCache } from "@/lib/theme/createEmotionCache";
import { getAssistantExtensionId } from "@/lib/utils/assistant.utils";

const clientSideEmotionCache = createEmotionCache();

// axios.defaults.baseURL = "/api";

initFirebaseClientSDK();

// worker for sending uname to assitant helper
(async () => {
  if (typeof chrome !== "undefined") {
    const auth = getAuth();
    auth.onAuthStateChanged(user => {
      if (user && chrome?.runtime?.sendMessage) {
        // sending user information to extension
        chrome.runtime.sendMessage(getAssistantExtensionId(), "onecademy-user-" + user?.displayName);
      }
    });
  }
})();

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
    }
  }, []);

  return (
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
  );
};

export default App;
