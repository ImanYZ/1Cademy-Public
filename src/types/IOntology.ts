export type ISubOntology = { title: string; id: string; category?: string; editMode?: boolean; new?: boolean };

export type ISubOntologyCategory = {
  [category: string]: { ontologies: ISubOntology[] };
};

export type IOntologyTypes =
  | "activity"
  | "actor"
  | "processe"
  | "role"
  | "evaluation"
  | "role"
  | "incentive"
  | "reward";

export type IOntology = {
  deleted: boolean;
  id: string;
  node?: string | null;
  title: string;
  description: string;
  comments: { message: string; sender: string; editMode?: boolean }[];
  tags: string[];
  notes: { note: string; sender: string }[];
  contributors: string[];
  actors: ISubOntology[];
  preconditions: ISubOntology[];
  postconditions: ISubOntology[];
  evaluations: ISubOntology[];
  processes: ISubOntology[];
  specializations: ISubOntology[];
  editMode: boolean;
  parents?: string[];
  type?: IOntologyTypes;
};

export type IOntologyCommon = {
  title: string;
  description: string;
  ontologyType: string;
  locked?: boolean;
};

export type IActivity = IOntologyCommon & {
  plainText: {
    Preconditions: string;
    Postconditions: string;
    notes: string;
  };
  subOntologies: {
    Actor: ISubOntologyCategory;
    Process: ISubOntologyCategory;
    Specializations: ISubOntologyCategory;
    "Evaluation Dimension": ISubOntologyCategory;
  };
};

export type IActor = IOntologyCommon & {
  plainText: {
    "Type of actor": string;
    Abilities: string;
    notes: string;
  };
  subOntologies: {
    Specializations: ISubOntologyCategory;
  };
};

export type IProcesse = IOntologyCommon & {
  plainText: {
    "Type of Process": string;
    Subactivities: string;
    Dependencies: string;
    "Performance prediction models": string;
    notes: string;
  };
  subOntologies: { Role: ISubOntologyCategory; Specializations: ISubOntologyCategory };
};

export type IEvaluation = IOntologyCommon & {
  plainText: {
    "Evaluation type": string;
    "Measurement units": string;
    "Direction of desirability": string;
    "Criteria for acceptability": string;
    notes: string;
  };
  subOntologies: {
    Specializations: ISubOntologyCategory;
  };
};

export type IRole = IOntologyCommon & {
  plainText: {
    "Role type": string;
    Units: string;
    "Capabilities required": string;
    notes: string;
  };
  subOntologies: {
    Specializations: ISubOntologyCategory;
    Incentive: ISubOntologyCategory;
    Actor: ISubOntologyCategory;
  };
};

export type IIncentive = IOntologyCommon & {
  plainText: {
    "Reward function": string;
    "Capabilities required": string;
    notes: string;
  };
  subOntologies: {
    "Evaluation Dimension": ISubOntologyCategory;
    Specializations: ISubOntologyCategory;
    Reward: ISubOntologyCategory;
  };
};

export type IReward = IOntologyCommon & {
  plainText: {
    "Reward type": string;
    Units: string;
  };
  subOntologies: {
    Specializations: ISubOntologyCategory;
  };
};
export type IUserOntology = {
  id: string;
  uname: string;
  ontology: string;
  field: string;
  previous: string;
  new: string;
  correct: boolean;
  wrong: boolean;
  visible: boolean;
};
export type IOntologyLock = {
  uname: string;
  ontology: string;
  field: string;
};
