import { baseReputationObj } from "../../src/utils/baseReputationObj";

type PointT = {
  createdAt: string;
  updatedAt: string;
  cnCorrects: Number;
  cnInst: Number;
  cnWrongs: Number;
  cdCorrects: Number;
  cdInst: Number;
  cdWrongs: Number;
  qCorrects: Number;
  qInst: Number;
  qWrongs: Number;
  pCorrects: Number;
  pInst: Number;
  pWrongs: Number;
  sCorrects: Number;
  sInst: Number;
  sWrongs: Number;
  aCorrects: Number;
  aInst: Number;
  aWrongs: Number;
  rfCorrects: Number;
  rfInst: Number;
  rfWrongs: Number;
  nCorrects: Number;
  nInst: Number;
  nWrongs: Number;
  iCorrects: Number;
  iInst: Number;
  iWrongs: Number;
  mCorrects: Number;
  mInst: Number;
  mWrongs: Number;
  lterm: Number;
  ltermDay: Number;
  positives: Number;
  negatives: Number;
  totalPoints: Number;
};

describe("baseReputationObj", () => {
  let points1: PointT = {
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    cnCorrects: 1.9534,
    cnInst: 1.9534,
    cnWrongs: 1.9534,
    cdCorrects: 1.9534,
    cdInst: 1.9534,
    cdWrongs: 1.9534,
    qCorrects: 1.9534,
    qInst: 1.9534,
    qWrongs: 1.9534,
    pCorrects: 1.9534,
    pInst: 1.9534,
    pWrongs: 1.9534,
    sCorrects: 1.9534,
    sInst: 1.9534,
    sWrongs: 1.9534,
    aCorrects: 1.9534,
    aInst: 1.9534,
    aWrongs: 1.9534,
    rfCorrects: 1.9534,
    rfInst: 1.9534,
    rfWrongs: 1.9534,
    nCorrects: 1.9534,
    nInst: 1.9534,
    nWrongs: 1.9534,
    iCorrects: 1.9534,
    iInst: 1.9534,
    iWrongs: 1.9534,
    mCorrects: 1.9534,
    mInst: 1.9534,
    mWrongs: 1.9534,
    lterm: 1.9534,
    ltermDay: 1.9534,
    positives: 1.9534,
    negatives: 1.9534,
    totalPoints: 1.9534,
  };
  it("Should return every number props with 3 precisions max", () => {
    const result: any = baseReputationObj({
      points: points1,
      tag: {},
      tagId: 0,
    });
    for (let key of Object.keys(result)) {
      if (key === "createdAt" || key === "updatedAt") {
        continue;
      }
      expect(result[key] * 1000).toEqual(Math.floor(result[key] * 1000));
    }
  });
});
