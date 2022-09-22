import { db } from "../../src/lib/firestoreServer/admin";
import { updateUserImageEverywhere } from "../../src/utils/updateUserImageEverywhere";
import {
  comMonthlyPointsData,
  comOthersPointsData,
  comOthMonPointsData,
  comOthWeekPointsData,
  comPointsData,
  comWeeklyPointsData,
  messagesData,
  nodesData,
  userNodesData,
} from "../../testUtils/mockCollections";

describe("updateUserImageEverywhere", () => {
  const username = "A_wei";
  beforeEach(async () => {
    await Promise.all(
      [
        nodesData,
        userNodesData,
        comPointsData,
        comMonthlyPointsData,
        comWeeklyPointsData,
        comOthersPointsData,
        comOthMonPointsData,
        comOthWeekPointsData,
        messagesData,
      ].map(collect => collect.populate())
    );
  });

  afterEach(async () => {
    await Promise.all(
      [
        nodesData,
        userNodesData,
        comPointsData,
        comMonthlyPointsData,
        comWeeklyPointsData,
        comOthersPointsData,
        comOthMonPointsData,
        comOthWeekPointsData,
        messagesData,
      ].map(collect => collect.clean())
    );
  });

  it("Should be able to update user profile image everywhere", async () => {
    let batch = db.batch();
    const newImageUrl = "https://lh3.googleusercontent.com/ogw/AOh-ky2UJPA2Md8swcNMKdxNTwtmO0iXtjDRFosHZJqqVw=s32-c-mo";
    let writeCounts = 0;

    await updateUserImageEverywhere({
      batch,
      uname: username,
      imageUrl: newImageUrl,
      fullname: "Alvin Wei",
      chooseUname: true,
      currentTimestamp: new Date(),
      writeCounts,
    });
    await batch.commit();

    const collectionNames = [
      comPointsData,
      comMonthlyPointsData,
      comWeeklyPointsData,
      comOthersPointsData,
      comOthMonPointsData,
      comOthWeekPointsData,
      messagesData,
    ].map(mock => mock.getCollection());

    for (const collectionName of collectionNames) {
      if (collectionName === "messages") {
        expect(
          (
            await db
              .collection(collectionName)
              .where("username", "==", username)
              .where("imageUrl", "==", newImageUrl)
              .get()
          ).docs.length
        ).toBeGreaterThan(0);
        continue;
      }
      expect(
        (await db.collection(collectionName).where("admin", "==", username).where("aImgUrl", "==", newImageUrl).get())
          .docs.length
      ).toBeGreaterThan(0);
    }
  });
});
