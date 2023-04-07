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
import HttpMock, { MockResponse } from "node-mocks-http";
import { initFirebaseClientSDK } from "src/lib/firestoreClient/firestoreClient.config";
import { createCredit } from "testUtils/fakers/credit";
import { createReputationPoints } from "testUtils/fakers/reputation-point";
initFirebaseClientSDK();

import { admin, db } from "src/lib/firestoreServer/admin";
import rateVersionHandler, { IRateVersionPayload } from "src/pages/api/rateVersion";
import { createInstitution } from "testUtils/fakers/institution";
import { createNode, createNodeVersion, getDefaultNode } from "testUtils/fakers/node";
import { createUser, getDefaultUser } from "testUtils/fakers/user";
import { createUserNode } from "testUtils/fakers/userNode";
import deleteAllUsers from "testUtils/helpers/deleteAllUsers";
import { MockData } from "testUtils/mockCollections";

describe("POST /api/rateVersion", () => {
  describe("if version just got accepted", () => {
    let res: MockResponse<any>;

    let notebookId = "n1";

    const institutions = [
      createInstitution({
        domain: "@1cademy.com",
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

    users.push(
      createUser({
        sNode: nodes[0],
        tag: nodes[0],
        institutionName: institutions[0].name,
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
        user: users[0],
        node: nodes[0],
        correct: true,
      }),
      createUserNode({
        user: users[1],
        node: nodes[0],
        correct: false,
        wrong: false,
      }),
    ];

    for (const userNode of userNodes) {
      userNode.notebooks = [notebookId];
      userNode.expands = [true];
    }

    const nodeVersions = [
      createNodeVersion({
        node: nodes[0],
        accepted: true,
        proposer: users[0],
        corrects: 1,
      }),
      createNodeVersion({
        node: nodes[0],
        accepted: false,
        proposer: users[1],
        corrects: 3,
        childType: "Question",
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
        user: users[1],
      }),
    ];

    const usersCollection = new MockData(users, "users");
    const creditsCollection = new MockData(credits, "credits");
    const nodeVersionsCollection = new MockData(nodeVersions, "conceptVersions");

    const reputationsCollection = new MockData(reputations, "reputations");
    const notificationsCollection = new MockData([], "notifications");

    const collects = [
      usersCollection,
      creditsCollection,
      nodeVersionsCollection,
      reputationsCollection,
      notificationsCollection,
      new MockData([], "monthlyReputations"),
      new MockData([], "weeklyReputations"),
      new MockData([], "othersReputations"),
      new MockData([], "othMonReputations"),
      new MockData([], "othWeekReputations"),

      new MockData([], "comPoints"),
      new MockData([], "comMonthlyPoints"),
      new MockData([], "comWeeklyPoints"),
      new MockData([], "comOthersPoints"),
      new MockData([], "comOthMonPoints"),
      new MockData([], "comOthWeekPoints"),

      new MockData([], "notificationNums"),
      new MockData([], "practice"),
      new MockData([], "userConceptVersions"),
      new MockData([], "userNodesLog"),
      new MockData([], "userVersionsLog"),
      new MockData([], "tags"),
      new MockData(institutions, "institutions"),

      new MockData(
        [
          {
            documentId: users[0].documentId,
            state: "online",
            last_online: new Date(),
          },
          {
            documentId: users[1].documentId,
            state: "online",
            last_online: new Date(),
          },
        ],
        "status"
      ),
      new MockData([], "actionTracks"),
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
      users[0].userId = user.uid;

      const user2 = await auth.createUser({
        email: users[1].email,
        password: mockPassword,
        disabled: false,
        emailVerified: true,
      });
      const r = await signInWithEmailAndPassword(getAuth(), users[1].email, mockPassword);
      accessToken = await r.user.getIdToken(false);
      users[1].userId = user2.uid;

      await Promise.all(collects.map(collect => collect.populate()));
    });

    afterAll(async () => {
      await deleteAllUsers();
      await Promise.all(collects.map(collect => collect.clean()));
    });

    it("user nodes should get created for newely created node", async () => {
      const req: any = HttpMock.createRequest({
        method: "POST",
        headers: {
          authorization: "Bearer " + accessToken,
        },
        body: {
          nodeId: String(nodes[0].documentId),
          versionId: String(nodeVersions[1].documentId),
          nodeType: nodes[0].nodeType,
          award: false,
          correct: true,
          wrong: false,
          notebookId,
        } as IRateVersionPayload,
      });
      res = HttpMock.createResponse();

      await rateVersionHandler(req, res as any);

      const _nodes = await db.collection("nodes").where("nodeType", "==", "Question").get();
      const newNode = _nodes.docs[0];

      const userNodes = await db
        .collection("userNodes")
        .where("node", "==", newNode.id)
        .where("notebooks", "array-contains", notebookId)
        .get();
      expect(userNodes.docs.length).toEqual(2);
    });
  });
});
