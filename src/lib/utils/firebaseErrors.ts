import { FirebaseError } from "firebase/app";

export const getFirebaseFriendlyError = (error: FirebaseError): string => {
  switch (error.code) {
    case "auth/weak-password":
      return "Strong passwords have at least 6 characters and a mix of letters and numbers.";
    case "auth/expired-action-code":
      return "Your request to reset your password has expired or the link has already been used.";
    case "auth/user-not-found":
      return "There is no user record corresponding to this identifier.";
    case "auth/email-already-exists":
      return "The email address is already in use by another account.";
    case "auth/user-not-found":
      return "There is no user record corresponding to this identifier.";
    case "auth/wrong-password":
      return "The password is invalid.";
    case "auth/too-many-requests":
      return "This account is temporarily disabled due to multiple failed login attempts. Restore access by resetting your password or trying again later.";
    default:
      return error.message;
  }
};
