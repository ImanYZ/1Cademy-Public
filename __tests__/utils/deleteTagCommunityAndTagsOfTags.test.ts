import { deleteTagCommunityAndTagsOfTags } from "../../src/utils/deleteTagCommunityAndTagsOfTags";
import { tagsData } from "../../testUtils/mockData";

describe("deleteTagCommunityAndTagsOfTags", () => {
  beforeEach(async () => {
    await tagsData.populate();
  });

  afterEach(async () => {
    await tagsData.clean();
  });

  it("should Delete all the tag Community and Tags of Tags ", async () => {
    // const batch =
    // await deleteTagCommunityAndTagsOfTags
  });
});
