import { faker } from "@faker-js/faker";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import HttpMock from "node-mocks-http";
import { initFirebaseClientSDK } from "src/lib/firestoreClient/firestoreClient.config";
initFirebaseClientSDK();
import { admin, db } from "../../../src/lib/firestoreServer/admin";
import addProposalHandler from "../../../src/pages/api/addProposal";
import { createNode, getDefaultNode } from "../../../testUtils/fakers/node";
import { createUser, getDefaultUser } from "../../../testUtils/fakers/user";
import deleteAllUsers from "../../../testUtils/helpers/deleteAllUsers";
import { MockData } from "../../../testUtils/mockCollections";

describe("POST /api/addProposal", () => {
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

  nodes.push(
    createNode({
      admin: users[0],
      tags: [nodes[0]],
      corrects: 1,
    })
  );

  const auth = admin.auth();
  const mockPassword = faker.internet.password(16);
  const usersCollection = new MockData(users, "users");
  const nodesCollection = new MockData(nodes, "nodes");

  const collects = [usersCollection, nodesCollection, new MockData([], "conceptVersions")];

  let accessToken: string = "";
  let req: any = {};
  let res: any = {};
  let versionData: any = {};
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
      body: { data: { ...nodes[0], node: nodes[0].documentId }, nodeType: nodes[0].nodeType },
      headers: {
        authorization: "Bearer " + accessToken,
      },
    });

    res = HttpMock.createResponse();
    await addProposalHandler(req, res as any);
    let versionDoc = await db.collection("conceptVersions").where("node", "==", nodes[0].documentId).get();
    versionData = versionDoc.docs[0].data();
  });

  afterEach(async () => {
    await deleteAllUsers();
    await Promise.all(collects.map(collect => collect.clean()));
  });

  it("Should be addProposal api status code 200 ", async () => {
    expect(res._getStatusCode()).toEqual(200);
  });

  it("Should be able to check add proposal from collection", async () => {
    expect(versionData).toMatchObject({ node: nodes[0].documentId });
  });
});
