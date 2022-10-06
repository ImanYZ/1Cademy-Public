import { faker } from "@faker-js/faker";
import { INode } from "src/types/INode";

import { IUser } from "../../src/types/IUser";

type IFakeUserOptions = {
  documentId?: string;
  tag?: INode;
  sNode?: INode;
  uname?: string;
};

export function createUser(params: IFakeUserOptions): IUser {
  const clickedConsent = faker.datatype.boolean();
  const uname = params.uname ? params.uname : faker.internet.userName();
  return {
    documentId: uname,
    fName: faker.hacker.noun(),
    lName: faker.hacker.noun(),
    tag: String(params.tag?.title), // community name
    tagId: String(params.tag?.documentId),
    institUpdated: false,
    deCourse: faker.hacker.noun(),
    deInstit: faker.hacker.noun(),
    clickedTOS: false,
    imgOrColor: false,
    imageUrl: faker.image.imageUrl(),
    practicing: false,
    clickedCP: false,
    clickedPP: false,
    country: faker.address.country(),
    background: faker.image.imageUrl(),
    gender: faker.datatype.boolean() ? "Male" : "Female",
    totalPoints: 0,
    color: faker.color.rgb(),
    sNode: params.sNode ? String(params.sNode.documentId) : "", // selected node
    consented: clickedConsent ? faker.datatype.boolean() : false, // signed to consent
    clickedConsent, // to view consent document
    blocked: false,
    lang: "English",
    deCredits: faker.datatype.number({ precision: 0 }),
    uname: uname,
    email: faker.internet.email(),
    userId: faker.git.commitSha(),
    theme: faker.datatype.boolean() ? "Dark" : "Light",
    deMajor: faker.hacker.noun(),
    from: "Facebook",
    education: faker.company.name(),
    ethnicity: [faker.address.country()], // pre-specified values with free text possibility
    stateId: faker.address.stateAbbr(),
    state: faker.address.state(),
    city: faker.address.city(),
    chooseUname: params.uname ? true : faker.datatype.boolean(),
    occupation: faker.hacker.verb(),
    foundFrom: "Facebook", // pre-specified values with free text possibility
    fieldOfInterest: faker.hacker.adjective(), // free text
    birthDate: faker.date.past(),
    reason: faker.hacker.phrase(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
export function getDefaultUser(params: IFakeUserOptions): IUser {
  return {
    documentId: "1man",
    fName: "Iman",
    lName: "YeckehZaare",
    tag: "1Cademy", // community name
    tagId: "r98BjyFDCe4YyLA3U8ZE",
    institUpdated: false,
    deCourse: "SI491",
    deInstit: "University of Michigan - Ann Arbor",
    clickedTOS: false,
    imgOrColor: false,
    imageUrl: faker.image.imageUrl(),
    practicing: false,
    clickedCP: false,
    clickedPP: false,
    country: "United States",
    background: "Color",
    gender: faker.datatype.boolean() ? "Male" : "Female",
    totalPoints: 0,
    color: "#36cd96",
    sNode: "r98BjyFDCe4YyLA3U8ZE", // selected node
    consented: true, // signed to consent
    clickedConsent: true, // to view consent document
    blocked: false,
    lang: "English",
    deCredits: 3,
    uname: "1man",
    email: "oneweb@umich.edu",
    userId: "DVuSVtfgvbfJmQVuHCzD",
    theme: "Dark",
    deMajor: "Information Science",
    from: "Facebook",
    education: "Current undergraduate student",
    ethnicity: ["Asian"], // pre-specified values with free text possibility
    stateId: "3924",
    state: "New York",
    city: "New York City",
    chooseUname: false,
    occupation: "Researcher",
    foundFrom: "Facebook", // pre-specified values with free text possibility
    fieldOfInterest: "Information Science", // free text
    birthDate: faker.date.past(),
    reason: faker.hacker.phrase(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export function convertUserToTypeSchema(user: IUser) {
  return {
    username: user.uname,
    name: `${user.fName} ${user.lName}`,
    imageUrl: user.imageUrl,
  };
}
