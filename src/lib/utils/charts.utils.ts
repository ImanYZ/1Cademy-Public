import moment from "moment";
import {
  ISemester,
  ISemesterStudent,
  ISemesterStudentStat,
  ISemesterStudentStatChapter,
  ISemesterStudentVoteStat,
  ISemesterStudentVoteStatDay,
} from "src/types/ICourse";

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
  TrendStats,
} from "../../pages/instructors/dashboard";
import { SnapshotChangesTypes } from "../../types";
import { differentBetweenDays } from "./date.utils";

type VoteStatsPoints = { questionPoints: number; proposalPoints: number; votePoints: number };

export const calculateVoteStatPoints = (voteStat: ISemesterStudentVoteStat, semester: ISemester): VoteStatsPoints => {
  return (voteStat.days || [])
    .map(statDay => {
      const gotQuestionPoint = statDay.questionProposals >= semester.questionProposals.numQuestionsPerDay;
      const gotNodeProposalsPoint = statDay.proposals >= semester.nodeProposals.numProposalPerDay;

      const questionHasValidDates = () => {
        const { startDate, endDate } = semester.questionProposals;
        return currentDayIsBetween(startDate.toDate(), endDate.toDate());
      };

      const proposalsHasValidDates = () => {
        const { startDate, endDate } = semester.nodeProposals;
        return currentDayIsBetween(startDate.toDate(), endDate.toDate());
      };

      return {
        questionPoints: questionHasValidDates() && gotQuestionPoint ? semester.questionProposals.numPoints : 0,
        proposalPoints: proposalsHasValidDates() && gotNodeProposalsPoint ? semester.nodeProposals.numPoints : 0,
        votePoints:
          statDay.agreementsWithInst * semester.votes.pointIncrementOnAgreement -
          statDay.disagreementsWithInst * semester.votes.pointDecrementOnAgreement,
      };
    })
    .reduce(
      (acu: VoteStatsPoints, cur) => ({
        questionPoints: acu.questionPoints + cur.questionPoints,
        proposalPoints: acu.proposalPoints + cur.proposalPoints,
        votePoints: acu.votePoints + cur.votePoints,
      }),
      { questionPoints: 0, proposalPoints: 0, votePoints: 0 }
    );
};

const currentDayIsBetween = (startDate: Date, endDate: Date) =>
  moment(startDate).isSameOrAfter(moment()) && moment(endDate).isSameOrBefore(moment());

// TODO: test

const initialRate = (index: number): StackedBarStats => {
  return {
    index,
    alessEqualTen: 0,
    bgreaterTen: 0,
    cgreaterFifty: 0,
    dgreaterHundred: 0,
  };
};

