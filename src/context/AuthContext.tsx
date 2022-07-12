import { getAuth, onAuthStateChanged } from "firebase/auth";
// import { useRouter } from "next/router";
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
  // const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  // const redirect = useCallback(
  //   (url: string) => {
  //     router.replace(url);
  //   },
  //   [router]
  // );

  const loadUser = useCallback(async (userId: string) => {
    console.log("TODO: remove this", userId);
    const user = await retrieveAuthenticatedUser("4AMf9prT68WTLxJ9ZTSONZ0vDvC3");
    // dispatch();
    console.log("user", user);
  }, []);

  useEffect(() => {
    console.log("======================= va a createFirebaseApp");
    const auth = getAuth();

    const unsubscriber = onAuthStateChanged(auth, user => {
      console.log("user", user);
      if (user) {
        console.log("user is signed in ");
        //  dispatch({type:"loginSucess", payload:})
        loadUser(user.uid);
      } else {
        console.log("user is signed off ");
      }
    });
    return () => unsubscriber();
  }, [loadUser]);

  const handleError = ({ error, errorMessage, showErrorToast = true }: ErrorOptions) => {
    //TODO: setup error reporting in google cloud
    console.log("TODO: setup error reporting in google cloud", error, errorMessage, showErrorToast);
    if (showErrorToast) {
      const errorString = typeof error === "string" ? error : "";
      enqueueSnackbar(errorMessage && errorMessage.length > 0 ? errorMessage : errorString, { variant: "error" });
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
