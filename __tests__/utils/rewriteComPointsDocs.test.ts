import { db } from "../../src/lib/firestoreServer/admin";
import { getTypedCollections, initializeNewReputationData, rewriteComPointsDocs } from "../../src/utils";
import { firstWeekMonthDays } from "../../src/utils";
import { conceptVersionsData } from "../../testUtils/mockCollections";

describe("rewriteComPointsDocs", () => {
  let node = "OR8UsmsxmeExHG8ekkIY";
  beforeEach(async () => {
    await conceptVersionsData.populate();
  });

  afterEach(async () => {
    await conceptVersionsData.clean();
  });

  it("Should return write counts grater than 0 in case of comPoints", async () => {
    const comPoints: any = {};
    const { versionsColl }: any = getTypedCollections({ nodeType: "Concept" });
    const versionsDocs = await versionsColl.where("node", "==", node).get();
    for (let versionDoc of versionsDocs.docs) {
      const versionData = versionDoc.data();
      const tagId = versionData.tagIds[0];
      const tag = "Data Science";
      let createdAt = versionData.createdAt;
      let updatedAt = new Date();
      comPoints[tagId] = initializeNewReputationData({ tagId, tag, updatedAt, createdAt });
      comPoints[tagId].adminPoints = 0;
    }
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
    expect(writeCounts).toBeGreaterThan(0);
  });

  it("Should return write counts grater than 0 in case of comMonthlyPoints", async () => {
    const comMonthlyPoints: any = {};
    const { versionsColl }: any = getTypedCollections({ nodeType: "Concept" });
    const versionsDocs = await versionsColl.where("node", "==", node).get();
    for (let versionDoc of versionsDocs.docs) {
      const versionData = versionDoc.data();
      const tagId = versionData.tagIds[0];
      const tag = "Data Science";
      let createdAt = versionData.createdAt;
      let updatedAt = new Date();
      const { firstMonthDay } = firstWeekMonthDays(updatedAt);
      comMonthlyPoints[tagId] = {
        [firstMonthDay]: initializeNewReputationData({ tagId, tag, updatedAt, createdAt }),
      };
      comMonthlyPoints[tagId][firstMonthDay].adminPoints = 0;
    }
    let batch = db.batch();
    let writeCounts = 0;
    let comPointsType = "comWeeklyPoints";
    let comPointsDict = comMonthlyPoints;
    [batch, writeCounts] = await rewriteComPointsDocs({
      batch,
      comPointsType,
      comPointsDict,
      writeCounts,
    });
    expect(writeCounts).toBeGreaterThan(0);
  });

  it("Should return write counts grater than 0 in case of comOthersPoints", async () => {
    const comOthersPoints: any = {};
    const { versionsColl }: any = getTypedCollections({ nodeType: "Concept" });
    const versionsDocs = await versionsColl.where("node", "==", node).get();
    for (let versionDoc of versionsDocs.docs) {
      const versionData = versionDoc.data();
      const tagId = versionData.tagIds[0];
      const tag = "Data Science";
      let createdAt = versionData.createdAt;
      let updatedAt = new Date();
      comOthersPoints[tagId] = initializeNewReputationData({
        tagId,
        tag,
        updatedAt,
        createdAt,
      });
      comOthersPoints[tagId].adminPoints = 0;
    }
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
    expect(writeCounts).toBeGreaterThan(0);
  });

  it("Should return write counts grater than 0 in case of comOthMonPoints", async () => {
    const comOthMonPoints: any = {};
    const { versionsColl }: any = getTypedCollections({ nodeType: "Concept" });
    const versionsDocs = await versionsColl.where("node", "==", node).get();
    for (let versionDoc of versionsDocs.docs) {
      const versionData = versionDoc.data();
      const tagId = versionData.tagIds[0];
      const tag = "Data Science";
      let createdAt = versionData.createdAt;
      let updatedAt = new Date();
      const { firstMonthDay } = firstWeekMonthDays(updatedAt);
      comOthMonPoints[tagId] = {
        [firstMonthDay]: initializeNewReputationData({ tagId, tag, updatedAt, createdAt }),
      };
      comOthMonPoints[tagId][firstMonthDay].adminPoints = 0;
    }
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
    expect(writeCounts).toBeGreaterThan(0);
  });

  it("Should return write counts grater than 0 in case of comOthWeekPoints", async () => {
    const comOthWeekPoints: any = {};
    const { versionsColl }: any = getTypedCollections({ nodeType: "Concept" });
    const versionsDocs = await versionsColl.where("node", "==", node).get();
    for (let versionDoc of versionsDocs.docs) {
      const versionData = versionDoc.data();
      const tagId = versionData.tagIds[0];
      const tag = "Data Science";
      let createdAt = versionData.createdAt;
      let updatedAt = new Date();
      const { firstWeekDay } = firstWeekMonthDays(updatedAt);
      comOthWeekPoints[tagId] = {
        [firstWeekDay]: initializeNewReputationData({ tagId, tag, updatedAt, createdAt }),
      };
      comOthWeekPoints[tagId][firstWeekDay].adminPoints = 0;
    }
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
    expect(writeCounts).toBeGreaterThan(0);
  });
});
