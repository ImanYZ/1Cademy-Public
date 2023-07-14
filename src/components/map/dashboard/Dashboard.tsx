import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import SquareIcon from "@mui/icons-material/Square";
import { Box, IconButton, Paper, Stack, Tab, Tabs, Typography, useMediaQuery, useTheme } from "@mui/material";
import { collection, getFirestore, onSnapshot, query, where } from "firebase/firestore";
import React, { useCallback, useEffect, useState } from "react";

import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";

import { useWindowSize } from "../../../hooks/useWindowSize";
import {
  BubbleAxis,
  BubbleStats,
  GeneralSemesterStudentsStats,
  SemesterStudentStat,
  SemesterStudentVoteStat,
  StackedBarStats,
} from "../../../instructorsTypes";
import { User, UserRole } from "../../../knowledgeTypes";
import {
  BoxStudentsStats,
  BoxStudentStats,
  getBoxPlotData,
  getBubbleStats,
  getGeneralStats,
  getInitialTrendStats,
  getMaximumStudentPoints,
  getMaxMinVoxPlotData,
  getStackedBarStat,
  getTrendsStats,
  groupStudentPointsDayChapter,
  mapStudentsStatsDataByDates2,
  mapStudentStatsSumByStudents,
  mergeSemesterStudentVoteStat,
  SemesterStudentVoteStatChanges,
  StudentBarsSubgroupLocation,
  StudentStackedBarStatsObject,
  TrendStats,
} from "../../../lib/utils/charts.utils";
import { getStudentLocationOnStackBar } from "../../../lib/utils/dashboard.utils";
import { capitalizeFirstLetter } from "../../../lib/utils/string.utils";
import { ICourseTag, ISemester, ISemesterStudent, ISemesterStudentStat } from "../../../types/ICourse";
import { BoxChart } from "../../chats/BoxChart";
import { BubbleChart, BubbleThreshold } from "../../chats/BubbleChart";
import { LegendMemoized, LegendOptions } from "../../chats/Legend";
import { SankeyChart, SankeyData } from "../../chats/SankeyChart";
import { StackBarChart } from "../../chats/StackBarChart";
import { TrendPlot } from "../../chats/TrendPlot";
import { GeneralPlotStats } from "../../instructors/dashboard/GeneralPlotStats";
import { NoDataMessage } from "../../instructors/NoDataMessage";
// import { BoxPlotStatsSkeleton } from "../../instructors/skeletons/BoxPlotStatsSkeleton";
import { BubblePlotStatsSkeleton } from "../../instructors/skeletons/BubblePlotStatsSkeleton";
import { GeneralPlotStatsSkeleton } from "../../instructors/skeletons/GeneralPlotStatsSkeleton";
import { SankeyChartSkeleton } from "../../instructors/skeletons/SankeyChartSkeleton";
import { StackedBarPlotStatsSkeleton } from "../../instructors/skeletons/StackedBarPlotStatsSkeleton";
import { StudentDailyPlotStatsSkeleton } from "../../instructors/skeletons/StudentDailyPlotStatsSkeleton";
import Leaderboard from "../../practiceTool/Leaderboard";
import { UserStatus } from "../../practiceTool/UserStatus";

const db = getFirestore();

const BUBBLE_CHARTS_THRESHOLDS: BubbleThreshold[] = [
  { title: "<0%", color: "#EF6820", divider: -1 },
  { title: "=0%", color: "#575757", divider: -0.01 },
  { title: ">0%", color: "#F7B27A", divider: 0.01 },
  { title: ">10%", color: "#FAC515", divider: 0.1 },
  { title: ">50%", color: "#A7D841", divider: 0.5 },
  { title: ">100%", color: "#388E3C", divider: 1 },
];

