import { db } from "../../src/lib/firestoreServer/admin";
import dropCollection from "../helpers/dropCollection";
import advertisementVersionComments from "./advertisementVersionComments.data";
import advertisementVersions from "./advertisementVersions.data";
import bookmarkNums from "./bookmarkNums.data";
import codeVersionComments from "./codeVersionComments.data";
import codeVersions from "./codeVersions.data";
import comMonthlyPoints from "./comMonthlyPoints.data";
import comOthersPoints from "./comOthersPoints.data";
import comOthMonPoints from "./comOthMonPoints.data";
import comOthWeekPoints from "./comOthWeekPoints.data";
import comPoints from "./comPoints.data";
import comWeeklyPoints from "./comWeeklyPoints.data";
import conceptVersionComments from "./conceptVersionComments.data";
import conceptVersions from "./conceptVersions.data";
import credits from "./credits.data";
import ideaVersionComments from "./ideaVersionComments.data";
import ideaVersions from "./ideaVersions.data";
import institutions from "./institutions.data";
import monthlyReputations from "./monthlyReputations.data";
import newsVersionComments from "./newsVersionComments.data";
import newsVersions from "./newsVersions.data";
import nodes from "./nodes.data";
import notificationNums from "./notificationNums.data";
import notifications from "./notifications.data";
import othersReputations from "./othersReputations.data";
import othMonReputations from "./othMonReputations.data";
import othWeekReputations from "./othWeekReputations.data";
import pendingPropsNums from "./pendingPropsNums.data";
import privateVersionComments from "./privateVersionComments.data";
import privateVersions from "./privateVersions.data";
import profileVersionComments from "./profileVersionComments.data";
import profileVersions from "./profileVersions.data";
import questionVersionComments from "./questionVersionComments.data";
import questionVersions from "./questionVersions.data";
import referenceVersionComments from "./referenceVersionComments.data";
import referenceVersions from "./referenceVersions.data";
import relationVersionComments from "./relationVersionComments.data";
import relationVersions from "./relationVersions.data";
import reputations from "./reputations.data";
import sequelVersionComments from "./sequelVersionComments.data";
import sequelVersions from "./sequelVersions.data";
import status from "./status.data";
import tags from "./tags.data";
import userAdvertisementVersionComments from "./userAdvertisementVersionComments.data";
import userAdvertisementVersions from "./userAdvertisementVersions.data";
import userCodeVersionComments from "./userCodeVersionComments.data";
import userCodeVersions from "./userCodeVersions.data";
import userConceptVersionComments from "./userConceptVersionComments.data";
import userConceptVersions from "./userConceptVersions.data";
import userIdeaVersionComments from "./userIdeaVersionComments.data";
import userIdeaVersions from "./userIdeaVersions.data";
import userNewsVersionComments from "./userNewsVersionComments.data";
import userNewsVersions from "./userNewsVersions.data";
import userNodes from "./userNodes.data";
import userNodesLog from "./userNodesLog.data";
import userPrivateVersionComments from "./userPrivateVersionComments.data";
import userPrivateVersions from "./userPrivateVersions.data";
import userProfileVersionComments from "./userProfileVersionComments.data";
import userProfileVersions from "./userProfileVersions.data";
import userQuestionVersionComments from "./userQuestionVersionComments.data";
import userQuestionVersions from "./userQuestionVersions.data";
import userReferenceVersionComments from "./userReferenceVersionComments.data";
import userReferenceVersions from "./userReferenceVersions.data";
import userRelationVersionComments from "./userRelationVersionComments.data";
import userRelationVersions from "./userRelationVersions.data";
import users from "./users.data";
import userSequelVersionComments from "./userSequelVersionComments.data";
import userSequelVersions from "./userSequelVersions.data";
import weeklyReputations from "./weeklyReputations.data";

class MockData {
  constructor(private data: any[], private collecion: string) {}

  public getData = () => this.data;
  public getCollection = () => this.collecion;

  public populate = async () => {
    await db.runTransaction(async t => {
      for (let document of this.data) {
        let documentRef: any = db.collection(this.collecion);

        documentRef = document.documentId ? documentRef.doc(document.documentId) : documentRef.doc();

        const documentData = { ...document };
        delete documentData.documentId;
        await t.set(documentRef, documentData);
      }
    });
  };

  public clean = async () => {
    await dropCollection(this.collecion);
  };
}

export const usersData = new MockData(users.data, users.collection);
export const institutionsData = new MockData(institutions.data, institutions.collection);
export const tagsData = new MockData(tags.data, tags.collection);
export const creditsData = new MockData(credits.data, credits.collection);
export const bookmarkNumsData = new MockData(bookmarkNums.data, bookmarkNums.collection);
export const notificationsData = new MockData(notifications.data, notifications.collection);
export const notificationNumsData = new MockData(notificationNums.data, notificationNums.collection);
export const pendingPropsNumsData = new MockData(pendingPropsNums.data, pendingPropsNums.collection);
export const reputationsData = new MockData(reputations.data, reputations.collection);
export const userNodesData = new MockData(userNodes.data, userNodes.collection);
export const userNodesLogData = new MockData(userNodesLog.data, userNodesLog.collection);
export const nodesData = new MockData(nodes.data, nodes.collection);
export const statusData = new MockData(status.data, status.collection);
export const comPointsData = new MockData(comPoints.data, comPoints.collection);
export const comMonthlyPointsData = new MockData(comMonthlyPoints.data, comMonthlyPoints.collection);
export const comWeeklyPointsData = new MockData(comWeeklyPoints.data, comWeeklyPoints.collection);
export const comOthersPointsData = new MockData(comOthersPoints.data, comOthersPoints.collection);
export const comOthMonPointsData = new MockData(comOthMonPoints.data, comOthMonPoints.collection);
export const comOthWeekPointsData = new MockData(comOthWeekPoints.data, comOthWeekPoints.collection);
export const weeklyReputationsData = new MockData(weeklyReputations.data, weeklyReputations.collection);
export const monthlyReputationsData = new MockData(monthlyReputations.data, monthlyReputations.collection);
export const othersReputationsData = new MockData(othersReputations.data, othersReputations.collection);
export const othMonReputationsData = new MockData(othMonReputations.data, othMonReputations.collection);
export const othWeekReputationsData = new MockData(othWeekReputations.data, othWeekReputations.collection);

