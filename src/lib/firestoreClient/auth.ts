import {
  createUserWithEmailAndPassword,
  getAuth,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from "firebase/auth";
import { collection, getDocs, getFirestore, limit, query, where } from "firebase/firestore";
import { User } from "src/knowledgeTypes";

export const signUp = async (name: string, email: string, password: string) => {
  const newUser = await createUserWithEmailAndPassword(getAuth(), email, password);
  await updateProfile(newUser.user, { displayName: name });
};

export const signIn = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(getAuth(), email, password);
  return userCredential.user;
};

export const resetPassword = async (email: string) => {
  await sendPasswordResetEmail(getAuth(), email);
};

export const logout = async () => {
  await signOut(getAuth());
};

export const retrieveAuthenticatedUser = async (userId: string) => {
  let user: User | null = null;
  const db = getFirestore();

  const nodesRef = collection(db, "users");
  const q = query(nodesRef, where("userId", "==", userId), limit(1));
  const userDoc = await getDocs(q);
  if (userDoc.size !== 0) {
    const userData = userDoc.docs[0].data();
    user = {
      userId,
      deCourse: userData.deCourse,
      deInstit: userData.deInstit,
      deMajor: userData.deMajor,
      tag: userData.tag,
      tagId: userData.tagId,
      deCredits: userData.deCredits,
      sNode: "sNode" in userData ? userData.sNode : null,
      practicing: userData.practicing,
      imageUrl: userData.imageUrl,
      fName: userData.fName,
      lName: userData.lName,
      chooseUname: userData.chooseUname,
      lang: userData.lang,
      gender: userData.gender,
      ethnicity: userData.ethnicity,
      country: userData.country,
      stateInfo: userData.state,
      city: userData.city,
      theme: userData.theme,
      background: "background" in userData ? userData.background : "Image",
      uname: userData.uname,
      clickedConsent: userData.clickedConsent,
      clickedTOS: userData.clickedTOS,
      clickedPP: userData.clickedPP,
      clickedCP: userData.clickedCP,
      createdAt: userData.createdAt.toDate()
    };
  }

  return user;
};
