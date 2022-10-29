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

import { IComPoint } from "../../../src/types/IComPoint";
import { IReputation } from "../../../src/types/IReputationPoint";
initFirebaseClientSDK();
import { admin, db } from "../../../src/lib/firestoreServer/admin";
import wrongNodeHandler from "../../../src/pages/api/wrongNode/[nodeId]";
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
import { conceptVersionsData, MockData } from "../../../testUtils/mockCollections";

describe("POST /api/wrongNode", () => {
  const users = [getDefaultUser({}), createUser({})];
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
    conceptVersionsData,
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
    new MockData([], "notificationNums"),
    new MockData([], "notifications"),
    new MockData([], "userNodesLog"),
  ];
  const positiveFields = [
    // for Concept nodes
    "cnCorrects",
    "cnInst",
    // for Code nodes
    "cdCorrects",
    "cdInst",
    // for Question nodes
    "qCorrects",
    "qInst",
    //  for Profile nodes
    "pCorrects",
    "pInst",
    //  for Sequel nodes
    "sCorrects",
    "sInst",
    //  for Advertisement nodes
    "aCorrects",
    "aInst",
    //  for Reference nodes
    "rfCorrects",
    "rfInst",
    //  for News nodes
    "nCorrects",
    "nInst",
    //  for Idea nodes
    "iCorrects",
    "iInst",
    //  for Relation nodes
    "mCorrects",
    "mInst",
  ];

  const negativeFields = [
    // for Concept nodes
    "cnWrongs",
    // for Code nodes
    "cdWrongs",
    // for Question nodes
    "qWrongs",
    //  for Profile nodes
    "pWrongs",
    //  for Sequel nodes
    "sWrongs",
    //  for Advertisement nodes
    "aWrongs",
    //  for Reference nodes
    "rfWrongs",
    //  for News nodes
    "nWrongs",
    //  for Idea nodes
    "iWrongs",
    //  for Relation nodes
    "mWrongs",
  ];

  let accessToken: string = "";
  let req: any = {};
  let res: any = {};
  let nodeDoc: any = {};
  let node1Doc: any = {};
  let node2Doc: any = {};
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
    await wrongNodeHandler(req, res as any);
    nodeDoc = await db.collection("nodes").doc(String(nodes[0].documentId)).get();
    node1Doc = await db.collection("nodes").doc(String(nodes[1].documentId)).get();
    node2Doc = await db.collection("nodes").doc(String(nodes[2].documentId)).get();
    //versionDoc = await db.collection("conceptVersions").where("node", "==", nodes[0].documentId).get();
  });

  afterAll(async () => {
    await deleteAllUsers();
    await Promise.all(collects.map(collect => collect.clean()));
  });

  it("Shouldn't be able to delete version of other user", async () => {
    expect(res._getStatusCode()).toEqual(200);
  });

  it("Should be deleted field true of nodes", async () => {
    expect(nodeDoc.data()?.deleted).toEqual(true);
  });

  it("Should be delete node from parent node", async () => {
    expect(Object.keys(node1Doc.data()?.parents).length).toEqual(0);
  });

  it("Should be delete node from children node", async () => {
    expect(Object.keys(node2Doc.data()?.children).length).toEqual(0);
  });

  it("Should be isTag=false in both nodes", async () => {
    expect(node1Doc.data()?.isTag).toBe(false);
    expect(node2Doc.data()?.isTag).toBe(false);
  });

  it("Should be remove tags from nodes", async () => {
    expect(Object.keys(node1Doc.data()?.tags).length).toEqual(0);
    expect(Object.keys(node2Doc.data()?.tags).length).toEqual(0);
  });

  it("Should be update wrong field in version collection", async () => {
    let wrongs = prevVersionDoc.docs[0].data()?.wrongs + 1;
    expect(wrongs).toEqual(1);
  });

  it("Should be deleted=true in processing node field ", async () => {
    expect(nodeDoc.data()?.deleted).toBe(true);
  });

  it("Should be set notification in notification collection", async () => {
    const notificationDoc = await db.collection("notifications").where("nodeId", "==", nodes[0].documentId).get();
    expect(notificationDoc.docs[0].data()?.aType).toEqual("Delete");
    expect(notificationDoc.docs[0].data()?.proposer).toEqual(nodes[0]?.admin);
  });

  it("should be check reputataion", async () => {
    const reputationPointCollections = ["reputations", "monthlyReputations", "weeklyReputations"];
    const otherReputationPointCollections = ["othersReputations", "othMonReputations", "othWeekReputations"];
    // negative values for reputation point collections
    let _reputationPointsPVEs: { [key: string]: number } = {};
    // negative values for reputation point collections
    let _reputationPointsNVEs: { [key: string]: number } = {};

    for (const pointCollect of [...reputationPointCollections, ...otherReputationPointCollections]) {
      const pointData: IComPoint = (
        await db.collection(pointCollect).where("tagId", "==", nodes[0].documentId).get()
      ).docs[0].data() as IComPoint;
      _reputationPointsPVEs[pointCollect] = positiveFields.reduce(
        (carry: number, positiveField: string) => carry + Number(pointData[positiveField as keyof IComPoint]),
        0
      );
      _reputationPointsNVEs[pointCollect] = negativeFields.reduce(
        (carry: number, negativeField: string) => carry + Number(pointData[negativeField as keyof IComPoint]),
        0
      );
    }
    for (const pointCollect of [...reputationPointCollections, ...otherReputationPointCollections]) {
      const pointData: IReputation = (
        await db
          .collection(pointCollect)
          .where("uname", "==", users[0].uname)
          .where("tagId", "==", nodes[0].documentId)
          .get()
      ).docs[0].data() as IReputation;
      const expectedPositive = positiveFields.reduce(
        (carry: number, positiveField: string) => carry + Number(pointData[positiveField as keyof IReputation]),
        0
      );
      const expectedNegative = negativeFields.reduce((carry: number, negativeField: string) => {
        return carry + Number(pointData[negativeField as keyof IReputation]);
      }, 0);

      expect(expectedPositive).toEqual(0);
      expect(expectedNegative).toBeGreaterThanOrEqual(0);
    }
  });

  it("should be check community points", async () => {
    const communityPointCollections = ["comPoints", "comMonthlyPoints", "comWeeklyPoints"];
    const otherCommunityPointCollections = ["comOthersPoints", "comOthMonPoints", "comOthWeekPoints"];

    // postive values for community point collections
    let _communityPointsPVEs: { [key: string]: number } = {};
    // negative values for community point collections
    let _communityPointsNVEs: { [key: string]: number } = {};

    for (const communityPointCollection of [...communityPointCollections, ...otherCommunityPointCollections]) {
      const pointData: IComPoint = (
        await db.collection(communityPointCollection).where("tagId", "==", nodes[0].documentId).get()
      ).docs[0].data() as IComPoint;
      _communityPointsPVEs[communityPointCollection] = positiveFields.reduce(
        (carry: number, positiveField: string) => carry + Number(pointData[positiveField as keyof IComPoint]),
        0
      );
      _communityPointsNVEs[communityPointCollection] = negativeFields.reduce(
        (carry: number, negativeField: string) => carry + Number(pointData[negativeField as keyof IComPoint]),
        0
      );
    }
    for (const communityPointCollection of otherCommunityPointCollections) {
      const pointData: IComPoint = (
        await db.collection(communityPointCollection).where("tagId", "==", nodes[0].documentId).get()
      ).docs[0].data() as IComPoint;
      const expectedPositive = positiveFields.reduce(
        (carry: number, positiveField: string) => carry + Number(pointData[positiveField as keyof IComPoint]),
        0
      );
      const expectedNegative = negativeFields.reduce(
        (carry: number, negativeField: string) => carry + Number(pointData[negativeField as keyof IComPoint]),
        0
      );
      expect(expectedPositive).toEqual(_communityPointsPVEs[communityPointCollection]);
      expect(expectedNegative).toBeGreaterThanOrEqual(_communityPointsNVEs[communityPointCollection]);
    }
  });
});
