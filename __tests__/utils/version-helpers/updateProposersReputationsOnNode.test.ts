import { updateProposersReputationsOnNode } from "../../../src/utils";
import { getTypedCollections } from "../../../src/utils/getTypedCollections";
import { conceptVersionsData } from "../../../testUtils/mockCollections";

describe("updateProposersReputationsOnNode", () => {
  beforeEach(async () => {
    await conceptVersionsData.populate();
  });

  afterEach(async () => {
    await conceptVersionsData.clean();
  });

  it("should perform action on  updateProposersReputationsOnNode with new proposer", async () => {
    let { versionsColl }: any = getTypedCollections({
      nodeType: "Concept",
    });
    const versionDoc = await versionsColl.doc("bkZvknixyiO1Ue7K9htZ").get();
    let versionData = versionDoc.data();
    let versionRating = versionData.corrects - versionData.wrongs;
    let proposersReputationsOnNode: any = {};
    const { newVersionRating, points, adminNode, aImgUrl, aFullname, aChooseUname } = updateProposersReputationsOnNode({
      proposersReputationsOnNode,
      versionData: versionDoc.data(),
      versionRating,
      newMaxVersionRating: 1,
      value: 1,
      adminPoints: 0,
    });
    expect(newVersionRating).toEqual(1);
    expect(points).toEqual(1);
    expect(adminNode).toEqual(versionData.proposer);
    expect(aImgUrl).toEqual(versionDoc.data().imageUrl);
    expect(aFullname).toEqual(versionDoc.data().fullname);
    expect(aChooseUname).toBe(false);
  });

  it("should perform action on  updateProposersReputationsOnNode with an existing proposer", async () => {
    let { versionsColl }: any = getTypedCollections({
      nodeType: "Concept",
    });
    const versionDoc = await versionsColl.doc("bkZvknixyiO1Ue7K9htZ").get();
    let versionData = versionDoc.data();
    let versionRating = versionData.corrects - versionData.wrongs;
    let proposersReputationsOnNode: any = {};
    proposersReputationsOnNode[versionData.proposer] = 1;
    const { newVersionRating, points, adminNode, aImgUrl, aFullname, aChooseUname } = updateProposersReputationsOnNode({
      proposersReputationsOnNode,
      versionData: versionDoc.data(),
      versionRating,
      newMaxVersionRating: 1,
      value: 1,
      adminPoints: 0,
    });
    expect(newVersionRating).toEqual(1);
    expect(points).toEqual(2);
    expect(adminNode).toEqual(versionData.proposer);
    expect(aImgUrl).toEqual(versionDoc.data().imageUrl);
    expect(aFullname).toEqual(versionDoc.data().fullname);
    expect(aChooseUname).toBe(false);
  });
});
