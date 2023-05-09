import { UserDocument } from "../../src/knowledgeTypes";

export const registeredUser: UserDocument = {
  email: "",
  uname: "",
  birthDate: "",
  ethnicity: ["some ethnicity"],
  fieldOfInterest: "some field of interest",
  userId: "007",
  foundFrom: "internet",
  occupation: "developer",
  role: null,
};
