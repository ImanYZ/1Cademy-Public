import { db } from "@/lib/firestoreServer/admin";

import { getQueryCollections } from "../../src/utils";
import { replaceUsername } from "../../src/utils/replaceUsername";
import {
  nodesData,
  userNodesData,
  usersData,
  userVersionCommentsData,
  userVersionsData,
  versionCommentsData,
  versionsData,
} from "../../testUtils/mockCollections";

describe("getUserNode", () => {
  let newUsername = "A_wei322345";

  const collects = [
    nodesData,
    userNodesData,
    usersData,
    userVersionCommentsData,
    userVersionsData,
    versionCommentsData,
    versionsData,
  ];

  beforeAll(async () => {
    await Promise.all(collects.map(collect => collect.populate()));
  });

  afterAll(async () => {
    await Promise.all(collects.map(collect => collect.clean()));
  });

  describe("Should be able change username if username doesn't exists", () => {
    it("If username change was successful", async () => {
      const _users = usersData.getData();
      const user = await db.collection("users").doc(_users[2].uname).get();
      await replaceUsername({
        userDoc: user,
        newUsername,
      });
      const oldRef = await db.collection("users").doc(_users[2].uname).get();
      const newRef = await db.collection("users").doc(newUsername).get();
      expect(oldRef.exists).toBeFalsy();
      expect(newRef.exists).toBeTruthy();
    });

    it("Check if version, votes, comments and comment votes are transferred from old username to new username", async () => {
      const { versionsColl, userVersionsColl, versionsCommentsColl, userVersionsCommentsColl } = getQueryCollections();
      expect((await versionsColl.where("proposer", "==", newUsername).get()).docs.length).toBeGreaterThan(0);
      expect((await userVersionsColl.where("user", "==", newUsername).get()).docs.length).toBeGreaterThan(0);
      expect((await versionsCommentsColl.where("author", "==", newUsername).get()).docs.length).toBeGreaterThan(0);
      expect((await userVersionsCommentsColl.where("user", "==", newUsername).get()).docs.length).toBeGreaterThan(0);
    });
  });

  it("Shouldn't be able change username if username already exists", async () => {
    const user = await db.collection("users").doc(newUsername).get();
    try {
      await replaceUsername({
        userDoc: user,
        newUsername: "AMYZH",
      });
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
    }
  });
});
