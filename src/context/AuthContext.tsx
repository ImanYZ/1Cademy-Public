import { getAuth, onAuthStateChanged } from "firebase/auth";
import { createContext, FC, ReactNode, useContext, useEffect, useReducer } from "react";
import { AuthActions, AuthState, ErrorOptions } from "src/knowledgeTypes";

import { createFirebaseApp } from "@/lib/firestoreClient/firestoreClient.config";
import authReducer, { INITIAL_STATE } from "@/lib/reducers/auth";

const AuthStateContext = createContext<AuthState | undefined>(undefined);
const AuthDispatchContext = createContext<AuthActions | undefined>(undefined);

type Props = {
  children: ReactNode;
  store?: AuthState;
};

const AuthProvider: FC<Props> = ({ children, store }) => {
  const [state, dispatch] = useReducer(authReducer, store || INITIAL_STATE);

  useEffect(() => {
    const app = createFirebaseApp();
    const auth = getAuth(app);

    const unsubscriber = onAuthStateChanged(auth, user => {
      console.log("user", user);
      if (user) {
        console.log("user is signed in ");
      } else {
        console.log("user is signed off ");
      }
    });
    return () => unsubscriber();
  }, []);

  const handleError = ({ error, errorMessage, showErrorToast = true }: ErrorOptions) => {
    //TODO: setup error reporting in google cloud
    console.log("TODO: setup error reporting in google cloud", error, errorMessage, showErrorToast);
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
