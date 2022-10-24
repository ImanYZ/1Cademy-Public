import AdapterDaysJs from "@date-io/dayjs";
import CodeIcon from "@mui/icons-material/Code";
import DoneIcon from "@mui/icons-material/Done";
import EmojiObjectsIcon from "@mui/icons-material/EmojiObjects";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import LocalLibraryIcon from "@mui/icons-material/LocalLibrary";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import ShareIcon from "@mui/icons-material/Share";
import { Autocomplete, Box, FormControlLabel, FormGroup, LinearProgress, Switch, TextField } from "@mui/material";
import { common } from "@mui/material/colors";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import axios from "axios";
import { ICity, ICountry, IState } from "country-state-city";
import { getAuth } from "firebase/auth";
import { collection, doc, getDocs, getFirestore, query, setDoc, Timestamp, updateDoc, where } from "firebase/firestore";
import React, { Suspense, useCallback, useEffect, useState } from "react";

import OptimizedAvatar from "@/components/OptimizedAvatar";
import shortenNumber from "@/lib/utils/shortenNumber";

import { useAuth } from "../../../context/AuthContext";
import { useNodeBook } from "../../../context/NodeBookContext";
// import { use1AcademyTheme } from "../../../context/ThemeContext";
import { useTagsTreeView } from "../../../hooks/useTagsTreeView";
import { Reputation, User } from "../../../knowledgeTypes";
import { Post } from "../../../lib/mapApi";
import { ETHNICITY_VALUES, FOUND_FROM_VALUES, GENDER_VALUES } from "../../../lib/utils/constants";
import { ToUpperCaseEveryWord } from "../../../lib/utils/utils";
// import { ChoosingType } from "../../../nodeBookTypes";
import { ChosenTag, MemoizedTagsSearcher } from "../../TagsSearcher";
import { MemoizedInputSave } from "../InputSave";
import { MemoizedMetaButton } from "../MetaButton";
import Modal from "../Modal/Modal";
import { MemoizedSidebarTabs } from "../SidebarTabs/SidebarTabs";
import ProfileAvatar from "./ProfileAvatar";
import { UserSettingsProfessionalInfo } from "./UserSettingsProfessionalInfo";
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

type UserSettingProps = {
  user: User;
  userReputation: Reputation;
  scrollToNode: (nodeId: string) => void;
};

