import { AuthState, DispatchAuthActions } from "src/knowledgeTypes";

export const INITIAL_STATE: AuthState = {
  isAuthInitialized: false,
  isAuthenticated: false,
  user: null,
  reputation: null,
  settings: {
    background: "Image",
    theme: "Dark",
  },
};

function authReducer(state: AuthState, action: DispatchAuthActions): AuthState {
  switch (action.type) {
    case "logoutSuccess":
      return { ...state, user: null, isAuthenticated: false, isAuthInitialized: true };
    case "loginSuccess":
      return {
        ...state,
        ...action.payload,
        isAuthenticated: true,
        settings: { theme: action.payload.theme, background: action.payload.background },
        isAuthInitialized: true,
      };
    case "setTheme":
      // update class
      return { ...state, settings: { ...state.settings, theme: action.payload } };
    case "setBackground":
      return { ...state, settings: { ...state.settings, background: action.payload } };
  }
}

export default authReducer;