const getInitialStudentsRate = (): StudentStackedBarStatsObject => ({
  alessEqualTen: [],
  bgreaterTen: [],
  cgreaterFifty: [],
  dgreaterHundred: [],
});
export const getStackedBarStat = (
  data: SemesterStudentVoteStat[],
  students: ISemesterStudent[],
  maxPr: number,
  maxQu: number,
  maxD: number,
  semesterConfig: ISemester
): StackedBarStatsData => {
  console.log({ daaaaata: data, students, semesterConfig });
  const stackedBarStats: StackedBarStats[] = [];

  const studentProposalsRate: StudentStackedBarStatsObject = getInitialStudentsRate();
  const studentQuestionsRate: StudentStackedBarStatsObject = getInitialStudentsRate();
  const studentDailyPracticeRate: StudentStackedBarStatsObject = getInitialStudentsRate();
  console.log({ studentQuestionsRate });

  const ProposalsRate = initialRate(0);
  const QuestionsRate = initialRate(1);
  const dailyPracticeRate = initialRate(2);

  // const sortedByProposals = [...data].sort((x, y) => y.proposalPoints! - x.proposalPoints!);
  // const sortedByQuestions = [...data].sort((x, y) => y.questionPoints! - x.questionPoints!);
  // const sortedByDailyPractices = [...data].sort((x, y) => y.totalPractices! - x.totalPractices!);

  // console.log({ sortedByProposals, sortedByQuestions, sortedByDailyPractices });

  const maxProposalsPoints =
    semesterConfig.nodeProposals.numProposalPerDay *
    differentBetweenDays(
      semesterConfig.nodeProposals.endDate.toDate(),
      semesterConfig.nodeProposals.startDate.toDate()
    );
  const maxQuestionsPoints =
    semesterConfig.questionProposals.numQuestionsPerDay *
    differentBetweenDays(
      semesterConfig.questionProposals.endDate.toDate(),
      semesterConfig.questionProposals.startDate.toDate()
    );
  const maxDailyPractices =
    semesterConfig.dailyPractice.numQuestionsPerDay *
    differentBetweenDays(
      semesterConfig.dailyPractice.endDate.toDate(),
      semesterConfig.dailyPractice.startDate.toDate()
    );

  console.log({ maxProposalsPoints, maxQuestionsPoints, maxDailyPractices });
  data.forEach(studentData => {
    const student = students.find(student => student.uname === studentData.uname);
    if (!student) return;

    const res = studentData.days.reduce(
      (a, c) => {
        return {
          proposalsPoints:
            a.proposalsPoints +
            (c.proposals >= semesterConfig.nodeProposals.numProposalPerDay
              ? semesterConfig.nodeProposals.numPoints
              : 0),
          questionsPoints:
            a.questionsPoints +
            (c.questionProposals >= semesterConfig.questionProposals.numQuestionsPerDay
              ? semesterConfig.questionProposals.numPoints
              : 0),
          practicePoints:
            a.practicePoints +
            (c.correctPractices >= semesterConfig.dailyPractice.numQuestionsPerDay
              ? semesterConfig.dailyPractice.numPoints
              : 0),
        };
      },
      { proposalsPoints: 0, questionsPoints: 0, practicePoints: 0 }
    );

    console.log({
      name: student.fName,
      pp: {
        points: semesterConfig.nodeProposals.numProposalPerDay,
        d: studentData.days.filter(c => c.proposals >= semesterConfig.nodeProposals.numProposalPerDay).length,
      },
      qq: {
        points: semesterConfig.questionProposals.numQuestionsPerDay,
        d: studentData.days.filter(c => c.questionProposals >= semesterConfig.questionProposals.numQuestionsPerDay)
          .length,
      },
      dp: {
        points: semesterConfig.dailyPractice.numQuestionsPerDay,
        d: studentData.days.filter(c => c.correctPractices >= semesterConfig.dailyPractice.numQuestionsPerDay).length,
      },
    });

    const { practicePoints, proposalsPoints, questionsPoints } = res;
    console.log({ practicePoints, proposalsPoints, questionsPoints });
    const proposalSubgroup = getStudentSubgroupInBars(proposalsPoints, maxProposalsPoints);
    const questionsSubgroup = getStudentSubgroupInBars(questionsPoints, maxQuestionsPoints);
    const totalPracticesSubgroup = getStudentSubgroupInBars(practicePoints, maxDailyPractices);
    console.log({ proposalSubgroup, questionsSubgroup, totalPracticesSubgroup });
    ProposalsRate[proposalSubgroup] += 1;
    QuestionsRate[questionsSubgroup] += 1;
    dailyPracticeRate[totalPracticesSubgroup] += 1;

    const existA = studentProposalsRate[proposalSubgroup as keyof StudentStackedBarStats].some(
      e => e.uname === student.uname
    );
    if (existA) return;
    studentProposalsRate[proposalSubgroup as keyof StudentStackedBarStats].push(student);

    const existB = studentQuestionsRate[questionsSubgroup as keyof StudentStackedBarStats].some(
      e => e.uname === student.uname
    );
    if (existB) return;
    studentQuestionsRate[questionsSubgroup as keyof StudentStackedBarStats].push(student);

    const existC = studentDailyPracticeRate[totalPracticesSubgroup as keyof StudentStackedBarStats].some(
      e => e.uname === student.uname
    );
    if (existC) return;
    studentDailyPracticeRate[totalPracticesSubgroup as keyof StudentStackedBarStats].push(student);
  });

  stackedBarStats.push(ProposalsRate);
  stackedBarStats.push(QuestionsRate);
  stackedBarStats.push(dailyPracticeRate);

  console.log("1", { studentQuestionsRate });
  return {
    stackedBarStats: stackedBarStats,
    studentStackedBarProposalsStats: studentProposalsRate,
    studentStackedBarQuestionsStats: studentQuestionsRate,
    studentStackedBarDailyPracticeStats: studentDailyPracticeRate,
  };
};

