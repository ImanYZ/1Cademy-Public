import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useSnackbar } from "notistack";
import { createContext, FC, ReactNode, useCallback, useContext, useEffect, useReducer } from "react";
import { AuthActions, AuthState, ErrorOptions, UserRole } from "src/knowledgeTypes";

import { retrieveAuthenticatedUser } from "@/lib/firestoreClient/auth";
import authReducer, { INITIAL_STATE } from "@/lib/reducers/auth";

const AuthStateContext = createContext<AuthState | undefined>(undefined);
const AuthDispatchContext = createContext<AuthActions | undefined>(undefined);

type Props = {
  children: ReactNode;
  store?: AuthState;
};

const AuthProvider: FC<Props> = ({ children, store }) => {
  const [state, dispatch] = useReducer(authReducer, store || INITIAL_STATE);
  const { enqueueSnackbar } = useSnackbar();

  const handleError = useCallback(
    ({ error, errorMessage, showErrorToast = true }: ErrorOptions) => {
      //TODO: setup error reporting in google cloud
      if (showErrorToast) {
        const errorString = typeof error === "string" ? error : "";
        enqueueSnackbar(errorMessage && errorMessage.length > 0 ? errorMessage : errorString, {
          variant: "error",
          autoHideDuration: 10000,
        });
      }
    },
    [enqueueSnackbar]
  );

  const loadUser = useCallback(
    async (userId: string, role: UserRole) => {
      try {
        const { user, reputation, theme, background, view, showClusterOptions, showClusters } =
          await retrieveAuthenticatedUser(userId, role);
        if (!user) {
          handleError({ error: "Cant find user" });
          return;
        }
        if (!reputation) {
          handleError({ error: "Cant find user" });
          return;
        }
        if (user && reputation) {
          dispatch({
            type: "loginSuccess",
            payload: { user, reputation, theme, background, view, showClusterOptions, showClusters },
          });
        } else {
          dispatch({ type: "logoutSuccess" });
        }
      } catch (error) {
        dispatch({ type: "logoutSuccess" });
      }
    },
    [handleError]
  );

  useEffect(() => {
    const auth = getAuth();

    const unsubscriber = onAuthStateChanged(auth, async user => {
      if (user) {
        const res = await user.getIdTokenResult(true);
        const role: UserRole = res.claims["instructor"] ? "INSTRUCTOR" : res.claims["student"] ? "STUDENT" : null;
        //sign in
        loadUser(user.uid, role);
      } else {
        //sign out
        dispatch({ type: "logoutSuccess" });
      }
    });
    return () => unsubscriber();
  }, [loadUser]);

  const dispatchActions = { dispatch, handleError };

  return (
    <AuthStateContext.Provider value={state}>
      <AuthDispatchContext.Provider value={dispatchActions}>{children}</AuthDispatchContext.Provider>
    </AuthStateContext.Provider>
  );
};

function useAuthState() {
  const context = useContext(AuthStateContext);
  if (context === undefined) {
    throw new Error("AuthStateContext must be used within a AuthProvider");
  }
  return context;
}

function useAuthDispatch() {
  const context = useContext(AuthDispatchContext);
  if (context === undefined) {
    throw new Error("AuthDispatch must be used with a AuthProvider");
  }
  return context;
}

function useAuth() {
  const res: [AuthState, AuthActions] = [useAuthState(), useAuthDispatch()];
  return res;
}

export { AuthProvider, useAuth };
