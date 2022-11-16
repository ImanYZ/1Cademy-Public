import SquareIcon from "@mui/icons-material/Square";
import { Paper, Typography /* useTheme */, useMediaQuery, useTheme } from "@mui/material";
// import { useTheme } from "@mui/material/styles";
// import useMediaQuery from "@mui/material/useMediaQuery";
import { Box } from "@mui/system";
import { collection, doc, getDoc, getDocs, getFirestore, query, where } from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import {
  BubbleAxis,
  BubbleStats,
  MaxPoints,
  SemesterStats,
  SemesterStudentStat,
  /* SemesterStudentStat, */
  SemesterStudentVoteStat,
  StackedBarStats,
  Trends,
} from "src/instructorsTypes";
import {
  ISemester,
  ISemesterStudent /* ISemesterStudentStatDay */,
  ISemesterStudentStat,
  ISemesterStudentStatChapter,
} from "src/types/ICourse";

// import { BoxChart } from "@/components/chats/BoxChart";
import { BubbleChart } from "@/components/chats/BubbleChart";
import { BoxPlotStatsSkeleton } from "@/components/instructors/skeletons/BoxPlotStatsSkeleton";
import { capitalizeFirstLetter } from "@/lib/utils/string.utils";

import { BoxChart } from "../../components/chats/BoxChart";
import { Legend } from "../../components/chats/Legend";
import { PointsBarChart } from "../../components/chats/PointsBarChart";
import { TrendPlot } from "../../components/chats/TrendPlot";
import withAuthUser from "../../components/hoc/withAuthUser";
import { GeneralPlotStats } from "../../components/instructors/dashboard/GeneralPlotStats";
import { NoDataMessage } from "../../components/instructors/NoDataMessage";
import { BubblePlotStatsSkeleton } from "../../components/instructors/skeletons/BubblePlotStatsSkeleton";
import { GeneralPlotStatsSkeleton } from "../../components/instructors/skeletons/GeneralPlotStatsSkeleton";
import { StackedBarPlotStatsSkeleton } from "../../components/instructors/skeletons/StackedBarPlotStatsSkeleton";
import { StudentDailyPlotStatsSkeleton } from "../../components/instructors/skeletons/StudentDailyPlotStatsSkeleton";
import { InstructorLayoutPage, InstructorsLayout } from "../../components/layouts/InstructorsLayout";
import { useWindowSize } from "../../hooks/useWindowSize";
import { getSemStat, getStackedBarStat } from "../../lib/utils/charts.utils";
export type Chapter = {
  [key: string]: number[];
};
export type BoxData = {
  "Proposal Points": Chapter;
  "Question Points": Chapter;
  "Vote Points": Chapter;
};
// data={data["Question Points"]}
// drawYAxis={isMovil}
// width={isMovil ? 300 : 300}
// boxHeight={25}
// margin={{ top: 10, right: 0, bottom: 20, left: 10 }}
// offsetX={isMovil ? 150 : 2}
// const data: BoxData = {
//   "Proposal Points": {
//     "The way of the program": [20, 23, 24, 24, 24, 25, 30],
//     "Variables, expressions and ...": [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
//     Functions: [20, 23, 24, 24, 24, 25, 29, 31, 31, 33, 34, 36, 36, 37, 39, 39, 40, 40, 41, 45],
//     "Case study: interface design": [20, 23, 24, 24, 24, 25, 29, 31, 31, 33, 34, 36, 36, 37, 39, 39, 40, 40, 41, 45],
//     "Conditionals and recursion": [20, 23, 24, 24, 24, 25, 29, 31, 31, 33, 34, 36, 36, 37, 39, 39, 40, 40, 41, 45],
//     "Fruitful functions": [20, 23, 24, 24, 24, 25, 29, 31, 31, 33, 34, 36, 36, 37, 39, 39, 40, 40, 41, 45],
//     // "Fruitfuwwel functions": [20, 23, 24, 24, 24, 25, 29, 31, 31, 33, 34, 36, 36, 37, 39, 39, 40, 40, 41, 45],
//     // "1Fruiwwtful functions": [20, 23, 24, 24, 24, 25, 29, 31, 31, 33, 34, 36, 36, 37, 39, 39, 40, 40, 41, 45],
//     // "1Fruwitful functions": [20, 23, 24, 24, 24, 25, 29, 31, 31, 33, 34, 36, 36, 37, 39, 39, 40, 40, 41, 45],
//     // "1Frwuitful functions": [20, 23, 24, 24, 24, 25, 29, 31, 31, 33, 34, 36, 36, 37, 39, 39, 40, 40, 41, 45],
//     // "1wFruitful functions": [20, 23, 24, 24, 24, 25, 29, 31, 31, 33, 34, 36, 36, 37, 39, 39, 40, 40, 41, 45],
//     // "1Fwruitful functions": [20, 23, 24, 24, 24, 25, 29, 31, 31, 33, 34, 36, 36, 37, 39, 39, 40, 40, 41, 45],
//   },
//   "Question Points": {
//     // "The way of the program": [12, 19, 11, 13, 12, 22, 13, 4, 15, 16, 18, 19, 0, 12, 11, 19],
//     // "Variables, expressions and ...": [12, 19, 11, 13, 12, 22, 13, 4, 15, 16, 18, 19, 0, 12, 11, 19],
//     // Functions: [12, 19, 11, 13, 12, 22, 13, 4, 15, 16, 18, 19, 0, 12, 11, 19],
//     "The way of the program": [20, 23, 24, 24, 24, 25, 30],
//     "Variables, expressions and ...": [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
//     Functions: [20, 23, 24, 24, 24, 25, 29, 31, 31, 33, 34, 36, 36, 37, 39, 39, 40, 40, 41, 45],
//     "Case study: interface design": [20, 23, 24, 24, 24, 25, 29, 31, 31, 33, 34, 36, 36, 37, 39, 39, 40, 40, 41, 45],
//     "Conditionals and recursion": [20, 23, 24, 24, 24, 25, 29, 31, 31, 33, 34, 36, 36, 37, 39, 39, 40, 40, 41, 45],
//     "Fruitful functions": [20, 23, 24, 24, 24, 25, 29, 31, 31, 33, 34, 36, 36, 37, 39, 39, 40, 40, 41, 45],
//   },
//   "Vote Points": {
//     // "The way of the program": [12, 19, 11, 13, 12, 22, 13, 4, 15, 16, 18, 19, 0, 12, 11, 19],
//     // "Variables, expressions and ...": [12, 19, 11, 13, 12, 22, 13, 4, 15, 16, 18, 19, 0, 12, 11, 19],
//     // Functions: [12, 19, 11, 13, 12, 22, 13, 4, 15, 16, 18, 19, 0, 12, 11, 19],
//     "The way of the program": [20, 23, 24, 24, 24, 25, 30],
//     "Variables, expressions and ...": [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
//     Functions: [20, 23, 24, 24, 24, 25, 29, 31, 31, 33, 34, 36, 36, 37, 39, 39, 40, 40, 41, 45],
//     "Case study: interface design": [20, 23, 24, 24, 24, 25, 29, 31, 31, 33, 34, 36, 36, 37, 39, 39, 40, 40, 41, 45],
//     "Conditionals and recursion": [20, 23, 24, 24, 24, 25, 29, 31, 31, 33, 34, 36, 36, 37, 39, 39, 40, 40, 41, 45],
//     "Fruitful functions": [20, 23, 24, 24, 24, 25, 29, 31, 31, 33, 34, 36, 36, 37, 39, 39, 40, 40, 41, 45],
//   },
// };

