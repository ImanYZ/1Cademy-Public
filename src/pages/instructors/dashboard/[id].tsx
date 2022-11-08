import PlaceIcon from "@mui/icons-material/Place";
import SquareIcon from "@mui/icons-material/Square";
import { Divider, Paper, Typography /* useTheme */, useMediaQuery, useTheme } from "@mui/material";
// import { useTheme } from "@mui/material/styles";
// import useMediaQuery from "@mui/material/useMediaQuery";
import { Box } from "@mui/system";
import { collection, doc, getDoc, getDocs, getFirestore, query, where } from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import { SemesterStudentStat, SemesterStudentVoteStat } from "src/instructorsTypes";
import { ISemesterStudentStatDay } from "src/types/ICourse";

import { BoxChart } from "@/components/chats/BoxChart";
import { BubbleChart } from "@/components/chats/BubbleChart";

import { PointsBarChart } from "../../components/chats/PointsBarChart";
import { TrendPlot } from "../../components/chats/TrendPlot";
import { InstructorLayoutPage, InstructorsLayout } from "../../components/layouts/InstructorsLayout";
export type Chapter = {
  [key: string]: number[];
};
export type BoxData = {
  "Proposal Points": Chapter;
  "Question Points": Chapter;
  "Vote Points": Chapter;
};

// const TRENDS_DATA = [
//   {
//     date: new Date("2/1/22"),
//     num: 9,
//   },
//   {
//     date: new Date("2/2/22"),
//     num: 20,
//   },
//   {
//     date: new Date("2/4/22"),
//     num: 9,
//   },
//   {
//     date: new Date("2/5/22"),
//     num: 9,
//   },
//   {
//     date: new Date("2/6/22"),
//     num: 9,
//   },
//   {
//     date: new Date("2/7/22"),
//     num: 9,
//   },
//   {
//     date: new Date("2/8/22"),
//     num: 9,
//   },
//   {
//     date: new Date("2/9/22"),
//     num: 9,
//   },
//   {
//     date: new Date("2/10/22"),
//     num: 9,
//   },
// ];

// const Semester = "2gbmyJVzQY1FBafjBtRx";
const completionProposals = 100;
const completionQuestions = 100;

export type StackedBarStats = {
  index: number;
  alessEqualTen: number;
  bgreaterTen: number;
  cgreaterFifty: number;
  dgreaterHundred: number;
};

export type BubbleStats = {
  students: number;
  votes: number;
  points: number;
};

type BubbleStatsData = {
  bubbleStats: BubbleStats[];
  maxVote: number;
  maxVotePoints: number;
  minVote: number;
  minVotePoints: number;
};

type SemesterStats = {
  newNodeProposals: number;
  editProposals: number;
  links: number;
  nodes: number;
  votes: number;
  questions: number;
};

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

