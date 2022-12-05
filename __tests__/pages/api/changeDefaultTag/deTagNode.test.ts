import { faker } from "@faker-js/faker";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import HttpMock from "node-mocks-http";
import { initFirebaseClientSDK } from "src/lib/firestoreClient/firestoreClient.config";
import { createCredit } from "testUtils/fakers/credit";
import { createReputationPoints } from "testUtils/fakers/reputation-point";
initFirebaseClientSDK();

import { admin, db } from "src/lib/firestoreServer/admin";
import changeDefaultTagHandler from "src/pages/api/changeDefaultTag/[deTagNode]";
import { IUser } from "src/types/IUser";
import { reputationTypes } from "src/utils";
import { createNode, createNodeVersion, getDefaultNode } from "testUtils/fakers/node";
import { createUser, getDefaultUser } from "testUtils/fakers/user";
import { createUserNode } from "testUtils/fakers/userNode";
import deleteAllUsers from "testUtils/helpers/deleteAllUsers";
import { MockData } from "testUtils/mockCollections";

describe("POST /api/changeDefaultTag/:deTagNode", () => {
  const users = [getDefaultUser({})];
  const nodes = [
    getDefaultNode({
      admin: users[0],
    }),
  ];

  users.push(
    createUser({
      sNode: nodes[0],
      tag: nodes[0],
    })
  );

  nodes.push(
    createNode({
      admin: users[0],
      isTag: true,
      corrects: 1,
      tags: [nodes[0]],
    })
  );

  // setting default community to default user
  users[0].tag = nodes[0].title;
  users[0].tagId = String(nodes[0].documentId);

  const userNodes = [
    createUserNode({
      node: nodes[0],
      correct: true,
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
  ];

  const credits = [
    createCredit({
      credits: 100,
      tag: nodes[0],
    }),
  ];

  const auth = admin.auth();
  const mockPassword = faker.internet.password(16);

  // adding reputation to default user, its required for auth middleware
  const reputations = [
    createReputationPoints({
      tag: nodes[0],
      user: users[0],
    }),
  ];

  const usersCollection = new MockData(users, "users");
  const creditsCollection = new MockData(credits, "credits");
  const nodeVersionsCollection = new MockData(nodeVersions, "conceptVersions");

  const reputationsCollection = new MockData(reputations, "reputations");

  const collects = [
    usersCollection,
    creditsCollection,
    nodeVersionsCollection,
    reputationsCollection,
    new MockData([], "monthlyReputations"),
    new MockData([], "othMonReputations"),
    new MockData([], "othWeekReputations"),
    new MockData([], "othersReputations"),
    new MockData([], "weeklyReputations"),
  ];

  const nodesCollection = new MockData(nodes, "nodes");
  collects.push(nodesCollection);
  const userNodesCollection = new MockData(userNodes, "userNodes");
  collects.push(userNodesCollection);

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
  });

  afterAll(async () => {
    await deleteAllUsers();
    await Promise.all(collects.map(collect => collect.clean()));
  });

  it("ignore if tag id is equal user.tagId and respond with 200", async () => {
    const req: any = HttpMock.createRequest({
      method: "GET",
      headers: {
        authorization: "Bearer " + accessToken,
      },
      query: {
        deTagNode: nodes[0].documentId,
      },
    });

    const res = HttpMock.createResponse();
    await changeDefaultTagHandler(req, res as any);

    expect(res._getStatusCode()).toEqual(200);
  });

  describe("if tag id is valid and user is logged in", () => {
    beforeAll(async () => {
      const req: any = HttpMock.createRequest({
        method: "GET",
        headers: {
          authorization: "Bearer " + accessToken,
        },
        query: {
          deTagNode: nodes[1].documentId,
        },
      });

      const res = HttpMock.createResponse();
      await changeDefaultTagHandler(req, res as any);

      expect(res._getStatusCode()).toEqual(200);
    });

    it("check if reputation documents exists for that user in that new tag or not\n- if not create reputation docs for each type", async () => {
      for (const reputationType of reputationTypes) {
        const queryResult = await db
          .collection(reputationType)
          .where("uname", "==", users[0].uname)
          .where("tagId", "==", nodes[1].documentId)
          .get();
        expect(queryResult.docs.length).toBeGreaterThan(0);
      }
    });

    it("check if selected tag has credit doc in credits collection or not\n- if not create credit doc", async () => {
      const queryResult = await db.collection("credits").where("tagId", "==", nodes[1].documentId).get();
      expect(queryResult.docs.length).toBeGreaterThan(0);
    });

    it("update user doc in users collection and set selected tag Id and title", async () => {
      const userDoc = await db.collection("users").doc(users[0].uname).get();
      const userDocData = userDoc.data() as IUser;
      expect(userDocData.tagId).toEqual(nodes[1].documentId);
    });
  });
});
