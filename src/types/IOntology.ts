export type ISubOntology = { title: string; id: string; category?: string; editMode?: boolean; new?: boolean };

export type ISubOntologyCategory = {
  [category: string]: { ontolgies: ISubOntology[] };
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

export type IActivity = {
  title: string;
  description: string;
  plainText: {
    Preconditions: string;
    Postconditions: string;
    notes: string;
  };
  subOntologies: {
    Actor: ISubOntologyCategory;
    Process: ISubOntologyCategory;
    Specializations: ISubOntologyCategory;
    "Evaluation Dimensions": ISubOntologyCategory;
  };
  ontologyType: string;
  locked: boolean;
};

export type IActor = {
  title: string;
  description: string;
  Type: string;
  plainText: {
    Abilities: string;
    notes: string;
  };
  subOntologies: {
    Specializations: ISubOntologyCategory;
  };

  ontologyType: string;
  locked: boolean;
};

export type IProcesse = {
  title: string;
  description: string;
  Type: string;
  plainText: {
    Subactivities: string;
    Dependencies: string;
    "Performance prediction models": string;
    notes: string;
  };
  subOntologies: { Roles: ISubOntologyCategory; Specializations: ISubOntologyCategory };
  ontologyType: string;
  locked: boolean;
};

export type IEvaluation = {
  title: string;
  description: string;
  type: string;
  plainText: {
    "Measurement units": string;
    "Direction of desirability": string;
    "Criteria for acceptability": string;
    notes: string;
  };
  subOntologies: {
    Specializations: ISubOntologyCategory;
  };
  ontologyType: string;
  locked: boolean;
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
