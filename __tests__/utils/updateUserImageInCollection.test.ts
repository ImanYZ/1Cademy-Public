import { db } from "../../src/lib/firestoreServer/admin";
import { getQueryCollections } from "../../src/utils";
import { updateUserImageInCollection } from "../../src/utils/updateUserImageInCollection";
import {
  nodesData,
  userNodesData,
  userVersionCommentsData,
  userVersionsData,
  versionCommentsData,
  versionsData,
} from "../../testUtils/mockCollections";

describe("updateUserImageEverywhere", () => {
  const username = "A_wei";

  const collects = [
    nodesData,
    userNodesData,
    userVersionCommentsData,
    userVersionsData,
    versionCommentsData,
    versionsData,
  ];

  beforeEach(async () => {
    await Promise.all(collects.map(collect => collect.populate()));
  });

  afterEach(async () => {
    await Promise.all(collects.map(collect => collect.clean()));
  });

  it("Should be able to update user profile image everywhere", async () => {
    const newImageUrl = "https://lh3.googleusercontent.com/ogw/AOh-ky2UJPA2Md8swcNMKdxNTwtmO0iXtjDRFosHZJqqVw=s32-c-mo";

    const { versionsColl, versionsCommentsColl } = getQueryCollections();
    let writeCounts = 0;

    let batch = db.batch();
    [batch, writeCounts] = await updateUserImageInCollection({
      batch,
      collQuery: versionsColl,
      collectionName: versionsColl.id,
      userAttribute: "proposer",
      forAdmin: false,
      uname: username,
      imageUrl: newImageUrl,
      fullname: "Alvin Wei",
      chooseUname: true,
      currentTimestamp: new Date(),
      writeCounts,
    });

    [batch, writeCounts] = await updateUserImageInCollection({
      batch,
      collQuery: versionsCommentsColl,
      collectionName: versionsCommentsColl.id,
      userAttribute: "author",
      forAdmin: false,
      uname: username,
      imageUrl: newImageUrl,
      fullname: "Alvin Wei",
      chooseUname: true,
      currentTimestamp: new Date(),
      writeCounts,
    });
    await batch.commit();

    expect(
      (
        await db
          .collection(versionsColl.id)
          .where("proposer", "==", username)
          .where("imageUrl", "==", newImageUrl)
          .get()
      ).docs.length
    ).toBeGreaterThan(0);
    expect(
      (
        await db
          .collection(versionsCommentsColl.id)
          .where("author", "==", username)
          .where("imageUrl", "==", newImageUrl)
          .get()
      ).docs.length
    ).toBeGreaterThan(0);
  });
});
