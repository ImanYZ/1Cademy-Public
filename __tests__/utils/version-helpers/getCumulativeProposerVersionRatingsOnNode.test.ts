import { db } from "@/lib/firestoreServer/admin";

import { getCumulativeProposerVersionRatingsOnNode } from "../../../src/utils";
import { getTypedCollections } from "../../../src/utils/getTypedCollections";
import { conceptVersionsData, nodesData } from "../../../testUtils/mockCollections";

describe("getCumulativeProposerVersionRatingsOnNode", () => {
  beforeEach(async () => {
    await conceptVersionsData.populate();
    await nodesData.populate();
  });

  afterEach(async () => {
    await conceptVersionsData.clean();
    await nodesData.clean();
  });

  it("should perform action on  getCumulativeProposerVersionRatingsOnNode as a new version", async () => {
    let { versionsColl }: any = getTypedCollections({
      nodeType: "Concept",
    });
    let nodeDoc: any = await db.collection("nodes").doc("tKxTypLrxds").get();
    const versionDoc = await versionsColl.doc("bkZvknixyiO1Ue7K9htZ").get();
    let versionData = versionDoc.data();
    let proposersReputationsOnNode: any = {};
    proposersReputationsOnNode[versionData.proposer] = 1;
    const { newMaxVersionRating, adminPoints, nodeAdmin, aImgUrl, aFullname, aChooseUname } =
      await getCumulativeProposerVersionRatingsOnNode({
        nodeId: nodeDoc.id,
        nodeType: nodeDoc.data().nodeType,
        nodeDataAdmin: versionData.proposer,
        aImgUrl: versionDoc.data().imageUrl,
        aFullname: versionData.fullname,
      });
    expect(newMaxVersionRating).toEqual(1);
    expect(adminPoints).toEqual(1);
    expect(nodeAdmin).toEqual(versionData.proposer);
    expect(aImgUrl).toEqual(versionDoc.data().imageUrl);
    expect(aFullname).toEqual(versionDoc.data().fullname);
    expect(aChooseUname).toBe(false);
  });

  it("should perform action on  getCumulativeProposerVersionRatingsOnNode as an exisiting version", async () => {
    let { versionsColl }: any = getTypedCollections({
      nodeType: "Concept",
    });
    let nodeDoc: any = await db.collection("nodes").doc("tKxTypLrxds").get();
    const versionDoc = await versionsColl.doc("bkZvknixyiO1Ue7K9htZ").get();
    let versionData = versionDoc.data();
    let versionRating = versionData.corrects - versionData.wrongs;
    let proposersReputationsOnNode: any = {};
    proposersReputationsOnNode[versionData.proposer] = 1;
    const { newMaxVersionRating, adminPoints, nodeAdmin, aImgUrl, aFullname, aChooseUname } =
      await getCumulativeProposerVersionRatingsOnNode({
        nodeId: nodeDoc.id,
        nodeType: nodeDoc.data().nodeType,
        nodeDataAdmin: versionData.proposer,
        aImgUrl: versionDoc.data().imageUrl,
        aFullname: versionData.fullname,
        updatingVersionId: versionDoc.id,
        updatingVersionData: versionDoc.data(),
        updatingVersionRating: versionRating,
        updatingVersionNotAccepted: true,
      });
    expect(newMaxVersionRating).toEqual(1);
    expect(adminPoints).toEqual(2);
    expect(nodeAdmin).toEqual(versionData.proposer);
    expect(aImgUrl).toEqual(versionDoc.data().imageUrl);
    expect(aFullname).toEqual(versionDoc.data().fullname);
    expect(aChooseUname).toBe(false);
  });
});
