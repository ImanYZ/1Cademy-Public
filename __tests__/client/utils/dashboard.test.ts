import { SemesterStudentVoteStat } from "../../../src/instructorsTypes";
import {
  getPracticePoints,
  getProposalPoints,
  getQuestionPoints,
  getStudentLocationOnStackBar,
} from "../../../src/lib/utils/dashboard.utils";
import { ISemester } from "../../../src/types/ICourse";

describe("should calculate student location on Stack bar", () => {
  it("Get user location from a user who has hightest proposals, questions and practices points", () => {
    const UNAME = "Shahbab-Ahmed";
    const semesterConfig = {
      nodeProposals: { numProposalPerDay: 10, numPoints: 1 },
      questionProposals: { numQuestionsPerDay: 10, numPoints: 1 },
      dailyPractice: { numQuestionsPerDay: 10, numPoints: 1 },
    } as ISemester;

    const semesterStudentVoteStat = [
      {
        uname: UNAME,
        days: [
          { questionProposals: 10, correctPractices: 10, proposals: 10 },
          { questionProposals: 10, correctPractices: 10, proposals: 10 },
          { questionProposals: 10, correctPractices: 10, proposals: 10 },
          { questionProposals: 10, correctPractices: 10, proposals: 10 },
          { questionProposals: 10, correctPractices: 10, proposals: 10 },
        ],
      },
      {
        uname: "ironhulk19",
        days: [
          { questionProposals: 5, correctPractices: 5, proposals: 5 },
          { questionProposals: 5, correctPractices: 5, proposals: 5 },
          { questionProposals: 5, correctPractices: 5, proposals: 5 },
          { questionProposals: 5, correctPractices: 5, proposals: 5 },
          { questionProposals: 5, correctPractices: 5, proposals: 5 },
        ],
      },
      {
        uname: "sarahlatto",
        days: [
          { questionProposals: 5, correctPractices: 5, proposals: 5 },
          { questionProposals: 5, correctPractices: 5, proposals: 5 },
          { questionProposals: 5, correctPractices: 5, proposals: 5 },
          { questionProposals: 5, correctPractices: 5, proposals: 5 },
          { questionProposals: 5, correctPractices: 5, proposals: 5 },
        ],
      },
      {
        uname: "metzlera",
        days: [
          { questionProposals: 5, correctPractices: 5, proposals: 5 },
          { questionProposals: 5, correctPractices: 5, proposals: 5 },
          { questionProposals: 5, correctPractices: 5, proposals: 5 },
          { questionProposals: 5, correctPractices: 5, proposals: 5 },
          { questionProposals: 5, correctPractices: 5, proposals: 5 },
        ],
      },
      {
        uname: "elizadh",
        days: [
          { questionProposals: 5, correctPractices: 5, proposals: 5 },
          { questionProposals: 5, correctPractices: 5, proposals: 5 },
          { questionProposals: 5, correctPractices: 5, proposals: 5 },
          { questionProposals: 5, correctPractices: 5, proposals: 5 },
          { questionProposals: 5, correctPractices: 5, proposals: 5 },
        ],
      },
    ] as SemesterStudentVoteStat[];

    const { proposals, questions, practices } = getStudentLocationOnStackBar(
      semesterStudentVoteStat,
      semesterConfig,
      UNAME
    );

    expect(proposals).toBe(4);
    expect(questions).toBe(4);
    expect(practices).toBe(4);
  });

  it("Get user location from a user who has hight proposals, middle questions and lower practices points", () => {
    const UNAME = "Shahbab-Ahmed";
    const semesterConfig = {
      nodeProposals: { numProposalPerDay: 10, numPoints: 1 },
      questionProposals: { numQuestionsPerDay: 10, numPoints: 1 },
      dailyPractice: { numQuestionsPerDay: 10, numPoints: 1 },
    } as ISemester;

    const semesterStudentVoteStat = [
      {
        uname: UNAME,
        days: [
          { questionProposals: 10, correctPractices: 2, proposals: 10 },
          { questionProposals: 10, correctPractices: 2, proposals: 10 },
          { questionProposals: 10, correctPractices: 2, proposals: 10 },
          { questionProposals: 5, correctPractices: 2, proposals: 10 },
          { questionProposals: 5, correctPractices: 2, proposals: 10 },
        ],
      },
      {
        uname: "ironhulk19",
        days: [
          { questionProposals: 0, correctPractices: 10, proposals: 5 },
          { questionProposals: 0, correctPractices: 10, proposals: 5 },
          { questionProposals: 0, correctPractices: 10, proposals: 5 },
          { questionProposals: 0, correctPractices: 10, proposals: 5 },
          { questionProposals: 0, correctPractices: 10, proposals: 5 },
        ],
      },
      {
        uname: "sarahlatto",
        days: [
          { questionProposals: 0, correctPractices: 10, proposals: 5 },
          { questionProposals: 0, correctPractices: 10, proposals: 5 },
          { questionProposals: 0, correctPractices: 10, proposals: 5 },
          { questionProposals: 0, correctPractices: 10, proposals: 5 },
          { questionProposals: 0, correctPractices: 10, proposals: 5 },
        ],
      },
      {
        uname: "metzlera",
        days: [
          { questionProposals: 10, correctPractices: 10, proposals: 5 },
          { questionProposals: 10, correctPractices: 10, proposals: 5 },
          { questionProposals: 10, correctPractices: 10, proposals: 5 },
          { questionProposals: 10, correctPractices: 10, proposals: 5 },
          { questionProposals: 10, correctPractices: 10, proposals: 5 },
        ],
      },
      {
        uname: "elizadh",
        days: [
          { questionProposals: 10, correctPractices: 10, proposals: 5 },
          { questionProposals: 10, correctPractices: 10, proposals: 5 },
          { questionProposals: 10, correctPractices: 10, proposals: 5 },
          { questionProposals: 10, correctPractices: 10, proposals: 5 },
          { questionProposals: 10, correctPractices: 10, proposals: 5 },
        ],
      },
    ] as SemesterStudentVoteStat[];

    const { proposals, questions, practices } = getStudentLocationOnStackBar(
      semesterStudentVoteStat,
      semesterConfig,
      UNAME
    );

    expect(proposals).toBe(4);
    expect(questions).toBe(2);
    expect(practices).toBe(0);
  });
});

