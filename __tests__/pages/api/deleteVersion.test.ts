import { faker } from "@faker-js/faker";
import { getAuth } from "firebase-admin/auth";
import HttpMock from "node-mocks-http";

import { app } from "../../../src/lib/firestoreServer/admin";
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
    }),
    createNodeVersion({
      node: nodes[0],
      accepted: true,
      proposer: users[1],
      corrects: 1,
    }),
  ];
  nodes[1].versions = nodeVersions.length;
  const auth = getAuth(app);
  const mockPassword = faker.internet.password(16);

  const usersCollection = new MockData(users, "users");
  const nodesCollection = new MockData(nodes, "nodes");
  const userNodesCollection = new MockData(userNodes, "userNodes");
  const nodeVersionsCollection = new MockData(nodeVersions, "conceptVersions");

  const collects = [usersCollection, nodesCollection, userNodesCollection, nodeVersionsCollection];

  let accessToken: string = "";

  beforeEach(async () => {
    await Promise.all(collects.map(collect => collect.populate()));
    const user = await auth.createUser({
      email: users[0].email,
      password: mockPassword,
      disabled: false,
    });
    accessToken = await auth.createCustomToken(user.uid);
  });

  afterEach(async () => {
    await deleteAllUsers();
    await Promise.all(collects.map(collect => collect.clean()));
  });

  it("Should be able to delete version", async () => {
    const body = {
      data: {
        nodeId: nodes[0].documentId,
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

    const res: any = HttpMock.createResponse();
    await deleteVersionHandler(req, res);
  });
});
