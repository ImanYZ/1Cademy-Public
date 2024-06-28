import { db } from "@/lib/firestoreServer/admin";

import { isVersionApproved } from "../../../src/utils";
import { nodesData } from "../../../testUtils/mockCollections";

describe("isVersionApproved", () => {
  beforeEach(async () => {
    await nodesData.populate();
  });

  afterEach(async () => {
    await nodesData.clean();
  });

  it("should return isVersionApproved of specifc node", async () => {
    let nodeDoc: any = await db.collection("nodes").doc("tKxTL4lxds").get();
    let is_approved = isVersionApproved({
      corrects: 1,
      wrongs: 0,
      nodeData: nodeDoc.data(),
      isInstructor: false,
      instantApprove: false,
    });
    expect(is_approved).toBeTruthy();
  });
});
