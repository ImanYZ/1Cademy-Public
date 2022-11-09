import { Box, Paper, Typography, useMediaQuery, useTheme } from "@mui/material";
import { collection, doc, getDoc, getDocs, getFirestore, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";

import { BubbleChart } from "../../../components/chats/BubbleChart";
import { Legend } from "../../../components/chats/Legend";
import { PointsBarChart } from "../../../components/chats/PointsBarChart";
import { TrendPlot } from "../../../components/chats/TrendPlot";
import { GeneralPlotStats } from "../../../components/instructors/dashboard/GeneralPlotStats";
import { NoDataMessage } from "../../../components/instructors/NoDataMessage";
import { BubblePlotStatsSkeleton } from "../../../components/instructors/skeletons/BubblePlotStatsSkeleton";
import { GeneralPlotStatsSkeleton } from "../../../components/instructors/skeletons/GeneralPlotStatsSkeleton";
import { StackedBarPlotStatsSkeleton } from "../../../components/instructors/skeletons/StackedBarPlotStatsSkeleton";
import { InstructorLayoutPage } from "../../../components/layouts/InstructorsLayout";
import { StudentsLayout } from "../../../components/layouts/StudentsLayout";
import {
  BubbleAxis,
  BubbleStats,
  MaxPoints,
  SemesterStats,
  SemesterStudentStat,
  SemesterStudentVoteStat,
  StackedBarStats,
  Trends,
} from "../../../instructorsTypes";
import { getSemStat, getStackedBarStat } from "../../../lib/utils/charts.utils";
import { ISemester, ISemesterStudent, ISemesterStudentStatDay } from "../../../types/ICourse";
import { getBubbleStats, StudentStackedBarStats } from "../dashboard";

const StudentDashboard: InstructorLayoutPage = ({ user, currentSemester, settings }) => {
  const db = getFirestore();

  const [nodesTrends, setNodesTrends] = useState<Trends[]>([]);
  const [votesTrends, setVotesTrends] = useState<Trends[]>([]);
  const [questionsTrend, setQuestionsTrend] = useState<Trends[]>([]);
  const [linksTrend, setLinksTrend] = useState<Trends[]>([]);
  const [editProposalsTrend, setEditProposalsTrend] = useState<Trends[]>([]);
  const theme = useTheme();
  const isMovil = useMediaQuery(theme.breakpoints.down("md"));
  const isTablet = useMediaQuery(theme.breakpoints.only("md"));

  const [semesterStats, setSemesterStats] = useState<SemesterStats | null>(null);
  const [stackedBar, setStackedBar] = useState<StackedBarStats[]>([]);
  const [bubble, setBubble] = useState<BubbleStats[]>([]);
  const [thereIsData, setThereIsData] = useState<boolean>(true);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [maxProposalsPoints, setMaxProposalsPoints] = useState<number>(0);
  const [maxQuestionsPoints, setMaxQuestionsPoints] = useState<number>(0);
  const [studentsCounter, setStudentsCounter] = useState<number>(0);

  const [students, setStudents] = useState<ISemesterStudent[] | null>(null);
  const [maxStackedBarAxisY, setMaxStackedBarAxisY] = useState<number>(0);

  const [proposalsStudents, setProposalsStudents] = useState<StudentStackedBarStats | null>(null);
  const [questionsStudents, setQuestionsStudents] = useState<StudentStackedBarStats | null>(null);

  const [bubbleAxis, setBubbleAxis] = useState<BubbleAxis>({ maxAxisX: 0, maxAxisY: 0, minAxisX: 0, minAxisY: 0 });

  const [semesterStudentVoteState, setSemesterStudentVoteState] = useState<SemesterStudentVoteStat[]>([]);

  console.log({ user, currentSemester, isMovil });

  const trendPlotHeightTop = isMovil ? 150 : isTablet ? 250 : 354;
  const trendPlotHeightBottom = isMovil ? 80 : isTablet ? 120 : 160;
  const trendPlotWith = isMovil ? 300 : isTablet ? 600 : 1045;

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

    const { bubbleStats, maxVote, maxVotePoints, minVote, minVotePoints } = getBubbleStats(semesterStudentVoteState);
    setBubble(bubbleStats);
    setBubbleAxis({
      maxAxisX: maxVote,
      maxAxisY: maxVotePoints,
      minAxisX: minVote,
      minAxisY: minVotePoints,
    });
  }, [semesterStudentVoteState]);

  useEffect(() => {
    // update data in stackbar
    if (!semesterStudentVoteState.length) return setStackedBar([]);

    const { stackedBarStats, studentStackedBarProposalsStats, studentStackedBarQuestionsStats } = getStackedBarStat(
      semesterStudentVoteState,
      maxProposalsPoints,
      maxQuestionsPoints
    );
    setStackedBar(stackedBarStats);
    setProposalsStudents(studentStackedBarProposalsStats);
    setQuestionsStudents(studentStackedBarQuestionsStats);
  }, [maxProposalsPoints, maxQuestionsPoints, semesterStudentVoteState, semesterStudentVoteState.length]);

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
    const uname = "elizadh";
    setIsLoading(true);
    const getUserDailyStat = async () => {
      const userDailyStatRef = collection(db, "semesterStudentStats");
      const q = query(userDailyStatRef, where("tagId", "==", currentSemester.tagId), where("uname", "==", uname));
      const userDailyStatDoc = await getDocs(q);

      console.log("userDailyStatDoc", userDailyStatDoc.docs.length);

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

  const getMaxProposalsQuestionsPoints = (data: ISemester): MaxPoints => {
    return {
      maxProposalsPoints: data.nodeProposals.totalDaysOfCourse * data.nodeProposals.numPoints,
      maxQuestionsPoints: data.questionProposals.totalDaysOfCourse * data.questionProposals.numPoints,
    };
  };

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
                  students={students}
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
                <Typography sx={{ fontSize: "16px", mb: "40px" }}>Vote Points</Typography>
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
      </Box>
    </Box>
  );
};

// This wrapper expose the shared variables from filters
const PageWrapper = () => {
  return <StudentsLayout>{props => <StudentDashboard {...props} />}</StudentsLayout>;
};
export default PageWrapper;
