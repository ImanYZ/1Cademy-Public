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
import proposeNodeImprovementHandler from "src/pages/api/proposeNodeImprovement";
import { INode } from "src/types/INode";
import { ITag } from "src/types/ITag";
import { createInstitution } from "testUtils/fakers/institution";
import { createNode, createNodeVersion, getDefaultNode } from "testUtils/fakers/node";
import { createUser, getDefaultUser } from "testUtils/fakers/user";
import { createUserNode } from "testUtils/fakers/userNode";
import deleteAllUsers from "testUtils/helpers/deleteAllUsers";
import { MockData } from "testUtils/mockCollections";

describe("POST /api/proposeNodeImprovement", () => {
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

  const node2 = createNode({
    admin: users[0],
    isTag: true,
    corrects: 1,
    parents: [nodes[0]],
  });

  nodes.push(node2);

  const node3 = createNode({
    admin: users[0],
    isTag: false,
    corrects: 1,
    parents: [],
    tags: [nodes[1]],
  });

  nodes.push(node3);

  const node4 = createNode({
    admin: users[0],
    isTag: true,
    corrects: 1,
    tags: [node3],
  });
  nodes.push(node4);

  const node5 = createNode({
    admin: users[0],
    isTag: true,
    corrects: 1,
    tags: [node4],
  });
  nodes.push(node5);

  const node6 = createNode({
    admin: users[0],
    isTag: false,
    corrects: 1,
    tags: [],
  });
  nodes.push(node6);

  /* node3.tags.push(node5.title);
  node3.tagIds.push(String(node5.documentId)); */

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

  const nodeVersions = [
    // first accepted proposal
    createNodeVersion({
      node: nodes[0],
      accepted: true,
      proposer: users[0],
      corrects: 1,
      tags: [],
      parents: [nodes[0]],
      children: [nodes[2]],
    }),
    createNodeVersion({
      node: nodes[2],
      accepted: false,
      proposer: users[0],
      corrects: 1,
      tags: [],
      parents: [nodes[0]],
      children: [nodes[1]],
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

  const tags = [
    {
      documentId: faker.datatype.uuid(),
      node: String(nodes[0].documentId),
      tagIds: [],
      tags: [],
      title: nodes[0].title,
      deleted: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as ITag,
  ];

  const usersCollection = new MockData(users, "users");
  const creditsCollection = new MockData(credits, "credits");
  const nodeVersionsCollection = new MockData(nodeVersions, "conceptVersions");
  const weeklyReputationPointsCollection = new MockData([], "weeklyReputations");
  const reputationsCollection = new MockData(reputations, "reputations");
  const notificationsCollection = new MockData([], "notifications");

  const collects = [
    usersCollection,
    creditsCollection,
    nodeVersionsCollection,
    reputationsCollection,
    weeklyReputationPointsCollection,
    notificationsCollection,
    new MockData(tags, "tags"),
    new MockData(institutions, "institutions"),

    new MockData([], "comPoints"),
    new MockData([], "comMonthlyPoints"),
    new MockData([], "comWeeklyPoints"),
    new MockData([], "comOthersPoints"),
    new MockData([], "comOthMonPoints"),
    new MockData([], "comOthWeekPoints"),

    new MockData([], "notificationNums"),
    new MockData([], "userConceptVersions"),
    new MockData([], "userVersionsLog"),

    new MockData([], "monthlyReputations"),

    new MockData([], "othMonReputations"),
    new MockData([], "othWeekReputations"),
    new MockData([], "othersReputations"),
    new MockData([], "actionTracks"),
  ];

  const nodesCollection = new MockData(nodes, "nodes");
  collects.push(nodesCollection);
  const userNodesCollection = new MockData(userNodes, "userNodes");
  collects.push(userNodesCollection);

  let accessToken: string = "";

  describe("api/proposeNodeImprovement - adding tags of tags", () => {
    let res: MockResponse<any>;

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
      const req: any = HttpMock.createRequest({
        method: "POST",
        headers: {
          authorization: "Bearer " + accessToken,
        },
        body: {
          data: {
            ...node6,
            title: "RANDOM TITLE",
            tagIds: [node5.documentId],
            tags: [node5.title],
            id: node6.documentId,
            addedParents: [],
            addedChildren: [],
            removedParents: [],
            removedChildren: [],
          },
        },
      });

      res = HttpMock.createResponse();
      await proposeNodeImprovementHandler(req, res as any);
    });

    afterAll(async () => {
      await deleteAllUsers();
      await Promise.all(collects.map(collect => collect.clean()));
    });

    it("status should be 200", async () => {
      expect(res._getStatusCode()).toEqual(200);
    });

    it("improved node should auto tag higher communities", async () => {
      const node = await db.collection("nodes").doc(String(node6.documentId)).get();
      const nodeData = node.data() as INode;

      const tagIds = nodeData.tagIds;
      for (const _node of [node5, node4, node3, node2]) {
        expect(tagIds.includes(String(_node.documentId))).toBeTruthy();
      }
    });
  });
});
