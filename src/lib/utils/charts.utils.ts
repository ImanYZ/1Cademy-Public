import { SemesterStats, SemesterStudentVoteStat, StackedBarStats } from "../../instructorsTypes";
import { StackedBarStatsData, StudentStackedBarStats } from "../../pages/instructors/dashboard";

// TODO: Test
export const getSemStat = (data: SemesterStudentVoteStat[]): SemesterStats => {
  console.log(
    "data",
    data.map(c => ({ link: c.links, uname: c.uname }))
  );
  let newNodeProposals = 0;
  let editProposals = 0;
  let links = 0;
  let nodes = 0;
  let votes = 0;
  let questions = 0;

  data.map(stat => {
    newNodeProposals += stat.newNodes;
    editProposals += stat.improvements;
    links += stat.links;
    nodes += stat.improvements + stat.newNodes;
    votes += stat.votes;
    questions += stat.questions;
  });
  return {
    newNodeProposals,
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
  maxProposalsPoints: number,
  maxQuestionsPoints: number
): StackedBarStatsData => {
  const stackedBarStats: StackedBarStats[] = [];
  const studentProposalsRate: StudentStackedBarStats = {
    index: 0,
    alessEqualTen: [],
    bgreaterTen: [],
    cgreaterFifty: [],
    dgreaterHundred: [],
  };
  const studentQuestionsRate: StudentStackedBarStats = {
    index: 1,
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

  data.map(d => {
    if (d.deleted) return;
    const proposals = d.totalPoints;
    const question = d.questionPoints;
    if (proposals > (100 * maxProposalsPoints) / 100) {
      ProposalsRate.dgreaterHundred += 1;
      studentProposalsRate.dgreaterHundred.push(d.uname);
    } else if (proposals > (50 * maxProposalsPoints) / 100) {
      ProposalsRate.cgreaterFifty += 1;
      studentProposalsRate.cgreaterFifty.push(d.uname);
    } else if (proposals > (10 * maxProposalsPoints) / 100) {
      ProposalsRate.bgreaterTen += 1;
      studentProposalsRate.bgreaterTen.push(d.uname);
    } else if (proposals <= (10 * maxProposalsPoints) / 100) {
      ProposalsRate.alessEqualTen += 1;
      studentProposalsRate.alessEqualTen.push(d.uname);
    }
    if (question > (100 * maxQuestionsPoints) / 100) {
      QuestionsRate.dgreaterHundred += 1;
      studentQuestionsRate.dgreaterHundred.push(d.uname);
    } else if (question > (50 * maxQuestionsPoints) / 100) {
      QuestionsRate.cgreaterFifty += 1;
      studentQuestionsRate.cgreaterFifty.push(d.uname);
    } else if (question > (10 * maxQuestionsPoints) / 100) {
      QuestionsRate.bgreaterTen += 1;
      studentQuestionsRate.bgreaterTen.push(d.uname);
    } else if (question <= (10 * maxQuestionsPoints) / 100) {
      QuestionsRate.alessEqualTen += 1;
      studentQuestionsRate.alessEqualTen.push(d.uname);
    }
    console.log({ proposals, ProposalsRate });
  });

  stackedBarStats.push(ProposalsRate);
  stackedBarStats.push(QuestionsRate);
  return {
    stackedBarStats: stackedBarStats,
    studentStackedBarProposalsStats: studentProposalsRate,
    studentStackedBarQuestionsStats: studentQuestionsRate,
  };
};
