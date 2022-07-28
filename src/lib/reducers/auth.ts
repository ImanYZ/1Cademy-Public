import { AuthState, DispatchAuthActions } from "src/knowledgeTypes";

export const INITIAL_STATE: AuthState = {
  isAuthInitialized: false,
  isAuthenticated: false,
  user: null
};

function authReducer(state: AuthState, action: DispatchAuthActions): AuthState {
  switch (action.type) {
    case "logoutSuccess":
      return { ...state, user: null, isAuthenticated: false, isAuthInitialized: true };
    case "loginSuccess":
      return { ...state, user: { ...action.payload }, isAuthenticated: true, isAuthInitialized: true };
  }
}

export default authReducer;