// type Trends = {
//   date: Date;
//   num: number;
// };

// export type StackedBarStats = {
//   index: number;
//   alessEqualTen: number;
//   bgreaterTen: number;
//   cgreaterFifty: number;
//   dgreaterHundred: number;
// };
export type StudentStackedBarStats = {
  alessEqualTen: string[];
  bgreaterTen: string[];
  cgreaterFifty: string[];
  dgreaterHundred: string[];
};
export type StudentStackedBarStatsObject = {
  alessEqualTen: ISemesterStudent[];
  bgreaterTen: ISemesterStudent[];
  cgreaterFifty: ISemesterStudent[];
  dgreaterHundred: ISemesterStudent[];
};
export type StackedBarStatsData = {
  stackedBarStats: StackedBarStats[];
  studentStackedBarProposalsStats: StudentStackedBarStatsObject;
  studentStackedBarQuestionsStats: StudentStackedBarStatsObject;
};
export type StudenBarsSubgroupLocation = {
  proposals: number;
  questions: number;
};

// export type BubbleStats = {
//   students: number;
//   votes: number;
//   points: number;
// };

type BubbleStatsData = {
  bubbleStats: BubbleStats[];
  maxVote: number;
  maxVotePoints: number;
  minVote: number;
  minVotePoints: number;
};

