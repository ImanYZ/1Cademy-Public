import HttpMock from "node-mocks-http";

import statsHandler from "../../../src/pages/api/stats";
import { createStats } from "../../../testUtils/fakers/stats";
import { MockData } from "../../../testUtils/mockCollections";

describe("GET /api/stats", () => {
  const stats = [
    createStats({
      institutions: 121,
      links: 1000,
      nodes: 1100,
      proposals: 1200,
      users: 120,
    }),
  ];

  const statsCollection = new MockData(stats, "stats");
  const collects = [statsCollection];
  beforeEach(async () => {
    await Promise.all(collects.map(collect => collect.populate()));
  });

  afterEach(async () => {
    await Promise.all(collects.map(collect => collect.clean()));
  });

  it("Should be able to get stats with collection defined", async () => {
    let statsData = stats[0];
    const req: any = HttpMock.createRequest({
      method: "GET",
    });
    const res: any = HttpMock.createResponse();
    await statsHandler(req, res);
    const { institutions, users, proposals, nodes, links } = JSON.parse(res._getData());
    expect(institutions).toEqual(statsData.institutions.toLocaleString("en-US"));
    expect(users).toEqual(statsData.users.toLocaleString("en-US"));
    expect(proposals).toEqual(statsData.proposals.toLocaleString("en-US"));
    expect(nodes).toEqual(statsData.nodes.toLocaleString("en-US"));
    expect(links).toEqual(statsData.links.toLocaleString("en-US"));
  });
});
