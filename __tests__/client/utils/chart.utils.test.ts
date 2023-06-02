import { GeneralSemesterStudentsStats, SemesterStudentVoteStat } from "../../../src/instructorsTypes";
import { mapStudentsStatsDataByDates } from "../../../src/lib/utils/charts.utils";

it("Should map students stats by Dates", () => {
  const STUDENTS_UNAME = ["user1", "user2", "user3"];
  const DAYS = ["2023-05-01", "2023-05-02"];

  const semesterStudentVoteStat = [
    {
      uname: STUDENTS_UNAME[0],
      days: [
        {
          day: DAYS[0],
          nodes: 10,
          proposals: 10,
          links: 10,
          newNodes: 10,
          questions: 10,
          agreementsWithInst: 10,
          disagreementsWithInst: 10,
          correctPractices: 10,
        },
        {
          day: DAYS[1],
          nodes: 10,
          proposals: 10,
          links: 10,
          newNodes: 10,
          questions: 10,
          agreementsWithInst: 10,
          disagreementsWithInst: 10,
          correctPractices: 10,
        },
      ],
    },
    {
      uname: STUDENTS_UNAME[1],
      days: [
        {
          day: DAYS[0],
          nodes: 10,
          proposals: 10,
          links: 10,
          newNodes: 10,
          questions: 10,
          agreementsWithInst: 10,
          disagreementsWithInst: 10,
          correctPractices: 10,
        },
      ],
    },
    {
      uname: STUDENTS_UNAME[2],
      days: [
        {
          day: DAYS[1],
          nodes: 10,
          proposals: 10,
          links: 10,
          newNodes: 10,
          questions: 10,
          agreementsWithInst: 10,
          disagreementsWithInst: 10,
          correctPractices: 10,
        },
      ],
    },
  ] as SemesterStudentVoteStat[];

  const result = mapStudentsStatsDataByDates(semesterStudentVoteStat);

  const GENERAL_SEMESTER_STUDENT_STATS: GeneralSemesterStudentsStats = {
    /**
     * childProposals = day.nodes
     *                = nodes user1 day0 + nodes user2 day0
     *                = 10 + 10
     *                = 20
     */
    childProposals: 20,
    editProposals: 0,
    links: 20,
    nodes: 20,
    questions: 20,
    votes: 40,
    correctPractices: 20,
  };

  expect(result.length).toBe(2);
  expect(result[0].date).toBe(DAYS[0]);
  expect(result[1].date).toBe(DAYS[1]);
  expect(result[0].value).toEqual(GENERAL_SEMESTER_STUDENT_STATS);
  expect(result[1].value).toEqual(GENERAL_SEMESTER_STUDENT_STATS);
});
