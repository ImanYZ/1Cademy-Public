import { db } from "../../src/lib/firestoreServer/admin";
import { getNode } from "../../src/utils";
import dropCollection from "../../testUtils/helpers/dropCollection";

const mockData = {
  title: "Testing Node",
};

describe("getNode", () => {
  let nodeId = "";
  beforeEach(async () => {
    const nodeDoc = db.collection("nodes").doc();
    await nodeDoc.set(mockData);
    nodeId = nodeDoc.id;
  });

  it("Should return nodeRef and nodeData of a given Id.", async () => {
    const result = await getNode({ nodeId });

    expect(result).toHaveProperty("nodeData");
    expect(result).toHaveProperty("nodeRef");

    expect(result.nodeRef.id as string).toEqual(nodeId);
    expect(result.nodeData).toMatchObject(mockData);
  });

  it("Should use the transactional get if the transaction object has passed", async () => {
    // mocking the transaction get object
    const t = {
      get: jest.fn(async x => await x.get()),
    };

    await getNode({ nodeId, t });
    expect(t.get).toHaveBeenCalled();
  });

  // after each test suite
  afterEach(async () => {
    await dropCollection("nodes");
  });
});
