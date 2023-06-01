import SquareIcon from "@mui/icons-material/Square";
import { Box, Paper, Stack, Tab, Tabs, Typography, useMediaQuery, useTheme } from "@mui/material";
import { collection, getFirestore, onSnapshot, query, where } from "firebase/firestore";
import React, { useCallback, useEffect, useState } from "react";

import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";

import { useWindowSize } from "../../../hooks/useWindowSize";
import {
  BubbleAxis,
  BubbleStats,
  GeneralSemesterStudentsStats,
  MaxPoints,
  SemesterStudentStat,
  SemesterStudentVoteStat,
  StackedBarStats,
} from "../../../instructorsTypes";
import { User, UserRole } from "../../../knowledgeTypes";
import {
  calculateVoteStatPoints,
  getGeneralStats,
  getStackedBarStat,
  mapStudentsStatsDataByDates,
} from "../../../lib/utils/charts.utils";
import { differentBetweenDays } from "../../../lib/utils/date.utils";
import { capitalizeFirstLetter } from "../../../lib/utils/string.utils";
import {
  BoxStudentsStats,
  BoxStudentStats,
  getBoxPlotData,
  getBubbleStats,
  getMaxMinVoxPlotData,
  groupStudentPointsDayChapter,
  StudentBarsSubgroupLocation,
  StudentStackedBarStatsObject,
  TrendStats,
} from "../../../pages/instructors/dashboard";
import {
  ICourseTag,
  ISemester,
  ISemesterStudent,
  ISemesterStudentStat,
  ISemesterStudentVoteStat,
} from "../../../types/ICourse";
import { BoxChart } from "../../chats/BoxChart";
import { BubbleChart } from "../../chats/BubbleChart";
import { Legend } from "../../chats/Legend";
import { PointsBarChart } from "../../chats/PointsBarChart";
import { SankeyChart, SankeyData } from "../../chats/SankeyChart";
import { TrendPlot } from "../../chats/TrendPlot";
import { GeneralPlotStats } from "../../instructors/dashboard/GeneralPlotStats";
import { NoDataMessage } from "../../instructors/NoDataMessage";
import { BoxPlotStatsSkeleton } from "../../instructors/skeletons/BoxPlotStatsSkeleton";
import { BubblePlotStatsSkeleton } from "../../instructors/skeletons/BubblePlotStatsSkeleton";
import { GeneralPlotStatsSkeleton } from "../../instructors/skeletons/GeneralPlotStatsSkeleton";
import { SankeyChartSkeleton } from "../../instructors/skeletons/SankeyChartSkeleton";
import { StackedBarPlotStatsSkeleton } from "../../instructors/skeletons/StackedBarPlotStatsSkeleton";
import { StudentDailyPlotStatsSkeleton } from "../../instructors/skeletons/StudentDailyPlotStatsSkeleton";
import Leaderboard from "../../practiceTool/Leaderboard";
import { UserStatus } from "../../practiceTool/UserStatus";

type SemesterStudentSankeys = {
  createdAt: any;
  deleted: boolean;
  interactions: { downVotes: number; uname: string; upVotes: number }[];
  tagId: string;
  uname: string;
  updatedAt: any;
};

type DashboardProps = { user: User; currentSemester: ICourseTag };

