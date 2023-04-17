import { faker } from "@faker-js/faker";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import HttpMock from "node-mocks-http";
import { initFirebaseClientSDK } from "src/lib/firestoreClient/firestoreClient.config";
import { INotebook } from "src/types/INotebook";
import { createReputationPoints } from "testUtils/fakers/reputation-point";
initFirebaseClientSDK();
import { admin, db } from "@/lib/firestoreServer/admin";
import assignNotebookHandler from "@/pages/api/notebooks/assign";
import { INotebookAssignPayload } from "@/pages/api/notebooks/assign";

import { createNode, createNodeVersion, getDefaultNode } from "../../../../testUtils/fakers/node";
import { createUser, getDefaultUser } from "../../../../testUtils/fakers/user";
import { createUserNode } from "../../../../testUtils/fakers/userNode";
import deleteAllUsers from "../../../../testUtils/helpers/deleteAllUsers";
import { MockData } from "../../../../testUtils/mockCollections";

describe("POST /api/notebooks/assign", () => {
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

  nodes.push(
    createNode({
      admin: users[0],
      tags: [nodes[0]],
      corrects: 1,
    })
  );

  const userNodes = [
    createUserNode({
      user: users[0],
      node: nodes[0],
      correct: true,
    }),
    createUserNode({
      user: users[1],
      node: nodes[1],
      correct: false,
    }),
  ];

  userNodes[0].notebooks = ["n1"];
  userNodes[0].expands = [true];

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

  const auth = admin.auth();
  const mockPassword = faker.internet.password(16);

  const usersCollection = new MockData(users, "users");
  const nodesCollection = new MockData(nodes, "nodes");
  const creditsCollection = new MockData([], "credits");
  const pendingPropNumsCollection = new MockData([], "pendingPropsNums");
  const userNodesCollection = new MockData(userNodes, "userNodes");
  const nodeVersionsCollection = new MockData(nodeVersions, "conceptVersions");
  const reputationsCollection = new MockData(reputations, "reputations");
  const notebooks = new MockData(
    [
      {
        documentId: "n1",
        isPublic: "none",
        owner: users[0].uname,
        ownerChooseUname: users[0].chooseUname,
        ownerFullName: `${users[0].fName} ${users[0].lName}`,
        ownerImgUrl: users[0].imageUrl,
        usersInfo: {},
        title: "n1",
        users: [],
      } as INotebook,
    ],
    "notebooks"
  );

  const collects = [
    usersCollection,
    nodesCollection,
    creditsCollection,
    pendingPropNumsCollection,
    userNodesCollection,
    nodeVersionsCollection,
    reputationsCollection,
    notebooks,
  ];

  let accessToken: string = "";
  let req: any = {};
  let res: any = {};
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

    req = HttpMock.createRequest({
      method: "POST",
      body: {
        notebookId: "n1",
        role: "editor",
        user: users[1].uname,
      } as INotebookAssignPayload,
      headers: {
        authorization: "Bearer " + accessToken,
      },
    });

    res = HttpMock.createResponse();
    await assignNotebookHandler(req, res as any);
  });

  afterEach(async () => {
    await deleteAllUsers();
    await Promise.all(collects.map(collect => collect.clean()));
  });

  it("Should be able to delete notebook as owner", async () => {
    expect(res._getStatusCode()).toEqual(200);
  });

  it("Usernodes should be created for assigned notebook", async () => {
    const userNodes = await db
      .collection("userNodes")
      .where("user", "==", users[1].uname)
      .where("notebooks", "array-contains", "n1")
      .get();
    expect(userNodes.docs.length).toEqual(1);
  });

  it("Notebook should have correct role", async () => {
    const notebook = await db.collection("notebooks").doc("n1").get();
    const notebookData = notebook.data() as INotebook;
    expect(notebookData.usersInfo[users[1].uname]?.role).toEqual("editor");
  });
});
