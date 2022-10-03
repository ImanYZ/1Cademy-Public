import { getUserVersion } from "../../../src/utils";
//import { getTypedCollections } from "../../../src/utils/getTypedCollections";
import { userConceptVersionsData } from "../../../testUtils/mockCollections";

describe("getUserVersion", () => {
  //let node = "OR8UsmsxmeExHG8ekkIY";
  beforeEach(async () => {
    await userConceptVersionsData.populate();
  });

  afterEach(async () => {
    await userConceptVersionsData.clean();
  });

  it("should return getUserVersion of sepecifc nodeType", async () => {
    // let { userVersionsColl }: any = getTypedCollections({
    //   nodeType: "Concept",
    // });

    let { userVersionData, userVersionRef } = await getUserVersion({
      versionId: "bkZvkniwziO1Ue7K9gtX",
      nodeType: "Concept",
      uname: "A_wei",
    });
    expect(userVersionRef.parent.id).toEqual("userConceptVersions");
    expect(userVersionData).toMatchObject({ user: "A_wei" });
  });
});
