// import PlaceIcon from "@mui/icons-material/Place";
import { Paper, Typography /* useTheme */, useMediaQuery, useTheme } from "@mui/material";
// import { useTheme } from "@mui/material/styles";
// import useMediaQuery from "@mui/material/useMediaQuery";
import { Box } from "@mui/system";
import { collection, doc, getDoc, getDocs, getFirestore, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  BubbleAxis,
  BubbleStats,
  MaxPoints,
  SemesterStats,
  SemesterStudentStat,
  SemesterStudentVoteStat,
  StackedBarStats,
  Trends,
} from "src/instructorsTypes";
import { ISemester, ISemesterStudent, ISemesterStudentStatDay } from "src/types/ICourse";

// import { BoxChart } from "@/components/chats/BoxChart";
import { BubbleChart } from "@/components/chats/BubbleChart";

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
import { getSemStat, getStackedBarStat } from "../../lib/utils/charts.utils";
export type Chapter = {
  [key: string]: number[];
};
export type BoxData = {
  "Proposal Points": Chapter;
  "Question Points": Chapter;
  "Vote Points": Chapter;
};

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

// type MaxPoints = {
//   maxProposalsPoints: number;
//   maxQuestionsPoints: number;
// };

// const BoxLegend = () => {
//   return (
//     <Box sx={{ display: "flex", gap: "16px", alignItems: "center", alignSelf: "center" }}>
//       <Box sx={{ display: "flex", gap: "6px", alignItems: "center" }}>
//         <SquareIcon sx={{ fill: "#EC7115", fontSize: "12px" }} />
//         <Typography sx={{ fontSize: "12px" }}>Class Average</Typography>
//       </Box>
//       <Box sx={{ display: "flex", gap: "6px", alignItems: "center" }}>
//         <PlaceIcon sx={{ fill: "#EF5350", fontSize: "16px" }} />
//         <Typography sx={{ fontSize: "12px" }}>Your Position</Typography>
//       </Box>
//     </Box>
//   );
// };

