import { checkRestartBatchWriteCounts, commitBatch, db } from "../../../src/lib/firestoreServer/admin";
import { IComReputationUpdates, updateReputation } from "../../../src/utils/reputations";
import {
  comMonthlyPointsData,
  comOthersPointsData,
  comOthMonPointsData,
  comOthWeekPointsData,
  comPointsData,
  comWeeklyPointsData,
  conceptVersionCommentsData,
  conceptVersionsData,
  monthlyReputationsData,
  nodesData,
  othersReputationsData,
  othMonReputationsData,
  othWeekReputationsData,
  reputationsData,
  userConceptVersionCommentsData,
  userConceptVersionsData,
  usersData,
  weeklyReputationsData,
} from "../../../testUtils/mockCollections";

describe("updateReputation", () => {
  const positiveFields = [
    // for Concept nodes
    "cnCorrects",
    "cnInst",
    // for Code nodes
    "cdCorrects",
    "cdInst",
    // for Question nodes
    "qCorrects",
    "qInst",
    //  for Profile nodes
    "pCorrects",
    "pInst",
    //  for Sequel nodes
    "sCorrects",
    "sInst",
    //  for Advertisement nodes
    "aCorrects",
    "aInst",
    //  for Reference nodes
    "rfCorrects",
    "rfInst",
    //  for News nodes
    "nCorrects",
    "nInst",
    //  for Idea nodes
    "iCorrects",
    "iInst",
    //  for Relation nodes
    "mCorrects",
    "mInst",
  ];

  const negativeFields = [
    // for Concept nodes
    "cnWrongs",
    // for Code nodes
    "cdWrongs",
    // for Question nodes
    "qWrongs",
    //  for Profile nodes
    "pWrongs",
    //  for Sequel nodes
    "sWrongs",
    //  for Advertisement nodes
    "aWrongs",
    //  for Reference nodes
    "rfWrongs",
    //  for News nodes
    "nWrongs",
    //  for Idea nodes
    "iWrongs",
    //  for Relation nodes
    "mWrongs",
  ];

  const communityPointCollections = ["comPoints", "comMonthlyPoints", "comWeeklyPoints"];
  const otherCommunityPointCollections = ["comOthersPoints", "comOthMonPoints", "comOthWeekPoints"];
  const reputationPointCollections = ["reputations", "monthlyReputations", "weeklyReputations"];
  const otherReputationPointCollections = ["othersReputations", "othMonReputations", "othWeekReputations"];

  const nodeType = "Concept";
  const tags = ["1Cademy"];
  const tagIds = ["r98BjyFDCe4YyLA3U8ZE"];

  const mockCollections = [
    comMonthlyPointsData,
    comOthersPointsData,
    comOthMonPointsData,
    comOthWeekPointsData,
    comPointsData,
    comWeeklyPointsData,
    reputationsData,
    weeklyReputationsData,
    monthlyReputationsData,
    othersReputationsData,
    othMonReputationsData,
    othWeekReputationsData,
    usersData,
    nodesData,
    conceptVersionsData,
    userConceptVersionsData,
    conceptVersionCommentsData,
    userConceptVersionCommentsData,
  ];

  beforeEach(async () => {
    await Promise.all(mockCollections.map(col => col.populate()));
  });
  afterEach(async () => {
    await Promise.all(mockCollections.map(col => col.clean()));
  });

  // 0, 1
  // 1, 0
  // -1, 1
  // 1, -1
  // 0, -1
  // -1, 0

  describe("Should update reputation in general collection only if voting himself (All Time, Monthly and Weekly)", () => {
    it("Voting for first time as Correct", async () => {
      // console.log((await db.collection("comPoints").where("tagId", "==", "r98BjyFDCe4YyLA3U8ZE").get()).docs[0].data(), "comPoints")
      let writeCounts = 0;
      let batch = db.batch();

      // uname is admin
      const { uname, imageUrl, chooseUname, fName, lName } = usersData.getData().find(user => user.uname === "1man");
      const fullname = `${fName} ${lName}`;
      const voter = uname;

      const reputationTypes: string[] = ["All Time", "Monthly", "Weekly", "Others", "Others Monthly", "Others Weekly"];
      const comReputationUpdates: IComReputationUpdates = {};

      const params = {
        batch,
        uname,
        imageUrl,
        fullname,
        chooseUname,
        tagIds,
        tags,
        nodeType,
        correctVal: 1,
        wrongVal: 0,
        instVal: 0, // not using yet feature
        ltermVal: 0, // incomplete feature
        ltermDayVal: 0, // incomplete feature
        voter,
        writeCounts,
        comReputationUpdates,
      };

      [batch, writeCounts] = await updateReputation(params);

      for (const tagId in comReputationUpdates) {
        for (const reputationType of reputationTypes) {
          if (!comReputationUpdates[tagId][reputationType]) continue;

          if (comReputationUpdates[tagId][reputationType].isNew) {
            batch.set(
              comReputationUpdates[tagId][reputationType].docRef,
              comReputationUpdates[tagId][reputationType].docData
            );
          } else {
            batch.update(
              comReputationUpdates[tagId][reputationType].docRef,
              comReputationUpdates[tagId][reputationType].docData
            );
          }
          [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
        }
      }

      await commitBatch(batch);

      // Validating

      // Community Points should only have +ve 1
      for (const comPointCol of communityPointCollections) {
        const comPointResult = await db.collection(comPointCol).where("tagId", "==", tagIds[0]).get();
        const comPointData = comPointResult.docs[0].data();
        const commPointsPVE = positiveFields.reduce((carry, field) => carry + parseFloat(comPointData[field]), 0);
        const commPointsNVE = negativeFields.reduce((carry, field) => carry + parseFloat(comPointData[field]), 0);
        expect(commPointsPVE).toEqual(1);
        expect(commPointsNVE).toEqual(0);
      }

      // Other Community Points shouldn't have any value as its user voting for himself
      for (const comPointCol of otherCommunityPointCollections) {
        const comPointResult = await db.collection(comPointCol).where("tagId", "==", tagIds[0]).get();
        const comPointData = comPointResult.docs[0].data();
        const commPointsPVE = positiveFields.reduce((carry, field) => carry + parseFloat(comPointData[field]), 0);
        const commPointsNVE = negativeFields.reduce((carry, field) => carry + parseFloat(comPointData[field]), 0);
        expect(commPointsPVE).toEqual(0);
        expect(commPointsNVE).toEqual(0);
      }

      // Reputation Points should only have +ve 1
      for (const repPointCol of reputationPointCollections) {
        const repPointResult = await db
          .collection(repPointCol)
          .where("uname", "==", uname)
          .where("tagId", "==", tagIds[0])
          .get();
        const repPointData = repPointResult.docs[0].data();
        const repPointsPVE = positiveFields.reduce((carry, field) => carry + parseFloat(repPointData[field]), 0);
        const repPointsNVE = negativeFields.reduce((carry, field) => carry + parseFloat(repPointData[field]), 0);
        expect(repPointsPVE).toEqual(1);
        expect(repPointsNVE).toEqual(0);
      }

      // Other Reputation Points should't have any value as its user voting for himself
      for (const repPointCol of otherReputationPointCollections) {
        const repPointResult = await db
          .collection(repPointCol)
          .where("uname", "==", uname)
          .where("tagId", "==", tagIds[0])
          .get();
        const repPointData = repPointResult.docs[0].data();
        const repPointsPVE = positiveFields.reduce((carry, field) => carry + parseFloat(repPointData[field]), 0);
        const repPointsNVE = negativeFields.reduce((carry, field) => carry + parseFloat(repPointData[field]), 0);
        expect(repPointsPVE).toEqual(0);
        expect(repPointsNVE).toEqual(0);
      }
    });

    it("Voting for first time as Wrong", async () => {
      // console.log((await db.collection("comPoints").where("tagId", "==", "r98BjyFDCe4YyLA3U8ZE").get()).docs[0].data(), "comPoints")
      let writeCounts = 0;
      let batch = db.batch();

      // uname is admin
      const { uname, imageUrl, chooseUname, fName, lName } = usersData.getData().find(user => user.uname === "1man");
      const fullname = `${fName} ${lName}`;
      const voter = uname;

      const reputationTypes: string[] = ["All Time", "Monthly", "Weekly", "Others", "Others Monthly", "Others Weekly"];
      const comReputationUpdates: IComReputationUpdates = {};

      const params = {
        batch,
        uname,
        imageUrl,
        fullname,
        chooseUname,
        tagIds,
        tags,
        nodeType,
        correctVal: 0,
        wrongVal: 1,
        instVal: 0, // not using yet feature
        ltermVal: 0, // incomplete feature
        ltermDayVal: 0, // incomplete feature
        voter,
        writeCounts,
        comReputationUpdates,
      };
      [batch, writeCounts] = await updateReputation(params);

      for (const tagId in comReputationUpdates) {
        for (const reputationType of reputationTypes) {
          if (!comReputationUpdates[tagId][reputationType]) continue;

          if (comReputationUpdates[tagId][reputationType].isNew) {
            batch.set(
              comReputationUpdates[tagId][reputationType].docRef,
              comReputationUpdates[tagId][reputationType].docData
            );
          } else {
            batch.update(
              comReputationUpdates[tagId][reputationType].docRef,
              comReputationUpdates[tagId][reputationType].docData
            );
          }
          [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
        }
      }

      await commitBatch(batch);

      // Validating

      // Community Points should only have 1 Downvote
      for (const comPointCol of communityPointCollections) {
        const comPointResult = await db.collection(comPointCol).where("tagId", "==", tagIds[0]).get();
        const comPointData = comPointResult.docs[0].data();
        const commPointsPVE = positiveFields.reduce((carry, field) => carry + parseFloat(comPointData[field]), 0);
        const commPointsNVE = negativeFields.reduce((carry, field) => carry + parseFloat(comPointData[field]), 0);
        expect(commPointsPVE).toEqual(0);
        expect(commPointsNVE).toEqual(1);
      }

      // Other Community Points shouldn't have any value as its user voting for himself
      for (const comPointCol of otherCommunityPointCollections) {
        const comPointResult = await db.collection(comPointCol).where("tagId", "==", tagIds[0]).get();
        const comPointData = comPointResult.docs[0].data();
        const commPointsPVE = positiveFields.reduce((carry, field) => carry + parseFloat(comPointData[field]), 0);
        const commPointsNVE = negativeFields.reduce((carry, field) => carry + parseFloat(comPointData[field]), 0);
        expect(commPointsPVE).toEqual(0);
        expect(commPointsNVE).toEqual(0);
      }

      // Reputation Points should only have 1 Downvote
      for (const repPointCol of reputationPointCollections) {
        const repPointResult = await db
          .collection(repPointCol)
          .where("uname", "==", uname)
          .where("tagId", "==", tagIds[0])
          .get();
        const repPointData = repPointResult.docs[0].data();
        const repPointsPVE = positiveFields.reduce((carry, field) => carry + parseFloat(repPointData[field]), 0);
        const repPointsNVE = negativeFields.reduce((carry, field) => carry + parseFloat(repPointData[field]), 0);
        expect(repPointsPVE).toEqual(0);
        expect(repPointsNVE).toEqual(1);
      }

      // Other Reputation Points should't have any value as its user voting for himself
      for (const repPointCol of otherReputationPointCollections) {
        const repPointResult = await db
          .collection(repPointCol)
          .where("uname", "==", uname)
          .where("tagId", "==", tagIds[0])
          .get();
        const repPointData = repPointResult.docs[0].data();
        const repPointsPVE = positiveFields.reduce((carry, field) => carry + parseFloat(repPointData[field]), 0);
        const repPointsNVE = negativeFields.reduce((carry, field) => carry + parseFloat(repPointData[field]), 0);
        expect(repPointsPVE).toEqual(0);
        expect(repPointsNVE).toEqual(0);
      }
    });

    it("Swtiching Vote from Correct to Wrong", async () => {
      let writeCounts = 0;
      let batch = db.batch();

      // uname is admin
      const { uname, imageUrl, chooseUname, fName, lName } = usersData.getData().find(user => user.uname === "1man");
      const fullname = `${fName} ${lName}`;
      const voter = uname;

      const reputationTypes: string[] = ["All Time", "Monthly", "Weekly", "Others", "Others Monthly", "Others Weekly"];
      const comReputationUpdates: IComReputationUpdates = {};

      const params = {
        batch,
        uname,
        imageUrl,
        fullname,
        chooseUname,
        tagIds,
        tags,
        nodeType,
        correctVal: -1,
        wrongVal: 1,
        instVal: 0, // not using yet feature
        ltermVal: 0, // incomplete feature
        ltermDayVal: 0, // incomplete feature
        voter,
        writeCounts,
        comReputationUpdates,
      };
      [batch, writeCounts] = await updateReputation(params);

      for (const tagId in comReputationUpdates) {
        for (const reputationType of reputationTypes) {
          if (!comReputationUpdates[tagId][reputationType]) continue;

          if (comReputationUpdates[tagId][reputationType].isNew) {
            batch.set(
              comReputationUpdates[tagId][reputationType].docRef,
              comReputationUpdates[tagId][reputationType].docData
            );
          } else {
            batch.update(
              comReputationUpdates[tagId][reputationType].docRef,
              comReputationUpdates[tagId][reputationType].docData
            );
          }
          [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
        }
      }

      await commitBatch(batch);

      // Validating

      // Community Points should only have -1 Upvote and 1 Downvote
      for (const comPointCol of communityPointCollections) {
        const comPointResult = await db.collection(comPointCol).where("tagId", "==", tagIds[0]).get();
        const comPointData = comPointResult.docs[0].data();
        const commPointsPVE = positiveFields.reduce((carry, field) => carry + parseFloat(comPointData[field]), 0);
        const commPointsNVE = negativeFields.reduce((carry, field) => carry + parseFloat(comPointData[field]), 0);
        expect(commPointsPVE).toEqual(-1);
        expect(commPointsNVE).toEqual(1);
      }

      // Other Community Points shouldn't have any value as its user voting for himself
      for (const comPointCol of otherCommunityPointCollections) {
        const comPointResult = await db.collection(comPointCol).where("tagId", "==", tagIds[0]).get();
        const comPointData = comPointResult.docs[0].data();
        const commPointsPVE = positiveFields.reduce((carry, field) => carry + parseFloat(comPointData[field]), 0);
        const commPointsNVE = negativeFields.reduce((carry, field) => carry + parseFloat(comPointData[field]), 0);
        expect(commPointsPVE).toEqual(0);
        expect(commPointsNVE).toEqual(0);
      }

      // Reputation Points should only have -1 Upvote and 1 Downvote
      for (const repPointCol of reputationPointCollections) {
        const repPointResult = await db
          .collection(repPointCol)
          .where("uname", "==", uname)
          .where("tagId", "==", tagIds[0])
          .get();
        const repPointData = repPointResult.docs[0].data();
        const repPointsPVE = positiveFields.reduce((carry, field) => carry + parseFloat(repPointData[field]), 0);
        const repPointsNVE = negativeFields.reduce((carry, field) => carry + parseFloat(repPointData[field]), 0);
        expect(repPointsPVE).toEqual(-1);
        expect(repPointsNVE).toEqual(1);
      }

      // Other Reputation Points should't have any value as its user voting for himself
      for (const repPointCol of otherReputationPointCollections) {
        const repPointResult = await db
          .collection(repPointCol)
          .where("uname", "==", uname)
          .where("tagId", "==", tagIds[0])
          .get();
        const repPointData = repPointResult.docs[0].data();
        const repPointsPVE = positiveFields.reduce((carry, field) => carry + parseFloat(repPointData[field]), 0);
        const repPointsNVE = negativeFields.reduce((carry, field) => carry + parseFloat(repPointData[field]), 0);
        expect(repPointsPVE).toEqual(0);
        expect(repPointsNVE).toEqual(0);
      }
    });

    it("Swtiching Vote from Wrong to Correct", async () => {
      let writeCounts = 0;
      let batch = db.batch();

      // uname is admin
      const { uname, imageUrl, chooseUname, fName, lName } = usersData.getData().find(user => user.uname === "1man");
      const fullname = `${fName} ${lName}`;
      const voter = uname;

      const reputationTypes: string[] = ["All Time", "Monthly", "Weekly", "Others", "Others Monthly", "Others Weekly"];
      const comReputationUpdates: IComReputationUpdates = {};

      const params = {
        batch,
        uname,
        imageUrl,
        fullname,
        chooseUname,
        tagIds,
        tags,
        nodeType,
        correctVal: 1,
        wrongVal: -1,
        instVal: 0, // not using yet feature
        ltermVal: 0, // incomplete feature
        ltermDayVal: 0, // incomplete feature
        voter,
        writeCounts,
        comReputationUpdates,
      };
      [batch, writeCounts] = await updateReputation(params);

      for (const tagId in comReputationUpdates) {
        for (const reputationType of reputationTypes) {
          if (!comReputationUpdates[tagId][reputationType]) continue;

          if (comReputationUpdates[tagId][reputationType].isNew) {
            batch.set(
              comReputationUpdates[tagId][reputationType].docRef,
              comReputationUpdates[tagId][reputationType].docData
            );
          } else {
            batch.update(
              comReputationUpdates[tagId][reputationType].docRef,
              comReputationUpdates[tagId][reputationType].docData
            );
          }
          [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
        }
      }

      await commitBatch(batch);

      // Validating

      // Community Points should only have 1 Upvote and -1 Downvote
      for (const comPointCol of communityPointCollections) {
        const comPointResult = await db.collection(comPointCol).where("tagId", "==", tagIds[0]).get();
        const comPointData = comPointResult.docs[0].data();
        const commPointsPVE = positiveFields.reduce((carry, field) => carry + parseFloat(comPointData[field]), 0);
        const commPointsNVE = negativeFields.reduce((carry, field) => carry + parseFloat(comPointData[field]), 0);
        expect(commPointsPVE).toEqual(1);
        expect(commPointsNVE).toEqual(-1);
      }

      // Other Community Points shouldn't have any value as its user voting for himself
      for (const comPointCol of otherCommunityPointCollections) {
        const comPointResult = await db.collection(comPointCol).where("tagId", "==", tagIds[0]).get();
        const comPointData = comPointResult.docs[0].data();
        const commPointsPVE = positiveFields.reduce((carry, field) => carry + parseFloat(comPointData[field]), 0);
        const commPointsNVE = negativeFields.reduce((carry, field) => carry + parseFloat(comPointData[field]), 0);
        expect(commPointsPVE).toEqual(0);
        expect(commPointsNVE).toEqual(0);
      }

      // Reputation Points should only have 1 Upvote and -1 Downvote
      for (const repPointCol of reputationPointCollections) {
        const repPointResult = await db
          .collection(repPointCol)
          .where("uname", "==", uname)
          .where("tagId", "==", tagIds[0])
          .get();
        const repPointData = repPointResult.docs[0].data();
        const repPointsPVE = positiveFields.reduce((carry, field) => carry + parseFloat(repPointData[field]), 0);
        const repPointsNVE = negativeFields.reduce((carry, field) => carry + parseFloat(repPointData[field]), 0);
        expect(repPointsPVE).toEqual(1);
        expect(repPointsNVE).toEqual(-1);
      }

      // Other Reputation Points should't have any value as its user voting for himself
      for (const repPointCol of otherReputationPointCollections) {
        const repPointResult = await db
          .collection(repPointCol)
          .where("uname", "==", uname)
          .where("tagId", "==", tagIds[0])
          .get();
        const repPointData = repPointResult.docs[0].data();
        const repPointsPVE = positiveFields.reduce((carry, field) => carry + parseFloat(repPointData[field]), 0);
        const repPointsNVE = negativeFields.reduce((carry, field) => carry + parseFloat(repPointData[field]), 0);
        expect(repPointsPVE).toEqual(0);
        expect(repPointsNVE).toEqual(0);
      }
    });

    it("Removing Vote as Wrong", async () => {
      let writeCounts = 0;
      let batch = db.batch();

      // uname is admin
      const { uname, imageUrl, chooseUname, fName, lName } = usersData.getData().find(user => user.uname === "1man");
      const fullname = `${fName} ${lName}`;
      const voter = uname;

      const reputationTypes: string[] = ["All Time", "Monthly", "Weekly", "Others", "Others Monthly", "Others Weekly"];
      const comReputationUpdates: IComReputationUpdates = {};

      const params = {
        batch,
        uname,
        imageUrl,
        fullname,
        chooseUname,
        tagIds,
        tags,
        nodeType,
        correctVal: 0,
        wrongVal: -1,
        instVal: 0, // not using yet feature
        ltermVal: 0, // incomplete feature
        ltermDayVal: 0, // incomplete feature
        voter,
        writeCounts,
        comReputationUpdates,
      };
      [batch, writeCounts] = await updateReputation(params);

      for (const tagId in comReputationUpdates) {
        for (const reputationType of reputationTypes) {
          if (!comReputationUpdates[tagId][reputationType]) continue;

          if (comReputationUpdates[tagId][reputationType].isNew) {
            batch.set(
              comReputationUpdates[tagId][reputationType].docRef,
              comReputationUpdates[tagId][reputationType].docData
            );
          } else {
            batch.update(
              comReputationUpdates[tagId][reputationType].docRef,
              comReputationUpdates[tagId][reputationType].docData
            );
          }
          [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
        }
      }

      await commitBatch(batch);

      // Validating

      // Community Points should only have 0 Upvote and -1 Downvote
      for (const comPointCol of communityPointCollections) {
        const comPointResult = await db.collection(comPointCol).where("tagId", "==", tagIds[0]).get();
        const comPointData = comPointResult.docs[0].data();
        const commPointsPVE = positiveFields.reduce((carry, field) => carry + parseFloat(comPointData[field]), 0);
        const commPointsNVE = negativeFields.reduce((carry, field) => carry + parseFloat(comPointData[field]), 0);
        expect(commPointsPVE).toEqual(0);
        expect(commPointsNVE).toEqual(-1);
      }

      // Other Community Points shouldn't have any value as its user voting for himself
      for (const comPointCol of otherCommunityPointCollections) {
        const comPointResult = await db.collection(comPointCol).where("tagId", "==", tagIds[0]).get();
        const comPointData = comPointResult.docs[0].data();
        const commPointsPVE = positiveFields.reduce((carry, field) => carry + parseFloat(comPointData[field]), 0);
        const commPointsNVE = negativeFields.reduce((carry, field) => carry + parseFloat(comPointData[field]), 0);
        expect(commPointsPVE).toEqual(0);
        expect(commPointsNVE).toEqual(0);
      }

      // Reputation Points should only have 0 Upvote and -1 Downvote
      for (const repPointCol of reputationPointCollections) {
        const repPointResult = await db
          .collection(repPointCol)
          .where("uname", "==", uname)
          .where("tagId", "==", tagIds[0])
          .get();
        const repPointData = repPointResult.docs[0].data();
        const repPointsPVE = positiveFields.reduce((carry, field) => carry + parseFloat(repPointData[field]), 0);
        const repPointsNVE = negativeFields.reduce((carry, field) => carry + parseFloat(repPointData[field]), 0);
        expect(repPointsPVE).toEqual(0);
        expect(repPointsNVE).toEqual(-1);
      }

      // Other Reputation Points should't have any value as its user voting for himself
      for (const repPointCol of otherReputationPointCollections) {
        const repPointResult = await db
          .collection(repPointCol)
          .where("uname", "==", uname)
          .where("tagId", "==", tagIds[0])
          .get();
        const repPointData = repPointResult.docs[0].data();
        const repPointsPVE = positiveFields.reduce((carry, field) => carry + parseFloat(repPointData[field]), 0);
        const repPointsNVE = negativeFields.reduce((carry, field) => carry + parseFloat(repPointData[field]), 0);
        expect(repPointsPVE).toEqual(0);
        expect(repPointsNVE).toEqual(0);
      }
    });

    it("Removing Vote as Correct", async () => {
      let writeCounts = 0;
      let batch = db.batch();

      // uname is admin
      const { uname, imageUrl, chooseUname, fName, lName } = usersData.getData().find(user => user.uname === "1man");
      const fullname = `${fName} ${lName}`;
      const voter = uname;

      const reputationTypes: string[] = ["All Time", "Monthly", "Weekly", "Others", "Others Monthly", "Others Weekly"];
      const comReputationUpdates: IComReputationUpdates = {};

      const params = {
        batch,
        uname,
        imageUrl,
        fullname,
        chooseUname,
        tagIds,
        tags,
        nodeType,
        correctVal: -1,
        wrongVal: 0,
        instVal: 0, // not using yet feature
        ltermVal: 0, // incomplete feature
        ltermDayVal: 0, // incomplete feature
        voter,
        writeCounts,
        comReputationUpdates,
      };
      [batch, writeCounts] = await updateReputation(params);

      for (const tagId in comReputationUpdates) {
        for (const reputationType of reputationTypes) {
          if (!comReputationUpdates[tagId][reputationType]) continue;

          if (comReputationUpdates[tagId][reputationType].isNew) {
            batch.set(
              comReputationUpdates[tagId][reputationType].docRef,
              comReputationUpdates[tagId][reputationType].docData
            );
          } else {
            batch.update(
              comReputationUpdates[tagId][reputationType].docRef,
              comReputationUpdates[tagId][reputationType].docData
            );
          }
          [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
        }
      }

      await commitBatch(batch);

      // Validating

      // Community Points should only have 0 Upvote and -1 Downvote
      for (const comPointCol of communityPointCollections) {
        const comPointResult = await db.collection(comPointCol).where("tagId", "==", tagIds[0]).get();
        const comPointData = comPointResult.docs[0].data();
        const commPointsPVE = positiveFields.reduce((carry, field) => carry + parseFloat(comPointData[field]), 0);
        const commPointsNVE = negativeFields.reduce((carry, field) => carry + parseFloat(comPointData[field]), 0);
        expect(commPointsPVE).toEqual(-1);
        expect(commPointsNVE).toEqual(0);
      }

      // Other Community Points shouldn't have any value as its user voting for himself
      for (const comPointCol of otherCommunityPointCollections) {
        const comPointResult = await db.collection(comPointCol).where("tagId", "==", tagIds[0]).get();
        const comPointData = comPointResult.docs[0].data();
        const commPointsPVE = positiveFields.reduce((carry, field) => carry + parseFloat(comPointData[field]), 0);
        const commPointsNVE = negativeFields.reduce((carry, field) => carry + parseFloat(comPointData[field]), 0);
        expect(commPointsPVE).toEqual(0);
        expect(commPointsNVE).toEqual(0);
      }

      // Reputation Points should only have 0 Upvote and -1 Downvote
      for (const repPointCol of reputationPointCollections) {
        const repPointResult = await db
          .collection(repPointCol)
          .where("uname", "==", uname)
          .where("tagId", "==", tagIds[0])
          .get();
        const repPointData = repPointResult.docs[0].data();
        const repPointsPVE = positiveFields.reduce((carry, field) => carry + parseFloat(repPointData[field]), 0);
        const repPointsNVE = negativeFields.reduce((carry, field) => carry + parseFloat(repPointData[field]), 0);
        expect(repPointsPVE).toEqual(-1);
        expect(repPointsNVE).toEqual(0);
      }

      // Other Reputation Points should't have any value as its user voting for himself
      for (const repPointCol of otherReputationPointCollections) {
        const repPointResult = await db
          .collection(repPointCol)
          .where("uname", "==", uname)
          .where("tagId", "==", tagIds[0])
          .get();
        const repPointData = repPointResult.docs[0].data();
        const repPointsPVE = positiveFields.reduce((carry, field) => carry + parseFloat(repPointData[field]), 0);
        const repPointsNVE = negativeFields.reduce((carry, field) => carry + parseFloat(repPointData[field]), 0);
        expect(repPointsPVE).toEqual(0);
        expect(repPointsNVE).toEqual(0);
      }
    });
  });

  describe("Should update reputation in general and other collections (All Time, Monthly and Weekly)", () => {
    it("Voting for first time as Correct", async () => {
      let writeCounts = 0;
      let batch = db.batch();

      // uname is admin
      const { uname, imageUrl, chooseUname, fName, lName } = usersData.getData().find(user => user.uname === "1man");
      const fullname = `${fName} ${lName}`;
      const voter = "Ameer";

      const reputationTypes: string[] = ["All Time", "Monthly", "Weekly", "Others", "Others Monthly", "Others Weekly"];
      const comReputationUpdates: IComReputationUpdates = {};

      const params = {
        batch,
        uname,
        imageUrl,
        fullname,
        chooseUname,
        tagIds,
        tags,
        nodeType,
        correctVal: 1,
        wrongVal: 0,
        instVal: 0, // not using yet feature
        ltermVal: 0, // incomplete feature
        ltermDayVal: 0, // incomplete feature
        voter,
        writeCounts,
        comReputationUpdates,
      };
      [batch, writeCounts] = await updateReputation(params);

      for (const tagId in comReputationUpdates) {
        for (const reputationType of reputationTypes) {
          if (!comReputationUpdates[tagId][reputationType]) continue;

          if (comReputationUpdates[tagId][reputationType].isNew) {
            batch.set(
              comReputationUpdates[tagId][reputationType].docRef,
              comReputationUpdates[tagId][reputationType].docData
            );
          } else {
            batch.update(
              comReputationUpdates[tagId][reputationType].docRef,
              comReputationUpdates[tagId][reputationType].docData
            );
          }
          [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
        }
      }

      await commitBatch(batch);

      // Validating

      // Community Points should only have 1 Upvote
      for (const comPointCol of communityPointCollections) {
        const comPointResult = await db.collection(comPointCol).where("tagId", "==", tagIds[0]).get();
        const comPointData = comPointResult.docs[0].data();
        const commPointsPVE = positiveFields.reduce((carry, field) => carry + parseFloat(comPointData[field]), 0);
        const commPointsNVE = negativeFields.reduce((carry, field) => carry + parseFloat(comPointData[field]), 0);
        expect(commPointsPVE).toEqual(1);
        expect(commPointsNVE).toEqual(0);
      }

      // Other Community Points should only have 1 Upvote as user itn't voting for himself
      for (const comPointCol of otherCommunityPointCollections) {
        const comPointResult = await db.collection(comPointCol).where("tagId", "==", tagIds[0]).get();
        const comPointData = comPointResult.docs[0].data();
        const commPointsPVE = positiveFields.reduce((carry, field) => carry + parseFloat(comPointData[field]), 0);
        const commPointsNVE = negativeFields.reduce((carry, field) => carry + parseFloat(comPointData[field]), 0);
        expect(commPointsPVE).toEqual(1);
        expect(commPointsNVE).toEqual(0);
      }

      // Reputation Points should only have 1 Upvote
      for (const repPointCol of reputationPointCollections) {
        const repPointResult = await db
          .collection(repPointCol)
          .where("uname", "==", uname)
          .where("tagId", "==", tagIds[0])
          .get();
        const repPointData = repPointResult.docs[0].data();
        const repPointsPVE = positiveFields.reduce((carry, field) => carry + parseFloat(repPointData[field]), 0);
        const repPointsNVE = negativeFields.reduce((carry, field) => carry + parseFloat(repPointData[field]), 0);
        expect(repPointsPVE).toEqual(1);
        expect(repPointsNVE).toEqual(0);
      }

      // Other Reputation Points should only have 1 Upvote as user itn't voting for himself
      for (const repPointCol of otherReputationPointCollections) {
        const repPointResult = await db
          .collection(repPointCol)
          .where("uname", "==", uname)
          .where("tagId", "==", tagIds[0])
          .get();
        const repPointData = repPointResult.docs[0].data();
        const repPointsPVE = positiveFields.reduce((carry, field) => carry + parseFloat(repPointData[field]), 0);
        const repPointsNVE = negativeFields.reduce((carry, field) => carry + parseFloat(repPointData[field]), 0);
        expect(repPointsPVE).toEqual(1);
        expect(repPointsNVE).toEqual(0);
      }
    });

    it("Voting for first time as Wrong", async () => {
      let writeCounts = 0;
      let batch = db.batch();

      const reputationTypes: string[] = ["All Time", "Monthly", "Weekly", "Others", "Others Monthly", "Others Weekly"];
      const comReputationUpdates: IComReputationUpdates = {};

      // uname is admin
      const { uname, imageUrl, chooseUname, fName, lName } = usersData.getData().find(user => user.uname === "1man");
      const fullname = `${fName} ${lName}`;
      const voter = "Ameer";

      const params = {
        batch,
        uname,
        imageUrl,
        fullname,
        chooseUname,
        tagIds,
        tags,
        nodeType,
        correctVal: 0,
        wrongVal: 1,
        instVal: 0, // not using yet feature
        ltermVal: 0, // incomplete feature
        ltermDayVal: 0, // incomplete feature
        voter,
        writeCounts,
        comReputationUpdates,
      };
      [batch, writeCounts] = await updateReputation(params);

      for (const tagId in comReputationUpdates) {
        for (const reputationType of reputationTypes) {
          if (!comReputationUpdates[tagId][reputationType]) continue;

          if (comReputationUpdates[tagId][reputationType].isNew) {
            batch.set(
              comReputationUpdates[tagId][reputationType].docRef,
              comReputationUpdates[tagId][reputationType].docData
            );
          } else {
            batch.update(
              comReputationUpdates[tagId][reputationType].docRef,
              comReputationUpdates[tagId][reputationType].docData
            );
          }
          [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
        }
      }

      await commitBatch(batch);

      // Validating

      // Community Points should only have 1 Downvote
      for (const comPointCol of communityPointCollections) {
        const comPointResult = await db.collection(comPointCol).where("tagId", "==", tagIds[0]).get();
        const comPointData = comPointResult.docs[0].data();
        const commPointsPVE = positiveFields.reduce((carry, field) => carry + parseFloat(comPointData[field]), 0);
        const commPointsNVE = negativeFields.reduce((carry, field) => carry + parseFloat(comPointData[field]), 0);
        expect(commPointsPVE).toEqual(0);
        expect(commPointsNVE).toEqual(1);
      }

      // Other Reputation Points should only have 1 Downvote as user itn't voting for himself
      for (const comPointCol of otherCommunityPointCollections) {
        const comPointResult = await db.collection(comPointCol).where("tagId", "==", tagIds[0]).get();
        const comPointData = comPointResult.docs[0].data();
        const commPointsPVE = positiveFields.reduce((carry, field) => carry + parseFloat(comPointData[field]), 0);
        const commPointsNVE = negativeFields.reduce((carry, field) => carry + parseFloat(comPointData[field]), 0);
        expect(commPointsPVE).toEqual(0);
        expect(commPointsNVE).toEqual(1);
      }

      // Reputation Points should only have 1 Downvote
      for (const repPointCol of reputationPointCollections) {
        const repPointResult = await db
          .collection(repPointCol)
          .where("uname", "==", uname)
          .where("tagId", "==", tagIds[0])
          .get();
        const repPointData = repPointResult.docs[0].data();
        const repPointsPVE = positiveFields.reduce((carry, field) => carry + parseFloat(repPointData[field]), 0);
        const repPointsNVE = negativeFields.reduce((carry, field) => carry + parseFloat(repPointData[field]), 0);
        expect(repPointsPVE).toEqual(0);
        expect(repPointsNVE).toEqual(1);
      }

      // Other Reputation Points should only have 1 Downvote as user itn't voting for himself
      for (const repPointCol of otherReputationPointCollections) {
        const repPointResult = await db
          .collection(repPointCol)
          .where("uname", "==", uname)
          .where("tagId", "==", tagIds[0])
          .get();
        const repPointData = repPointResult.docs[0].data();
        const repPointsPVE = positiveFields.reduce((carry, field) => carry + parseFloat(repPointData[field]), 0);
        const repPointsNVE = negativeFields.reduce((carry, field) => carry + parseFloat(repPointData[field]), 0);
        expect(repPointsPVE).toEqual(0);
        expect(repPointsNVE).toEqual(1);
      }
    });

    it("Swtiching Vote from Correct to Wrong", async () => {
      let writeCounts = 0;
      let batch = db.batch();

      // uname is admin
      const { uname, imageUrl, chooseUname, fName, lName } = usersData.getData().find(user => user.uname === "1man");
      const fullname = `${fName} ${lName}`;
      const voter = uname;

      const reputationTypes: string[] = ["All Time", "Monthly", "Weekly", "Others", "Others Monthly", "Others Weekly"];
      const comReputationUpdates: IComReputationUpdates = {};

      const params = {
        batch,
        uname,
        imageUrl,
        fullname,
        chooseUname,
        tagIds,
        tags,
        nodeType,
        correctVal: -1,
        wrongVal: 1,
        instVal: 0, // not using yet feature
        ltermVal: 0, // incomplete feature
        ltermDayVal: 0, // incomplete feature
        voter,
        writeCounts,
        comReputationUpdates,
      };
      [batch, writeCounts] = await updateReputation(params);

      for (const tagId in comReputationUpdates) {
        for (const reputationType of reputationTypes) {
          if (!comReputationUpdates[tagId][reputationType]) continue;

          if (comReputationUpdates[tagId][reputationType].isNew) {
            batch.set(
              comReputationUpdates[tagId][reputationType].docRef,
              comReputationUpdates[tagId][reputationType].docData
            );
          } else {
            batch.update(
              comReputationUpdates[tagId][reputationType].docRef,
              comReputationUpdates[tagId][reputationType].docData
            );
          }
          [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
        }
      }

      await commitBatch(batch);

      // Validating

      // Community Points should only have -1 Upvote and 1 Downvote
      for (const comPointCol of communityPointCollections) {
        const comPointResult = await db.collection(comPointCol).where("tagId", "==", tagIds[0]).get();
        const comPointData = comPointResult.docs[0].data();
        const commPointsPVE = positiveFields.reduce((carry, field) => carry + parseFloat(comPointData[field]), 0);
        const commPointsNVE = negativeFields.reduce((carry, field) => carry + parseFloat(comPointData[field]), 0);
        expect(commPointsPVE).toEqual(-1);
        expect(commPointsNVE).toEqual(1);
      }

      // Other Community Points shouldn't have any value as its user voting for himself
      for (const comPointCol of otherCommunityPointCollections) {
        const comPointResult = await db.collection(comPointCol).where("tagId", "==", tagIds[0]).get();
        const comPointData = comPointResult.docs[0].data();
        const commPointsPVE = positiveFields.reduce((carry, field) => carry + parseFloat(comPointData[field]), 0);
        const commPointsNVE = negativeFields.reduce((carry, field) => carry + parseFloat(comPointData[field]), 0);
        expect(commPointsPVE).toEqual(0);
        expect(commPointsNVE).toEqual(0);
      }

      // Reputation Points should only have -1 Upvote and 1 Downvote
      for (const repPointCol of reputationPointCollections) {
        const repPointResult = await db
          .collection(repPointCol)
          .where("uname", "==", uname)
          .where("tagId", "==", tagIds[0])
          .get();
        const repPointData = repPointResult.docs[0].data();
        const repPointsPVE = positiveFields.reduce((carry, field) => carry + parseFloat(repPointData[field]), 0);
        const repPointsNVE = negativeFields.reduce((carry, field) => carry + parseFloat(repPointData[field]), 0);
        expect(repPointsPVE).toEqual(-1);
        expect(repPointsNVE).toEqual(1);
      }

      // Other Reputation Points should't have any value as its user voting for himself
      for (const repPointCol of otherReputationPointCollections) {
        const repPointResult = await db
          .collection(repPointCol)
          .where("uname", "==", uname)
          .where("tagId", "==", tagIds[0])
          .get();
        const repPointData = repPointResult.docs[0].data();
        const repPointsPVE = positiveFields.reduce((carry, field) => carry + parseFloat(repPointData[field]), 0);
        const repPointsNVE = negativeFields.reduce((carry, field) => carry + parseFloat(repPointData[field]), 0);
        expect(repPointsPVE).toEqual(0);
        expect(repPointsNVE).toEqual(0);
      }
    });

    it("Swtiching Vote from Wrong to Correct", async () => {
      let writeCounts = 0;
      let batch = db.batch();

      // uname is admin
      const { uname, imageUrl, chooseUname, fName, lName } = usersData.getData().find(user => user.uname === "1man");
      const fullname = `${fName} ${lName}`;
      const voter = "Ameer";

      const reputationTypes: string[] = ["All Time", "Monthly", "Weekly", "Others", "Others Monthly", "Others Weekly"];
      const comReputationUpdates: IComReputationUpdates = {};

      const params = {
        batch,
        uname,
        imageUrl,
        fullname,
        chooseUname,
        tagIds,
        tags,
        nodeType,
        correctVal: 1,
        wrongVal: -1,
        instVal: 0, // not using yet feature
        ltermVal: 0, // incomplete feature
        ltermDayVal: 0, // incomplete feature
        voter,
        writeCounts,
        comReputationUpdates,
      };
      [batch, writeCounts] = await updateReputation(params);

      for (const tagId in comReputationUpdates) {
        for (const reputationType of reputationTypes) {
          if (!comReputationUpdates[tagId][reputationType]) continue;

          if (comReputationUpdates[tagId][reputationType].isNew) {
            batch.set(
              comReputationUpdates[tagId][reputationType].docRef,
              comReputationUpdates[tagId][reputationType].docData
            );
          } else {
            batch.update(
              comReputationUpdates[tagId][reputationType].docRef,
              comReputationUpdates[tagId][reputationType].docData
            );
          }
          [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
        }
      }

      await commitBatch(batch);

      // Validating

      // Community Points should only have 1 Upvote and -1 Downvote
      for (const comPointCol of communityPointCollections) {
        const comPointResult = await db.collection(comPointCol).where("tagId", "==", tagIds[0]).get();
        const comPointData = comPointResult.docs[0].data();
        const commPointsPVE = positiveFields.reduce((carry, field) => carry + parseFloat(comPointData[field]), 0);
        const commPointsNVE = negativeFields.reduce((carry, field) => carry + parseFloat(comPointData[field]), 0);
        expect(commPointsPVE).toEqual(1);
        expect(commPointsNVE).toEqual(-1);
      }

      // Other Community Points should only have 1 Upvote and -1 Downvote
      for (const comPointCol of otherCommunityPointCollections) {
        const comPointResult = await db.collection(comPointCol).where("tagId", "==", tagIds[0]).get();
        const comPointData = comPointResult.docs[0].data();
        const commPointsPVE = positiveFields.reduce((carry, field) => carry + parseFloat(comPointData[field]), 0);
        const commPointsNVE = negativeFields.reduce((carry, field) => carry + parseFloat(comPointData[field]), 0);
        expect(commPointsPVE).toEqual(1);
        expect(commPointsNVE).toEqual(-1);
      }

      // Reputation Points should only have 1 Upvote and -1 Downvote
      for (const repPointCol of reputationPointCollections) {
        const repPointResult = await db
          .collection(repPointCol)
          .where("uname", "==", uname)
          .where("tagId", "==", tagIds[0])
          .get();
        const repPointData = repPointResult.docs[0].data();
        const repPointsPVE = positiveFields.reduce((carry, field) => carry + parseFloat(repPointData[field]), 0);
        const repPointsNVE = negativeFields.reduce((carry, field) => carry + parseFloat(repPointData[field]), 0);
        expect(repPointsPVE).toEqual(1);
        expect(repPointsNVE).toEqual(-1);
      }

      // Other Reputation Points should only have 1 Upvote and -1 Downvote
      for (const repPointCol of otherReputationPointCollections) {
        const repPointResult = await db
          .collection(repPointCol)
          .where("uname", "==", uname)
          .where("tagId", "==", tagIds[0])
          .get();
        const repPointData = repPointResult.docs[0].data();
        const repPointsPVE = positiveFields.reduce((carry, field) => carry + parseFloat(repPointData[field]), 0);
        const repPointsNVE = negativeFields.reduce((carry, field) => carry + parseFloat(repPointData[field]), 0);
        expect(repPointsPVE).toEqual(1);
        expect(repPointsNVE).toEqual(-1);
      }
    });

    it("Removing Vote as Wrong", async () => {
      let writeCounts = 0;
      let batch = db.batch();

      // uname is admin
      const { uname, imageUrl, chooseUname, fName, lName } = usersData.getData().find(user => user.uname === "1man");
      const fullname = `${fName} ${lName}`;
      const voter = "Ameer";

      const reputationTypes: string[] = ["All Time", "Monthly", "Weekly", "Others", "Others Monthly", "Others Weekly"];
      const comReputationUpdates: IComReputationUpdates = {};

      const params = {
        batch,
        uname,
        imageUrl,
        fullname,
        chooseUname,
        tagIds,
        tags,
        nodeType,
        correctVal: 0,
        wrongVal: -1,
        instVal: 0, // not using yet feature
        ltermVal: 0, // incomplete feature
        ltermDayVal: 0, // incomplete feature
        voter,
        writeCounts,
        comReputationUpdates,
      };

      [batch, writeCounts] = await updateReputation(params);

      for (const tagId in comReputationUpdates) {
        for (const reputationType of reputationTypes) {
          if (!comReputationUpdates[tagId][reputationType]) continue;

          if (comReputationUpdates[tagId][reputationType].isNew) {
            batch.set(
              comReputationUpdates[tagId][reputationType].docRef,
              comReputationUpdates[tagId][reputationType].docData
            );
          } else {
            batch.update(
              comReputationUpdates[tagId][reputationType].docRef,
              comReputationUpdates[tagId][reputationType].docData
            );
          }
          [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
        }
      }

      await commitBatch(batch);

      // Validating

      // Community Points should only have 0 Upvote and -1 Downvote
      for (const comPointCol of communityPointCollections) {
        const comPointResult = await db.collection(comPointCol).where("tagId", "==", tagIds[0]).get();
        const comPointData = comPointResult.docs[0].data();
        const commPointsPVE = positiveFields.reduce((carry, field) => carry + parseFloat(comPointData[field]), 0);
        const commPointsNVE = negativeFields.reduce((carry, field) => carry + parseFloat(comPointData[field]), 0);
        expect(commPointsPVE).toEqual(0);
        expect(commPointsNVE).toEqual(-1);
      }

      // Other Community Points should only have 0 Upvote and -1 Downvote
      for (const comPointCol of otherCommunityPointCollections) {
        const comPointResult = await db.collection(comPointCol).where("tagId", "==", tagIds[0]).get();
        const comPointData = comPointResult.docs[0].data();
        const commPointsPVE = positiveFields.reduce((carry, field) => carry + parseFloat(comPointData[field]), 0);
        const commPointsNVE = negativeFields.reduce((carry, field) => carry + parseFloat(comPointData[field]), 0);
        expect(commPointsPVE).toEqual(0);
        expect(commPointsNVE).toEqual(-1);
      }

      // Reputation Points should only have 0 Upvote and -1 Downvote
      for (const repPointCol of reputationPointCollections) {
        const repPointResult = await db
          .collection(repPointCol)
          .where("uname", "==", uname)
          .where("tagId", "==", tagIds[0])
          .get();
        const repPointData = repPointResult.docs[0].data();
        const repPointsPVE = positiveFields.reduce((carry, field) => carry + parseFloat(repPointData[field]), 0);
        const repPointsNVE = negativeFields.reduce((carry, field) => carry + parseFloat(repPointData[field]), 0);
        expect(repPointsPVE).toEqual(0);
        expect(repPointsNVE).toEqual(-1);
      }

      // Other Reputation Points should only have 0 Upvote and -1 Downvote
      for (const repPointCol of otherReputationPointCollections) {
        const repPointResult = await db
          .collection(repPointCol)
          .where("uname", "==", uname)
          .where("tagId", "==", tagIds[0])
          .get();
        const repPointData = repPointResult.docs[0].data();
        const repPointsPVE = positiveFields.reduce((carry, field) => carry + parseFloat(repPointData[field]), 0);
        const repPointsNVE = negativeFields.reduce((carry, field) => carry + parseFloat(repPointData[field]), 0);
        expect(repPointsPVE).toEqual(0);
        expect(repPointsNVE).toEqual(-1);
      }
    });

    it("Removing Vote as Correct", async () => {
      let writeCounts = 0;
      let batch = db.batch();

      // uname is admin
      const { uname, imageUrl, chooseUname, fName, lName } = usersData.getData().find(user => user.uname === "1man");
      const fullname = `${fName} ${lName}`;
      const voter = "Ameer";

      const reputationTypes: string[] = ["All Time", "Monthly", "Weekly", "Others", "Others Monthly", "Others Weekly"];
      const comReputationUpdates: IComReputationUpdates = {};

      const params = {
        batch,
        uname,
        imageUrl,
        fullname,
        chooseUname,
        tagIds,
        tags,
        nodeType,
        correctVal: -1,
        wrongVal: 0,
        instVal: 0, // not using yet feature
        ltermVal: 0, // incomplete feature
        ltermDayVal: 0, // incomplete feature
        voter,
        writeCounts,
        comReputationUpdates,
      };
      [batch, writeCounts] = await updateReputation(params);

      for (const tagId in comReputationUpdates) {
        for (const reputationType of reputationTypes) {
          if (!comReputationUpdates[tagId][reputationType]) continue;

          if (comReputationUpdates[tagId][reputationType].isNew) {
            batch.set(
              comReputationUpdates[tagId][reputationType].docRef,
              comReputationUpdates[tagId][reputationType].docData
            );
          } else {
            batch.update(
              comReputationUpdates[tagId][reputationType].docRef,
              comReputationUpdates[tagId][reputationType].docData
            );
          }
          [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
        }
      }

      await commitBatch(batch);

      // Validating

      // Community Points should only have 0 Upvote and -1 Downvote
      for (const comPointCol of communityPointCollections) {
        const comPointResult = await db.collection(comPointCol).where("tagId", "==", tagIds[0]).get();
        const comPointData = comPointResult.docs[0].data();
        const commPointsPVE = positiveFields.reduce((carry, field) => carry + parseFloat(comPointData[field]), 0);
        const commPointsNVE = negativeFields.reduce((carry, field) => carry + parseFloat(comPointData[field]), 0);
        expect(commPointsPVE).toEqual(-1);
        expect(commPointsNVE).toEqual(0);
      }

      // Other Community Points should only have 0 Upvote and -1 Downvote
      for (const comPointCol of otherCommunityPointCollections) {
        const comPointResult = await db.collection(comPointCol).where("tagId", "==", tagIds[0]).get();
        const comPointData = comPointResult.docs[0].data();
        const commPointsPVE = positiveFields.reduce((carry, field) => carry + parseFloat(comPointData[field]), 0);
        const commPointsNVE = negativeFields.reduce((carry, field) => carry + parseFloat(comPointData[field]), 0);
        expect(commPointsPVE).toEqual(-1);
        expect(commPointsNVE).toEqual(0);
      }

      // Reputation Points should only have 0 Upvote and -1 Downvote
      for (const repPointCol of reputationPointCollections) {
        const repPointResult = await db
          .collection(repPointCol)
          .where("uname", "==", uname)
          .where("tagId", "==", tagIds[0])
          .get();
        const repPointData = repPointResult.docs[0].data();
        const repPointsPVE = positiveFields.reduce((carry, field) => carry + parseFloat(repPointData[field]), 0);
        const repPointsNVE = negativeFields.reduce((carry, field) => carry + parseFloat(repPointData[field]), 0);
        expect(repPointsPVE).toEqual(-1);
        expect(repPointsNVE).toEqual(0);
      }

      // Other Reputation Points should only have 0 Upvote and -1 Downvote
      for (const repPointCol of otherReputationPointCollections) {
        const repPointResult = await db
          .collection(repPointCol)
          .where("uname", "==", uname)
          .where("tagId", "==", tagIds[0])
          .get();
        const repPointData = repPointResult.docs[0].data();
        const repPointsPVE = positiveFields.reduce((carry, field) => carry + parseFloat(repPointData[field]), 0);
        const repPointsNVE = negativeFields.reduce((carry, field) => carry + parseFloat(repPointData[field]), 0);
        expect(repPointsPVE).toEqual(-1);
        expect(repPointsNVE).toEqual(0);
      }
    });
  });
});