const Instructors: InstructorLayoutPage = ({ user, currentSemester }) => {
  // const pointsChartRef = useRef<(HTMLElement & SVGElement) | null>(null);

  const theme = useTheme();
  // const [screenSize, setScreenSize] = useState(null);
  const db = getFirestore();
  const isMovil = useMediaQuery(theme.breakpoints.down("md"));
  const isTablet = useMediaQuery(theme.breakpoints.only("md"));
  const [semesterStats, setSemesterStats] = useState<SemesterStats | null>(null);
  const [students, setStudents] = useState<number>(0);

  // Stacked Bar Plot States
  const [stackedBar, setStackedBar] = useState<StackedBarStats[]>([]);
  const [maxStackedBarAxisY, setMaxStackedBarAxisY] = useState<number>(0);

  // Bubble Plot States
  const [bubble, setBubble] = useState<BubbleStats[]>([]);
  const [maxBubbleAxisX, setMaxBubbleAxisX] = useState<number>(0);
  const [maxBubbleAxisY, setMaxBubbleAxisY] = useState<number>(0);
  const [minBubbleAxisX, setMinBubbleAxisX] = useState<number>(0);
  const [minBubbleAxisY, setMinBubbleAxisY] = useState<number>(0);

  const [linksTrend, setLinksTrend] = useState<Trends[]>([]);
  const [questionsTrend, setQuestionsTrend] = useState<Trends[]>([]);
  // const [newNodePoints, setNewNodePoints] = useState(second);
  const [votesTrends, setVotesTrends] = useState<Trends[]>([]);
  const [nodesTrends, setNodesTrends] = useState<Trends[]>([]);
  const [editProposalsTrend, setEditProposalsTrend] = useState<Trends[]>([]);

  const getBubbleStats = useCallback((data: SemesterStudentVoteStat[]): BubbleStatsData => {
    const bubbleStats: BubbleStats[] = [];
    let maxVote: number = 0;
    let maxVotePoints: number = 0;
    let minVote: number = 1000;
    let minVotePoints: number = 1000;

    data.map(d => {
      let bubbleStat: BubbleStats = {
        students: 0,
        votes: 0,
        points: 0,
      };
      const votes = d.votes;
      const votePoints = d.votePoints;
      const index = findBubble(bubbleStats, votes, votePoints);
      if (index >= 0) {
        bubbleStats[index].students += 1;
      } else {
        bubbleStat.votes = votes;
        bubbleStat.points = votePoints;
        bubbleStat.students += 1;
        bubbleStats.push(bubbleStat);
      }
      if (d.votes + 10 > maxVote) maxVote = d.votes + 10;
      if (d.votePoints + 4 > maxVotePoints) maxVotePoints = d.votePoints + 4;
      if (d.votes - 10 < minVote) minVote = d.votes - 10;
      if (d.votePoints - 4 < minVotePoints) minVotePoints = d.votePoints - 4;
    });
    return {
      bubbleStats,
      maxVote,
      maxVotePoints,
      minVote,
      minVotePoints,
    };
  }, []);

  const findBubble = (bubbles: BubbleStats[], votes: number, votePoints: number): number => {
    const index = bubbles.findIndex(b => b.points === votePoints && b.votes === votes);
    return index;
  };

  useEffect(() => {
    if (!user) return;
    if (!currentSemester || !currentSemester.tagId) return;

    const getSemesterData = async () => {
      const semesterRef = collection(db, "semesterStudentVoteStats");
      const q = query(semesterRef, where("tagId", "==", currentSemester.tagId));
      const semesterDoc = await getDocs(q);
      if (!semesterDoc.docs.length) {
        setBubble([]);
        setStackedBar([]);
        setSemesterStats(null);
        return;
      }

      const semester = semesterDoc.docs.map(sem => sem.data() as SemesterStudentVoteStat);
      setSemesterStats(getSemStat(semester));
      setStackedBar(getStackedBarStat(semester));
      const { bubbleStats, maxVote, maxVotePoints, minVote, minVotePoints } = getBubbleStats(semester);
      setBubble(bubbleStats);
      setMaxBubbleAxisX(maxVote);
      setMaxBubbleAxisY(maxVotePoints);
      setMinBubbleAxisX(minVote);
      setMinBubbleAxisY(minVotePoints);
    };
    getSemesterData();
  }, [currentSemester, currentSemester?.tagId, db, getBubbleStats, user]);

  //STATIC "MODIFTY"
  useEffect(() => {
    if (!currentSemester || !currentSemester.tagId) return;
    const getSemesterStudents = async () => {
      const semesterRef = doc(db, "semesters", currentSemester.tagId);
      const semesterDoc = await getDoc(semesterRef);
      if (!semesterDoc.exists()) return;
      setStudents(semesterDoc.data().students.length);
      setMaxStackedBarAxisY(semesterDoc.data().students.length);
    };
    getSemesterStudents();
  }, [currentSemester, currentSemester?.tagId, db]);

  useEffect(() => {
    if (!currentSemester || !currentSemester.tagId) return;
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

  const getSemStat = (data: SemesterStudentVoteStat[]): SemesterStats => {
    let newNodeProposals = 0;
    let editProposals = 0;
    let links = 0;
    let nodes = 0;
    let votes = 0;
    let questions = 0;

    data.map(stat => {
      newNodeProposals += stat.newNodes;
      editProposals += stat.improvements;
      links += stat.links;
      nodes += stat.nodes;
      votes += stat.votes;
      questions += stat.questions;
    });
    return {
      newNodeProposals,
      editProposals,
      links,
      nodes,
      questions,
      votes,
    };
  };

  const getStackedBarStat = (data: SemesterStudentVoteStat[]): StackedBarStats[] => {
    const stackedBarStats: StackedBarStats[] = [];
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
    data.map(d => {
      const proposals = d.totalPoints;
      const question = d.questionPoints;

      if (proposals > (100 * completionProposals) / 100) {
        ProposalsRate.dgreaterHundred += 1;
      } else if (proposals > (50 * completionProposals) / 100) {
        ProposalsRate.cgreaterFifty += 1;
      } else if (proposals > (10 * completionProposals) / 100) {
        ProposalsRate.bgreaterTen += 1;
      } else if (proposals <= (10 * completionProposals) / 100) {
        ProposalsRate.alessEqualTen += 1;
      }
      if (question > (100 * completionQuestions) / 100) {
        QuestionsRate.dgreaterHundred += 1;
      } else if (question > (50 * completionQuestions) / 100) {
        QuestionsRate.cgreaterFifty += 1;
      } else if (question > (10 * completionQuestions) / 100) {
        QuestionsRate.bgreaterTen += 1;
      } else if (question <= (10 * completionQuestions) / 100) {
        QuestionsRate.alessEqualTen += 1;
      }
    });
    stackedBarStats.push(ProposalsRate);
    stackedBarStats.push(QuestionsRate);
    return stackedBarStats;
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
  // (dayStat.day as any).toDate()
  // useEffect(()=>{

  // })
  // const isMovil = useMediaQuery(theme.breakpoints.values());

  // const [width, setWith] = useState(0);
  // const getWith = useCallback(ref => {
  //   if (!ref) return 0;

  //   // console.log({ ref: ref.clientWidth });
  //   setWith(ref.clientWidth);
  // }, []);

  // const getWith = useCallback(ref => {
  //   if (!ref) return 0;

  //   // console.log({ ref: ref.clientWidth });
  //   setWith(ref.clientWidth);
  // }, []);

  // useEffect(() => {}, [isSmall, isMedium]);

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
          <Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                columnGap: "8px",
                color: "white",
              }}
            >
              <Typography sx={{ color: "#EC7115", fontSize: "36px" }}>
                {currentSemester?.cTitle.split(" ")[0]}{" "}
              </Typography>
              <span>{currentSemester?.title}</span>
              <span> {students !== 0 ? `Students: ${students}` : ""}</span>
            </Box>
            <span>{currentSemester?.pTitle}</span>
            <Divider />
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 64px",
                justifyContent: "center",
                alignItems: "end",
                py: "12px",
                textAlign: "center",
                columnGap: "16px",
              }}
            >
              <span style={{ color: "#303134" }}>Spaceeesssssssssss</span>
              <span>Numbers</span>
            </Box>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 64px",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
                columnGap: "16px",
                rowGap: "24px",
              }}
            >
              <span style={{ textAlign: "left" }}>New Node Proposals</span>
              <span>{semesterStats?.newNodeProposals}</span>
              <span style={{ textAlign: "left" }}>Edit Proposals</span>
              <span>{semesterStats?.editProposals}</span>
              <span style={{ textAlign: "left" }}>Links</span>
              <span>{semesterStats?.links}</span>
              <span style={{ textAlign: "left" }}>Nodes</span>
              <span>{semesterStats?.nodes}</span>
              <span style={{ textAlign: "left" }}>Votes</span>
              <span>{semesterStats?.votes}</span>
              <span style={{ textAlign: "left" }}>Questions</span>
              <span>{semesterStats?.questions}</span>
            </Box>
          </Box>
          <Typography>
            {/* // NewNodeProposal = newNodes
// editProposals = improvements
// links
// nodes
// votes
// question */}
          </Typography>
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
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "4px" }}>
            <Box>
              <Typography sx={{ fontSize: "19px" }}>Points</Typography>
              <Typography># of Students</Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: "12px" }}>Completion rate</Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "15px 1fr 15px 1fr",
                  alignItems: "center",
                  columnGap: "2px",
                  fontSize: "12px",
                }}
              >
                <SquareIcon fontSize="inherit" sx={{ fill: "#388E3C" }} />
                <span>{`>100%`}</span>
                <SquareIcon fontSize="inherit" sx={{ fill: "#F9E2D0" }} />
                <span>{`>10%`}</span>
                <SquareIcon fontSize="inherit" sx={{ fill: "#A7D841" }} />
                <span>{`>50%`}</span>
                <SquareIcon fontSize="inherit" sx={{ fill: "#FF8A33" }} />
                <span>{`<=10%`}</span>
              </Box>
            </Box>
          </Box>
          <Box sx={{ alignSelf: "center" }}>
            <PointsBarChart data={stackedBar} maxAxisY={maxStackedBarAxisY} />
          </Box>
        </Paper>
        <Paper sx={{ px: "32px", py: "40px" }}>
          <Typography sx={{ fontSize: "16px", mb: "40px" }}>Vote Points</Typography>
          <BubbleChart
            data={bubble}
            width={isMovil ? 220 : 500}
            margin={{ top: 10, right: 0, bottom: 35, left: 50 }}
            theme={"Dark"}
            maxAxisX={maxBubbleAxisX}
            maxAxisY={maxBubbleAxisY}
            minAxisX={minBubbleAxisX}
            minAxisY={minBubbleAxisY}
          />
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
            // heightTop={(354 * width) / 1045}
            // heightBottom={(160 * width) / 1045}
            heightTop={isMovil ? 150 : isTablet ? 250 : 354}
            heightBottom={isMovil ? 80 : isTablet ? 120 : 160}
            // width={WIDTH}
            width={isMovil ? 300 : isTablet ? 600 : 1045}
            scaleX={"time"}
            labelX={"Day"}
            scaleY={"linear"}
            labelY={"# of edit Proposals"}
            theme={"Dark"}
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
            // heightTop={(354 * width) / 1045}
            // heightBottom={(160 * width) / 1045}
            heightTop={isMovil ? 150 : isTablet ? 250 : 354}
            heightBottom={isMovil ? 80 : isTablet ? 120 : 160}
            // width={WIDTH}
            width={isMovil ? 300 : isTablet ? 600 : 1045}
            scaleX={"time"}
            labelX={"Day"}
            scaleY={"linear"}
            labelY={"# of Links"}
            theme={"Dark"}
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
            // heightTop={(354 * width) / 1045}
            // heightBottom={(160 * width) / 1045}
            heightTop={isMovil ? 150 : isTablet ? 250 : 354}
            heightBottom={isMovil ? 80 : isTablet ? 120 : 160}
            // width={WIDTH}
            width={isMovil ? 300 : isTablet ? 600 : 1045}
            scaleX={"time"}
            labelX={"Day"}
            scaleY={"linear"}
            labelY={"# of Nodes"}
            theme={"Dark"}
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
            // heightTop={(354 * width) / 1045}
            // heightBottom={(160 * width) / 1045}
            heightTop={isMovil ? 150 : isTablet ? 250 : 354}
            heightBottom={isMovil ? 80 : isTablet ? 120 : 160}
            // width={WIDTH}
            width={isMovil ? 300 : isTablet ? 600 : 1045}
            scaleX={"time"}
            labelX={"Day"}
            scaleY={"linear"}
            labelY={"# of Votes"}
            theme={"Dark"}
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
            // heightTop={(354 * width) / 1045}
            // heightBottom={(160 * width) / 1045}
            heightTop={isMovil ? 150 : isTablet ? 250 : 354}
            heightBottom={isMovil ? 80 : isTablet ? 120 : 160}
            // width={WIDTH}
            width={isMovil ? 300 : isTablet ? 600 : 1045}
            scaleX={"time"}
            labelX={"Day"}
            scaleY={"linear"}
            labelY={"# of Questions"}
            theme={"Dark"}
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
  return <InstructorsLayout>{props => <Instructors {...props} />}</InstructorsLayout>;
};
export default PageWrapper;
