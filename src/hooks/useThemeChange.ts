import { collection, doc, getFirestore, setDoc, Timestamp, updateDoc } from "firebase/firestore";
import { useCallback } from "react";

import { useAuth } from "@/context/AuthContext";

const useThemeChange = () => {
  const db = getFirestore();
  const [{ user, settings }, { dispatch }] = useAuth();

  const changeAttr = useCallback(
    () => async (newValue: any) => {
      if (!user) return;
      const userRef = doc(db, "users", user.uname);
      await updateDoc(userRef, { ["theme"]: newValue });
      let userLogCollection = "userThemeLog";

      const userLogRef = doc(collection(db, userLogCollection));
      await setDoc(userLogRef, {
        uname: user.uname,
        ["theme"]: newValue,
        createdAt: Timestamp.fromDate(new Date()),
      });
    },
    [db, user]
  );
  const handleThemeSwitch = useCallback(
    (event: any) => {
      event.preventDefault();
      const newTheme = settings.theme === "Dark" ? "Light" : "Dark";
      changeAttr()(newTheme);
      // setTheme(newTheme);
      dispatch({ type: "setTheme", payload: newTheme });
    },
    [changeAttr, dispatch, settings.theme]
  );

  return [handleThemeSwitch];
};

export default useThemeChange;
