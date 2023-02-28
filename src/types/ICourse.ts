import { Timestamp } from "firebase-admin/firestore";
export type ISemesterSyllabusItem = {
  title: string;
  node?: string;
  children?: ISemesterSyllabusItem[];
};
export type ISemesterStudent = {
  uname: string;
  chooseUname: boolean;
  imageUrl: string;
  fName: string;
  lName: string;
  email: string;
};
// document id should be semester id as well
export type ISemester = {
  documentId?: string;
  startDate: Timestamp;
  endDate: Timestamp;
  instructors: string[]; // list of uid/uname
  title: string;
  tagId: string; // semester tag id
  uTagId: string; // university tag id
  uTitle: string; // university tag name
  cTagId: string; // course tag id
  cTitle: string; // course tag
  dTitle: string; // department tile
  dTagId: string; // department tag id
  pTitle: string; // program tile
  pTagId: string; // program tag id
  // tagIds: string[];
  // tags: string[]; // (CourseName, UniversityName, BatchName)
  syllabus: ISemesterSyllabusItem[];
  days: number;
  nodeProposals: {
    startDate: Timestamp;
    endDate: Timestamp;
    numPoints: number;
    numProposalPerDay: number;
    totalDaysOfCourse: number;
  };
  questionProposals: {
    startDate: Timestamp;
    endDate: Timestamp;
    numPoints: number;
    numQuestionsPerDay: number;
    totalDaysOfCourse: number;
  };
  votes: {
    pointIncrementOnAgreement: number;
    pointDecrementOnAgreement: number;
    onReceiveVote: number;
    onReceiveDownVote: number;
    onReceiveStar: number;
  };
  isProposalRequired: boolean;
  isQuestionProposalRequired: boolean;
  isCastingVotesRequired: boolean;
  isGettingVotesRequired: boolean;
  deleted: boolean;
  students: ISemesterStudent[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type ICourseTag = {
  pTagId: string; // program tag id
  pTitle: string;
  cTagId: string; // tagId of course
  cTitle: string;
  uTagId: string; // University Tag Id
  uTitle: string;
  tagId: string; // Semester Tag Id
  title: string;
};
export type IInstructor = {
  documentId?: string;
  uname: string;
  courses: ICourseTag[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
export type ICourse = {
  documentId?: string;
  title: string;
  node: string;
  pTagIds: string[];
  pTags: string[];
  uTagIds: string[];
  uTitles: string[];
  sTagIds: string[];
  sTitles: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
export type ISemesterStudentStatChapter = {
  node: string; // chapter node id
  title: string; // chapter title
  proposals: number; // all pending/accepted proposals //+-
  questions: number; // all accepted questions //+-
  nodes: number; // pending/accepted proposals of new nodes //+-
  questionProposals: number; // all question proposals //+-
  newNodes: number; //+-
  links: number; // pending/accepted links //+
  agreementsWithInst: number;
  disagreementsWithInst: number;
};
export type ISemesterStudentStatDay = {
  day: string; // 11-1-2022 -> now changing to YYYY-MM-DD
  chapters: ISemesterStudentStatChapter[];
};
export type ISemesterStudentStat = {
  documentId?: string;
  tagId: string; // tagId of semester
  uname: string;
  days: ISemesterStudentStatDay[];
  deleted: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type ISemesterStudentVoteStatDay = {
  proposals: number; // pending/accepted proposals //+
  questions: number; // accepted questions //+
  questionProposals: number; // pending/accepted questions //+
  nodes: number; // pending/accepted questions //+
  links: number; // pending/accepted links //+
  agreementsWithInst: number; //+
  disagreementsWithInst: number; //+
  newNodes: number; // accepted nodes //+
  improvements: number; // accepted improvement proposals //+
  upVotes: number; //+
  downVotes: number; //+
  instVotes: number;
  day: string; // YYYY-MM-DD
};
// semesterStudentVoteStats
export type ISemesterStudentVoteStat = {
  documentId?: string;
  tagId: string; // tagId of semester
  uname: string;
  upVotes: number; //+
  downVotes: number; //+
  instVotes: number;
  agreementsWithInst: number; //+
  disagreementsWithInst: number; //+
  lastActivity: Timestamp;
  days: ISemesterStudentVoteStatDay[];
  totalPoints?: number;
  nodes: number; // pending/accepted nodes //+-
  newNodes: number; // accepted nodes //+-
  improvements: number; // accepted improvement proposals //+-
  links: number; // pending/accepted links //+-
  questions: number; //+-
  questionProposals: number; //+-
  questionPoints?: number;
  proposalPoints?: number;
  votes?: number;
  votePoints?: number; // depreciated
  deleted: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type ISemesterStudentSankeyInteraction = {
  upVote: number;
  downVote: number;
  uname: string;
};

// semesterStudentSankeys
export type ISemesterStudentSankey = {
  //+
  documentId?: string;
  deleted: boolean;
  intractions: ISemesterStudentSankeyInteraction[];
  tagId: string;
  uname: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