export const getStudentSubgroupInBars = (points: number, maxPoints: number): keyof StackedBarStats => {
  if (points >= (85 * maxPoints) / 100) return "dgreaterHundred";
  if (points > (50 * maxPoints) / 100) return "cgreaterFifty";
  if (points > (10 * maxPoints) / 100) return "bgreaterTen";
  return "alessEqualTen";
};

const getInitialSumChapterPerDay = (): GeneralSemesterStudentsStats => ({
  childProposals: 0,
  editProposals: 0,
  links: 0,
  nodes: 0,
  questions: 0,
  votes: 0,
  correctPractices: 0,
});

const sumChapterPerDay = (chapters: ISemesterStudentStatChapter[]) => {
  const initialValue = getInitialSumChapterPerDay();
  return chapters.reduce(
    (a: GeneralSemesterStudentsStats, c) => ({
      ...a,
      childProposals: a.childProposals + c.nodes,
      editProposals: a.editProposals + c.nodes + c.proposals,
      links: a.links + c.links,
      nodes: a.nodes + c.newNodes, // TODO: check this
      questions: a.questions + c.questions,
      votes: a.votes + c.agreementsWithInst + c.disagreementsWithInst,
    }),
    initialValue
  );
};

// TODO: test
export const mapStudentsStatsToDataByDates = (data: ISemesterStudentStat[]): MappedData[] => {
  // resByStudents: [{d1,d2},{d1,d3}]
  const resByStudents = data.map(student => {
    return student.days.reduce((acu: { [key: string]: GeneralSemesterStudentsStats }, cur) => {
      console.log("curcur", cur);
      const responseSumChapterPerDay = { day: cur.day, chaptersSum: sumChapterPerDay(cur.chapters ?? []) };

      const prevDay = acu[cur.day] ?? getInitialSumChapterPerDay();
      const sum: GeneralSemesterStudentsStats = {
        childProposals: prevDay.childProposals + responseSumChapterPerDay.chaptersSum.childProposals,
        editProposals: prevDay.editProposals + responseSumChapterPerDay.chaptersSum.editProposals,
        links: prevDay.links + responseSumChapterPerDay.chaptersSum.links,
        nodes: prevDay.nodes + responseSumChapterPerDay.chaptersSum.nodes,
        questions: prevDay.questions + responseSumChapterPerDay.chaptersSum.questions,
        votes: prevDay.votes + responseSumChapterPerDay.chaptersSum.votes,
        correctPractices: prevDay.correctPractices + responseSumChapterPerDay.chaptersSum.correctPractices,
      };
      return { ...acu, [cur.day]: sum };
    }, {});
  });

  // resByDay: {d1,d2,d3}
  const resByDay = resByStudents.reduce((acu, cur) => {
    return Object.entries(cur).reduce((acuStudent: { [key: string]: GeneralSemesterStudentsStats }, [key, value]) => {
      const prevStudent = acuStudent[key] ?? getInitialSumChapterPerDay();
      const sumsStudents: GeneralSemesterStudentsStats = {
        childProposals: prevStudent.childProposals + value.childProposals,
        editProposals: prevStudent.editProposals + value.editProposals,
        links: prevStudent.links + value.links,
        nodes: prevStudent.nodes + value.nodes,
        questions: prevStudent.questions + value.questions,
        votes: prevStudent.votes + value.votes,
        correctPractices: prevStudent.correctPractices + value.correctPractices,
      };
      return { ...acuStudent, [key]: sumsStudents };
    }, acu);
  });

  // [{date,value},{date,value},{date,value}]
  return Object.entries(resByDay).map(([date, value]) => ({ date, value }));
};

