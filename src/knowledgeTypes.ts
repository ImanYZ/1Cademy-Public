import { EmotionCache } from "@emotion/utils";
import { Timestamp } from "firebase-admin/firestore";
import { AppProps } from "next/app";
import { NextPage } from "next/types";
import { Dispatch, ReactElement, ReactNode, SetStateAction } from "react";

// import { NodeType } from "./types";

export enum NodeType {
  "Relation" = "Relation",
  "Concept" = "Concept",
  "Code" = "Code",
  "Reference" = "Reference",
  "Idea" = "Idea",
  "Question" = "Question",
  "Profile" = "Profile",
  "Sequel" = "Sequel",
  "Advertisement" = "Advertisement",
  "News" = "News",
  "Private" = "Private",
  "Tag" = "Tag",
}

export type KnowledgeNodeContributor = {
  fullname?: string;
  reputation?: number;
  chooseUname?: boolean;
  imageUrl?: string;
  username?: string;
};

export type KnowledgeNodeInstitution = {
  reputation?: number;
  logoURL?: string;
  name?: string;
  id: string;
};

export type LinkedKnowledgeNode = {
  label?: string;
  node: string;
  title?: string;
  content?: string;
  nodeImage?: string;
  nodeType: NodeType;
};

export type KnowledgeChoice = {
  choice: string;
  correct: boolean;
  feedback: string;
};

export type ReferencesArray = {
  referenceIds: string[];
  referenceLabels: string[];
  references: string[];
};

export type LinkedNodeObject = {
  node: string;
  title: string;
  label: string;
};

export type TagsArray = {
  tagIds: string[];
  tags: string[];
};

export type LinkedNodeTag = {
  node: string;
  title: string;
};

export type NodeFireStore = {
  aChooseUname?: boolean;
  aFullname?: string;
  aImgUrl?: string;
  admin?: string;
  bookmarks?: number;
  changedAt: Timestamp;
  children?: { node?: string; label?: string; title?: string }[];
  choices?: KnowledgeChoice[];
  closedHeight?: number;
  comments?: number;
  content?: string;
  contribNames?: string[];
  contributors?: {
    [key: string]: {
      chooseUname?: boolean;
      fullname?: string;
      imageUrl?: string;
      reputation?: number;
    };
  };
  corrects?: number;
  createdAt?: Timestamp;
  deleted?: boolean;
  height?: number;
  institNames?: string[];
  institutions?: {
    [key: string]: { reputation?: number };
  };
  isTag?: boolean;
  maxVersionRating?: number;
  nodeImage?: string;
  nodeType: NodeType;
  parents?: { node?: string; label?: string; title?: string }[];
  referenceIds?: string[];
  referenceLabels?: string[];
  references?: string[] | { node: string; title?: string; label?: string }[];
  studied?: number;
  tagIds?: string[];
  tags?: string[] | { node: string; title?: string; label?: string }[];
  title?: string;
  updatedAt: Timestamp;
  versions?: number;
  viewers?: number;
  wrongs?: number;
};

export type KnowledgeNode = Omit<
  NodeFireStore,
  "updatedAt" | "changedAt" | "createdAt" | "contributors" | "institutions" | "tags" | "parents"
> & {
  id: string;
  updatedAt?: string;
  nodeImage?: string;
  changedAt?: string;
  tags?: LinkedKnowledgeNode[];
  createdAt?: string;
  choices?: KnowledgeChoice[];
  references?: LinkedKnowledgeNode[];
  contributors?: KnowledgeNodeContributor[];
  institutions?: KnowledgeNodeInstitution[];
  children?: LinkedKnowledgeNode[];
  parents?: LinkedKnowledgeNode[];
  siblings?: LinkedKnowledgeNode[];
};

export type SimpleNode = {
  id: string;
  title?: string;
  changedAt?: string;
  content?: string;
  choices: KnowledgeChoice[];
  nodeType: NodeType;
  nodeImage?: string;
  corrects?: number;
  wrongs?: number;
  tags: string[];
  contributors: { fullName: string; imageUrl: string; username: string }[];
  institutions: { name: string }[];
  versions: number;
  studied?: boolean;
};

export type ResponseAutocompleteFullTags = {
  results?: LinkedKnowledgeNode[];
  errorMessage?: string;
};

export type ResponseAutocompleteTags = {
  results?: string[];
  errorMessage?: string;
};

export type ResponseUploadImage = {
  imageUrl?: any;
  message?: string;
  errorMessage?: string;
};

export type ResponseAutocompleteNodes = {
  results?: string[];
  errorMessage?: string;
};

export type ResponseAutocompleteFullNodes = {
  results?: LinkedKnowledgeNode[];
  errorMessage?: string;
};

export type ResponseGeneric = {
  results?: string;
  errorMessage?: string;
};

