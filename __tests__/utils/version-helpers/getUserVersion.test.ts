import { getUserVersion } from "../../../src/utils";
//import { getTypedCollections } from "../../../src/utils/getTypedCollections";
import { userVersionsData } from "../../../testUtils/mockCollections";

describe("getUserVersion", () => {
  //let node = "OR8UsmsxmeExHG8ekkIY";
  beforeEach(async () => {
    await userVersionsData.populate();
  });

  afterEach(async () => {
    await userVersionsData.clean();
  });

  it("should return getUserVersion of sepecifc nodeType", async () => {
    // let { userVersionsColl }: any = getTypedCollections();

    let { userVersionData, userVersionRef } = await getUserVersion({
      versionId: "bkZvkniwziO1Ue7K9gtX",
      uname: "A_wei",
      t: null,
    });
    expect(userVersionRef.parent.id).toEqual("userVersions");
    expect(userVersionData).toMatchObject({ user: "A_wei" });
  });
});