const sumPerDay = (day: ISemesterStudentVoteStatDay) => {
  return {
    ...day,
    childProposals: day.nodes,
    editProposals: day.proposals - day.nodes,
    links: day.links,
    nodes: day.newNodes,
    questions: day.questions,
    votes: day.agreementsWithInst + day.disagreementsWithInst,
    correctPractices: day.correctPractices,
  };
};

// TODO: test
// TODO: check this is similar to 250

/**
 * Will map data into: [ {date,value}, {date,value}, ...]
 */
export const mapStudentsStatsDataByDates = (data: ISemesterStudentVoteStat[]): MappedData[] => {
  // resByStudents: [{d1,d2},{d1,d3}]

  const resByStudents = mapStudentStatsSumByStudents(data);

  // resByDay: {d1,d2,d3}
  const resByDay = resByStudents.reduce((acu, cur) => {
    return Object.entries(cur).reduce((acuStudent: { [key: string]: GeneralSemesterStudentsStats }, [key, value]) => {
      const prevStudent = acuStudent[key] ?? getInitialSumChapterPerDay();
      const sumsStudents: GeneralSemesterStudentsStats = {
        childProposals: prevStudent.childProposals + value.childProposals,
        editProposals: prevStudent.editProposals + value.editProposals,
        links: prevStudent.links + value.links,
        nodes: prevStudent.nodes + value.nodes,
        questions: prevStudent.questions + value.questions,
        votes: prevStudent.votes + value.votes,
        correctPractices: prevStudent.correctPractices + value.correctPractices,
      };
      return { ...acuStudent, [key]: sumsStudents };
    }, acu);
  }, {});

  // [{date,value},{date,value},{date,value}]
  return Object.entries(resByDay).map(([date, value]: any) => ({ date, value }));
};

/**
 * Will map data into: [ {date,value}, {date,value}, ...]
 */
export const mapStudentsStatsDataByDates2 = (data: { [x: string]: GeneralSemesterStudentsStats }[]): MappedData[] => {
  // resByDay: {d1,d2,d3}
  const resByDay = data.reduce((acu, cur) => {
    return Object.entries(cur).reduce((acuStudent: { [key: string]: GeneralSemesterStudentsStats }, [key, value]) => {
      const prevStudent = acuStudent[key] ?? getInitialSumChapterPerDay();
      const sumsStudents: GeneralSemesterStudentsStats = {
        childProposals: prevStudent.childProposals + value.childProposals,
        editProposals: prevStudent.editProposals + value.editProposals,
        links: prevStudent.links + value.links,
        nodes: prevStudent.nodes + value.nodes,
        questions: prevStudent.questions + value.questions,
        votes: prevStudent.votes + value.votes,
        correctPractices: prevStudent.correctPractices + value.correctPractices,
      };
      return { ...acuStudent, [key]: sumsStudents };
    }, acu);
  }, {});

  // [{date,value},{date,value},{date,value}]
  return Object.entries(resByDay).map(([date, value]: any) => ({ date, value }));
};

export const mapStudentStatsSumByStudents = (
  data: ISemesterStudentVoteStat[]
): { [x: string]: GeneralSemesterStudentsStats }[] => {
  // resByStudents: [{d1,d2},{d1,d3}]

  const resByStudents = data.map(student => {
    return student.days.reduce((acu: { [key: string]: GeneralSemesterStudentsStats }, cur) => {
      const responseSumChapterPerDay = { day: cur.day, chaptersSum: sumPerDay(cur) };
      const sum: GeneralSemesterStudentsStats = {
        childProposals: responseSumChapterPerDay.chaptersSum.childProposals,
        editProposals: responseSumChapterPerDay.chaptersSum.editProposals,
        links: responseSumChapterPerDay.chaptersSum.links,
        nodes: responseSumChapterPerDay.chaptersSum.nodes,
        questions: responseSumChapterPerDay.chaptersSum.questions,
        votes: responseSumChapterPerDay.chaptersSum.votes,
        correctPractices: responseSumChapterPerDay.chaptersSum.correctPractices,
      };
      return { ...acu, [cur.day]: sum };
    }, {});
  });
  return resByStudents;
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
      correctPractices: acu.correctPractices + cur.value.correctPractices,
    };
    return sumsStudents;
  }, getInitialSumChapterPerDay());
};

