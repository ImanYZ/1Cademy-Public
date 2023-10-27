export type ISubOntology = { title: string; id: string; category?: string; editMode?: boolean; new?: boolean };

type IOntologyTypes = "activity" | "actor" | "processe" | "role" | "evaluation";

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
