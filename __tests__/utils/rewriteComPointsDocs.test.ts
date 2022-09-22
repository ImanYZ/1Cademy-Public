import { commitBatch,db } from "../../src/lib/firestoreServer/admin";
import { getTypedCollections, initializeNewReputationData, rewriteComPointsDocs } from "../../src/utils";
import { firstWeekMonthDays } from "../../src/utils";
import {
  comMonthlyPointsData,
  comOthersPointsData,
  comOthMonPointsData,
  comOthWeekPointsData,
  comPointsData,
  conceptVersionsData,
} from "../../testUtils/mockCollections";

describe("rewriteComPointsDocs", () => {
  let node = "OR8UsmsxmeExHG8ekkIY";
  beforeEach(async () => {
    await conceptVersionsData.populate();
    await comPointsData.populate();
    await comMonthlyPointsData.populate();
    await comOthersPointsData.populate();
    await comOthMonPointsData.populate();
    await comOthWeekPointsData.populate();
  });

  afterEach(async () => {
    await conceptVersionsData.clean();
    await comPointsData.clean();
    await comMonthlyPointsData.clean();
    await comOthersPointsData.clean();
    await comOthMonPointsData.clean();
    await comOthWeekPointsData.clean();
  });

  it("Should return write counts grater than 0 in case of comPoints", async () => {
    const comPoints: any = {};
    const { versionsColl }: any = getTypedCollections({ nodeType: "Concept" });
    const versionsDocs = await versionsColl.where("node", "==", node).get();
    const tagId = versionsDocs.docs[0].data().tagIds[0];
    const tag = "Data Science";
    let createdAt = versionsDocs.docs[0].data().createdAt;
    let updatedAt = new Date();
    comPoints[tagId] = initializeNewReputationData({ tagId, tag, updatedAt, createdAt });
    comPoints[tagId].adminPoints = 0;
    comPoints[tagId].totalPoints = 1000;
    let batch = db.batch();
    let writeCounts = 0;
    let comPointsType = "comPoints";
    let comPointsDict = comPoints;

    [batch, writeCounts] = await rewriteComPointsDocs({
      batch,
      comPointsType,
      comPointsDict,
      writeCounts,
    });
    await commitBatch(batch);
    const comPointsDocs: any = await db.collection("comPoints").where("tagId", "==", tagId).get();
    expect(writeCounts).toBeGreaterThan(0);
    expect(comPointsDocs.docs[0].data().totalPoints).toEqual(1000);
  });

  it("Should return write counts grater than 0 in case of comMonthlyPoints", async () => {
    const comMonthlyPoints: any = {};
    const { versionsColl }: any = getTypedCollections({ nodeType: "Concept" });
    const versionsDocs = await versionsColl.where("node", "==", node).get();
    const tagId = versionsDocs.docs[0].data().tagIds[0];
    const tag = "Data Science";
    let createdAt = versionsDocs.docs[0].data().createdAt;
    let updatedAt = new Date();
    const { firstMonthDay } = firstWeekMonthDays(updatedAt);
    comMonthlyPoints[tagId] = {
      [firstMonthDay]: initializeNewReputationData({ tagId, tag, updatedAt, createdAt }),
    };
    comMonthlyPoints[tagId][firstMonthDay].adminPoints = 0;
    comMonthlyPoints[tagId][firstMonthDay].totalPoints = 1000;

    let batch = db.batch();
    let writeCounts = 0;
    let comPointsType = "comMonthlyPoints";
    let comPointsDict = comMonthlyPoints;
    [batch, writeCounts] = await rewriteComPointsDocs({
      batch,
      comPointsType,
      comPointsDict,
      writeCounts,
    });
    await commitBatch(batch);
    const comPointsDocs: any = await db.collection("comMonthlyPoints").where("tagId", "==", tagId).get();
    expect(writeCounts).toBeGreaterThan(0);
    expect(comPointsDocs.docs[0].data().totalPoints).toEqual(1000);
    expect(writeCounts).toBeGreaterThan(0);
  });

  it("Should return write counts grater than 0 in case of comOthersPoints", async () => {
    const comOthersPoints: any = {};
    const { versionsColl }: any = getTypedCollections({ nodeType: "Concept" });
    const versionsDocs = await versionsColl.where("node", "==", node).get();
    const tagId = versionsDocs.docs[0].data().tagIds[0];
    const tag = "Data Science";
    let createdAt = versionsDocs.docs[0].data().createdAt;
    let updatedAt = new Date();
    comOthersPoints[tagId] = initializeNewReputationData({
      tagId,
      tag,
      updatedAt,
      createdAt,
    });
    comOthersPoints[tagId].adminPoints = 0;
    comOthersPoints[tagId].totalPoints = 1000;
    let batch = db.batch();
    let writeCounts = 0;
    let comPointsType = "comOthersPoints";
    let comPointsDict = comOthersPoints;
    [batch, writeCounts] = await rewriteComPointsDocs({
      batch,
      comPointsType,
      comPointsDict,
      writeCounts,
    });
    await commitBatch(batch);
    const comPointsDocs: any = await db.collection("comOthersPoints").where("tagId", "==", tagId).get();
    expect(writeCounts).toBeGreaterThan(0);
    expect(comPointsDocs.docs[0].data().totalPoints).toEqual(1000);
    expect(writeCounts).toBeGreaterThan(0);
  });

  it("Should return write counts grater than 0 in case of comOthMonPoints", async () => {
    const comOthMonPoints: any = {};
    const { versionsColl }: any = getTypedCollections({ nodeType: "Concept" });
    const versionsDocs = await versionsColl.where("node", "==", node).get();
    const tagId = versionsDocs.docs[0].data().tagIds[0];
    const tag = "Data Science";
    let createdAt = versionsDocs.docs[0].data().createdAt;
    let updatedAt = new Date();
    const { firstMonthDay } = firstWeekMonthDays(updatedAt);
    comOthMonPoints[tagId] = {
      [firstMonthDay]: initializeNewReputationData({ tagId, tag, updatedAt, createdAt }),
    };
    comOthMonPoints[tagId][firstMonthDay].adminPoints = 0;
    comOthMonPoints[tagId][firstMonthDay].totalPoints = 1000;
    let batch = db.batch();
    let writeCounts = 0;
    let comPointsType = "comOthMonPoints";
    let comPointsDict = comOthMonPoints;
    [batch, writeCounts] = await rewriteComPointsDocs({
      batch,
      comPointsType,
      comPointsDict,
      writeCounts,
    });
    await commitBatch(batch);
    const comPointsDocs: any = await db.collection("comOthMonPoints").where("tagId", "==", tagId).get();
    expect(writeCounts).toBeGreaterThan(0);
    expect(comPointsDocs.docs[0].data().totalPoints).toEqual(1000);
    expect(writeCounts).toBeGreaterThan(0);
  });

  it("Should return write counts grater than 0 in case of comOthWeekPoints", async () => {
    const comOthWeekPoints: any = {};
    const { versionsColl }: any = getTypedCollections({ nodeType: "Concept" });
    const versionsDocs = await versionsColl.where("node", "==", node).get();
    const tagId = versionsDocs.docs[0].data().tagIds[0];
    const tag = "Data Science";
    let createdAt = versionsDocs.docs[0].data().createdAt;
    let updatedAt = new Date();
    const { firstWeekDay } = firstWeekMonthDays(updatedAt);
    comOthWeekPoints[tagId] = {
      [firstWeekDay]: initializeNewReputationData({ tagId, tag, updatedAt, createdAt }),
    };
    comOthWeekPoints[tagId][firstWeekDay].adminPoints = 0;
    comOthWeekPoints[tagId][firstWeekDay].totalPoints = 1001;
    let batch = db.batch();
    let writeCounts = 0;
    let comPointsType = "comOthWeekPoints";
    let comPointsDict = comOthWeekPoints;
    [batch, writeCounts] = await rewriteComPointsDocs({
      batch,
      comPointsType,
      comPointsDict,
      writeCounts,
    });
    await commitBatch(batch);
    const comPointsDocs: any = await db.collection("comOthWeekPoints").where("tagId", "==", tagId).get();
    expect(writeCounts).toBeGreaterThan(0);
    expect(comPointsDocs.docs[0].data().totalPoints).toEqual(1001);
    expect(writeCounts).toBeGreaterThan(0);
  });
});