export type TypesenseNodesSchema = {
  changedAt: string;
  changedAtMillis: number; // typesense
  choices?: KnowledgeChoice[];
  contributors: { fullName: string; imageUrl: string; username: string }[];
  contributorsNames: string[]; // typesense
  contribNames: string[];
  institNames: string[];
  content: string; // typesense
  corrects: number; // typesense
  id: string;
  institutions: { name: string }[];
  institutionsNames: string[]; // typesense
  isTag: boolean; // typesense
  labelsReferences: string[]; // typesense
  nodeImage?: string;
  nodeType: NodeType; // typesense
  tags: string[]; // typesense
  title: string; // typesense
  titlesReferences: string[]; // typesense
  updatedAt: number;
  wrongs: number;
  mostHelpful: number; // typesense
  versions: number; // typesense
};

export type TypesenseReferencesSchema = {
  id: string;
  node: string;
  title: string;
  label: string;
};

// tagsNodes: LinkedKnowledgeNode[]

export type ResponseAutocompleteFilter = {
  results?: FilterValue[];
  errorMessage?: string;
};

export type ResponseAutocompleteReferencesFilter = {
  results?: TypesenseReferencesSchema[];
  errorMessage?: string;
};

export type ResponseAutocompleteProcessedReferencesFilter = {
  results?: FilterProcessedReferences[];
  errorMessage?: string;
};

export type ResponseAutocompleteSearch = {
  results?: string[];
  errorMessage?: string;
};

export type ResponseAutocompleteFullTag = {
  results?: LinkedKnowledgeNode[];
  errorMessage?: string;
};

export type ResponseAutocompleteFullReferences = {
  results?: LinkedKnowledgeNode[];
  errorMessage?: string;
};

export type ResponseNodeData = {
  results?: KnowledgeNode;
  errorMessage?: string;
};

export enum TimeWindowOption {
  "AnyTime" = "Any Time",
  "ThisWeek" = "This Week",
  "ThisMonth" = "This Month",
  "ThisYear" = "This Year",
}

export enum SortTypeWindowOption {
  "MOST_RECENT" = "MOST_RECENT",
  "UPVOTES_DOWNVOTES" = "UPVOTES_DOWNVOTES",
  "NONE" = "NONE",
}

export type FilterValue = {
  id: string;
  name: string;
  imageUrl?: string | undefined;
};

export type FilterProcessedReferences = {
  id: string;
  title: string;
  data: { label: string; node: string }[];
};

export type TypesenseProcessedReferences = {
  title: string;
  data: { label: string; node: string }[];
};

export type StatsSchema = {
  institutions: string;
  users: string;
  proposals: string;
  nodes: string;
  links: string;
};

export type SearchNodesResponse = {
  data: SimpleNode[];
  page: number;
  numResults: number;
  perPage: number;
};
export type SearchNodesParams = {
  q?: string | string[];
  upvotes?: boolean;
  mostRecent?: boolean;
  timeWindow?: string | string[];
  tags?: string | string[];
  institutions?: string | string[];
  contributors?: string | string[];
  reference?: string | string[];
  label?: string | string[];
  nodeTypes?: string | string[];
  page?: number;
};

export type FeedbackInput = {
  name: string;
  email: string;
  feedback: string;
  pageURL: string;
};

export type Feedback = FeedbackInput & {
  createdAt: string;
};

export type ProposalInput = {
  children: LinkedNodeObject[];
  content: string;
  parents: LinkedNodeObject[];
  referenceIds?: string[];
  referenceLabels?: string[];
  references?: string[] | { node: string; title?: string; label?: string }[];
  tagIds?: string[];
  tags?: string[] | { node: string; title?: string; label?: string }[];
  title: string;
  node: string;
  summary: string;
  choices?: KnowledgeChoice[];
};

export type UserTheme = "Dark" | "Light";

export type UserView = "Graph" | "Masonry";

export type UserBackground = "Color" | "Image";

export type User = {
  blocked?: boolean;
  chooseUname?: boolean;
  city?: string;
  clickedConsent?: boolean;
  clickedCP?: boolean;
  clickedPP?: boolean;
  clickedTOS?: boolean;
  color?: string;
  consented?: boolean;
  country?: string;
  createdAt?: Timestamp;
  deCourse?: string;
  deCredits?: number;
  deInstit?: string;
  deMajor?: string;
  email: string;
  ethnicity: string[];
  fName?: string;
  gender?: string;
  imageUrl?: string;
  imgOrColor?: boolean;
  lName?: string;
  lang?: string;
  practicing?: boolean;
  // stateInfo?: string;// CHECK: I comment and add state
  sNode?: string;
  tag?: string;
  tagId?: string;
  uname: string;
  updatedAt?: Timestamp;
  userId: string;
  state?: string;
  // stateId?: string;// this is not used and not exist in DB
  education?: string;
  birthDate?: string;
  foundFrom: string;
  occupation: string;
  reason?: string;
  // major?: string; //CHECK: I commented this because we have deMajor
  // instit?: string; //CHECK: I commented this because we have deInstit
  fieldOfInterest: string;
};

