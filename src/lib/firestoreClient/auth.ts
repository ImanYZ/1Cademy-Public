import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth"

import { authClient } from "./firestoreClient.config"

export const signUp = async (name: string, email: string, password: string) => {
  const newUser = await createUserWithEmailAndPassword(authClient, email, password)
  await updateProfile(newUser.user, { displayName: name })
}

export const signIn = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(authClient, email, password)
  return userCredential.user
}
