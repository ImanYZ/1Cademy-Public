import { db } from "@/lib/firestoreServer/admin";

import { getTypedCollections } from "../../src/utils";
import { replaceUsername } from "../../src/utils/replaceUsername";
import { NODE_TYPES } from "../../src/utils/version-helpers";
import {
  advertisementVersionCommentsData,
  advertisementVersionsData,
  codeVersionCommentsData,
  codeVersionsData,
  conceptVersionCommentsData,
  conceptVersionsData,
  ideaVersionCommentsData,
  ideaVersionsData,
  newsVersionCommentsData,
  newsVersionsData,
  nodesData,
  privateVersionCommentsData,
  privateVersionsData,
  profileVersionCommentsData,
  profileVersionsData,
  questionVersionCommentsData,
  questionVersionsData,
  referenceVersionCommentsData,
  referenceVersionsData,
  relationVersionCommentsData,
  relationVersionsData,
  sequelVersionCommentsData,
  sequelVersionsData,
  userAdvertisementVersionCommentsData,
  userAdvertisementVersionsData,
  userCodeVersionCommentsData,
  userCodeVersionsData,
  userConceptVersionCommentsData,
  userConceptVersionsData,
  userIdeaVersionCommentsData,
  userIdeaVersionsData,
  userNewsVersionCommentsData,
  userNewsVersionsData,
  userNodesData,
  userPrivateVersionCommentsData,
  userPrivateVersionsData,
  userProfileVersionCommentsData,
  userProfileVersionsData,
  userQuestionVersionCommentsData,
  userQuestionVersionsData,
  userReferenceVersionCommentsData,
  userReferenceVersionsData,
  userRelationVersionCommentsData,
  userRelationVersionsData,
  usersData,
  userSequelVersionCommentsData,
  userSequelVersionsData,
} from "../../testUtils/mockCollections";

describe("getUserNode", () => {
  let newUsername = "A_wei322345";

  beforeAll(async () => {
    await Promise.all(
      [
        nodesData,
        userNodesData,
        usersData,
        conceptVersionsData,
        userConceptVersionsData,
        conceptVersionCommentsData,
        userConceptVersionCommentsData,
        codeVersionsData,
        userCodeVersionsData,
        codeVersionCommentsData,
        userCodeVersionCommentsData,
        relationVersionsData,
        userRelationVersionsData,
        relationVersionCommentsData,
        userRelationVersionCommentsData,
        questionVersionsData,
        userQuestionVersionsData,
        questionVersionCommentsData,
        userQuestionVersionCommentsData,
        profileVersionsData,
        userProfileVersionsData,
        profileVersionCommentsData,
        userProfileVersionCommentsData,
        sequelVersionsData,
        userSequelVersionsData,
        sequelVersionCommentsData,
        userSequelVersionCommentsData,
        advertisementVersionsData,
        userAdvertisementVersionsData,
        advertisementVersionCommentsData,
        userAdvertisementVersionCommentsData,
        referenceVersionsData,
        userReferenceVersionsData,
        referenceVersionCommentsData,
        userReferenceVersionCommentsData,
        newsVersionsData,
        userNewsVersionsData,
        newsVersionCommentsData,
        userNewsVersionCommentsData,
        ideaVersionsData,
        userIdeaVersionsData,
        ideaVersionCommentsData,
        userIdeaVersionCommentsData,
        privateVersionsData,
        userPrivateVersionsData,
        privateVersionCommentsData,
        userPrivateVersionCommentsData,
      ].map(collect => collect.populate())
    );
  });

  afterAll(async () => {
    await Promise.all(
      [
        nodesData,
        userNodesData,
        usersData,
        conceptVersionsData,
        userConceptVersionsData,
        conceptVersionCommentsData,
        userConceptVersionCommentsData,
        codeVersionsData,
        userCodeVersionsData,
        codeVersionCommentsData,
        userCodeVersionCommentsData,
        relationVersionsData,
        userRelationVersionsData,
        relationVersionCommentsData,
        userRelationVersionCommentsData,
        questionVersionsData,
        userQuestionVersionsData,
        questionVersionCommentsData,
        userQuestionVersionCommentsData,
        profileVersionsData,
        userProfileVersionsData,
        profileVersionCommentsData,
        userProfileVersionCommentsData,
        sequelVersionsData,
        userSequelVersionsData,
        sequelVersionCommentsData,
        userSequelVersionCommentsData,
        advertisementVersionsData,
        userAdvertisementVersionsData,
        advertisementVersionCommentsData,
        userAdvertisementVersionCommentsData,
        referenceVersionsData,
        userReferenceVersionsData,
        referenceVersionCommentsData,
        userReferenceVersionCommentsData,
        newsVersionsData,
        userNewsVersionsData,
        newsVersionCommentsData,
        userNewsVersionCommentsData,
        ideaVersionsData,
        userIdeaVersionsData,
        ideaVersionCommentsData,
        userIdeaVersionCommentsData,
        privateVersionsData,
        userPrivateVersionsData,
        privateVersionCommentsData,
        userPrivateVersionCommentsData,
      ].map(collect => collect.clean())
    );
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
      for (const NODE_TYPE of NODE_TYPES) {
        const { versionsColl, userVersionsColl, versionsCommentsColl, userVersionsCommentsColl } =
          await getTypedCollections({
            nodeType: NODE_TYPE,
          });
        expect((await versionsColl.where("proposer", "==", newUsername).get()).docs.length).toBeGreaterThan(0);
        expect((await userVersionsColl.where("user", "==", newUsername).get()).docs.length).toBeGreaterThan(0);
        expect((await versionsCommentsColl.where("author", "==", newUsername).get()).docs.length).toBeGreaterThan(0);
        expect((await userVersionsCommentsColl.where("user", "==", newUsername).get()).docs.length).toBeGreaterThan(0);
      }
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
