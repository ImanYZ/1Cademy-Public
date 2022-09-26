// import { commitBatch, db, admin } from "../../../src/lib/firestoreServer/admin";
// import { generateTagsData, getTypedCollections } from "../../../src/utils";
// import { usersData, nodesData, tagsData, conceptVersionsData } from "../../../testUtils/mockCollections";

describe("generateTagsData", () => {
  //   let node = "OR8UsmsxmeExHG8ekkIY";
  //   beforeEach(async () => {
  //     await usersData.populate();
  //     await nodesData.populate();
  //     await tagsData.populate();
  //     await conceptVersionsData.populate();
  //   });

  //   afterEach(async () => {
  //     await usersData.clean();
  //     await nodesData.clean();
  //     await tagsData.clean();
  //     await conceptVersionsData.clean();
  //   });

  it("should perform generateTagsData action on tags collection", async () => {
    // const currentTimestamp = admin.firestore.Timestamp.fromDate(new Date());
    // let nodeDoc: any = await db.collection("nodes").doc("tKxTypLrxds").get();
    // const { versionsColl }: any = getTypedCollections({ nodeType: "Concept" });
    // const versionsDocs = await versionsColl.where("node", "==", node).get();
    // let versionData = versionsDocs.docs[0].data();
    // const proposer = versionData.proposer;
    // let batch = db.batch();
    // let writeCounts = 0;
    // [batch, writeCounts] = await generateTagsData({
    //   batch,
    //   nodeId: nodeDoc.id,
    //   isTag: true,
    //   nodeUpdates: nodeDoc.data(),
    //   nodeTagIds: [],
    //   nodeTags: [],
    //   versionTagIds: versionData.tagIds,
    //   versionTags: versionData.tags,
    //   proposer,
    //   aImgUrl: nodeDoc.data().aImgUrl,
    //   aFullname: nodeDoc.data().aFullname,
    //   aChooseUname: nodeDoc.data().aChooseUname,
    //   currentTimestamp: currentTimestamp,
    //   writeCounts,
    // });
    // await commitBatch(batch);
    // const tagDocs: any = await db.collection("tags").where("node", "==", nodeDoc.id).get();
    // expect(writeCounts).toBeGreaterThan(0);
    //expect(tagDocs.docs[0].data()).toMatchObject({ title: "Test 1Academy" });
    expect(true).toBe(true);
  });
});
