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

describe("updateReputationIncrement", () => {
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

  it("Should increment total, positive and negative points of the community points.", async () => {
    let writeCounts = 0;
    const batch = db.batch();

    const { uname, imageUrl, chooseUname, fName, lName } = await usersData.getData()[0];
    const { firstWeekDay, firstMonthDay } = firstWeekMonthDays();
    const nodeType = "Concept";
    const tagId = "r98BjyFDCe4YyLA3U8ZE";
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
    const tagId = "r98BjyFDCe4YyLA3U8ZE";
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

  it("Should create a new document for the community points when it already does not exist.", async () => {
    await comMonthlyPointsData.clean();

    let writeCounts = 0;
    const batch = db.batch();
    //

    const { uname, imageUrl, chooseUname, fName, lName } = await usersData.getData()[0];
    const { firstWeekDay, firstMonthDay } = firstWeekMonthDays();

    const nodeType = "Concept";
    const tagId = "r98BjyFDCe4YyLA3U8ZE";
    const tag = "1Cademy";

    const fullname = `${fName} ${lName}`;

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

    const comMonthPointQuery = await db
      .collection(comMonthlyPointsData.getCollection())
      .where("firstMonthDay", "==", firstMonthDay)
      .where("tagId", "==", tagId)
      .get();

    const comMonthPointData = comMonthPointQuery.docs[0].data();
    [
      "cnCorrects",
      "cnInst",
      "cnWrongs",
      "cdCorrects",
      "cdInst",
      "cdWrongs",
      "qCorrects",
      "qInst",
      "qWrongs",
      "pCorrects",
      "pInst",
      "pWrongs",
      "sCorrects",
      "sInst",
      "sWrongs",
      "aCorrects",
      "aInst",
      "aWrongs",
      "rfCorrects",
      "rfInst",
      "rfWrongs",
      "nCorrects",
      "nInst",
      "nWrongs",
      "iCorrects",
      "iInst",
      "iWrongs",
      "mCorrects",
      "mInst",
      "mWrongs",
      "lterm",
      "ltermDay",
      "positives",
      "negatives",
      "totalPoints",
      "adminPoints",
    ].forEach(prop => expect(comMonthPointData).toHaveProperty(prop));
    expect(comMonthPointQuery.docs[0].exists).toBe(true);
  });
});
