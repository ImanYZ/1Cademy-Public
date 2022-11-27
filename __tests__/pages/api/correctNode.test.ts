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
import HttpMock from "node-mocks-http";
import { initFirebaseClientSDK } from "src/lib/firestoreClient/firestoreClient.config";
import { createCredit } from "testUtils/fakers/credit";
import { createPendingPropNum } from "testUtils/fakers/pending-prop-num";

initFirebaseClientSDK();
import { Timestamp } from "firebase-admin/firestore";
import { IInstitution } from "src/types/IInstitution";
import { INode } from "src/types/INode";
import { IUser } from "src/types/IUser";
import { signalNodeToTypesense } from "src/utils/version-helpers";
import { createInstitution } from "testUtils/fakers/institution";
import { TypesenseMock } from "testUtils/typesenseMocks";

import { TypesenseNodeSchema } from "@/lib/schemas/node";
import { getTypesenseClient } from "@/lib/typesense/typesense.config";

import { admin, db } from "../../../src/lib/firestoreServer/admin";
import correctNodeHandler from "../../../src/pages/api/correctNode/[nodeId]";
import { createComMonthlyPoints, createComPoints, createComWeeklyPoints } from "../../../testUtils/fakers/com-point";
import { createNode, createNodeVersion, getDefaultNode } from "../../../testUtils/fakers/node";
import {
  createMonthlyReputationPoints,
  createReputationPoints,
  createWeeklyReputationPoints,
} from "../../../testUtils/fakers/reputation-point";
import { createUser, getDefaultUser } from "../../../testUtils/fakers/user";
import { createUserNode } from "../../../testUtils/fakers/userNode";
import deleteAllUsers from "../../../testUtils/helpers/deleteAllUsers";
import { MockData } from "../../../testUtils/mockCollections";

