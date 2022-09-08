import { getRepBaseQueries } from "../../../src/utils/reputations";
import { ReputationType } from "../../../src/utils/reputations";

const map: {
  [key in ReputationType]: {
    reputationsQueryBase: string;
    comPointsQueryBase: string;
  };
} = {
  "All Time": {
    reputationsQueryBase: "reputations",
    comPointsQueryBase: "comPoints",
  },
  Monthly: {
    reputationsQueryBase: "monthlyReputations",
    comPointsQueryBase: "comMonthlyPoints",
  },
  Weekly: {
    reputationsQueryBase: "weeklyReputations",
    comPointsQueryBase: "comWeeklyPoints",
  },
  Others: {
    reputationsQueryBase: "othersReputations",
    comPointsQueryBase: "comOthersPoints",
  },
  "Others Monthly": {
    reputationsQueryBase: "othMonReputations",
    comPointsQueryBase: "comOthMonPoints",
  },
  "Others Weekly": {
    reputationsQueryBase: "othWeekReputations",
    comPointsQueryBase: "comOthWeekPoints",
  },
};

describe("getRepBaseQueries", () => {
  it("Should return appropriate reputatino and point collection based on reputation type.", () => {
    Object.keys(map).forEach(repType => {
      const { reputationsQueryBase, comPointsQueryBase } = getRepBaseQueries(repType as ReputationType);

      expect(reputationsQueryBase.id).toBe(map[repType as ReputationType].reputationsQueryBase);
      expect(comPointsQueryBase.id).toBe(map[repType as ReputationType].comPointsQueryBase);
    });
  });
});
