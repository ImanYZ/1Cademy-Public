import { getTypedCollections } from "../../src/utils/getTypedCollections";
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

describe("getTypedCollections", () => {
  beforeEach(async () => {
    await conceptVersionsData.populate();
    await conceptVersionCommentsData.populate();
    await userConceptVersionsData.populate();
    await userConceptVersionCommentsData.populate();
    await codeVersionsData.populate();
    await userCodeVersionsData.populate();
    await codeVersionCommentsData.populate();
    await userCodeVersionCommentsData.populate();
    await relationVersionsData.populate();
    await userRelationVersionsData.populate();
    await relationVersionCommentsData.populate();
    await userRelationVersionCommentsData.populate();
    await questionVersionsData.populate();
    await userQuestionVersionsData.populate();
    await questionVersionCommentsData.populate();
    await userQuestionVersionCommentsData.populate();
    await profileVersionsData.populate();
    await userProfileVersionsData.populate();
    await profileVersionCommentsData.populate();
    await userProfileVersionCommentsData.populate();
    await sequelVersionsData.populate();
    await userSequelVersionsData.populate();
    await sequelVersionCommentsData.populate();
    await userSequelVersionCommentsData.populate();
    await advertisementVersionsData.populate();
    await userAdvertisementVersionsData.populate();
    await advertisementVersionCommentsData.populate();
    await userAdvertisementVersionCommentsData.populate();
    await referenceVersionsData.populate();
    await userReferenceVersionsData.populate();
    await referenceVersionCommentsData.populate();
    await userReferenceVersionCommentsData.populate();
    await newsVersionsData.populate();
    await userNewsVersionsData.populate();
    await newsVersionCommentsData.populate();
    await userNewsVersionCommentsData.populate();
    await ideaVersionsData.populate();
    await userIdeaVersionsData.populate();
    await ideaVersionCommentsData.populate();
    await userIdeaVersionCommentsData.populate();
    await privateVersionsData.populate();
    await userPrivateVersionsData.populate();
    await privateVersionCommentsData.populate();
    await userPrivateVersionCommentsData.populate();
  });

  afterEach(async () => {
    await conceptVersionsData.clean();
    await conceptVersionCommentsData.clean();
    await userConceptVersionsData.clean();
    await userConceptVersionCommentsData.clean();
    await codeVersionsData.clean();
    await userCodeVersionsData.clean();
    await codeVersionCommentsData.clean();
    await userCodeVersionCommentsData.clean();
    await relationVersionsData.clean();
    await userRelationVersionsData.clean();
    await relationVersionCommentsData.clean();
    await userRelationVersionCommentsData.clean();
    await questionVersionsData.clean();
    await userQuestionVersionsData.clean();
    await questionVersionCommentsData.clean();
    await userQuestionVersionCommentsData.clean();
    await profileVersionsData.clean();
    await userProfileVersionsData.clean();
    await profileVersionCommentsData.clean();
    await userProfileVersionCommentsData.clean();
    await sequelVersionsData.clean();
    await userSequelVersionsData.clean();
    await sequelVersionCommentsData.clean();
    await userSequelVersionCommentsData.clean();
    await advertisementVersionsData.clean();
    await userAdvertisementVersionsData.clean();
    await advertisementVersionCommentsData.clean();
    await userAdvertisementVersionCommentsData.clean();
    await referenceVersionsData.clean();
    await userReferenceVersionsData.clean();
    await referenceVersionCommentsData.clean();
    await userReferenceVersionCommentsData.clean();
    await newsVersionsData.clean();
    await userNewsVersionsData.clean();
    await newsVersionCommentsData.clean();
    await userNewsVersionCommentsData.clean();
    await ideaVersionsData.clean();
    await userIdeaVersionsData.clean();
    await ideaVersionCommentsData.clean();
    await userIdeaVersionCommentsData.clean();
    await privateVersionsData.clean();
    await userPrivateVersionsData.clean();
    await privateVersionCommentsData.clean();
    await userPrivateVersionCommentsData.clean();
  });

  it("Should point to the correct firebase reference", async () => {
    let { versionsColl, userVersionsColl, versionsCommentsColl, userVersionsCommentsColl }: any = getTypedCollections();
    expect(versionsColl._queryOptions).toMatchObject({ collectionId: "versions" });
    expect(userVersionsColl._queryOptions).toMatchObject({ collectionId: "userVersions" });
    expect(versionsCommentsColl._queryOptions).toMatchObject({ collectionId: "versionComments" });
    expect(userVersionsCommentsColl._queryOptions).toMatchObject({ collectionId: "userVersionComments" });
  });
});
