import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import { Autocomplete, FormControlLabel, FormGroup, Switch, TextField } from "@mui/material";
import { getAuth } from "firebase/auth";
import { collection, doc, getFirestore, setDoc, Timestamp, updateDoc } from "firebase/firestore";
// import Checkbox from "@material-ui/core/Checkbox";
// import ListItemText from "@material-ui/core/ListItemText";
// import MenuItem from "@material-ui/core/MenuItem";
// import Done from "@material-ui/icons/Done";
// import ExitToAppIcon from "@material-ui/icons/ExitToApp";
// import axios from "axios";
import React, { Suspense, useCallback, useEffect, useState } from "react";

import { useAuth } from "../../../context/AuthContext";
import { useNodeBook } from "../../../context/NodeBookContext";
// import { use1AcademyTheme } from "../../../context/ThemeContext";
import { useTagsTreeView } from "../../../hooks/useTagsTreeView";
import { User } from "../../../knowledgeTypes";
import { GENDER_VALUES } from "../../../lib/utils/constants";
import { ToUpperCaseEveryWord } from "../../../lib/utils/utils";
import { MemoizedTagsSearcher } from "../../TagsSearcher";
import { MemoizedInputSave } from "../InputSave";
import { MemoizedMetaButton } from "../MetaButton";
import Modal from "../Modal/Modal";
import { MemoizedSidebarTabs } from "../SidebarTabs/SidebarTabs";
// import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
// import Modal from "../../../../containers/Modal/Modal";
// import {
//   backgroundState,
//   chooseUnameState,
//   cityState,
//   countryState,
//   deInstitState,
//   ethnicityState,
//   firebaseState,
//   fNameState,
//   genderState,
//   isSubmittingState,
//   langState,
//   lNameState,
//   stateInfoState,
//   tagState,
//   themeState,
//   usernameState,
// } from "../../../../store/AuthAtoms";
// import { allTagsState, openToolbarState, showClustersState } from "../../../../store/MapAtoms";
// import { choosingNodeState, chosenNodeState, chosenNodeTitleState } from "../../../../store/NodeAtoms";
// import {
//   aCorrectsState,
//   aInstState,
//   aWrongsState,
//   cdCorrectsState,
//   cdInstState,
//   cdWrongsState,
//   cnCorrectsState,
//   cnInstState,
//   cnWrongsState,
//   iCorrectsState,
//   iInstState,
//   iWrongsState,
//   ltermDayState,
//   ltermMaxDayState,
//   ltermState,
//   mCorrectsState,
//   mInstState,
//   mWrongsState,
//   nCorrectsState,
//   nInstState,
//   nWrongsState,
//   pCorrectsState,
//   pInstState,
//   pWrongsState,
//   qCorrectsState,
//   qInstState,
//   qWrongsState,
//   rfCorrectsState,
//   rfInstState,
//   rfWrongsState,
//   sCorrectsState,
//   sInstState,
//   sWrongsState,
// } from "../../../../store/UserReputationAtoms";
// import shortenNumber from "../../../../utils/shortenNumber";
// import InputSave from "../../../Editor/InputSave/InputSave";
// import PersonalInfo from "../../../PublicComps/PersonalInfo/PersonalInfo";
// import UserSettingsSwitches from "../../../PublicComps/UserSettingsSwitches/UserSettingsSwitches";
// import MetaButton from "../../MetaButton/MetaButton";
// import SidebarTabs from "../SidebarTabs/SidebarTabs";
// import ProfileAvatar from "./ProfileAvatar";

// const TagSearch = React.lazy(() => import("../../../PublicComps/TagSearch/TagSearch"));

const doNothing = () => {};

// type UserSettingProps = {};

