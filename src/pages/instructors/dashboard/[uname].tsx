import PlaceIcon from "@mui/icons-material/Place";
import SquareIcon from "@mui/icons-material/Square";
import { Box, Paper, Typography, useMediaQuery, useTheme } from "@mui/material";
import { collection, doc, getDoc, getDocs, getFirestore, onSnapshot, query, where } from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";

import { BoxChart } from "@/components/chats/BoxChart";
import { HorizontalBarchartData, HorizontalBarsChart } from "@/components/chats/HorizontalBarsChart";
import { BoxPlotStatsSkeleton } from "@/components/instructors/skeletons/BoxPlotStatsSkeleton";
import { StudentDailyPlotStatsSkeleton } from "@/components/instructors/skeletons/StudentDailyPlotStatsSkeleton";
import { capitalizeFirstLetter } from "@/lib/utils/string.utils";

import { BubbleChart } from "../../../components/chats/BubbleChart";
import { LegendMemoized } from "../../../components/chats/Legend";
import { StackBarChart } from "../../../components/chats/StackBarChart";
import { TrendPlot } from "../../../components/chats/TrendPlot";
import { GeneralPlotStats } from "../../../components/instructors/dashboard/GeneralPlotStats";
import { NoDataMessage } from "../../../components/instructors/NoDataMessage";
import { BubblePlotStatsSkeleton } from "../../../components/instructors/skeletons/BubblePlotStatsSkeleton";
import { GeneralPlotStatsSkeleton } from "../../../components/instructors/skeletons/GeneralPlotStatsSkeleton";
import { StackedBarPlotStatsSkeleton } from "../../../components/instructors/skeletons/StackedBarPlotStatsSkeleton";
import { InstructorLayoutPage, StudentsLayout } from "../../../components/layouts/StudentsLayout";
import { useWindowSize } from "../../../hooks/useWindowSize";
import {
  BubbleAxis,
  BubbleStats,
  GeneralSemesterStudentsStats,
  MaxPoints,
  SemesterStudentStat,
  /* SemesterStudentStat, */
  SemesterStudentVoteStat,
  StackedBarStats,
  /*  Trends, */
} from "../../../instructorsTypes";
import {
  calculateVoteStatPoints,
  getGeneralStats,
  getStackedBarStat,
  mapStudentsStatsDataByDates,
} from "../../../lib/utils/charts.utils";
import {
  ISemester,
  ISemesterStudent /* ISemesterStudentStatDay */,
  ISemesterStudentStat,
  ISemesterStudentVoteStat,
} from "../../../types/ICourse";
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
} from "../dashboard";

