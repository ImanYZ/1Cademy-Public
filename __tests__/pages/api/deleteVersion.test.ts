import { faker } from "@faker-js/faker";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import HttpMock, { MockResponse } from "node-mocks-http";
import { initFirebaseClientSDK } from "src/lib/firestoreClient/firestoreClient.config";
import { INode } from "src/types/INode";
import { IPendingPropNum } from "src/types/IPendingPropNum";
import { createCredit } from "testUtils/fakers/credit";
import { createPendingPropNum } from "testUtils/fakers/pending-prop-num";
import { createReputationPoints } from "testUtils/fakers/reputation-point";
initFirebaseClientSDK();
import { admin, db } from "../../../src/lib/firestoreServer/admin";
import deleteVersionHandler, { IDeleteVersionReqBody } from "../../../src/pages/api/deleteVersion";
import { INodeType } from "../../../src/types/INodeType";
import { createNode, createNodeVersion, getDefaultNode } from "../../../testUtils/fakers/node";
import { createUser, getDefaultUser } from "../../../testUtils/fakers/user";
import { createUserNode } from "../../../testUtils/fakers/userNode";
import deleteAllUsers from "../../../testUtils/helpers/deleteAllUsers";
import { MockData } from "../../../testUtils/mockCollections";

describe("POST /api/deleteVersion", () => {
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
    })
  );
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
      nodeType: "Concept",
    }),
    createNodeVersion({
      node: nodes[1],
      accepted: false,
      proposer: users[1],
      corrects: 0,
      tags: [nodes[0]],
      nodeType: "Concept",
    }),
  ];
  nodes[1].versions = 1;

  const credits = [
    createCredit({
      credits: 100,
      tag: nodes[0],
    }),
  ];

  const auth = admin.auth();
  const mockPassword = faker.internet.password(16);

  const usersCollection = new MockData(users, "users");
  const nodesCollection = new MockData(nodes, "nodes");
  const creditsCollection = new MockData(credits, "credits");
  const pendingPropNumsCollection = new MockData(pendingPropNums, "pendingPropsNums");
  const userNodesCollection = new MockData(userNodes, "userNodes");
  const nodeVersionsCollection = new MockData(nodeVersions, "versions");
  const reputationsCollection = new MockData(reputations, "reputations");

  const collects = [
    usersCollection,
    nodesCollection,
    creditsCollection,
    pendingPropNumsCollection,
    userNodesCollection,
    nodeVersionsCollection,
    reputationsCollection,
  ];

  let accessToken: string = "";
  let accessToken2: string = "";

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

    // 2nd Mock User
    const user2 = await auth.createUser({
      email: users[1].email,
      password: mockPassword,
      disabled: false,
      emailVerified: true,
    });
    const r2 = await signInWithEmailAndPassword(getAuth(), users[1].email, mockPassword);
    accessToken2 = await r2.user.getIdToken(false);
    users[1].userId = user2.uid;

    await Promise.all(collects.map(collect => collect.populate()));
  });

  afterEach(async () => {
    await deleteAllUsers();
    await Promise.all(collects.map(collect => collect.clean()));
  });

  it("Shouldn't be able to delete version of other user", async () => {
    const body = {
      data: {
        nodeId: nodes[1].documentId,
        nodeType: "Concept" as INodeType,
        versionId: nodeVersions[1].documentId,
      },
    } as IDeleteVersionReqBody;

    const req: any = HttpMock.createRequest({
      method: "POST",
      body,
      headers: {
        authorization: "Bearer " + accessToken,
      },
    });

    const res = HttpMock.createResponse();
    await deleteVersionHandler(req, res as any);

    expect(res._getStatusCode()).toEqual(200); // TODO: need to change this behaviour

    const versionDoc = await db.collection("versions").doc(String(nodeVersions[1].documentId)).get();
    expect(versionDoc.data()?.deleted).toEqual(false);
  });

  describe("Should be able to delete version that is proposed by current user", () => {
    let res: MockResponse<any>;
    beforeEach(async () => {
      const body = {
        data: {
          nodeId: nodes[1].documentId,
          nodeType: "Concept" as INodeType,
          versionId: nodeVersions[1].documentId,
        },
      } as IDeleteVersionReqBody;

      const req: any = HttpMock.createRequest({
        method: "POST",
        body,
        headers: {
          authorization: "Bearer " + accessToken2,
        },
      });

      res = HttpMock.createResponse();
      await deleteVersionHandler(req, res as any);
    });

    it("flag node version document as deleted", async () => {
      expect(res._getStatusCode()).toEqual(200);

      const versionDoc = await db.collection("versions").doc(String(nodeVersions[1].documentId)).get();
      expect(versionDoc.data()?.deleted).toEqual(true);
    });

    it("decrease node versions attribute by 1", async () => {
      const nodeDoc = await db.collection("nodes").doc(String(nodes[1].documentId)).get();
      const node1 = nodeDoc.data() as INode;
      expect(node1.versions).toEqual(0);
    });

    it("decrement notification num for pending proposals if user haven't voted yet and community of version equal user's", async () => {
      for (const user of users) {
        const pendingPropNumDocs = (
          await db
            .collection("pendingPropsNums")
            .where("uname", "==", user.uname)
            .where("tagId", "==", nodes[0].documentId)
            .get()
        ).docs;
        const pendingPropData = pendingPropNumDocs[0].data() as IPendingPropNum;
        expect(pendingPropData.pNum).toEqual(0);
      }
    });
  });
});