const UserSettings = (/*props: UserSettingProps*/) => {
  const db = getFirestore();
  const [{ settings }, { dispatch }] = useAuth();
  const { nodeBookState } = useNodeBook();
  const [{ user }] = useAuth();
  // console.log("rr", rr);
  const { allTags, setAllTags } = useTagsTreeView([]);
  const [languages, setLanguages] = useState<string[]>([]);
  // const [{ setThemeMode, themeMode }] = use1AcademyTheme(); // CHECK I comented

  // const firebase = useRecoilValue(firebaseState);
  // const [username, setUsername] = useRecoilState(usernameState);
  // const [fName, setFName] = useRecoilState(fNameState);
  // const [lName, setLName] = useRecoilState(lNameState);
  // const [tag, setTag] = useRecoilState(tagState);
  // const setIsSubmitting = useSetRecoilState(isSubmittingState);
  // const [choosingNode, setChoosingNode] = useRecoilState(choosingNodeState);
  // const [chosenNode, setChosenNode] = useRecoilState(chosenNodeState);
  // const [chosenNodeTitle, setChosenNodeTitle] = useRecoilState(chosenNodeTitleState);

  // // for Concept nodes
  // const cnCorrects = useRecoilValue(cnCorrectsState);
  // const cnWrongs = useRecoilValue(cnWrongsState);
  // const cnInst = useRecoilValue(cnInstState);
  // // for Code nodes
  // const cdCorrects = useRecoilValue(cdCorrectsState);
  // const cdWrongs = useRecoilValue(cdWrongsState);
  // const cdInst = useRecoilValue(cdInstState);
  // // for Question nodes
  // const qCorrects = useRecoilValue(qCorrectsState);
  // const qWrongs = useRecoilValue(qWrongsState);
  // const qInst = useRecoilValue(qInstState);
  // //  for Profile nodes
  // const pCorrects = useRecoilValue(pCorrectsState);
  // const pWrongs = useRecoilValue(pWrongsState);
  // const pInst = useRecoilValue(pInstState);
  // //  for Sequel nodes
  // const sCorrects = useRecoilValue(sCorrectsState);
  // const sWrongs = useRecoilValue(sWrongsState);
  // const sInst = useRecoilValue(sInstState);
  // //  for Advertisement nodes
  // const aCorrects = useRecoilValue(aCorrectsState);
  // const aWrongs = useRecoilValue(aWrongsState);
  // const aInst = useRecoilValue(aInstState);
  // //  for Reference nodes
  // const rfCorrects = useRecoilValue(rfCorrectsState);
  // const rfWrongs = useRecoilValue(rfWrongsState);
  // const rfInst = useRecoilValue(rfInstState);
  // //  for News nodes
  // const nCorrects = useRecoilValue(nCorrectsState);
  // const nWrongs = useRecoilValue(nWrongsState);
  // const nInst = useRecoilValue(nInstState);
  // //  for Relation nodes
  // const mCorrects = useRecoilValue(mCorrectsState);
  // const mWrongs = useRecoilValue(mWrongsState);
  // const mInst = useRecoilValue(mInstState);
  // //  for Idea nodes
  // const iCorrects = useRecoilValue(iCorrectsState);
  // const iWrongs = useRecoilValue(iWrongsState);
  // const iInst = useRecoilValue(iInstState);

  // const lterm = useRecoilValue(ltermState);
  // const ltermDay = useRecoilValue(ltermDayState);
  // const ltermMaxDay = useRecoilValue(ltermMaxDayState);
  // const setOpenToolbar = useSetRecoilState(openToolbarState);
  // const [showClusters, setShowClusters] = useRecoilState(showClustersState);
  // const [theme, setTheme] = useRecoilState(themeState);
  // const [background, setBackground] = useRecoilState(backgroundState);
  // const [chooseUname, setChooseUname] = useRecoilState(chooseUnameState);
  // const [lang, setLang] = useRecoilState(langState);
  // const [gender, setGender] = useRecoilState(genderState);
  // const [ethnicity, setEthnicity] = useRecoilState(ethnicityState);
  // const [country, setCountry] = useRecoilState(countryState);
  // const [stateInfo, setStateInfo] = useRecoilState(stateInfoState);
  // const [city, setCity] = useRecoilState(cityState);
  // const [deInstit, setDeInstit] = useRecoilState(deInstitState);
  // const [allTags, setAllTags] = useRecoilState(allTagsState);

  // const [instlogoURL, setInstlogoURL] = useState("");
  // const [totalPoints, setTotalPoints] = useState("");
  const [changingUsername /*, setChangingUsername*/] = useState(false);

  // const [chosenTags, setChosenTags] = useState([]);
  // const [birthDate, setBirthDate] = useState(new Date());
  const getOtherGenderValue = (user: User) => {
    if (!user?.gender) return "";
    if (user.gender === GENDER_VALUES[2] || !GENDER_VALUES.includes(user.gender)) return user.gender;
    return "";
  };
  const [genderOtherValue, setGenderOtherValue] = useState(getOtherGenderValue(user));
  const [ethnicityOtherValue /*setEthnicityOtherValue*/] = useState("");
  // const [CSCObj, setCSCObj] = useState([]);
  // const [allCountries, setAllCountries] = useState([]);

  const [reason, setReason] = useState(user?.reason || ""); // TODO: improve this

  // useEffect(()=>{},[])

  useEffect(() => {
    const getLanguages = async () => {
      const ISO6391Obj = await import("iso-639-1");
      const allLanguages = [
        ...ISO6391Obj.default.getAllNames().sort((l1, l2) => (l1 < l2 ? -1 : 1)),
        "Prefer not to say",
      ];
      setLanguages(allLanguages);
    };
    getLanguages();
  }, []);
  // useEffect(() => {
  //   setTotalPoints(
  //     cnCorrects -
  //       cnWrongs +
  //       cnInst +
  //       cdCorrects -
  //       cdWrongs +
  //       cdInst +
  //       qCorrects -
  //       qWrongs +
  //       qInst +
  //       pCorrects -
  //       pWrongs +
  //       pInst +
  //       sCorrects -
  //       sWrongs +
  //       sInst +
  //       aCorrects -
  //       aWrongs +
  //       aInst +
  //       rfCorrects -
  //       rfWrongs +
  //       rfInst +
  //       nCorrects -
  //       nWrongs +
  //       nInst +
  //       mCorrects -
  //       mWrongs +
  //       mInst +
  //       iCorrects -
  //       iWrongs +
  //       iInst
  //   );
  // }, [
  //   cnCorrects,
  //   cnWrongs,
  //   cnInst,
  //   cdCorrects,
  //   cdWrongs,
  //   cdInst,
  //   qCorrects,
  //   qWrongs,
  //   qInst,
  //   pCorrects,
  //   pWrongs,
  //   pInst,
  //   sCorrects,
  //   sWrongs,
  //   sInst,
  //   aCorrects,
  //   aWrongs,
  //   aInst,
  //   rfCorrects,
  //   rfWrongs,
  //   rfInst,
  //   nCorrects,
  //   nWrongs,
  //   nInst,
  //   mCorrects,
  //   mWrongs,
  //   mInst,
  //   iCorrects,
  //   iWrongs,
  //   iInst,
  // ]);

  // useEffect(() => {
  //   if (firebase && deInstit) {
  //     const fetchInstitution = async () => {
  //       const institutionsDocs = await firebase.db
  //         .collection("institutions")
  //         .where("name", "==", deInstit)
  //         .limit(1)
  //         .get();
  //       if (institutionsDocs.docs.length > 0) {
  //         const institutionData = institutionsDocs.docs[0].data();
  //         setInstlogoURL(institutionData.logoURL);
  //       }
  //     };
  //     fetchInstitution();
  //   }
  // }, [firebase && deInstit]);

  // useEffect(() => {
  //   if (chosenTags.length > 0 && chosenTags[0] in allTags) {
  //     setChosenNodeTitle(allTags[chosenTags[0]].title);
  //     setChosenNode(chosenTags[0]);
  //   }
  // }, [allTags, chosenTags]);

  // useEffect(() => {
  //   setAllTags(oldAllTags => {
  //     const newAllTags = { ...oldAllTags };
  //     const newChosenTags = [];
  //     for (let aTagId in newAllTags) {
  //       if (newAllTags[aTagId].checked && aTagId !== tag.node) {
  //         newAllTags[aTagId] = { ...oldAllTags[aTagId], checked: false };
  //       }
  //     }
  //     if (newChosenTags.length === 0 && tag.node in oldAllTags) {
  //       newAllTags[tag.node] = { ...oldAllTags[tag.node], checked: true };
  //       newChosenTags.push(tag.node);
  //     }
  //     setChosenTags(newChosenTags);
  //     return newAllTags;
  //   });
  // }, [tag]);

  // useEffect(() => {
  //   const setDefaultTag = async () => {
  //     if (choosingNode && chosenNode && choosingNode === "tag") {
  //       setIsSubmitting(true);
  //       try {
  //         await firebase.idToken();
  //         await axios.post(`/changeDefaultTag/${chosenNode}`);
  //         setTag({ node: chosenNode, title: chosenNodeTitle });
  //       } catch (err) {
  //         console.error(err);
  //         // window.location.reload();
  //       }
  //       setChoosingNode(false);
  //       setChosenNode(null);
  //       setChosenNodeTitle(null);
  //       setIsSubmitting(false);
  //     }
  //   };
  //   setDefaultTag();
  // }, [chosenNode]);

  // const showHideClusters = useCallback(
  //   event => {
  //     setShowClusters(oClusters => {
  //       const userClustersLogRef = firebase.db.collection("userClustersLog").doc();
  //       userClustersLogRef.set({
  //         uname: username,
  //         open: !oClusters,
  //         createdAt: firebase.firestore.Timestamp.fromDate(new Date()),
  //       });
  //       return !oClusters;
  //     });
  //   },
  //   [firebase, username]
  // );

  // const closedSidebarClick = useCallback(
  //   event => {
  //     const userClosedSidebarLogRef = firebase.db.collection("userClosedSidebarLog").doc();
  //     userClosedSidebarLogRef.set({
  //       uname: username,
  //       sidebarType: "UserToolbar",
  //       createdAt: firebase.firestore.Timestamp.fromDate(new Date()),
  //     });
  //     setOpenToolbar(false);
  //   },
  //   [firebase, username]
  // );

  // const openProgressBarClick = useCallback(
  //   event => props.setOpenProgressBar(oldOpenProgressBar => !oldOpenProgressBar),
  //   []
  // );

  // const openPracticeClick = useCallback(
  //   () => props.setOpenPractice(oldOpenPractice => !oldOpenPractice),
  //   [props.setOpenPractice]
  // );

  // const choosingNodeClick = useCallback(choosingNodeTag => event => setChoosingNode(choosingNodeTag), []);

  const logoutClick = useCallback((event: any) => {
    event.preventDefault();
    getAuth().signOut();
  }, []);

  // const changeUsername = useCallback(
  //   async newUsername => {
  //     const promptAccepted = window.confirm(
  //       "Are you sure you want to change your username to " +
  //         newUsername +
  //         "? This requires waiting for a while and then automatically refreshing this webpage."
  //     );
  //     if (promptAccepted) {
  //       setChangingUsername(true);
  //       setIsSubmitting(true);
  //       try {
  //         await axios.post("/changeUsername", { newUname: newUsername });
  //         const userLogRef = firebase.db.collection("changeUnameLog").doc();
  //         await userLogRef.set({
  //           uname: username,
  //           newUname: newUsername,
  //           createdAt: firebase.firestore.Timestamp.fromDate(new Date()),
  //         });
  //       } catch (err) {}
  //       window.location.reload();
  //     }
  //   },
  //   [firebase, username]
  // );

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
      ) =>
      async (newValue: any) => {
        if (!user) return;

        console.log({ [attrName]: newValue });

        const userRef = doc(db, "users", user.uname);

        // // Set the "capital" field of the city 'DC'
        // await updateDoc(washingtonRef, {
        //   capital: true,
        // });

        // const userRef = firebase.db.collection("users").doc(username);

        // await userRef.update({ [attrName]: newValue });

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
            userLogCollection = "userEnthnicityLog";
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
          default:
          // code block
        }

        const userLogRef = doc(collection(db, userLogCollection));
        await setDoc(userLogRef, {
          uname: user.uname,
          [attrName]: newValue,
          createdAt: Timestamp.fromDate(new Date()),
        });

        // const userLogRef = firebase.db.collection(userLogCollection).doc();
        // await userLogRef.set({
        //   uname: username,
        //   [attrName]: newValue,
        //   createdAt: firebase.firestore.Timestamp.fromDate(new Date()),
        // });
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

  const handleBackgroundSwitch = useCallback(
    (event: any) => {
      event.preventDefault();
      const newBackground = settings.background === "Image" ? "Color" : "Image";
      changeAttr("background")(newBackground);
      // setBackground(newBackground);
      dispatch({ type: "setBackground", payload: newBackground });
    },
    [changeAttr, dispatch, settings.background]
  );

  const handlesChooseUnameSwitch = useCallback(
    (event: any, user: User) => {
      event.preventDefault();
      const newChooseUname = !user.chooseUname;
      changeAttr("chooseUname")(newChooseUname);
      // setChooseUname(newChooseUname);
      dispatch({ type: "setAuthUser", payload: { ...user, chooseUname: newChooseUname } });
    },
    [changeAttr, dispatch]
  );

  // const closeTagSelector = useCallback(() => {
  //   setChoosingNode(false);
  //   setChosenNode(null);
  //   setChosenNodeTitle(null);
  //   setChosenTags([]);
  //   setIsSubmitting(false);
  // }, []);

  const handleChange = useCallback(
    (event: any) => {
      if ("persist" in event) {
        event.persist();
      }
      if (!user) return;
      if (event.target.name === "ethnicity") {
        const newEthnicity = [
          ...(user.ethnicity || []).filter(option => option !== "Not listed (Please specify)"),
          event.target.value,
        ];
        // setEthnicity(newEthnicity);
        dispatch({ type: "setAuthUser", payload: { ...user, ethnicity: newEthnicity } });
        const ethnicityArray = ethnicityOtherValue !== "" ? [...newEthnicity, ethnicityOtherValue] : user.ethnicity;
        changeAttr("ethnicity")(ethnicityArray);
      } else if (event.target.name === "gender") {
        // setGender(event.target.value);
        dispatch({ type: "setAuthUser", payload: { ...user, gender: event.target.value } });
        changeAttr("gender")(
          event.target.value === "Not listed (Please specify)" ? genderOtherValue : event.target.value
        );
      } else if (event.target.name === "language") {
        // setLang(event.target.value);
        dispatch({ type: "setAuthUser", payload: { ...user, lang: event.target.value } });
        changeAttr("lang")(event.target.value);
      } else if (event.target.name === "country") {
        // setCountry(event.target.value);
        dispatch({ type: "setAuthUser", payload: { ...user, country: event.target.value } });
        changeAttr("country")(event.target.value.split(";")[0]);
      } else if (event.target.name === "stateId") {
        // setStateInfo(event.target.value);
        dispatch({ type: "setAuthUser", payload: { ...user, state: event.target.value } });
        changeAttr("state")(event.target.value.split(";")[0]);
      } else if (event.target.name === "city") {
        // setCity(event.target.value);
        dispatch({ type: "setAuthUser", payload: { ...user, city: event.target.value } });
        changeAttr("city")(event.target.value);
      } else if (event.target.name === "reason") {
        // This is an input,
        // we call changeAttr function only when is onBlur
        setReason(event.target.value);
      }
    },
    [changeAttr, dispatch, ethnicityOtherValue, genderOtherValue, user]
  );

  // const onGenderOtherValueChange = event => setGenderOtherValue(event.target.value);

  // const onEthnicityOtherValueChange = event => setEthnicityOtherValue(event.target.value);

  const getDisplayNameValue = (user: User) => {
    if (user.chooseUname) return user.uname || "Your Username";
    return user.fName || user.lName ? ToUpperCaseEveryWord(user.fName + " " + user.lName) : "Your Full Name";
  };

  const getValidGenderValue = (userGender?: string) => {
    if (!userGender) return null;
    return GENDER_VALUES.includes(userGender) ? userGender : GENDER_VALUES[2];
  };

  const tabsItems = (user: User, choosingNodeId?: string) => {
    return [
      {
        title: "Account",
        content: (
          <>
            <div className="AccountSettingsButtons">
              {/* <div></div> */}
              <MemoizedMetaButton onClick={() => console.log('choosingNodeClick("tag")')}>
                <div className="AccountSettingsButton">
                  {/* <i id="tagChangeIcon" className="material-icons deep-orange-text">
                    local_offer
                  </i> */}
                  <LocalOfferIcon id="tagChangeIcon" className="material-icons deep-orange-text" />
                  {user.tag}
                  {/* {tag.title} */}
                </div>
              </MemoizedMetaButton>
            </div>
            {/* CHECK I change  choosingNode to {nodeBookState.choosingNode?.id */}
            {choosingNodeId === "tag" && (
              <Suspense fallback={<div></div>}>
                <div id="tagModal">
                  <Modal onClick={() => console.log("closeTagSelector")} returnLeft={true} noBackground={true}>
                    {/* <TagSearch chosenTags={chosenTags} setChosenTags={setChosenTags} onlyOne={true} /> */}
                    <MemoizedTagsSearcher
                      allTags={allTags}
                      setAllTags={setAllTags}
                      sx={{ maxHeight: "200px", height: "200px" }}
                    />
                  </Modal>
                </div>
              </Suspense>
            )}
            {/* <UserSettingsSwitches
              theme={theme}
              handleThemeSwitch={handleThemeSwitch}
              background={background}
              handleBackgroundSwitch={handleBackgroundSwitch}
              chooseUname={chooseUname}
              handlesChooseUnameSwitch={handlesChooseUnameSwitch}
              showClusters={showClusters}
              showHideClusters={showHideClusters}
              fName={fName}
              lName={lName}
              uname={username}
            /> */}

            <FormGroup sx={{ p: "10px 19px" }}>
              <FormControlLabel
                control={
                  <Switch
                    // checked={values.theme === "Dark"}
                    checked={settings.theme === "Dark"}
                    onChange={handleThemeSwitch}
                    // onChange={() => {
                    //   // setFieldValue("theme", values.theme === "Light" ? "Dark" : "Light");
                    //   // setThemeMode(settings.theme === "light" ? "dark" : "light");
                    //   // dispatch({ type: "setTheme", payload: settings.theme === "Light" ? "Dark" : "Light" });
                    //   handleThemeSwitch();
                    // }}
                  />
                }
                label={`Theme: ${settings.theme === "Dark" ? "🌜" : "🌞"}`}
              />
            </FormGroup>

            <FormGroup sx={{ p: "10px 19px" }}>
              <FormControlLabel
                control={
                  <Switch
                    // checked={values.background === "Image"}
                    checked={settings.background === "Image"}
                    // onChange={() => {
                    //   // setFieldValue("background", values.background === "Color" ? "Image" : "Color");
                    //   // setBackground(user.background === "Color" ? "Image" : "Color");

                    //   // setBackground(user.background === "Color" ? "Image" : "Color");

                    // }}
                    onChange={handleBackgroundSwitch}
                  />
                }
                label={`Background: ${settings.background === "Color" ? "Color" : "Image"}`}
              />
              handleThemeSwitch
            </FormGroup>

            <FormGroup sx={{ p: "10px 19px" }}>
              <FormControlLabel
                control={
                  <Switch
                    // checked={!values.chooseUname}
                    checked={!user.chooseUname}
                    onChange={e => handlesChooseUnameSwitch(e, user)}
                  />
                }
                label={`Display name: ${getDisplayNameValue(user)}`}
              />
            </FormGroup>

            <MemoizedInputSave
              identification="fNameInput"
              initialValue={user.fName || ""} //TODO: important fill empty user field
              onSubmit={changeAttr("fName")}
              setState={(fName: string) => dispatch({ type: "setAuthUser", payload: { ...user, fName } })}
              label="Change your first name"
            />
            {/* <TextField
              id="firstName"
              name="firstName"
              label="First Name"
              value={user.fName}
              onChange={e => dispatch({ type: "setAuthUser", payload: { ...user, fName: e.target.value } })}
              //onChange={handleChange}
              // onBlur={handleBlur}
              variant="outlined"
              // error={Boolean(errors.firstName) && Boolean(touched.firstName)}
              // helperText={touched.firstName && errors.firstName}
              fullWidth
              sx={{ mb: "16px" }}
            /> */}
            <MemoizedInputSave
              identification="lNameInput"
              initialValue={user.lName || ""} //TODO: important fill empty user field
              onSubmit={changeAttr("lName")}
              setState={(lName: string) => dispatch({ type: "setAuthUser", payload: { ...user, lName } })}
              label="Change your last name"
            />
            {/* <InputSave
                identification="lNameInput"
                initialValue={lName}
                onSubmit={changeAttr("lName")}
                setState={setLName}
                label="Change your last name"
              /> */}
            {/* CHECKL I comented this */}
            {/* <InputSave
              identification="UsernameInput"
              initialValue={username}
              onSubmit={changeUsername}
              setState={setUsername}
              label="DANGEROUS ACTION: Change your username!"
            /> */}
            <div className="AccountSettingsButtons">
              <MemoizedMetaButton onClick={logoutClick}>
                <div className="AccountSettingsButton">
                  <span id="LogoutButtonContent">
                    <ExitToAppIcon />
                    <span id="LogoutButtonText">Logout</span>
                  </span>
                </div>
              </MemoizedMetaButton>
            </div>
            {/* <div className="AccountSettingsButtons">
              <MetaButton onClick={logoutClick}>
                <div className="AccountSettingsButton">
                  <span id="LogoutButtonContent">
                    <ExitToAppIcon />
                    <span id="LogoutButtonText">Logout</span>
                  </span>
                </div>
              </MetaButton>
            </div> */}
          </>
        ),
      },
      {
        title: "Personal",
        content: (
          <div id="PersonalSettings">
            <h2>Personal</h2>
            <Autocomplete
              id="language"
              value={user.lang}
              // onChange={(_, value) => setFieldValue("language", value)}
              onChange={(_, value) => handleChange({ target: { value, name: "language" } })}
              // onBlur={() => setTouched({ ...touched, language: true })}
              options={languages}
              renderInput={params => (
                <TextField
                  {...params}
                  label="Language"
                  // error={Boolean(errors.language) && Boolean(touched.language)}
                  // helperText={touched.language && errors.language}
                />
              )}
              fullWidth
              sx={{ mb: "16px" }}
            />

            <Autocomplete
              id="gender"
              value={getValidGenderValue(user.gender)}
              // onChange={(_, value) => setFieldValue("gender", value)}
              onChange={(_, value) => handleChange({ target: { value, name: "gender" } })}
              // onBlur={() => setTouched({ ...touched, gender: true })}
              options={GENDER_VALUES}
              renderInput={params => (
                <TextField
                  {...params}
                  label="Gender"
                  // error={Boolean(errors.gender) && Boolean(touched.gender)}
                  // helperText={touched.gender && errors.gender}
                />
              )}
              fullWidth
              sx={{ mb: "16px" }}
            />

            {(user.gender === "Not listed (Please specify)" || !GENDER_VALUES.includes(user.gender || "")) && (
              <TextField
                id="genderOtherValue"
                name="genderOtherValue"
                label="Please specify your gender."
                value={genderOtherValue}
                onChange={e => setGenderOtherValue(e.target.value)}
                // onBlur={(_, value) => handleChange({ target: { value, name: "gender" } })}
                onBlur={(event: any) => changeAttr("gender")(event.target.value)}
                variant="outlined"
                // error={Boolean(errors.genderOtherValue) && Boolean(touched.genderOtherValue)}
                // helperText={touched.genderOtherValue && errors.genderOtherValue}
                fullWidth
                sx={{ mb: "16px" }}
              />
            )}

            <TextField
              id="reason"
              name="reason"
              label="Reason for Joining"
              value={reason}
              onChange={(event: any) => handleChange({ target: { value: event.target.value, name: "reason" } })}
              onBlur={(event: any) => changeAttr("reason")(event.target.value)}
              variant="outlined"
              // error={Boolean(errors.reason) && Boolean(touched.reason)}
              // helperText={touched.reason && errors.reason}
              fullWidth
              sx={{ mb: "16px" }}
            />
            {/* <FormControl className="select" variant="outlined">
              <InputLabel>Language</InputLabel>
              <Select
                label="Language"
                name="language"
                onChange={handleChange}
                // onBlur={props.handleBlur}
                value={user.lang}
                renderValue={sameThing => sameThing}
              >
                {sortedLanguages.map(languageItems)}
              </Select>
            </FormControl> */}
            {/* <PersonalInfo
              values={{ country: "", stateInfo: "", city: "", language: lang, gender, ethnicity }}
              handleChange={handleChange}
              handleBlur={doNothing}
              birthDate={birthDate}
              setBirthDate={setBirthDate}
              onGenderOtherValueChange={onGenderOtherValueChange}
              genderOtherValue={genderOtherValue}
              onEthnicityOtherValueChange={onEthnicityOtherValueChange}
              ethnicityOtherValue={ethnicityOtherValue}
              onFoundFromOtherValueChange={doNothing}
              foundFromOtherValue={""}
              CSCObj={CSCObj}
              setCSCObj={setCSCObj}
              allCountries={allCountries}
              setAllCountries={setAllCountries}
              errors={{}}
              serverError={{}}
              inSidebar={false}
            /> */}
            {/* CHECK:I comented this */}
            {/* <FormControl className="select" variant="outlined">
              <InputLabel>Language</InputLabel>
              <Select
                label="Language"
                name="language"
                onChange={setLang}
                value<PersonalInfo
              values={{ country: "", stateInfo: "", city: "", language: lang, gender, ethnicity }}
              handleChange={handleChange}
              handleBlur={doNothing}
              birthDate={birthDate}
              setBirthDate={setBirthDate}
              onGenderOtherValueChange={onGenderOtherValueChange}
              genderOtherValue={genderOtherValue}
              onEthnicityOtherValueChange={onEthnicityOtherValueChange}
              ethnicityOtherValue={ethnicityOtherValue}
              onFoundFromOtherValueChange={doNothing}
              foundFromOtherValue={""}
              CSCObj={CSCObj}
              setCSCObj={setCSCObj}
              allCountries={allCountries}
              setAllCountries={setAllCountries}
              errors={{}}
              serverError={{}}
              inSidebar={false}
            />={lang}
                renderValue={sameThing}
              >
                {sortedLanguages.map(languageItems)}
              </Select>
            </FormControl>

            <div className="DoubleInputRow">
              <Suspense fallback={<div></div>}>
                <DatePicker birthDate={props.birthDate} setBirthDate={props.setBirthDate} />
              </Suspense>
              <div className="MiddleGap"></div>

              <FormControl className="select" variant="outlined">
                <InputLabel>Gender</InputLabel>
                <Select
                  renderValue={sameThing}
                  onChange={props.handleChange}
                  onBlur={props.handleBlur}
                  name="gender"
                  label="Gender"
                  value={gender}
                >
                  {
                    // structure based from https://blog.hubspot.com/service/survey-demographic-questions
                    GENDER_VALUES.map(genderItems)
                  }
                </Select>

                {gender && gender === "Not listed (Please specify)" && (
                  <ValidatedInput
                    className="PleaseSpecify"
                    label="Please specify your gender."
                    onChange={props.onGenderOtherValueChange}
                    name="gender"
                    value={props.genderOtherValue}
                  />
                )}
              </FormControl>
            </div>

            <FormControl className="select" variant="outlined">
              <InputLabel>Ethnicity</InputLabel>
              <Select
                multiple
                onChange={props.handleChange}
                onBlur={props.handleBlur}
                name="ethnicity"
                label="Ethnicity"
                value={ethnicity}
                renderValue={arrayToString}
                MenuProps={{ className: "EthnicityMenu" }}
              >
                {
                  // structure based from https://blog.hubspot.com/service/survey-demographic-questions
                  ETHNICITY_VALUES.map(ethnicityItems)
                }
              </Select>
              {ethnicity &&
                ethnicity.length > 0 &&
                ethnicity.includes("Not listed (Please specify)") && (
                  <ValidatedInput
                    className="PleaseSpecify"
                    label="Please specify your ethnicity."
                    onChange={props.onEthnicityOtherValueChange}
                    name="ethnicity"
                    value={props.ethnicityOtherValue}
                  />
                )}
            </FormControl>
            {props.CSCObj.length > 0 && (
              <Suspense fallback={<div></div>}>
                <CountryStateCity
                  handleChange={props.handleChange}
                  handleBlur={props.handleBlur}
                  values={props.values}
                  CSCObj={props.CSCObj}
                  allCountries={props.allCountries}
                />
              </Suspense>
            )} */}
          </div>
        ),
      },
      {
        title: "Professional",
        content: <>Professional here, this was incomplete</>,
      },
    ];
  };

  if (!user) return null;

  // const ltermPoints = lterm * ltermMaxDay + ltermDay;
  return !changingUsername ? (
    <>
      {/* <div id="MiniUserPrifileHeader">
        <div id="MiniUserPrifileAboveProfilePicture"></div>
        <div id="MiniUserPrifileFullProfileLink"></div>
        <ProfileAvatar />
        <div id="MiniUserPrifileIdentity">
          <div id="MiniUserPrifileName">{chooseUname ? username : fName + " " + lName}</div>
          <div id="MiniUserPrifileTag">
            <i className="material-icons grey-text">local_offer</i> <span>{tag.title}</span>
          </div>
          <div id="MiniUserPrifileInstitution">
            <img src={instlogoURL} alt={deInstit + " logo"} width="25px" />
            <span>{deInstit}</span>
          </div>
          <div id="MiniUserPrifileTotalPoints">
            <i className="material-icons DoneIcon green-text">done</i>
            <span>{shortenNumber(totalPoints, 2, false)}</span>
          </div>
        </div>
      </div>
      <div id="MiniUserPrifilePointsContainer">
        <div className="MiniUserProfilePoints LeftPoints">
          <i className="material-icons amber-text">local_library</i>
          <span className="ToolbarValue">{shortenNumber(cnCorrects - cnWrongs, 2, false)}</span>
        </div>
        <div className="MiniUserProfilePoints">
          <i className="material-icons amber-text">share</i>
          <span className="ToolbarValue">{shortenNumber(mCorrects - mWrongs, 2, false)}</span>
        </div>
        <div className="MiniUserProfilePoints">
          <i className="material-icons amber-text">help_outline</i>
          <span className="ToolbarValue">{shortenNumber(qCorrects - qWrongs, 2, false)}</span>
        </div>
        <div className="MiniUserProfilePoints LeftPoints">
          <i className="material-icons material-icons--outlined amber-text">emoji_objects</i>
          <span className="ToolbarValue">{shortenNumber(iCorrects - iWrongs, 2, false)}</span>
        </div>
        <div className="MiniUserProfilePoints">
          <i className="material-icons amber-text">code</i>
          <span className="ToolbarValue">{shortenNumber(cdCorrects - cdWrongs, 2, false)}</span>
        </div>
        <div className="MiniUserProfilePoints">
          <i className="material-icons amber-text">menu_book</i>
          <span className="ToolbarValue">{shortenNumber(rfCorrects - rfWrongs, 2, false)}</span>
        </div>
      </div> */}
      <div id="SidebarBody" className="UserSettingsSidebarBody">
        <MemoizedSidebarTabs
          tabsTitle="User Mini-profile tabs"
          tabsItems={tabsItems(user, nodeBookState?.choosingNode?.id)}
        />
      </div>
    </>
  ) : (
    <Modal onClick={doNothing}>
      <div id="ChangingUsernameMessage">
        Please wait and don't reload the page, otherwise, your username will not properly change. When the process is
        complete, we'll automatically ask your permission to reload the page. Then, please accept the prompt to reload
        the page when we notify you.
      </div>
    </Modal>
  );
};

export default React.memo(UserSettings);
