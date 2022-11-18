import {
  ICourseTag,
  IInstructor,
  ISemester,
  ISemesterStudent,
  ISemesterStudentStat,
  ISemesterStudentVoteStat,
} from "./types/ICourse";

export type Instructor = IInstructor;

export type CourseTag = ICourseTag;

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

export type SemesterStats = {
  newNodeProposals: number;
  editProposals: number;
  links: number;
  nodes: number;
  votes: number;
  questions: number;
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
};

export type BubbleAxis = {
  maxAxisX: number;
  maxAxisY: number;
  minAxisX: number;
  minAxisY: number;
};
