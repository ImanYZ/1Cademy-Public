import AdapterDaysJs from "@date-io/dayjs";
import ArrowBackIosRoundedIcon from "@mui/icons-material/ArrowBackIosRounded";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import BadgeIcon from "@mui/icons-material/Badge";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import PersonIcon from "@mui/icons-material/Person";
import VpnKeyRoundedIcon from "@mui/icons-material/VpnKeyRounded";
import {
  Autocomplete,
  Button,
  Divider,
  FormControlLabel,
  FormGroup,
  LinearProgress,
  MenuItem,
  Modal,
  Paper,
  Select,
  Stack,
  Switch,
  SxProps,
  Tab,
  Tabs,
  TextField,
  Theme,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { Box } from "@mui/system";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import axios from "axios";
import { ICity, ICountry, IState } from "country-state-city";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { getAuth } from "firebase/auth";
import {
  arrayRemove,
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
import { StaticImageData } from "next/image";
import React, {
  MutableRefObject,
  ReactNode,
  Suspense,
  SyntheticEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { DispatchAuthActions, Reputation, User, UserSettings, UserTheme, UserView } from "src/knowledgeTypes";
import { DispatchNodeBookActions, NodeBookState, TNodeBookState } from "src/nodeBookTypes";
import { NodeType } from "src/types";

import { IOSSwitch } from "@/components/IOSSwitcher";
import OptimizedAvatar from "@/components/OptimizedAvatar";
import ResetPasswordForm from "@/components/ResetPasswordForm";
import { AllTagsTreeView, ChosenTag, MemoizedTagsSearcher } from "@/components/TagsSearcher";
import useConfirmationDialog from "@/hooks/useConfirmDialog";
import { useTagsTreeView } from "@/hooks/useTagsTreeView";
import { retrieveAuthenticatedUser } from "@/lib/firestoreClient/auth";
import { Post } from "@/lib/mapApi";
import { ETHNICITY_VALUES, FOUND_FROM_VALUES, GENDER_VALUES } from "@/lib/utils/constants";
import { getCollectionsQuery } from "@/lib/utils/getTypedCollections";
import { justADate } from "@/lib/utils/justADate";
import shortenNumber from "@/lib/utils/shortenNumber";
import { ToUpperCaseEveryWord } from "@/lib/utils/utils";

// import { gray200 } from "@/pages/home";
import darkModeLibraryBackground from "../../../../../public/darkModeLibraryBackground.jpg";
import LightmodeLibraryBackground from "../../../../../public/lightModeLibraryBackground.png";
import { updateNotebookTag } from "../../../../lib/firestoreClient/notebooks.serverless";
import { DESIGN_SYSTEM_COLORS } from "../../../../lib/theme/colors";
import { MemoizedInputSave } from "../../InputSave";
import { MemoizedMetaButton } from "../../MetaButton";
import ProposalItem from "../../ProposalsList/ProposalItem/ProposalItem";
import LevelSlider from "../LevelSlider";
import NodeTypeTrends from "../NodeTypeTrends";
import ProfileAvatar from "../ProfileAvatar";
import UseInfoTrends from "../UseInfoTrends";
import UserDetails from "../UserDetails";
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
  selectedNotebookId: string;
  onChangeNotebook: (notebookId: string) => void;
  onChangeTagOfNotebookById: (notebookId: string, data: { defaultTagId: string; defaultTagName: string }) => void;
  notebookOwner: string;
  onlineUsers: any;
};

type UserSettingsTabs = {
  title: string;
  content: ReactNode;
};

type TabPanelProps = {
  children?: ReactNode;
  index: number;
  value: number;
};

type AccountOptions = {
  type: string;
  icon: ReactNode;
  options?: AccountOptions[];
};

export type UserPoints = { positives: number; negatives: number; totalPoints: number; stars: number };

export const NODE_TYPE_OPTIONS: NodeType[] = ["Code", "Concept", "Idea", "Question", "Reference", "Relation"];

const ACCOUNT_OPTIONS: AccountOptions[] = [
  { type: "My details", icon: <PersonIcon /> },
  { type: "Profile", icon: <BadgeIcon /> },
  { type: "Notebook settings", icon: <DashboardIcon /> },
  // { type: "Email notifications", icon: BellIcon },
  {
    type: "Account access",
    icon: <LockRoundedIcon />,
    options: [
      {
        type: "Change your Password",
        icon: <VpnKeyRoundedIcon sx={{ color: "white" }} />,
      },
      // {
      //   type: "Deactive your Account",
      //   icon: SadfaceIcon,
      // },
    ],
  },
];

const MARKS = [{ value: 0 }, { value: 25 }, { value: 50 }, { value: 75 }, { value: 100 }];

const TabPanel = ({ value, index, children }: TabPanelProps) => {
  return <Box hidden={value !== index}>{value === index && children}</Box>;
};

const UserSettingsSidebar = ({
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
  selectedNotebookId,
  onChangeNotebook,
  onChangeTagOfNotebookById,
  notebookOwner,
  onlineUsers,
}: UserSettingsSidebarProps) => {
  const db = getFirestore();
  const ELEMENTS_PER_PAGE: number = 13;
  const theme = useTheme();
  const { confirmIt, ConfirmDialog } = useConfirmationDialog();
  const { allTags, setAllTags } = useTagsTreeView(user.tagId ? [user.tagId] : []);
  const [languages, setLanguages] = useState<string[]>([]);
  const [countries, setCountries] = useState<ICountry[]>([]);
  const [states, setStates] = useState<IState[]>([]);
  const [cities, setCities] = useState<ICity[]>([]);
  const [instlogoURL, setInstlogoURL] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [proposals, setProposals] = useState<any[]>([]);
  const [proposalsPerDay, setProposalsPerDay] = useState<any[]>([]);

  const [lastIndex, setLastIndex] = useState(ELEMENTS_PER_PAGE);
  const [value, setValue] = React.useState(0);

  const [type, setType] = useState<string>("all");

  const [settingsValue, setSettingsValue] = React.useState(-1);
  const [settingsSubValue, setSettingsSubValue] = React.useState(-1);
  // const [levelThreshold, setLevelThreshold] = useState<number>(user.scaleThreshold ?? 100);

  const handleSettingsValue = (newValue: number) => {
    setSettingsValue(newValue);
  };
  const handleSettingsSubValue = (newValue: number) => {
    setSettingsSubValue(newValue);
  };

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
    const targetTag: any = user.tagId;
    setAllTags(oldAllTags => {
      const updatedTag = {
        [targetTag]: { ...oldAllTags[targetTag], checked: true },
      };
      delete oldAllTags[targetTag];
      const newAllTags: AllTagsTreeView = {
        ...updatedTag,
        ...oldAllTags,
      };

      for (let aTag in newAllTags) {
        if (aTag !== targetTag && newAllTags[aTag].checked) {
          newAllTags[aTag] = { ...newAllTags[aTag], checked: false };
        }
      }
      return newAllTags;
    });
  }, [user.tagId]);

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

  const totalPoints = useMemo<UserPoints>(() => {
    if (!userReputation) return { positives: 0, negatives: 0, totalPoints: 0, stars: 0 };

    const positiveKeys: (keyof Reputation)[] = [
      "cnCorrects",
      "mCorrects",
      "qCorrects",
      "iCorrects",
      "cdCorrects",
      "rfCorrects",
    ];
    const negativeKeys: (keyof Reputation)[] = ["cnWrongs", "mWrongs", "qWrongs", "iWrongs", "cdWrongs", "rfWrongs"];
    const starKeys: (keyof Reputation)[] = ["cnInst", "mInst", "qInst", "iInst", "cdInst", "rfInst"];

    const positives = positiveKeys.reduce(
      (carry, el) => carry + ((typeof userReputation[el] === "number" && (userReputation[el] as number)) || 0),
      0
    );
    const negatives = negativeKeys.reduce(
      (carry, el) => carry + ((typeof userReputation[el] === "number" && (userReputation[el] as number)) || 0),
      0
    );
    const stars = starKeys.reduce(
      (carry, el) => carry + ((typeof userReputation[el] === "number" && (userReputation[el] as number)) || 0),
      0
    );
    const totalPoints = positives + stars - negatives;

    return {
      positives: parseFloat(shortenNumber(positives, 2, false)),
      negatives: parseFloat(shortenNumber(negatives, 2, false)),
      stars: parseFloat(shortenNumber(stars, 2, false)),
      totalPoints: parseFloat(shortenNumber(totalPoints, 2, false)),
    };
  }, [userReputation]);

  const fetchProposals = useCallback(async () => {
    const versions: { [key: string]: any } = {};

    const { versionsColl, userVersionsColl } = getCollectionsQuery(db);

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
        nodeType: versionData.nodeType,
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

    let orderredProposals = Object.values(versions).sort(
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
    // if (type !== "all") orderredProposals = orderredProposals.filter(proposal => proposal.nodeType === type);
    setProposals(orderredProposals); //
    setProposalsPerDay(proposalsPerDayList);
  }, [db, user.uname]);

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  useEffect(() => {
    // get institutions and update instLogo from setSUserObj
    if (!db || !user) return;

    if ("deInstit" in user && !("instLogo" in user)) {
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
        if (notebookOwner !== user.uname)
          return confirmIt("You cannot modify this tag. Please ask the notebook's owner for permission.", "Ok", "");
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
          // onChangeNotebook(nodeId);
          onChangeTagOfNotebookById(selectedNotebookId, { defaultTagId: nodeId, defaultTagName: nodeTitle });
          setIsLoading(true);

          await Post(`/changeDefaultTag/${nodeId}`);
          await updateNotebookTag(db, selectedNotebookId, { defaultTagId: nodeId, defaultTagName: nodeTitle });
          setIsLoading(false);
          let { reputation, user: userUpdated } = await retrieveAuthenticatedUser(user.userId, user.role, user.claims);

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
  }, [
    db,
    dispatch,
    nodeBookDispatch,
    nodeBookState.choosingNode?.id,
    nodeBookState.chosenNode,
    notebookOwner,
    notebookRef,
    onChangeNotebook,
    onChangeTagOfNotebookById,
    selectedNotebookId,
    user,
  ]);

  const choosingNodeClick = useCallback(
    (choosingNodeTag: string) => {
      notebookRef.current.choosingNode = { id: choosingNodeTag, type: "Tag" };
      notebookRef.current.chosenNode = null;

      nodeBookDispatch({ type: "setChosenNode", payload: null });
      nodeBookDispatch({ type: "setChoosingNode", payload: { id: choosingNodeTag, type: "Tag" } });
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
          | "scaleThreshold"
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

  const handleSwitchTheme = useCallback(
    (theme: UserTheme) => {
      changeAttr("theme")(theme);
      dispatch({ type: "setTheme", payload: theme });
    },
    [changeAttr, dispatch]
  );

  const handleViewSwitch = useCallback(
    (view: UserView) => {
      changeAttr("view")(view);
      dispatch({ type: "setView", payload: view });

      if (view === "Graph") {
        setTimeout(() => {
          if (nodeBookState?.selectedNode) scrollToNode(nodeBookState.selectedNode);
        }, 1500);
      }
    },
    [changeAttr, dispatch, nodeBookState.selectedNode, scrollToNode]
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

  const handleShowClusterOptionsSwitch = useCallback(() => {
    const newShowClusterOption = !settings.showClusterOptions;
    changeAttr("showClusterOptions")(newShowClusterOption);
    dispatch({ type: "setShowClusterOptions", payload: newShowClusterOption });
  }, [changeAttr, dispatch, settings.showClusterOptions]);

  const handleShowClustersSwitch = useCallback(
    (showClusters: boolean) => {
      changeAttr("showClusters")(showClusters);
      dispatch({ type: "setShowClusters", payload: showClusters });
    },
    [changeAttr, dispatch]
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
    return userOptions.includes(userValue) ? userValue : defaultValue;
  };
  const getSelectedOptionsByValue = (userValues: string[], isInValues: any, defaultValue: string) => {
    const existOtherValue = userValues.some(item => !isInValues(item));
    const filteredValues = userValues.filter(item => isInValues(item));
    return existOtherValue ? [...filteredValues, defaultValue] : filteredValues;
  };

  const removeAllNodes = useCallback(async () => {
    if (await confirmIt("Are you sure to hide all the nodes", "Hide", "Cancel")) {
      const batch = writeBatch(db);
      const userNodesCol = collection(db, "userNodes");
      const q = query(
        userNodesCol,
        where("user", "==", user.uname),
        where("notebooks", "array-contains", selectedNotebookId)
      );
      const visibleUserNodes = await getDocs(q);
      for (const visibleUserNode of visibleUserNodes.docs) {
        const userNodeRef = doc(db, "userNodes", visibleUserNode.id);
        batch.update(userNodeRef, {
          notebooks: arrayRemove(selectedNotebookId),
        });
      }
      await batch.commit();
    }
  }, [db, user.uname, selectedNotebookId]);
  //
  const loadOlderProposalsClick = useCallback(() => {
    if (lastIndex >= proposals.length) return;
    setLastIndex(lastIndex + ELEMENTS_PER_PAGE);
  }, [lastIndex, proposals.length]);

  const nodeTypeStats = useMemo(() => {
    const stats = new Map(NODE_TYPE_OPTIONS.map(nodeType => [nodeType, "0"]));
    if (!userReputation) return stats;
    stats.forEach((value, key) => {
      switch (key) {
        case "Concept":
          value = shortenNumber(userReputation.cnCorrects - userReputation.cnWrongs, 2, false);
          stats.set("Concept", value);
        case "Relation":
          value = shortenNumber(userReputation.mCorrects - userReputation.mWrongs, 2, false);
          stats.set("Relation", value);
        case "Reference":
          value = shortenNumber(userReputation.rfCorrects - userReputation.rfWrongs, 2, false);
          stats.set("Reference", value);
        case "Question":
          value = shortenNumber(userReputation.qCorrects - userReputation.qWrongs, 2, false);
          stats.set("Question", value);
        case "Idea":
          value = shortenNumber(userReputation.iCorrects - userReputation.iWrongs, 2, false);
          stats.set("Idea", value);
        case "Code":
          value = shortenNumber(userReputation.cdCorrects - userReputation.cdWrongs, 2, false);
          stats.set("Code", value);
      }
    });
    return stats;
  }, [userReputation]);

  const setUserImage = useCallback(
    (newImage: string) => {
      dispatch({ type: "setAuthUser", payload: { ...user, imageUrl: newImage } });
    },
    [dispatch, user]
  );

  const proposalsFiltered = useMemo(() => {
    if (type === "all") return proposals;

    return proposals.filter(proposal => proposal.nodeType === type);
  }, [proposals, type]);

  const onHandleChangeSlider = useCallback(
    (event: SyntheticEvent | Event, value: number | Array<number>) => {
      event.preventDefault();
      if (typeof value !== "number") return;
      changeAttr("scaleThreshold")(value);
      dispatch({ type: "setAuthUser", payload: { ...user, scaleThreshold: value } });
    },
    [changeAttr, dispatch, user]
  );

  const newTabsItems: UserSettingsTabs[] = useMemo(() => {
    return [
      {
        title: "Trends",
        content: (
          <Box sx={{ p: "12px" }}>
            <Typography fontWeight={"500"}>Nodes Overwiew</Typography>
            <NodeTypeTrends id="user-settings" nodeTypeStats={nodeTypeStats} />
            <Typography fontWeight={"500"} my="16px">
              Proposals Overview
            </Typography>
            <UseInfoTrends proposalsPerDay={proposalsPerDay} theme={theme.palette.mode || ""} />
          </Box>
        ),
      },
      {
        title: "Proposals",
        content: (
          <Box sx={{ display: "flex", flexDirection: "column", gap: "4px", px: "12px" }}>
            <Stack direction={"row"} alignItems={"center"} justifyContent={"space-between"} py="10px">
              <Typography fontWeight={"500"}>Overview</Typography>

              <Box>
                <Typography sx={{ display: "inline-block" }}>Shows</Typography>
                <Select
                  sx={{
                    marginLeft: "10px",
                    height: "35px",
                    width: "120px",
                  }}
                  MenuProps={{
                    sx: {
                      "& .MuiMenu-paper": {
                        backgroundColor: theme => (theme.palette.mode === "dark" ? "#1B1A1A" : "#F9FAFB"),
                        color: "text.white",
                      },
                      "& .MuiMenuItem-root:hover": {
                        backgroundColor: theme => (theme.palette.mode === "dark" ? "##2F2F2F" : "#EAECF0"),
                        color: "text.white",
                      },
                      "& .Mui-selected": {
                        backgroundColor: "transparent!important",
                        color: "#FF8134",
                      },
                      "& .Mui-selected:hover": {
                        backgroundColor: "transparent",
                      },
                    },
                  }}
                  labelId="demo-select-small"
                  id="demo-select-small"
                  value={type}
                  onChange={e => {
                    setType(e.target.value);
                  }}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="Concept">Concepts</MenuItem>
                  <MenuItem value="Relation">Relations</MenuItem>
                  <MenuItem value="Question">Questions</MenuItem>
                  <MenuItem value="Idea">Ideas</MenuItem>
                  <MenuItem value="Code">Codes</MenuItem>
                  <MenuItem value="Reference">References</MenuItem>
                </Select>
              </Box>
            </Stack>
            <Stack spacing={"8px"}>
              {proposalsFiltered.slice(0, lastIndex).map((proposal, idx) => {
                return (
                  proposal.title && (
                    <ProposalItem key={idx} proposal={proposal} openLinkedNode={openLinkedNode} showTitle={true} />
                  )
                );
              })}
            </Stack>

            {proposalsFiltered.length > lastIndex && (
              <div id="ContinueButton" style={{ padding: "10px 0px" }}>
                <Button onClick={loadOlderProposalsClick} sx={{ color: DESIGN_SYSTEM_COLORS.primary800 }}>
                  Show older proposals{" "}
                </Button>
              </div>
            )}
          </Box>
        ),
      },
      {
        title: "Account",
        content: (
          <Box height={"100%"} py="16px">
            <Box height={"100%"} display={settingsValue !== -1 ? "none" : "flex"} flexDirection={"column"}>
              <Stack>
                {ACCOUNT_OPTIONS.map((option, idx) => (
                  <Stack
                    key={`${option.type}-${idx}`}
                    direction={"row"}
                    justifyContent={"space-between"}
                    spacing={"12px"}
                    onClick={() => handleSettingsValue(idx)}
                    p="12px 10px"
                    sx={{
                      ":hover": {
                        backgroundColor: theme =>
                          theme.palette.mode === "dark"
                            ? DESIGN_SYSTEM_COLORS.notebookG700
                            : DESIGN_SYSTEM_COLORS.gray100,
                        cursor: "pointer",
                      },
                    }}
                  >
                    <Stack direction={"row"} alignItems={"center"} spacing={"12px"}>
                      <Box
                        sx={{
                          p: "6px",
                          borderRadius: "8px",
                          backgroundColor: "#FF8134",
                          display: "grid",
                          placeItems: "center",
                          color: DESIGN_SYSTEM_COLORS.gray50,
                        }}
                      >
                        {option.icon}
                      </Box>
                      <Typography>{option.type}</Typography>
                    </Stack>
                    <ArrowForwardIosRoundedIcon />
                  </Stack>
                ))}
              </Stack>
              <Box sx={{ display: "flex", justifyContent: "center", mt: "50px" }}>
                <Button
                  variant="contained"
                  onClick={logoutClick}
                  color="error"
                  sx={{
                    borderRadius: "26px",
                    width: "90px",
                    backgroundColor: DESIGN_SYSTEM_COLORS.primary800,
                  }}
                >
                  Log out
                </Button>
              </Box>
            </Box>
            <TabPanel value={settingsValue} index={0}>
              <ArrowBackButton text={ACCOUNT_OPTIONS[0].type} backwardsHandler={handleSettingsValue} />
              <Box component={"section"} p={"24px 20px"}>
                <Tooltip
                  title={user.imageUrl && !user.imageUrl.includes("no-img.png") ? "Change Photo" : "Add Photo"}
                  placement="top"
                >
                  <Box>
                    <ProfileAvatar
                      id="user-settings-picture"
                      userId={user.userId}
                      userImage={user.imageUrl}
                      setUserImage={setUserImage}
                      name={user?.fName ?? ""}
                      lastName={user?.lName ?? ""}
                    />
                  </Box>
                </Tooltip>
              </Box>
              <Box mx="20px">
                <Box sx={{ display: "flex", gap: "12px" }}>
                  <MemoizedInputSave
                    identification="fNameInput"
                    initialValue={user.fName || ""}
                    onSubmit={changeAttr("fName")}
                    setState={(fName: string) => dispatch({ type: "setAuthUser", payload: { ...user, fName } })}
                    label="Name"
                  />

                  <MemoizedInputSave
                    identification="lNameInput"
                    initialValue={user.lName || ""}
                    onSubmit={changeAttr("lName")}
                    setState={(lName: string) => dispatch({ type: "setAuthUser", payload: { ...user, lName } })}
                    label="Last Name"
                  />
                </Box>
                <MemoizedInputSave
                  identification="email"
                  initialValue={user.email}
                  onSubmit={() => {}}
                  setState={() => {}}
                  label="Email"
                  disabled={true}
                />
                <Box sx={{ display: "flex", gap: "12px", my: "8px" }}>
                  <Stack sx={{ flex: 1 }}>
                    <Autocomplete
                      id="gender"
                      value={getValidValue(GENDER_VALUES, GENDER_VALUES[2], user.gender)}
                      onChange={(_, value) => handleChange({ target: { value, name: "gender" } })}
                      options={GENDER_VALUES}
                      renderInput={params => <TextField {...params} label="Gender" />}
                      fullWidth
                    />
                  </Stack>

                  <LocalizationProvider dateAdapter={AdapterDaysJs}>
                    <DatePicker
                      value={user.birthDate}
                      onChange={value => handleChange({ target: { value, name: "birthDate" } })}
                      renderInput={params => (
                        <TextField {...params} id="birthDate" label="Date of Birth" name="birthDate" sx={{ flex: 1 }} />
                      )}
                    />
                  </LocalizationProvider>
                </Box>
                {user.gender === "Not listed (Please specify)" && (
                  <MemoizedInputSave
                    identification="genderOtherValue"
                    initialValue={genderOtherValue} //TODO: important fill empty user field
                    onSubmit={(value: any) => changeAttr("gender")(value)}
                    setState={(value: string) => dispatch({ type: "setAuthUser", payload: { ...user, gender: value } })}
                    label="Please specify your gender."
                  />
                )}
                <Typography fontWeight={"500"} my="8px">
                  Professional Information
                </Typography>
                <UserSettingsProfessionalInfo user={user} />
              </Box>
            </TabPanel>
            <TabPanel value={settingsValue} index={1}>
              <ArrowBackButton text={ACCOUNT_OPTIONS[1].type} backwardsHandler={handleSettingsValue} />
              <Box component={"section"} p={"24px 20px"}>
                <Autocomplete
                  id="language"
                  value={user.lang}
                  onChange={(_, value) => handleChange({ target: { value, name: "language" } })}
                  options={languages}
                  renderInput={params => <TextField {...params} label="Language" />}
                  fullWidth
                  sx={{ mb: "16px" }}
                />
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
                    setState={(value: string) =>
                      dispatch({ type: "setAuthUser", payload: { ...user, foundFrom: value } })
                    }
                    label="Please specify, How did you hear about us."
                  />
                )}
              </Box>
            </TabPanel>
            <TabPanel value={settingsValue} index={2}>
              <ArrowBackButton text={ACCOUNT_OPTIONS[2].type} backwardsHandler={handleSettingsValue} />
              <Box p="20px">
                <Typography fontWeight={"500"}>Appearance</Typography>
                <Stack direction={"row"} alignItems={"center"} justifyContent={"space-evenly"} mt="12px">
                  <ModeOption
                    image={LightmodeLibraryBackground}
                    mode="Light"
                    active={settings.theme === "Light"}
                    handleSwitchTheme={handleSwitchTheme}
                  />
                  <ModeOption
                    image={darkModeLibraryBackground}
                    mode="Dark"
                    active={settings.theme === "Dark"}
                    handleSwitchTheme={handleSwitchTheme}
                  />
                </Stack>
                <Paper
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    borderRadius: "8px",
                    p: "12px",
                    my: "16px",
                    backgroundColor: theme =>
                      theme.palette.mode === "light" ? DESIGN_SYSTEM_COLORS.gray200 : DESIGN_SYSTEM_COLORS.notebookG700,
                  }}
                >
                  <Typography>Background Image</Typography>
                  <IOSSwitch
                    aria-label="Temperature"
                    checked={settings.background === "Image"}
                    onChange={handleBackgroundSwitch}
                  />
                </Paper>
                <Typography fontWeight={"500"}>Nodes Threshold</Typography>
                <LevelSlider
                  min={0}
                  max={100}
                  marks={MARKS}
                  valueLabelDisplay="on"
                  valueLabelFormat={(value: number) => `${value}%`}
                  defaultValue={user.scaleThreshold}
                  onChangeCommitted={onHandleChangeSlider}
                  sx={{ my: "32px" }}
                />
                {/* <Typography fontWeight={"500"}>Nodes view</Typography>
                <Stack direction={"row"} alignItems={"center"} justifyContent={"space-evenly"} mt="12px">
                  <Box
                    sx={{
                      ":hover": { cursor: "pointer" },
                    }}
                    onClick={() => handleViewSwitch("Graph")}
                  >
                    <Stack
                      direction={"row"}
                      alignItems={"center"}
                      justifyContent={"center"}
                      sx={{
                        width: "130px",
                        height: "90px",
                        backgroundColor: theme =>
                          theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG700 : gray200,
                        border: `${settings.view === "Graph" ? 1 : 0}px solid ${DESIGN_SYSTEM_COLORS.primary600}`,
                        borderRadius: "8px",
                      }}
                    >
                      <NodeVersion width={52} height={30} mode={settings.theme} />
                      <ArrowVersion />
                      <NodeVersion width={30} height={30} mode={settings.theme} />
                    </Stack>
                    <Typography
                      textAlign={"center"}
                      sx={{
                        color: theme =>
                          theme.palette.mode === "dark"
                            ? settings.view === "Graph"
                              ? DESIGN_SYSTEM_COLORS.gray25
                              : DESIGN_SYSTEM_COLORS.notebookG200
                            : settings.view === "Graph"
                            ? DESIGN_SYSTEM_COLORS.gray900
                            : DESIGN_SYSTEM_COLORS.notebookG300,
                      }}
                    >
                      Graph
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      ":hover": { cursor: "pointer" },
                    }}
                    onClick={() => handleViewSwitch("Masonry")}
                  >
                    <Stack
                      direction={"row"}
                      alignItems={"center"}
                      justifyContent={"center"}
                      spacing={"5px"}
                      sx={{
                        width: "130px",
                        height: "90px",
                        backgroundColor: theme =>
                          theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG700 : gray200,
                        border: `${settings.view === "Masonry" ? 1 : 0}px solid ${DESIGN_SYSTEM_COLORS.primary600}`,
                        borderRadius: "8px",
                      }}
                    >
                      <Stack spacing={"5px"}>
                        <NodeVersion width={52} height={35} mode={settings.theme} />
                        <NodeVersion width={52} height={30} mode={settings.theme} />
                      </Stack>
                      <Stack spacing={"5px"}>
                        <NodeVersion width={52} height={14} mode={settings.theme} />
                        <NodeVersion width={52} height={30} mode={settings.theme} />
                        <NodeVersion width={52} height={18} mode={settings.theme} />
                      </Stack>
                    </Stack>
                    <Typography
                      textAlign={"center"}
                      sx={{
                        color: theme =>
                          theme.palette.mode === "dark"
                            ? settings.view === "Masonry"
                              ? DESIGN_SYSTEM_COLORS.gray25
                              : DESIGN_SYSTEM_COLORS.notebookG200
                            : settings.view === "Masonry"
                            ? DESIGN_SYSTEM_COLORS.gray900
                            : DESIGN_SYSTEM_COLORS.notebookG300,
                      }}
                    >
                      Masonry
                    </Typography>
                  </Box>
                </Stack> */}
                <Paper
                  sx={{
                    borderRadius: "8px",
                    py: "12px",
                    my: "16px",
                    backgroundColor: theme =>
                      theme.palette.mode === "light" ? DESIGN_SYSTEM_COLORS.gray200 : DESIGN_SYSTEM_COLORS.notebookG700,
                  }}
                >
                  <Stack direction={"row"} justifyContent={"space-between"} px={"12px"}>
                    <Typography>Clusters</Typography>
                    <IOSSwitch checked={settings.showClusterOptions} onChange={handleShowClusterOptionsSwitch} />
                  </Stack>
                  {settings.showClusterOptions && (
                    <>
                      <Divider
                        sx={{
                          m: "12px",
                          borderColor: theme =>
                            theme.palette.mode === "dark"
                              ? DESIGN_SYSTEM_COLORS.notebookG500
                              : DESIGN_SYSTEM_COLORS.gray300,
                        }}
                      />
                      <Stack direction={"row"} justifyContent={"space-evenly"}>
                        <Box onClick={() => handleShowClustersSwitch(false)} sx={{ ":hover": { cursor: "pointer" } }}>
                          <Stack
                            direction={"row"}
                            alignItems={"center"}
                            justifyContent={"center"}
                            spacing={"24px"}
                            sx={{
                              width: "130px",
                              height: "90px",
                              backgroundColor: theme =>
                                theme.palette.mode === "dark"
                                  ? DESIGN_SYSTEM_COLORS.notebookG600
                                  : DESIGN_SYSTEM_COLORS.gray300,
                              border: `${!settings.showClusters ? 1 : 0}px solid ${DESIGN_SYSTEM_COLORS.primary600}`,
                              borderRadius: "8px",
                            }}
                          >
                            <NodeVersion width={52} height={30} mode={settings.theme} />

                            <NodeVersion width={30} height={30} mode={settings.theme} />
                          </Stack>
                          <Typography
                            textAlign={"center"}
                            sx={{
                              color: theme =>
                                theme.palette.mode === "dark"
                                  ? !settings.showClusters
                                    ? DESIGN_SYSTEM_COLORS.gray25
                                    : DESIGN_SYSTEM_COLORS.notebookG200
                                  : !settings.showClusters
                                  ? DESIGN_SYSTEM_COLORS.gray900
                                  : DESIGN_SYSTEM_COLORS.notebookG300,
                            }}
                          >
                            Unlabeled
                          </Typography>
                        </Box>
                        <Box onClick={() => handleShowClustersSwitch(true)} sx={{ ":hover": { cursor: "pointer" } }}>
                          <Box
                            sx={{
                              width: "130px",
                              height: "90px",
                              display: "grid",
                              placeItems: "center",
                              backgroundColor: theme =>
                                theme.palette.mode === "dark"
                                  ? DESIGN_SYSTEM_COLORS.notebookG600
                                  : DESIGN_SYSTEM_COLORS.gray300,
                              border: `${settings.showClusters ? 1 : 0}px solid ${DESIGN_SYSTEM_COLORS.primary600}`,
                              borderRadius: "8px",
                            }}
                          >
                            <Stack
                              direction={"row"}
                              alignItems={"center"}
                              justifyContent={"center"}
                              spacing={"24px"}
                              sx={{
                                outline: `1px dashed ${DESIGN_SYSTEM_COLORS.gray400}`,
                                outlineOffset: "6px",
                                borderRadius: "2px",
                              }}
                            >
                              <NodeVersion width={52} height={30} mode={settings.theme} />

                              <NodeVersion width={30} height={30} mode={settings.theme} />
                            </Stack>
                          </Box>
                          <Typography
                            textAlign={"center"}
                            sx={{
                              color: theme =>
                                theme.palette.mode === "dark"
                                  ? settings.showClusters
                                    ? DESIGN_SYSTEM_COLORS.gray25
                                    : DESIGN_SYSTEM_COLORS.notebookG200
                                  : settings.showClusters
                                  ? DESIGN_SYSTEM_COLORS.gray900
                                  : DESIGN_SYSTEM_COLORS.notebookG300,
                            }}
                          >
                            Labeled
                          </Typography>
                        </Box>
                      </Stack>
                    </>
                  )}
                </Paper>
                <Button
                  variant="outlined"
                  onClick={removeAllNodes}
                  sx={{
                    width: "100%",
                    borderRadius: "24px",
                    mt: "8px",
                    borderColor: DESIGN_SYSTEM_COLORS.primary800,
                    color: DESIGN_SYSTEM_COLORS.primary800,
                  }}
                >
                  Hide all Nodes
                </Button>
              </Box>
            </TabPanel>
            <TabPanel value={settingsValue} index={3}>
              <ArrowBackButton
                text={ACCOUNT_OPTIONS[3].type}
                backwardsHandler={handleSettingsValue}
                sx={{ display: settingsSubValue !== -1 ? "none" : "block" }}
              />
              <Stack display={settingsSubValue !== -1 ? "none" : "flex"}>
                {ACCOUNT_OPTIONS[3].options &&
                  ACCOUNT_OPTIONS[3].options.map((option, idx) => (
                    <Stack
                      key={`${option.type}-${idx}`}
                      direction={"row"}
                      justifyContent={"space-between"}
                      spacing={"12px"}
                      onClick={() => handleSettingsSubValue(idx)}
                      p="12px 10px"
                      sx={{
                        ":hover": {
                          backgroundColor: theme =>
                            theme.palette.mode === "dark"
                              ? DESIGN_SYSTEM_COLORS.notebookG700
                              : DESIGN_SYSTEM_COLORS.gray100,
                          cursor: "pointer",
                        },
                      }}
                    >
                      <Stack direction={"row"} alignItems={"center"} spacing={"12px"}>
                        <Box
                          sx={{
                            p: "6px",
                            borderRadius: "8px",
                            backgroundColor: "#FF8134",
                            display: "grid",
                            placeItems: "center",
                          }}
                        >
                          {option.icon}
                        </Box>
                        <Typography>{option.type}</Typography>
                      </Stack>
                      <ArrowForwardIosRoundedIcon />
                    </Stack>
                  ))}
              </Stack>
              {ACCOUNT_OPTIONS[3].options && (
                <TabPanel value={settingsSubValue} index={0}>
                  <ArrowBackButton
                    text={ACCOUNT_OPTIONS[3].options[0].type}
                    backwardsHandler={handleSettingsSubValue}
                  />
                  <Box p="24px 20px">
                    <ResetPasswordForm />
                  </Box>
                </TabPanel>
              )}
            </TabPanel>
          </Box>
        ),
      },
    ];
  }, [
    changeAttr,
    cities,
    countries,
    dispatch,
    foundFromOtherValue,
    genderOtherValue,
    handleBackgroundSwitch,
    handleChange,
    handleShowClusterOptionsSwitch,
    handleShowClustersSwitch,
    handleSwitchTheme,
    handleViewSwitch,
    languages,
    lastIndex,
    loadOlderProposalsClick,
    logoutClick,
    nodeTypeStats,
    onHandleChangeSlider,
    openLinkedNode,
    proposalsFiltered,
    proposalsPerDay,
    removeAllNodes,
    setUserImage,
    settings.background,
    settings.showClusterOptions,
    settings.showClusters,
    settings.theme,
    settings.view,
    settingsSubValue,
    settingsValue,
    states,
    theme.palette.mode,
    type,
    user,
  ]);

  // There are some fields we may copy
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const tabsItems: UserSettingsTabs[] = useMemo(() => {
    return [
      {
        title: "Account",
        content: (
          <div
            id="AccountSettings"
            style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "450px" }}
          >
            {/* <FormGroup>
              <FormControlLabel
                control={<Switch checked={settings.theme === "Dark"} onChange={handleThemeSwitch} />}
                label={`Theme: ${settings.theme === "Dark" ? "🌜" : "🌞"}`}
              />
            </FormGroup> */}
            <FormGroup>
              <FormControlLabel
                control={<Switch checked={settings.background === "Image"} onChange={handleBackgroundSwitch} />}
                label={`Background: ${settings.background === "Color" ? "Color" : "Image"}`}
              />
            </FormGroup>
            {/* <FormGroup>
              <FormControlLabel
                control={<Switch checked={settings.view === "Graph"} onChange={handleViewSwitch} />}
                label={`View: ${settings.view === "Graph" ? "Graph" : "Masonry"}`}
              />
            </FormGroup> */}
            <FormGroup>
              <FormControlLabel
                control={<Switch checked={!user.chooseUname} onChange={e => handlesChooseUnameSwitch(e, user)} />}
                label={`Display name: ${getDisplayNameValue(user)}`}
              />
            </FormGroup>

            {/* <FormGroup>
              <FormControlLabel
                control={
                  <Switch checked={settings.showClusterOptions} onChange={e => handleShowClusterOptionsSwitch(e)} />
                }
                label={`Nodes are: ${settings.showClusterOptions ? "Clustered" : "Not Clustered"}`}
              />
            </FormGroup> */}

            {/* {settings.showClusterOptions && (
              <FormGroup>
                <FormControlLabel
                  control={<Switch checked={settings.showClusters} onChange={e => handleShowClustersSwitch(e)} />}
                  label={`Cluster Labels: ${settings.showClusters ? "Shown" : "Hidden"}`}
                />
              </FormGroup>
            )} */}
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
    settings.background,
    handleBackgroundSwitch,
    user,
    getDisplayNameValue,
    removeAllNodes,
    changeAttr,
    logoutClick,
    languages,
    genderOtherValue,
    canShowOtherEthnicityInput,
    ethnicityOtherValue,
    countries,
    states,
    cities,
    reason,
    foundFromOtherValue,
    proposals,
    lastIndex,
    loadOlderProposalsClick,
    handlesChooseUnameSwitch,
    dispatch,
    handleChange,
    mergeEthnicityOtherValueWithUserEthnicity,
    openLinkedNode,
  ]);

  const a11yProps = (index: number) => {
    return {
      // id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`,
    };
  };

  const contentSignalState = useMemo(() => {
    return { updates: true };
  }, [newTabsItems, value, chosenTags]);

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
        <Box p="0 32px 16px 32px">
          <UserDetails
            id="user-settings"
            imageUrl={user.imageUrl}
            uname={user.uname}
            fName={user.fName ?? ""}
            lName={user.lName ?? ""}
            chooseUname={user.chooseUname}
            points={totalPoints}
            online={onlineUsers[user.uname]}
          />

          <div id="MiniUserPrifileInstitution" style={{ display: "flex", gap: "12px", borderRadius: "6px" }}>
            <OptimizedAvatar
              imageUrl={instlogoURL}
              name={user.deInstit + " logo"}
              sx={{
                width: "20px",
                height: "20px",
                fontSize: "12px",
              }}
              renderAsAvatar={false}
              contained={false}
            />
            <span>{user.deInstit}</span>
          </div>
          <div id="MiniUserPrifileTag">
            <MemoizedMetaButton
              id="user-settings-community-tag"
              style={{ padding: "4px 0" }}
              onClick={() => choosingNodeClick("Tag")}
            >
              <div className="AccountSettingsButton">
                <LocalOfferRoundedIcon
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
                <Modal
                  open={shouldShowTagSearcher}
                  disablePortal
                  hideBackdrop
                  sx={{
                    "&.MuiModal-root": {
                      top: "100px",
                      left: "430px",
                      right: "unset",
                      bottom: "unset",
                    },
                  }}
                >
                  <MemoizedTagsSearcher
                    id="user-settings-tag-searcher"
                    setChosenTags={setChosenTags}
                    chosenTags={chosenTags}
                    allTags={allTags}
                    setAllTags={setAllTags}
                    width={"440px"}
                    height={"440px"}
                    onClose={closeTagSelector}
                  />
                </Modal>
              </Suspense>
            )}
          </div>
        </Box>
        <Tabs id="user-settings-personalization" value={value} onChange={handleTabChange} aria-label={"Bookmarks Tabs"}>
          {newTabsItems.map((tabItem: UserSettingsTabs, idx: number) => (
            <Tab
              id={`user-settings-${tabItem.title.toLowerCase()}`}
              key={tabItem.title}
              label={tabItem.title}
              {...a11yProps(idx)}
              sx={{ borderRadius: "6px", flex: 1 }}
            />
          ))}
        </Tabs>
      </Box>
    );
  }, [
    allTags,
    choosingNodeClick,
    chosenTags,
    setChosenTags,
    closeTagSelector,
    instlogoURL,
    isLoading,
    newTabsItems,
    setAllTags,
    shouldShowTagSearcher,
    totalPoints,
    user.chooseUname,
    user.deInstit,
    user.fName,
    user.imageUrl,
    user.lName,
    user.tag,
    user.uname,
    value,
  ]);

  return (
    <Box>
      <SidebarWrapper
        id="sidebar-wrapper-user-settings"
        title=""
        contentSignalState={contentSignalState}
        open={open}
        onClose={onClose}
        width={430}
        SidebarOptions={open ? SidebarOptions : null}
        SidebarContent={
          open ? (
            <Box pb="16px" height={"100%"}>
              {newTabsItems[value].content}
            </Box>
          ) : null
        }
      />
      {ConfirmDialog}
    </Box>
  );
};

