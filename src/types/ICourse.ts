import { Timestamp } from "firebase-admin/firestore";

export type ISemesterSyllabusItem = {
  title: string;
  node: string;
  children?: ISemesterSyllabusItem[];
};

export type ISemesterStudent = {
  uname: string;
  chooseUname: string;
  imageUrl: string;
  fullname: string;
};

// document id should be semester id as well
export type ISemester = {
  instructors: string[]; // list of uid/uname
  title: string;
  tagId: string; // semester tag id
  uTagId: string; // university tag id
  uTitle: string; // university tag name
  cTagId: string; // course tag id
  cTitle: string; // course tag
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
  deleted: boolean;
  students: ISemesterStudent[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type ICourseTag = {
  cTagId: string; // tagId of course
  cTitle: string;
  uTagId: string; // University Tag Id
  uTitle: string;
  tagId: string; // Semester Tag Id
  title: string;
};

export type IInstructor = {
  uname: string;
  courses: ICourseTag[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type ICourse = {
  title: string;
  node: string;
  uTagIds: string[];
  uTitles: string[];
  sTagIds: string[];
  sTitles: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type ISemesterStudentStatDay = {
  day: string; // 11-1-2022
  proposals: number;
  questions: number;
};

export type ISemesterStudentStat = {
  tagId: string; // tagId of semester
  uname: string;
  days: ISemesterStudentStatDay[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type ISemesterStudentVoteStat = {
  tagId: string; // tagId of semester
  uname: string;
  upVotes: number;
  downVotes: number;
  instVotes: number;
  agreementsWithInst: number;
  disagreementsWithInst: number;
  lastActivity: Timestamp;

  totalPoints: number;
  newNodes: number;
  improvements: number;
  questions: number;
  questionPoints: number;
  votes: number;
  votePoints: number;

  deleted: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