const StudentDashboard: InstructorLayoutPage = ({ user, currentSemester, settings, queryUname }) => {
  const db = getFirestore();

  const theme = useTheme();
  const isMovil = useMediaQuery(theme.breakpoints.down("md"));
  const isTablet = useMediaQuery(theme.breakpoints.only("md"));
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const isLgDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  const isXlDesktop = useMediaQuery(theme.breakpoints.up("xl"));

  const boxPlotWidth = isXlDesktop ? 500 : isLgDesktop ? 320 : isDesktop ? 230 : 220;

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [thereIsData, setThereIsData] = useState<boolean>(true);

  //General
  const [semesterStats, setSemesterStats] = useState<GeneralSemesterStudentsStats | null>(null);
  const [semesterStudentStats, setSemesterStudentStats] = useState<GeneralSemesterStudentsStats | null>(null);

  const [students, setStudents] = useState<ISemesterStudent[] | null>(null);
  const [semesterStudentsVoteStats, setSemesterStudentVoteStats] = useState<SemesterStudentVoteStat[]>([]);
  const [studentVoteStat, setStudentVoteStat] = useState<SemesterStudentVoteStat | null>(null);

  const [bubble, setBubble] = useState<BubbleStats[]>([]);
  const [bubbleAxis, setBubbleAxis] = useState<BubbleAxis>({ maxAxisX: 0, maxAxisY: 0, minAxisX: 0, minAxisY: 0 });

  //stacked bar plot
  const [stackedBar, setStackedBar] = useState<StackedBarStats[]>([]);
  const [maxProposalsPoints, setMaxProposalsPoints] = useState<number>(0);
  const [maxQuestionsPoints, setMaxQuestionsPoints] = useState<number>(0);
  const [studentsCounter, setStudentsCounter] = useState<number>(0);
  const [proposalsStudents, setProposalsStudents] = useState<StudentStackedBarStatsObject | null>(null);
  const [questionsStudents, setQuestionsStudents] = useState<StudentStackedBarStatsObject | null>(null);
  const [studentLocation, setStudentLocation] = useState<StudentBarsSubgroupLocation>({
    proposals: 0,
    questions: 0,
    totalDailyPractices: 0,
  });

  //Trend Plots
  const [trendStats, setTrendStats] = useState<TrendStats>({
    childProposals: [],
    editProposals: [],
    proposedLinks: [],
    nodes: [],
    votes: [],
    questions: [],
  });

  const trendPlotHeightTop = isMovil ? 150 : isTablet ? 250 : 354;
  const trendPlotHeightBottom = isMovil ? 80 : isTablet ? 120 : 160;
  // const trendPlotWith = isMovil ? 300 : isTablet ? 600 : 1045;

  // HorizontalBars
  const [studentInteractions, setStudentInteractions] = useState<HorizontalBarchartData | null>(null);

  const [infoWidth, setInfoWidth] = useState(0);
  const [stackBarWidth, setstackBarWidth] = useState(0);

  const { width: windowWidth } = useWindowSize();

  const infoWrapperRef = useCallback((element: HTMLDivElement) => {
    if (!element) return;
    setInfoWidth(element.clientWidth);
  }, []);
  const stackBarWrapperRef = useCallback(
    (element: HTMLDivElement) => {
      if (!element) return;
      setstackBarWidth(element.clientWidth);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [windowWidth]
  );
  /// Box plot States
  const [boxStats, setBoxStats] = useState<BoxStudentsStats>({
    proposalsPoints: { data: {}, min: 0, max: 1000 },
    questionsPoints: { data: {}, min: 0, max: 1000 },
    votesPoints: { data: {}, min: 0, max: 1000 },
  });
  const [studentBoxStat, setStudentBoxStat] = useState<BoxStudentStats>({
    proposalsPoints: {},
    questionsPoints: {},
    votesPoints: {},
  });

  //smester configs
  const [semesterConfig, setSemesterConfig] = useState<ISemester | null>(null);

  useEffect(() => {
    if (!user) return;
    if (!currentSemester || !currentSemester.tagId) return;
    if (!semesterConfig) return;

    const getSemesterData = async () => {
      const semesterStudentVoteStatCol = collection(db, "semesterStudentVoteStats");
      const q = query(
        semesterStudentVoteStatCol,
        where("tagId", "==", currentSemester.tagId),
        where("deleted", "==", false)
      );
      const semesterStudentVoteStats = await getDocs(q);
      if (!semesterStudentVoteStats.docs.length) {
        setBubble([]);
        setStackedBar([]);
        setIsLoading(false);
        setThereIsData(false);
        setSemesterStudentVoteStats([]);
        return;
      }

      // semesterStudentVoteState
      const _semesterStudentVoteStats = semesterStudentVoteStats.docs.map(sem => {
        const _sem = sem.data() as ISemesterStudentVoteStat;
        const points = calculateVoteStatPoints(_sem, semesterConfig!);
        return { ..._sem, ...points };
      });
      setSemesterStudentVoteStats(_semesterStudentVoteStats);
      setIsLoading(false);
      setThereIsData(true);
    };
    getSemesterData();
  }, [semesterConfig, currentSemester, db, user]);

  useEffect(() => {
    if (!queryUname) return;
    const tagId = currentSemester?.tagId;
    if (!tagId) return;
    if (!semesterConfig) return;
    const semesterStudentVoteStatRef = collection(db, "semesterStudentVoteStats");
    const qByAll = query(semesterStudentVoteStatRef, where("tagId", "==", tagId));
    const qByStudent = query(semesterStudentVoteStatRef, where("uname", "==", queryUname), where("tagId", "==", tagId));

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
  }, [semesterConfig, currentSemester?.tagId, db, queryUname]);

  useEffect(() => {
    // update datass in buble
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

  useEffect(() => {
    // update data in stackbar
    if (!semesterStudentsVoteStats.length || !students || !semesterConfig) return setStackedBar([]);

    const { stackedBarStats, studentStackedBarProposalsStats, studentStackedBarQuestionsStats } = getStackedBarStat(
      semesterStudentsVoteStats,
      students,
      maxProposalsPoints,
      maxQuestionsPoints,
      100,
      semesterConfig
    );

    setStackedBar(stackedBarStats);
    setProposalsStudents(studentStackedBarProposalsStats);
    setQuestionsStudents(studentStackedBarQuestionsStats);
  }, [maxProposalsPoints, maxQuestionsPoints, semesterConfig, semesterStudentsVoteStats, students]);

  // find student subgroup location in bars
  useEffect(() => {
    if (!semesterStudentsVoteStats || !studentVoteStat) return;

    const sortedByProposals = [...semesterStudentsVoteStats].sort((x, y) => y.proposalPoints! - x.proposalPoints!);
    const proposals = sortedByProposals.findIndex(s => s.uname === studentVoteStat?.uname);
    const sortedByQuestions = [...semesterStudentsVoteStats].sort((x, y) => y.questionPoints! - x.questionPoints!);
    const questions = sortedByQuestions.findIndex(s => s.uname === studentVoteStat?.uname);

    setStudentLocation({ proposals: proposals, questions: questions, totalDailyPractices: 0 });
  }, [semesterStudentsVoteStats, studentVoteStat]);

  //STATIC "MODIFTY"
  useEffect(() => {
    if (!currentSemester || !currentSemester.tagId) return;
    setIsLoading(true);
    const getSemesterStudents = async () => {
      const semesterRef = doc(db, "semesters", currentSemester.tagId);
      const semesterDoc = await getDoc(semesterRef);
      if (!semesterDoc.exists()) {
        setThereIsData(false);
        return;
      }

      const { maxProposalsPoints, maxQuestionsPoints } = getMaxProposalsQuestionsPoints(
        semesterDoc.data() as ISemester
      );
      setSemesterConfig(semesterDoc.data() as ISemester);
      setStudentsCounter((semesterDoc.data() as ISemester).students.length);

      setMaxProposalsPoints(maxProposalsPoints);
      setMaxQuestionsPoints(maxQuestionsPoints);
      setStudents(semesterDoc.data().students);
      setThereIsData(true);
    };
    getSemesterStudents();
  }, [currentSemester, db]);

  useEffect(() => {
    if (!currentSemester || !currentSemester.tagId || !queryUname || !semesterConfig) return;

    setIsLoading(true);
    const userDailyStatRef = collection(db, "semesterStudentStats");
    const q = query(userDailyStatRef, where("tagId", "==", currentSemester.tagId), where("uname", "==", queryUname));
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
    });
    return () => snapShotFunc();
  }, [currentSemester, db, queryUname, semesterConfig]);
  useEffect(() => {
    if (!currentSemester || !currentSemester.tagId || !semesterConfig) return;
    setIsLoading(true);
    const userDailyStatRef = collection(db, "semesterStudentStats");
    const q = query(userDailyStatRef, where("tagId", "==", currentSemester.tagId), where("deleted", "==", false));
    let userDailyStats: SemesterStudentStat[] = [];
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
          userDailyStats.push(change.doc.data() as SemesterStudentStat);
        } else if (change.type === "modified") {
          const index = userDailyStats.findIndex(
            (userDailyStat: SemesterStudentStat) => userDailyStat.uname === change.doc.data().uname
          );
          userDailyStats[index] = change.doc.data() as SemesterStudentStat;
        } else if (change.type === "removed") {
          const index = userDailyStats.findIndex(
            (userDailyStat: SemesterStudentStat) => userDailyStat.uname === change.doc.data().uname
          );
          userDailyStats.splice(index, 1);
        }
      }

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

      setBoxStats({
        proposalsPoints: { data: proposalsPoints, min: minP, max: maxP },
        questionsPoints: { data: questionsPoints, min: minQ, max: maxQ },
        votesPoints: { data: votesPoints, min: minV, max: maxV },
      });
      setIsLoading(false);
      setThereIsData(true);
    });
    return () => snapShotFunc();
  }, [currentSemester, db, semesterConfig]);

  const getMaxProposalsQuestionsPoints = (data: ISemester): MaxPoints => {
    return {
      maxProposalsPoints: data.nodeProposals.totalDaysOfCourse * data.nodeProposals.numPoints,
      maxQuestionsPoints: data.questionProposals.totalDaysOfCourse * data.questionProposals.numPoints,
      maxDailyPractices: 100,
    };
  };

  useEffect(() => {
    if (!currentSemester || !currentSemester.tagId) return;
    if (!students || !students.length) return;
    const studentNameByUname: {
      [uname: string]: string;
    } = {};
    for (const student of students) {
      studentNameByUname[student.uname] = `${student.fName} ${student.lName}`;
    }
    const semesterStudentSankeyCol = collection(db, "semesterStudentSankeys");
    const q = query(
      semesterStudentSankeyCol,
      where("tagId", "==", currentSemester.tagId),
      where("uname", "==", queryUname),
      where("deleted", "==", false)
    );

    const snapShotFunc = onSnapshot(q, async snapshot => {
      const docChanges = snapshot.docChanges();
      if (!docChanges.length) {
        setStudentInteractions(null);
        return;
      }
      for (let change of docChanges) {
        const _semesterStudentSankey = change.doc.data();
        if (change.type === "added" || change.type === "modified") {
          const chartData = _semesterStudentSankey.intractions.map((cur: any) => ({
            label: studentNameByUname[cur.uname],
            amount: cur.upVotes + cur.downVotes,
          }));
          setStudentInteractions(chartData);
          return;
        }
      }
    });
    return () => snapShotFunc();
  }, [currentSemester, db, students, queryUname]);

  const trendPlotWith = isMovil ? windowWidth - 60 : isTablet ? windowWidth - 100 : windowWidth - 140;

  if (!thereIsData && !isLoading) {
    return <NoDataMessage />;
  }
  if (!currentSemester) return <NoDataMessage message="No data in this semester" />;
  const BoxLegend = () => {
    return (
      <Box sx={{ display: "flex", gap: "16px", alignItems: "center", alignSelf: "center" }}>
        <Box sx={{ display: "flex", gap: "6px", alignItems: "center" }}>
          <SquareIcon sx={{ fill: "#EC7115", fontSize: "12px" }} />
          <Typography sx={{ fontSize: "12px" }}>Class Average</Typography>
        </Box>
        <Box sx={{ display: "flex", gap: "6px", alignItems: "center" }}>
          <PlaceIcon sx={{ fill: "#EF5350", fontSize: "16px" }} />
          <Typography sx={{ fontSize: "12px" }}>Your Position</Typography>
        </Box>
      </Box>
    );
  };
  return (
    <Box
      sx={{
        pb: "10px",
        width: "100%",
        m: "auto",
        px: { xs: "10px", md: "20px" },
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        overflowX: "hidden",
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "minmax(auto, 421px) auto minmax(auto, 629px)" },
          gap: "16px",
        }}
      >
        <Paper
          ref={infoWrapperRef}
          sx={{
            p: isMovil ? "10px" : "16px",
            backgroundColor: theme => (theme.palette.mode === "light" ? "#FFFFFF" : undefined),
          }}
        >
          {isLoading && <GeneralPlotStatsSkeleton />}
          {!isLoading && (
            <GeneralPlotStats
              maxSemesterStats={semesterStats}
              studentStats={semesterStudentStats}
              semesterConfig={semesterConfig}
            />
          )}
        </Paper>
        <Paper
          ref={stackBarWrapperRef}
          sx={{
            p: isMovil ? "10px" : "16px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            backgroundColor: theme => (theme.palette.mode === "light" ? "#FFFFFF" : undefined),
          }}
        >
          {isLoading && <StackedBarPlotStatsSkeleton />}

          {!isLoading && (
            <>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "4px",
                  marginBottom: "16px",
                }}
              >
                <Box>
                  <Typography sx={{ fontSize: "19px" }}>Points</Typography>
                </Box>
                <LegendMemoized
                  title={"Completion rate"}
                  options={[
                    { title: ">100%", color: "#388E3C" },
                    { title: ">10%", color: "#F9E2D0" },
                    { title: ">50%", color: "#A7D841" },
                    { title: "<=10%", color: "rgba(255, 196, 153, 0.75)" },
                  ]}
                />
              </Box>
              <Box sx={{ alignSelf: "center" }}>
                <StackBarChart
                  data={stackedBar}
                  proposalsStudents={user.role === "INSTRUCTOR" ? proposalsStudents : null}
                  questionsStudents={user.role === "INSTRUCTOR" ? questionsStudents : null}
                  dailyPracticeStudents={null}
                  maxAxisY={studentsCounter}
                  studentLocation={studentLocation}
                  theme={settings.theme}
                  mobile={isMovil}
                />
              </Box>
              <Box sx={{ display: "flex", justifyContent: "center", gap: "6px", alignItems: "center" }}>
                <PlaceIcon sx={{ fill: "#EF5350", fontSize: "24px" }} />
                <Typography sx={{ fontSize: "12px" }}>Your Position</Typography>
              </Box>
            </>
          )}
        </Paper>
        <Paper
          sx={{
            p: isMovil ? "10px" : "16px",
            backgroundColor: theme => (theme.palette.mode === "light" ? "#FFFFFF" : undefined),
          }}
        >
          {isLoading && <BubblePlotStatsSkeleton />}
          {!isLoading && (
            <>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "12px",
                }}
              >
                <Typography sx={{ fontSize: "19px", mb: "40px" }}>Vote Leaderboard</Typography>
                <LegendMemoized
                  title={""}
                  options={[
                    { title: ">100%", color: "#388E3C" },
                    { title: ">10%", color: "#F9E2D0" },
                    { title: ">50%", color: "#A7D841" },
                    { title: "<=10%", color: "rgb(255, 196, 153)" },
                    { title: "= 0%", color: "rgb(117, 117, 117)" },
                    { title: "< 0%", color: "rgb(239, 83, 80)" },
                  ]}
                />
              </Box>
              <BubbleChart
                data={bubble}
                width={
                  isMovil ? windowWidth - 10 - 20 - 10 : windowWidth - infoWidth - stackBarWidth - 40 - 32 - 32 - 16
                }
                margin={{ top: 10, right: 0, bottom: 60, left: 50 }}
                theme={settings.theme}
                maxAxisX={bubbleAxis.maxAxisX}
                maxAxisY={bubbleAxis.maxAxisY}
                minAxisX={bubbleAxis.minAxisX}
                minAxisY={bubbleAxis.minAxisY}
                student={studentVoteStat}
                role={user.role}
              />
              <Box sx={{ display: "flex", justifyContent: "center", gap: "6px", alignItems: "center" }}>
                <PlaceIcon sx={{ fill: "#EF5350", fontSize: "24px" }} />
                <Typography sx={{ fontSize: "12px" }}>Your Position</Typography>
              </Box>
            </>
          )}
        </Paper>
      </Box>
      <Box
        sx={{
          width: "100%",
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "16px",
        }}
      >
        <Paper
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            p: isMovil ? "10px" : "16px",
            backgroundColor: theme => (theme.palette.mode === "light" ? "#FFFFFF" : undefined),
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
            {isLoading && <BoxPlotStatsSkeleton width={300} boxes={isXlDesktop ? 3 : isTablet ? 2 : 1} />}
            {!isLoading && (
              <>
                <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                    <Typography sx={{ fontSize: "16px", justifySelf: "center", alignSelf: "flex-end" }}>
                      Chapters{" "}
                    </Typography>
                    <Typography sx={{ fontSize: "19px" }}> Proposal Points</Typography>
                  </Box>

                  <BoxChart
                    theme={settings.theme}
                    data={boxStats.proposalsPoints.data}
                    width={boxPlotWidth}
                    // width={trendPlotWith}
                    boxHeight={25}
                    margin={{ top: 10, right: 0, bottom: 20, left: 8 }}
                    offsetX={isMovil ? 100 : 100}
                    offsetY={18}
                    identifier="boxplot-student-1"
                    maxX={boxStats.proposalsPoints.max}
                    minX={boxStats.proposalsPoints.min}
                    studentStats={studentBoxStat.proposalsPoints}
                  />
                  {isMovil && <BoxLegend />}
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <Box sx={{ display: "flex", justifyContent: "space-around" }}>
                    {isMovil && (
                      <Typography sx={{ fontSize: "16px", justifySelf: "center", alignSelf: "flex-end" }}>
                        Chapters{" "}
                      </Typography>
                    )}
                    <Typography sx={{ fontSize: "19px" }}> Question Points</Typography>
                  </Box>
                  <BoxChart
                    theme={settings.theme}
                    data={boxStats.questionsPoints.data}
                    drawYAxis={isMovil || isTablet}
                    width={boxPlotWidth}
                    boxHeight={25}
                    margin={{ top: 10, right: 0, bottom: 20, left: 10 }}
                    offsetX={isMovil ? 100 : 7}
                    offsetY={18}
                    identifier="boxplot-student-2"
                    maxX={boxStats.questionsPoints.max}
                    minX={boxStats.questionsPoints.min}
                    studentStats={studentBoxStat.questionsPoints}
                  />
                  {isMovil && <BoxLegend />}
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <Box sx={{ display: "flex", justifyContent: "space-around" }}>
                    {isMovil && (
                      <Typography sx={{ fontSize: "16px", justifySelf: "center", alignSelf: "flex-end" }}>
                        Chapters{" "}
                      </Typography>
                    )}
                    <Typography sx={{ fontSize: "19px" }}> Vote Points</Typography>
                  </Box>
                  <BoxChart
                    theme={settings.theme}
                    data={boxStats.votesPoints.data}
                    drawYAxis={isMovil || isTablet}
                    width={boxPlotWidth}
                    boxHeight={25}
                    margin={{ top: 10, right: 0, bottom: 20, left: 10 }}
                    offsetX={isMovil ? 100 : 7}
                    offsetY={18}
                    identifier="boxplot-student-3"
                    minX={boxStats.votesPoints.min}
                    maxX={boxStats.votesPoints.max}
                    studentStats={studentBoxStat.votesPoints}
                  />
                  {isMovil && <BoxLegend />}
                </Box>
              </>
            )}
          </Box>
          {!isMovil && !isLoading && <BoxLegend />}
        </Paper>
      </Box>
      {/* Students' contribution Chart */}
      {!isLoading && (
        <Box
          sx={{
            width: "100%",
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "16px",
          }}
        >
          <Paper
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              p: isMovil ? "10px" : "16px",
              backgroundColor: theme => (theme.palette.mode === "light" ? "#FFFFFF" : undefined),
            }}
          >
            <Typography sx={{ fontSize: "19px" }}>Vote Interactions</Typography>
            <HorizontalBarsChart
              identifier="bars-1"
              data={studentInteractions ?? []}
              width={trendPlotWith}
              margin={{ left: 10, top: 10, right: 0, bottom: 10 }}
              boxHeight={8}
              offsetX={100}
              theme={settings.theme}
              sort={true}
              order={"Descending"}
            />
          </Paper>
        </Box>
      )}

      <Box
        sx={{
          width: "100%",
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "16px",
        }}
      >
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
            {Object.keys(trendStats).map((trendStat, i) => (
              <Paper
                key={i}
                sx={{
                  p: isMovil ? "10px" : "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: theme => (theme.palette.mode === "light" ? "#FFFFFF" : undefined),
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
                  trendData={trendStats[trendStat as keyof TrendStats]}
                />
              </Paper>
            ))}
          </>
        )}
      </Box>
    </Box>
  );
};

// This wrapper expose the shared variables from filters
const PageWrapper = () => {
  return <StudentsLayout>{props => <StudentDashboard {...props} />}</StudentsLayout>;
};
export default PageWrapper;
