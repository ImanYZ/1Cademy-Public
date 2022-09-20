import { db } from "../../src/lib/firestoreServer/admin";
import { convertToTGet } from "../../src/utils/convertToTGet";
import { nodesData } from "../../testUtils/mockCollections";

// purpose of this function is as follows:
// after reading code of this function and places its used
// i get to know that this function is a helper function to read query with or without transaction
describe("convertToTGet", () => {
  beforeEach(async () => {
    await Promise.all([nodesData].map(collect => collect.populate()));
  });

  afterEach(async () => {
    await Promise.all([nodesData].map(collect => collect.clean()));
  });

  it("Should be able to read data with transaction", async () => {
    await db.runTransaction(async t => {
      const mockNodesList = nodesData.getData();
      const query = db.collection("nodes").doc(mockNodesList[0].documentId);
      const node = await convertToTGet(query, t);
      expect(node.data).not.toBeUndefined();
    });
  });

  it("Should be able to read data without transaction", async () => {
    const mockNodesList = nodesData.getData();
    const query = db.collection("nodes").doc(mockNodesList[0].documentId);
    const node = await convertToTGet(query, null);
    expect(node.data).not.toBeUndefined();
  });
});
