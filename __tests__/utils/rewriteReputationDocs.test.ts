import { commitBatch, db } from "../../src/lib/firestoreServer/admin";
import { getTypedCollections, initializeNewReputationData, rewriteReputationDocs } from "../../src/utils";
import { firstWeekMonthDays } from "../../src/utils";
import {
  conceptVersionsData,
  monthlyReputationsData,
  othersReputationsData,
  othMonReputationsData,
  othWeekReputationsData,
  reputationsData,
  weeklyReputationsData,
} from "../../testUtils/mockCollections";

describe("rewriteReputationDocs", () => {
  let node = "OR8UsmsxmeExHG8ekkIY";

  const collects = [
    conceptVersionsData,
    monthlyReputationsData,
    othMonReputationsData,
    othWeekReputationsData,
    reputationsData,
    othersReputationsData,
    weeklyReputationsData,
  ];

  beforeEach(async () => {
    await Promise.all(collects.map(collect => collect.populate()));
  });

  afterEach(async () => {
    await Promise.all(collects.map(collect => collect.clean()));
  });

  it("Should return write counts grater than 0 in case of reputations", async () => {
    const reputations: any = {};
    const { versionsColl }: any = getTypedCollections({ nodeType: "Concept" });
    const versionsDocs = await versionsColl.where("node", "==", node).get();
    const tagId = versionsDocs.docs[0].data().tagIds[0];
    const tag = "Data Science";
    const proposer = versionsDocs.docs[0].data().proposer;
    let createdAt = versionsDocs.docs[0].data().createdAt;
    let updatedAt = new Date();
    reputations[tagId] = {
      // { { tagId, tag, updatedAt, createdAt } }
      [proposer]: initializeNewReputationData({ tagId, tag, updatedAt, createdAt }),
    };
    reputations[tagId][proposer].totalPoints = 1000;
    let batch = db.batch();
    let writeCounts = 0;
    let reputationsType = "reputations";
    let reputationsDict = reputations;
    [batch, writeCounts] = await rewriteReputationDocs({
      batch,
      reputationsType,
      reputationsDict,
      writeCounts,
    });
    await commitBatch(batch);
    const comPointsDocs: any = await db.collection("reputations").where("tagId", "==", tagId).get();
    expect(writeCounts).toBeGreaterThan(0);
    expect(comPointsDocs.docs[0].data().totalPoints).toEqual(1000);
  });

  it("Should return write counts grater than 0 in case of monthlyReputations", async () => {
    const monthlyReputations: any = {};
    const { versionsColl }: any = getTypedCollections({ nodeType: "Concept" });
    const versionsDocs = await versionsColl.where("node", "==", node).get();
    const tagId = versionsDocs.docs[0].data().tagIds[0];
    const tag = "Data Science";
    const proposer = versionsDocs.docs[0].data().proposer;
    let createdAt = versionsDocs.docs[0].data().createdAt;
    let updatedAt = new Date();
    const { firstMonthDay } = firstWeekMonthDays(updatedAt);
    monthlyReputations[tagId] = {
      [proposer]: {
        [firstMonthDay]: initializeNewReputationData({ tagId, tag, updatedAt, createdAt }),
      },
    };
    monthlyReputations[tagId][proposer][firstMonthDay].totalPoints = 1000;
    let batch = db.batch();
    let writeCounts = 0;
    let reputationsType = "monthlyReputations";
    let reputationsDict = monthlyReputations;
    [batch, writeCounts] = await rewriteReputationDocs({
      batch,
      reputationsType,
      reputationsDict,
      writeCounts,
    });
    await commitBatch(batch);
    const comPointsDocs: any = await db.collection("monthlyReputations").where("tagId", "==", tagId).get();
    expect(writeCounts).toBeGreaterThan(0);
    expect(comPointsDocs.docs[0].data().totalPoints).toEqual(1000);
  });

  it("Should return write counts grater than 0 in case of weeklyReputations", async () => {
    const weeklyReputations: any = {};
    const { versionsColl }: any = getTypedCollections({ nodeType: "Concept" });
    const versionsDocs = await versionsColl.where("node", "==", node).get();
    const tagId = versionsDocs.docs[0].data().tagIds[0];
    const tag = "Data Science";
    const proposer = versionsDocs.docs[0].data().proposer;
    let createdAt = versionsDocs.docs[0].data().createdAt;
    let updatedAt = new Date();
    const { firstWeekDay } = firstWeekMonthDays(updatedAt);
    weeklyReputations[tagId] = {
      [proposer]: {
        [firstWeekDay]: initializeNewReputationData({ tagId, tag, updatedAt, createdAt }),
      },
    };
    weeklyReputations[tagId][proposer][firstWeekDay].totalPoints = 1000;
    let batch = db.batch();
    let writeCounts = 0;
    let reputationsType = "weeklyReputations";
    let reputationsDict = weeklyReputations;
    [batch, writeCounts] = await rewriteReputationDocs({
      batch,
      reputationsType,
      reputationsDict,
      writeCounts,
    });
    await commitBatch(batch);
    const comPointsDocs: any = await db.collection("weeklyReputations").where("tagId", "==", tagId).get();
    expect(writeCounts).toBeGreaterThan(0);
    expect(comPointsDocs.docs[0].data().totalPoints).toEqual(1000);
  });

  it("Should return write counts grater than 0 in case of othersReputations", async () => {
    const othersReputations: any = {};
    const { versionsColl }: any = getTypedCollections({ nodeType: "Concept" });
    const versionsDocs = await versionsColl.where("node", "==", node).get();
    const tagId = versionsDocs.docs[0].data().tagIds[0];
    const tag = "Data Science";
    const proposer = versionsDocs.docs[0].data().proposer;
    let createdAt = versionsDocs.docs[0].data().createdAt;
    let updatedAt = new Date();
    othersReputations[tagId] = {
      [proposer]: initializeNewReputationData({ tagId, tag, updatedAt, createdAt }),
    };
    othersReputations[tagId][proposer].totalPoints = 1000;
    let batch = db.batch();
    let writeCounts = 0;
    let reputationsType = "othersReputations";
    let reputationsDict = othersReputations;
    [batch, writeCounts] = await rewriteReputationDocs({
      batch,
      reputationsType,
      reputationsDict,
      writeCounts,
    });
    await commitBatch(batch);
    const comPointsDocs: any = await db.collection("othersReputations").where("tagId", "==", tagId).get();
    expect(writeCounts).toBeGreaterThan(0);
    expect(comPointsDocs.docs[0].data().totalPoints).toEqual(1000);
  });

  it("Should return write counts grater than 0 in case of othMonReputations", async () => {
    const othMonReputations: any = {};
    const { versionsColl }: any = getTypedCollections({ nodeType: "Concept" });
    const versionsDocs = await versionsColl.where("node", "==", node).get();
    const tagId = versionsDocs.docs[0].data().tagIds[0];
    const tag = "Data Science";
    const proposer = versionsDocs.docs[0].data().proposer;
    let createdAt = versionsDocs.docs[0].data().createdAt;
    let updatedAt = new Date();
    const { firstMonthDay } = firstWeekMonthDays(updatedAt);
    othMonReputations[tagId] = {
      [proposer]: {
        [firstMonthDay]: initializeNewReputationData({ tagId, tag, updatedAt, createdAt }),
      },
    };
    othMonReputations[tagId][proposer][firstMonthDay].totalPoints = 1000;
    let batch = db.batch();
    let writeCounts = 0;
    let reputationsType = "othMonReputations";
    let reputationsDict = othMonReputations;
    [batch, writeCounts] = await rewriteReputationDocs({
      batch,
      reputationsType,
      reputationsDict,
      writeCounts,
    });
    await commitBatch(batch);
    const comPointsDocs: any = await db.collection("othMonReputations").where("tagId", "==", tagId).get();
    expect(writeCounts).toBeGreaterThan(0);
    expect(comPointsDocs.docs[0].data().totalPoints).toEqual(1000);
  });

  it("Should return write counts grater than 0 in case of othWeekReputations", async () => {
    const othWeekReputations: any = {};
    const { versionsColl }: any = getTypedCollections({ nodeType: "Concept" });
    const versionsDocs = await versionsColl.where("node", "==", node).get();
    const tagId = versionsDocs.docs[0].data().tagIds[0];
    const tag = "Data Science";
    const proposer = versionsDocs.docs[0].data().proposer;
    let createdAt = versionsDocs.docs[0].data().createdAt;
    let updatedAt = new Date();
    const { firstWeekDay } = firstWeekMonthDays(updatedAt);
    othWeekReputations[tagId] = {
      [proposer]: {
        [firstWeekDay]: initializeNewReputationData({ tagId, tag, updatedAt, createdAt }),
      },
    };
    othWeekReputations[tagId][proposer][firstWeekDay].totalPoints = 1000;
    let batch = db.batch();
    let writeCounts = 0;
    let reputationsType = "othWeekReputations";
    let reputationsDict = othWeekReputations;
    [batch, writeCounts] = await rewriteReputationDocs({
      batch,
      reputationsType,
      reputationsDict,
      writeCounts,
    });
    await commitBatch(batch);
    const comPointsDocs: any = await db.collection("othWeekReputations").where("tagId", "==", tagId).get();
    expect(writeCounts).toBeGreaterThan(0);
    expect(comPointsDocs.docs[0].data().totalPoints).toEqual(1000);
  });
});