const UserSettings = ({ user, userReputation, scrollToNode }: UserSettingProps) => {
  const db = getFirestore();
  const [{ settings }, { dispatch }] = useAuth();
  const { nodeBookState, nodeBookDispatch } = useNodeBook();

  const { allTags, setAllTags } = useTagsTreeView(user.tagId ? [user.tagId] : []);
  const [languages, setLanguages] = useState<string[]>([]);
  const [countries, setCountries] = useState<ICountry[]>([]);
  const [states, setStates] = useState<IState[]>([]);
  const [cities, setCities] = useState<ICity[]>([]);

  const [instlogoURL, setInstlogoURL] = useState("");
  const [totalPoints, setTotalPoints] = useState(0);
  const [changingUsername /*, setChangingUsername*/] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isInEthnicityValues = (ethnicityItem: string) => ETHNICITY_VALUES.includes(ethnicityItem);

  const getOtherValue = (userValues: string[], defaultValue: string, userValue?: string) => {
    if (!userValue) return "";
    if (userValue === defaultValue || !userValues.includes(userValue)) return userValue;
    return "";
  };

  const getOtherEthnicityValue = (user: User): string => {
    if (!user?.ethnicity) return "";
    const otherEthnicity = user.ethnicity.find(ethnicityItem => !isInEthnicityValues(ethnicityItem));
    return otherEthnicity ? otherEthnicity : "";
    // if(user.ethnicity.some(ethnicityItem=>!isInEthnicityValues(ethnicityItem))) return user.ethnicity.filter(cur=>cur!==ETHNICITY_VALUES[6])
    //     if (user.ethnicity.includes("") === GENDER_VALUES[2] || !GENDER_VALUES.includes(user.gender)) return user.gender;
    //     return "";
  };
  const [genderOtherValue, setGenderOtherValue] = useState(
    getOtherValue(GENDER_VALUES, GENDER_VALUES[2], user?.gender)
  );
  const [ethnicityOtherValue, setEthnicityOtherValue] = useState(getOtherEthnicityValue(user));
  const [foundFromOtherValue, setFoundFromOtherValue] = useState(
    getOtherValue(FOUND_FROM_VALUES, FOUND_FROM_VALUES[2], user?.foundFrom)
  );
  // const [CSCObj, setCSCObj] = useState([]);
  // const [allCountries, setAllCountries] = useState([]);

  const [reason, setReason] = useState(user?.reason || ""); // TODO: improve this
  const [chosenTags, setChosenTags] = useState<ChosenTag[]>([]);

  const updateStatesByCountry = useCallback(
    async (currentCountry: string | null) => {
      // console.log("updateStatesByCountry", 1, currentCountry);
      if (!currentCountry) return setStates([]);
      // console.log("updateStatesByCountry", 2, countries);
      const countryObject = countries.find(cur => cur.name === currentCountry);
      if (!countryObject) return setStates([]);
      // console.log("updateStatesByCountry", 3);
      // console.log("countryObject", countryObject);
      const defaultState: IState = { name: "Prefer not to say", countryCode: "", isoCode: "" };
      const { State } = await import("country-state-city");
      setStates([...State.getStatesOfCountry(countryObject.isoCode), defaultState]);
    },
    [countries]
  );

  const updateCitiesByState = useCallback(
    async (currentState: string | null) => {
      // console.log("updateCitiesByState", 2);
      // if (!user?.country) return [];
      if (!currentState) return setCities([]);

      // console.log("updateCitiesByState", 3);
      const currentCountry = countries.find(cur => cur.name === user.country);
      if (!currentCountry) {
        setStates([]);
        setCities([]);
        return;
      }

      // console.log("updateCitiesByState", 4);
      const stateObject = states.find(cur => cur.name === currentState);
      if (!stateObject) return setCities([]);

      const defaultCountry: ICity = { name: "Prefer not to say", countryCode: "", stateCode: "" };
      const { City } = await import("country-state-city");
      setCities([...City.getCitiesOfState(currentCountry.isoCode, stateObject.isoCode), defaultCountry]);
    },
    [countries, states, user?.country]
  );

  useEffect(() => {
    setReason(user.reason ?? "");
    setFoundFromOtherValue(user.foundFrom ?? "");
    setGenderOtherValue(user.gender ?? "");
  }, [user]);

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

  useEffect(() => {
    const getCountries = async () => {
      const defaultCountry: ICountry = {
        name: "Prefer not to say",
        isoCode: "",
        phonecode: "",
        flag: "",
        currency: "",
        latitude: "",
        longitude: "",
      };
      const { Country } = await import("country-state-city");
      setCountries([...Country.getAllCountries(), defaultCountry]);
    };
    getCountries();
  }, []);

  useEffect(() => {
    updateStatesByCountry(user.country || null);
  }, [updateStatesByCountry, user.country]);

  useEffect(() => {
    updateCitiesByState(user.state || null);
  }, [updateCitiesByState, user.state]);

  useEffect(() => {
    if (!countries.length) return;

    const getCSCByGeolocation = async () => {
      try {
        if (user.country || user.state || user.city) return;

        const res = await axios.get("https://api.ipgeolocation.io/ipgeo?apiKey=b1a57107845644e2b5e8688727eacb0e");
        if (!res.data) return;

        const { country_name, state_prov, city } = res.data;
        const isValidCountry = countries.filter(cur => cur.name === country_name);
        if (!isValidCountry) return;

        const userRef = doc(db, "users", user.uname);
        await updateDoc(userRef, { country: country_name, state: state_prov, city: city });

        // console.log("wiil call set Timeout");

        dispatch({ type: "setAuthUser", payload: { ...user, country: country_name, state: state_prov, city: city } });
      } catch (err) {
        // console.log("cant autocomplete country state city");
      }
    };
    getCSCByGeolocation();
  }, [countries, db, dispatch, user]);

  useEffect(() => {
    const total =
      userReputation.cnCorrects -
      userReputation.cnWrongs +
      userReputation.cnInst +
      userReputation.cdCorrects -
      userReputation.cdWrongs +
      userReputation.cdInst +
      userReputation.qCorrects -
      userReputation.qWrongs +
      userReputation.qInst +
      userReputation.pCorrects -
      userReputation.pWrongs +
      userReputation.pInst +
      userReputation.sCorrects -
      userReputation.sWrongs +
      userReputation.sInst +
      userReputation.aCorrects -
      userReputation.aWrongs +
      userReputation.aInst +
      userReputation.rfCorrects -
      userReputation.rfWrongs +
      userReputation.rfInst +
      userReputation.nCorrects -
      userReputation.nWrongs +
      userReputation.nInst +
      userReputation.mCorrects -
      userReputation.mWrongs +
      userReputation.mInst +
      userReputation.iCorrects -
      userReputation.iWrongs +
      userReputation.iInst;
    setTotalPoints(total);
  }, [
    userReputation.aCorrects,
    userReputation.aInst,
    userReputation.aWrongs,
    userReputation.cdCorrects,
    userReputation.cdInst,
    userReputation.cdWrongs,
    userReputation.cnCorrects,
    userReputation.cnInst,
    userReputation.cnWrongs,
    userReputation.iCorrects,
    userReputation.iInst,
    userReputation.iWrongs,
    userReputation.mCorrects,
    userReputation.mInst,
    userReputation.mWrongs,
    userReputation.nCorrects,
    userReputation.nInst,
    userReputation.nWrongs,
    userReputation.pCorrects,
    userReputation.pInst,
    userReputation.pWrongs,
    userReputation.qCorrects,
    userReputation.qInst,
    userReputation.qWrongs,
    userReputation.rfCorrects,
    userReputation.rfInst,
    userReputation.rfWrongs,
    userReputation.sCorrects,
    userReputation.sInst,
    userReputation.sWrongs,
  ]);

  useEffect(() => {
    // get institutions and update instLogo from setSUserObj
    if (!db || !user) return;

    if ("deInstit" in user && !("instLogo" in user)) {
      // console.log("useEffect:", user);
      const fetchInstitution = async () => {
        const institutionsQuery = query(collection(db, "institutions"), where("name", "==", user.deInstit));

        const institutionsDocs = await getDocs(institutionsQuery);

        // const institutionsDocs = await firebase
        //   .firestore()
        //   .collection("institutions")
        //   .where("name", "==", sUserObj.deInstit)
        //   .get();
        for (let institutionDoc of institutionsDocs.docs) {
          const institutionData = institutionDoc.data();
          setInstlogoURL(institutionData.logoURL);
        }
      };
      fetchInstitution();
    }
  }, [db, user]);

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

  // ==================>>>> UNCOMMENT this
  useEffect(() => {
    if (chosenTags.length > 0 && chosenTags[0].id in allTags) {
      nodeBookDispatch({ type: "setChosenNode", payload: { id: chosenTags[0].id, title: chosenTags[0].title } });
      // setChosenNodeTitle(allTags[chosenTags[0]].title);
      // setChosenNode(chosenTags[0]);
    }
  }, [allTags, chosenTags, nodeBookDispatch]);

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

  // Every time the choosingNode.id === tag and change the choosing Node
  // We need to call changeDefaultTag(endpoint) and update userTag(local)
  useEffect(() => {
    const setDefaultTag = async () => {
      // if (choosingNode && chosenNode && choosingNode === "tag") {
      if (nodeBookState.choosingNode?.id === "tag" && nodeBookState.chosenNode) {
        // setIsSubmitting(true); // TODO: enable submitting global state
        try {
          // await firebase.idToken();
          // console.log("CALLING API", nodeBookState.chosenNode.id);
          setIsLoading(true);
          await Post(`/changeDefaultTag/${nodeBookState.chosenNode.id}`);
          setIsLoading(false);
          // await axios.post(`/changeDefaultTag/${chosenNode}`);
          // setTag({ node: chosenNode, title: chosenNodeTitle });
          dispatch({
            type: "setAuthUser",
            payload: { ...user, tagId: nodeBookState.chosenNode.id, tag: nodeBookState.chosenNode.title },
          });
        } catch (err) {
          setIsLoading(false);
          console.error(err);
          // window.location.reload();
        }
        // setChoosingNode(false);
        // setChosenNode(null);
        // setChosenNodeTitle(null);
        // setIsSubmitting(false);
        nodeBookDispatch({ type: "setChoosingNode", payload: null });
        nodeBookDispatch({ type: "setChosenNode", payload: null });
      }
    };
    setDefaultTag();
  }, [dispatch, nodeBookDispatch, nodeBookState.choosingNode?.id, nodeBookState.chosenNode, user]);

  // const showHideClusters = useCallback(() => {
  //   const userFieldLogRef = doc(collection(db, "userClustersLog"));
  //   setDoc(userFieldLogRef, {
  //     uname: user.uname,
  //     open: !showClusters,
  //     createdAt: Timestamp.fromDate(new Date()),
  //   });
  //   setShowClusters(!showClusters);
  // }, [db, setShowClusters, showClusters, user.uname]);

  // ------------------->> THIS IS NOT USED
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
  // << -----------------------------
  const choosingNodeClick = useCallback(
    (choosingNodeTag: string) =>
      nodeBookDispatch({ type: "setChoosingNode", payload: { id: choosingNodeTag, type: null } }),
    [nodeBookDispatch]
  );
  // setChoosingNode(choosingNodeTag);
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

  /**
   * Update user attribute in DB
   * then create a log
   */
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
  const handleViewSwitch = useCallback(
    (event: any) => {
      event.preventDefault();
      const newView = settings.view === "Graph" ? "Masonry" : "Graph";
      changeAttr("view")(newView);
      // setTheme(newTheme);
      dispatch({ type: "setView", payload: newView });

      if (newView === "Graph") {
        setTimeout(() => {
          if (nodeBookState?.selectedNode) scrollToNode(nodeBookState.selectedNode);
        }, 1500);
      }
    },
    [changeAttr, dispatch, nodeBookState.selectedNode, scrollToNode, settings.view]
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

  const closeTagSelector = useCallback(() => {
    nodeBookDispatch({ type: "setChosenNode", payload: null });
    nodeBookDispatch({ type: "setChoosingNode", payload: null });
    // setChoosingNode(false);
    // setChosenNode(null);
    // setChosenNodeTitle(null);
    // setChosenTags([]);
    // setAllTags({});
    // setIsSubmitting(false); //Check i comented this
  }, [nodeBookDispatch]);

  const handleChange = useCallback(
    (event: any) => {
      if ("persist" in event) {
        event.persist();
      }
      if (!user) return;
      if (event.target.name === "ethnicity") {
        const newEthnicity = [...event.target.value];
        const toRemoveOtherValues = newEthnicity.includes(ETHNICITY_VALUES[6]);
        const processedNewUserEthnicity = toRemoveOtherValues
          ? newEthnicity.filter(eth => isInEthnicityValues(eth))
          : newEthnicity;
        dispatch({ type: "setAuthUser", payload: { ...user, ethnicity: newEthnicity } });
        changeAttr("ethnicity")(
          processedNewUserEthnicity.filter((option: any) => option !== "Not listed (Please specify)")
        );
      } else if (event.target.name === "gender") {
        dispatch({ type: "setAuthUser", payload: { ...user, gender: event.target.value } });
        changeAttr("gender")(
          event.target.value === "Not listed (Please specify)" ? genderOtherValue : event.target.value
        );
      } else if (event.target.name === "language") {
        dispatch({ type: "setAuthUser", payload: { ...user, lang: event.target.value } });
        changeAttr("lang")(event.target.value);
      } else if (event.target.name === "country") {
        if (!event.target.value) {
          dispatch({ type: "setAuthUser", payload: { ...user, country: event.target.value, state: "", city: "" } });
          changeAttr("country")("");
          changeAttr("state")("");
          changeAttr("city")("");
          // updateStatesByCountry(null);
        } else {
          const country = event.target.value.split(";")[0];

          dispatch({ type: "setAuthUser", payload: { ...user, country: event.target.value, state: "", city: "" } });
          changeAttr("country")(country);
          changeAttr("state")("");
          changeAttr("city")("");
        }
      } else if (event.target.name === "state") {
        if (!event.target.value) {
          dispatch({ type: "setAuthUser", payload: { ...user, state: "", city: "" } });
          changeAttr("state")("");
          changeAttr("city")("");
        } else {
          const state = event.target.value.split(";")[0];
          dispatch({ type: "setAuthUser", payload: { ...user, state: event.target.value, city: "" } });
          changeAttr("state")(state);
          changeAttr("city")("");
        }
      } else if (event.target.name === "city") {
        if (!event.target.value) {
          dispatch({ type: "setAuthUser", payload: { ...user, city: "" } });
          changeAttr("city")(event.target.value);
        } else {
          dispatch({ type: "setAuthUser", payload: { ...user, city: event.target.value } });
          changeAttr("city")(event.target.value);
        }
      } else if (event.target.name === "reason") {
        setReason(event.target.value);
      } else if (event.target.name === "foundFrom") {
        dispatch({ type: "setAuthUser", payload: { ...user, foundFrom: event.target.value } });
        changeAttr("foundFrom")(event.target.value);
      } else if (event.target.name === "birthDate") {
        const newDate = Timestamp.fromDate(new Date(event.target.value || ""));
        dispatch({ type: "setAuthUser", payload: { ...user, birthDate: event.target.value } });
        changeAttr("birthDate")(newDate);
      }
    },
    [changeAttr, dispatch, genderOtherValue, user]
  );

  // const onGenderOtherValueChange = event => setGenderOtherValue(event.target.value);

  // const onEthnicityOtherValueChange = event => setEthnicityOtherValue(event.target.value);

  const getDisplayNameValue = (user: User) => {
    if (user.chooseUname) return user.uname || "Your Username";
    return user.fName || user.lName ? ToUpperCaseEveryWord(user.fName + " " + user.lName) : "Your Full Name";
  };

  // const getValidGenderValue = (userGender?: string) => {
  //   if (!userGender) return null;
  //   return GENDER_VALUES.includes(userGender) ? userGender : GENDER_VALUES[2];
  // };

  const canShowOtherEthnicityInput = (ethnicity: string[]) => {
    if (ethnicity.includes(ETHNICITY_VALUES[6])) return true;
    if (ethnicity.some((ethnicityItem: string) => !isInEthnicityValues(ethnicityItem))) return true;
    return false;
  };

  const mergeEthnicityOtherValueWithUserEthnicity = (user: User, otherEthnicity: string) => {
    const toRemoveOtherValues = !user.ethnicity.includes(ETHNICITY_VALUES[6]);
    const processedUserEthnicity = toRemoveOtherValues
      ? user.ethnicity.filter(eth => isInEthnicityValues(eth))
      : user.ethnicity;

    const filteredEthnicities = processedUserEthnicity.filter(cur => cur !== ETHNICITY_VALUES[6]);
    return [...filteredEthnicities, otherEthnicity];
  };
  const getValidValue = (userOptions: string[], defaultValue: string, userValue?: string) => {
    if (!userValue) return null;
    userOptions.includes(userValue) ? userValue : defaultValue;
    // console.log("RES -->", res);
    return userOptions.includes(userValue) ? userValue : defaultValue;
  };
  const getSelectedOptionsByValue = (userValues: string[], isInValues: any, defaultValue: string) => {
    const existOtherValue = userValues.some(item => !isInValues(item));
    const filteredValues = userValues.filter(item => isInValues(item));
    return existOtherValue ? [...filteredValues, defaultValue] : filteredValues;
  };

  // const getAllTags = () => {
  //   if (!user.tagId) return allTags;
  //   const foundTag = allTags[user.tagId];
  //   if (!foundTag) return allTags;
  //   return { ...allTags, [user.tagId]: { ...foundTag, checked: true } };
  // };

  const tabsItems = (user: User) => {
    return [
      {
        title: "Account",
        content: (
          <div
            id="AccountSettings"
            style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "450px" }}
          >
            {/*<div className="AccountSettingsButtons">
              <MemoizedMetaButton onClick={() => choosingNodeClick("tag")}>
                <div className="AccountSettingsButton">
                  <LocalOfferIcon id="tagChangeIcon" className="material-icons deep-orange-text" />
                  {user.tag}

                  {isLoading && <LinearProgress />}
                </div>
              </MemoizedMetaButton>
            </div>
             CHECK I change  choosingNode to {nodeBookState.choosingNode?.id
            {choosingNodeId === "tag" && (
              <Suspense fallback={<div></div>}>
                <div id="tagModal">
                  <Modal onClick={closeTagSelector} returnLeft={true} noBackground={true}>
                    {/* <TagSearch chosenTags={chosenTags} setChosenTags={setChosenTags} onlyOne={true} />
                    <MemoizedTagsSearcher
                      setChosenTags={setChosenTags}
                      chosenTags={chosenTags}
                      allTags={allTags}
                      setAllTags={setAllTags}
                      sx={{ maxHeight: "200px", height: "200px" }}
                    />
                  </Modal>
                </div>
              </Suspense>
            )}*/}
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
            <FormGroup>
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
            <FormGroup>
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
            </FormGroup>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    // checked={values.theme === "Dark"}
                    checked={settings.view === "Graph"}
                    onChange={handleViewSwitch}
                    // onChange={() => {
                    //   // setFieldValue("theme", values.theme === "Light" ? "Dark" : "Light");
                    //   // setThemeMode(settings.theme === "light" ? "dark" : "light");
                    //   // dispatch({ type: "setTheme", payload: settings.theme === "Light" ? "Dark" : "Light" });
                    //   handleThemeSwitch();
                    // }}
                  />
                }
                label={`View: ${settings.view === "Graph" ? "Graph" : "Masonry"}`}
              />
            </FormGroup>
            <FormGroup>
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
            {/* {props.showHideClusters && (

            )}
            <FormGroup row>
              <FormControl className="select RowSwitch">
                <Switch checked={props.showClusters} onClick={props.showHideClusters} name="chooseUname" />
                <div className="RowSwitchItem">Clusters:</div>
                <div className="RowSwitchItem">{props.showClusters ? "Shown" : "Hidden"}</div>
              </FormControl>
              <FormControlLabel
                control={
                  <Switch
                    // checked={!values.chooseUname}
                    checked={showClusters}
                    // onChange={e => console.log("handlesChooseUnameSwitch(e, user)")}
                    onChange={showHideClusters}
                  />
                }
                label={`Clusters: ${showClusters ? "Shown" : "Hidden"}`}
              />
            </FormGroup> */}
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
          </div>
        ),
      },
      {
        title: "Personal",
        content: (
          <div id="PersonalSettings">
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

            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <LocalizationProvider dateAdapter={AdapterDaysJs}>
                <DatePicker
                  value={user.birthDate}
                  onChange={value => handleChange({ target: { value, name: "birthDate" } })}
                  renderInput={params => (
                    <TextField
                      {...params}
                      id="birthDate"
                      label="Birth Date"
                      name="birthDate"
                      // onBlur={() => setTouched({ ...touched, birthDate: true })}
                      // error={Boolean(errors.birthDate) && Boolean(touched.birthDate)}
                      // helperText={
                      //   touched.birthDate &&
                      //   errors.birthDate &&
                      //   (errors.birthDate ===
                      //   "birthDate must be a `date` type, but the final value was: `Invalid Date` (cast from the value `Invalid Date`)."
                      //     ? "Invalid Date"
                      //     : errors.birthDate)
                      // }
                    />
                  )}
                />
              </LocalizationProvider>
              <Autocomplete
                id="gender"
                value={getValidValue(GENDER_VALUES, GENDER_VALUES[2], user.gender)}
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
            </Box>

            {(user.gender === "Not listed (Please specify)" || !GENDER_VALUES.includes(user.gender || "")) && (
              <MemoizedInputSave
                identification="genderOtherValue"
                initialValue={genderOtherValue} //TODO: important fill empty user field
                onSubmit={(value: any) => changeAttr("gender")(value)}
                setState={(value: string) => dispatch({ type: "setAuthUser", payload: { ...user, gender: value } })}
                label="Please specify your gender."
              />
            )}

            <Autocomplete
              id="ethnicity"
              value={getSelectedOptionsByValue(user.ethnicity, isInEthnicityValues, ETHNICITY_VALUES[6])}
              onChange={(_, value) => handleChange({ target: { value, name: "ethnicity" } })}
              // onBlur={() => setTouched({ ...touched, ethnicity: true })}
              // structure based from https://blog.hubspot.com/service/survey-demographic-questions
              options={ETHNICITY_VALUES}
              renderInput={params => (
                <TextField
                  {...params}
                  label="Ethnicity"
                  // error={Boolean(errors.ethnicity) && Boolean(touched.ethnicity)}
                  // helperText={touched.ethnicity && errors.ethnicity}
                />
              )}
              fullWidth
              multiple
              sx={{ mb: "16px" }}
            />
            {canShowOtherEthnicityInput(user.ethnicity || []) && (
              <MemoizedInputSave
                identification="ethnicityOtherValue"
                initialValue={ethnicityOtherValue} //TODO: important fill empty user field
                onSubmit={(value: any) =>
                  changeAttr("ethnicity")(mergeEthnicityOtherValueWithUserEthnicity(user, value))
                }
                setState={setEthnicityOtherValue}
                label="Please specify your ethnicity."
              />
            )}
            <Autocomplete
              id="country"
              value={user.country}
              onChange={(_, value) => handleChange({ target: { value, name: "country" } })}
              // onBlur={() => setTouched({ ...touched, country: true })}
              options={countries.map(cur => cur.name)}
              renderInput={params => (
                <TextField
                  {...params}
                  label="Country"
                  // error={Boolean(errors.country) && Boolean(touched.country)}
                  // helperText={touched.country && errors.country}
                />
              )}
              fullWidth
              sx={{ mb: "16px" }}
            />
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <Autocomplete
                id="state"
                value={user.state}
                onChange={(_, value) => handleChange({ target: { value, name: "state" } })}
                // onBlur={() => setTouched({ ...touched, state: true })}
                options={states.map(cur => cur.name)}
                renderInput={params => (
                  <TextField
                    {...params}
                    label="State"
                    // error={Boolean(errors.state) && Boolean(touched.state)}
                    // helperText={touched.state && errors.state}
                  />
                )}
                fullWidth
                sx={{ mb: "16px" }}
              />
              <Autocomplete
                id="city"
                value={user.city}
                onChange={(_, value) => handleChange({ target: { value, name: "city" } })}
                // onBlur={() => setTouched({ ...touched, city: true })}
                options={cities.map(cur => cur.name)}
                renderInput={params => (
                  <TextField
                    {...params}
                    label="City"
                    // error={Boolean(errors.city) && Boolean(touched.city)}
                    // helperText={touched.city && errors.city}
                  />
                )}
                fullWidth
                sx={{ mb: "16px" }}
              />
            </Box>
            <MemoizedInputSave
              identification="reason"
              initialValue={reason} //TODO: important fill empty user field
              onSubmit={(value: any) => changeAttr("reason")(value)}
              setState={(value: string) => dispatch({ type: "setAuthUser", payload: { ...user, reason: value } })}
              label="Reason for Joining."
            />
            <Autocomplete
              id="foundFrom"
              value={getValidValue(FOUND_FROM_VALUES, FOUND_FROM_VALUES[5], user.foundFrom)}
              onChange={(_, value) => handleChange({ target: { value, name: "foundFrom" } })}
              // onBlur={() => setTouched({ ...touched, foundFrom: true })}
              options={FOUND_FROM_VALUES}
              renderInput={params => (
                <TextField
                  {...params}
                  label="How did you hear about us?"
                  // error={Boolean(errors.foundFrom) && Boolean(touched.foundFrom)}
                  // helperText={touched.foundFrom && errors.foundFrom}
                />
              )}
              fullWidth
              sx={{ mb: "16px" }}
            />
            {(user.foundFrom === "Not listed (Please specify)" ||
              !FOUND_FROM_VALUES.includes(user.foundFrom || "")) && (
              // <TextField
              //   id="foundFromOtherValue"
              //   name="foundFromOtherValue"
              //   label="Please specify, How did you hear about us?"
              //   value={user.foundFromOtherValue}
              //   onChange={handleChange}
              //   onBlur={handleBlur}
              //   variant="outlined"
              //   error={Boolean(errors.foundFromOtherValue) && Boolean(touched.foundFromOtherValue)}
              //   helperText={touched.foundFromOtherValue && errors.foundFromOtherValue}
              //   fullWidth
              //   sx={{ mb: "16px" }}
              // />
              <MemoizedInputSave
                identification="foundFromOtherValue"
                initialValue={foundFromOtherValue} //TODO: important fill empty user field
                onSubmit={(value: any) => changeAttr("foundFrom")(value)}
                // setState={(value: string) => dispatch({ type: "setAuthUser", payload: { ...user, foundFrom: value } })}
                setState={(value: string) => dispatch({ type: "setAuthUser", payload: { ...user, foundFrom: value } })}
                label="Please specify, How did you hear about us."
              />
            )}
          </div>
        ),
      },
      {
        title: "Professional",
        content: (
          <div id="PersonalSettings">
            <UserSettingsProfessionalInfo user={user} />
          </div>
        ),
      },
    ];
  };
  const setUserImage = (newImage: string) => {
    dispatch({ type: "setAuthUser", payload: { ...user, imageUrl: newImage } });
  };
  if (!user) return null;

  // const ltermPoints = lterm * ltermMaxDay + ltermDay;

  return !changingUsername ? (
    <>
      <div id="MiniUserPrifileHeader">
        {/* <div id="MiniUserPrifileAboveProfilePicture"></div>
        <div id="MiniUserPrifileFullProfileLink"></div> */}
        <ProfileAvatar userId={user.userId} userImage={user.imageUrl} setUserImage={setUserImage} />

        <div id="MiniUserPrifileIdentity">
          {/* <div id="MiniUserPrifileName">{chooseUname ? username : fName + " " + lName}</div> */}
          <div id="MiniUserPrifileName">{user.chooseUname ? user.uname : `${user.fName} ${user.lName}`}</div>
          <div id="MiniUserPrifileTag">
            {/* <i className="material-icons grey-text">local_offer</i> */}
            <MemoizedMetaButton style={{ padding: "0px" }} onClick={() => choosingNodeClick("tag")}>
              <div className="AccountSettingsButton">
                <LocalOfferIcon
                  sx={{ marginRight: "8px" }}
                  id="tagChangeIcon"
                  className="material-icons deep-orange-text"
                />
                {user.tag}

                {isLoading && <LinearProgress />}
              </div>
            </MemoizedMetaButton>
            {/* CHECK I change  choosingNode to {nodeBookState.choosingNode?.id */}
            {nodeBookState?.choosingNode?.id === "tag" && (
              <Suspense fallback={<div></div>}>
                <div id="tagModal">
                  <Modal style={{ top: "85px" }} onClick={closeTagSelector} returnLeft={true} noBackground={true}>
                    {/* <TagSearch chosenTags={chosenTags} setChosenTags={setChosenTags} onlyOne={true} /> */}
                    <MemoizedTagsSearcher
                      setChosenTags={setChosenTags}
                      chosenTags={chosenTags}
                      allTags={allTags}
                      setAllTags={setAllTags}
                      sx={{ maxHeight: "235px", height: "235px" }}
                    />
                  </Modal>
                </div>
              </Suspense>
            )}
          </div>
          <div id="MiniUserPrifileInstitution" style={{ display: "flex", gap: "12px" }}>
            <OptimizedAvatar
              imageUrl={instlogoURL}
              name={user.deInstit + " logo"}
              sx={{ width: "25px", height: "25px", fontSize: "16px", backgroundColor: "#ff9800", color: common.white }}
              renderAsAvatar={false}
            />
            {/* <img src={instlogoURL} alt={user.deInstit + " logo"} width="25px" /> */}
            <span>{user.deInstit}</span>
          </div>
          <div id="MiniUserPrifileTotalPoints">
            {/* <i className="material-icons DoneIcon green-text">done</i> */}
            <DoneIcon className="material-icons DoneIcon green-text" />
            <span>{shortenNumber(totalPoints, 2, false)}</span>
          </div>
        </div>
      </div>
      <div id="MiniUserPrifilePointsContainer">
        <div className="MiniUserProfilePoints LeftPoints">
          {/* <i className="material-icons amber-text">local_library</i> */}
          <LocalLibraryIcon className="material-icons amber-text" />
          <span className="ToolbarValue">
            {shortenNumber(userReputation.cnCorrects - userReputation.cnWrongs, 2, false)}
          </span>
        </div>
        <div className="MiniUserProfilePoints">
          {/* <i className="material-icons amber-text">share</i> */}
          <ShareIcon className="material-icons amber-text" />
          <span className="ToolbarValue">
            {shortenNumber(userReputation.mCorrects - userReputation.mWrongs, 2, false)}
          </span>
        </div>
        <div className="MiniUserProfilePoints">
          {/* <i className="material-icons amber-text">help_outline</i> */}
          <HelpOutlineIcon className="material-icons amber-text" />
          <span className="ToolbarValue">
            {shortenNumber(userReputation.qCorrects - userReputation.qWrongs, 2, false)}
          </span>
        </div>
        <div className="MiniUserProfilePoints LeftPoints">
          {/* <i className="material-icons material-icons--outlined amber-text">emoji_objects</i> */}
          <EmojiObjectsIcon className="material-icons material-icons--outlined amber-text" />
          <span className="ToolbarValue">
            {shortenNumber(userReputation.iCorrects - userReputation.iWrongs, 2, false)}
          </span>
        </div>
        <div className="MiniUserProfilePoints">
          {/* <i className="material-icons amber-text">code</i> */}
          <CodeIcon className="material-icons amber-text" />
          <span className="ToolbarValue">
            {shortenNumber(userReputation.cdCorrects - userReputation.cdWrongs, 2, false)}
          </span>
        </div>
        <div className="MiniUserProfilePoints">
          {/* <i className="material-icons amber-text">menu_book</i> */}
          <MenuBookIcon className="material-icons amber-text" />
          <span className="ToolbarValue">
            {shortenNumber(userReputation.rfCorrects - userReputation.rfWrongs, 2, false)}
          </span>
        </div>
      </div>
      <div className="UserSettingsSidebarBody">
        <MemoizedSidebarTabs tabsTitle="User Mini-profile tabs" tabsItems={tabsItems(user)} />
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
