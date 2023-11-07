import { uuidv4 } from "@firebase/util";
import { createTheme } from "@mui/material/styles";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import { deepmerge } from "@mui/utils";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDatabase, goOffline, goOnline, onDisconnect, onValue, ref, serverTimestamp, set } from "firebase/database";
import React, { FC, ReactNode, useEffect, useMemo } from "react";
import { UserTheme } from "src/knowledgeTypes";

import { getDesignTokens, getThemedComponents } from "@/lib/theme/brandingTheme";

import { useAuth } from "./AuthContext";

// const ThemeActionsContext = createContext<ThemeActions | undefined>(undefined);

type Props = {
  children: ReactNode;
};
const ThemeProvider: FC<Props> = ({ children }) => {
  const [{ user, settings }] = useAuth();
  const auth = getAuth();
  const db = getDatabase();
  useEffect(() => {
    // Fetch the current user's ID from Firebase Authentication.
    if (user) {
      goOnline(db);
      const sessionId = uuidv4();
      var uname = user?.uname;
      // Create a reference to this user's specific status node.
      // This is where we will store data about being online/offline.
      let userStatusDatabaseRef = ref(db, "/status/" + uname);
      //var userStatusFirestoreRef = doc(firestoreDb, "/status/" + uname);
      // We'll create two constants which we will write to
      // the Realtime database when this device is offline
      // or online.
      let isOfflineForDatabase = {
        sessionId,
        state: "offline",
        last_changed: serverTimestamp(),
      };
      let isOnlineForDatabase = {
        sessionId,
        state: "online",
        last_changed: serverTimestamp(),
      };
      // Create a reference to the special '.info/connected' path in
      // Realtime Database. This path returns `true` when connected
      // and `false` when disconnected.
      const infRef = ref(db, ".info/connected");
      onValue(infRef, snapshot => {
        if (snapshot.val() == false) {
          set(userStatusDatabaseRef, isOfflineForDatabase);
          return;
        }
        onDisconnect(userStatusDatabaseRef)
          .set(isOfflineForDatabase)
          .then(() => {
            set(userStatusDatabaseRef, isOnlineForDatabase);
          });
      });

      onAuthStateChanged(auth, user => {
        if (!user) {
          goOffline(db);
        }
      });
    }
  }, [user]);

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