export type TrendStats = {
  childProposals: Trends[];
  editProposals: Trends[];
  links: Trends[];
  nodes: Trends[];
  votes: Trends[];
  questions: Trends[];
};
// type MaxPoints = {
//   maxProposalsPoints: number;
//   maxQuestionsPoints: number;
// };
export type BoxChapterStat = {
  [key: string]: number[];
};

export type BoxTypeStat = {
  data: BoxChapterStat;
  min: number;
  max: number;
};
export type BoxStats = {
  proposalsPoints: BoxTypeStat;
  questionsPoints: BoxTypeStat;
  votesPoints: BoxTypeStat;
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

const Instructors: InstructorLayoutPage = ({ user, currentSemester, settings }) => {
  // const pointsChartRef = useRef<(HTMLElement & SVGElement) | null>(null);

  const theme = useTheme();
  const db = getFirestore();

  const isMovil = useMediaQuery(theme.breakpoints.down("md"));
  const isTablet = useMediaQuery(theme.breakpoints.only("md"));
  const isUpTablet = useMediaQuery(theme.breakpoints.up("md"));
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  console.log("isUpTablet", isUpTablet);
  const [semesterStats, setSemesterStats] = useState<SemesterStats | null>(null);
  const [studentsCounter, setStudentsCounter] = useState<number>(0);
  const [students, setStudents] = useState<ISemesterStudent[] | null>(null);

  //smester configs
  const [semesterConfig, setSemesterConfig] = useState<ISemester | null>(null);
  const [maxProposalsPoints, setMaxProposalsPoints] = useState<number>(0);
  const [maxQuestionsPoints, setMaxQuestionsPoints] = useState<number>(0);
  // const [rateCondition, setRateCondition] = useState<RateCondition | null>(null);

  // Stacked Bar Plot States
  const [stackedBar, setStackedBar] = useState<StackedBarStats[]>([]);
  const [proposalsStudents, setProposalsStudents] = useState<StudentStackedBarStatsObject | null>(null);
  const [questionsStudents, setQuestionsStudents] = useState<StudentStackedBarStatsObject | null>(null);
  // Bubble Plot States
  const [bubble, setBubble] = useState<BubbleStats[]>([]);
  const [bubbleAxis, setBubbleAxis] = useState<BubbleAxis>({ maxAxisX: 0, maxAxisY: 0, minAxisX: 0, minAxisY: 0 });

  /// Box plot States
  const [boxStats, setBoxStats] = useState<BoxStats>({
    proposalsPoints: { data: {}, min: 0, max: 1000 },
    questionsPoints: { data: {}, min: 0, max: 1000 },
    votesPoints: { data: {}, min: 0, max: 1000 },
  });

  //TrendStats
  const [trendStats, setTrendStats] = useState<TrendStats>({
    childProposals: [],
    editProposals: [],
    links: [],
    nodes: [],
    votes: [],
    questions: [],
  });

  //Loading Skeleton
  const [isLoading, setIsLoading] = useState<boolean>(true);
  //No stats data
  const [thereIsData, setThereIsData] = useState<boolean>(true);

  const [semesterStudentVoteState, setSemesterStudentVoteState] = useState<SemesterStudentVoteStat[]>([]);

  const [infoWidth, setInfoWidth] = useState(0);
  const [stackBarWidth, setstackBarWidth] = useState(0);

  const { width: windowWidth } = useWindowSize();

  const infoWrapperRef = useCallback((element: HTMLDivElement) => {
    if (!element) return;
    setInfoWidth(element.clientWidth);
  }, []);
  const stackBarWrapperRef = useCallback((element: HTMLDivElement) => {
    if (!element) return;
    setstackBarWidth(element.clientWidth);
  }, []);

  useEffect(() => {
    if (!user) return;
    if (!currentSemester || !currentSemester.tagId) return;
    console.log("currentSemester.tagId", currentSemester.tagId);
    const getSemesterData = async () => {
      const semesterRef = collection(db, "semesterStudentVoteStats");
      const q = query(semesterRef, where("tagId", "==", currentSemester.tagId), where("deleted", "==", false));
      const semesterDoc = await getDocs(q);
      if (!semesterDoc.docs.length) {
        setBubble([]);
        setStackedBar([]);
        setSemesterStats(null);
        setIsLoading(false);
        setThereIsData(false);
        setSemesterStudentVoteState([]);
        return;
      }

      // semesterStudentVoteState
      const semester = semesterDoc.docs.map(sem => sem.data() as SemesterStudentVoteStat);
      console.log("semestersemester", semester);
      setSemesterStudentVoteState(semester);
      setStudentsCounter(semester.length);
      setSemesterStats(getSemStat(semester));
      setIsLoading(false);
      setThereIsData(true);
    };
    getSemesterData();
  }, [currentSemester, currentSemester?.tagId, db, maxProposalsPoints, maxQuestionsPoints, user]);

  useEffect(() => {
    // update data in buble
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

  useEffect(() => {
    // update data in stackbar
    if (!semesterStudentVoteState.length || !students) return setStackedBar([]);

    const { stackedBarStats, studentStackedBarProposalsStats, studentStackedBarQuestionsStats } = getStackedBarStat(
      semesterStudentVoteState,
      students,
      maxProposalsPoints,
      maxQuestionsPoints
    );
    console.log("stackedBarStats", stackedBarStats);
    setStackedBar(stackedBarStats);
    setProposalsStudents(studentStackedBarProposalsStats);
    setQuestionsStudents(studentStackedBarQuestionsStats);
  }, [maxProposalsPoints, maxQuestionsPoints, semesterStudentVoteState, semesterStudentVoteState.length, students]);

  //STATIC "MODIFTY"
  useEffect(() => {
    if (!currentSemester || !currentSemester.tagId) return;
    setIsLoading(true);
    const getSemesterStudents = async () => {
      const semesterRef = doc(db, "semesters", currentSemester.tagId);
      const semesterDoc = await getDoc(semesterRef);
      if (!semesterDoc.exists()) return;

      const { maxProposalsPoints, maxQuestionsPoints } = getMaxProposalsQuestionsPoints(
        semesterDoc.data() as ISemester
      );
      setSemesterConfig(semesterDoc.data() as ISemester);
      setMaxProposalsPoints(maxProposalsPoints);
      setMaxQuestionsPoints(maxQuestionsPoints);
      setStudents(semesterDoc.data().students);
    };
    getSemesterStudents();
  }, [currentSemester, currentSemester?.tagId, db]);

  useEffect(() => {
    if (!currentSemester || !currentSemester.tagId || !semesterConfig) return;
    setIsLoading(true);
    const getUserDailyStat = async () => {
      const userDailyStatRef = collection(db, "semesterStudentStats");
      const q = query(userDailyStatRef, where("tagId", "==", currentSemester.tagId), where("deleted", "==", false));
      const userDailyStatDoc = await getDocs(q);

      if (!userDailyStatDoc.docs.length) {
        setTrendStats({ childProposals: [], editProposals: [], links: [], nodes: [], votes: [], questions: [] });

        setBoxStats({
          proposalsPoints: { data: {}, min: 0, max: 1000 },
          questionsPoints: { data: {}, min: 0, max: 1000 },
          votesPoints: { data: {}, min: 0, max: 1000 },
        });
        return;
      }

      const userDailyStats = userDailyStatDoc.docs.map(dailyStat => dailyStat.data() as SemesterStudentStat);

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

      setTrendStats({
        childProposals: makeTrendData(userDailyStats, "newNodes"),
        editProposals: makeTrendData(userDailyStats, "editProposals"),
        links: makeTrendData(userDailyStats, "links"),
        nodes: makeTrendData(userDailyStats, "proposals"),
        votes: makeTrendData(userDailyStats, "votes"),
        questions: makeTrendData(userDailyStats, "questions"),
      });
    };
    getUserDailyStat();
  }, [currentSemester, currentSemester?.tagId, db, semesterConfig]);

  const getMaxProposalsQuestionsPoints = (data: ISemester): MaxPoints => {
    return {
      maxProposalsPoints: data.nodeProposals.totalDaysOfCourse * data.nodeProposals.numPoints,
      maxQuestionsPoints: data.questionProposals.totalDaysOfCourse * data.questionProposals.numPoints,
    };
  };

  // const getTrendsData = (data: SemesterStudentStat[], key?: keyof ISemesterStudentStatDay, type?: string): Trends[] => {
  //   console.log(data, key, type);
  //   const trends: Trends[] = [];
  //   // data.map(dailyStat => {
  //   //   dailyStat.days.map(dayStat => {
  //   //     if (type && type === "Votes") {
  //   //       trends.push({
  //   //         date: new Date(dayStat.day),
  //   //         num: dayStat["agreementsWithInst"] + dayStat["disagreementsWithInst"],
  //   //       });
  //   //     } else if (type && type === "editProposals") {
  //   //       trends.push({
  //   //         date: new Date(dayStat.day),
  //   //         num: dayStat["proposals"] - dayStat["newNodes"],
  //   //       });
  //   //     } else if (key) {
  //   //       trends.push({ date: new Date(dayStat.day), num: dayStat[key] as number });
  //   //     }
  //   //   });
  //   // });
  //   return trends;
  // };

  const trendPlotHeightTop = isMovil ? 150 : isTablet ? 250 : 354;
  const trendPlotHeightBottom = isMovil ? 80 : isTablet ? 120 : 160;
  // const trendPlotWith = isMovil ? 300 : isTablet ? 600 : 1045;
  const trendPlotWith = isMovil ? windowWidth - 60 : isTablet ? windowWidth - 100 : windowWidth - 140;
  const boxPlotWidth = isDesktop ? 500 : isUpTablet ? 450 : 200;
  if (!thereIsData && !isLoading) {
    return <NoDataMessage />;
  }
  if (!currentSemester) return <NoDataMessage message="No data in this semester" />;

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
          gridTemplateColumns: { xs: "1fr", md: `auto auto minmax(auto, 629px)` },
          gap: "16px",
        }}
      >
        <Paper
          ref={infoWrapperRef}
          sx={{
            px: "32px",
            py: "40px",
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
            px: "32px",
            py: "40px",
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
                  marginBottom: "24px",
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
                  theme={settings.theme}
                />
              </Box>
            </>
          )}
        </Paper>
        <Paper
          // ref={bubbleRef}
          // className="test"
          sx={{
            px: "32px",
            py: "40px",
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
                  marginBottom: "6px",
                }}
              >
                <Typography sx={{ fontSize: "19px", mb: "40px" }}>Leaderboard Points</Typography>
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
                  isMovil ? windowWidth - 10 - 64 - 32 : windowWidth - infoWidth - stackBarWidth - 40 - 32 - 64 - 32
                }
                margin={{ top: 20, right: 0, bottom: 40, left: 50 }}
                theme={settings.theme}
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
            p: isMovil ? "10px 10px" : "40px 20px",
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
            {isLoading && <BoxPlotStatsSkeleton width={boxPlotWidth} mobile={isTablet || isMovil} />}
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
                    offsetX={isMovil ? 125 : 200}
                    offsetY={18}
                    identifier="boxplot1"
                    maxX={boxStats.proposalsPoints.max}
                    minX={boxStats.proposalsPoints.min}
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
                    theme={"Dark"}
                    data={boxStats.questionsPoints.data}
                    drawYAxis={isMovil || isTablet}
                    width={boxPlotWidth}
                    boxHeight={25}
                    margin={{ top: 10, right: 0, bottom: 20, left: 10 }}
                    offsetX={isTablet ? 200 : isMovil ? 125 : 2}
                    offsetY={18}
                    identifier="boxplot1"
                    maxX={boxStats.questionsPoints.max}
                    minX={boxStats.questionsPoints.min}
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
                    theme={"Dark"}
                    data={boxStats.votesPoints.data}
                    drawYAxis={isMovil || isTablet}
                    width={boxPlotWidth}
                    boxHeight={25}
                    margin={{ top: 10, right: 0, bottom: 20, left: 10 }}
                    offsetX={isTablet ? 200 : isMovil ? 125 : 2}
                    offsetY={18}
                    identifier="boxplot1"
                    minX={boxStats.votesPoints.min}
                    maxX={boxStats.votesPoints.max}
                  />
                  {isMovil && <BoxLegend />}
                </Box>
              </>
            )}
          </Box>
          {!isMovil && <BoxLegend />}
        </Paper>
        {/* <Paper
          sx={{
            p: isMovil ? "10px" : isTablet ? "20px" : "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <TrendPlot
            title={"New Node Points"}
            // heightTop={(354 * width) / 1045}
            // heightBottom={(160 * width) / 1045}
            heightTop={isMovil ? 150 : isTablet ? 250 : 354}
            heightBottom={isMovil ? 80 : isTablet ? 120 : 160}
            // width={WIDTH}
            width={isMovil ? 300 : isTablet ? 600 : 1045}
            scaleX={"time"}
            labelX={"Day"}
            scaleY={"linear"}
            labelY={"# of Proposals"}
            theme={"Dark"}
            x="date"
            y="num"
            trendData={TRENDS_DATA}
          />
        </Paper> */}

        {isLoading && (
          <Paper
            sx={{
              p: isMovil ? "10px" : isTablet ? "20px" : "40px",
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
                  p: isMovil ? "10px" : isTablet ? "20px" : "40px",
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
  return <InstructorsLayout>{props => <Instructors {...props} />}</InstructorsLayout>;
};

// if session: page continue here and managed role by layout
// if no session redirect to login
export default withAuthUser({
  shouldRedirectToLogin: true,
  shouldRedirectToHomeIfAuthenticated: false,
})(PageWrapper);

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
    const votes = d.votes;
    const votePoints = d.votePoints;
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
    if (d.votes > maxVote) maxVote = d.votes;
    if (d.votePoints > maxVotePoints) maxVotePoints = d.votePoints;
    if (d.votes < minVote) minVote = d.votes;
    if (d.votePoints < minVotePoints) minVotePoints = d.votePoints;
  });
  return {
    bubbleStats,
    maxVote,
    maxVotePoints,
    minVote,
    minVotePoints,
  };
};

