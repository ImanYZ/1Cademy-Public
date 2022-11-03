import { Timestamp } from "firebase/firestore";

import { IReputation } from "./IReputationPoint";

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

export type ICourse = {
  instructors: string[]; // list of uid/uname
  title: string;
  tagIds: string[];
  tags: string[]; // (CourseName, UniversityName, BatchName)
  // students: number;
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

// we can use this for  weekly, monthly
// tagId is course tag id
export type ICoursePoint = IReputation & {
  uTagId: string; // University tag id
  bTagId: string; // Batch tag id
};

export type ICourseTag = {
  tagId: string; // tagId of course
  uTagId: string; // University Tag Id
  bTagId: string; // Batch Tag Id
};

export type ICourseStudentStat = {
  tagId: string; // tagId of course
  uTagId: string; // University Tag Id
  bTagId: string; // Batch Tag Id
  uname: string;
  day: string; // 11-1-2022
  proposals: number;
  questions: number;
};