type ButtonBacKProps = {
  text: string;
  backwardsHandler: (index: number) => void;
  sx?: SxProps<Theme>;
};

const ArrowBackButton = ({ text, backwardsHandler, sx }: ButtonBacKProps) => {
  return (
    <Stack
      position={"relative"}
      direction={"row"}
      justifyContent={"space-between"}
      p="12px 10px"
      onClick={() => backwardsHandler(-1)}
      sx={{
        ":hover": {
          backgroundColor: theme =>
            theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG700 : DESIGN_SYSTEM_COLORS.gray100,
          cursor: "pointer",
        },
        ...sx,
      }}
    >
      <ArrowBackIosRoundedIcon sx={{ position: "absolute", left: "20px", top: "calc(50% - 12px)" }} />
      <Typography sx={{ flex: 1, textAlign: "center", fontWeight: "500" }}>{text}</Typography>
    </Stack>
  );
};

type ModeOptionProps = {
  image: StaticImageData;
  mode: UserTheme;
  active: boolean;
  handleSwitchTheme: (theme: UserTheme) => void;
};

const NodeVersion = ({ width, height, mode }: { width: number; height: number; mode: UserTheme }) => {
  return (
    <Box
      sx={{
        width: `${width}px`,
        height: `${height}px`,
        borderRadius: "4px",
        border: `1px solid ${DESIGN_SYSTEM_COLORS.notebookScarlet}`,
        backgroundColor: mode === "Dark" ? DESIGN_SYSTEM_COLORS.notebookG600 : DESIGN_SYSTEM_COLORS.gray50,
      }}
    ></Box>
  );
};
const ArrowVersion = () => {
  return (
    <Box
      component={"span"}
      sx={{
        position: "relative",
        borderBottom: "1.5px solid rgb(1, 211, 106)",
        height: "2px",
        width: "32px",
        "&::after": {
          content: '""',
          position: "absolute",
          top: "-5px",
          right: "-6px",
          width: 0,
          height: 0,
          border: "6px solid transparent",
          borderLeft: "6px solid rgb(1, 211, 106)",
        },
      }}
    ></Box>
  );
};
const ModeOption = ({ image, mode, active, handleSwitchTheme }: ModeOptionProps) => {
  return (
    <Box sx={{ ":hover": { cursor: "pointer" } }} onClick={() => handleSwitchTheme(mode)}>
      <Stack
        direction={"row"}
        alignItems={"center"}
        justifyContent={"center"}
        sx={{
          width: "130px",
          height: "90px",
          border: `${Number(active)}px solid ${DESIGN_SYSTEM_COLORS.primary600}`,
          borderRadius: "8px",
          backgroundImage: `url(${image.src})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <NodeVersion width={52} height={30} mode={mode} />
        <ArrowVersion />
        <NodeVersion width={30} height={30} mode={mode} />
      </Stack>
      <Typography
        textAlign={"center"}
        sx={{
          color: theme =>
            theme.palette.mode === "dark"
              ? active
                ? DESIGN_SYSTEM_COLORS.gray25
                : DESIGN_SYSTEM_COLORS.notebookG200
              : active
              ? DESIGN_SYSTEM_COLORS.gray900
              : DESIGN_SYSTEM_COLORS.notebookG300,
        }}
      >
        {mode}
      </Typography>
    </Box>
  );
};

export const MemoizedUserSettingsSidebar = React.memo(UserSettingsSidebar);