export const conceptVersionsData = new MockData(conceptVersions.data, conceptVersions.collection);
export const userConceptVersionsData = new MockData(userConceptVersions.data, userConceptVersions.collection);
export const conceptVersionCommentsData = new MockData(conceptVersionComments.data, conceptVersionComments.collection);
export const userConceptVersionCommentsData = new MockData(
  userConceptVersionComments.data,
  userConceptVersionComments.collection
);
export const codeVersionsData = new MockData(codeVersions.data, codeVersions.collection);
export const userCodeVersionsData = new MockData(userCodeVersions.data, userCodeVersions.collection);
export const codeVersionCommentsData = new MockData(codeVersionComments.data, codeVersionComments.collection);
export const userCodeVersionCommentsData = new MockData(
  userCodeVersionComments.data,
  userCodeVersionComments.collection
);
export const relationVersionsData = new MockData(relationVersions.data, relationVersions.collection);
export const userRelationVersionsData = new MockData(userRelationVersions.data, userRelationVersions.collection);
export const relationVersionCommentsData = new MockData(
  relationVersionComments.data,
  relationVersionComments.collection
);
export const userRelationVersionCommentsData = new MockData(
  userRelationVersionComments.data,
  userRelationVersionComments.collection
);
export const questionVersionsData = new MockData(questionVersions.data, questionVersions.collection);
export const userQuestionVersionsData = new MockData(userQuestionVersions.data, userQuestionVersions.collection);
export const questionVersionCommentsData = new MockData(
  questionVersionComments.data,
  questionVersionComments.collection
);
export const userQuestionVersionCommentsData = new MockData(
  userQuestionVersionComments.data,
  userQuestionVersionComments.collection
);
export const profileVersionsData = new MockData(profileVersions.data, profileVersions.collection);
export const userProfileVersionsData = new MockData(userProfileVersions.data, userProfileVersions.collection);
export const profileVersionCommentsData = new MockData(profileVersionComments.data, profileVersionComments.collection);
export const userProfileVersionCommentsData = new MockData(
  userProfileVersionComments.data,
  userProfileVersionComments.collection
);
export const sequelVersionsData = new MockData(sequelVersions.data, sequelVersions.collection);
export const userSequelVersionsData = new MockData(userSequelVersions.data, userSequelVersions.collection);
export const sequelVersionCommentsData = new MockData(sequelVersionComments.data, sequelVersionComments.collection);
export const userSequelVersionCommentsData = new MockData(
  userSequelVersionComments.data,
  userSequelVersionComments.collection
);
export const advertisementVersionsData = new MockData(advertisementVersions.data, advertisementVersions.collection);
export const userAdvertisementVersionsData = new MockData(
  userAdvertisementVersions.data,
  userAdvertisementVersions.collection
);
export const advertisementVersionCommentsData = new MockData(
  advertisementVersionComments.data,
  advertisementVersionComments.collection
);
export const userAdvertisementVersionCommentsData = new MockData(
  userAdvertisementVersionComments.data,
  userAdvertisementVersionComments.collection
);
export const referenceVersionsData = new MockData(referenceVersions.data, referenceVersions.collection);
export const userReferenceVersionsData = new MockData(userReferenceVersions.data, userReferenceVersions.collection);
export const referenceVersionCommentsData = new MockData(
  referenceVersionComments.data,
  referenceVersionComments.collection
);
export const userReferenceVersionCommentsData = new MockData(
  userReferenceVersionComments.data,
  userReferenceVersionComments.collection
);
export const newsVersionsData = new MockData(newsVersions.data, newsVersions.collection);
export const userNewsVersionsData = new MockData(userNewsVersions.data, userNewsVersions.collection);
export const newsVersionCommentsData = new MockData(newsVersionComments.data, newsVersionComments.collection);
export const userNewsVersionCommentsData = new MockData(
  userNewsVersionComments.data,
  userNewsVersionComments.collection
);
export const ideaVersionsData = new MockData(ideaVersions.data, ideaVersions.collection);
export const userIdeaVersionsData = new MockData(userIdeaVersions.data, userIdeaVersions.collection);
export const ideaVersionCommentsData = new MockData(ideaVersionComments.data, ideaVersionComments.collection);
export const userIdeaVersionCommentsData = new MockData(
  userIdeaVersionComments.data,
  userIdeaVersionComments.collection
);
export const privateVersionsData = new MockData(privateVersions.data, privateVersions.collection);
export const userPrivateVersionsData = new MockData(userPrivateVersions.data, userPrivateVersions.collection);
export const privateVersionCommentsData = new MockData(privateVersionComments.data, privateVersionComments.collection);
export const userPrivateVersionCommentsData = new MockData(
  userPrivateVersionComments.data,
  userPrivateVersionComments.collection
);
