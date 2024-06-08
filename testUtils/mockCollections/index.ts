// eslint-disable-next-line simple-import-sort/imports
import { db } from "../../src/lib/firestoreServer/admin";
import dropCollection from "../helpers/dropCollection";
import bookmarkNums from "./bookmarkNums.data";
import comMonthlyPoints from "./comMonthlyPoints.data";
import comOthersPoints from "./comOthersPoints.data";
import comOthMonPoints from "./comOthMonPoints.data";
import comOthWeekPoints from "./comOthWeekPoints.data";
import comPoints from "./comPoints.data";
import comWeeklyPoints from "./comWeeklyPoints.data";
import credits from "./credits.data";
import institutions from "./institutions.data";
import messages from "./messages.data";
import monthlyReputations from "./monthlyReputations.data";
import nodes from "./nodes.data";
import notificationNums from "./notificationNums.data";
import notifications from "./notifications.data";
import othersReputations from "./othersReputations.data";
import othMonReputations from "./othMonReputations.data";
import othWeekReputations from "./othWeekReputations.data";
import pendingPropsNums from "./pendingPropsNums.data";
import practice from "./practice.data";
import reputations from "./reputations.data";
import status from "./status.data";
import tags from "./tags.data";
import userNodes from "./userNodes.data";
import userNodesLog from "./userNodesLog.data";
import users from "./users.data";
import weeklyReputations from "./weeklyReputations.data";
//versions collection
import versions from "./versions.data";
import userVersions from "./userVersions.data";
import userVersionComments from "./userVersionComments.data";
import versionComments from "./versionComments.data";

export class MockData {
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
export const messagesData = new MockData(messages.data, messages.collection);
export const practiceData = new MockData(practice.data, practice.collection);
//versions Mock data
export const versionsData = new MockData(versions.data, versions.collection);
export const userVersionsData = new MockData(userVersions.data, userVersions.collection);
export const userVersionCommentsData = new MockData(userVersionComments.data, userVersionComments.collection);
export const versionCommentsData = new MockData(versionComments.data, versionComments.collection);
