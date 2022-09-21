import { db } from "../../src/lib/firestoreServer/admin";
import { getTypedCollections, initializeNewReputationData,rewriteReputationDocs } from "../../src/utils";
import { firstWeekMonthDays } from "../../src/utils";
import { conceptVersionsData } from "../../testUtils/mockCollections";

describe("rewriteReputationDocs", () => {
  let node = "OR8UsmsxmeExHG8ekkIY";
  beforeEach(async () => {
    await conceptVersionsData.populate();
  });

  afterEach(async () => {
    await conceptVersionsData.clean();
  });

  it("Should return write counts grater than 0 in case of reputations", async () => {
    const reputations: any = {};
    const { versionsColl }: any = getTypedCollections({ nodeType: "Concept" });
    const versionsDocs = await versionsColl.where("node", "==", node).get();
    for (let versionDoc of versionsDocs.docs) {
      const versionData = versionDoc.data();
      const tagId = versionData.tagIds[0];
      const tag = "Data Science";
      const proposer = versionData.proposer;
      let createdAt = versionData.createdAt;
      let updatedAt = new Date();
      reputations[tagId] = {
        // { { tagId, tag, updatedAt, createdAt } }
        [proposer]: initializeNewReputationData({ tagId, tag, updatedAt, createdAt }),
      };
    }
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
    expect(writeCounts).toBeGreaterThan(0);
  });

  it("Should return write counts grater than 0 in case of reputations", async () => {
    const reputations: any = {};
    const { versionsColl }: any = getTypedCollections({ nodeType: "Concept" });
    const versionsDocs = await versionsColl.where("node", "==", node).get();
    for (let versionDoc of versionsDocs.docs) {
      const versionData = versionDoc.data();
      const tagId = versionData.tagIds[0];
      const tag = "Data Science";
      const proposer = versionData.proposer;
      let createdAt = versionData.createdAt;
      let updatedAt = new Date();
      reputations[tagId] = {
        // { { tagId, tag, updatedAt, createdAt } }
        [proposer]: initializeNewReputationData({ tagId, tag, updatedAt, createdAt }),
      };
    }
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
    expect(writeCounts).toBeGreaterThan(0);
  });

  it("Should return write counts grater than 0 in case of monthlyReputations", async () => {
    const monthlyReputations: any = {};
    const { versionsColl }: any = getTypedCollections({ nodeType: "Concept" });
    const versionsDocs = await versionsColl.where("node", "==", node).get();
    for (let versionDoc of versionsDocs.docs) {
      const versionData = versionDoc.data();
      const tagId = versionData.tagIds[0];
      const tag = "Data Science";
      const proposer = versionData.proposer;
      let createdAt = versionData.createdAt;
      let updatedAt = new Date();
      const { firstMonthDay } = firstWeekMonthDays(updatedAt);
      monthlyReputations[tagId] = {
        [proposer]: {
          [firstMonthDay]: initializeNewReputationData({ tagId, tag, updatedAt, createdAt }),
        },
      };
    }
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
    expect(writeCounts).toBeGreaterThan(0);
  });

  it("Should return write counts grater than 0 in case of weeklyReputations", async () => {
    const weeklyReputations: any = {};
    const { versionsColl }: any = getTypedCollections({ nodeType: "Concept" });
    const versionsDocs = await versionsColl.where("node", "==", node).get();
    for (let versionDoc of versionsDocs.docs) {
      const versionData = versionDoc.data();
      const tagId = versionData.tagIds[0];
      const tag = "Data Science";
      const proposer = versionData.proposer;
      let createdAt = versionData.createdAt;
      let updatedAt = new Date();
      const { firstWeekDay } = firstWeekMonthDays(updatedAt);
      weeklyReputations[tagId] = {
        [proposer]: {
          [firstWeekDay]: initializeNewReputationData({ tagId, tag, updatedAt, createdAt }),
        },
      };
    }
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
    expect(writeCounts).toBeGreaterThan(0);
  });

  it("Should return write counts grater than 0 in case of othersReputations", async () => {
    const othersReputations: any = {};
    const { versionsColl }: any = getTypedCollections({ nodeType: "Concept" });
    const versionsDocs = await versionsColl.where("node", "==", node).get();
    for (let versionDoc of versionsDocs.docs) {
      const versionData = versionDoc.data();
      const tagId = versionData.tagIds[0];
      const tag = "Data Science";
      const proposer = versionData.proposer;
      let createdAt = versionData.createdAt;
      let updatedAt = new Date();
      othersReputations[tagId] = {
        [proposer]: initializeNewReputationData({ tagId, tag, updatedAt, createdAt }),
      };
    }
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
    expect(writeCounts).toBeGreaterThan(0);
  });

  it("Should return write counts grater than 0 in case of othMonReputations", async () => {
    const othMonReputations: any = {};
    const { versionsColl }: any = getTypedCollections({ nodeType: "Concept" });
    const versionsDocs = await versionsColl.where("node", "==", node).get();
    for (let versionDoc of versionsDocs.docs) {
      const versionData = versionDoc.data();
      const tagId = versionData.tagIds[0];
      const tag = "Data Science";
      const proposer = versionData.proposer;
      let createdAt = versionData.createdAt;
      let updatedAt = new Date();
      const { firstMonthDay } = firstWeekMonthDays(updatedAt);
      othMonReputations[tagId] = {
        [proposer]: {
          [firstMonthDay]: initializeNewReputationData({ tagId, tag, updatedAt, createdAt }),
        },
      };
    }
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
    expect(writeCounts).toBeGreaterThan(0);
  });

  it("Should return write counts grater than 0 in case of othWeekReputations", async () => {
    const othWeekReputations: any = {};
    const { versionsColl }: any = getTypedCollections({ nodeType: "Concept" });
    const versionsDocs = await versionsColl.where("node", "==", node).get();
    for (let versionDoc of versionsDocs.docs) {
      const versionData = versionDoc.data();
      const tagId = versionData.tagIds[0];
      const tag = "Data Science";
      const proposer = versionData.proposer;
      let createdAt = versionData.createdAt;
      let updatedAt = new Date();
      const { firstWeekDay } = firstWeekMonthDays(updatedAt);
      othWeekReputations[tagId] = {
        [proposer]: {
          [firstWeekDay]: initializeNewReputationData({ tagId, tag, updatedAt, createdAt }),
        },
      };
    }
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
    expect(writeCounts).toBeGreaterThan(0);
  });
});
