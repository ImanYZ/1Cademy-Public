import { AuthState, DispatchAuthActions, UserBackground, UserTheme } from "src/knowledgeTypes";

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
      toggleThemeHTML(action.payload.theme);
      toggleBackgroundHTML(action.payload.background);
      return {
        ...state,
        ...action.payload,
        isAuthenticated: true,
        settings: { theme: action.payload.theme, background: action.payload.background },
        isAuthInitialized: true,
      };
    case "setTheme":
      toggleThemeHTML(action.payload);
      return { ...state, settings: { ...state.settings, theme: action.payload } };
    case "setBackground":
      toggleBackgroundHTML(action.payload);
      return { ...state, settings: { ...state.settings, background: action.payload } };
    case "setAuthUser":
      return { ...state, user: action.payload };
  }
}
const toggleThemeHTML = (theme: UserTheme) => {
  if (theme === "Dark") {
    document.body.classList.remove("LightMode");
  } else if (theme === "Light") {
    document.body.classList.add("LightMode");
  }
};
const toggleBackgroundHTML = (background: UserBackground) => {
  if (background === "Color") {
    document.body.classList.remove("Image");
  } else if (background === "Image") {
    document.body.classList.add("Image");
  }
};

export default authReducer;
