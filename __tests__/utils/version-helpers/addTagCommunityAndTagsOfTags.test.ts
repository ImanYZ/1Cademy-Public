import { admin, commitBatch, db } from "../../../src/lib/firestoreServer/admin";
import { addTagCommunityAndTagsOfTags, getQueryCollections } from "../../../src/utils";
import { MockData, nodesData, tagsData, usersData, versionsData } from "../../../testUtils/mockCollections";

describe("addTagCommunityAndTagsOfTags", () => {
  const collects = [versionsData, nodesData, tagsData, usersData];

  collects.push(new MockData([], "comMonthlyPoints"));
  collects.push(new MockData([], "comOthMonPoints"));
  collects.push(new MockData([], "comOthWeekPoints"));
  collects.push(new MockData([], "comOthersPoints"));
  collects.push(new MockData([], "comPoints"));
  collects.push(new MockData([], "comWeeklyPoints"));

  beforeEach(async () => {
    await Promise.all(collects.map(collect => collect.populate()));
  });

  afterEach(async () => {
    await Promise.all(collects.map(collect => collect.clean()));
  });

  it("should perform addTagCommunityAndTagsOfTags action on tags collection", async () => {
    const currentTimestamp = admin.firestore.Timestamp.fromDate(new Date());
    let nodeDoc: any = await db.collection("nodes").doc("GJfzAY1zbgQs9jU5XeEL").get();
    const { versionsColl }: any = getQueryCollections();
    const versionsDocs = await versionsColl.where("node", "==", nodeDoc.id).get();
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