export const STACK_BAR_CHART_THRESHOLDS: LegendOptions[] = [
  { title: "<0%", color: "#EF6820" },
  { title: ">=0%", color: "#575757" },
  { title: ">10%", color: "#F7B27A" },
  { title: ">40%", color: "#FAC515" },
  { title: ">70%", color: "#A7D841" },
  { title: ">85%", color: "#388E3C" },
];

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

  const { width: windowWidth } = useWindowSize();
  const isMovil = useMediaQuery(theme.breakpoints.down("md"));
  const isTablet = useMediaQuery(theme.breakpoints.only("md"));
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const isLgDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  const isXlDesktop = useMediaQuery(theme.breakpoints.up("xl"));

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [thereIsData, setThereIsData] = useState<boolean>(true);
  const [stackBarWidth, setStackBarWidth] = useState(0);
  const [stackedBar, setStackedBar] = useState<StackedBarStats[]>([]);
  const [proposalsStudents, setProposalsStudents] = useState<StudentStackedBarStatsObject | null>(null);
  const [questionsStudents, setQuestionsStudents] = useState<StudentStackedBarStatsObject | null>(null);
  const [dailyPracticeStudents, setDailyPracticeStudents] = useState<StudentStackedBarStatsObject | null>(null);
  const [bubble, setBubble] = useState<BubbleStats[]>([]);
  const [bubbleAxis, setBubbleAxis] = useState<BubbleAxis>({ maxAxisX: 0, maxAxisY: 0, minAxisX: 0, minAxisY: 0 });
  const [semesterConfig, setSemesterConfig] = useState<ISemester | null>(null);
  const [infoWidth, setInfoWidth] = useState(0);
  const [students, setStudents] = useState<ISemesterStudent[]>([]);
  const [semesterStudentsVoteStats, setSemesterStudentVoteStats] = useState<SemesterStudentVoteStat[]>([]);

  const [studentVoteStat, setStudentVoteStat] = useState<SemesterStudentVoteStat | null>(null);
  const [maxSemesterStats, setMaxSemesterStats] = useState<GeneralSemesterStudentsStats | null>(null);
  const [studentStats, setStudentStats] = useState<GeneralSemesterStudentsStats | null>(null);
  const [studentLocation, setStudentLocation] = useState<StudentBarsSubgroupLocation>({
    proposals: 0,
    questions: 0,
    totalDailyPractices: 0,
  });

  const [studentBoxStat, setStudentBoxStat] = useState<BoxStudentStats>({
    proposalsPoints: {},
    questionsPoints: {},
    votesPoints: {},
    practicePoints: {},
  });
  /// Box plot States
  const [boxStats, setBoxStats] = useState<BoxStudentsStats>({
    proposalsPoints: { data: {}, min: 0, max: 1000 },
    questionsPoints: { data: {}, min: 0, max: 1000 },
    votesPoints: { data: {}, min: 0, max: 1000 },
    practicePoints: { data: {}, min: 0, max: 1000 },
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
  const [boxPlotsControls, setBoxPlotControls] = useState<{ selectedChart: number; totalCharts: number }>({
    selectedChart: 1,
    totalCharts: 2,
  });

  const trendPlotHeightTop = isMovil ? 150 : isTablet ? 250 : 354;
  const trendPlotHeightBottom = isMovil ? 80 : isTablet ? 120 : 160;

  const TOOLBAR_WIDTH = 200;
  const WRAPPER_PADDING = 32;
  const GRID_WIDTH = windowWidth - TOOLBAR_WIDTH - 2 * WRAPPER_PADDING;
  const bubbleChartWidth = isMovil ? windowWidth - 10 - 20 - 10 : GRID_WIDTH - infoWidth - stackBarWidth - 8 * 16;
  const trendPlotWith = isMovil ? windowWidth - 60 : isTablet ? GRID_WIDTH - 100 : GRID_WIDTH - 150;
  const boxPlotWidth = isXlDesktop ? 394 : isLgDesktop ? 340 : isDesktop ? 230 : 220;

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
    if (isDesktop) setBoxPlotControls({ selectedChart: 1, totalCharts: 2 });
    else setBoxPlotControls({ selectedChart: 1, totalCharts: 4 });
  }, [isDesktop]);

  useEffect(() => {
    if (user?.role !== "INSTRUCTOR") return; // this chart is only visible to instructors
    if (!currentSemester || !currentSemester.tagId) return;
    if (!students.length) return;
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
      const docChanges = snapshot.docChanges();
      if (!docChanges.length) return;

      for (let change of docChanges) {
        const _semesterStudentSankey: SemesterStudentSankeys = change.doc.data() as SemesterStudentSankeys;
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
      setSankeyData([..._sankeyData]);
    });
    return () => snapShotFunc();
  }, [currentSemester, user, students]);

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

  // update data in stack bar
  useEffect(() => {
    // if (user.role !== "STUDENT") return;
    if (!semesterStudentsVoteStats.length || !students || !semesterConfig) return setStackedBar([]);

    const {
      stackedBarStats,
      studentStackedBarProposalsStats,
      studentStackedBarQuestionsStats,
      studentStackedBarDailyPracticeStats,
    } = getStackedBarStat(semesterStudentsVoteStats, students, semesterConfig);
    setStackedBar(stackedBarStats);
    setProposalsStudents(studentStackedBarProposalsStats);
    setQuestionsStudents(studentStackedBarQuestionsStats);
    setDailyPracticeStudents(studentStackedBarDailyPracticeStats);
  }, [semesterConfig, semesterStudentsVoteStats, students, user.role]);

  // set up semester snapshot to modify state
  useEffect(() => {
    if (!currentSemester || !currentSemester.tagId) return;
    const semesterRef = collection(db, "semesters");
    const q = query(semesterRef, where("tagId", "==", currentSemester.tagId));
    const snapShotFunc = onSnapshot(q, async snapshot => {
      const docChanges = snapshot.docChanges();
      if (!docChanges.length) {
        setSemesterConfig(null);
        setStudents([]);
        setThereIsData(false);
        return;
      }

      for (let change of docChanges) {
        const semesterData = change.doc.data() as ISemester;
        setSemesterConfig(semesterData);
        setStudents(semesterData.students);
        setThereIsData(true);
      }
    });
    return () => snapShotFunc();
  }, [currentSemester, user.role]);

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
      const practicePoints = groupStudentPointsDayChapter(
        userDailyStats[0],
        "correctPractices",
        semesterConfig?.dailyPractice.numPoints,
        semesterConfig?.dailyPractice.numQuestionsPerDay
      );
      setStudentBoxStat({ proposalsPoints, questionsPoints, votesPoints, practicePoints });
      setThereIsData(true);
      setIsLoading(false);
    });
    return () => snapShotFunc();
  }, [currentSemester, semesterConfig, user.uname]);

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
          practicePoints: { data: {}, min: 0, max: 1000 },
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
      const practicesPoints = getBoxPlotData(
        userDailyStats,
        "correctPractices",
        semesterConfig?.dailyPractice.numPoints,
        semesterConfig?.dailyPractice.numQuestionsPerDay
      );

      const { min: minP, max: maxP } = getMaxMinVoxPlotData(proposalsPoints);
      const { min: minQ, max: maxQ } = getMaxMinVoxPlotData(questionsPoints);
      const { min: minV, max: maxV } = getMaxMinVoxPlotData(votesPoints);
      const { min: minPr, max: maxPr } = getMaxMinVoxPlotData(practicesPoints);

      setBoxStats({
        proposalsPoints: { data: proposalsPoints, min: minP, max: maxP },
        questionsPoints: { data: questionsPoints, min: minQ, max: maxQ },
        votesPoints: { data: votesPoints, min: minV, max: maxV },
        practicePoints: { data: practicesPoints, min: minPr, max: maxPr },
      });
      setThereIsData(true);

      setIsLoading(false);
    });
    return () => snapShotFunc();
  }, [currentSemester, semesterConfig]);

  /**
   * set up snapshot to get semester student vote stats
   * - merge with previous semester student vote stats
   * - calculate all required data from all students
   * - if is student will calculate his data
   */
  useEffect(() => {
    if (!user) return;
    if (!semesterConfig) return;

    setIsLoading(true);
    const semesterRef = collection(db, "semesterStudentVoteStats");
    const q = query(semesterRef, where("tagId", "==", semesterConfig.tagId), where("deleted", "==", false));

    const killSnapshot = onSnapshot(q, async snapshot => {
      const docChanges = snapshot.docChanges();
      if (!docChanges.length) {
        setBubble([]);
        setStackedBar([]);
        setThereIsData(false);
        setSemesterStudentVoteStats([]);
        setTrendStats(getInitialTrendStats());
        return;
      }
      const newSemesterStudentStats: SemesterStudentVoteStatChanges[] = docChanges.map(cur => ({
        type: cur.type,
        data: cur.doc.data() as SemesterStudentVoteStat,
      }));

      setSemesterStudentVoteStats(prev => {
        const mergedSemesterStudentStats = mergeSemesterStudentVoteStat(prev, newSemesterStudentStats);
        const sumStatsByStudents = mapStudentStatsSumByStudents(mergedSemesterStudentStats);
        const maxStudentStats = getMaximumStudentPoints(sumStatsByStudents);

        setMaxSemesterStats(maxStudentStats);
        setThereIsData(true);

        if (user.role === "INSTRUCTOR") {
          const statsByDates = mapStudentsStatsDataByDates2(sumStatsByStudents);
          const newTrendStats = getTrendsStats(statsByDates, semesterConfig);
          setTrendStats(newTrendStats);
        }
        if (user.role === "STUDENT") {
          const studentStats = mergedSemesterStudentStats.filter(c => c.uname === user.uname);
          const sumStatsByStudent = mapStudentStatsSumByStudents(studentStats);
          const statsByDates = mapStudentsStatsDataByDates2(sumStatsByStudent);
          const newTrendStats = getTrendsStats(statsByDates, semesterConfig);
          const newStudentStats = getGeneralStats(statsByDates);
          setStudentStats(newStudentStats);
          setStudentVoteStat(mergedSemesterStudentStats.find(c => c.uname) ?? null);
          setTrendStats(newTrendStats);
        }

        return mergedSemesterStudentStats;
      });
    });

    return () => killSnapshot();
  }, [semesterConfig, user]);

  useEffect(() => {
    if (user.role !== "STUDENT") return;
    if (!semesterStudentsVoteStats || !studentVoteStat) return;
    if (!semesterConfig) return;

    const { practices, proposals, questions } = getStudentLocationOnStackBar(
      semesterStudentsVoteStats,
      semesterConfig,
      user.uname
    );

    setStudentLocation({ proposals, questions, totalDailyPractices: practices });
  }, [semesterConfig, semesterStudentsVoteStats, studentVoteStat, user.role, user.uname]);

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
          {!isLoading && <GeneralPlotStats maxSemesterStats={maxSemesterStats} studentStats={studentStats} />}
        </Paper>

        <Paper
          ref={stackBarWrapperRef}
          sx={{
            p: { sm: "10px", md: "16px" },
            // maxWidth: "350px",
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
              <Stack direction={"row"} justifyContent={"space-between"} sx={{ mb: "26px" }}>
                <Box>
                  <Typography sx={{ fontSize: "19px", mb: "6px", lineHeight: "30px" }}>Points</Typography>
                  <Typography sx={{ fontSize: "12px", fontWeight: "500" }}>Nº of Students</Typography>
                </Box>
                <LegendMemoized
                  title={"Completion rate"}
                  options={STACK_BAR_CHART_THRESHOLDS}
                  sx={{ gridTemplateColumns: "1fr 1fr 1fr" }}
                />
              </Stack>
              <Box sx={{ alignSelf: "center" }}>
                <StackBarChart
                  data={stackedBar}
                  proposalsStudents={semesterConfig.isProposalRequired ? proposalsStudents : null}
                  questionsStudents={semesterConfig.isQuestionProposalRequired ? questionsStudents : null}
                  dailyPracticeStudents={semesterConfig.isDailyPracticeRequired ? dailyPracticeStudents : null}
                  maxAxisY={students.length}
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
                  <LegendMemoized
                    title={""}
                    options={BUBBLE_CHARTS_THRESHOLDS}
                    sx={{ gridTemplateColumns: "1fr 1fr 1fr", gridTemplateRows: "1fr 1fr" }}
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
                  threshold={BUBBLE_CHARTS_THRESHOLDS}
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
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          p: isMovil ? "10px" : "40px",
          backgroundColor: theme =>
            theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookMainBlack : DESIGN_SYSTEM_COLORS.gray50,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            gap: isMovil ? "24px" : "0px",
            flexWrap: "wrap",
            mb: "20px",
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: "32px", mr: "12px" }}>
            <Typography sx={{ fontSize: "19px", textAlign: "right" }}>Chapters</Typography>

            <Stack spacing={"24px"} sx={{ width: { xs: "170px", md: "170px" }, py: "20px" }}>
              {Object.keys(boxStats.proposalsPoints.data).map((cur, idx) => (
                <Typography
                  key={idx}
                  sx={{
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    fontSize: "12px",
                    fontWeight: "400",
                    textAlign: "right",
                    color: theme =>
                      theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.gray100 : DESIGN_SYSTEM_COLORS.gray700,
                  }}
                >
                  {cur}
                </Typography>
              ))}
            </Stack>
          </Box>

          <Stack direction={"row"} spacing={"10px"}>
            {(isMovil
              ? boxPlotsControls.selectedChart === 1 && boxPlotsControls.totalCharts === 4
              : boxPlotsControls.selectedChart === 1 && boxPlotsControls.totalCharts === 2) && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <Box sx={{ display: "flex", justifyContent: "space-around" }}>
                  <Typography sx={{ fontSize: "19px" }}> Proposal Points</Typography>
                </Box>

                <BoxChart
                  theme={theme.palette.mode === "dark" ? "Dark" : "Light"}
                  data={semesterConfig?.isProposalRequired ? boxStats.proposalsPoints.data : null}
                  width={boxPlotWidth}
                  boxHeight={25}
                  margin={{ top: 0, right: 0, bottom: 10, left: 0 }}
                  offsetX={0}
                  offsetY={40}
                  identifier="plot-1"
                  maxX={boxStats.proposalsPoints.max}
                  minX={boxStats.proposalsPoints.min}
                  studentStats={user.role === "STUDENT" ? studentBoxStat.proposalsPoints : undefined}
                  isLoading={isLoading}
                />
              </Box>
            )}

            {(isMovil
              ? boxPlotsControls.selectedChart === 2 && boxPlotsControls.totalCharts === 4
              : boxPlotsControls.selectedChart === 1 && boxPlotsControls.totalCharts === 2) && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <Box sx={{ display: "flex", justifyContent: "space-around" }}>
                  <Typography sx={{ fontSize: "19px" }}> Question Points</Typography>
                </Box>

                <BoxChart
                  theme={theme.palette.mode === "dark" ? "Dark" : "Light"}
                  data={semesterConfig?.isQuestionProposalRequired ? boxStats.questionsPoints.data : null}
                  width={boxPlotWidth}
                  boxHeight={25}
                  margin={{ top: 0, right: 0, bottom: 10, left: 0 }}
                  offsetX={0}
                  offsetY={40}
                  identifier="plot-2"
                  maxX={boxStats.questionsPoints.max}
                  minX={boxStats.questionsPoints.min}
                  studentStats={user.role === "STUDENT" ? studentBoxStat.questionsPoints : undefined}
                  isLoading={isLoading}
                />
              </Box>
            )}

            {(isMovil
              ? boxPlotsControls.selectedChart === 3 && boxPlotsControls.totalCharts === 4
              : boxPlotsControls.selectedChart === 2 && boxPlotsControls.totalCharts === 2) && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <Box sx={{ display: "flex", justifyContent: "space-around" }}>
                  <Typography sx={{ fontSize: "19px" }}> Vote Points</Typography>
                </Box>
                <BoxChart
                  theme={theme.palette.mode === "dark" ? "Dark" : "Light"}
                  data={semesterConfig?.isCastingVotesRequired ? boxStats.votesPoints.data : null}
                  width={boxPlotWidth}
                  boxHeight={25}
                  margin={{ top: 0, right: 0, bottom: 10, left: 0 }}
                  offsetX={0}
                  offsetY={40}
                  identifier="plot-3"
                  minX={boxStats.votesPoints.min}
                  maxX={boxStats.votesPoints.max}
                  studentStats={user.role === "STUDENT" ? studentBoxStat.votesPoints : undefined}
                  isLoading={isLoading}
                />
              </Box>
            )}

            {(isMovil
              ? boxPlotsControls.selectedChart === 4 && boxPlotsControls.totalCharts === 4
              : boxPlotsControls.selectedChart === 2 && boxPlotsControls.totalCharts === 2) && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <Box sx={{ display: "flex", justifyContent: "space-around" }}>
                  <Typography sx={{ fontSize: "19px" }}> Questions Practiced</Typography>
                </Box>
                <BoxChart
                  theme={theme.palette.mode === "dark" ? "Dark" : "Light"}
                  data={semesterConfig?.isDailyPracticeRequired ? boxStats.practicePoints.data : null}
                  // drawYAxis={isMovil}
                  width={boxPlotWidth}
                  boxHeight={25}
                  margin={{ top: 0, right: 0, bottom: 10, left: 0 }}
                  offsetX={0}
                  offsetY={40}
                  identifier="plot-4"
                  minX={boxStats.practicePoints.min}
                  maxX={boxStats.practicePoints.max}
                  studentStats={user.role === "STUDENT" ? studentBoxStat.votesPoints : undefined}
                  isLoading={isLoading}
                />
              </Box>
            )}
          </Stack>
        </Box>

        <Stack
          direction={"row"}
          spacing={"12px"}
          alignItems={"center"}
          sx={{ position: "absolute", bottom: "30px", left: "30px" }}
        >
          <IconButton
            onClick={() => setBoxPlotControls(pre => ({ ...pre, selectedChart: Math.max(1, pre.selectedChart - 1) }))}
            sx={{
              border: ({ palette }) =>
                `solid 1px ${
                  palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG600 : DESIGN_SYSTEM_COLORS.gray300
                }`,
              p: "5px",
            }}
          >
            <KeyboardArrowLeftIcon />
          </IconButton>
          <Typography
            sx={{
              color: ({ palette }) =>
                palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.gray25 : DESIGN_SYSTEM_COLORS.gray900,
            }}
          >
            {boxPlotsControls.selectedChart}/{boxPlotsControls.totalCharts}
          </Typography>
          <IconButton
            onClick={() =>
              setBoxPlotControls(pre => ({ ...pre, selectedChart: Math.min(pre.totalCharts, pre.selectedChart + 1) }))
            }
            sx={{
              border: ({ palette }) =>
                `solid 1px ${
                  palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG600 : DESIGN_SYSTEM_COLORS.gray300
                }`,
              p: "5px",
            }}
          >
            <KeyboardArrowRightIcon />
          </IconButton>
        </Stack>
        <BoxLegend role={user.role} />
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
        <SquareIcon sx={{ fill: DESIGN_SYSTEM_COLORS.orange600, fontSize: "12px" }} />
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
