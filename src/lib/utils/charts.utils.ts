import moment from "moment";
import { ISemester, ISemesterStudent, ISemesterStudentVoteStat } from "src/types/ICourse";

import {
  GeneralSemesterStudentsStats,
  MappedData,
  SemesterStudentVoteStat,
  StackedBarStats,
} from "../../instructorsTypes";
import {
  StackedBarStatsData,
  StudentStackedBarStats,
  StudentStackedBarStatsObject,
} from "../../pages/instructors/dashboard";

export const calculateVoteStatPoints = (voteStat: ISemesterStudentVoteStat, semester: ISemester) => {
  return (voteStat.days || [])
    .map(statDay => {
      return {
        questionPoints:
          moment(semester.questionProposals.startDate).isSameOrAfter(moment()) &&
          moment(semester.questionProposals.endDate).isSameOrBefore(moment()) &&
          statDay.questionProposals >= semester.questionProposals.numQuestionsPerDay
            ? semester.questionProposals.numPoints
            : 0,
        proposalPoints:
          moment(semester.nodeProposals.startDate).isSameOrAfter(moment()) &&
          moment(semester.nodeProposals.endDate).isSameOrBefore(moment()) &&
          statDay.proposals >= semester.nodeProposals.numProposalPerDay
            ? semester.nodeProposals.numPoints
            : 0,
        votePoints:
          statDay.agreementsWithInst * semester.votes.pointIncrementOnAgreement -
          statDay.disagreementsWithInst * semester.votes.pointDecrementOnAgreement,
      };
    })
    .reduce(
      (c, item) => ({
        questionPoints: c.questionPoints + item.questionPoints,
        proposalPoints: c.proposalPoints + item.proposalPoints,
        votePoints: c.votePoints + item.votePoints,
      }),
      {
        questionPoints: 0,
        proposalPoints: 0,
        votePoints: 0,
      }
    );
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
  const sortedByProposals = [...data].sort((x, y) => y.proposalPoints! - x.proposalPoints!);
  const sortedByQuestions = [...data].sort((x, y) => y.questionPoints! - x.questionPoints!);
  sortedByProposals.map(d => {
    const proposals = d.proposalPoints!;
    const proposalSubgroup = getStudentSubgroupInBars(proposals, maxProposalsPoints);
    const student = students.find(student => student.uname === d.uname);
    if (!student) return;

    ProposalsRate[proposalSubgroup] += 1;
    studentProposalsRate[proposalSubgroup as keyof StudentStackedBarStats].push(student);
  });
  sortedByQuestions.map(d => {
    const question = d.questionPoints!;
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

const getInitialSumChapterPerDay = () => {
  const init: any = {
    childProposals: 0,
    editProposals: 0,
    links: 0,
    nodes: 0,
    questions: 0,
    votes: 0,
  };

  return init;
};

const sumChapterPerDay = (day: any) => {
  return {
    ...day,
    childProposals: day.nodes,
    editProposals: day.proposals - day.nodes,
    links: day.links,
    nodes: day.newNodes,
    questions: day.questions,
    votes: day.agreementsWithInst + day.disagreementsWithInst,
  };
};

// TODO: test
export const mapStudentsStatsToDataByDates = (data: ISemesterStudentVoteStat[]): MappedData[] => {
  // resByStudents: [{d1,d2},{d1,d3}]

  const resByStudents = data.map(student => {
    return student.days.reduce((acu: any, cur) => {
      const responseSumChapterPerDay = { day: cur.day, chaptersSum: sumChapterPerDay(cur) };
      const sum: any = {
        childProposals: responseSumChapterPerDay.chaptersSum.childProposals,
        editProposals: responseSumChapterPerDay.chaptersSum.editProposals,
        links: responseSumChapterPerDay.chaptersSum.links,
        nodes: responseSumChapterPerDay.chaptersSum.nodes,
        questions: responseSumChapterPerDay.chaptersSum.questions,
        votes: responseSumChapterPerDay.chaptersSum.votes,
      };
      return { ...acu, [cur.day]: sum };
    }, {});
  });

  // resByDay: {d1,d2,d3}
  const resByDay = resByStudents.reduce((acu, cur) => {
    return Object.entries(cur).reduce((acuStudent: any, [key, value]: any) => {
      const prevStudent = acuStudent[key] ?? getInitialSumChapterPerDay();
      const sumsStudents: GeneralSemesterStudentsStats = {
        childProposals: prevStudent.childProposals + value.childProposals,
        editProposals: prevStudent.editProposals + value.editProposals,
        links: prevStudent.links + value.links,
        nodes: prevStudent.nodes + value.nodes,
        questions: prevStudent.questions + value.questions,
        votes: prevStudent.votes + value.votes,
      };
      return { ...acuStudent, [key]: sumsStudents };
    }, acu);
  }, {});

  // [{date,value},{date,value},{date,value}]
  return Object.entries(resByDay).map(([date, value]: any) => ({ date, value }));
};

export const getGeneralStats = (data: MappedData[]) => {
  return data.reduce((acu: GeneralSemesterStudentsStats, cur) => {
    const sumsStudents: GeneralSemesterStudentsStats = {
      childProposals: acu.childProposals + cur.value.childProposals,
      editProposals: acu.editProposals + cur.value.editProposals,
      links: acu.links + cur.value.links,
      nodes: acu.nodes + cur.value.nodes,
      questions: acu.questions + cur.value.questions,
      votes: acu.votes + cur.value.votes,
    };
    return sumsStudents;
  }, getInitialSumChapterPerDay());
};
