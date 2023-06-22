import { calculateDailyStreak, getDaysInAWeekWithoutGetDailyPoint } from "../../../src/lib/utils/userStatus.utils";
import { ISemesterStudentVoteStat } from "../../../src/types/ICourse";

const DATE_2023_05_17 = "2023-05-17";

let originalDate: any;

beforeEach(() => {
  originalDate = global.Date; // Store the original Date object

  jest.spyOn(global, "Date").mockImplementation((...args) => {
    if (args.length) {
      return new originalDate(...args);
    }
    return new originalDate(2023, 4, 17, 10, 0, 0); // DATE_2023_05_17
  });
});

afterEach(() => {
  global.Date = originalDate; // Restore the original Date object
});

describe("should calculate daily streak", () => {
  it("with 0 days in a row that the student completely answered 10 questions correctly.", () => {
    console.log({ d1: new Date(), d2: new Date("2023-01-01") });
    const semesterStudentStats = {
      uname: "student-core-econ",
      votePoints: 0,
      lastActivity: {
        seconds: 1683737420,
        nanoseconds: 630000000,
      },
      questionProposals: 0,
      updatedAt: {
        seconds: 1685113962,
        nanoseconds: 511000000,
      },
      nodes: 0,
      days: [
        {
          improvements: 0,
          disagreementsWithInst: 0,
          nodes: 0,
          correctPractices: 4,
          day: "2023-05-10",
          instVotes: 0,
          newNodes: 0,
          questionProposals: 0,
          links: 0,
          questions: 0,
          downVotes: 0,
          proposals: 0,
          agreementsWithInst: 0,
          totalPractices: 5,
          upVotes: 0,
        },
        {
          totalPractices: 7,
          correctPractices: 5,
          instVotes: 0,
          downVotes: 0,
          agreementsWithInst: 0,
          newNodes: 0,
          disagreementsWithInst: 0,
          day: "2023-05-11",
          questions: 0,
          improvements: 0,
          proposals: 0,
          upVotes: 0,
          links: 0,
          nodes: 0,
          questionProposals: 0,
        },
      ],
      agreementsWithInst: 0,
      newNodes: 0,
      votes: 0,
      totalPoints: 0,
      tagId: "HjIukJr12fIP9DNoD9gX",
      questionPoints: 0,
      downVotes: 0,
      questions: 0,
      correctPractices: 97,
      improvements: 0,
      deleted: false,
      links: 0,
      disagreementsWithInst: 0,
      upVotes: 0,
      instVotes: 0,
      totalPractices: 356,
      createdAt: {
        seconds: 1683737420,
        nanoseconds: 630000000,
      },
    } as ISemesterStudentVoteStat;
    const { dailyStreak, maxDailyStreak } = calculateDailyStreak(semesterStudentStats, 10);
    expect(dailyStreak).toBe(0);
    expect(maxDailyStreak).toBe(0);
  });

  it("with 3 and 2 days in a row that the student completely answered 10 questions correctly.", () => {
    const semesterStudentStats = {
      uname: "student-core-econ",
      votePoints: 0,
      lastActivity: {
        seconds: 1683737420,
        nanoseconds: 630000000,
      },
      questionProposals: 0,
      updatedAt: {
        seconds: 1685113962,
        nanoseconds: 511000000,
      },
      nodes: 0,
      days: [
        {
          improvements: 0,
          disagreementsWithInst: 0,
          nodes: 0,
          correctPractices: 10,
          day: "2023-05-10",
          instVotes: 0,
          newNodes: 0,
          questionProposals: 0,
          links: 0,
          questions: 0,
          downVotes: 0,
          proposals: 0,
          agreementsWithInst: 0,
          totalPractices: 5,
          upVotes: 0,
        },
        {
          totalPractices: 7,
          correctPractices: 10,
          instVotes: 0,
          downVotes: 0,
          agreementsWithInst: 0,
          newNodes: 0,
          disagreementsWithInst: 0,
          day: "2023-05-11",
          questions: 0,
          improvements: 0,
          proposals: 0,
          upVotes: 0,
          links: 0,
          nodes: 0,
          questionProposals: 0,
        },
        {
          correctPractices: 10,
          questions: 0,
          proposals: 0,
          links: 0,
          upVotes: 0,
          day: "2023-05-12",
          totalPractices: 3,
          questionProposals: 0,
          disagreementsWithInst: 0,
          improvements: 0,
          agreementsWithInst: 0,
          newNodes: 0,
          instVotes: 0,
          nodes: 0,
          downVotes: 0,
        },
        {
          questionProposals: 0,
          links: 0,
          questions: 0,
          proposals: 0,
          upVotes: 0,
          disagreementsWithInst: 0,
          nodes: 0,
          day: "2023-05-15",
          newNodes: 0,
          improvements: 0,
          agreementsWithInst: 0,
          correctPractices: 1,
          instVotes: 0,
          downVotes: 0,
          totalPractices: 3,
        },
        {
          links: 0,
          upVotes: 0,
          instVotes: 0,
          agreementsWithInst: 0,
          correctPractices: 10,
          questions: 0,
          disagreementsWithInst: 0,
          proposals: 0,
          newNodes: 0,
          questionProposals: 0,
          nodes: 0,
          totalPractices: 38,
          downVotes: 0,
          day: "2023-05-16",
          improvements: 0,
        },
        {
          totalPractices: 42,
          newNodes: 0,
          upVotes: 0,
          day: DATE_2023_05_17,
          disagreementsWithInst: 0,
          downVotes: 0,
          improvements: 0,
          agreementsWithInst: 0,
          nodes: 0,
          instVotes: 0,
          correctPractices: 10,
          links: 0,
          questions: 0,
          proposals: 0,
          questionProposals: 0,
        },
      ],
      agreementsWithInst: 0,
      newNodes: 0,
      votes: 0,
      totalPoints: 0,
      tagId: "HjIukJr12fIP9DNoD9gX",
      questionPoints: 0,
      downVotes: 0,
      questions: 0,
      correctPractices: 97,
      improvements: 0,
      deleted: false,
      links: 0,
      disagreementsWithInst: 0,
      upVotes: 0,
      instVotes: 0,
      totalPractices: 356,
      createdAt: {
        seconds: 1683737420,
        nanoseconds: 630000000,
      },
    } as ISemesterStudentVoteStat;
    const { dailyStreak, maxDailyStreak } = calculateDailyStreak(semesterStudentStats, 10);
    expect(dailyStreak).toBe(2);
    expect(maxDailyStreak).toBe(3);
  });

  it("with 1 and 1 days in a row that the student completely answered 10 questions correctly, and current date doesn't answered yet", () => {
    const semesterStudentStats = {
      uname: "student-core-econ",
      votePoints: 0,
      lastActivity: {
        seconds: 1683737420,
        nanoseconds: 630000000,
      },
      questionProposals: 0,
      updatedAt: {
        seconds: 1685113962,
        nanoseconds: 511000000,
      },
      nodes: 0,
      days: [
        {
          improvements: 0,
          disagreementsWithInst: 0,
          nodes: 0,
          correctPractices: 10,
          day: "2023-05-10",
          instVotes: 0,
          newNodes: 0,
          questionProposals: 0,
          links: 0,
          questions: 0,
          downVotes: 0,
          proposals: 0,
          agreementsWithInst: 0,
          totalPractices: 5,
          upVotes: 0,
        },
        {
          totalPractices: 7,
          correctPractices: 2,
          instVotes: 0,
          downVotes: 0,
          agreementsWithInst: 0,
          newNodes: 0,
          disagreementsWithInst: 0,
          day: "2023-05-11",
          questions: 0,
          improvements: 0,
          proposals: 0,
          upVotes: 0,
          links: 0,
          nodes: 0,
          questionProposals: 0,
        },
        {
          correctPractices: 11,
          questions: 0,
          proposals: 0,
          links: 0,
          upVotes: 0,
          day: "2023-05-16",
          totalPractices: 3,
          questionProposals: 0,
          disagreementsWithInst: 0,
          improvements: 0,
          agreementsWithInst: 0,
          newNodes: 0,
          instVotes: 0,
          nodes: 0,
          downVotes: 0,
        },
        {
          totalPractices: 42,
          newNodes: 0,
          upVotes: 0,
          day: DATE_2023_05_17,
          disagreementsWithInst: 0,
          downVotes: 0,
          improvements: 0,
          agreementsWithInst: 0,
          nodes: 0,
          instVotes: 0,
          correctPractices: 0,
          links: 0,
          questions: 0,
          proposals: 0,
          questionProposals: 0,
        },
      ],
      agreementsWithInst: 0,
      newNodes: 0,
      votes: 0,
      totalPoints: 0,
      tagId: "HjIukJr12fIP9DNoD9gX",
      questionPoints: 0,
      downVotes: 0,
      questions: 0,
      correctPractices: 97,
      improvements: 0,
      deleted: false,
      links: 0,
      disagreementsWithInst: 0,
      upVotes: 0,
      instVotes: 0,
      totalPractices: 356,
      createdAt: {
        seconds: 1683737420,
        nanoseconds: 630000000,
      },
    } as ISemesterStudentVoteStat;
    const { dailyStreak, maxDailyStreak } = calculateDailyStreak(semesterStudentStats, 10);
    expect(dailyStreak).toBe(1);
    expect(maxDailyStreak).toBe(1);
  });

  it("with 2 days in a row, but a lot of time ago", () => {
    // current mocked date is DATE_2023_05_17
    const semesterStudentStats = {
      uname: "student-core-econ",
      votePoints: 0,
      lastActivity: {
        seconds: 1683737420,
        nanoseconds: 630000000,
      },
      questionProposals: 0,
      updatedAt: {
        seconds: 1685113962,
        nanoseconds: 511000000,
      },
      nodes: 0,
      days: [
        {
          improvements: 0,
          disagreementsWithInst: 0,
          nodes: 0,
          correctPractices: 10,
          day: "2023-05-10",
          instVotes: 0,
          newNodes: 0,
          questionProposals: 0,
          links: 0,
          questions: 0,
          downVotes: 0,
          proposals: 0,
          agreementsWithInst: 0,
          totalPractices: 5,
          upVotes: 0,
        },
        {
          totalPractices: 7,
          correctPractices: 12,
          instVotes: 0,
          downVotes: 0,
          agreementsWithInst: 0,
          newNodes: 0,
          disagreementsWithInst: 0,
          day: "2023-05-11",
          questions: 0,
          improvements: 0,
          proposals: 0,
          upVotes: 0,
          links: 0,
          nodes: 0,
          questionProposals: 0,
        },
      ],
      agreementsWithInst: 0,
      newNodes: 0,
      votes: 0,
      totalPoints: 0,
      tagId: "HjIukJr12fIP9DNoD9gX",
      questionPoints: 0,
      downVotes: 0,
      questions: 0,
      correctPractices: 97,
      improvements: 0,
      deleted: false,
      links: 0,
      disagreementsWithInst: 0,
      upVotes: 0,
      instVotes: 0,
      totalPractices: 356,
      createdAt: {
        seconds: 1683737420,
        nanoseconds: 630000000,
      },
    } as ISemesterStudentVoteStat;
    const { dailyStreak, maxDailyStreak } = calculateDailyStreak(semesterStudentStats, 10);
    expect(dailyStreak).toBe(0);
    expect(maxDailyStreak).toBe(2);
  });
});

