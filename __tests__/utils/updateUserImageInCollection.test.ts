import { db } from "../../src/lib/firestoreServer/admin";
import { getTypedCollections, NODE_TYPES } from "../../src/utils";
import { updateUserImageInCollection } from "../../src/utils/updateUserImageInCollection";
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
  userSequelVersionCommentsData,
  userSequelVersionsData,
} from "../../testUtils/mockCollections";

describe("updateUserImageEverywhere", () => {
  const username = "A_wei";
  beforeEach(async () => {
    await Promise.all(
      [
        nodesData,
        userNodesData,

        conceptVersionCommentsData,
        conceptVersionsData,
        userConceptVersionsData,
        userConceptVersionCommentsData,

        codeVersionCommentsData,
        codeVersionsData,
        userCodeVersionsData,
        userCodeVersionCommentsData,

        relationVersionCommentsData,
        relationVersionsData,
        userRelationVersionsData,
        userRelationVersionCommentsData,

        questionVersionCommentsData,
        questionVersionsData,
        userQuestionVersionsData,
        userQuestionVersionCommentsData,

        profileVersionCommentsData,
        profileVersionsData,
        userProfileVersionsData,
        userProfileVersionCommentsData,

        sequelVersionCommentsData,
        sequelVersionsData,
        userSequelVersionsData,
        userSequelVersionCommentsData,

        advertisementVersionCommentsData,
        advertisementVersionsData,
        userAdvertisementVersionsData,
        userAdvertisementVersionCommentsData,

        referenceVersionCommentsData,
        referenceVersionsData,
        userReferenceVersionsData,
        userReferenceVersionCommentsData,

        newsVersionCommentsData,
        newsVersionsData,
        userNewsVersionsData,
        userNewsVersionCommentsData,

        ideaVersionCommentsData,
        ideaVersionsData,
        userIdeaVersionsData,
        userIdeaVersionCommentsData,

        privateVersionCommentsData,
        privateVersionsData,
        userPrivateVersionsData,
        userPrivateVersionCommentsData,
      ].map(collect => collect.populate())
    );
  });

  afterEach(async () => {
    await Promise.all(
      [
        nodesData,
        userNodesData,

        conceptVersionCommentsData,
        conceptVersionsData,
        userConceptVersionsData,
        userConceptVersionCommentsData,

        codeVersionCommentsData,
        codeVersionsData,
        userCodeVersionsData,
        userCodeVersionCommentsData,

        relationVersionCommentsData,
        relationVersionsData,
        userRelationVersionsData,
        userRelationVersionCommentsData,

        questionVersionCommentsData,
        questionVersionsData,
        userQuestionVersionsData,
        userQuestionVersionCommentsData,

        profileVersionCommentsData,
        profileVersionsData,
        userProfileVersionsData,
        userProfileVersionCommentsData,

        sequelVersionCommentsData,
        sequelVersionsData,
        userSequelVersionsData,
        userSequelVersionCommentsData,

        advertisementVersionCommentsData,
        advertisementVersionsData,
        userAdvertisementVersionsData,
        userAdvertisementVersionCommentsData,

        referenceVersionCommentsData,
        referenceVersionsData,
        userReferenceVersionsData,
        userReferenceVersionCommentsData,

        newsVersionCommentsData,
        newsVersionsData,
        userNewsVersionsData,
        userNewsVersionCommentsData,

        ideaVersionCommentsData,
        ideaVersionsData,
        userIdeaVersionsData,
        userIdeaVersionCommentsData,

        privateVersionCommentsData,
        privateVersionsData,
        userPrivateVersionsData,
        userPrivateVersionCommentsData,
      ].map(collect => collect.clean())
    );
  });

  it("Should be able to update user profile image everywhere", async () => {
    const newImageUrl = "https://lh3.googleusercontent.com/ogw/AOh-ky2UJPA2Md8swcNMKdxNTwtmO0iXtjDRFosHZJqqVw=s32-c-mo";

    for (const nodeType of NODE_TYPES) {
      const { versionsColl, versionsCommentsColl } = getTypedCollections({ nodeType });
      let writeCounts = 0;

      let batch = db.batch();
      [batch, writeCounts] = await updateUserImageInCollection({
        batch,
        collQuery: versionsColl,
        collectionName: versionsColl.id,
        userAttribute: "proposer",
        forAdmin: false,
        uname: username,
        imageUrl: newImageUrl,
        fullname: "Alvin Wei",
        chooseUname: true,
        currentTimestamp: new Date(),
        writeCounts,
      });

      [batch, writeCounts] = await updateUserImageInCollection({
        batch,
        collQuery: versionsCommentsColl,
        collectionName: versionsCommentsColl.id,
        userAttribute: "author",
        forAdmin: false,
        uname: username,
        imageUrl: newImageUrl,
        fullname: "Alvin Wei",
        chooseUname: true,
        currentTimestamp: new Date(),
        writeCounts,
      });
      await batch.commit();

      expect(
        (
          await db
            .collection(versionsColl.id)
            .where("proposer", "==", username)
            .where("imageUrl", "==", newImageUrl)
            .get()
        ).docs.length
      ).toBeGreaterThan(0);
      expect(
        (
          await db
            .collection(versionsCommentsColl.id)
            .where("author", "==", username)
            .where("imageUrl", "==", newImageUrl)
            .get()
        ).docs.length
      ).toBeGreaterThan(0);
    }
  });
});
