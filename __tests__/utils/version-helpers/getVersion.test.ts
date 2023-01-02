import { db } from "@/lib/firestoreServer/admin";

import { getVersion } from "../../../src/utils";
import { getTypedCollections } from "../../../src/utils/getTypedCollections";
import { conceptVersionsData, nodesData } from "../../../testUtils/mockCollections";

describe("getVersion", () => {
  let node = "GJfzAY1zbgQs9jU5XeEL";
  const collects = [nodesData, conceptVersionsData];
  beforeEach(async () => {
    await Promise.all(collects.map(collect => collect.populate()));
  });

  afterEach(async () => {
    await Promise.all(collects.map(collect => collect.clean()));
  });

  it("should return verision of sepecifc nodeType", async () => {
    let { versionsColl }: any = getTypedCollections({
      nodeType: "Concept",
    });
    const versionsDocs = await versionsColl.where("node", "==", node).get();
    const nodeDoc = await db.collection("nodes").doc(node).get();
    const nodeData = nodeDoc.data();
    for (let versionDoc of versionsDocs.docs) {
      let { versionData, versionRef } = await getVersion({
        versionId: versionDoc.id,
        nodeData: nodeData as any,
      });
      let _versionRef = versionRef as any;
      expect(_versionRef._path.segments).toEqual(expect.arrayContaining(["conceptVersions", versionDoc.id]));
      expect(versionData).toMatchObject({ id: versionDoc.id });
    }
  });
});