export const Dashboard = ({ user, currentSemester }: DashboardProps) => {
  const theme = useTheme();
  const db = getFirestore();

  const { width: windowWidth } = useWindowSize();
  const isMovil = useMediaQuery(theme.breakpoints.down("md"));
  const isTablet = useMediaQuery(theme.breakpoints.only("md"));
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const isLgDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  const isXlDesktop = useMediaQuery(theme.breakpoints.up("xl"));

  const [semesterStats, setSemesterStats] = useState<GeneralSemesterStudentsStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [thereIsData, setThereIsData] = useState<boolean>(true);
  const [stackBarWidth, setStackBarWidth] = useState(0);
  const [studentsCounter, setStudentsCounter] = useState<number>(0);
  const [stackedBar, setStackedBar] = useState<StackedBarStats[]>([]);
  const [proposalsStudents, setProposalsStudents] = useState<StudentStackedBarStatsObject | null>(null);
  const [questionsStudents, setQuestionsStudents] = useState<StudentStackedBarStatsObject | null>(null);
  const [dailyPracticeStudents, setDailyPracticeStudents] = useState<StudentStackedBarStatsObject | null>(null);
  const [bubble, setBubble] = useState<BubbleStats[]>([]);
  const [bubbleAxis, setBubbleAxis] = useState<BubbleAxis>({ maxAxisX: 0, maxAxisY: 0, minAxisX: 0, minAxisY: 0 });
  const [semesterConfig, setSemesterConfig] = useState<ISemester | null>(null);
  const [infoWidth, setInfoWidth] = useState(0);
  const [students, setStudents] = useState<ISemesterStudent[] | null>(null);
  const [semesterStudentsVoteStats, setSemesterStudentVoteStats] = useState<SemesterStudentVoteStat[]>([]);
  const [maxProposalsPoints, setMaxProposalsPoints] = useState<number>(0);
  const [maxQuestionsPoints, setMaxQuestionsPoints] = useState<number>(0);
  const [maxDailyPractices, setMaxDailyPractices] = useState<number>(0);

  const [studentVoteStat, setStudentVoteStat] = useState<SemesterStudentVoteStat | null>(null);
  const [semesterStudentStats, setSemesterStudentStats] = useState<GeneralSemesterStudentsStats | null>(null);
  const [studentLocation, setStudentLocation] = useState<StudentBarsSubgroupLocation>({
    proposals: 0,
    questions: 0,
    totalDailyPractices: 0,
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [studentBoxStat, setStudentBoxStat] = useState<BoxStudentStats>({
    proposalsPoints: {},
    questionsPoints: {},
    votesPoints: {},
  });
  /// Box plot States
  const [boxStats, setBoxStats] = useState<BoxStudentsStats>({
    proposalsPoints: { data: {}, min: 0, max: 1000 },
    questionsPoints: { data: {}, min: 0, max: 1000 },
    votesPoints: { data: {}, min: 0, max: 1000 },
  });

  const [sankeyData, setSankeyData] = useState<SankeyData[]>([]);

  const [trendStats, setTrendStats] = useState<TrendStats>({
    childProposals: [],
    editProposals: [],
    proposedLinks: [],
    nodes: [],
    votes: [],
    questions: [],
  });

  const [trendStat, setTrendStat] = useState<keyof TrendStats>("childProposals");

  const trendPlotHeightTop = isMovil ? 150 : isTablet ? 250 : 354;
  const trendPlotHeightBottom = isMovil ? 80 : isTablet ? 120 : 160;
  // other consts

  const TOOLBAR_WIDTH = 200;
  const WRAPPER_PADDING = 32;
  const GRID_WIDTH = windowWidth - TOOLBAR_WIDTH - 2 * WRAPPER_PADDING;
  const bubbleChartWidth = isMovil ? windowWidth - 10 - 20 - 10 : GRID_WIDTH - infoWidth - stackBarWidth - 8 * 16;
  const trendPlotWith = isMovil ? windowWidth - 60 : isTablet ? GRID_WIDTH - 100 : GRID_WIDTH - 150;
  const boxPlotWidth = isXlDesktop ? 300 : isLgDesktop ? 300 : isDesktop ? 230 : 220;

  const infoWrapperRef = useCallback((element: HTMLDivElement) => {
    if (!element) return;
    setInfoWidth(element.clientWidth);
  }, []);

  const stackBarWrapperRef = useCallback((element: HTMLDivElement) => {
    if (!element) return;
    setStackBarWidth(element.clientWidth);
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newTrendStat: keyof TrendStats) => {
    event.preventDefault();
    setTrendStat(newTrendStat);
  };

  // ---- ---- ---- ----
  // ---- ---- ---- ---- useEffects
  // ---- ---- ---- ----

  // setup sankey snapshot

  useEffect(() => {
    console.log({ currentSemester, students });
    if (user?.role !== "INSTRUCTOR") return; // this chart is only visible to instructors
    if (!currentSemester || !currentSemester.tagId) return;
    if (!students || !students.length) return;
    const studentNameByUname: { [uname: string]: string } = {};
    for (const student of students) {
      studentNameByUname[student.uname] = `${student.fName}|${student.lName}`;
    }

    const semesterStudentSankeyCol = collection(db, "semesterStudentSankeys");
    const q = query(
      semesterStudentSankeyCol,
      where("tagId", "==", currentSemester.tagId),
      where("deleted", "==", false)
    );
    let _sankeyData: any[] = [];
    const snapShotFunc = onSnapshot(q, async snapshot => {
      console.log("snapShotFunc");
      const docChanges = snapshot.docChanges();
      if (!docChanges.length) return;

      console.log("s11");
      for (let change of docChanges) {
        const _semesterStudentSankey: SemesterStudentSankeys = change.doc.data() as SemesterStudentSankeys;
        console.log("s12x", _semesterStudentSankey);
        if (change.type === "added") {
          for (const interaction of _semesterStudentSankey.interactions) {
            _sankeyData.push({
              source: studentNameByUname[_semesterStudentSankey.uname],
              target: studentNameByUname[interaction.uname],
              upVotes: interaction.upVotes,
              downVotes: interaction.downVotes,
              value: interaction.upVotes + interaction.downVotes,
            });
          }
        } else if (change.type === "modified") {
          const filterSankeyData = _sankeyData.filter(
            sankey => sankey.source !== studentNameByUname[_semesterStudentSankey.uname]
          );
          let newSankeyData: any[] = [];
          for (const interaction of _semesterStudentSankey.interactions) {
            newSankeyData.push({
              source: studentNameByUname[_semesterStudentSankey.uname],
              target: studentNameByUname[interaction.uname],
              upVotes: interaction.upVotes,
              downVotes: interaction.downVotes,
              value: interaction.upVotes + interaction.downVotes,
            });
          }
          _sankeyData = [...filterSankeyData, ...newSankeyData];
        } else if (change.type === "removed") {
          _sankeyData = _sankeyData.filter(
            sankey => sankey.source !== studentNameByUname[_semesterStudentSankey.uname]
          );
        }
      }
      console.log({ _sankeyData });
      setSankeyData([..._sankeyData]);
    });
    return () => snapShotFunc();
  }, [currentSemester, db, user, students]);

  // get semester student vote stats
  useEffect(() => {
    if (!user) return;
    if (!currentSemester || !currentSemester.tagId) return;
    if (!semesterConfig) return;

    setIsLoading(true);
    const semesterRef = collection(db, "semesterStudentVoteStats");
    const q = query(semesterRef, where("tagId", "==", currentSemester.tagId), where("deleted", "==", false));
    let semesterStudentVoteStats: ISemesterStudentVoteStat[] = [];
    console.log("sb01");
    const snapShotFunc = onSnapshot(q, async snapshot => {
      const docChanges = snapshot.docChanges();
      if (!docChanges.length) {
        setBubble([]);
        setStackedBar([]);
        setThereIsData(false);
        setSemesterStudentVoteStats([]);
        setTrendStats({
          childProposals: [],
          editProposals: [],
          proposedLinks: [],
          nodes: [],
          votes: [],
          questions: [],
        });
        return;
      }
      console.log("sb02");
      for (let change of docChanges) {
        if (change.type === "added") {
          const semesterStudentsVoteStats = change.doc.data() as ISemesterStudentVoteStat;
          const points = calculateVoteStatPoints(semesterStudentsVoteStats, semesterConfig!);
          semesterStudentVoteStats.push({ ...semesterStudentsVoteStats, ...points });
        } else if (change.type === "modified") {
          const index = semesterStudentVoteStats.findIndex(
            (semester: ISemesterStudentVoteStat) => semester.uname === change.doc.data().uname
          );
          semesterStudentVoteStats[index] = change.doc.data() as ISemesterStudentVoteStat;
          const points = calculateVoteStatPoints(semesterStudentVoteStats[index], semesterConfig!);
          semesterStudentVoteStats[index] = { ...semesterStudentVoteStats[index], ...points };
        } else if (change.type === "removed") {
          const index = semesterStudentVoteStats.findIndex(
            (semester: ISemesterStudentVoteStat) => semester.uname === change.doc.data().uname
          );
          semesterStudentVoteStats.splice(index, 1);
        }
      }

      const res = mapStudentsStatsDataByDates(semesterStudentVoteStats);
      console.log("sb03");
      const gg = getGeneralStats(res);
      const ts = res.reduce(
        (a: TrendStats, c): TrendStats => {
          return {
            childProposals: semesterConfig?.isProposalRequired
              ? [...a.childProposals, { date: new Date(c.date), num: c.value.childProposals }]
              : [],
            editProposals: semesterConfig?.isProposalRequired
              ? [...a.editProposals, { date: new Date(c.date), num: c.value.editProposals }]
              : [],
            proposedLinks: [...a.proposedLinks, { date: new Date(c.date), num: c.value.links }],
            nodes: [...a.nodes, { date: new Date(c.date), num: c.value.nodes }],
            questions: semesterConfig?.isQuestionProposalRequired
              ? [...a.questions, { date: new Date(c.date), num: c.value.questions }]
              : [],
            votes: semesterConfig?.isCastingVotesRequired
              ? [...a.votes, { date: new Date(c.date), num: c.value.votes }]
              : [],
          };
        },
        {
          childProposals: [],
          editProposals: [],
          proposedLinks: [],
          nodes: [],
          questions: [],
          votes: [],
        }
      );
      setTrendStats(ts);
      setSemesterStats(gg);
      // semesterStudentsVoteStats
      console.log("sb04", { semesterStudentVoteStats });
      setSemesterStudentVoteStats([...semesterStudentVoteStats]);
      // setSemesterStats(getSemStat(semester));
      setThereIsData(true);
    });

    return () => snapShotFunc();
  }, [semesterConfig, currentSemester, db, user]);

  // update data in bubble
  useEffect(() => {
    if (!semesterStudentsVoteStats.length) return setBubble([]);

    const { bubbleStats, maxVote, maxVotePoints, minVote, minVotePoints } = getBubbleStats(
      semesterStudentsVoteStats,
      students
    );
    setBubble(bubbleStats);
    setBubbleAxis({
      maxAxisX: maxVote,
      maxAxisY: maxVotePoints,
      minAxisX: minVote,
      minAxisY: minVotePoints,
    });
  }, [semesterStudentsVoteStats, students]);

  // update data in stackbar
  useEffect(() => {
    // if (user.role !== "STUDENT") return;
    if (!semesterStudentsVoteStats.length || !students || !semesterConfig) return setStackedBar([]);

    const {
      stackedBarStats,
      studentStackedBarProposalsStats,
      studentStackedBarQuestionsStats,
      studentStackedBarDailyPracticeStats,
    } = getStackedBarStat(
      semesterStudentsVoteStats,
      students,
      maxProposalsPoints,
      maxQuestionsPoints,
      maxDailyPractices,
      semesterConfig
    );
    console.log({
      stackedBarStats,
      studentStackedBarProposalsStats,
      studentStackedBarQuestionsStats,
      studentStackedBarDailyPracticeStats,
    });
    setStackedBar(stackedBarStats);
    setProposalsStudents(studentStackedBarProposalsStats);
    setQuestionsStudents(studentStackedBarQuestionsStats);
    setDailyPracticeStudents(studentStackedBarDailyPracticeStats);
  }, [
    maxDailyPractices,
    maxProposalsPoints,
    maxQuestionsPoints,
    semesterConfig,
    semesterStudentsVoteStats,
    students,
    user.role,
  ]);

  // set up semester snapshot to modify state
  useEffect(() => {
    if (!currentSemester || !currentSemester.tagId) return;
    const semesterRef = collection(db, "semesters");
    const q = query(semesterRef, where("tagId", "==", currentSemester.tagId));
    const snapShotFunc = onSnapshot(q, async snapshot => {
      const docChanges = snapshot.docChanges();
      if (!docChanges.length) {
        setSemesterConfig(null);
        setStudentsCounter(0);
        setStudents(null);
        setMaxProposalsPoints(0);
        setMaxQuestionsPoints(0);
        setMaxDailyPractices(0);
        setThereIsData(false);
        return;
      }

      for (let change of docChanges) {
        const semesterDoc = change.doc;
        const { maxProposalsPoints, maxQuestionsPoints, maxDailyPractices } = getMaxProposalsQuestionsPoints(
          semesterDoc.data() as ISemester
        );
        setSemesterConfig(semesterDoc.data() as ISemester);
        setStudentsCounter((semesterDoc.data() as ISemester).students.length);
        setMaxProposalsPoints(maxProposalsPoints);
        setMaxQuestionsPoints(maxQuestionsPoints);
        setMaxDailyPractices(maxDailyPractices);
        setStudents(semesterDoc.data().students);
        setThereIsData(true);
      }
    });
    return () => snapShotFunc();
  }, [currentSemester, db, user.role]);

  useEffect(() => {
    if (!currentSemester || !currentSemester.tagId || !user.uname || !semesterConfig) return;

    setIsLoading(true);
    const userDailyStatRef = collection(db, "semesterStudentStats");
    const q = query(userDailyStatRef, where("tagId", "==", currentSemester.tagId), where("uname", "==", user.uname));
    // const userDailyStatDoc = await getDocs(q);
    let userDailyStatsIncomplete: SemesterStudentStat[] = [];
    const snapShotFunc = onSnapshot(q, async snapshot => {
      const docChanges = snapshot.docChanges();
      if (!docChanges.length) {
      }
      for (let change of docChanges) {
        if (change.type === "added") {
          userDailyStatsIncomplete.push(change.doc.data() as SemesterStudentStat);
        } else if (change.type === "modified") {
          const index = userDailyStatsIncomplete.findIndex(
            (userDailyStat: SemesterStudentStat) => userDailyStat.uname === change.doc.data().uname
          );
          userDailyStatsIncomplete[index] = change.doc.data() as SemesterStudentStat;
        } else if (change.type === "removed") {
          const index = userDailyStatsIncomplete.findIndex(
            (userDailyStat: SemesterStudentStat) => userDailyStat.uname === change.doc.data().uname
          );
          userDailyStatsIncomplete.splice(index, 1);
        }
      }
      userDailyStatsIncomplete = userDailyStatsIncomplete.slice(0, 1);
      const userDailyStats: ISemesterStudentStat[] = userDailyStatsIncomplete.map(cur => {
        const daysFixed = cur.days.map(c => ({ day: c.day, chapters: c.chapters ?? [] }));
        return { ...cur, days: daysFixed };
      });
      console.log({ userDailyStatsIncomplete });
      if (userDailyStats.length <= 0) return;

      const proposalsPoints = groupStudentPointsDayChapter(
        userDailyStats[0],
        "proposals",
        semesterConfig?.nodeProposals.numPoints,
        semesterConfig?.nodeProposals.numProposalPerDay
      );
      const questionsPoints = groupStudentPointsDayChapter(
        userDailyStats[0],
        "questions",
        semesterConfig?.questionProposals.numPoints,
        semesterConfig?.questionProposals.numQuestionsPerDay
      );
      const votesPoints = groupStudentPointsDayChapter(
        userDailyStats[0],
        "votes",
        0,
        0,
        semesterConfig?.votes.pointIncrementOnAgreement,
        semesterConfig?.votes.pointDecrementOnAgreement
      );
      setStudentBoxStat({ proposalsPoints, questionsPoints, votesPoints });
      setThereIsData(true);
      setIsLoading(false);
    });
    return () => snapShotFunc();
  }, [currentSemester, db, semesterConfig, user.uname]);

  // set up semesterStudentStats snapshot to fill data on BoxPlot
  useEffect(() => {
    if (!currentSemester || !currentSemester.tagId || !semesterConfig) return;
    const userDailyStatRef = collection(db, "semesterStudentStats");
    const q = query(userDailyStatRef, where("tagId", "==", currentSemester.tagId), where("deleted", "==", false));
    let userDailyStatsIncomplete: SemesterStudentStat[] = [];
    const snapShotFunc = onSnapshot(q, async snapshot => {
      const docChanges = snapshot.docChanges();
      if (!docChanges.length) {
        setBoxStats({
          proposalsPoints: { data: {}, min: 0, max: 1000 },
          questionsPoints: { data: {}, min: 0, max: 1000 },
          votesPoints: { data: {}, min: 0, max: 1000 },
        });
        setIsLoading(false);
        setThereIsData(false);
        return;
      }
      for (let change of docChanges) {
        if (change.type === "added") {
          userDailyStatsIncomplete.push(change.doc.data() as SemesterStudentStat);
        } else if (change.type === "modified") {
          const index = userDailyStatsIncomplete.findIndex(
            (userDailyStat: SemesterStudentStat) => userDailyStat.uname === change.doc.data().uname
          );
          userDailyStatsIncomplete[index] = change.doc.data() as SemesterStudentStat;
        } else if (change.type === "removed") {
          const index = userDailyStatsIncomplete.findIndex(
            (userDailyStat: SemesterStudentStat) => userDailyStat.uname === change.doc.data().uname
          );
          userDailyStatsIncomplete.splice(index, 1);
        }
      }

      const userDailyStats: ISemesterStudentStat[] = userDailyStatsIncomplete.map(cur => {
        const daysFixed = cur.days.map(c => ({ day: c.day, chapters: c.chapters ?? [] }));
        return { ...cur, days: daysFixed };
      });

      console.log({ userDailyStatsasdasdas: userDailyStats });
      if (userDailyStats.length <= 0) return;
      const proposalsPoints = getBoxPlotData(
        userDailyStats,
        "proposals",
        semesterConfig?.nodeProposals.numPoints,
        semesterConfig?.nodeProposals.numProposalPerDay
      );
      const questionsPoints = getBoxPlotData(
        userDailyStats,
        "questions",
        semesterConfig?.questionProposals.numPoints,
        semesterConfig?.questionProposals.numQuestionsPerDay
      );
      const votesPoints = getBoxPlotData(
        userDailyStats,
        "votes",
        0,
        0,
        semesterConfig?.votes.pointIncrementOnAgreement,
        semesterConfig?.votes.pointDecrementOnAgreement
      );
      const { min: minP, max: maxP } = getMaxMinVoxPlotData(proposalsPoints);
      const { min: minQ, max: maxQ } = getMaxMinVoxPlotData(questionsPoints);
      const { min: minV, max: maxV } = getMaxMinVoxPlotData(votesPoints);

      // setSemesterStats(prev => {
      //   if (!prev) return null;
      //   const res = {
      //     ...prev,
      //     newNodeProposals: getChildProposal(userDailyStats),
      //     improvements: getEditProposals(userDailyStats),
      //   };
      //   return res;
      // });
      setBoxStats({
        proposalsPoints: { data: proposalsPoints, min: minP, max: maxP },
        questionsPoints: { data: questionsPoints, min: minQ, max: maxQ },
        votesPoints: { data: votesPoints, min: minV, max: maxV },
      });
      setThereIsData(true);

      setIsLoading(false);
    });
    return () => snapShotFunc();
  }, [currentSemester, db, semesterConfig]);

  useEffect(() => {
    if (!user.uname) return;
    if (user.role && user.role !== "STUDENT") return;
    const tagId = currentSemester?.tagId;
    if (!tagId) return;
    if (!semesterConfig) return;
    const semesterStudentVoteStatRef = collection(db, "semesterStudentVoteStats");
    const qByAll = query(semesterStudentVoteStatRef, where("tagId", "==", tagId));
    const qByStudent = query(semesterStudentVoteStatRef, where("uname", "==", user.uname), where("tagId", "==", tagId));

    // const semesterStudentVoteStatAllDoc = await getDocs(qByAll);
    let userDailyStats: ISemesterStudentVoteStat[] = [];
    const snapShotFuncForAll = onSnapshot(qByAll, async snapshot => {
      const docChanges = snapshot.docChanges();
      if (!docChanges.length) {
        setSemesterStats(null);
        return;
      }
      for (let change of docChanges) {
        if (change.type === "added") {
          userDailyStats.push(change.doc.data() as ISemesterStudentVoteStat);
        } else if (change.type === "modified") {
          const index = userDailyStats.findIndex(
            (userDailyStat: ISemesterStudentVoteStat) => userDailyStat.uname === change.doc.data().uname
          );
          userDailyStats[index] = change.doc.data() as ISemesterStudentVoteStat;
        } else if (change.type === "removed") {
          const index = userDailyStats.findIndex(
            (userDailyStat: ISemesterStudentVoteStat) => userDailyStat.uname === change.doc.data().uname
          );
          userDailyStats.splice(index, 1);
        }

        const resAll = mapStudentsStatsDataByDates(userDailyStats);
        const ggAll = getGeneralStats(resAll);
        setSemesterStats(ggAll);
      }
    });

    const snapShotFunc = onSnapshot(qByStudent, async snapshot => {
      const docChanges = snapshot.docChanges();
      if (!docChanges.length) {
        setThereIsData(false);
        setSemesterStudentStats(null);
        setTrendStats({
          childProposals: [],
          editProposals: [],
          proposedLinks: [],
          nodes: [],
          votes: [],
          questions: [],
        });
        return;
      }
      for (let change of docChanges) {
        if (change.type === "added" || change.type === "modified") {
          const semesterStudentVoteStat = change.doc.data() as ISemesterStudentVoteStat;
          const points = calculateVoteStatPoints(semesterStudentVoteStat, semesterConfig!);
          setStudentVoteStat({
            ...semesterStudentVoteStat,
            ...points,
          });

          const res = mapStudentsStatsDataByDates([semesterStudentVoteStat]);
          const gg = getGeneralStats(res);
          setSemesterStudentStats(gg);
          const ts = res.reduce(
            (a: TrendStats, c): TrendStats => {
              return {
                childProposals: semesterConfig?.isProposalRequired
                  ? [...a.childProposals, { date: new Date(c.date), num: c.value.childProposals }]
                  : [],
                editProposals: semesterConfig?.isProposalRequired
                  ? [...a.editProposals, { date: new Date(c.date), num: c.value.editProposals }]
                  : [],
                proposedLinks: [...a.proposedLinks, { date: new Date(c.date), num: c.value.links }],
                nodes: [...a.nodes, { date: new Date(c.date), num: c.value.nodes }],
                questions: semesterConfig?.isQuestionProposalRequired
                  ? [...a.questions, { date: new Date(c.date), num: c.value.questions }]
                  : [],
                votes: semesterConfig?.isCastingVotesRequired
                  ? [...a.votes, { date: new Date(c.date), num: c.value.votes }]
                  : [],
              };
            },
            {
              childProposals: [],
              editProposals: [],
              proposedLinks: [],
              nodes: [],
              questions: [],
              votes: [],
            }
          );
          setTrendStats(ts);
          setThereIsData(true);
          return;
        }
      }
    });

    return () => {
      snapShotFunc();
      snapShotFuncForAll();
    };
  }, [semesterConfig, currentSemester?.tagId, db, user.uname, user.role]);

  useEffect(() => {
    if (user.role !== "STUDENT") return;
    if (!semesterStudentsVoteStats || !studentVoteStat) return;

    const sortedByProposals = [...semesterStudentsVoteStats].sort((x, y) => y.proposalPoints! - x.proposalPoints!);
    const proposals = sortedByProposals.findIndex(s => s.uname === studentVoteStat?.uname);
    const sortedByQuestions = [...semesterStudentsVoteStats].sort((x, y) => y.questionPoints! - x.questionPoints!);
    const questions = sortedByQuestions.findIndex(s => s.uname === studentVoteStat?.uname);
    const sortedByTotalDailyPractices = [...semesterStudentsVoteStats].sort(
      (x, y) => y.totalPractices! - x.totalPractices!
    );
    const totalDailyPractices = sortedByTotalDailyPractices.findIndex(s => s.uname === studentVoteStat?.uname);
    setStudentLocation({ proposals, questions, totalDailyPractices });
  }, [semesterStudentsVoteStats, studentVoteStat, user.role]);

  if (!thereIsData && !isLoading) return <NoDataMessage />;

  return (
    <Stack spacing={"24px"} sx={{ width: "100%" }}>
      {user.role === "STUDENT" && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            // gridTemplateRows: "minmax(auto, 581px)",
            gap: "16px",
          }}
        >
          <Paper
            sx={{
              p: { sm: "10px", md: "16px" },
              backgroundColor: theme =>
                theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookMainBlack : DESIGN_SYSTEM_COLORS.baseWhite,
            }}
          >
            <UserStatus
              user={user}
              semesterId={currentSemester.tagId}
              displayTitle={false}
              displayFooterStreak={false}
              displayHeaderStreak
            />
          </Paper>
          <Paper
            sx={{
              p: { sm: "10px", md: "16px" },
              backgroundColor: theme =>
                theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookMainBlack : DESIGN_SYSTEM_COLORS.baseWhite,
            }}
          >
            <Leaderboard semesterId={currentSemester.tagId} sxBody={{ maxHeight: "435px" }} />
          </Paper>
        </Box>
      )}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: `auto auto minmax(auto, 629px)` },
          gap: "16px",
        }}
      >
        <Paper
          ref={infoWrapperRef}
          sx={{
            minWidth: "300px",
            display: "grid",
            placeItems: "center",
            p: { sm: "10px", md: "24px" },
            backgroundColor: theme =>
              theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookMainBlack : DESIGN_SYSTEM_COLORS.gray50,
          }}
        >
          {isLoading && <GeneralPlotStatsSkeleton />}
          {!isLoading && (
            <GeneralPlotStats
              semesterConfig={semesterConfig}
              semesterStats={semesterStats}
              student={semesterStudentStats}
            />
          )}
        </Paper>

        <Paper
          ref={stackBarWrapperRef}
          sx={{
            p: { sm: "10px", md: "16px" },
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            backgroundColor: theme =>
              theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookMainBlack : DESIGN_SYSTEM_COLORS.gray50,
          }}
        >
          {isLoading && <StackedBarPlotStatsSkeleton />}

          {!isLoading && (semesterConfig?.isQuestionProposalRequired || semesterConfig?.isProposalRequired) && (
            <>
              <Stack direction={"row"} spacing={"24px"}>
                <Box>
                  <Typography sx={{ fontSize: "19px", mb: "6px", lineHeight: "30px" }}>Points</Typography>
                  <Typography sx={{ fontSize: "12px", fontWeight: "500" }}>Nº of Students</Typography>
                </Box>
                <Legend
                  title={"Completion rate"}
                  options={[
                    { title: " > 100%", color: "#388E3C" },
                    { title: " > 10%", color: "#F9E2D0" },
                    { title: " > 50%", color: "#A7D841" },
                    { title: " <= 10%", color: "rgba(255, 196, 153, 0.75)" },
                  ]}
                  sx={{ gridTemplateColumns: "16px 1fr 16px 1fr" }}
                />
              </Stack>
              <Box sx={{ alignSelf: "center" }}>
                <PointsBarChart
                  data={stackedBar}
                  proposalsStudents={semesterConfig.isProposalRequired ? proposalsStudents : null}
                  questionsStudents={semesterConfig.isQuestionProposalRequired ? questionsStudents : null}
                  dailyPracticeStudents={semesterConfig.isDailyPracticeRequired ? dailyPracticeStudents : null}
                  maxAxisY={studentsCounter}
                  theme={theme.palette.mode === "dark" ? "Dark" : "Light"}
                  mobile={isMovil}
                  isQuestionRequired={semesterConfig?.isQuestionProposalRequired}
                  isProposalRequired={semesterConfig?.isProposalRequired}
                  isDailyPracticeRequired={true}
                  studentLocation={studentLocation}
                />
              </Box>
              {user.role === "STUDENT" && (
                <Box sx={{ display: "flex", justifyContent: "center", gap: "6px", alignItems: "center" }}>
                  <svg width="18" height="21" viewBox="0 0 18 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M8.54 20.351L8.61 20.391L8.638 20.407C8.74903 20.467 8.87327 20.4985 8.9995 20.4985C9.12573 20.4985 9.24997 20.467 9.361 20.407L9.389 20.392L9.46 20.351C9.85112 20.1191 10.2328 19.8716 10.604 19.609C11.5651 18.9305 12.463 18.1667 13.287 17.327C15.231 15.337 17.25 12.347 17.25 8.5C17.25 6.31196 16.3808 4.21354 14.8336 2.66637C13.2865 1.11919 11.188 0.25 9 0.25C6.81196 0.25 4.71354 1.11919 3.16637 2.66637C1.61919 4.21354 0.75 6.31196 0.75 8.5C0.75 12.346 2.77 15.337 4.713 17.327C5.53664 18.1667 6.43427 18.9304 7.395 19.609C7.76657 19.8716 8.14854 20.1191 8.54 20.351ZM9 11.5C9.79565 11.5 10.5587 11.1839 11.1213 10.6213C11.6839 10.0587 12 9.29565 12 8.5C12 7.70435 11.6839 6.94129 11.1213 6.37868C10.5587 5.81607 9.79565 5.5 9 5.5C8.20435 5.5 7.44129 5.81607 6.87868 6.37868C6.31607 6.94129 6 7.70435 6 8.5C6 9.29565 6.31607 10.0587 6.87868 10.6213C7.44129 11.1839 8.20435 11.5 9 11.5Z"
                      fill="#C03938"
                    />
                  </svg>

                  <Typography sx={{ fontSize: "12px" }}>Your Position</Typography>
                </Box>
              )}
            </>
          )}
        </Paper>
        {
          <Paper
            // ref={bubbleRef}
            // className="test"
            sx={{
              p: isMovil ? "10px" : "16px",
              backgroundColor: theme =>
                theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookMainBlack : DESIGN_SYSTEM_COLORS.gray50,
            }}
          >
            {isLoading && <BubblePlotStatsSkeleton />}
            {!isLoading && semesterConfig && !semesterConfig.isCastingVotesRequired && (
              <Box sx={{ height: "100%", display: "grid", placeItems: "center" }}>
                <Typography
                  sx={{
                    fontSize: "21px",
                    fontWeight: "600",
                    textAlign: "center",
                    maxWidth: "300px",
                    color: theme =>
                      theme.palette.mode === "light" ? "rgba(67, 68, 69,.125)" : "rgba(224, 224, 224,.125)",
                  }}
                >
                  Casting Votes chart is not enabled
                </Typography>
              </Box>
            )}
            {!isLoading && semesterConfig?.isCastingVotesRequired && (
              <>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <Typography sx={{ fontSize: "19px", alignSelf: "center" }}>Vote Leaderboard</Typography>
                  <Legend
                    title={""}
                    options={[
                      { title: ">100%", color: "#388E3C" },
                      { title: ">10%", color: "#F9DBAF" },
                      { title: "< 0%", color: "#E04F16" },
                      { title: ">50%", color: "#A7D841" },
                      { title: "<=10%", color: "#F7B27A" },
                      { title: "= 0%", color: "#575757" },
                    ]}
                    sx={{ gridTemplateColumns: "repeat(3,12px 1fr)" }}
                  />
                </Box>
                <BubbleChart
                  data={bubble}
                  width={bubbleChartWidth}
                  margin={{ top: 20, right: 0, bottom: 40, left: 50 }}
                  theme={theme.palette.mode === "dark" ? "Dark" : "Light"}
                  maxAxisX={bubbleAxis.maxAxisX}
                  maxAxisY={bubbleAxis.maxAxisY}
                  minAxisX={bubbleAxis.minAxisX}
                  minAxisY={bubbleAxis.minAxisY}
                  role={user.role}
                  student={studentVoteStat}
                />
                {user.role === "STUDENT" && (
                  <Box sx={{ display: "flex", justifyContent: "center", gap: "6px", alignItems: "center" }}>
                    <svg width="18" height="21" viewBox="0 0 18 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M8.54 20.351L8.61 20.391L8.638 20.407C8.74903 20.467 8.87327 20.4985 8.9995 20.4985C9.12573 20.4985 9.24997 20.467 9.361 20.407L9.389 20.392L9.46 20.351C9.85112 20.1191 10.2328 19.8716 10.604 19.609C11.5651 18.9305 12.463 18.1667 13.287 17.327C15.231 15.337 17.25 12.347 17.25 8.5C17.25 6.31196 16.3808 4.21354 14.8336 2.66637C13.2865 1.11919 11.188 0.25 9 0.25C6.81196 0.25 4.71354 1.11919 3.16637 2.66637C1.61919 4.21354 0.75 6.31196 0.75 8.5C0.75 12.346 2.77 15.337 4.713 17.327C5.53664 18.1667 6.43427 18.9304 7.395 19.609C7.76657 19.8716 8.14854 20.1191 8.54 20.351ZM9 11.5C9.79565 11.5 10.5587 11.1839 11.1213 10.6213C11.6839 10.0587 12 9.29565 12 8.5C12 7.70435 11.6839 6.94129 11.1213 6.37868C10.5587 5.81607 9.79565 5.5 9 5.5C8.20435 5.5 7.44129 5.81607 6.87868 6.37868C6.31607 6.94129 6 7.70435 6 8.5C6 9.29565 6.31607 10.0587 6.87868 10.6213C7.44129 11.1839 8.20435 11.5 9 11.5Z"
                        fill="#C03938"
                      />
                    </svg>
                    <Typography sx={{ fontSize: "12px" }}>Your Position</Typography>
                  </Box>
                )}
              </>
            )}
          </Paper>
        }
      </Box>
      {/* box plot */}
      <Paper
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          p: isMovil ? "10px" : "16px",
          backgroundColor: theme =>
            theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookMainBlack : DESIGN_SYSTEM_COLORS.gray50,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { sm: "column", md: "row" },
            justifyContent: "center",
            alignItems: "center",
            gap: isMovil ? "24px" : "0px",
            flexWrap: "wrap",
          }}
        >
          {isLoading && <BoxPlotStatsSkeleton width={boxPlotWidth} boxes={isLgDesktop ? 3 : isTablet ? 3 : 1} />}
          {!isLoading && (
            <>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {semesterConfig?.isProposalRequired ? (
                  <>
                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                      <Typography sx={{ fontSize: "16px", justifySelf: "center", alignSelf: "flex-end" }}>
                        Chapters{" "}
                      </Typography>
                      <Typography sx={{ fontSize: "19px" }}> Proposal Points</Typography>
                    </Box>

                    <BoxChart
                      theme={theme.palette.mode === "dark" ? "Dark" : "Light"}
                      data={boxStats.proposalsPoints.data}
                      width={boxPlotWidth}
                      boxHeight={25}
                      margin={{ top: 10, right: 0, bottom: 20, left: 8 }}
                      offsetX={isMovil ? 100 : 100}
                      offsetY={18}
                      identifier="plot-1"
                      maxX={boxStats.proposalsPoints.max}
                      minX={boxStats.proposalsPoints.min}
                      /* studentStats={studentBoxStat.proposalsPoints} */
                    />
                    {isMovil && <BoxLegend role={user.role} />}
                  </>
                ) : (
                  <Box sx={{ height: "100%", display: "grid", placeItems: "center", mx: "24px" }}>
                    <Typography
                      sx={{
                        fontSize: "21px",
                        fontWeight: "600",
                        textAlign: "center",
                        maxWidth: "325px",
                        color: theme =>
                          theme.palette.mode === "light" ? "rgba(67, 68, 69,.125)" : "rgba(224, 224, 224,.125)",
                      }}
                    >
                      Proposal Box chart is not enabled
                    </Typography>
                  </Box>
                )}
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {semesterConfig?.isQuestionProposalRequired ? (
                  <>
                    <Box sx={{ display: "flex", justifyContent: "space-around" }}>
                      {isMovil && (
                        <Typography sx={{ fontSize: "16px", justifySelf: "center", alignSelf: "flex-end" }}>
                          Chapters{" "}
                        </Typography>
                      )}
                      <Typography sx={{ fontSize: "19px" }}> Question Points</Typography>
                    </Box>

                    <BoxChart
                      theme={theme.palette.mode === "dark" ? "Dark" : "Light"}
                      data={boxStats.questionsPoints.data}
                      drawYAxis={isMovil}
                      width={boxPlotWidth}
                      boxHeight={25}
                      margin={{ top: 10, right: 0, bottom: 20, left: 10 }}
                      offsetX={isMovil ? 100 : 2}
                      offsetY={18}
                      identifier="plot-2"
                      maxX={boxStats.questionsPoints.max}
                      minX={boxStats.questionsPoints.min}
                      /* studentStats={studentBoxStat.questionsPoints} */
                    />
                    {isMovil && <BoxLegend role={user.role} />}
                  </>
                ) : (
                  <Box sx={{ height: "100%", display: "grid", placeItems: "center", mx: "32px" }}>
                    <Typography
                      sx={{
                        fontSize: "21px",
                        fontWeight: "600",
                        textAlign: "center",
                        maxWidth: "325px",
                        color: theme =>
                          theme.palette.mode === "light" ? "rgba(67, 68, 69,.125)" : "rgba(224, 224, 224,.125)",
                      }}
                    >
                      Question Box chart is not enabled
                    </Typography>
                  </Box>
                )}
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {semesterConfig?.isCastingVotesRequired ? (
                  <>
                    <Box sx={{ display: "flex", justifyContent: "space-around" }}>
                      {isMovil && (
                        <Typography sx={{ fontSize: "16px", justifySelf: "center", alignSelf: "flex-end" }}>
                          Chapters{" "}
                        </Typography>
                      )}
                      <Typography sx={{ fontSize: "19px" }}> Vote Points</Typography>
                    </Box>
                    <BoxChart
                      theme={theme.palette.mode === "dark" ? "Dark" : "Light"}
                      data={boxStats.votesPoints.data}
                      drawYAxis={isMovil}
                      width={boxPlotWidth}
                      boxHeight={25}
                      margin={{ top: 10, right: 0, bottom: 20, left: 10 }}
                      offsetX={isMovil ? 100 : 2}
                      offsetY={18}
                      identifier="plot-3"
                      minX={boxStats.votesPoints.min}
                      maxX={boxStats.votesPoints.max}
                      /* studentStats={studentBoxStat.votesPoints} */
                    />
                    {isMovil && <BoxLegend role={user.role} />}
                  </>
                ) : (
                  <Box sx={{ height: "200px", display: "grid", placeItems: "center", mx: "32px" }}>
                    <Typography
                      sx={{
                        fontSize: "21px ",
                        fontWeight: "600",
                        textAlign: "center",
                        maxWidth: "325px",
                        color: theme =>
                          theme.palette.mode === "light" ? "rgba(67, 68, 69,.125)" : "rgba(224, 224, 224,.125)",
                      }}
                    >
                      Casting Votes Box chart is not enabled
                    </Typography>
                  </Box>
                )}
              </Box>
            </>
          )}
        </Box>
        {!isMovil && !isLoading && <BoxLegend role={user.role} />}
      </Paper>
      {/* Sankey Chart */}
      {user.role === "INSTRUCTOR" && (
        <Paper
          sx={{
            p: isMovil ? "10px" : "16px",
            backgroundColor: theme =>
              theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookMainBlack : DESIGN_SYSTEM_COLORS.gray50,
          }}
        >
          <Typography sx={{ fontSize: "19px" }}>Collaborations</Typography>
          {isLoading && <SankeyChartSkeleton />}
          {!isLoading && (
            <Box sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
              <SankeyChart
                innerWidth={GRID_WIDTH}
                labelCounts={parseInt(String(students?.length))}
                sankeyData={sankeyData}
              />
            </Box>
          )}
        </Paper>
      )}
      <Box
        sx={{
          width: "100%",
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "16px",
        }}
      >
        <Typography fontSize={"30px"} fontWeight={600}>
          Histograms
        </Typography>
        {isLoading && (
          <Paper
            sx={{
              p: isMovil ? "10px" : "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              backgroundColor: theme => (theme.palette.mode === "light" ? "#FFFFFF" : undefined),
            }}
          >
            <StudentDailyPlotStatsSkeleton />
          </Paper>
        )}

        {!isLoading && (
          <>
            <Tabs
              id="user-settings-personalization"
              value={trendStat}
              onChange={handleTabChange}
              aria-label={"Trend Tabs"}
            >
              {Object.keys(trendStats).map((key: string, idx: number) => (
                <Tab
                  value={key}
                  key={`${key}-${idx}`}
                  label={capitalizeFirstLetter(key)
                    .split(/(?=[A-Z])/)
                    .join(" ")}
                  sx={{ flex: 1 }}
                />
              ))}
            </Tabs>
            <Paper
              sx={{
                p: isMovil ? "10px" : "40px 60px",
                display: trendStats[trendStat].length > 0 ? "flex" : "none",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: theme =>
                  theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookMainBlack : DESIGN_SYSTEM_COLORS.gray50,
                borderRadius: "8px",
              }}
            >
              <TrendPlot
                title={capitalizeFirstLetter(trendStat)
                  .split(/(?=[A-Z])/)
                  .join(" ")}
                heightTop={trendPlotHeightTop}
                heightBottom={trendPlotHeightBottom}
                width={trendPlotWith}
                scaleX={"time"}
                labelX={"Day"}
                scaleY={"linear"}
                labelY={"# of edit Proposals"}
                theme={theme.palette.mode === "dark" ? "Dark" : "Light"}
                x="date"
                y="num"
                trendData={trendStats[trendStat]}
              />
            </Paper>
          </>
        )}
      </Box>
    </Stack>
  );
};

