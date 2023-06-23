import {
  ISemester,
  ISemesterStudent,
  ISemesterStudentStat,
  ISemesterStudentStatChapter,
  ISemesterStudentVoteStat,
  ISemesterStudentVoteStatDay,
} from "src/types/ICourse";

import {
  BubbleStats,
  GeneralSemesterStudentsStats,
  MappedData,
  SemesterStudentVoteStat,
  StackedBarStats,
  Trends,
} from "../../instructorsTypes";
import { SnapshotChangesTypes } from "../../types";
import { differentBetweenDays } from "./date.utils";

export type TrendStats = {
  childProposals: Trends[];
  editProposals: Trends[];
  proposedLinks: Trends[];
  nodes: Trends[];
  votes: Trends[];
  questions: Trends[];
};

export type StudentStackBarThresholds =
  | "threshold1"
  | "threshold2"
  | "threshold3"
  | "threshold4"
  | "threshold5"
  | "threshold6";

export type StudentStackedBarStatsObject = { [key in StudentStackBarThresholds]: ISemesterStudent[] };

export type StackedBarStatsData = {
  stackedBarStats: StackedBarStats[];
  studentStackedBarProposalsStats: StudentStackedBarStatsObject;
  studentStackedBarQuestionsStats: StudentStackedBarStatsObject;
  studentStackedBarDailyPracticeStats: StudentStackedBarStatsObject;
};

export type StudentBarsSubgroupLocation = {
  proposals: number;
  questions: number;
  totalDailyPractices: number;
};

export type BoxChapterStat = {
  [key: string]: number;
};

export type Chapter = {
  [key: string]: number[];
};

export type BoxChapterStats = {
  [key: string]: number[];
};

export type BoxTypeStat = {
  data: BoxChapterStats;
  min: number;
  max: number;
};

export type BoxStudentsStats = {
  proposalsPoints: BoxTypeStat;
  questionsPoints: BoxTypeStat;
  votesPoints: BoxTypeStat;
  practicePoints: BoxTypeStat;
};
export type BoxStudentStats = {
  proposalsPoints: BoxChapterStat;
  questionsPoints: BoxChapterStat;
  votesPoints: BoxChapterStat;
  practicePoints: BoxChapterStat;
};

type VoteStatsPoints = { questionPoints: number; proposalPoints: number; votePoints: number };

