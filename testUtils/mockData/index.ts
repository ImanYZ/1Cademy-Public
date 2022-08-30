import { commitBatch, db } from "../../src/lib/firestoreServer/admin";
import dropCollection from "../helpers/dropCollection";
import bookmarkNums from "./bookMarkNums.data";
import credits from "./credits.data";
import institutions from "./institutions.data";
import notificationNums from "./notificationNums.data";
import pendingPropsNums from "./pendingPropsNums.data";
import reputations from "./reputations.data";
import tags from "./tags.data";
import userNodes from "./userNodes.data";
import userNodesLog from "./userNodesLog.data";
import users from "./users.data";

class MockData {
  constructor(private data: any[], private collecion: string) {}

  public populate = async () => {
    const batch = db.batch();
    for (let document of this.data) {
      let institutionRef: any = db.collection(this.collecion);
      institutionRef = document.id ? institutionRef.doc(document.id) : institutionRef.doc();
      delete document.id;
      batch.set(institutionRef, document);
    }
    await commitBatch(batch);
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
export const notificationNumsData = new MockData(notificationNums.data, notificationNums.collection);
export const pendingPropsNumsData = new MockData(pendingPropsNums.data, pendingPropsNums.collection);
export const reputationsData = new MockData(reputations.data, reputations.collection);
export const userNodesData = new MockData(userNodes.data, userNodes.collection);
export const userNodesLogData = new MockData(userNodesLog.data, userNodesLog.collection);
