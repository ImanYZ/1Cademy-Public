import { Paper, Typography, useMediaQuery /* useTheme */, useTheme } from "@mui/material";
// import { useTheme } from "@mui/material/styles";
// import useMediaQuery from "@mui/material/useMediaQuery";
import { Box } from "@mui/system";

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

const data: BoxData = {
  "Proposal Points": {
    "The way of the program": [20, 23, 24, 24, 24, 25, 30],
    "Variables, expressions and ...": [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
    Functions: [20, 23, 24, 24, 24, 25, 29, 31, 31, 33, 34, 36, 36, 37, 39, 39, 40, 40, 41, 45],
    "Case study: interface design": [20, 23, 24, 24, 24, 25, 29, 31, 31, 33, 34, 36, 36, 37, 39, 39, 40, 40, 41, 45],
    "Conditionals and recursion": [20, 23, 24, 24, 24, 25, 29, 31, 31, 33, 34, 36, 36, 37, 39, 39, 40, 40, 41, 45],
    "Fruitful functions": [20, 23, 24, 24, 24, 25, 29, 31, 31, 33, 34, 36, 36, 37, 39, 39, 40, 40, 41, 45],
    // "Fruitfuwwel functions": [20, 23, 24, 24, 24, 25, 29, 31, 31, 33, 34, 36, 36, 37, 39, 39, 40, 40, 41, 45],
    // "1Fruiwwtful functions": [20, 23, 24, 24, 24, 25, 29, 31, 31, 33, 34, 36, 36, 37, 39, 39, 40, 40, 41, 45],
    // "1Fruwitful functions": [20, 23, 24, 24, 24, 25, 29, 31, 31, 33, 34, 36, 36, 37, 39, 39, 40, 40, 41, 45],
    // "1Frwuitful functions": [20, 23, 24, 24, 24, 25, 29, 31, 31, 33, 34, 36, 36, 37, 39, 39, 40, 40, 41, 45],
    // "1wFruitful functions": [20, 23, 24, 24, 24, 25, 29, 31, 31, 33, 34, 36, 36, 37, 39, 39, 40, 40, 41, 45],
    // "1Fwruitful functions": [20, 23, 24, 24, 24, 25, 29, 31, 31, 33, 34, 36, 36, 37, 39, 39, 40, 40, 41, 45],
  },
  "Question Points": {
    // "The way of the program": [12, 19, 11, 13, 12, 22, 13, 4, 15, 16, 18, 19, 0, 12, 11, 19],
    // "Variables, expressions and ...": [12, 19, 11, 13, 12, 22, 13, 4, 15, 16, 18, 19, 0, 12, 11, 19],
    // Functions: [12, 19, 11, 13, 12, 22, 13, 4, 15, 16, 18, 19, 0, 12, 11, 19],
    "The way of the program": [20, 23, 24, 24, 24, 25, 30],
    "Variables, expressions and ...": [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
    Functions: [20, 23, 24, 24, 24, 25, 29, 31, 31, 33, 34, 36, 36, 37, 39, 39, 40, 40, 41, 45],
    "Case study: interface design": [20, 23, 24, 24, 24, 25, 29, 31, 31, 33, 34, 36, 36, 37, 39, 39, 40, 40, 41, 45],
    "Conditionals and recursion": [20, 23, 24, 24, 24, 25, 29, 31, 31, 33, 34, 36, 36, 37, 39, 39, 40, 40, 41, 45],
    "Fruitful functions": [20, 23, 24, 24, 24, 25, 29, 31, 31, 33, 34, 36, 36, 37, 39, 39, 40, 40, 41, 45],
  },
  "Vote Points": {
    // "The way of the program": [12, 19, 11, 13, 12, 22, 13, 4, 15, 16, 18, 19, 0, 12, 11, 19],
    // "Variables, expressions and ...": [12, 19, 11, 13, 12, 22, 13, 4, 15, 16, 18, 19, 0, 12, 11, 19],
    // Functions: [12, 19, 11, 13, 12, 22, 13, 4, 15, 16, 18, 19, 0, 12, 11, 19],
    "The way of the program": [20, 23, 24, 24, 24, 25, 30],
    "Variables, expressions and ...": [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
    Functions: [20, 23, 24, 24, 24, 25, 29, 31, 31, 33, 34, 36, 36, 37, 39, 39, 40, 40, 41, 45],
    "Case study: interface design": [20, 23, 24, 24, 24, 25, 29, 31, 31, 33, 34, 36, 36, 37, 39, 39, 40, 40, 41, 45],
    "Conditionals and recursion": [20, 23, 24, 24, 24, 25, 29, 31, 31, 33, 34, 36, 36, 37, 39, 39, 40, 40, 41, 45],
    "Fruitful functions": [20, 23, 24, 24, 24, 25, 29, 31, 31, 33, 34, 36, 36, 37, 39, 39, 40, 40, 41, 45],
  },
};

const Instructors: InstructorLayoutPage = ({ selectedSemester, selectedCourse }) => {
  // const pointsChartRef = useRef<(HTMLElement & SVGElement) | null>(null);

  const theme = useTheme();
  // const [screenSize, setScreenSize] = useState(null);

  const isMovil = useMediaQuery(theme.breakpoints.down("md"));
  const isTablet = useMediaQuery(theme.breakpoints.only("md"));

  // useEffect(()=>{

  // })
  console.log("first", theme.breakpoints);
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
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "minmax(auto, 421px) auto minmax(auto, 629px)" },
          gap: "16px",
        }}
      >
        <Paper sx={{ p: "16px" }}>
          <Typography>
            hello world {selectedSemester} + {selectedCourse}
          </Typography>
        </Paper>
        <Paper
          sx={{
            px: "32px",
            py: "40px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "flex-start", gap: "4px" }}>
            <Box>
              <Typography sx={{ fontSize: "19px" }}>Points</Typography>
              <Typography># of Students</Typography>
            </Box>
            <Box>
              <Typography>Points</Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                <span>{`>100%`}</span>
                <span>{`>10%`}</span>
                <span>{`>50%`}</span>
                <span>{`<=100%`}</span>
              </Box>
            </Box>
          </Box>
          <PointsBarChart />
        </Paper>
        <Paper sx={{ px: "32px", py: "40px" }}>
          <Typography sx={{ fontSize: "19px", mb: "40px" }}>Vote Points</Typography>
          <BubbleChart />
        </Paper>
      </Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "16px",
        }}
      >
        <Paper sx={{ p: "40px" }}>
          <BoxChart theme={"Dark"} data={data["Proposal Points"]} />
          <BoxChart theme={"Dark"} data={data["Question Points"]} drawYAxis={false} />
          <BoxChart theme={"Dark"} data={data["Vote Points"]} drawYAxis={false} />
        </Paper>
        <Paper
          /* ref={getWith} */ sx={{
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
            trendData={[]}
          />
        </Paper>
        {/* <Paper sx={{ p: "40px" }}>
          <TrendPlot
            title={"Edit Proposals"}
            heightTop={354}
            heightBottom={160}
            width={1045}
            scaleX={"time"}
            labelX={"Day"}
            scaleY={"linear"}
            labelY={"# of Proposals"}
            theme={"Dark"}
            x="date"
            y="num"
            trendData={[]}
          />
        </Paper>

        <Paper sx={{ p: "40px" }}>
          <TrendPlot
            title={"Links"}
            heightTop={354}
            heightBottom={160}
            width={1045}
            scaleX={"time"}
            labelX={"Day"}
            scaleY={"linear"}
            labelY={"# of Proposals"}
            theme={"Dark"}
            x="date"
            y="num"
            trendData={[]}
          />
        </Paper>

        <Paper sx={{ p: "40px" }}>
          <TrendPlot
            title={"Nodes"}
            heightTop={354}
            heightBottom={160}
            width={1045}
            scaleX={"time"}
            labelX={"Day"}
            scaleY={"linear"}
            labelY={"# of Proposals"}
            theme={"Dark"}
            x="date"
            y="num"
            trendData={[]}
          />
        </Paper>

        <Paper sx={{ p: "40px" }}>
          <TrendPlot
            title={"Votes"}
            heightTop={354}
            heightBottom={160}
            width={1045}
            scaleX={"time"}
            labelX={"Day"}
            scaleY={"linear"}
            labelY={"# of Proposals"}
            theme={"Dark"}
            x="date"
            y="num"
            trendData={[]}
          />
        </Paper>

        <Paper sx={{ p: "40px" }}>
          <TrendPlot
            title={"Questions"}
            heightTop={354}
            heightBottom={160}
            width={1045}
            scaleX={"time"}
            labelX={"Day"}
            scaleY={"linear"}
            labelY={"# of Proposals"}
            theme={"Dark"}
            x="date"
            y="num"
            trendData={[]}
          />
        </Paper> */}
      </Box>
    </Box>
  );
};

// This wrapper expose the shared variables from filters
const PageWrapper = () => {
  return <InstructorsLayout>{props => <Instructors {...props} />}</InstructorsLayout>;
};
export default PageWrapper;

// const NodeBook = () => (
//   <NodeBookProvider>
//     <Dashboard />
//   </NodeBookProvider>
// );
// export default withAuthUser({
//   shouldRedirectToLogin: true,
//   shouldRedirectToHomeIfAuthenticated: false,
// })(NodeBook);
