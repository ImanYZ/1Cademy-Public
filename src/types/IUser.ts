import { Timestamp } from "firebase-admin/firestore";

export type ITheme = "Dark" | "Light";

export type IUser = {
  documentId?: string;
  fName: string;
  lName: string;
  tag: string; // community name
  tagId: string;
  institUpdated?: boolean; // TODO: investigate how its getting updated
  deCourse?: string;
  deInstit: string;
  clickedTOS: boolean;
  imgOrColor: boolean;
  imageUrl: string;
  practicing?: boolean;
  clickedCP: boolean;
  clickedPP: boolean;
  country: string;
  background: string;
  gender: string;
  totalPoints: number;
  color?: string;
  sNode: string; // selected node
  consented: boolean; // signed to consent
  clickedConsent: boolean; // to view consent document
  blocked?: boolean;
  lang: string;
  deCredits?: number; // TODO: for future, number of credits for students in each course
  uname: string;
  email: string;
  userId: string;
  theme: ITheme;
  deMajor: string;
  from: string;
  education: string;
  ethnicity: string[]; // pre-specified values with free text possibility
  stateId: string;
  state: string;
  city: string;
  chooseUname: boolean;
  occupation: string;
  foundFrom: string; // pre-specified values with free text possibility
  fieldOfInterest: string; // free text
  birthDate?: Date | Timestamp | null;
  reason: string;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
};
