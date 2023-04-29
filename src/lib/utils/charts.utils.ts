import moment from "moment";
import {
  ISemester,
  ISemesterStudent,
  ISemesterStudentStat,
  ISemesterStudentStatChapter,
  ISemesterStudentVoteStat,
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

const initialRate = (index: number): StackedBarStats => {
  return {
    index,
    alessEqualTen: 0,
    bgreaterTen: 0,
    cgreaterFifty: 0,
    dgreaterHundred: 0,
  };
};

const initialStudentsRate: StudentStackedBarStatsObject = {
  alessEqualTen: [],
  bgreaterTen: [],
  cgreaterFifty: [],
  dgreaterHundred: [],
};
export const getStackedBarStat = (
  data: SemesterStudentVoteStat[],
  students: ISemesterStudent[],
  maxProposalsPoints: number,
  maxQuestionsPoints: number,
  maxDailyPractices: number
): StackedBarStatsData => {
  console.log({ daaaaata: data });
  const stackedBarStats: StackedBarStats[] = [];

  const studentProposalsRate: StudentStackedBarStatsObject = initialStudentsRate;
  const studentQuestionsRate: StudentStackedBarStatsObject = initialStudentsRate;
  const studentDailyPracticeRate: StudentStackedBarStatsObject = initialStudentsRate;

  const ProposalsRate = initialRate(0);
  const QuestionsRate = initialRate(1);
  const dailyPracticeRate = initialRate(2);

  const sortedByProposals = [...data].sort((x, y) => y.proposalPoints! - x.proposalPoints!);
  const sortedByQuestions = [...data].sort((x, y) => y.questionPoints! - x.questionPoints!);
  const sortedByDailyPractices = [...data].sort((x, y) => y.totalPractices! - x.totalPractices!);

  sortedByProposals.map(d => {
    const proposals = d.proposalPoints!;
    if (!proposals) return;

    const proposalSubgroup = getStudentSubgroupInBars(proposals, maxProposalsPoints);
    const student = students.find(student => student.uname === d.uname);
    if (!student) return;

    ProposalsRate[proposalSubgroup] += 1;
    const exist = studentProposalsRate[proposalSubgroup as keyof StudentStackedBarStats].some(
      e => e.uname === student.uname
    );
    if (!exist) return;
    studentProposalsRate[proposalSubgroup as keyof StudentStackedBarStats].push(student);
  });
  sortedByQuestions.map(d => {
    const question = d.questionPoints!;
    if (!question) return;

    const questionsSubgroup = getStudentSubgroupInBars(question, maxQuestionsPoints);
    const student = students.find(student => student.uname === d.uname);
    if (!student) return;

    QuestionsRate[questionsSubgroup] += 1;
    const exist = studentQuestionsRate[questionsSubgroup as keyof StudentStackedBarStats].some(
      e => e.uname === student.uname
    );
    if (!exist) return;

    studentQuestionsRate[questionsSubgroup as keyof StudentStackedBarStats].push(student);
  });

  sortedByDailyPractices.map(d => {
    const totalPractices = d.totalPractices!;
    if (!totalPractices) return;

    const totalPracticesSubgroup = getStudentSubgroupInBars(totalPractices, maxDailyPractices);
    const student = students.find(student => student.uname === d.uname);
    if (!student) return;

    dailyPracticeRate[totalPracticesSubgroup] += 1;
    const exist = studentDailyPracticeRate[totalPracticesSubgroup as keyof StudentStackedBarStats].some(
      e => e.uname === student.uname
    );
    if (!exist) return;

    studentDailyPracticeRate[totalPracticesSubgroup as keyof StudentStackedBarStats].push(student);
  });

  stackedBarStats.push(ProposalsRate);
  stackedBarStats.push(QuestionsRate);
  stackedBarStats.push(dailyPracticeRate);
  return {
    stackedBarStats: stackedBarStats,
    studentStackedBarProposalsStats: studentProposalsRate,
    studentStackedBarQuestionsStats: studentQuestionsRate,
    studentStackedBarDailyPracticeStats: studentDailyPracticeRate,
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
      };
      return { ...acuStudent, [key]: sumsStudents };
    }, acu);
  });

  // [{date,value},{date,value},{date,value}]
  return Object.entries(resByDay).map(([date, value]) => ({ date, value }));
};

const sumPerDay = (day: any) => {
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
export const mapStudentsStatsDataByDates = (data: ISemesterStudentVoteStat[]): MappedData[] => {
  // resByStudents: [{d1,d2},{d1,d3}]

  const resByStudents = data.map(student => {
    return student.days.reduce((acu: any, cur) => {
      const responseSumChapterPerDay = { day: cur.day, chaptersSum: sumPerDay(cur) };
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
