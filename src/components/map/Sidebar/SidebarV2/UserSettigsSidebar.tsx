import AdapterDaysJs from "@date-io/dayjs";
import CodeIcon from "@mui/icons-material/Code";
import DoneIcon from "@mui/icons-material/Done";
import EmojiObjectsIcon from "@mui/icons-material/EmojiObjects";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import LocalLibraryIcon from "@mui/icons-material/LocalLibrary";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import ShareIcon from "@mui/icons-material/Share";
import {
  Autocomplete,
  Button,
  FormControlLabel,
  FormGroup,
  LinearProgress,
  Switch,
  Tab,
  Tabs,
  TextField,
} from "@mui/material";
import { Box } from "@mui/system";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import axios from "axios";
import { ICity, ICountry, IState } from "country-state-city";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { getAuth } from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  getFirestore,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import React, { MutableRefObject, ReactNode, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { DispatchAuthActions, Reputation, User, UserSettings, UserTheme } from "src/knowledgeTypes";
import { DispatchNodeBookActions, NodeBookState, TNodeBookState } from "src/nodeBookTypes";
import { NodeType } from "src/types";

import OptimizedAvatar from "@/components/OptimizedAvatar";
import { ChosenTag, MemoizedTagsSearcher } from "@/components/TagsSearcher";
import { useTagsTreeView } from "@/hooks/useTagsTreeView";
import { retrieveAuthenticatedUser } from "@/lib/firestoreClient/auth";
import { Post } from "@/lib/mapApi";
import { ETHNICITY_VALUES, FOUND_FROM_VALUES, GENDER_VALUES } from "@/lib/utils/constants";
import { getTypedCollections } from "@/lib/utils/getTypedCollections";
import { justADate } from "@/lib/utils/justADate";
import shortenNumber from "@/lib/utils/shortenNumber";
import { ToUpperCaseEveryWord } from "@/lib/utils/utils";

import { MemoizedInputSave } from "../../InputSave";
import { MemoizedMetaButton } from "../../MetaButton";
import Modal from "../../Modal/Modal";
import ProposalItem from "../../ProposalsList/ProposalItem/ProposalItem";
import ProfileAvatar from "../ProfileAvatar";
import { UserSettingsProfessionalInfo } from "../UserSettingsProfessionalInfo";
import { SidebarWrapper } from "./SidebarWrapper";

dayjs.extend(relativeTime);

type UserSettingsSidebarProps = {
  notebookRef: MutableRefObject<TNodeBookState>;
  open: boolean;
  openLinkedNode: any;
  onClose: () => void;
  theme: UserTheme;
  user: User;
  settings: UserSettings;
  userReputation: Reputation;
  dispatch: React.Dispatch<DispatchAuthActions>;
  nodeBookDispatch: React.Dispatch<DispatchNodeBookActions>;
  nodeBookState: NodeBookState;
  scrollToNode: (nodeId: string) => void;
};

type UserSettingsTabs = {
  title: string;
  content: ReactNode;
};

export const NODE_TYPE_OPTIONS: NodeType[] = ["Code", "Concept", "Idea", "Question", "Reference", "Relation", "News"];

const UserSettigsSidebar = ({
  notebookRef,
  openLinkedNode,
  open,
  onClose,
  user,
  settings,
  userReputation,
  dispatch,
  nodeBookDispatch,
  nodeBookState,
  scrollToNode,
}: UserSettingsSidebarProps) => {
  const db = getFirestore();
  const ELEMENTS_PER_PAGE: number = 13;
  const { allTags, setAllTags } = useTagsTreeView(user.tagId ? [user.tagId] : []);
  const [languages, setLanguages] = useState<string[]>([]);
  const [countries, setCountries] = useState<ICountry[]>([]);
  const [states, setStates] = useState<IState[]>([]);
  const [cities, setCities] = useState<ICity[]>([]);
  const [instlogoURL, setInstlogoURL] = useState("");
  const [totalPoints, setTotalPoints] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [proposals, setProposals] = useState<any[]>([]);
  const [lastIndex, setLastIndex] = useState(ELEMENTS_PER_PAGE);
  const [value, setValue] = React.useState(0);
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
  };
  const [genderOtherValue, setGenderOtherValue] = useState(
    getOtherValue(GENDER_VALUES, GENDER_VALUES[2], user?.gender)
  );
  const [ethnicityOtherValue, setEthnicityOtherValue] = useState(getOtherEthnicityValue(user));
  const [foundFromOtherValue, setFoundFromOtherValue] = useState(
    getOtherValue(FOUND_FROM_VALUES, FOUND_FROM_VALUES[2], user?.foundFrom)
  );
  const [reason, setReason] = useState(user?.reason || ""); // TODO: improve this
  const [chosenTags, setChosenTags] = useState<ChosenTag[]>([]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  const updateStatesByCountry = useCallback(
    async (currentCountry: string | null) => {
      if (!currentCountry) return setStates([]);
      const countryObject = countries.find(cur => cur.name === currentCountry);
      if (!countryObject) return setStates([]);
      const defaultState: IState = { name: "Prefer not to say", countryCode: "", isoCode: "" };
      const { State } = await import("country-state-city");
      setStates([...State.getStatesOfCountry(countryObject.isoCode), defaultState]);
    },
    [countries]
  );
  const updateCitiesByState = useCallback(
    async (currentState: string | null) => {
      if (!currentState) return setCities([]);

      const currentCountry = countries.find(cur => cur.name === user.country);
      if (!currentCountry) {
        setStates([]);
        setCities([]);
        return;
      }

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

        dispatch({ type: "setAuthUser", payload: { ...user, country: country_name, state: state_prov, city: city } });
      } catch (err) {
        console.warn("cant autocomplete country state city");
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

  const fetchProposals = useCallback(async () => {
    const versions: { [key: string]: any } = {};
    for (let nodeType of NODE_TYPE_OPTIONS) {
      const { versionsColl, userVersionsColl } = getTypedCollections(db, nodeType);

      if (!versionsColl || !userVersionsColl) continue;

      const versionCollectionRef = query(
        versionsColl,
        where("proposer", "==", user.uname),
        where("deleted", "==", false)
      );

      const versionsData = await getDocs(versionCollectionRef);
      let versionId;
      const userVersionsRefs: any[] = [];
      versionsData.forEach(versionDoc => {
        const versionData = versionDoc.data();

        versions[versionDoc.id] = {
          ...versionData,
          id: versionDoc.id,
          createdAt: versionData.createdAt.toDate(),
          award: false,
          correct: false,
          wrong: false,
        };
        delete versions[versionDoc.id].deleted;
        delete versions[versionDoc.id].updatedAt;
        const userVersionCollectionRef = query(
          userVersionsColl,
          where("version", "==", versionDoc.id),
          where("user", "==", user.uname)
        );
        userVersionsRefs.push(userVersionCollectionRef);
      });

      if (userVersionsRefs.length > 0) {
        await Promise.all(
          userVersionsRefs.map(async userVersionsRef => {
            const userVersionsDocs = await getDocs(userVersionsRef);
            userVersionsDocs.forEach((userVersionsDoc: any) => {
              const userVersion = userVersionsDoc.data();
              versionId = userVersion.version;
              delete userVersion.version;
              delete userVersion.updatedAt;
              delete userVersion.createdAt;
              delete userVersion.user;
              versions[versionId] = {
                ...versions[versionId],
                ...userVersion,
              };
            });
          })
        );
      }
    }

    const orderredProposals = Object.values(versions).sort(
      (a, b) => Number(new Date(b.createdAt)) - Number(new Date(a.createdAt))
    );
    const proposalsPerDayDict: { [key: string]: any } = {};
    for (let propo of orderredProposals) {
      let dateValue = justADate(new Date(propo.createdAt)).toISOString();
      if (dateValue in proposalsPerDayDict) {
        proposalsPerDayDict[dateValue].num++;
        proposalsPerDayDict[dateValue].netVotes += propo.corrects - propo.wrongs;
      } else {
        proposalsPerDayDict[dateValue] = {
          num: 1,
          netVotes: propo.corrects - propo.wrongs,
        };
      }
    }
    const proposalsPerDayList = [];
    for (let dateValue of Object.keys(proposalsPerDayDict)) {
      proposalsPerDayList.push({
        date: new Date(dateValue),
        num: proposalsPerDayDict[dateValue].num,
        netVotes: proposalsPerDayDict[dateValue].netVotes,
        averageVotes: proposalsPerDayDict[dateValue].netVotes / proposalsPerDayDict[dateValue].num,
      });
    }
    setProposals(orderredProposals);
  }, [db, user]);

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  useEffect(() => {
    // get institutions and update instLogo from setSUserObj
    if (!db || !user) return;

    if ("deInstit" in user && !("instLogo" in user)) {
      // console.log("useEffect:", user);
      const fetchInstitution = async () => {
        const institutionsQuery = query(collection(db, "institutions"), where("name", "==", user.deInstit));

        const institutionsDocs = await getDocs(institutionsQuery);

        for (let institutionDoc of institutionsDocs.docs) {
          const institutionData = institutionDoc.data();
          setInstlogoURL(institutionData.logoURL);
        }
      };
      fetchInstitution();
    }
  }, [db, user]);

  useEffect(() => {
    if (chosenTags.length > 0 && chosenTags[0].id in allTags) {
      notebookRef.current.chosenNode = { id: chosenTags[0].id, title: chosenTags[0].title };
      nodeBookDispatch({ type: "setChosenNode", payload: { id: chosenTags[0].id, title: chosenTags[0].title } });
    }
  }, [allTags, chosenTags, nodeBookDispatch]);

  // this useEffect updated the defaultTag when chosen node change
  useEffect(() => {
    const setDefaultTag = async () => {
      if (nodeBookState.choosingNode?.id === "Tag" && nodeBookState.chosenNode) {
        const { id: nodeId, title: nodeTitle } = nodeBookState.chosenNode;
        notebookRef.current.choosingNode = null;
        notebookRef.current.chosenNode = null;
        nodeBookDispatch({ type: "setChoosingNode", payload: null });
        nodeBookDispatch({ type: "setChosenNode", payload: null });
        try {
          dispatch({
            type: "setAuthUser",
            payload: { ...user, tagId: nodeId, tag: nodeTitle },
          });
          setIsLoading(true);
          await Post(`/changeDefaultTag/${nodeId}`);
          setIsLoading(false);
          let { reputation, user: userUpdated } = await retrieveAuthenticatedUser(user.userId, user.role);

          if (!reputation) throw Error("Cant find Reputation");
          if (!userUpdated) throw Error("Cant find User");

          dispatch({ type: "setReputation", payload: reputation });
          dispatch({ type: "setAuthUser", payload: userUpdated });
        } catch (err) {
          setIsLoading(false);
          console.error(err);
          // window.location.reload();
        }
      }
    };
    setDefaultTag();
  }, [dispatch, nodeBookDispatch, nodeBookState.choosingNode?.id, nodeBookState.chosenNode, user]);

  const choosingNodeClick = useCallback(
    (choosingNodeTag: string) => {
      notebookRef.current.choosingNode = { id: choosingNodeTag, type: null };
      nodeBookDispatch({ type: "setChoosingNode", payload: { id: choosingNodeTag, type: null } });
    },
    [nodeBookDispatch]
  );

  const logoutClick = useCallback((event: any) => {
    event.preventDefault();
    getAuth().signOut();
  }, []);

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
          | "showClusterOptions"
          | "showClusters"
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
          case "showClusterOptions":
            userLogCollection = "userShowClusterOptionsLog";
            break;
          case "showClusters":
            userLogCollection = "userShowClustersLog";
            break;
          default:
          // code block
        }

        if (!userLogCollection) return console.error("!invalid user log collection");

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
      dispatch({ type: "setTheme", payload: newTheme });
    },
    [changeAttr, dispatch, settings.theme]
  );

  const handleViewSwitch = useCallback(
    (event: any) => {
      event.preventDefault();
      const newView = settings.view === "Graph" ? "Masonry" : "Graph";
      changeAttr("view")(newView);
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
      dispatch({ type: "setBackground", payload: newBackground });
    },
    [changeAttr, dispatch, settings.background]
  );

  const handlesChooseUnameSwitch = useCallback(
    (event: any, user: User) => {
      event.preventDefault();
      const newChooseUname = !user.chooseUname;
      changeAttr("chooseUname")(newChooseUname);
      dispatch({ type: "setAuthUser", payload: { ...user, chooseUname: newChooseUname } });
    },
    [changeAttr, dispatch]
  );

  const handleShowClusterOptionsSwitch = useCallback(
    (event: any) => {
      event.preventDefault();
      const newShowClusterOption = !settings.showClusterOptions;
      changeAttr("showClusterOptions")(newShowClusterOption);
      dispatch({ type: "setShowClusterOptions", payload: newShowClusterOption });
    },
    [changeAttr, dispatch, settings.showClusterOptions]
  );

  const handleShowClustersSwitch = useCallback(
    (event: any) => {
      event.preventDefault();
      const newShowCluster = !settings.showClusters;
      changeAttr("showClusters")(newShowCluster);
      dispatch({ type: "setShowClusters", payload: newShowCluster });
    },
    [changeAttr, dispatch, settings.showClusters]
  );

  const closeTagSelector = useCallback(() => {
    notebookRef.current.chosenNode = null;
    notebookRef.current.choosingNode = null;
    nodeBookDispatch({ type: "setChosenNode", payload: null });
    nodeBookDispatch({ type: "setChoosingNode", payload: null });
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

  const getDisplayNameValue = useCallback((user: User) => {
    if (user.chooseUname) return user.uname || "Your Username";
    return user.fName || user.lName ? ToUpperCaseEveryWord(user.fName + " " + user.lName) : "Your Full Name";
  }, []);

  const canShowOtherEthnicityInput = useCallback((ethnicity: string[]) => {
    if (ethnicity.includes(ETHNICITY_VALUES[6])) return true;
    if (ethnicity.some((ethnicityItem: string) => !isInEthnicityValues(ethnicityItem))) return true;
    return false;
  }, []);

  const mergeEthnicityOtherValueWithUserEthnicity = useCallback((user: User, otherEthnicity: string) => {
    const toRemoveOtherValues = !user.ethnicity.includes(ETHNICITY_VALUES[6]);
    const processedUserEthnicity = toRemoveOtherValues
      ? user.ethnicity.filter(eth => isInEthnicityValues(eth))
      : user.ethnicity;

    const filteredEthnicities = processedUserEthnicity.filter(cur => cur !== ETHNICITY_VALUES[6]);
    return [...filteredEthnicities, otherEthnicity];
  }, []);

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

  const removeAllNodes = async () => {
    if (confirm("Are you sure to hide all the nodes")) {
      const batch = writeBatch(db);
      const userNodesCol = collection(db, "userNodes");
      const q = query(userNodesCol, where("user", "==", user.uname), where("visible", "==", true));
      const visibleUserNodes = await getDocs(q);
      for (const visibleUserNode of visibleUserNodes.docs) {
        const userNodeRef = doc(db, "userNodes", visibleUserNode.id);
        batch.update(userNodeRef, {
          visible: false,
        });
      }
      await batch.commit();
    }
  };

  const loadOlderProposalsClick = useCallback(() => {
    if (lastIndex >= proposals.length) return;
    setLastIndex(lastIndex + ELEMENTS_PER_PAGE);
  }, [lastIndex, proposals.length]);

  const tabsItems: UserSettingsTabs[] = useMemo(() => {
    return [
      {
        title: "Account",
        content: (
          <div
            id="AccountSettings"
            style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "450px" }}
          >
            <FormGroup>
              <FormControlLabel
                control={<Switch checked={settings.theme === "Dark"} onChange={handleThemeSwitch} />}
                label={`Theme: ${settings.theme === "Dark" ? "🌜" : "🌞"}`}
              />
            </FormGroup>
            <FormGroup>
              <FormControlLabel
                control={<Switch checked={settings.background === "Image"} onChange={handleBackgroundSwitch} />}
                label={`Background: ${settings.background === "Color" ? "Color" : "Image"}`}
              />
            </FormGroup>
            <FormGroup>
              <FormControlLabel
                control={<Switch checked={settings.view === "Graph"} onChange={handleViewSwitch} />}
                label={`View: ${settings.view === "Graph" ? "Graph" : "Masonry"}`}
              />
            </FormGroup>
            <FormGroup>
              <FormControlLabel
                control={<Switch checked={!user.chooseUname} onChange={e => handlesChooseUnameSwitch(e, user)} />}
                label={`Display name: ${getDisplayNameValue(user)}`}
              />
            </FormGroup>

            <FormGroup>
              <FormControlLabel
                control={
                  <Switch checked={settings.showClusterOptions} onChange={e => handleShowClusterOptionsSwitch(e)} />
                }
                label={`Nodes are: ${settings.showClusterOptions ? "Clustered" : "Not Clustered"}`}
              />
            </FormGroup>

            {settings.showClusterOptions && (
              <FormGroup>
                <FormControlLabel
                  control={<Switch checked={settings.showClusters} onChange={e => handleShowClustersSwitch(e)} />}
                  label={`Cluster Labels: ${settings.showClusters ? "Shown" : "Hidden"}`}
                />
              </FormGroup>
            )}
            <Box
              sx={{
                textAlign: "center",
              }}
            >
              <Button
                variant="outlined"
                sx={{
                  width: "50%",
                }}
                onClick={removeAllNodes}
              >
                Hide All Nodes
              </Button>
            </Box>

            <MemoizedInputSave
              identification="fNameInput"
              initialValue={user.fName || ""} //TODO: important fill empty user field
              onSubmit={changeAttr("fName")}
              setState={(fName: string) => dispatch({ type: "setAuthUser", payload: { ...user, fName } })}
              label="Change your first name"
            />

            <MemoizedInputSave
              identification="lNameInput"
              initialValue={user.lName || ""} //TODO: important fill empty user field
              onSubmit={changeAttr("lName")}
              setState={(lName: string) => dispatch({ type: "setAuthUser", payload: { ...user, lName } })}
              label="Change your last name"
            />

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
              onChange={(_, value) => handleChange({ target: { value, name: "language" } })}
              options={languages}
              renderInput={params => <TextField {...params} label="Language" />}
              fullWidth
              sx={{ mb: "16px" }}
            />

            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <LocalizationProvider dateAdapter={AdapterDaysJs}>
                <DatePicker
                  value={user.birthDate}
                  onChange={value => handleChange({ target: { value, name: "birthDate" } })}
                  renderInput={params => <TextField {...params} id="birthDate" label="Birth Date" name="birthDate" />}
                />
              </LocalizationProvider>
              <Autocomplete
                id="gender"
                value={getValidValue(GENDER_VALUES, GENDER_VALUES[2], user.gender)}
                onChange={(_, value) => handleChange({ target: { value, name: "gender" } })}
                options={GENDER_VALUES}
                renderInput={params => <TextField {...params} label="Gender" />}
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
              // structure based from https://blog.hubspot.com/service/survey-demographic-questions
              options={ETHNICITY_VALUES}
              renderInput={params => <TextField {...params} label="Ethnicity" />}
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
              options={countries.map(cur => cur.name)}
              renderInput={params => <TextField {...params} label="Country" />}
              fullWidth
              sx={{ mb: "16px" }}
            />
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <Autocomplete
                id="state"
                value={user.state}
                onChange={(_, value) => handleChange({ target: { value, name: "state" } })}
                options={states.map(cur => cur.name)}
                renderInput={params => <TextField {...params} label="State" />}
                fullWidth
                sx={{ mb: "16px" }}
              />
              <Autocomplete
                id="city"
                value={user.city}
                onChange={(_, value) => handleChange({ target: { value, name: "city" } })}
                options={cities.map(cur => cur.name)}
                renderInput={params => <TextField {...params} label="City" />}
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
              options={FOUND_FROM_VALUES}
              renderInput={params => <TextField {...params} label="How did you hear about us?" />}
              fullWidth
              sx={{ mb: "16px" }}
            />
            {(user.foundFrom === "Not listed (Please specify)" ||
              !FOUND_FROM_VALUES.includes(user.foundFrom || "")) && (
              <MemoizedInputSave
                identification="foundFromOtherValue"
                initialValue={foundFromOtherValue} //TODO: important fill empty user field
                onSubmit={(value: any) => changeAttr("foundFrom")(value)}
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
      {
        title: "Proposals",
        content: (
          <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <div className="ChartTitle">Proposals in chronological order</div>
            {proposals.slice(0, lastIndex).map((proposal, idx) => {
              return (
                proposal.title && (
                  <ProposalItem key={idx} proposal={proposal} openLinkedNode={openLinkedNode} showTitle={true} />
                )
              );
            })}
            {proposals.length > lastIndex && (
              <div id="ContinueButton" style={{ padding: "10px 0px" }}>
                <MemoizedMetaButton onClick={loadOlderProposalsClick}>
                  <>
                    <ExpandMoreIcon className="material-icons grey-text" />
                    Older Proposals
                    <ExpandMoreIcon className="material-icons grey-text" />
                  </>
                </MemoizedMetaButton>
              </div>
            )}
          </Box>
        ),
      },
    ];
  }, [
    canShowOtherEthnicityInput,
    changeAttr,
    cities,
    countries,
    dispatch,
    ethnicityOtherValue,
    foundFromOtherValue,
    genderOtherValue,
    getDisplayNameValue,
    handleBackgroundSwitch,
    handleChange,
    handleShowClusterOptionsSwitch,
    handleShowClustersSwitch,
    handleThemeSwitch,
    handleViewSwitch,
    handlesChooseUnameSwitch,
    languages,
    logoutClick,
    mergeEthnicityOtherValueWithUserEthnicity,
    reason,
    settings.background,
    settings.showClusterOptions,
    settings.showClusters,
    settings.theme,
    settings.view,
    states,
    user,
    lastIndex,
    loadOlderProposalsClick,
  ]);
  const setUserImage = useCallback(
    (newImage: string) => {
      dispatch({ type: "setAuthUser", payload: { ...user, imageUrl: newImage } });
    },
    [dispatch, user]
  );

  const a11yProps = (index: number) => {
    return {
      // id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`,
    };
  };

  const contentSignalState = useMemo(() => {
    return { updates: true };
  }, [tabsItems, value]);

  const shouldShowTagSearcher = useMemo(() => {
    return nodeBookState?.choosingNode?.id === "Tag";
  }, [nodeBookState?.choosingNode?.id]);

  const SidebarOptions = useMemo(() => {
    return (
      <Box
        sx={{
          borderBottom: 1,
          borderColor: theme => (theme.palette.mode === "dark" ? "black" : "divider"),
          width: "100%",
          paddingTop: "40px",
        }}
      >
        <div id="MiniUserPrifileHeader" className="MiniUserProfileHeaderMobile">
          <ProfileAvatar
            id="user-settings-picture"
            userId={user.userId}
            userImage={user.imageUrl}
            setUserImage={setUserImage}
            userFullName={`${user?.fName} ${user?.lName}`}
          />

          <div id="MiniUserPrifileIdentity" className="MiniUserPrifileIdentityMobile">
            <Box id="MiniUserPrifileName" sx={{ borderRadius: "6px" }}>
              {user.chooseUname ? user.uname : `${user.fName} ${user.lName}`}
            </Box>
            <div id="MiniUserPrifileTag">
              <MemoizedMetaButton
                id="user-settings-community-tag"
                style={{ padding: "0px" }}
                onClick={() => choosingNodeClick("Tag")}
              >
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
              {shouldShowTagSearcher && (
                <Suspense fallback={<div></div>}>
                  <div id="tagModal">
                    <Modal
                      className="tagSelectorModalUserSetting"
                      onClick={closeTagSelector}
                      returnLeft={true}
                      noBackground={true}
                    >
                      <MemoizedTagsSearcher
                        id="user-settings-tag-searcher"
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
            <div id="MiniUserPrifileInstitution" style={{ display: "flex", gap: "12px", borderRadius: "6px" }}>
              <OptimizedAvatar
                imageUrl={instlogoURL}
                name={user.deInstit + " logo"}
                sx={{
                  width: "25px",
                  height: "25px",
                  fontSize: "16px",
                }}
                renderAsAvatar={false}
              />
              <span>{user.deInstit}</span>
            </div>
            <Box id="user-settings-statistics" sx={{ borderRadius: "6px" }}>
              <DoneIcon className="material-icons DoneIcon green-text" sx={{ mr: "12px" }} />
              <span>{shortenNumber(totalPoints, 2, false)}</span>
            </Box>
          </div>
        </div>
        <div
          id="user-settings-node-types"
          className="MiniUserPrifilePointsContainer"
          style={{ alignItems: "center", justifyContent: "space-around" }}
        >
          <div className="MiniUserProfilePoints">
            <LocalLibraryIcon className="material-icons amber-text" />
            <span className="ToolbarValue">
              {shortenNumber(userReputation.cnCorrects - userReputation.cnWrongs, 2, false)}
            </span>
          </div>
          <div className="MiniUserProfilePoints">
            <ShareIcon className="material-icons amber-text" />
            <span className="ToolbarValue">
              {shortenNumber(userReputation.mCorrects - userReputation.mWrongs, 2, false)}
            </span>
          </div>
          <div className="MiniUserProfilePoints">
            <HelpOutlineIcon className="material-icons amber-text" />
            <span className="ToolbarValue">
              {shortenNumber(userReputation.qCorrects - userReputation.qWrongs, 2, false)}
            </span>
          </div>
          <div className="MiniUserProfilePoints">
            <EmojiObjectsIcon className="material-icons material-icons--outlined amber-text" />
            <span className="ToolbarValue">
              {shortenNumber(userReputation.iCorrects - userReputation.iWrongs, 2, false)}
            </span>
          </div>
          <div className="MiniUserProfilePoints">
            <CodeIcon className="material-icons amber-text" />
            <span className="ToolbarValue">
              {shortenNumber(userReputation.cdCorrects - userReputation.cdWrongs, 2, false)}
            </span>
          </div>
          <div className="MiniUserProfilePoints">
            <MenuBookIcon className="material-icons amber-text" />
            <span className="ToolbarValue">
              {shortenNumber(userReputation.rfCorrects - userReputation.rfWrongs, 2, false)}
            </span>
          </div>
        </div>
        <Tabs id="user-settings-personalization" value={value} onChange={handleTabChange} aria-label={"Bookmarks Tabs"}>
          {tabsItems.map((tabItem: UserSettingsTabs, idx: number) => (
            <Tab
              id={`user-settings-${tabItem.title.toLowerCase()}`}
              key={tabItem.title}
              label={tabItem.title}
              {...a11yProps(idx)}
              sx={{ borderRadius: "6px" }}
            />
          ))}
        </Tabs>
      </Box>
    );
  }, [
    allTags,
    choosingNodeClick,
    chosenTags,
    closeTagSelector,
    instlogoURL,
    isLoading,
    setAllTags,
    setUserImage,
    shouldShowTagSearcher,
    tabsItems,
    totalPoints,
    user.chooseUname,
    user.deInstit,
    user.fName,
    user.imageUrl,
    user.lName,
    user.tag,
    user.uname,
    user.userId,
    userReputation.cdCorrects,
    userReputation.cdWrongs,
    userReputation.cnCorrects,
    userReputation.cnWrongs,
    userReputation.iCorrects,
    userReputation.iWrongs,
    userReputation.mCorrects,
    userReputation.mWrongs,
    userReputation.qCorrects,
    userReputation.qWrongs,
    userReputation.rfCorrects,
    userReputation.rfWrongs,
    value,
  ]);

  return (
    <SidebarWrapper
      id="sidebar-wrapper-user-settings"
      title=""
      contentSignalState={contentSignalState}
      open={open}
      onClose={onClose}
      width={430}
      SidebarOptions={open ? SidebarOptions : null}
      SidebarContent={open ? <Box sx={{ p: "10px" }}>{tabsItems[value].content}</Box> : null}
    />
  );
};
export const MemoizedUserSettingsSidebar = React.memo(UserSettigsSidebar);
