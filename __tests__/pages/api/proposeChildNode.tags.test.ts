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
import proposeChildNodeHandler, { IProposeChildNodePayload } from "src/pages/api/proposeChildNode";
import { INodeLink } from "src/types/INodeLink";
import { INodeType } from "src/types/INodeType";
import { INodeVersion } from "src/types/INodeVersion";
import { IQuestionChoice } from "src/types/IQuestionChoice";
import { getTypedCollections } from "src/utils";
import { createInstitution } from "testUtils/fakers/institution";
import { createNode, createNodeVersion, getDefaultNode } from "testUtils/fakers/node";
import { createUser, getDefaultUser } from "testUtils/fakers/user";
import { createUserNode } from "testUtils/fakers/userNode";
import deleteAllUsers from "testUtils/helpers/deleteAllUsers";
import { MockData } from "testUtils/mockCollections";

describe("POST /api/proposeChildNode", () => {
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
    tags: [nodes[0]],
  });
  nodes.push(node2);

  const node3 = createNode({
    admin: users[0],
    isTag: false,
    corrects: 1,
    tags: [node2],
  });
  nodes.push(node3);

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
      isStudied: true, // for test edge case
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
  const notificationsCollection = new MockData([], "notifications");

  // TODO: need to check reputations, community points, tags, questionVersions, practice

  const collects = [
    usersCollection,
    creditsCollection,
    nodeVersionsCollection,
    reputationsCollection,
    notificationsCollection,
    new MockData(institutions, "institutions"),
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
    new MockData([], "questionVersions"),
    new MockData([], "userConceptVersions"),
    new MockData([], "userNodesLog"),
    new MockData([], "userQuestionVersions"),
    new MockData([], "userVersionsLog"),
    new MockData([], "tags"),
    new MockData([], "actionTracks"),
  ];

  const nodesCollection = new MockData(nodes, "nodes");
  collects.push(nodesCollection);
  const userNodesCollection = new MockData(userNodes, "userNodes");
  collects.push(userNodesCollection);

  let accessToken: string = "";

  describe("testing auto tagging for child node proposal", () => {
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
            parentId: String(node3.documentId),
            parentType: node3.nodeType,
            nodeType: "Question" as INodeType,
            children: [],
            title: "Question?",
            content: "Question Contents....",
            parents: [
              {
                node: String(node3.documentId),
                title: node3.title,
                label: "",
                nodeType: node3.nodeType,
              } as INodeLink,
            ],
            proposal: "reason of proposing this question",
            referenceIds: [],
            references: [],
            referenceLabels: [],
            summary: "summary of proposal",
            subType: null, // not implemented yet
            tagIds: [String(node3.documentId)],
            tags: [node3.title],
            choices: [
              {
                choice: "mock choice 1",
                correct: true,
                feedback: "You got it right!",
              } as IQuestionChoice,
            ], // only comes with NodeType=Question
          },
        } as IProposeChildNodePayload,
      });

      res = HttpMock.createResponse();
      await proposeChildNodeHandler(req, res as any);
    });

    afterAll(async () => {
      await deleteAllUsers();
      await Promise.all(collects.map(collect => collect.clean()));
    });

    it("proposal should auto tag higher communities", async () => {
      const { versionsColl } = getTypedCollections({
        nodeType: "Question",
      });
      const nodeVersionsResult = await db.collection(versionsColl.id).orderBy("createdAt", "desc").limit(1).get();
      const nodeVersion = nodeVersionsResult.docs[0].data() as INodeVersion;
      for (const node of nodes) {
        expect(nodeVersion.tagIds.includes(String(node.documentId))).toBeTruthy();
      }
    });
  });
});
