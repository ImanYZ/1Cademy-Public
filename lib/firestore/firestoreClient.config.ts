import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore/lite";

import { config } from "./firebaseConfig";

const app = initializeApp(config);
export const db = getFirestore(app);