describe("should get proposal points", () => {
  it("get 4 proposal points from Shahbab-Ahmed", () => {
    const UNAME = "Shahbab-Ahmed";
    const semesterConfig = {
      nodeProposals: { numProposalPerDay: 10, numPoints: 1 },
    } as ISemester;

    const semesterStudentVoteStat = {
      uname: UNAME,
      days: [
        { questionProposals: 10, correctPractices: 10, proposals: 10 },
        { questionProposals: 10, correctPractices: 10, proposals: 10 },
        { questionProposals: 10, correctPractices: 10, proposals: 9 },
        { questionProposals: 10, correctPractices: 10, proposals: 10 },
        { questionProposals: 10, correctPractices: 10, proposals: 10 },
      ],
    } as SemesterStudentVoteStat;

    const { points, uname } = getProposalPoints(semesterStudentVoteStat, semesterConfig);

    expect(points).toBe(4);
    expect(uname).toBe(UNAME);
  });
});

describe("should get question points", () => {
  it("get 4 question points from Shahbab-Ahmed", () => {
    const UNAME = "Shahbab-Ahmed";
    const semesterConfig = {
      questionProposals: { numQuestionsPerDay: 10, numPoints: 1 },
    } as ISemester;

    const semesterStudentVoteStat = {
      uname: UNAME,
      days: [
        { questionProposals: 10, correctPractices: 10, proposals: 10 },
        { questionProposals: 10, correctPractices: 10, proposals: 10 },
        { questionProposals: 9, correctPractices: 10, proposals: 10 },
        { questionProposals: 10, correctPractices: 10, proposals: 10 },
        { questionProposals: 10, correctPractices: 10, proposals: 10 },
      ],
    } as SemesterStudentVoteStat;

    const { points, uname } = getQuestionPoints(semesterStudentVoteStat, semesterConfig);

    expect(points).toBe(4);
    expect(uname).toBe(UNAME);
  });
});

describe("should get practice points", () => {
  it("get 4 practice points from Shahbab-Ahmed", () => {
    const UNAME = "Shahbab-Ahmed";
    const semesterConfig = {
      dailyPractice: { numQuestionsPerDay: 10, numPoints: 1 },
    } as ISemester;

    const semesterStudentVoteStat = {
      uname: UNAME,
      days: [
        { questionProposals: 10, correctPractices: 10, proposals: 10 },
        { questionProposals: 10, correctPractices: 10, proposals: 10 },
        { questionProposals: 10, correctPractices: 9, proposals: 10 },
        { questionProposals: 10, correctPractices: 10, proposals: 10 },
        { questionProposals: 10, correctPractices: 10, proposals: 10 },
      ],
    } as SemesterStudentVoteStat;

    const { points, uname } = getPracticePoints(semesterStudentVoteStat, semesterConfig);

    expect(points).toBe(4);
    expect(uname).toBe(UNAME);
  });
});