export const calculateVoteStatPoints = (voteStat: ISemesterStudentVoteStat, semester: ISemester): VoteStatsPoints => {
  console.log({ voteStat, semester });
  return (voteStat.days || [])
    .map(statDay => {
      const gotQuestionPoint = statDay.questionProposals >= semester.questionProposals.numQuestionsPerDay;
      const gotNodeProposalsPoint = statDay.proposals >= semester.nodeProposals.numProposalPerDay;

      // const questionHasValidDates = () => {
      //   return true;
      //   const { startDate, endDate } = semester.questionProposals;
      //   return currentDayIsBetween(startDate.toDate(), endDate.toDate());
      // };

      // const proposalsHasValidDates = () => {
      //   return true;
      //   const { startDate, endDate } = semester.nodeProposals;
      //   return currentDayIsBetween(startDate.toDate(), endDate.toDate());
      // };

      // if data on DB is created in correct range, is not required validate
      // in other case wont work when when current Date is greater than End Date

      return {
        questionPoints: gotQuestionPoint ? semester.questionProposals.numPoints : 0,
        proposalPoints: gotNodeProposalsPoint ? semester.nodeProposals.numPoints : 0,
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

// const currentDayIsBetween = (startDate: Date, endDate: Date) =>
//   moment(startDate).isSameOrAfter(moment()) && moment(endDate).isSameOrBefore(moment());

// TODO: test

const initialRate = (index: number): StackedBarStats => {
  return {
    index,
    threshold1: 0,
    threshold2: 0,
    threshold3: 0,
    threshold4: 0,
    threshold5: 0,
    threshold6: 0,
  };
};

const getInitialStudentsRate = (): StudentStackedBarStatsObject => ({
  threshold1: [],
  threshold2: [],
  threshold3: [],
  threshold4: [],
  threshold5: [],
  threshold6: [],
});
export const getStackedBarStat = (
  data: SemesterStudentVoteStat[],
  students: ISemesterStudent[],
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

  const { nodeProposals, questionProposals, dailyPractice } = semesterConfig;
  const maxProposalsPoints =
    nodeProposals.numProposalPerDay *
    differentBetweenDays(nodeProposals.endDate.toDate(), nodeProposals.startDate.toDate());
  const maxQuestionsPoints =
    questionProposals.numQuestionsPerDay *
    differentBetweenDays(questionProposals.endDate.toDate(), questionProposals.startDate.toDate());
  const maxDailyPractices =
    dailyPractice.numQuestionsPerDay *
    differentBetweenDays(dailyPractice.endDate.toDate(), dailyPractice.startDate.toDate());

  console.log({ maxProposalsPoints, maxQuestionsPoints, maxDailyPractices });
  data.forEach(studentData => {
    const student = students.find(student => student.uname === studentData.uname);
    if (!student) return;

    const res = studentData.days.reduce(
      (acu, cur) => {
        const gotProposalPoint = cur.proposals >= semesterConfig.nodeProposals.numProposalPerDay;
        const gotQuestionPoint = cur.questionProposals >= semesterConfig.questionProposals.numQuestionsPerDay;
        const gotPracticePoint = cur.correctPractices >= semesterConfig.dailyPractice.numQuestionsPerDay;
        return {
          proposalsPoints: acu.proposalsPoints + (gotProposalPoint ? semesterConfig.nodeProposals.numPoints : 0),
          questionsPoints: acu.questionsPoints + (gotQuestionPoint ? semesterConfig.questionProposals.numPoints : 0),
          practicePoints: acu.practicePoints + (gotPracticePoint ? semesterConfig.dailyPractice.numPoints : 0),
        };
      },
      { proposalsPoints: 0, questionsPoints: 0, practicePoints: 0 }
    );

    // console.log({
    //   name: student.fName,
    //   pp: {
    //     points: semesterConfig.nodeProposals.numProposalPerDay,
    //     d: studentData.days.filter(c => c.proposals >= semesterConfig.nodeProposals.numProposalPerDay).length,
    //   },
    //   qq: {
    //     points: semesterConfig.questionProposals.numQuestionsPerDay,
    //     d: studentData.days.filter(c => c.questionProposals >= semesterConfig.questionProposals.numQuestionsPerDay)
    //       .length,
    //   },
    //   dp: {
    //     points: semesterConfig.dailyPractice.numQuestionsPerDay,
    //     d: studentData.days.filter(c => c.correctPractices >= semesterConfig.dailyPractice.numQuestionsPerDay).length,
    //   },
    // });

    const { practicePoints, proposalsPoints, questionsPoints } = res;
    // console.log({ practicePoints, proposalsPoints, questionsPoints });
    const proposalSubgroup = getStudentSubgroupInBars(proposalsPoints, maxProposalsPoints);
    const questionsSubgroup = getStudentSubgroupInBars(questionsPoints, maxQuestionsPoints);
    const totalPracticesSubgroup = getStudentSubgroupInBars(practicePoints, maxDailyPractices);
    // console.log({ proposalSubgroup, questionsSubgroup, totalPracticesSubgroup });
    ProposalsRate[proposalSubgroup] += 1;
    QuestionsRate[questionsSubgroup] += 1;
    dailyPracticeRate[totalPracticesSubgroup] += 1;

    const existA = studentProposalsRate[proposalSubgroup].some(e => e.uname === student.uname);
    if (existA) return;
    studentProposalsRate[proposalSubgroup].push(student);

    const existB = studentQuestionsRate[questionsSubgroup].some(e => e.uname === student.uname);
    if (existB) return;
    studentQuestionsRate[questionsSubgroup].push(student);

    const existC = studentDailyPracticeRate[totalPracticesSubgroup].some(e => e.uname === student.uname);
    if (existC) return;
    studentDailyPracticeRate[totalPracticesSubgroup].push(student);
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

export const getStudentSubgroupInBars = (points: number, maxPoints: number): StudentStackBarThresholds => {
  if (points > (85 * maxPoints) / 100) return "threshold6";
  if (points > (70 * maxPoints) / 100) return "threshold5";
  if (points > (40 * maxPoints) / 100) return "threshold4";
  if (points > (10 * maxPoints) / 100) return "threshold3";
  if (points >= (0 * maxPoints) / 100) return "threshold2";
  return "threshold1";
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

export const mapStudentStatsSumByStudents = (data: ISemesterStudentVoteStat[]): SumStudentStats[] => {
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

export type SumStudentStats = { [date: string]: GeneralSemesterStudentsStats };

export const getMaximumStudentPoints = (sumStatsByStudents: SumStudentStats[]): GeneralSemesterStudentsStats => {
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

export const groupStudentPointsDayChapter = (
  userDailyStat: ISemesterStudentStat,
  type: string,
  numPoints = 1,
  numTypePerDay = 1,
  agreementPoints = 1,
  disagreementPoints = 1
) => {
  // console.log({ userDailyStat });
  const groupedDays = userDailyStat.days.reduce((acuDayPerStudent: { [key: string]: number }, curDayPerStudent) => {
    const groupedChapters = curDayPerStudent.chapters.reduce((acuChapter: { [key: string]: number }, curChapter) => {
      if (type in curChapter) {
        const dd = { data: curChapter[type as keyof ISemesterStudentStatChapter] as number, title: curChapter.title };
        return { ...acuChapter, [dd.title]: (acuChapter[dd.title] ?? 0) + (dd.data * numPoints) / numTypePerDay };
      } else if (type === "votes") {
        const dd = {
          data:
            curChapter["agreementsWithInst"] * agreementPoints +
            curChapter["disagreementsWithInst"] * disagreementPoints,
          title: curChapter.title,
        };
        return { ...acuChapter, [dd.title]: (acuChapter[dd.title] ?? 0) + dd.data };
      }
      return { ...acuChapter };
    }, {});
    return Object.keys(groupedChapters).reduce(
      (prev, key) => {
        return { ...prev, [key]: (prev[key] ?? 0) + groupedChapters[key] };
      },
      { ...acuDayPerStudent }
    );
  }, {});

  return groupedDays;
};

export const getBoxPlotData = (
  userDailyStats: ISemesterStudentStat[],
  type: string,
  numPoints = 1,
  numTypePerDay = 1,
  agreementPoints = 1,
  disagreementPoints = 1
) => {
  // days -> chapters -> data
  //
  // proposal=> chapters => [1,2,34,54]
  // console.log({ userDailyStatssss: userDailyStats });
  const res = userDailyStats.map(cur => {
    // [{c1:1,c2:3},{c1:1,c2:3}]
    const groupedDays = groupStudentPointsDayChapter(
      cur,
      type,
      numPoints,
      numTypePerDay,
      agreementPoints,
      disagreementPoints
    );

    return groupedDays;
  });
  const res2 = res.reduce((acu: { [key: string]: number[] }, cur) => {
    // const prevData: number[] = acu[key] ?? [];
    const merged = Object.keys(cur).reduce(
      (prev: { [key: string]: number[] }, key) => {
        const prevData: number[] = prev[key] ?? [];
        return { ...prev, [key]: [...prevData, cur[key]] };
      },
      { ...acu }
    );
    return merged;
    // {c1:[1,2,23],c2:[1,23,4]}
  }, {});

  return res2;
};

export const getMaxMinVoxPlotData = (boxPlotData: { [x: string]: number[] }) => {
  return Object.keys(boxPlotData).reduce(
    (acu, cur) => {
      const minArray = Math.min(...boxPlotData[cur]);
      const newMin = acu.min > minArray ? minArray : acu.min;
      const maxArray = Math.max(...boxPlotData[cur]);
      const newMax = acu.max < maxArray ? maxArray : acu.max;
      return { min: newMin, max: newMax };
    },
    { min: 10000, max: 0 }
  );
};

const findBubble = (bubbles: BubbleStats[], votes: number, votePoints: number): number => {
  const index = bubbles.findIndex(b => b.points === votePoints && b.votes === votes);
  return index;
};

type BubbleStatsData = {
  bubbleStats: BubbleStats[];
  maxVote: number;
  maxVotePoints: number;
  minVote: number;
  minVotePoints: number;
};

export const getBubbleStats = (
  data: SemesterStudentVoteStat[],
  students: ISemesterStudent[] | null
): BubbleStatsData => {
  const bubbleStats: BubbleStats[] = [];
  let maxVote: number = 0;
  let maxVotePoints: number = 0;
  let minVote: number = 1000;
  let minVotePoints: number = 1000;

  if (!students)
    return {
      bubbleStats,
      maxVote,
      maxVotePoints,
      minVote,
      minVotePoints,
    };

  data.map(d => {
    let bubbleStat: BubbleStats = {
      students: 0,
      votes: 0,
      points: 0,
      studentsList: [],
    };
    const votes = d.agreementsWithInst + d.disagreementsWithInst;
    const votePoints = d.votePoints!;
    const index = findBubble(bubbleStats, votes, votePoints);

    const studentObject: ISemesterStudent | undefined = students.find((user: any) => user.uname === d.uname);

    if (index >= 0) {
      bubbleStats[index].students += 1;
      if (studentObject) bubbleStat.studentsList.push(studentObject);
    } else {
      bubbleStat.votes = votes;
      bubbleStat.points = votePoints;
      bubbleStat.students += 1;
      if (studentObject) bubbleStat.studentsList = [studentObject];
      bubbleStats.push(bubbleStat);
    }
    if (votes > maxVote) maxVote = votes;
    if (votePoints > maxVotePoints) maxVotePoints = votePoints;
    if (votes < minVote) minVote = votes;
    if (votePoints < minVotePoints) minVotePoints = votePoints;
  });
  console.log({ bubbleStats });
  return {
    bubbleStats,
    maxVote: maxVote + 10,
    maxVotePoints: maxVotePoints + 10,
    minVote: minVote - 10,
    minVotePoints: minVotePoints - 10,
  };
};
