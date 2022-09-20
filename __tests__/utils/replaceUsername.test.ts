import { db } from "@/lib/firestoreServer/admin";

import { replaceUsername } from "../../src/utils/replaceUsername";
import { nodesData, userNodesData, usersData } from "../../testUtils/mockCollections";

describe("getUserNode", () => {
  beforeEach(async () => {
    await Promise.all([nodesData, userNodesData, usersData].map(collect => collect.populate()));
  });

  afterEach(async () => {
    await Promise.all([nodesData, userNodesData, usersData].map(collect => collect.clean()));
  });

  it("Should be able change username", async () => {
    const _users = usersData.getData();
    const user = await db.collection("users").doc(_users[2].uname).get();
    await replaceUsername({
      userDoc: user,
      newUsername: "A_wei322345",
    });
    const oldRef = await db.collection("users").doc(_users[2].uname).get();
    const newRef = await db.collection("users").doc("A_wei322345").get();
    expect(oldRef.exists).toBeFalsy();
    expect(newRef.exists).toBeTruthy();
  });
});
