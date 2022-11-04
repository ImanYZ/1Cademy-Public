import { Timestamp } from "firebase/firestore";

export type ISemesterSyllabusItem = {
  title: string;
  node: string;
  children?: ISemesterSyllabusItem[];
};

export type ISemesterStudent = {
  uname: string;
  totalPoints: number;
  newNodes: number;
  improvements: number;
  questions: number;
  questionPoints: number;
  votes: number;
  votePoints: number;
};

// document id should be semester id as well
export type ISemester = {
  instructors: string[]; // list of uid/uname
  title: string;
  tagId: string; // semester tag id
  tag: string; // semester tag name
  uTagId: string; // university tag id
  uTag: string; // university tag name
  cTagId: string; // course tag id
  cTag: string; // course tag
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
};

export type ICourseTag = {
  ctagId: string; // tagId of course
  cTag: string;
  uTagId: string; // University Tag Id
  uTag: string;
  tagId: string; // Semester Tag Id
  tag: string;
};

export type IInstructor = {
  uname: string;
  courses: ICourseTag[];
};

export type ICourse = {
  title: string;
  node: string;
  uTagIds: string[];
  uTags: string[];
  sTagIds: string[];
  sTags: string[];
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
};

export type ISemesterStudentVoteStat = {
  tagId: string; // tagId of semester
  uname: string;
  upVotes: number;
  downVotes: number;
  instVotes: number;
  agreementsWithInst: number;
  disagreementsWithInst: number;
};