const BoxLegend = ({ role }: { role: UserRole }) => {
  return (
    <Box sx={{ display: "flex", gap: "16px", alignItems: "center", alignSelf: "center" }}>
      <Box sx={{ display: "flex", gap: "6px", alignItems: "center" }}>
        <SquareIcon sx={{ fill: "#EC7115", fontSize: "12px" }} />
        <Typography sx={{ fontSize: "12px" }}>Class Average</Typography>
      </Box>
      {role === "STUDENT" && (
        <Box sx={{ display: "flex", gap: "6px", alignItems: "center" }}>
          <svg width="18" height="21" viewBox="0 0 18 21" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M8.54 20.351L8.61 20.391L8.638 20.407C8.74903 20.467 8.87327 20.4985 8.9995 20.4985C9.12573 20.4985 9.24997 20.467 9.361 20.407L9.389 20.392L9.46 20.351C9.85112 20.1191 10.2328 19.8716 10.604 19.609C11.5651 18.9305 12.463 18.1667 13.287 17.327C15.231 15.337 17.25 12.347 17.25 8.5C17.25 6.31196 16.3808 4.21354 14.8336 2.66637C13.2865 1.11919 11.188 0.25 9 0.25C6.81196 0.25 4.71354 1.11919 3.16637 2.66637C1.61919 4.21354 0.75 6.31196 0.75 8.5C0.75 12.346 2.77 15.337 4.713 17.327C5.53664 18.1667 6.43427 18.9304 7.395 19.609C7.76657 19.8716 8.14854 20.1191 8.54 20.351ZM9 11.5C9.79565 11.5 10.5587 11.1839 11.1213 10.6213C11.6839 10.0587 12 9.29565 12 8.5C12 7.70435 11.6839 6.94129 11.1213 6.37868C10.5587 5.81607 9.79565 5.5 9 5.5C8.20435 5.5 7.44129 5.81607 6.87868 6.37868C6.31607 6.94129 6 7.70435 6 8.5C6 9.29565 6.31607 10.0587 6.87868 10.6213C7.44129 11.1839 8.20435 11.5 9 11.5Z"
              fill="#C03938"
            />
          </svg>
          <Typography sx={{ fontSize: "12px" }}>Your Position</Typography>
        </Box>
      )}
    </Box>
  );
};

const getMaxProposalsQuestionsPoints = (data: ISemester): MaxPoints => {
  console.log({ semester: data });
  const dailyPracticesTotalDays = differentBetweenDays(
    data.dailyPractice.endDate.toDate(),
    data.dailyPractice.startDate.toDate()
  );
  const questionsTotalDays = differentBetweenDays(
    data.questionProposals.endDate.toDate(),
    data.questionProposals.startDate.toDate()
  );
  const proposalsTotalDays = differentBetweenDays(
    data.nodeProposals.endDate.toDate(),
    data.nodeProposals.startDate.toDate()
  );
  return {
    maxProposalsPoints: proposalsTotalDays * data.nodeProposals.numPoints,
    maxQuestionsPoints: questionsTotalDays * data.questionProposals.numPoints,
    maxDailyPractices: dailyPracticesTotalDays * data?.dailyPractice?.numPoints ?? 0,
  };
};