const Instructors: InstructorLayoutPage = ({ user, currentSemester, settings }) => {
  // const pointsChartRef = useRef<(HTMLElement & SVGElement) | null>(null);

  const theme = useTheme();
  const db = getFirestore();

  const isMovil = useMediaQuery(theme.breakpoints.down("md"));
  const isTablet = useMediaQuery(theme.breakpoints.only("md"));
  const [semesterStats, setSemesterStats] = useState<SemesterStats | null>(null);
  const [studentsCounter, setStudentsCounter] = useState<number>(0);
  const [students, setStudents] = useState<ISemesterStudent[] | null>(null);
  //

  const [maxProposalsPoints, setMaxProposalsPoints] = useState<number>(0);
  const [maxQuestionsPoints, setMaxQuestionsPoints] = useState<number>(0);
  // const [rateCondition, setRateCondition] = useState<RateCondition | null>(null);

  // Stacked Bar Plot States
  const [stackedBar, setStackedBar] = useState<StackedBarStats[]>([]);
  const [maxStackedBarAxisY, setMaxStackedBarAxisY] = useState<number>(0);
  const [proposalsStudents, setProposalsStudents] = useState<StudentStackedBarStatsObject | null>(null);
  const [questionsStudents, setQuestionsStudents] = useState<StudentStackedBarStatsObject | null>(null);
  // Bubble Plot States
  const [bubble, setBubble] = useState<BubbleStats[]>([]);
  const [bubbleAxis, setBubbleAxis] = useState<BubbleAxis>({ maxAxisX: 0, maxAxisY: 0, minAxisX: 0, minAxisY: 0 });

  const [linksTrend, setLinksTrend] = useState<Trends[]>([]);
  const [questionsTrend, setQuestionsTrend] = useState<Trends[]>([]);
  // const [newNodePoints, setNewNodePoints] = useState(second);
  const [votesTrends, setVotesTrends] = useState<Trends[]>([]);
  const [nodesTrends, setNodesTrends] = useState<Trends[]>([]);
  const [editProposalsTrend, setEditProposalsTrend] = useState<Trends[]>([]);

  //Loading Skeleton
  const [isLoading, setIsLoading] = useState<boolean>(true);
  //No stats data
  const [thereIsData, setThereIsData] = useState<boolean>(true);

  const [semesterStudentVoteState, setSemesterStudentVoteState] = useState<SemesterStudentVoteStat[]>([]);

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
        setSemesterStats(null);
        setIsLoading(false);
        setThereIsData(false);
        setSemesterStudentVoteState([]);
        return;
      }

      // semesterStudentVoteState
      const semester = semesterDoc.docs.map(sem => sem.data() as SemesterStudentVoteStat);
      setSemesterStudentVoteState(semester);

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
      console.log("maxProposalsPoints", { maxProposalsPoints, maxQuestionsPoints });
      setMaxProposalsPoints(maxProposalsPoints);
      setMaxQuestionsPoints(maxQuestionsPoints);
      setStudentsCounter(semesterDoc.data().students.length);
      setStudents(semesterDoc.data().students);
      setMaxStackedBarAxisY(semesterDoc.data().students.length);
    };
    getSemesterStudents();
  }, [currentSemester, currentSemester?.tagId, db]);

  useEffect(() => {
    if (!currentSemester || !currentSemester.tagId) return;
    setIsLoading(true);
    const getUserDailyStat = async () => {
      const userDailyStatRef = collection(db, "semesterStudentStats");
      const q = query(userDailyStatRef, where("tagId", "==", currentSemester.tagId));
      const userDailyStatDoc = await getDocs(q);

      if (!userDailyStatDoc.docs.length) {
        setLinksTrend([]);
        setQuestionsTrend([]);
        setVotesTrends([]);
        setNodesTrends([]);
        setEditProposalsTrend([]);

        return;
      }

      const userDailyStats = userDailyStatDoc.docs.map(dailyStat => dailyStat.data() as SemesterStudentStat);
      setLinksTrend(getTrendsData(userDailyStats, "links"));
      setQuestionsTrend(getTrendsData(userDailyStats, "questions"));
      setVotesTrends(getTrendsData(userDailyStats, "agreementsWithInst", "Votes"));
      setNodesTrends(getTrendsData(userDailyStats, "newNodes"));
      setEditProposalsTrend(getTrendsData(userDailyStats, "newNodes", "editProposals"));
    };
    getUserDailyStat();
  }, [currentSemester, currentSemester?.tagId, db]);

  const getMaxProposalsQuestionsPoints = (data: ISemester): MaxPoints => {
    return {
      maxProposalsPoints: data.nodeProposals.totalDaysOfCourse * data.nodeProposals.numPoints,
      maxQuestionsPoints: data.questionProposals.totalDaysOfCourse * data.questionProposals.numPoints,
    };
  };

  const getTrendsData = (data: SemesterStudentStat[], key?: keyof ISemesterStudentStatDay, type?: string): Trends[] => {
    const trends: Trends[] = [];
    data.map(dailyStat => {
      dailyStat.days.map(dayStat => {
        if (type && type === "Votes") {
          trends.push({
            date: new Date(dayStat.day),
            num: dayStat["agreementsWithInst"] + dayStat["disagreementsWithInst"],
          });
        } else if (type && type === "editProposals") {
          trends.push({
            date: new Date(dayStat.day),
            num: dayStat["proposals"] - dayStat["newNodes"],
          });
        } else if (key) {
          trends.push({ date: new Date(dayStat.day), num: dayStat[key] as number });
        }
      });
    });
    return trends;
  };

  const trendPlotHeightTop = isMovil ? 150 : isTablet ? 250 : 354;
  const trendPlotHeightBottom = isMovil ? 80 : isTablet ? 120 : 160;
  const trendPlotWith = isMovil ? 300 : isTablet ? 600 : 1045;

  if (!thereIsData && !isLoading) {
    return <NoDataMessage />;
  }
  if (!currentSemester) return <NoDataMessage message="No data in this semester" />;

  return (
    <Box
      sx={{
        pb: "10px",
        maxWidth: "1384px",
        m: "auto",
        px: { xs: "10px", xl: "0px" },
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
          sx={{
            px: "32px",
            py: "40px",
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
          sx={{
            px: "32px",
            py: "40px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
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
                  <Typography># of Students</Typography>
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
                  proposalsStudents={proposalsStudents}
                  questionsStudents={questionsStudents}
                  maxAxisY={maxStackedBarAxisY}
                  theme={settings.theme}
                />
              </Box>
            </>
          )}
        </Paper>
        <Paper sx={{ px: "32px", py: "40px" }}>
          {isLoading && <BubblePlotStatsSkeleton />}
          {!isLoading && (
            <>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "16px",
                }}
              >
                <Typography sx={{ fontSize: "19px", mb: "40px" }}>Vote Points</Typography>
                <Legend
                  title={"Completion rate"}
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
                width={isMovil ? 220 : 500}
                margin={{ top: 10, right: 0, bottom: 35, left: 50 }}
                theme={settings.theme}
                maxAxisX={bubbleAxis.maxAxisX}
                maxAxisY={bubbleAxis.maxAxisY}
                minAxisX={bubbleAxis.minAxisX}
                minAxisY={bubbleAxis.minAxisY}
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
        {/* <Paper
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
            <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <Box sx={{ display: "flex", justifyContent: "space-around" }}>
                <Typography sx={{ fontSize: "19px" }}>Chapters </Typography>
                <Typography sx={{ fontSize: "19px" }}> Proposal Points</Typography>
              </Box>
              <BoxChart
                theme={"Dark"}
                data={data["Proposal Points"]}
                width={isMovil ? 300 : 450}
                boxHeight={25}
                margin={{ top: 10, right: 0, bottom: 20, left: 8 }}
                offsetX={150}
                offsetY={18}
                identifier="boxplot1"
              />
              {isMovil && <BoxLegend />}
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <Box sx={{ display: "flex", justifyContent: "space-around" }}>
                {isMovil && <Typography sx={{ fontSize: "19px" }}>Chapters </Typography>}
                <Typography sx={{ fontSize: "19px" }}> Question Points</Typography>
              </Box>
              <BoxChart
                theme={"Dark"}
                data={data["Question Points"]}
                drawYAxis={isMovil}
                width={isMovil ? 300 : 300}
                boxHeight={25}
                margin={{ top: 10, right: 0, bottom: 20, left: 10 }}
                offsetX={isMovil ? 150 : 2}
                offsetY={18}
                identifier="boxplot1"
              />
              {isMovil && <BoxLegend />}
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <Box sx={{ display: "flex", justifyContent: "space-around" }}>
                {isMovil && <Typography sx={{ fontSize: "19px" }}>Chapters </Typography>}
                <Typography sx={{ fontSize: "19px" }}> Vote Points</Typography>
              </Box>
              <BoxChart
                theme={"Dark"}
                data={data["Vote Points"]}
                drawYAxis={isMovil}
                width={isMovil ? 300 : 300}
                boxHeight={25}
                margin={{ top: 10, right: 0, bottom: 20, left: 10 }}
                offsetX={isMovil ? 150 : 2}
                offsetY={18}
                identifier="boxplot1"
              />
              {isMovil && <BoxLegend />}
            </Box>
          </Box>
          {!isMovil && <BoxLegend />}
        </Paper> */}
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
            }}
          >
            <StudentDailyPlotStatsSkeleton isMovil={isMovil} isTablet={isTablet} />
          </Paper>
        )}

        {!isLoading && (
          <>
            <Paper
              sx={{
                p: isMovil ? "10px" : isTablet ? "20px" : "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <TrendPlot
                title={"Edit proposals"}
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
                trendData={editProposalsTrend}
              />
            </Paper>

            <Paper
              sx={{
                p: isMovil ? "10px" : isTablet ? "20px" : "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <TrendPlot
                title={"Links"}
                heightTop={trendPlotHeightTop}
                heightBottom={trendPlotHeightBottom}
                width={trendPlotWith}
                scaleX={"time"}
                labelX={"Day"}
                scaleY={"linear"}
                labelY={"# of Links"}
                theme={theme.palette.mode === "dark" ? "Dark" : "Light"}
                x="date"
                y="num"
                trendData={linksTrend}
              />
            </Paper>

            <Paper
              sx={{
                p: isMovil ? "10px" : isTablet ? "20px" : "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <TrendPlot
                title={"Nodes"}
                heightTop={trendPlotHeightTop}
                heightBottom={trendPlotHeightBottom}
                width={trendPlotWith}
                scaleX={"time"}
                labelX={"Day"}
                scaleY={"linear"}
                labelY={"# of Nodes"}
                theme={theme.palette.mode === "dark" ? "Dark" : "Light"}
                x="date"
                y="num"
                trendData={nodesTrends}
              />
            </Paper>

            <Paper
              sx={{
                p: isMovil ? "10px" : isTablet ? "20px" : "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <TrendPlot
                title={"Votes"}
                heightTop={trendPlotHeightTop}
                heightBottom={trendPlotHeightBottom}
                width={trendPlotWith}
                scaleX={"time"}
                labelX={"Day"}
                scaleY={"linear"}
                labelY={"# of Votes"}
                theme={theme.palette.mode === "dark" ? "Dark" : "Light"}
                x="date"
                y="num"
                trendData={votesTrends}
              />
            </Paper>

            <Paper
              sx={{
                p: isMovil ? "10px" : isTablet ? "20px" : "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <TrendPlot
                title={"Questions"}
                heightTop={trendPlotHeightTop}
                heightBottom={trendPlotHeightBottom}
                width={trendPlotWith}
                scaleX={"time"}
                labelX={"Day"}
                scaleY={"linear"}
                labelY={"# of Questions"}
                theme={theme.palette.mode === "dark" ? "Dark" : "Light"}
                x="date"
                y="num"
                trendData={questionsTrend}
              />
            </Paper>
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
