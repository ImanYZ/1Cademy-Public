import HttpMock from "node-mocks-http";
import { TypesenseMock } from "testUtils/typesenseMocks";
import ProcessedReferencesTSSchema from "testUtils/typesenseMocks/processedReferences.schema";

import referencesAutocompleteHandler from "../../../src/pages/api/referencesAutocomplete";
import { createNode, getDefaultNode } from "../../../testUtils/fakers/node";
import {
  convertIProcessedReferenceToTypeSchema,
  createProcessedReference,
} from "../../../testUtils/fakers/processedReferences";
import { createUser, getDefaultUser } from "../../../testUtils/fakers/user";
import deleteAllUsers from "../../../testUtils/helpers/deleteAllUsers";
import { MockData } from "../../../testUtils/mockCollections";

describe("GET /api/referencesAutocomplete", () => {
  const users = [getDefaultUser({}), createUser({})];
  const processedReferences = [
    createProcessedReference({
      data: [
        {
          label: "1man",
          node: " 1Cademy",
        },
      ],
    }),
  ];

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
  const institutionsTSCollection = new TypesenseMock(
    ProcessedReferencesTSSchema,
    processedReferences.map(reference => convertIProcessedReferenceToTypeSchema(reference)),
    "processedReferences"
  );
  const collects = [usersCollection, nodesCollection, institutionsTSCollection];
  beforeEach(async () => {
    await Promise.all(collects.map(collect => collect.clean()));
    await Promise.all(collects.map(collect => collect.populate()));
  });

  afterEach(async () => {
    await deleteAllUsers();
    await Promise.all(collects.map(collect => collect.clean()));
  });

  it("Should be able to search data from referencesAutocomplete api with specific title", async () => {
    let title = nodes[0].title;
    const req: any = HttpMock.createRequest({
      method: "GET",
    });
    req.query["q"] = title;
    const res: any = HttpMock.createResponse();
    await referencesAutocompleteHandler(req, res);
    const { results } = JSON.parse(res._getData());
    results.map((result: any) => {
      expect(true).toBe(result.title.includes(title));
    });
  });
});
