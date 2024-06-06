import { getTypedCollections } from "../../src/utils/getTypedCollections";
import {
  userVersionCommentsData,
  userVersionsData,
  versionCommentsData,
  versionsData,
} from "../../testUtils/mockCollections";

describe("getTypedCollections", () => {
  beforeEach(async () => {
    await versionsData.populate();
    await userVersionsData.populate();
    await userVersionCommentsData.populate();
    await versionCommentsData.populate();
  });

  afterEach(async () => {
    await versionsData.clean();
    await userVersionsData.clean();
    await userVersionCommentsData.clean();
    await versionCommentsData.clean();
  });

  it("Should point to the correct firebase reference", async () => {
    let { versionsColl, userVersionsColl, versionsCommentsColl, userVersionsCommentsColl }: any = getTypedCollections();
    expect(versionsColl._queryOptions).toMatchObject({ collectionId: "versions" });
    expect(userVersionsColl._queryOptions).toMatchObject({ collectionId: "userVersions" });
    expect(versionsCommentsColl._queryOptions).toMatchObject({ collectionId: "versionComments" });
    expect(userVersionsCommentsColl._queryOptions).toMatchObject({ collectionId: "userVersionComments" });
  });
});
