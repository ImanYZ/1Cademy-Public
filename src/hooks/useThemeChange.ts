import { collection, doc, getFirestore, setDoc, Timestamp, updateDoc } from "firebase/firestore";
import { useCallback } from "react";

import { useAuth } from "@/context/AuthContext";

const useThemeChange = () => {
  const db = getFirestore();
  const [{ user, settings }, { dispatch }] = useAuth();

  const changeAttr = useCallback(
    (
        attrName:
          | "fName"
          | "lName"
          | "theme"
          | "background"
          | "chooseUname"
          | "lang"
          | "gender"
          | "ethnicity"
          | "country"
          | "state"
          | "city"
          | "reason"
          | "foundFrom"
          | "birthDate"
          | "view"
      ) =>
      async (newValue: any) => {
        if (!user) return;
        const userRef = doc(db, "users", user.uname);
        await updateDoc(userRef, { [attrName]: newValue });
        let userLogCollection = "";
        switch (attrName) {
          case "fName":
            userLogCollection = "userFNameLog";
            break;
          case "lName":
            userLogCollection = "userLNameLog";
            break;
          case "theme":
            userLogCollection = "userThemeLog";
            break;
          case "background":
            userLogCollection = "userBackgroundLog";
            break;
          case "chooseUname":
            userLogCollection = "userChooseUnameLog";
            break;
          case "lang":
            userLogCollection = "userLangLog";
            break;
          case "gender":
            userLogCollection = "userGenderLog";
            break;
          case "ethnicity":
            userLogCollection = "userEthnicityLog";
            break;
          case "country":
            userLogCollection = "userCountryLog";
            break;
          case "state":
            userLogCollection = "userStateLog";
            break;
          case "city":
            userLogCollection = "userCityLog";
            break;
          case "reason":
            userLogCollection = "userReasonLog";
            break;
          case "foundFrom":
            userLogCollection = "userFoundFromLog";
            break;
          case "birthDate":
            userLogCollection = "userBirthDayLog";
            break;
          case "view":
            userLogCollection = "userViewLog";
            break;
          default:
          // code block
        }

        const userLogRef = doc(collection(db, userLogCollection));
        await setDoc(userLogRef, {
          uname: user.uname,
          [attrName]: newValue,
          createdAt: Timestamp.fromDate(new Date()),
        });
      },
    [db, user]
  );
  const handleThemeSwitch = useCallback(
    (event: any) => {
      event.preventDefault();
      const newTheme = settings.theme === "Dark" ? "Light" : "Dark";
      changeAttr("theme")(newTheme);
      // setTheme(newTheme);
      dispatch({ type: "setTheme", payload: newTheme });
    },
    [changeAttr, dispatch, settings.theme]
  );

  return [handleThemeSwitch];
};

export default useThemeChange;
