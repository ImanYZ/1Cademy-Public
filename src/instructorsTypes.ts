import { KnowledgeChoice } from "./knowledgeTypes";
import {
  IInstructor,
  ISemester,
  ISemesterStudent,
  ISemesterStudentStat,
  ISemesterStudentVoteStat,
} from "./types/ICourse";

export type Instructor = IInstructor;

export type SemesterStudentVoteStat = ISemesterStudentVoteStat & {
  links: number;
  nodes: number;
};

export type SemesterStudentStat = ISemesterStudentStat;

export type Semester = ISemester;

export type Trends = {
  date: Date;
  num: number;
};

export type StackedBarStats = {
  index: number;
  alessEqualTen: number;
  bgreaterTen: number;
  cgreaterFifty: number;
  dgreaterHundred: number;
};

export type BubbleStats = {
  students: number;
  votes: number;
  points: number;
  studentsList: ISemesterStudent[];
};

export type MaxPoints = {
  maxProposalsPoints: number;
  maxQuestionsPoints: number;
  maxDailyPractices: number;
};

export type BubbleAxis = {
  maxAxisX: number;
  maxAxisY: number;
  minAxisX: number;
  minAxisY: number;
};

export type GeneralSemesterStudentsStats = {
  childProposals: number;
  editProposals: number;
  links: number;
  nodes: number;
  votes: number;
  questions: number;
  correctPractices: number;
};

export type MappedData = {
  date: string;
  value: GeneralSemesterStudentsStats;
};

export type CourseTag = {
  documentId?: string;
  pTagId: string;
  pTitle: string;
  cTagId: string;
  cTitle: string;
  uTagId: string;
  uTitle: string;
  tagId: string;
  title: string;
};

export type SimpleQuestionNode = {
  id: string;
  choices: KnowledgeChoice[];
  tags: string[];
  content: string;
  corrects: number;
  nodeImage: string;
  nodeVideo: string;
  nodeAudio: string;
  studied: number;
  title: string;
  wrongs: number;
  correct: boolean;
  isStudied: boolean;
  wrong: boolean;
};