const findBubble = (bubbles: BubbleStats[], votes: number, votePoints: number): number => {
  const index = bubbles.findIndex(b => b.points === votePoints && b.votes === votes);
  return index;
};
export const makeTrendData = (data: SemesterStudentStat[], key: string): Trends[] => {
  const dailyStudentsStat = data
    .reduce((acu: { field: { num: number; day: string } }[], cur) => {
      const userTrendData = cur.days.map(day => {
        const num = day.chapters.reduce((_carry, chapter) => {
          if (key in chapter) {
            return _carry + (chapter[key as keyof ISemesterStudentStatChapter] as number);
          } else if (key === "votes") {
            return _carry + chapter.agreementsWithInst + chapter.disagreementsWithInst;
          } else if (key === "editProposals") {
            return _carry + chapter["proposals"] - chapter["newNodes"];
          } else {
            return _carry;
          }
        }, 0);

        return { field: { num, day: day.day } };
      });

      return [...acu, ...userTrendData];
    }, [])
    .reduce((acu: { [key: string]: number }, cur) => {
      return {
        ...acu,
        [cur.field.day]: (acu[cur.field.day] ?? 0) + cur.field.num,
      };
    }, {});

  return Object.keys(dailyStudentsStat).map(cur => {
    return {
      date: new Date(cur),
      num: dailyStudentsStat[cur],
    };
  }) as Trends[];
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
  console.log("userDailyStats", userDailyStats);
  const res = userDailyStats.map(cur => {
    // [{c1:1,c2:3},{c1:1,c2:3}]
    const groupedDays = cur.days.reduce((acuDayPerStudent: { [key: string]: number }, curDayPerStudent) => {
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

// const mapData = (data: number[], numPoints: number, numProposalPerDay: number) => {
//   return data.map(cur => (cur * numPoints) / numProposalPerDay);
// };

// const mapBloxPlotDataToProposals = (data: { [x: string]: number[] }, numPoints: number, numProposalPerDay: number) => {
//   // proposals * (numPoints / numProposalPerDay)
//   return Object.keys(data).reduce((acu: { [x: string]: number[] }, cur) => {
//     const prev = acu[cur] ?? [];
//     return { ...acu, [cur]: [...prev, ...mapData(data[cur], numPoints, numProposalPerDay)] };
//   }, {});
// };

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
