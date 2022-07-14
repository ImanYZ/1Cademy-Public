import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useSnackbar } from "notistack";
import { createContext, FC, ReactNode, useCallback, useContext, useEffect, useReducer } from "react";
import { AuthActions, AuthState, ErrorOptions } from "src/knowledgeTypes";

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

  const loadUser = useCallback(async (userId: string) => {
    try {
      const user = await retrieveAuthenticatedUser(userId);
      if (user) {
        dispatch({ type: "loginSuccess", payload: user });
      } else {
        dispatch({ type: "logoutSuccess" });
      }
    } catch (error) {
      dispatch({ type: "logoutSuccess" });
    }
  }, []);

  useEffect(() => {
    const auth = getAuth();
    const unsubscriber = onAuthStateChanged(auth, user => {
      if (user) {
        loadUser(user.uid);
      } else {
        dispatch({ type: "logoutSuccess" });
      }
    });
    return () => unsubscriber();
  }, [loadUser]);

  const handleError = ({ error, errorMessage, showErrorToast = true }: ErrorOptions) => {
    //TODO: setup error reporting in google cloud
    console.log("TODO: setup error reporting in google cloud", error, errorMessage, showErrorToast);
    if (showErrorToast) {
      const errorString = typeof error === "string" ? error : "";
      enqueueSnackbar(errorMessage && errorMessage.length > 0 ? errorMessage : errorString, {
        variant: "error",
        autoHideDuration: 10000
      });
    }
  };

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