describe("POST /api/wrongNode", () => {
  const institutions = [
    createInstitution({
      domain: "@1cademy.com",
    }),
  ];

  const users = [
    getDefaultUser({
      institutionName: institutions[0].name,
    }),
    createUser({
      institutionName: institutions[0].name,
    }),
  ];
  const nodes = [
    getDefaultNode({
      admin: users[0],
    }),
  ];

  // setting default community to default user
  users[0].tag = nodes[0].title;
  users[0].tagId = String(nodes[0].documentId);
  // for 2nd mock user
  users[1].tag = nodes[0].title;
  users[1].tagId = String(nodes[0].documentId);

  // adding reputation to default user, its required for auth middleware
  const reputations = [
    createReputationPoints({
      tag: nodes[0],
      user: users[0],
    }),
  ];
  // for 2nd mock user
  reputations.push(
    createReputationPoints({
      tag: nodes[0],
      user: users[1],
    })
  );

  const pendingPropNums = [
    createPendingPropNum({
      user: users[0],
      pNum: 1,
      tag: nodes[0],
    }),
    createPendingPropNum({
      user: users[1],
      pNum: 1,
      tag: nodes[0],
    }),
  ];

  nodes.push(
    createNode({
      admin: users[0],
      tags: [nodes[0]],
      corrects: 1,
      isTag: true,
      children: [nodes[0]],
    })
  );

  nodes.push(
    createNode({
      admin: users[0],
      tags: [nodes[0]],
      corrects: 1,
      isTag: true,
      parents: [nodes[0]],
    })
  );

  nodes[0].tagIds = [String(nodes[1].documentId), String(nodes[2].documentId)];
  nodes[0].parents = [
    {
      node: String(nodes[1].documentId),
      title: String(nodes[1].title),
    },
  ];

  nodes[0].children = [
    {
      node: String(nodes[2].documentId),
      title: String(nodes[2].title),
    },
  ];
  const userNodes = [
    createUserNode({
      node: nodes[0],
      correct: true,
    }),
    createUserNode({
      node: nodes[1],
      correct: false,
    }),
  ];
  const nodeVersions = [
    // first accepted proposal
    createNodeVersion({
      node: nodes[0],
      accepted: true,
      proposer: users[0],
      corrects: 1,
    }),
    createNodeVersion({
      node: nodes[1],
      accepted: false,
      proposer: users[1],
      corrects: 0,
      tags: [nodes[0]],
    }),
  ];
  nodes[1].versions = 1;

  const credits = [
    createCredit({
      credits: 100,
      tag: nodes[0],
    }),
  ];
  // default user reputation
  const reputationPoints = [
    createReputationPoints({
      user: users[0],
      tag: nodes[0],
      // cnCorrects: 1
    }),
    createReputationPoints({
      user: users[1],
      tag: nodes[0],
      // cnCorrects: 1
    }),
  ];
  const monthlyReputationPoints = [
    createMonthlyReputationPoints({
      user: users[0],
      tag: nodes[0],
      // cnCorrects: 1
    }),
    createMonthlyReputationPoints({
      user: users[1],
      tag: nodes[0],
      // cnCorrects: 1
    }),
  ];
  const weeklyReputationPoints = [
    createWeeklyReputationPoints({
      user: users[0],
      tag: nodes[0],
      // cnCorrects: 1
    }),
    createWeeklyReputationPoints({
      user: users[1],
      tag: nodes[0],
      // cnCorrects: 1
    }),
  ];
  // default user reputation from others
  const otherReputationPoints = [
    createReputationPoints({
      user: users[0],
      tag: nodes[0],
      // cnCorrects: 1
    }),
    createReputationPoints({
      user: users[1],
      tag: nodes[0],
      // cnCorrects: 1
    }),
  ];
  const otherMonthlyReputationPoints = [
    createMonthlyReputationPoints({
      user: users[0],
      tag: nodes[0],
      // cnCorrects: 1
    }),
    createMonthlyReputationPoints({
      user: users[1],
      tag: nodes[0],
      // cnCorrects: 1
    }),
  ];
  const otherWeeklyReputationPoints = [
    createWeeklyReputationPoints({
      user: users[0],
      tag: nodes[0],
      // cnCorrects: 1
    }),
    createWeeklyReputationPoints({
      user: users[1],
      tag: nodes[0],
      // cnCorrects: 1
    }),
  ];

  // default user community points
  const comPoints = [
    createComPoints({
      admin: users[0],
      tag: nodes[0],
      // cnCorrects: 1
    }),
  ];
  const comMonthlyPoints = [
    createComMonthlyPoints({
      admin: users[0],
      tag: nodes[0],
      // cnCorrects: 1
    }),
  ];
  const comWeeklyPoints = [
    createComWeeklyPoints({
      admin: users[0],
      tag: nodes[0],
      // cnCorrects: 1
    }),
  ];
  // default user other community points
  const otherComPoints = [
    createComPoints({
      admin: users[0],
      tag: nodes[0],
      // cnCorrects: 1
    }),
  ];
  const otherComMonthlyPoints = [
    createComMonthlyPoints({
      admin: users[0],
      tag: nodes[0],
      // cnCorrects: 1
    }),
  ];
  const otherComWeeklyPoints = [
    createComWeeklyPoints({
      admin: users[0],
      tag: nodes[0],
      // cnCorrects: 1
    }),
  ];
  const auth = admin.auth();
  const mockPassword = faker.internet.password(16);

  const usersCollection = new MockData(users, "users");
  const nodesCollection = new MockData(nodes, "nodes");
  const creditsCollection = new MockData(credits, "credits");
  const pendingPropNumsCollection = new MockData(pendingPropNums, "pendingPropsNums");
  const userNodesCollection = new MockData(userNodes, "userNodes");
  const nodeVersionsCollection = new MockData(nodeVersions, "conceptVersions");
  const reputationsCollection = new MockData(reputations, "reputations");

  const comPointsCollection = new MockData(comPoints, "comPoints");
  const comMonthlyPointsCollection = new MockData(comMonthlyPoints, "comMonthlyPoints");
  const comWeeklyPointsCollection = new MockData(comWeeklyPoints, "comWeeklyPoints");
  const otherComPointsCollection = new MockData(otherComPoints, "comOthersPoints");
  const otherComMonthlyPointsCollection = new MockData(otherComMonthlyPoints, "comOthMonPoints");
  const otherComWeeklyPointsCollection = new MockData(otherComWeeklyPoints, "comOthWeekPoints");

  const reputationPointsCollection = new MockData(reputationPoints, "reputations");
  const monthlyReputationPointsCollection = new MockData(monthlyReputationPoints, "monthlyReputations");
  const weeklyReputationPointsCollection = new MockData(weeklyReputationPoints, "weeklyReputations");
  const otherReputationPointsCollection = new MockData(otherReputationPoints, "othersReputations");
  const otherMonthlyReputationPointsCollection = new MockData(otherMonthlyReputationPoints, "othMonReputations");
  const otherWeeklyReputationPointsCollection = new MockData(otherWeeklyReputationPoints, "othWeekReputations");

  const collects = [
    usersCollection,
    nodesCollection,
    creditsCollection,
    pendingPropNumsCollection,
    userNodesCollection,
    nodeVersionsCollection,
    reputationsCollection,
    comPointsCollection,
    comMonthlyPointsCollection,
    comWeeklyPointsCollection,
    otherComPointsCollection,
    otherComMonthlyPointsCollection,
    otherComWeeklyPointsCollection,
    reputationPointsCollection,
    monthlyReputationPointsCollection,
    weeklyReputationPointsCollection,
    otherReputationPointsCollection,
    otherMonthlyReputationPointsCollection,
    otherWeeklyReputationPointsCollection,
    new MockData(institutions, "institutions"),
    new MockData([], "notificationNums"),
    new MockData([], "notifications"),
    new MockData([], "userNodesLog"),
    new TypesenseMock(TypesenseNodeSchema, [], "nodes"),
  ];

  let accessToken: string = "";
  let req: any = {};
  let res: any = {};
  let prevVersionDoc: any = {};
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

    await signalNodeToTypesense({
      currentTimestamp: Timestamp.now(),
      nodeId: String(nodes[0].documentId),
      versionData: nodeVersions[0],
    });

    prevVersionDoc = await db.collection("conceptVersions").where("node", "==", nodes[0].documentId).get();
    req = HttpMock.createRequest({
      method: "POST",
      body: {},
      headers: {
        authorization: "Bearer " + accessToken,
      },
    });
    req.query.nodeId = nodes[0].documentId;
    res = HttpMock.createResponse();
    await correctNodeHandler(req, res as any);
  });

  afterAll(async () => {
    await deleteAllUsers();
    await Promise.all(collects.map(collect => collect.clean()));
  });

  it("Shouldn't be able to delete version of other user", async () => {
    expect(res._getStatusCode()).toEqual(200);
  });

  it("Should be update corrects field in version collection", async () => {
    let corrects = prevVersionDoc.docs[0].data()?.corrects + 1;
    expect(corrects).toEqual(2);
  });

  it("contribution should be updated", async () => {
    let contribution = 1;
    const user = await db.collection("users").doc(String(users[0].documentId)).get();
    const userData = user.data() as IUser;
    expect(userData.totalPoints).toEqual(contribution);

    const institution = await db.collection("institutions").doc(String(institutions[0].documentId)).get();
    const institutionData = institution.data() as IInstitution;
    expect(institutionData.totalPoints).toEqual(contribution);

    const node = await db.collection("nodes").doc(String(nodes[0].documentId)).get();
    const nodeData = node.data() as INode;

    expect(nodeData.contribNames.includes(users[0].uname)).toEqual(true);
    expect(nodeData.contributors.hasOwnProperty(users[0].uname)).toEqual(true);
    expect(nodeData.contributors[users[0].uname].reputation).toEqual(contribution);

    expect(nodeData.institNames.includes(users[0].deInstit)).toEqual(true);
    expect(nodeData.institutions.hasOwnProperty(users[0].deInstit)).toEqual(true);
    expect(nodeData.institutions[users[0].deInstit].reputation).toEqual(contribution);
  });

  it("node title updated in typesense", async () => {
    const nodeData = (await db.collection("nodes").doc(String(nodes[0].documentId)).get()).data() as INode;
    const typesense = getTypesenseClient();
    const tsNodeData: any = await typesense.collections("nodes").documents(String(nodes[0].documentId)).retrieve();
    expect(tsNodeData.corrects).toEqual(nodeData.corrects);
  });
});
