import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { initFirebaseClientSDK } from "src/lib/firestoreClient/firestoreClient.config";

import { admin } from "@/lib/firestoreServer/admin";
initFirebaseClientSDK();

import { faker } from "@faker-js/faker";
import HttpMock from "node-mocks-http";
import { createCredit } from "testUtils/fakers/credit";
import { createReputationPoints } from "testUtils/fakers/reputation-point";
import { createUserNode } from "testUtils/fakers/userNode";
import { TypesenseMock } from "testUtils/typesenseMocks";
import NodeTSSchema from "testUtils/typesenseMocks/nodes.schema";

import searchNodesInNotebookHandler from "../../../src/pages/api/searchNodesInNotebook";
import { convertNodeToTypeSchema, createNode, getDefaultNode } from "../../../testUtils/fakers/node";
import { createUser, getDefaultUser } from "../../../testUtils/fakers/user";
import deleteAllUsers from "../../../testUtils/helpers/deleteAllUsers";
import { MockData } from "../../../testUtils/mockCollections";

describe("POST /api/searchNodesInNotebook", () => {
  let accessToken: string = "";

  const users = [getDefaultUser({})];
  const nodes = [
    getDefaultNode({
      admin: users[0],
    }),
  ];
  users.push(
    createUser({
      tag: nodes[0],
      sNode: nodes[0],
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
      isStudied: true,
      correct: true,
    }),
  ];

  const auth = admin.auth();
  const mockPassword = faker.internet.password(16);

  const usersCollection = new MockData(users, "users");
  const nodesCollection = new MockData(nodes, "nodes");

  const nodesTSCollection = new TypesenseMock(
    NodeTSSchema,
    nodes.map(node => convertNodeToTypeSchema(node)),
    "nodes"
  );
  const collects = [
    usersCollection,
    nodesCollection,
    nodesTSCollection,
    new MockData(userNodes, "userNodes"),
    new MockData(
      [
        createCredit({
          credits: 100,
          tag: nodes[0],
        }),
      ],
      "credits"
    ),
    new MockData(
      [
        createReputationPoints({
          tag: nodes[0],
          user: users[0],
        }),
      ],
      "reputations"
    ),
    new MockData([], "actionTracks"),
  ];

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
  });

  afterEach(async () => {
    await deleteAllUsers();
    await Promise.all(collects.map(collect => collect.clean()));
  });

  it("Should be able to search data from searchNodesInNotebook api with specific title", async () => {
    const req: any = HttpMock.createRequest({
      method: "POST",
      headers: {
        authorization: "Bearer " + accessToken,
      },
      body: { q: nodes[0].title },
    });
    const res: any = HttpMock.createResponse();
    await searchNodesInNotebookHandler(req, res);
    const { data, page } = JSON.parse(res._getData());
    expect(page).toEqual(1);
    data.map((result: any) => {
      expect(result.title.includes(nodes[0].title)).toBeTruthy();
      expect(result?.studied).toBeTruthy();
    });
  });
});
