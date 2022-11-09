import { Box, Paper, useMediaQuery, useTheme } from "@mui/material";
import { collection, getDocs, getFirestore, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";

import { TrendPlot } from "../../../components/chats/TrendPlot";
import { InstructorLayoutPage } from "../../../components/layouts/InstructorsLayout";
import { StudentsLayout } from "../../../components/layouts/StudentsLayout";
import { SemesterStudentStat, Trends } from "../../../instructorsTypes";
import { ISemesterStudentStatDay } from "../../../types/ICourse";

const StudentDashboard: InstructorLayoutPage = ({ user, currentSemester }) => {
  const db = getFirestore();

  const [nodesTrends, setNodesTrends] = useState<Trends[]>([]);
  const [votesTrends, setVotesTrends] = useState<Trends[]>([]);
  const [questionsTrend, setQuestionsTrend] = useState<Trends[]>([]);
  const [linksTrend, setLinksTrend] = useState<Trends[]>([]);
  const [editProposalsTrend, setEditProposalsTrend] = useState<Trends[]>([]);
  const theme = useTheme();
  const isMovil = useMediaQuery(theme.breakpoints.down("md"));
  const isTablet = useMediaQuery(theme.breakpoints.only("md"));

  const [, /* isLoading */ setIsLoading] = useState<boolean>(true);

  console.log({ user, currentSemester, isMovil });

  const trendPlotHeightTop = isMovil ? 150 : isTablet ? 250 : 354;
  const trendPlotHeightBottom = isMovil ? 80 : isTablet ? 120 : 160;
  const trendPlotWith = isMovil ? 300 : isTablet ? 600 : 1045;

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
          {/* // */}
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
          {/* // */}
        </Paper>
        <Paper sx={{ px: "32px", py: "40px" }}>{/* //     */}</Paper>
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
