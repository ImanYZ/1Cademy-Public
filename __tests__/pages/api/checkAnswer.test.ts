jest.mock("src/utils/helpers", () => {
  const original = jest.requireActual("src/utils/helpers");
  return {
    ...original,
    detach: jest.fn().mockImplementation(async (callback: any) => {
      return callback();
    }),
  };
});

import { faker } from "@faker-js/faker";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { Timestamp } from "firebase-admin/firestore";
import moment from "moment";
import HttpMock from "node-mocks-http";
import { ISemesterStudentStat, ISemesterStudentVoteStat } from "src/types/ICourse";
import { IPractice } from "src/types/IPractice";
import { createPractice } from "src/utils";
import { createInstitution } from "testUtils/fakers/institution";
import { createNode, getDefaultNode } from "testUtils/fakers/node";
import { createReputationPoints } from "testUtils/fakers/reputation-point";
import { getDefaultUser } from "testUtils/fakers/user";

import { initFirebaseClientSDK } from "@/lib/firestoreClient/firestoreClient.config";

import { admin, db } from "../../../src/lib/firestoreServer/admin";
import checkAnswerHandler, { ICheckAnswerRequestParams } from "../../../src/pages/api/checkAnswer";
import practiceHandler from "../../../src/pages/api/practice";
import deleteAllUsers from "../../../testUtils/helpers/deleteAllUsers";
import { creditsData, MockData, tagsData } from "../../../testUtils/mockCollections";
initFirebaseClientSDK();

