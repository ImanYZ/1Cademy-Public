import { admin,commitBatch, db } from "../../../src/lib/firestoreServer/admin";
import { addTagCommunityAndTagsOfTags, getTypedCollections } from "../../../src/utils";
import { conceptVersionsData,nodesData, tagsData, usersData } from "../../../testUtils/mockCollections";

describe("addTagCommunityAndTagsOfTags", () => {
  let node = "OR8UsmsxmeExHG8ekkIY";
  beforeEach(async () => {
    await usersData.populate();
    await nodesData.populate();
    await tagsData.populate();
    await conceptVersionsData.populate();
  });

  afterEach(async () => {
    await usersData.clean();
    await nodesData.clean();
    await tagsData.clean();
    await conceptVersionsData.clean();
  });

  it("should perform addTagCommunityAndTagsOfTags action on tags collection", async () => {
    const currentTimestamp = admin.firestore.Timestamp.fromDate(new Date());
    let nodeDoc: any = await db.collection("nodes").doc("FJfzAX7zbgQS8jU5XcEk").get();
    const { versionsColl }: any = getTypedCollections({ nodeType: "Concept" });
    const versionsDocs = await versionsColl.where("node", "==", node).get();
    const proposer = versionsDocs.docs[0].data().proposer;
    let batch = db.batch();
    let writeCounts = 0;
    [batch, writeCounts] = await addTagCommunityAndTagsOfTags({
      batch,
      tagNodeId: nodeDoc.id,
      tagTitle: "Test 1Academy",
      proposer,
      aImgUrl: nodeDoc.data().aImgUrl,
      aFullname: nodeDoc.data().aFullname,
      aChooseUname: nodeDoc.data().aChooseUname,
      currentTimestamp: currentTimestamp,
      writeCounts,
    });
    await commitBatch(batch);
    const tagDocs: any = await db.collection("tags").where("node", "==", nodeDoc.id).get();
    expect(writeCounts).toBeGreaterThan(0);
    expect(tagDocs.docs[0].data()).toMatchObject({ title: "Test 1Academy", node: nodeDoc.id });
  });
});
