import { firstWeekMonthDays } from "../../src/utils/helpers";

describe("getUserNode", () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it("Should be able to get first week day (if its start of week)", async () => {
    jest.setSystemTime(new Date("2022-09-18"));
    const weekMonthDays = firstWeekMonthDays();
    expect(weekMonthDays.firstWeekDay).toEqual("9-18-2022");
    expect(weekMonthDays.firstMonthDay).toEqual("9-1-2022");
  });

  it("Should be able to get first week day (if its wednesday)", async () => {
    jest.setSystemTime(new Date("2022-09-21"));
    const weekMonthDays = firstWeekMonthDays();
    expect(weekMonthDays.firstWeekDay).toEqual("9-18-2022");
    expect(weekMonthDays.firstMonthDay).toEqual("9-1-2022");
  });

  it("Should be able to get first week day (if last day of week)", async () => {
    jest.setSystemTime(new Date("2022-09-24"));
    const weekMonthDays = firstWeekMonthDays();
    expect(weekMonthDays.firstWeekDay).toEqual("9-18-2022");
    expect(weekMonthDays.firstMonthDay).toEqual("9-1-2022");
  });

  it("Should be able to get first week day (by param)", async () => {
    const weekMonthDays = firstWeekMonthDays(new Date("2022-09-25"));
    expect(weekMonthDays.firstWeekDay).toEqual("9-25-2022");
    expect(weekMonthDays.firstMonthDay).toEqual("9-1-2022");
  });
});
