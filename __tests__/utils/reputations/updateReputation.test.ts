import { commitBatch, db } from "../../../src/lib/firestoreServer/admin";
import { updateReputation } from "../../../src/utils/reputations";
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

describe("updateReputation", () => {
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
  it("Should update Reputation for All Time, Monthly and Weekly", async () => {
    let writeCounts = 0;
    const batch = db.batch();

    const { uname, imageUrl, chooseUname, fName, lName } = await usersData.getData()[0];
    const nodeType = "Concept";
    const tags = ["1Cademy"];
    const tagIds = ["C7L3gNbNp5reFjQf8vAb"];
    const fullname = `${fName} ${lName}`;
    const voter = uname;

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
      wrongVal: 1,
      instVal: 1,
      ltermVal: 1,
      ltermDayVal: 1,
      voter,
      writeCounts,
    };
    const [newBatch] = await updateReputation(params);
    await commitBatch(newBatch);
  });
});