describe("POST /checkAnswer", () => {
  const institutions = [
    createInstitution({
      name: "Franklin College Switzerland",
      domain: "@1cademy.edu",
    }),
  ];

  const users = [
    getDefaultUser({
      institutionName: institutions[0].name,
    }),
  ];
  const nodes = [
    getDefaultNode({
      admin: users[0],
    }),
  ];

  const node2 = createNode({
    admin: users[0],
    nodeType: "Concept",
    parents: [nodes[0]],
  });

  nodes[0].children.push({
    node: node2.documentId!,
    title: node2.title,
    type: node2.nodeType,
  });

  const node3 = createNode({
    admin: users[0],
    choices: [
      {
        choice: "Mock Choice 1",
        correct: false,
        feedback: "Incorrect",
      },
      {
        choice: "Mock Choice 2",
        correct: true,
        feedback: "Correct",
      },
    ],
    nodeType: "Question",
    parents: [node2],
    tags: [nodes[0], node2],
  });

  node2.children.push({
    node: node3.documentId!,
    title: node3.title,
    type: node3.nodeType,
  });

  nodes.push(node2, node3);

  // adding reputation to default user, its required for auth middleware
  const reputations = [
    createReputationPoints({
      tag: nodes[0],
      user: users[0],
    }),
  ];

  const collects = [
    new MockData(institutions, "institutions"),
    tagsData,
    creditsData,
    new MockData(users, "users"),
    new MockData(nodes, "nodes"),
    new MockData(reputations, "reputations"),
    new MockData([], "practice"),
    new MockData([], "semesterStudentStats"),
    new MockData([], "semesterStudentVoteStats"),
    new MockData([], "semesterStudentSankeys"),
    new MockData(
      [
        {
          students: [
            {
              chooseUname: false,
              email: users[0].email,
              fName: users[0].fName,
              lName: users[0].lName,
              imageUrl: users[0].imageUrl,
              uname: users[0].uname,
            },
          ],
          syllabus: [
            {
              title: node2.title,
              node: node2.documentId!,
            },
          ],
          root: nodes[0].documentId!,
          documentId: nodes[0].documentId!,
          tagId: nodes[0].documentId!,
        },
      ],
      "semesters"
    ),
  ];

  const body = {
    tagId: nodes[0].documentId,
  };

  const auth = admin.auth();
  const mockPassword = faker.internet.password(16);
  let accessToken: string = "";
  let flashcardId: string = "";
  let question: any = {};

  beforeEach(async () => {
    const user = await auth.createUser({
      email: users[0].email,
      password: mockPassword,
      disabled: false,
      emailVerified: true,
    });
    const r = await signInWithEmailAndPassword(getAuth(), users[0].email, mockPassword);
    accessToken = await r.user.getIdToken(false);
    users[0].userId = user.uid;

    await Promise.all(collects.map(collect => collect.populate()));
    const batch = db.batch();
    await createPractice({
      tagIds: [nodes[0].documentId!],
      nodeId: node3.documentId!,
      parentId: node2.documentId!,
      currentTimestamp: Timestamp.now(),
      writeCounts: 0,
      batch,
    });
    await batch.commit();

    const req: any = HttpMock.createRequest({
      method: "POST",
      headers: {
        authorization: "Bearer " + accessToken,
      },
      body,
    });

    const res = HttpMock.createResponse();
    await practiceHandler(req, res as any);
    expect(res._getStatusCode()).toBe(200);
    const response: any = JSON.parse(res._getData());
    flashcardId = response.flashcardId;
    question = response.question;
  });

  it("Should be able to answer question correctly.", async () => {
    const req: any = HttpMock.createRequest({
      method: "POST",
      headers: {
        authorization: "Bearer " + accessToken,
      },
      body: {
        answers: [false, true],
        flashcardId,
        nodeId: question.id,
        postpone: false,
      } as ICheckAnswerRequestParams,
    });
    const res = HttpMock.createResponse();

    await checkAnswerHandler(req, res as any);
    expect(res._getStatusCode()).toBe(200);

    const practiceDoc = await db.collection("practice").doc(flashcardId).get();
    const practiceData = practiceDoc.data() as IPractice;

    expect(practiceData.q).toEqual(5);
    expect(moment(practiceData.lastPresented!).startOf("day").isSame(moment().startOf("day"))).toBeTruthy();

    const semesterStudentStats = await db
      .collection("semesterStudentStats")
      .where("tagId", "==", practiceData.tagId)
      .where("uname", "==", users[0].uname)
      .limit(1)
      .get();
    const semesterStudentStat = semesterStudentStats.docs[0].data() as ISemesterStudentStat;

    const statDay = semesterStudentStat.days.find(day => day.day === moment().format("YYYY-MM-DD"));
    expect(!!statDay).toBeTruthy();

    expect(statDay!.chapters[0].correctPractices).toEqual(1);
    expect(statDay!.chapters[0].totalPractices).toEqual(1);

    const semesterStudentVoteStats = await db
      .collection("semesterStudentVoteStats")
      .where("tagId", "==", practiceData.tagId)
      .where("uname", "==", users[0].uname)
      .limit(1)
      .get();
    const semesterStudentVoteStat = semesterStudentVoteStats.docs[0].data() as ISemesterStudentVoteStat;

    const voteStatDay = semesterStudentVoteStat.days.find(day => day.day === moment().format("YYYY-MM-DD"));
    expect(!!voteStatDay).toBeTruthy();

    expect(semesterStudentVoteStat.correctPractices).toEqual(1);
    expect(semesterStudentVoteStat.totalPractices).toEqual(1);

    expect(voteStatDay!.correctPractices).toEqual(1);
    expect(voteStatDay!.totalPractices).toEqual(1);
  });

  it("Should be able to answer question incorrectly.", async () => {
    const req: any = HttpMock.createRequest({
      method: "POST",
      headers: {
        authorization: "Bearer " + accessToken,
      },
      body: {
        answers: [true, false],
        flashcardId,
        nodeId: question.id,
        postpone: false,
      } as ICheckAnswerRequestParams,
    });
    const res = HttpMock.createResponse();

    await checkAnswerHandler(req, res as any);
    expect(res._getStatusCode()).toBe(200);

    const practiceDoc = await db.collection("practice").doc(flashcardId).get();
    const practiceData = practiceDoc.data() as IPractice;

    expect(practiceData.q).toEqual(1);
    expect(moment(practiceData.lastPresented!).startOf("day").isSame(moment().startOf("day"))).toBeTruthy();

    const semesterStudentStats = await db
      .collection("semesterStudentStats")
      .where("tagId", "==", practiceData.tagId)
      .where("uname", "==", users[0].uname)
      .limit(1)
      .get();
    const semesterStudentStat = semesterStudentStats.docs[0].data() as ISemesterStudentStat;

    const statDay = semesterStudentStat.days.find(day => day.day === moment().format("YYYY-MM-DD"));
    expect(!!statDay).toBeTruthy();

    expect(statDay!.chapters[0].correctPractices).toEqual(0);
    expect(statDay!.chapters[0].totalPractices).toEqual(1);

    const semesterStudentVoteStats = await db
      .collection("semesterStudentVoteStats")
      .where("tagId", "==", practiceData.tagId)
      .where("uname", "==", users[0].uname)
      .limit(1)
      .get();
    const semesterStudentVoteStat = semesterStudentVoteStats.docs[0].data() as ISemesterStudentVoteStat;

    const voteStatDay = semesterStudentVoteStat.days.find(day => day.day === moment().format("YYYY-MM-DD"));
    expect(!!voteStatDay).toBeTruthy();

    expect(semesterStudentVoteStat.correctPractices).toEqual(0);
    expect(semesterStudentVoteStat.totalPractices).toEqual(1);

    expect(voteStatDay!.correctPractices).toEqual(0);
    expect(voteStatDay!.totalPractices).toEqual(1);
  });

  it("Should be able to postpone question.", async () => {
    const req: any = HttpMock.createRequest({
      method: "POST",
      headers: {
        authorization: "Bearer " + accessToken,
      },
      body: {
        answers: [],
        flashcardId,
        nodeId: question.id,
        postpone: true,
      } as ICheckAnswerRequestParams,
    });
    const res = HttpMock.createResponse();

    await checkAnswerHandler(req, res as any);
    expect(res._getStatusCode()).toBe(200);

    const practiceDoc = await db.collection("practice").doc(flashcardId).get();
    const practiceData = practiceDoc.data() as IPractice;

    expect(practiceData.q).toEqual(1);
    expect(moment(practiceData.lastPresented!).startOf("day").isSame(moment().startOf("day"))).toBeTruthy();

    expect(
      moment((practiceData.nextDate! as unknown as Timestamp).toDate())
        .startOf("day")
        .isSame(moment().add(1, "day").startOf("day"))
    ).toBeTruthy();

    const semesterStudentStats = await db
      .collection("semesterStudentStats")
      .where("tagId", "==", practiceData.tagId)
      .where("uname", "==", users[0].uname)
      .limit(1)
      .get();
    expect(semesterStudentStats.docs.length).toEqual(0);

    const semesterStudentVoteStats = await db
      .collection("semesterStudentVoteStats")
      .where("tagId", "==", practiceData.tagId)
      .where("uname", "==", users[0].uname)
      .limit(1)
      .get();
    expect(semesterStudentVoteStats.docs.length).toEqual(0);
  });

  afterEach(async () => {
    await deleteAllUsers();
    await Promise.all(collects.map(collect => collect.clean()));
  });
});
