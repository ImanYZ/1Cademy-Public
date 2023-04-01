import { getAnalytics } from "firebase/analytics";
import { getApps, initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
let appExp: any;
let dbExp: any;
let auth: any;

export const initFirebaseClientSDK = () => {
  if (!getApps().filter(app => app.name === "[DEFAULT]").length) {
    if (process.env.NODE_ENV === "test") {
      const app = initializeApp({
        projectId: "test",
        appId: "test",
        apiKey: "test",
      });
      const db = getFirestore(app);
      connectFirestoreEmulator(db, "localhost", 8080);
      const auth = getAuth(app);
      connectAuthEmulator(auth, "http://localhost:9099");
    } else {
      initializeApp({
        apiKey: process.env.NEXT_PUBLIC_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
        databaseURL: process.env.NEXT_PUBLIC_DATA_BASE_URL,
        projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_APP_ID,
        measurementId: process.env.NEXT_PUBLIC_MEASUREMENT_ID,
      });
    }
    if (typeof window !== "undefined") {
      getAnalytics();
    }
  }

  if (!getApps().filter(app => app.name === "visualexp").length) {
    appExp = initializeApp(
      {
        apiKey: process.env.VISUALEXP_API_KEY,
        authDomain: process.env.VISUALEXP_AUTH_DOMAIN,
        projectId: process.env.VISUALEXP_PROJECT_ID,
        storageBucket: process.env.VISUALEXP_STORAGE_BUCKET,
        messagingSenderId: process.env.VISUALEXP_MESSAGING_SENDER_ID,
        appId: process.env.VISUALEXP_PUBLIC_APP_ID,
        measurementId: process.env.VISUALEXP_MEASUREMENT_ID,
      },
      "visualexp"
    );
  }
  dbExp = getFirestore(appExp);
  auth = getAuth(appExp);
};

export const getFirebaseApp = () => {
  return getApps()[0];
};

export { dbExp, auth, appExp };
