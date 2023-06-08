import { SemesterStudentVoteStat } from "../../instructorsTypes";
import { ISemester } from "../../types/ICourse";

export const getProposalPoints = (
  semesterStudentsVoteStat: SemesterStudentVoteStat,
  semester: ISemester
): { uname: string; points: number } => {
  const proposalPoints = semesterStudentsVoteStat.days.reduce(
    (acu, cur) =>
      acu + (cur.proposals >= semester.nodeProposals.numProposalPerDay ? semester.nodeProposals.numPoints : 0),
    0
  );
  return { uname: semesterStudentsVoteStat.uname, points: proposalPoints };
};

export const getQuestionPoints = (
  semesterStudentsVoteStat: SemesterStudentVoteStat,
  semester: ISemester
): { uname: string; points: number } => {
  const questionPoints = semesterStudentsVoteStat.days.reduce(
    (acu, cur) =>
      acu +
      (cur.questionProposals >= semester.questionProposals.numQuestionsPerDay
        ? semester.questionProposals.numPoints
        : 0),
    0
  );
  return { uname: semesterStudentsVoteStat.uname, points: questionPoints };
};

export const getPracticePoints = (
  semesterStudentsVoteStat: SemesterStudentVoteStat,
  semester: ISemester
): { uname: string; points: number } => {
  const practicePoints = semesterStudentsVoteStat.days.reduce(
    (acu, cur) =>
      acu + (cur.correctPractices >= semester.dailyPractice.numQuestionsPerDay ? semester.dailyPractice.numPoints : 0),
    0
  );
  return { uname: semesterStudentsVoteStat.uname, points: practicePoints };
};

export const getStudentLocationOnStackBar = (
  semesterStudentsVoteStats: SemesterStudentVoteStat[],
  semesterConfig: ISemester,
  uname: string
) => {
  const proposalPointsSorted = semesterStudentsVoteStats
    .map(cur => getProposalPoints(cur, semesterConfig))
    .sort((x, y) => x.points - y.points); // [4,3,2,...]

  const questionPointsSorted = semesterStudentsVoteStats
    .map(cur => getQuestionPoints(cur, semesterConfig))
    .sort((x, y) => x.points - y.points); // [4,3,2,...]

  const practicePointsSorted = semesterStudentsVoteStats
    .map(cur => getPracticePoints(cur, semesterConfig))
    .sort((x, y) => x.points - y.points); // [4,3,2,...]

  //   console.log({ proposalPointsSorted, questionPointsSorted, practicePointsSorted });
  const proposals = proposalPointsSorted.findIndex(cur => cur.uname === uname);
  const questions = questionPointsSorted.findIndex(cur => cur.uname === uname);
  const practices = practicePointsSorted.findIndex(cur => cur.uname === uname);

  return { proposals, questions, practices };
};
