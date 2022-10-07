import HttpMock from "node-mocks-http";

import getSelectedContributorsHandler from "../../../src/pages/api/getSelectedContributors";
import { createNode, getDefaultNode } from "../../../testUtils/fakers/node";
import { createUser, getDefaultUser } from "../../../testUtils/fakers/user";
import { MockData } from "../../../testUtils/mockCollections";
describe("GET /api/getSelectedContributors", () => {
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
  const usersCollection = new MockData(users, "users");
  const nodesCollection = new MockData(nodes, "nodes");
  const collects = [usersCollection, nodesCollection];

  beforeEach(async () => {
    await Promise.all(collects.map(collect => collect.populate()));
  });

  afterEach(async () => {
    await Promise.all(collects.map(collect => collect.clean()));
  });

  it("Should be able to get data getSelectedContributors with user ids", async () => {
    const req: any = HttpMock.createRequest({
      method: "GET",
    });
    let id = users[0].documentId;
    req.query.users = [id];
    const res: any = HttpMock.createResponse();
    await getSelectedContributorsHandler(req, res);
    const results = JSON.parse(res._getData());
    expect(results[0]).toMatchObject({
      id: users[0].documentId,
      imageUrl: users[0].imageUrl,
      name: `${users[0]?.fName} ${users[0]?.lName}`,
    });
  });
});
