import { Timestamp } from "firebase/firestore";

export type ICourseSyllabusItem = {
  title: string;
  node: string;
  children?: ICourseSyllabusItem[];
};

export type ICourseNodeProposalSettings = {
  startDate: Timestamp;
  endDate: Timestamp;
  numPoints: number;
  numProposalPerDay: number;
  totalDaysOfCourse: number;
};

export type ICourseQuestionProposalSettings = {
  startDate: Timestamp;
  endDate: Timestamp;
  numPoints: number;
  numQuestionsPerDay: number;
  totalDaysOfCourse: number;
};

export type ICourseStudent = {
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
  utag: string; // university tag name
  cTagId: string; // course tag id
  ctag: string; // course tag
  // tagIds: string[];
  // tags: string[]; // (CourseName, UniversityName, BatchName)
  syllabus: ICourseSyllabusItem[];
  days: number;
  nodeProposals: ICourseNodeProposalSettings;
  questionProposals: ICourseQuestionProposalSettings;
  votes: {
    pointIncrementOnAgreement: number;
    pointDecrementOnAgreement: number;
    onReceiveVote: number;
    onReceiveDownVote: number;
    onReceiveStar: number;
  };
  deleted: boolean;
  students: ICourseStudent[];
};

export type IInstructor = {
  uname: string;
  courses: string[];
};

export type ICourseTag = {
  ctagId: string; // tagId of course
  uTagId: string; // University Tag Id
  tagId: string; // Semester Tag Id
};

export type ICourseStudentStatDay = {
  day: string; // 11-1-2022
  proposals: number;
  questions: number;
};

export type ICourseStudentStat = {
  tagId: string; // tagId of semester
  uname: string;
  days: ICourseStudentStatDay[];
};

export type ICourseStudentVoteStatDay = {
  upVotes: number;
  downVotes: number;
  instVotes: number;
  agreementsWithInst: number;
  disagreementsWithInst: number;
};

export type ICourseStudentVoteStat = {
  tagId: string; // tagId of semester
  uname: string;
  days: ICourseStudentVoteStatDay[];
};
