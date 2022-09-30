import { getTagRefData } from "../../../src/utils";
import { tagsData } from "../../../testUtils/mockCollections";

describe("getTagRefData", () => {
  beforeEach(async () => {
    await tagsData.populate();
  });

  afterEach(async () => {
    await tagsData.clean();
  });

  it("should return reference tag and data", async () => {
    const { tagRef, tagData } = await getTagRefData("OR8UsmsxmeExHG8ekkIY");
    expect(tagData).toBeDefined();
    expect(tagRef.parent.id).toEqual("tags");
  });
});
