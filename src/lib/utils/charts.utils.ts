import { ISemesterStudent, ISemesterStudentStat, ISemesterStudentStatChapter } from "src/types/ICourse";

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

const getInitialSumChapterPerDay = () => {
  const init: GeneralSemesterStudentsStats = {
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