export type userSettings = {
  background: UserBackground;
  theme: UserTheme;
  view: UserView;
};

export type Reputation = {
  aCorrects: number;
  aInst: number;
  aWrongs: number;
  cdCorrects: number;
  cdInst: number;
  cdWrongs: number;
  cnCorrects: number;
  cnInst: number;
  cnWrongs: number;
  createdAt: Date;
  iCorrects: number;
  iInst: number;
  iWrongs: number;
  isAdmin: boolean;
  lterm: number;
  ltermDay: number;
  mCorrects: number;
  mInst: number;
  mWrongs: number;
  nCorrects: number;
  nInst: number;
  nWrongs: number;
  negatives: number;
  pCorrects: number;
  pInst: number;
  pWrongs: number;
  positives: number;
  qCorrects: number;
  qInst: number;
  qWrongs: number;
  rfCorrects: number;
  rfInst: number;
  rfWrongs: number;
  sCorrects: number;
  sInst: number;
  sWrongs: number;
  tag: string;
  tagId: string;
  totalPoints: number;
  uname: string;
  updatedAt: Date;
};

export interface AuthState {
  readonly isAuthenticated: boolean;
  readonly isAuthInitialized: boolean;
  readonly user: User | null;
  readonly reputation: Reputation | null;
  readonly settings: userSettings;
}

export type AuthActions = {
  dispatch: Dispatch<DispatchAuthActions>;
  handleError: (options: ErrorOptions) => void;
};

export type ErrorOptions = {
  error: unknown;
  showErrorToast?: boolean;
  errorMessage?: string;
};

export type AuthLogoutSuccessAction = {
  type: "logoutSuccess";
};

export type AuthLoginSuccessAction = {
  type: "loginSuccess";
  payload: { user: User; reputation: Reputation; theme: UserTheme; background: UserBackground; view: UserView };
};

export type SetThemeAction = {
  type: "setTheme";
  payload: UserTheme;
};

export type SetBackgroundAction = {
  type: "setBackground";
  payload: UserBackground;
};
export type SetAuthUserAction = {
  type: "setAuthUser";
  payload: User;
};
export type SetViewAction = {
  type: "setView";
  payload: UserView;
};
export type DispatchAuthActions =
  | AuthLogoutSuccessAction
  | AuthLoginSuccessAction
  | SetThemeAction
  | SetBackgroundAction
  | SetAuthUserAction
  | SetViewAction;
export type SignUpValidation = {
  uname?: string;
  email?: string;
  institutionName?: String;
};

export type ResponseAPI<T> = {
  results?: T;
  errorMessage?: string;
};

export interface SignUpFormValues {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  passwordConfirmation: string;
  theme: "Light" | "Dark";
  background: "Image" | "Color";
  chooseUname: boolean;
  tagId: string;
  tag: string;
  // -----------------------
  language: string;
  birthDate: string;
  gender: string | null;
  genderOtherValue: string;
  ethnicity: string[];
  ethnicityOtherValue: string;
  country: string | null;
  state: string | null;
  city: string | null;
  reason: string;
  foundFrom: string | null;
  foundFromOtherValue: string;
  // -----------------------
  occupation: string;
  education: string | null;
  institution: string | null;
  major: string | null;
  fieldOfInterest: string;
  signUpAgreement: boolean;
  clickedConsent: boolean;
  clickedTOS: boolean;
  clickedPP: boolean;
  clickedCP: boolean;
}

export interface SignUpData extends Omit<User, "userId"> {
  password: string;
  background: UserBackground;
  theme: UserTheme;
}

export type ThemeActions = {
  setThemeMode: Dispatch<SetStateAction<AppTheme>>;
  themeMode: AppTheme;
};

export type AppTheme = "light" | "dark";

export type AppBackground = "Color" | "Image";

export type AuthLayoutActions = {
  setBackground: Dispatch<SetStateAction<AppBackground>>;
};

export type Tag = {
  createdAt: string;
  node: string;
  tagIds: string[];
  tags: string[];
  title: string;
  updatedAt: string;
  deleted?: boolean; // it appear only if tag is deleted
};

export type NextPageWithLayout<P = {}> = NextPage<P> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

export type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
  emotionCache?: EmotionCache;
};

export type Institution = {
  id: string;
  domains: string[];
  logoURL: string;
  usersNum: number;
  name: string;
  country: string;
  lat: number;
  lng: number;
};

export type Major = {
  Major: string;
  Major_Category: string;
};

export type NodeUser = {
  title: string;
  content: string;
  left: number;
  top: number;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
};

export type Point = {
  x: number;
  y: number;
};

export type NodeChanges = {
  cType: string;
  nId: string;
  nData: NodeFireStore;
};
