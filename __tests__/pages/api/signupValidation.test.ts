import HttpMock from "node-mocks-http";

import signupValidationHandler from "../../../src/pages/api/signupValidation";
import { createInstitution } from "../../../testUtils/fakers/institution";
import { createNode, getDefaultNode } from "../../../testUtils/fakers/node";
import { createUser, getDefaultUser } from "../../../testUtils/fakers/user";
import deleteAllUsers from "../../../testUtils/helpers/deleteAllUsers";
import { MockData } from "../../../testUtils/mockCollections";
describe("GET /api/signupValidation", () => {
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

  const institutions = [
    createInstitution({
      domain: "@umich.edu",
    }),
  ];
  const institutionsCollection = new MockData(institutions, "institutions");
  const usersCollection = new MockData(users, "users");
  const nodesCollection = new MockData(nodes, "nodes");

  const collects = [usersCollection, nodesCollection, institutionsCollection];

  beforeEach(async () => {
    await Promise.all(collects.map(collect => collect.populate()));
  });

  afterEach(async () => {
    await deleteAllUsers();
    await Promise.all(collects.map(collect => collect.clean()));
  });

  it("Should be able to check signupValidation against institution with detail", async () => {
    const req: any = HttpMock.createRequest({
      method: "GET",
    });
    req.query.email = "haroon@umich.edu";
    req.query.uname = "haroon";
    const res: any = HttpMock.createResponse();
    await signupValidationHandler(req, res);
    const result = JSON.parse(res._getData());
    expect(result.institutionName).toEqual(institutions[0].name);
  });
});
