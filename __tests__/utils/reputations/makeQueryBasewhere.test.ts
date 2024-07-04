import { db } from "../../../src/lib/firestoreServer/admin";
import { makeQueryBaseWhere } from "../../../src/utils/reputations";

describe("makeQueryBasewhere", () => {
  it("Should not append any where clause to the query, when reputation type does not exist.", () => {
    const reputationType = "DOES_NOT_EXIST";
    const baseCollection = db.collection("collections");
    baseCollection.where = jest.fn();
    makeQueryBaseWhere(reputationType as any, baseCollection, "firstWeekDay", "firstMonthDay");
    expect(baseCollection.where).not.toHaveBeenCalled();
  });

  it("Should set the where clause (firstMonthDay == givenValue) on the query when the reputation type is one of ['Monthly', 'Others Monthly']", () => {
    ["Monthly", "Others Monthly"].forEach(reputationType => {
      const baseCollection = db.collection("collections");
      baseCollection.where = jest.fn();

      const firstMonthDay = "givenValue";
      makeQueryBaseWhere(reputationType as any, baseCollection, "firstWeekDay", firstMonthDay);
      expect(baseCollection.where).toHaveBeenCalledWith("firstMonthDay", "==", firstMonthDay);
    });
  });

  it("Should set the where clause (firsWeekDay == givenValue) on the query when the reputation type is one of ['Weekly', 'Others Weekly']", () => {
    ["Weekly", "Others Weekly"].forEach(reputationType => {
      const baseCollection = db.collection("collections");
      baseCollection.where = jest.fn();

      const firstWeekDay = "givenValue";
      makeQueryBaseWhere(reputationType as any, baseCollection, firstWeekDay, "firstMonthDay");
      expect(baseCollection.where).toHaveBeenCalledWith("firstWeekDay", "==", firstWeekDay);
    });
  });
});
