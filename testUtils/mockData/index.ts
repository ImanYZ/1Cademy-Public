import { commitBatch, db } from "../../src/lib/firestoreServer/admin";
import dropCollection from "../helpers/dropCollection";
import bookmarkNums from "./bookMarkNums.data";
import credits from "./credits.data";
import institutions from "./institutions.data";
import nodes from "./nodes.data";
import notificationNums from "./notificationNums.data";
import pendingPropsNums from "./pendingPropsNums.data";
import reputations from "./reputations.data";
import status from "./status.data";
import tags from "./tags.data";
import userNodes from "./userNodes.data";
import userNodesLog from "./userNodesLog.data";
import users from "./users.data";

class MockData {
  constructor(private data: any[], private collecion: string) {}

  public getData = () => this.data;

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
export const notificationNumsData = new MockData(notificationNums.data, notificationNums.collection);
export const pendingPropsNumsData = new MockData(pendingPropsNums.data, pendingPropsNums.collection);
export const reputationsData = new MockData(reputations.data, reputations.collection);
export const userNodesData = new MockData(userNodes.data, userNodes.collection);
export const userNodesLogData = new MockData(userNodesLog.data, userNodesLog.collection);
export const nodesData = new MockData(nodes.data, nodes.collection);
export const statusData = new MockData(status.data, status.collection);
