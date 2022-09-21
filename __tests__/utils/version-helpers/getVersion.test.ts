import { getVersion } from "../../../src/utils";
import { getTypedCollections } from "../../../src/utils/getTypedCollections";
import { conceptVersionsData } from "../../../testUtils/mockCollections";

describe("getVersion", () => {
  let node = "OR8UsmsxmeExHG8ekkIY";
  beforeEach(async () => {
    await conceptVersionsData.populate();
  });

  afterEach(async () => {
    await conceptVersionsData.clean();
  });

  it("should return verision of sepecifc nodeType", async () => {
    let { versionsColl }: any = getTypedCollections({
      nodeType: "Concept",
    });
    const versionsDocs = await versionsColl.where("node", "==", node).get();
    for (let versionDoc of versionsDocs.docs) {
      let { versionData, versionRef } = await getVersion({
        versionId: versionDoc.id,
        nodeType: "Concept",
      });
      expect(versionRef._path.segments).toEqual(expect.arrayContaining(["conceptVersions", versionDoc.id]));
      expect(versionData).toMatchObject({ id: versionDoc.id });
    }
  });
});
