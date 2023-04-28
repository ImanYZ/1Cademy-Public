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
import { User } from "../../../knowledgeTypes";
import {
  calculateVoteStatPoints,
  getGeneralStats,
  getStackedBarStat,
  mapStudentsStatsDataByDates,
} from "../../../lib/utils/charts.utils";
import { capitalizeFirstLetter } from "../../../lib/utils/string.utils";
import {
  BoxStudentsStats,
  getBoxPlotData,
  getBubbleStats,
  getMaxMinVoxPlotData,
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
import { SankeyChart } from "../../chats/SankeyChart";
import { TrendPlot } from "../../chats/TrendPlot";
import { GeneralPlotStats } from "../../instructors/dashboard/GeneralPlotStats";
import { NoDataMessage } from "../../instructors/NoDataMessage";
import { BoxPlotStatsSkeleton } from "../../instructors/skeletons/BoxPlotStatsSkeleton";
import { BubblePlotStatsSkeleton } from "../../instructors/skeletons/BubblePlotStatsSkeleton";
import { GeneralPlotStatsSkeleton } from "../../instructors/skeletons/GeneralPlotStatsSkeleton";
import { StackedBarPlotStatsSkeleton } from "../../instructors/skeletons/StackedBarPlotStatsSkeleton";
import { StudentDailyPlotStatsSkeleton } from "../../instructors/skeletons/StudentDailyPlotStatsSkeleton";
import Leaderboard from "../../practiceTool/Leaderboard";
import { UserStatus } from "../../practiceTool/UserStatus";

type DashboardProps = { user: User; currentSemester: ICourseTag };

export const Dashboard = ({ user, currentSemester }: DashboardProps) => {
  const theme = useTheme();
  const {
    palette: { mode },
  } = theme;
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
  const [stackBarWidth, setstackBarWidth] = useState(0);
  const [studentsCounter, setStudentsCounter] = useState<number>(0);
  const [stackedBar, setStackedBar] = useState<StackedBarStats[]>([]);
  const [proposalsStudents, setProposalsStudents] = useState<StudentStackedBarStatsObject | null>(null);
  const [questionsStudents, setQuestionsStudents] = useState<StudentStackedBarStatsObject | null>(null);
  const [dailyPraticeStudents, setDailyPracitceStudents] = useState<StudentStackedBarStatsObject | null>(null);
  const [bubble, setBubble] = useState<BubbleStats[]>([]);
  const [bubbleAxis, setBubbleAxis] = useState<BubbleAxis>({ maxAxisX: 0, maxAxisY: 0, minAxisX: 0, minAxisY: 0 });
  const [semesterConfig, setSemesterConfig] = useState<ISemester | null>(null);
  const [infoWidth, setInfoWidth] = useState(0);
  const [students, setStudents] = useState<ISemesterStudent[] | null>(null);
  const [semesterStudentVoteState, setSemesterStudentVoteState] = useState<SemesterStudentVoteStat[]>([]);
  const [maxProposalsPoints, setMaxProposalsPoints] = useState<number>(0);
  const [maxQuestionsPoints, setMaxQuestionsPoints] = useState<number>(0);

  /// Box plot States
  const [boxStats, setBoxStats] = useState<BoxStudentsStats>({
    proposalsPoints: { data: {}, min: 0, max: 1000 },
    questionsPoints: { data: {}, min: 0, max: 1000 },
    votesPoints: { data: {}, min: 0, max: 1000 },
  });

  // TODO: show sankey data only if user is intructor
  const [sankeyData, setSankeyData] = useState<any[]>([]);

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
  const bubbleChartWidth = isMovil ? windowWidth - 10 - 20 - 10 : GRID_WIDTH - infoWidth - stackBarWidth - 4 * 16;
  const trendPlotWith = isMovil ? windowWidth - 60 : isTablet ? GRID_WIDTH - 100 : GRID_WIDTH - 150;
  const boxPlotWidth = isXlDesktop ? 300 : isLgDesktop ? 300 : isDesktop ? 230 : 220;

  const infoWrapperRef = useCallback((element: HTMLDivElement) => {
    if (!element) return;
    setInfoWidth(element.clientWidth);
  }, []);

  const stackBarWrapperRef = useCallback((element: HTMLDivElement) => {
    if (!element) return;
    setstackBarWidth(element.clientWidth);
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newtrendStat: keyof TrendStats) => {
    event.preventDefault();
    setTrendStat(newtrendStat);
  };

  // ---- ---- ---- ----
  // ---- ---- ---- ---- useEffects
  // ---- ---- ---- ----

  // setup sankey snapshot
  useEffect(() => {
    if (!user) return;
    if (!currentSemester || !currentSemester.tagId) return;
    if (!students || !students.length) return;
    const studentNameByUname: {
      [uname: string]: string;
    } = {};
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
      if (!docChanges.length) {
        setSankeyData([]);
        return;
      }
      for (let change of docChanges) {
        const _semesterStudentSankey = change.doc.data();
        if (change.type === "added") {
          for (const intraction of _semesterStudentSankey.intractions) {
            _sankeyData.push({
              source: studentNameByUname[_semesterStudentSankey.uname],
              target: studentNameByUname[intraction.uname],
              upVotes: intraction.upVote,
              downVotes: intraction.downVote,
              value: intraction.upVote + intraction.downVote,
            });
          }
        } else if (change.type === "modified") {
          const filterSankeyData = _sankeyData.filter(
            sankey => sankey.source !== studentNameByUname[_semesterStudentSankey.uname]
          );
          let newSankeyData: any[] = [];
          for (const intraction of _semesterStudentSankey.intractions) {
            newSankeyData.push({
              source: studentNameByUname[_semesterStudentSankey.uname],
              target: studentNameByUname[intraction.uname],
              upVotes: intraction.upVote,
              downVotes: intraction.downVote,
              value: intraction.upVote + intraction.downVote,
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
    const snapShotFunc = onSnapshot(q, async snapshot => {
      const docChanges = snapshot.docChanges();
      if (!docChanges.length) {
        setBubble([]);
        setStackedBar([]);
        setThereIsData(false);
        setSemesterStudentVoteState([]);
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
        if (change.type === "added") {
          const semesterStudentVoteStat = change.doc.data() as ISemesterStudentVoteStat;
          const points = calculateVoteStatPoints(semesterStudentVoteStat, semesterConfig!);
          semesterStudentVoteStats.push({ ...semesterStudentVoteStat, ...points });
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
      // semesterStudentVoteState
      setSemesterStudentVoteState([...semesterStudentVoteStats]);
      // setSemesterStats(getSemStat(semester));
      setThereIsData(true);
    });

    return () => snapShotFunc();
  }, [semesterConfig, currentSemester, db, user]);

  // update data in buble
  useEffect(() => {
    if (!semesterStudentVoteState.length) return setBubble([]);

    const { bubbleStats, maxVote, maxVotePoints, minVote, minVotePoints } = getBubbleStats(
      semesterStudentVoteState,
      students
    );
    setBubble(bubbleStats);
    setBubbleAxis({
      maxAxisX: maxVote,
      maxAxisY: maxVotePoints,
      minAxisX: minVote,
      minAxisY: minVotePoints,
    });
  }, [semesterStudentVoteState, students]);

  // update data in stackbar
  useEffect(() => {
    if (!semesterStudentVoteState.length || !students) return setStackedBar([]);

    const {
      stackedBarStats,
      studentStackedBarProposalsStats,
      studentStackedBarQuestionsStats,
      studentStackedBarDailyPracticeStats,
    } = getStackedBarStat(semesterStudentVoteState, students, maxProposalsPoints, maxQuestionsPoints);
    setStackedBar(stackedBarStats);
    setProposalsStudents(studentStackedBarProposalsStats);
    setQuestionsStudents(studentStackedBarQuestionsStats);
    setDailyPracitceStudents(studentStackedBarDailyPracticeStats);
  }, [maxProposalsPoints, maxQuestionsPoints, semesterStudentVoteState, students]);

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
        setThereIsData(false);
        return;
      }

      for (let change of docChanges) {
        const semesterDoc = change.doc;
        const { maxProposalsPoints, maxQuestionsPoints } = getMaxProposalsQuestionsPoints(
          semesterDoc.data() as ISemester
        );
        setSemesterConfig(semesterDoc.data() as ISemester);
        setStudentsCounter((semesterDoc.data() as ISemester).students.length);
        setMaxProposalsPoints(maxProposalsPoints);
        setMaxQuestionsPoints(maxQuestionsPoints);
        setStudents(semesterDoc.data().students);
        setThereIsData(true);
      }
    });
    return () => snapShotFunc();
  }, [currentSemester, db]);

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
            height: "588px",
          }}
        >
          <Paper
            sx={{
              height: "588px",
              p: { sm: "10px", md: "16px" },
              backgroundColor: theme => (theme.palette.mode === "light" ? "#FFFFFF" : undefined),
            }}
          >
            <UserStatus displayTitle={false} />
          </Paper>
          <Paper
            sx={{
              height: "588px",
              p: { sm: "10px", md: "16px" },
              backgroundColor: theme => (theme.palette.mode === "light" ? "#FFFFFF" : undefined),
            }}
          >
            <Leaderboard sxBody={{ maxHeight: "435px" }} />
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
            p: { sm: "10px", md: "16px" },
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
            backgroundColor: mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookMainBlack : DESIGN_SYSTEM_COLORS.baseWhite,
          }}
        >
          {isLoading && <StackedBarPlotStatsSkeleton />}

          {!isLoading && (semesterConfig?.isQuestionProposalRequired || semesterConfig?.isProposalRequired) && (
            <>
              <Stack
                direction={"row"}
                spacing={"24px"}
                sx={{
                  marginBottom: "24px",
                }}
              >
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
                />
              </Stack>
              <Box sx={{ alignSelf: "center" }}>
                <PointsBarChart
                  data={stackedBar}
                  proposalsStudents={user.role === "INSTRUCTOR" ? proposalsStudents : null}
                  questionsStudents={user.role === "INSTRUCTOR" ? questionsStudents : null}
                  dailyPracticeStudents={user.role === "INSTRUCTOR" ? dailyPraticeStudents : null}
                  maxAxisY={studentsCounter}
                  theme={theme.palette.mode === "dark" ? "Dark" : "Light"}
                  mobile={isMovil}
                  isQuestionRequired={semesterConfig?.isQuestionProposalRequired}
                  isProposalRequired={semesterConfig?.isProposalRequired}
                />
              </Box>
            </>
          )}
        </Paper>

        <Paper
          // ref={bubbleRef}
          // className="test"
          sx={{
            p: isMovil ? "10px" : "16px",
            backgroundColor: theme => (theme.palette.mode === "light" ? "#FFFFFF" : undefined),
          }}
        >
          {isLoading && <BubblePlotStatsSkeleton />}
          {!isLoading && semesterConfig?.isCastingVotesRequired && (
            <>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "6px",
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
                width={bubbleChartWidth}
                margin={{ top: 20, right: 0, bottom: 40, left: 50 }}
                theme={theme.palette.mode === "dark" ? "Dark" : "Light"}
                maxAxisX={bubbleAxis.maxAxisX}
                maxAxisY={bubbleAxis.maxAxisY}
                minAxisX={bubbleAxis.minAxisX}
                minAxisY={bubbleAxis.minAxisY}
                role={user.role}
              />
            </>
          )}
        </Paper>
      </Box>

      {/* box plot */}
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
          {isLoading && <BoxPlotStatsSkeleton width={boxPlotWidth} boxes={isLgDesktop ? 3 : isTablet ? 3 : 1} />}
          {!isLoading && (
            <>
              <Box
                sx={{
                  display: semesterConfig?.isProposalRequired ? "flex" : "none",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
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
                  // width={trendPlotWith}
                  boxHeight={25}
                  margin={{ top: 10, right: 0, bottom: 20, left: 8 }}
                  offsetX={isMovil ? 100 : 100}
                  offsetY={18}
                  identifier="plot-1"
                  maxX={boxStats.proposalsPoints.max}
                  minX={boxStats.proposalsPoints.min}
                />
                {isMovil && <BoxLegend />}
              </Box>
              <Box
                sx={{
                  display: semesterConfig?.isQuestionProposalRequired ? "flex" : "none",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
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
                />
                {isMovil && <BoxLegend />}
              </Box>
              <Box
                sx={{
                  display: semesterConfig?.isCastingVotesRequired ? "flex" : "none",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
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
                />
                {isMovil && <BoxLegend />}
              </Box>
            </>
          )}
        </Box>
        {!isMovil && !isLoading && <BoxLegend />}
      </Paper>

      {/* Sankey Chart */}
      {sankeyData.length && (
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
          {!isLoading && (
            <>
              <Box
                sx={{
                  paddingLeft: "10px",
                  width: "100%",
                  textAlign: "left",
                }}
              >
                {"Collaborations"}
              </Box>
              <SankeyChart
                innerWidth={GRID_WIDTH}
                labelCounts={parseInt(String(students?.length))}
                sankeyData={sankeyData}
              />
            </>
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
                backgroundColor:
                  mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookMainBlack : DESIGN_SYSTEM_COLORS.baseWhite,
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
                theme={mode === "dark" ? "Dark" : "Light"}
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

const BoxLegend = () => {
  return (
    <Box sx={{ display: "flex", gap: "16px", alignItems: "center", alignSelf: "center" }}>
      <Box sx={{ display: "flex", gap: "6px", alignItems: "center" }}>
        <SquareIcon sx={{ fill: "#EC7115", fontSize: "12px" }} />
        <Typography sx={{ fontSize: "12px" }}>Class Average</Typography>
      </Box>
    </Box>
  );
};

const getMaxProposalsQuestionsPoints = (data: ISemester): MaxPoints => {
  return {
    maxProposalsPoints: data.nodeProposals.totalDaysOfCourse * data.nodeProposals.numPoints,
    maxQuestionsPoints: data.questionProposals.totalDaysOfCourse * data.questionProposals.numPoints,
  };
};
