import { faker } from "@faker-js/faker";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import HttpMock from "node-mocks-http";
import { initFirebaseClientSDK } from "src/lib/firestoreClient/firestoreClient.config";
import { INotebook } from "src/types/INotebook";
import { createReputationPoints } from "testUtils/fakers/reputation-point";
initFirebaseClientSDK();
import { admin, db } from "@/lib/firestoreServer/admin";
import viewNodeHandler, { IViewNodeOpenNodesPayload } from "@/pages/api/viewNode/openNodes";

import { createNode, createNodeVersion, getDefaultNode } from "../../../../testUtils/fakers/node";
import { createUser, getDefaultUser } from "../../../../testUtils/fakers/user";
import { createUserNode } from "../../../../testUtils/fakers/userNode";
import deleteAllUsers from "../../../../testUtils/helpers/deleteAllUsers";
import { MockData } from "../../../../testUtils/mockCollections";

describe("POST /api/notebooks/view", () => {
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
      node: nodes[0],
      correct: true,
    }),
    createUserNode({
      user: users[1],
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
        isPublic: "editable",
        owner: users[1].uname,
        ownerChooseUname: users[1].chooseUname,
        ownerFullName: `${users[1].fName} ${users[1].lName}`,
        ownerImgUrl: users[1].imageUrl,
        usersInfo: {
          [users[0].uname]: {
            chooseUname: users[0].chooseUname,
            fullname: `${users[0].fName} ${users[1].lName}`,
            imageUrl: users[0].imageUrl,
            role: "editor",
          },
        },
        title: "n1",
        users: [users[1].uname, users[0].uname],
        createdAt: new Date(),
        updatedAt: new Date(),
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
        visible: true,
        nodeIds: [nodes[0].documentId, nodes[1].documentId],
      } as IViewNodeOpenNodesPayload,
      headers: {
        authorization: "Bearer " + accessToken,
      },
    });

    res = HttpMock.createResponse();
    await viewNodeHandler(req, res as any);
  });

  afterEach(async () => {
    await deleteAllUsers();
    await Promise.all(collects.map(collect => collect.clean()));
  });

  it("Should be able to open node as editor", async () => {
    expect(res._getStatusCode()).toEqual(200);
  });

  it("Usernodes should be created for viewed notebook", async () => {
    const userNodes = await db.collection("userNodes").where("notebooks", "array-contains", "n1").get();
    expect(userNodes.docs.length).toEqual(4);
  });

  it("Editor usernode should exists", async () => {
    const userNodes = await db
      .collection("userNodes")
      .where("user", "==", users[0].uname)
      .where("notebooks", "array-contains", "n1")
      .get();
    expect(userNodes.docs.length).toEqual(2);
  });
});
