import { faker } from "@faker-js/faker";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { Timestamp } from "firebase-admin/firestore";
import HttpMock from "node-mocks-http";
import { createPractice } from "src/utils";
import { createInstitution } from "testUtils/fakers/institution";
import { createNode, getDefaultNode } from "testUtils/fakers/node";
import { createReputationPoints } from "testUtils/fakers/reputation-point";
import { getDefaultUser } from "testUtils/fakers/user";

import { initFirebaseClientSDK } from "@/lib/firestoreClient/firestoreClient.config";

import { admin, db } from "../../../src/lib/firestoreServer/admin";
import practiceHandler from "../../../src/pages/api/practice";
import deleteAllUsers from "../../../testUtils/helpers/deleteAllUsers";
import { creditsData, MockData, tagsData } from "../../../testUtils/mockCollections";
initFirebaseClientSDK();

describe("POST /practice", () => {
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
    new MockData(
      [
        {
          documentId: nodes[0].documentId!,
          tagId: nodes[0].documentId!,
        },
      ],
      "courses"
    ),
  ];

  const body = {
    tagId: nodes[0].documentId,
  };

  const auth = admin.auth();
  const mockPassword = faker.internet.password(16);
  let accessToken: string = "";

  beforeAll(async () => {
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
  });

  let flashcardId: string = "";

  it("Should be able to get question.", async () => {
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
    expect(response.flashcardId !== undefined).toBeTruthy();
  });

  // in next endpoint call as there are not other nodes to present in graph as practice
  it("Should get done=true when all questions are practiced.", async () => {
    const practiceRef = db.collection("practice").doc(flashcardId);
    practiceRef.update({
      q: 5,
    });

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
    expect(response.done).toBeTruthy();
  });

  afterAll(async () => {
    await deleteAllUsers();
    await Promise.all(collects.map(collect => collect.clean()));
  });
});
