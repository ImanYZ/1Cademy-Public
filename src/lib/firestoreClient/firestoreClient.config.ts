import { getAnalytics } from "firebase/analytics";
import { getApps, initializeApp } from "firebase/app";
import { connectAuthEmulator,getAuth } from "firebase/auth";
import { connectFirestoreEmulator,getFirestore } from "firebase/firestore";

export const initFirebaseClientSDK = () => {
  if (getApps().length <= 0) {
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
};

export const getFirebaseApp = () => {
  return getApps()[0];
};