export const getMaximumStudentPoints = (
  sumStatsByStudents: { [x: string]: GeneralSemesterStudentsStats }[]
): GeneralSemesterStudentsStats => {
  const studentSumStats: GeneralSemesterStudentsStats[] = sumStatsByStudents.map(studentStats => {
    return Object.keys(studentStats).reduce((acu: GeneralSemesterStudentsStats, key) => {
      const stats: GeneralSemesterStudentsStats = studentStats[key];
      const res: GeneralSemesterStudentsStats = {
        childProposals: acu.childProposals + stats.childProposals,
        correctPractices: acu.correctPractices + stats.correctPractices,
        editProposals: acu.editProposals + stats.editProposals,
        links: acu.links + stats.links,
        nodes: acu.nodes + stats.nodes,
        questions: acu.questions + stats.questions,
        votes: acu.votes + stats.votes,
      };
      return res;
    }, getInitialSumChapterPerDay());
  });

  const maxStudentStats = studentSumStats.reduce((acu: GeneralSemesterStudentsStats, cur) => {
    return {
      childProposals: Math.max(acu.childProposals, cur.childProposals),
      correctPractices: Math.max(acu.correctPractices, cur.correctPractices),
      editProposals: Math.max(acu.editProposals, cur.editProposals),
      links: Math.max(acu.links, cur.links),
      nodes: Math.max(acu.nodes, cur.nodes),
      questions: Math.max(acu.questions, cur.questions),
      votes: Math.max(acu.votes, cur.votes),
    };
  }, getInitialSumChapterPerDay());

  return maxStudentStats;
};

export type SemesterStudentVoteStatChanges = { type: SnapshotChangesTypes; data: SemesterStudentVoteStat };

export const mergeSemesterStudentVoteStat = (
  previousStats: SemesterStudentVoteStat[],
  newStats: SemesterStudentVoteStatChanges[]
): SemesterStudentVoteStat[] => {
  return newStats.reduce((acu, cur) => {
    if (cur.type === "added") return [...acu, cur.data];
    if (cur.type === "modified") return acu.map(c => (c.uname === cur.data.uname ? cur.data : c));
    if (cur.type === "removed") return acu.filter(c => c.uname === cur.data.uname);
    return acu;
  }, previousStats);
};

export const getTrendsStats = (data: MappedData[], semesterConfig: ISemester) => {
  const { isProposalRequired, isQuestionProposalRequired, isCastingVotesRequired } = semesterConfig;
  const trendsStats = data.reduce((acu: TrendStats, cur): TrendStats => {
    const date = new Date(cur.date);
    return {
      childProposals: isProposalRequired ? [...acu.childProposals, { date, num: cur.value.childProposals }] : [],
      editProposals: isProposalRequired ? [...acu.editProposals, { date, num: cur.value.editProposals }] : [],
      proposedLinks: [...acu.proposedLinks, { date, num: cur.value.links }],
      nodes: [...acu.nodes, { date, num: cur.value.nodes }],
      questions: isQuestionProposalRequired ? [...acu.questions, { date, num: cur.value.questions }] : [],
      votes: isCastingVotesRequired ? [...acu.votes, { date, num: cur.value.votes }] : [],
    };
  }, getInitialTrendStats());
  return trendsStats;
};

export const getInitialTrendStats = (): TrendStats => ({
  childProposals: [],
  editProposals: [],
  proposedLinks: [],
  nodes: [],
  votes: [],
  questions: [],
});
