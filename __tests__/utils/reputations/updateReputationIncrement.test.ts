import { commitBatch, db } from "../../../src/lib/firestoreServer/admin";
import { firstWeekMonthDays } from "../../../src/utils/helpers";
import { updateReputationIncrement } from "../../../src/utils/reputations";
import {
  comMonthlyPointsData,
  comOthersPointsData,
  comOthMonPointsData,
  comOthWeekPointsData,
  comPointsData,
  comWeeklyPointsData,
  monthlyReputationsData,
  nodesData,
  othersReputationsData,
  othMonReputationsData,
  othWeekReputationsData,
  usersData,
} from "../../../testUtils/mockCollections";

describe("updateReputationIncrement", () => {
  beforeEach(async () => {
    await Promise.all(
      [
        comMonthlyPointsData,
        comOthersPointsData,
        comOthMonPointsData,
        comOthWeekPointsData,
        comPointsData,
        comWeeklyPointsData,
        monthlyReputationsData,
        nodesData,
        othersReputationsData,
        othMonReputationsData,
        othWeekReputationsData,
        usersData,
      ].map(col => col.populate())
    );
  });

  afterEach(async () => {
    await Promise.all(
      [
        comMonthlyPointsData,
        comOthersPointsData,
        comOthMonPointsData,
        comOthWeekPointsData,
        comPointsData,
        comWeeklyPointsData,
        monthlyReputationsData,
        nodesData,
        othersReputationsData,
        othMonReputationsData,
        othWeekReputationsData,
        usersData,
      ].map(col => col.clean())
    );
  });

  it("Should increment total, positive and negative points of the community points.", async () => {
    ///////
    let writeCounts = 0;
    const batch = db.batch();

    const { uname, imageUrl, chooseUname, fName, lName } = await usersData.getData()[0];
    const { firstWeekDay, firstMonthDay } = firstWeekMonthDays();
    const nodeType = "Concept";
    const tagId = "C7L3gNbNp5reFjQf8vAb";
    const tag = "1Cademy";

    const fullname = `${fName} ${lName}`;

    const comMonthPointQuery = db
      .collection(comMonthlyPointsData.getCollection())
      .where("firstMonthDay", "==", firstMonthDay)
      .where("tagId", "==", tagId);

    const beforeComMonthPoints = (await comMonthPointQuery.get()).docs[0].data();

    const params = {
      batch,
      writeCounts,
      uname,
      imageUrl,
      fullname,
      chooseUname,
      nodeType,
      tagId,
      tag,
      correctVal: 1,
      wrongVal: 1,
      instVal: 1,
      ltermVal: 1,
      ltermDayVal: 1,
      reputationType: "Monthly",
      firstWeekDay,
      firstMonthDay,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const [newBatch] = await updateReputationIncrement(params);

    await commitBatch(newBatch);

    const afterComMonthPointsData = (await comMonthPointQuery.get()).docs[0].data();

    const positivePointsChange = params.correctVal + params.instVal + params.ltermVal;

    expect(afterComMonthPointsData.positives).toEqual(beforeComMonthPoints.positives + positivePointsChange);

    // total negatives should be incremented by the value of wrongVal passed.
    expect(afterComMonthPointsData.negatives).toEqual(beforeComMonthPoints.negatives + params.wrongVal);

    const totalPointsChange = positivePointsChange - params.wrongVal;
    expect(afterComMonthPointsData.totalPoints).toEqual(beforeComMonthPoints.totalPoints + totalPointsChange);
  });

  it("Should increment total, positive and negative points of the reputations points.", async () => {
    ///////
    let writeCounts = 0;
    const batch = db.batch();

    const { uname, imageUrl, chooseUname, fName, lName } = await usersData.getData()[0];
    const { firstWeekDay, firstMonthDay } = firstWeekMonthDays();

    const nodeType = "Concept";
    const tagId = "C7L3gNbNp5reFjQf8vAb";
    const tag = "1Cademy";

    const fullname = `${fName} ${lName}`;

    const repMonthPointQuery = db
      .collection(monthlyReputationsData.getCollection())
      .where("firstMonthDay", "==", firstMonthDay)
      .where("tagId", "==", tagId);

    const beforeRepMonthPoints = (await repMonthPointQuery.get()).docs[0].data();

    const params = {
      batch,
      writeCounts,
      uname,
      imageUrl,
      fullname,
      chooseUname,
      nodeType,
      tagId,
      tag,
      correctVal: 1,
      wrongVal: 1,
      instVal: 1,
      ltermVal: 1,
      ltermDayVal: 1,
      reputationType: "Monthly",
      firstWeekDay,
      firstMonthDay,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const [newBatch] = await updateReputationIncrement(params);

    await commitBatch(newBatch);

    const afterRepMonthPointsData = (await repMonthPointQuery.get()).docs[0].data();

    //total Points should be incremented by the positivePointsChange (correctVal + instVal + ltermVal)
    const positivePointsChange = params.correctVal + params.instVal + params.ltermVal;

    expect(afterRepMonthPointsData.positives).toEqual(beforeRepMonthPoints.positives + positivePointsChange);

    // total negatives should be incremented by the value of wrongVal passed.
    expect(afterRepMonthPointsData.negatives).toEqual(beforeRepMonthPoints.negatives + params.wrongVal);

    //total Points should be incremented by the totalPointsChanges(correctVal + instVal + ltermVal -wrongVal)
    const totalPointsChange = positivePointsChange - params.wrongVal;
    expect(afterRepMonthPointsData.totalPoints).toEqual(beforeRepMonthPoints.totalPoints + totalPointsChange);
  });
});
