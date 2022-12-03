import { faker } from "@faker-js/faker";
import { Timestamp } from "firebase-admin/firestore";
import { ICourse, ICourseTag, IInstructor, ISemester } from "src/types/ICourse";
import { INode } from "src/types/INode";
import { IUser } from "src/types/IUser";

type IFakeCourseOptions = {
  documentId?: string;
  course?: INode;
  university?: INode;
  semester?: INode;
  program?: INode;
};

export const createCourse = (params: IFakeCourseOptions): ICourse => {
  const { documentId, course, university, semester, program } = params;
  return {
    documentId: documentId ? documentId : faker.datatype.uuid(),
    title: course ? course.title : faker.datatype.string(),
    node: course?.documentId || faker.datatype.uuid(),
    uTagIds: [university?.documentId || faker.datatype.uuid()],
    uTitles: [university?.title || faker.datatype.string()],
    sTagIds: [semester?.documentId || faker.datatype.uuid()],
    sTitles: [semester?.title || faker.datatype.string()],
    pTagIds: [program?.documentId || faker.datatype.uuid()],
    pTags: [program?.title || faker.datatype.string()],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };
};

type IFakeSemesterOptions = {
  documentId?: string;
  course?: INode;
  university?: INode;
  department?: INode;
  program?: INode;
  instructor?: IUser;
  title?: string;
  tagId?: string;
};
export const createSemester = (params: IFakeSemesterOptions): ISemester => {
  const { documentId, instructor, title, tagId, university, course, program, department } = params;
  return {
    documentId: documentId ? documentId : faker.datatype.uuid(),
    instructors: [instructor?.documentId || faker.datatype.uuid()],
    title: title || faker.datatype.string(),
    tagId: tagId || faker.datatype.uuid(),
    uTagId: university?.documentId || faker.datatype.uuid(),
    uTitle: university?.title || faker.datatype.string(),
    dTagId: department?.documentId || faker.datatype.uuid(),
    dTitle: department?.title || faker.datatype.string(),
    cTagId: course?.documentId || faker.datatype.uuid(),
    cTitle: course?.title || faker.datatype.string(),
    pTitle: program?.title || faker.datatype.string(), // program tile
    pTagId: program?.documentId || faker.datatype.uuid(), // program tag id
    syllabus: [],
    days: 0,
    isProposalRequired: true,
    isQuestionProposalRequired: true,
    isCastingVotesRequired: true,
    isGettingVotesRequired: true,
    startDate: Timestamp.now(),
    endDate: Timestamp.now(),
    nodeProposals: {
      startDate: Timestamp.now(),
      endDate: Timestamp.now(),
      numPoints: 0,
      numProposalPerDay: 0,
      totalDaysOfCourse: 0,
    },
    questionProposals: {
      startDate: Timestamp.now(),
      endDate: Timestamp.now(),
      numPoints: 0,
      numQuestionsPerDay: 0,
      totalDaysOfCourse: 0,
    },
    votes: {
      pointIncrementOnAgreement: 0,
      pointDecrementOnAgreement: 0,
      onReceiveVote: 0,
      onReceiveDownVote: 0,
      onReceiveStar: 0,
    },
    deleted: false,
    students: [],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };
};

type IFakeInstructorOptions = {
  documentId?: string;
  instructor?: IUser;
  semester?: ISemester;
};
export const createInstructor = (params: IFakeInstructorOptions): IInstructor => {
  const { documentId, instructor, semester } = params;
  let courses: ICourseTag[] = [];
  if (semester) {
    courses.push({
      cTagId: semester.cTagId,
      cTitle: semester.cTitle,
      pTagId: semester.pTagId,
      pTitle: semester.pTitle,
      tagId: semester.tagId,
      title: semester.title,
      uTagId: semester.uTagId,
      uTitle: semester.uTitle,
    });
  }
  return {
    documentId: documentId ? documentId : faker.datatype.uuid(),
    uname: instructor?.uname || faker.internet.userName(),
    courses,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };
};
