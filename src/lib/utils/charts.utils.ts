import { ISemesterStudent } from "src/types/ICourse";

import { SemesterStats, SemesterStudentVoteStat, StackedBarStats } from "../../instructorsTypes";
import {
  StackedBarStatsData,
  StudentStackedBarStats,
  StudentStackedBarStatsObject,
} from "../../pages/instructors/dashboard";

// TODO: Test
export const getSemStat = (data: SemesterStudentVoteStat[]): SemesterStats => {
  let childProposals = 0;
  let editProposals = 0;
  let links = 0;
  let nodes = 0;
  let votes = 0;
  let questions = 0;

  data.map(stat => {
    childProposals += stat.nodes;
    editProposals += stat.improvements;
    links += stat.links;
    nodes += stat.newNodes;
    votes += stat.votes;
    questions += stat.questions;
  });
  return {
    newNodeProposals: childProposals,
    editProposals,
    links,
    nodes,
    questions,
    votes,
  };
};

// TODO: test
export const getStackedBarStat = (
  data: SemesterStudentVoteStat[],
  students: ISemesterStudent[],
  maxProposalsPoints: number,
  maxQuestionsPoints: number
): StackedBarStatsData => {
  const stackedBarStats: StackedBarStats[] = [];
  const studentProposalsRate: StudentStackedBarStatsObject = {
    alessEqualTen: [],
    bgreaterTen: [],
    cgreaterFifty: [],
    dgreaterHundred: [],
  };
  const studentQuestionsRate: StudentStackedBarStatsObject = {
    alessEqualTen: [],
    bgreaterTen: [],
    cgreaterFifty: [],
    dgreaterHundred: [],
  };
  const ProposalsRate: StackedBarStats = {
    index: 0,
    alessEqualTen: 0,
    bgreaterTen: 0,
    cgreaterFifty: 0,
    dgreaterHundred: 0,
  };
  const QuestionsRate: StackedBarStats = {
    index: 1,
    alessEqualTen: 0,
    bgreaterTen: 0,
    cgreaterFifty: 0,
    dgreaterHundred: 0,
  };
  const sortedByProposals = [...data].sort((x, y) => y.totalPoints - x.totalPoints);
  const sortedByQuestions = [...data].sort((x, y) => y.questionPoints - x.questionPoints);
  sortedByProposals.map(d => {
    const proposals = d.totalPoints;
    const proposalSubgroup = getStudentSubgroupInBars(proposals, maxProposalsPoints);
    const student = students.find(student => student.uname === d.uname);
    if (!student) return;

    ProposalsRate[proposalSubgroup] += 1;
    studentProposalsRate[proposalSubgroup as keyof StudentStackedBarStats].push(student);
  });
  sortedByQuestions.map(d => {
    const question = d.questionPoints;
    const questionsSubgroup = getStudentSubgroupInBars(question, maxQuestionsPoints);
    const student = students.find(student => student.uname === d.uname);
    if (!student) return;

    QuestionsRate[questionsSubgroup] += 1;
    studentQuestionsRate[questionsSubgroup as keyof StudentStackedBarStats].push(student);
  });

  stackedBarStats.push(ProposalsRate);
  stackedBarStats.push(QuestionsRate);
  return {
    stackedBarStats: stackedBarStats,
    studentStackedBarProposalsStats: studentProposalsRate,
    studentStackedBarQuestionsStats: studentQuestionsRate,
  };
};

export const getStudentSubgroupInBars = (points: number, maxPoints: number): keyof StackedBarStats => {
  if (points > (100 * maxPoints) / 100) {
    return "dgreaterHundred";
  } else if (points > (50 * maxPoints) / 100) {
    return "cgreaterFifty";
  } else if (points > (10 * maxPoints) / 100) {
    return "bgreaterTen";
  } else {
    return "alessEqualTen";
  }
};
