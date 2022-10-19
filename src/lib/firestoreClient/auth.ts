import axios from "axios";
import {
  createUserWithEmailAndPassword,
  getAuth,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { collection, getDocs, getFirestore, limit, query, where } from "firebase/firestore";
import { Reputation, User, UserBackground, UserTheme, UserView } from "src/knowledgeTypes";

export const signUp = async (name: string, email: string, password: string) => {
  const newUser = await createUserWithEmailAndPassword(getAuth(), email, password);
  await updateProfile(newUser.user, { displayName: name });
};

export const signIn = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(getAuth(), email, password);
  return userCredential.user;
};

export const sendVerificationEmail = async () => {
  const auth = getAuth();
  if (auth.currentUser) {
    await sendEmailVerification(auth.currentUser);
  }
};

// creating a new id token for current user on firebase auth database
// add token as authorization for every request to the server
// validate if user is a valid user
export const idToken = async () => {
  const userToken = await getAuth().currentUser?.getIdToken(/* forceRefresh */ true);
  axios.defaults.headers.common["authorization"] = userToken || "";
};

export const resetPassword = async (email: string) => {
  await sendPasswordResetEmail(getAuth(), email);
};

export const logout = async () => {
  await signOut(getAuth());
};

export const getIdToken = async (): Promise<string | undefined> => {
  const auth = getAuth();
  const token = auth.currentUser?.getIdToken(/* forceRefresh */ true);
  return token;
  // const userToken = await this.auth.currentUser.getIdToken(/* forceRefresh */ true);
  // axios.defaults.headers.common["Authorization"] = userToken;
};

export const retrieveAuthenticatedUser = async (userId: string) => {
  let user: User | null = null;
  let reputationsData: Reputation | null = null;
  let theme: UserTheme = "Dark";
  let view: UserView = "Graph";
  let background: UserBackground = "Color";
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
      ethnicity: userData.ethnicity ?? [],
      country: userData.country,
      state: userData.state,
      // stateInfo: userData.state, // CHECK: state and stateId is not used
      city: userData.city,
      // theme: userData.theme,
      // background: "background" in userData ? userData.background : "Image",
      uname: userData.uname,
      clickedConsent: userData.clickedConsent,
      clickedTOS: userData.clickedTOS,
      clickedPP: userData.clickedPP,
      clickedCP: userData.clickedCP,
      createdAt: userData.createdAt.toDate(),
      email: userData.email,
      reason: userData.reason,
      foundFrom: userData.foundFrom,
      occupation: userData.occupation,
      fieldOfInterest: userData.fieldOfInterest ?? "",
    };

    theme = userData.theme;
    view = "view" in userData ? userData.view : "Graph";
    background = "background" in userData ? userData.background : "Image";

    const reputationRef = collection(db, "reputations");
    const reputationQuery = query(
      reputationRef,
      where("uname", "==", userData.uname),
      where("tagId", "==", userData.tagId),
      limit(1)
    );

    const reputationsDoc = await getDocs(reputationQuery);
    if (reputationsDoc.docs.length !== 0) {
      const reputationDoc = reputationsDoc.docs[0];
      reputationsData = reputationDoc.data() as Reputation;
      // delete reputationsData.createdAt;
      // delete reputationsData.updatedAt;
      // delete reputationsData.tagId;
      // delete reputationsData.tag;
      // delete reputationsData.uname;
    }
  }

  return { user, reputation: reputationsData, theme, background, view };
};
