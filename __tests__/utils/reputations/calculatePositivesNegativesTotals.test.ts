import { calculatePositivesNegativesTotals } from "../../../src/utils/reputations";

describe("calculatePositivesNegativesTotals", () => {
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
    "lterm",
  ];

  const negativeFields = [
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

  const generateRepPointsObj = () => {
    const obj: any = {};

    [...positiveFields, ...negativeFields].forEach(field => {
      obj[field] = parseFloat((Math.random() * 1000).toFixed(2)); // random float
    });

    return obj;
  };

  describe("For Positive", () => {
    it("Should calculate the total positive points if it do not exist.", () => {
      const req_points = generateRepPointsObj();
      calculatePositivesNegativesTotals(req_points);
      expect(req_points.positives).toEqual(positiveFields.reduce((carry, field) => carry + req_points[field], 0));
    });

    it("Should not calculate the total positive points if it already exist.", () => {
      const req_points = generateRepPointsObj();
      req_points.positives = -1;
      calculatePositivesNegativesTotals(req_points);
      expect(req_points.positives).toEqual(-1);
    });
  });

  describe("For Negative", () => {
    it("Should calculate the total negative points if it do not exist.", () => {
      const req_points = generateRepPointsObj();
      calculatePositivesNegativesTotals(req_points);
      expect(req_points.negatives).toEqual(negativeFields.reduce((carry, field) => carry + req_points[field], 0));
    });

    it("Should not calculate the total negative points if it already exist.", () => {
      const req_points = generateRepPointsObj();
      req_points.negatives = -1;
      calculatePositivesNegativesTotals(req_points);
      expect(req_points.negatives).toEqual(-1);
    });
  });

  describe("For totalPoints", () => {
    it("Should calculate the total points if it do not exist.", () => {
      const req_points = generateRepPointsObj();
      calculatePositivesNegativesTotals(req_points);
      expect(req_points.totalPoints).toEqual(
        positiveFields.reduce((carry, field) => carry + req_points[field], 0) -
          negativeFields.reduce((carry, field) => carry + req_points[field], 0)
      );
    });

    it("Should not calculate the total points if it already exist.", () => {
      const req_points = generateRepPointsObj();
      req_points.totalPoints = -1;
      calculatePositivesNegativesTotals(req_points);
      expect(req_points.totalPoints).toEqual(-1);
    });
  });
});
