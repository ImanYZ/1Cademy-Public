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

  it("Should check Concept collection type", async () => {
    let { versionsColl, userVersionsColl, versionsCommentsColl, userVersionsCommentsColl }: any = getTypedCollections({
      nodeType: "Concept",
    });
    expect(versionsColl._queryOptions).toMatchObject({ collectionId: "conceptVersions" });
    expect(userVersionsColl._queryOptions).toMatchObject({ collectionId: "userConceptVersions" });
    expect(versionsCommentsColl._queryOptions).toMatchObject({ collectionId: "conceptVersionComments" });
    expect(userVersionsCommentsColl._queryOptions).toMatchObject({ collectionId: "userConceptVersionComments" });
  });

  it("Should check Code collection type", async () => {
    let { versionsColl, userVersionsColl, versionsCommentsColl, userVersionsCommentsColl }: any = getTypedCollections({
      nodeType: "Code",
    });
    expect(versionsColl._queryOptions).toMatchObject({ collectionId: "codeVersions" });
    expect(userVersionsColl._queryOptions).toMatchObject({ collectionId: "userCodeVersions" });
    expect(versionsCommentsColl._queryOptions).toMatchObject({ collectionId: "codeVersionComments" });
    expect(userVersionsCommentsColl._queryOptions).toMatchObject({ collectionId: "userCodeVersionComments" });
  });

  it("Should check Relation collection type", async () => {
    let { versionsColl, userVersionsColl, versionsCommentsColl, userVersionsCommentsColl }: any = getTypedCollections({
      nodeType: "Relation",
    });
    expect(versionsColl._queryOptions).toMatchObject({ collectionId: "relationVersions" });
    expect(userVersionsColl._queryOptions).toMatchObject({ collectionId: "userRelationVersions" });
    expect(versionsCommentsColl._queryOptions).toMatchObject({ collectionId: "relationVersionComments" });
    expect(userVersionsCommentsColl._queryOptions).toMatchObject({ collectionId: "userRelationVersionComments" });
  });

  it("Should check Question collection type", async () => {
    let { versionsColl, userVersionsColl, versionsCommentsColl, userVersionsCommentsColl }: any = getTypedCollections({
      nodeType: "Question",
    });
    expect(versionsColl._queryOptions).toMatchObject({ collectionId: "questionVersions" });
    expect(userVersionsColl._queryOptions).toMatchObject({ collectionId: "userQuestionVersions" });
    expect(versionsCommentsColl._queryOptions).toMatchObject({ collectionId: "questionVersionComments" });
    expect(userVersionsCommentsColl._queryOptions).toMatchObject({ collectionId: "userQuestionVersionComments" });
  });

  it("Should check Profile collection type", async () => {
    let { versionsColl, userVersionsColl, versionsCommentsColl, userVersionsCommentsColl }: any = getTypedCollections({
      nodeType: "Profile",
    });
    expect(versionsColl._queryOptions).toMatchObject({ collectionId: "profileVersions" });
    expect(userVersionsColl._queryOptions).toMatchObject({ collectionId: "userProfileVersions" });
    expect(versionsCommentsColl._queryOptions).toMatchObject({ collectionId: "profileVersionComments" });
    expect(userVersionsCommentsColl._queryOptions).toMatchObject({ collectionId: "userProfileVersionComments" });
  });

  it("Should check Sequel collection type", async () => {
    let { versionsColl, userVersionsColl, versionsCommentsColl, userVersionsCommentsColl }: any = getTypedCollections({
      nodeType: "Sequel",
    });
    expect(versionsColl._queryOptions).toMatchObject({ collectionId: "sequelVersions" });
    expect(userVersionsColl._queryOptions).toMatchObject({ collectionId: "userSequelVersions" });
    expect(versionsCommentsColl._queryOptions).toMatchObject({ collectionId: "sequelVersionComments" });
    expect(userVersionsCommentsColl._queryOptions).toMatchObject({ collectionId: "userSequelVersionComments" });
  });

  it("Should check Advertisement collection type", async () => {
    let { versionsColl, userVersionsColl, versionsCommentsColl, userVersionsCommentsColl }: any = getTypedCollections({
      nodeType: "Advertisement",
    });
    expect(versionsColl._queryOptions).toMatchObject({ collectionId: "advertisementVersions" });
    expect(userVersionsColl._queryOptions).toMatchObject({ collectionId: "userAdvertisementVersions" });
    expect(versionsCommentsColl._queryOptions).toMatchObject({ collectionId: "advertisementVersionComments" });
    expect(userVersionsCommentsColl._queryOptions).toMatchObject({ collectionId: "userAdvertisementVersionComments" });
  });

  it("Should check Reference collection type", async () => {
    let { versionsColl, userVersionsColl, versionsCommentsColl, userVersionsCommentsColl }: any = getTypedCollections({
      nodeType: "Reference",
    });
    expect(versionsColl._queryOptions).toMatchObject({ collectionId: "referenceVersions" });
    expect(userVersionsColl._queryOptions).toMatchObject({ collectionId: "userReferenceVersions" });
    expect(versionsCommentsColl._queryOptions).toMatchObject({ collectionId: "referenceVersionComments" });
    expect(userVersionsCommentsColl._queryOptions).toMatchObject({ collectionId: "userReferenceVersionComments" });
  });

  it("Should check News collection type", async () => {
    let { versionsColl, userVersionsColl, versionsCommentsColl, userVersionsCommentsColl }: any = getTypedCollections({
      nodeType: "News",
    });
    expect(versionsColl._queryOptions).toMatchObject({ collectionId: "newsVersions" });
    expect(userVersionsColl._queryOptions).toMatchObject({ collectionId: "userNewsVersions" });
    expect(versionsCommentsColl._queryOptions).toMatchObject({ collectionId: "newsVersionComments" });
    expect(userVersionsCommentsColl._queryOptions).toMatchObject({ collectionId: "userNewsVersionComments" });
  });

  it("Should check Idea collection type", async () => {
    let { versionsColl, userVersionsColl, versionsCommentsColl, userVersionsCommentsColl }: any = getTypedCollections({
      nodeType: "Idea",
    });
    expect(versionsColl._queryOptions).toMatchObject({ collectionId: "ideaVersions" });
    expect(userVersionsColl._queryOptions).toMatchObject({ collectionId: "userIdeaVersions" });
    expect(versionsCommentsColl._queryOptions).toMatchObject({ collectionId: "ideaVersionComments" });
    expect(userVersionsCommentsColl._queryOptions).toMatchObject({ collectionId: "userIdeaVersionComments" });
  });

  it("Should check Private collection type", async () => {
    let { versionsColl, userVersionsColl, versionsCommentsColl, userVersionsCommentsColl }: any = getTypedCollections({
      nodeType: "Private",
    });
    expect(versionsColl._queryOptions).toMatchObject({ collectionId: "privateVersions" });
    expect(userVersionsColl._queryOptions).toMatchObject({ collectionId: "userPrivateVersions" });
    expect(versionsCommentsColl._queryOptions).toMatchObject({ collectionId: "privateVersionComments" });
    expect(userVersionsCommentsColl._queryOptions).toMatchObject({ collectionId: "userPrivateVersionComments" });
  });
});
