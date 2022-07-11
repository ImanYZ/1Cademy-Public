import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, updateProfile } from "firebase/auth";

export const signUp = async (name: string, email: string, password: string) => {
  const authClient = getAuth();
  const newUser = await createUserWithEmailAndPassword(authClient, email, password);
  await updateProfile(newUser.user, { displayName: name });
};

export const signIn = async (email: string, password: string) => {
  const authClient = getAuth();
  const userCredential = await signInWithEmailAndPassword(authClient, email, password);
  return userCredential.user;
};
