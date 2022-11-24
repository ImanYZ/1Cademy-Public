import PlaceIcon from "@mui/icons-material/Place";
import SquareIcon from "@mui/icons-material/Square";
import { Box, Paper, Typography, useMediaQuery, useTheme } from "@mui/material";
import { collection, doc, getDoc, getDocs, getFirestore, query, where } from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";

import { BoxChart } from "@/components/chats/BoxChart";
import { HorizontalBarchartData, HorizontalBarsChart } from "@/components/chats/HorizontalBarsChart";
import { BoxPlotStatsSkeleton } from "@/components/instructors/skeletons/BoxPlotStatsSkeleton";
import { StudentDailyPlotStatsSkeleton } from "@/components/instructors/skeletons/StudentDailyPlotStatsSkeleton";
import { capitalizeFirstLetter } from "@/lib/utils/string.utils";

import { BubbleChart } from "../../../components/chats/BubbleChart";
import { Legend } from "../../../components/chats/Legend";
import { PointsBarChart } from "../../../components/chats/PointsBarChart";
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
import { getGeneralStats, getStackedBarStat, mapStudentsStatsToDataByDates } from "../../../lib/utils/charts.utils";
import {
  ISemester,
  ISemesterStudent /* ISemesterStudentStatDay */,
  ISemesterStudentStat,
} from "../../../types/ICourse";
import {
  BoxStudentsStats,
  BoxStudentStats,
  getBoxPlotData,
  getBubbleStats,
  getMaxMinVoxPlotData,
  groupStudentPointsDayChapter,
  makeTrendData,
  StudenBarsSubgroupLocation,
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
  const [semesterStudentsVoteState, setSemesterStudentVoteState] = useState<SemesterStudentVoteStat[]>([]);
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
  const [studentLocation, setStudentLocation] = useState<StudenBarsSubgroupLocation>({ proposals: 0, questions: 0 });

  //Trend Plots
  const [trendStats, setTrendStats] = useState<TrendStats>({
    childProposals: [],
    editProposals: [],
    links: [],
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

    const getSemesterData = async () => {
      const semesterRef = collection(db, "semesterStudentVoteStats");
      const q = query(semesterRef, where("tagId", "==", currentSemester.tagId), where("deleted", "==", false));
      const semesterDoc = await getDocs(q);
      if (!semesterDoc.docs.length) {
        setBubble([]);
        setStackedBar([]);
        setIsLoading(false);
        setThereIsData(false);
        setSemesterStudentVoteState([]);
        return;
      }

      // semesterStudentVoteState
      const semester = semesterDoc.docs.map(sem => sem.data() as SemesterStudentVoteStat);
      setSemesterStudentVoteState(semester);
      setIsLoading(false);
      setThereIsData(true);
    };
    getSemesterData();
  }, [currentSemester, db, user]);

  useEffect(() => {
    if (!queryUname) return;
    const tagId = currentSemester?.tagId;
    if (!tagId) return;
    const getStudentVoteStats = async () => {
      const semesterStudentVoteStatRef = collection(db, "semesterStudentVoteStats");
      const q = query(semesterStudentVoteStatRef, where("uname", "==", queryUname), where("tagId", "==", tagId));
      const semesterStudentVoteStatDoc = await getDocs(q);
      if (!semesterStudentVoteStatDoc.docs.length) {
        setThereIsData(false);
        return;
      }

      setStudentVoteStat(semesterStudentVoteStatDoc.docs[0].data() as SemesterStudentVoteStat);
      setThereIsData(true);
    };
    getStudentVoteStats();
  }, [currentSemester?.tagId, db, queryUname]);

  useEffect(() => {
    // update data in buble
    if (!semesterStudentsVoteState.length) return setBubble([]);

    const { bubbleStats, maxVote, maxVotePoints, minVote, minVotePoints } = getBubbleStats(
      semesterStudentsVoteState,
      students
    );
    setBubble(bubbleStats);
    setBubbleAxis({
      maxAxisX: maxVote,
      maxAxisY: maxVotePoints,
      minAxisX: minVote,
      minAxisY: minVotePoints,
    });
  }, [semesterStudentsVoteState, students]);

  useEffect(() => {
    // update data in stackbar
    if (!semesterStudentsVoteState.length || !students) return setStackedBar([]);

    const { stackedBarStats, studentStackedBarProposalsStats, studentStackedBarQuestionsStats } = getStackedBarStat(
      semesterStudentsVoteState,
      students,
      maxProposalsPoints,
      maxQuestionsPoints
    );

    setStackedBar(stackedBarStats);
    setProposalsStudents(studentStackedBarProposalsStats);
    setQuestionsStudents(studentStackedBarQuestionsStats);
  }, [maxProposalsPoints, maxQuestionsPoints, semesterStudentsVoteState, students]);

  // find student subgroup location in bars
  useEffect(() => {
    if (!semesterStudentsVoteState || !studentVoteStat) return;

    const sortedByProposals = [...semesterStudentsVoteState].sort((x, y) => y.totalPoints - x.totalPoints);
    const proposals = sortedByProposals.findIndex(s => s.uname === studentVoteStat?.uname);
    const sortedByQuestions = [...semesterStudentsVoteState].sort((x, y) => y.questionPoints - x.questionPoints);
    const questions = sortedByQuestions.findIndex(s => s.uname === studentVoteStat?.uname);

    setStudentLocation({ proposals: proposals, questions: questions });
  }, [semesterStudentsVoteState, studentVoteStat]);

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
    const getUserDailyStat = async () => {
      const userDailyStatRef = collection(db, "semesterStudentStats");
      const q = query(userDailyStatRef, where("tagId", "==", currentSemester.tagId), where("uname", "==", queryUname));
      const userDailyStatDoc = await getDocs(q);

      if (!userDailyStatDoc.docs.length) {
        setTrendStats({ childProposals: [], editProposals: [], links: [], nodes: [], votes: [], questions: [] });
        setThereIsData(false);
        return;
      }

      const userDailyStatsIncomplete = userDailyStatDoc.docs
        .map(dailyStat => dailyStat.data() as SemesterStudentStat)
        .slice(0, 1);
      const userDailyStats: ISemesterStudentStat[] = userDailyStatsIncomplete.map(cur => {
        const daysFixed = cur.days.map(c => ({ day: c.day, chapters: c.chapters ?? [] }));
        return { ...cur, days: daysFixed };
      });
      const res = mapStudentsStatsToDataByDates(userDailyStats);
      const gg = getGeneralStats(res);
      setSemesterStudentStats(gg);

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
      setTrendStats({
        childProposals: makeTrendData(userDailyStats, "newNodes"),
        editProposals: makeTrendData(userDailyStats, "editProposals"),
        links: makeTrendData(userDailyStats, "links"),
        nodes: makeTrendData(userDailyStats, "proposals"),
        votes: makeTrendData(userDailyStats, "votes"),
        questions: makeTrendData(userDailyStats, "questions"),
      });
      setThereIsData(true);
    };
    getUserDailyStat();
  }, [currentSemester, db, queryUname, semesterConfig]);
  useEffect(() => {
    if (!currentSemester || !currentSemester.tagId || !semesterConfig) return;
    setIsLoading(true);
    const getUserDailyStat = async () => {
      const userDailyStatRef = collection(db, "semesterStudentStats");
      const q = query(userDailyStatRef, where("tagId", "==", currentSemester.tagId), where("deleted", "==", false));
      const userDailyStatDoc = await getDocs(q);

      if (!userDailyStatDoc.docs.length) {
        setBoxStats({
          proposalsPoints: { data: {}, min: 0, max: 1000 },
          questionsPoints: { data: {}, min: 0, max: 1000 },
          votesPoints: { data: {}, min: 0, max: 1000 },
        });
        setIsLoading(false);
        setThereIsData(false);

        return;
      }

      const userDailyStats = userDailyStatDoc.docs.map(dailyStat => dailyStat.data() as SemesterStudentStat);
      const res = mapStudentsStatsToDataByDates(userDailyStats);
      const gg = getGeneralStats(res);

      setSemesterStats(gg);
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
    };
    getUserDailyStat();
  }, [currentSemester, db, semesterConfig]);

  const getMaxProposalsQuestionsPoints = (data: ISemester): MaxPoints => {
    return {
      maxProposalsPoints: data.nodeProposals.totalDaysOfCourse * data.nodeProposals.numPoints,
      maxQuestionsPoints: data.questionProposals.totalDaysOfCourse * data.questionProposals.numPoints,
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
    (async () => {
      const semesterStudentSankeyCol = collection(db, "semesterStudentSankeys");
      const q = query(
        semesterStudentSankeyCol,
        where("tagId", "==", currentSemester.tagId),
        where("uname", "==", queryUname),
        where("deleted", "==", false)
      );
      const semesterStudentSankeys = await getDocs(q);
      if (!semesterStudentSankeys.docs.length) {
        setStudentInteractions(null);
        return;
      }

      const data = semesterStudentSankeys.docs.map(std => std.data())[0];
      const chartData = data.intractions.map((cur: any) => ({
        label: studentNameByUname[cur.uname],
        amount: cur.upVotes + cur.downVotes,
      }));
      setStudentInteractions(chartData);
    })();
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
              courseTitle={currentSemester.cTitle.split(" ")[0]}
              programTitle={currentSemester.pTitle}
              semesterStats={semesterStats}
              semesterTitle={currentSemester.title}
              studentsCounter={studentsCounter}
              student={semesterStudentStats}
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
                <Legend
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
                <PointsBarChart
                  data={stackedBar}
                  proposalsStudents={user.role === "INSTRUCTOR" ? proposalsStudents : null}
                  questionsStudents={user.role === "INSTRUCTOR" ? questionsStudents : null}
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
                <Legend
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
              data={studentInteractions ?? []}
              width={trendPlotWith}
              margin={{ left: 10, top: 10, right: 0, bottom: 10 }}
              boxHeight={8}
              offsetX={100}
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