describe("should get days without get daily point in a week", () => {
  it("with 0 days lost daily points in last week", () => {
    const semesterStudentStats = {
      days: [
        {
          correctPractices: 12,
          day: "2023-05-15", // Monday
        },
        {
          correctPractices: 12,
          day: "2023-05-16", // Tuesday
        },
        {
          correctPractices: 10,
          day: DATE_2023_05_17, // Wednesday
        },
      ],
    } as ISemesterStudentVoteStat;
    const result = getDaysInAWeekWithoutGetDailyPoint(semesterStudentStats, 10);
    expect(result).toBe(0);
  });

  it("with 2 days lost daily points in last week", () => {
    const semesterStudentStats = {
      days: [
        {
          correctPractices: 4,
          day: "2023-05-16",
        },
        {
          correctPractices: 10,
          day: DATE_2023_05_17,
        },
      ],
    } as ISemesterStudentVoteStat;
    const result = getDaysInAWeekWithoutGetDailyPoint(semesterStudentStats, 10);
    expect(result).toBe(2); // from monday and tuesday
  });

  it("with 3 days lost daily point, because days are out of last week", () => {
    const semesterStudentStats = {
      days: [
        {
          correctPractices: 4,
          day: "2023-05-01",
        },
      ],
    } as ISemesterStudentVoteStat;
    const result = getDaysInAWeekWithoutGetDailyPoint(semesterStudentStats, 10);
    expect(result).toBe(3);
  });
});
