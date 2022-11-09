import { Box, Paper, useMediaQuery, useTheme } from "@mui/material";

import { InstructorLayoutPage } from "../../../components/layouts/InstructorsLayout";
import { StudentsLayout } from "../../../components/layouts/StudentsLayout";

const StudentDashboard: InstructorLayoutPage = ({ user, currentSemester }) => {
  const theme = useTheme();
  const isMovil = useMediaQuery(theme.breakpoints.down("md"));

  console.log({ user, currentSemester, isMovil });
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
    </Box>
  );
};

// This wrapper expose the shared variables from filters
const PageWrapper = () => {
  return <StudentsLayout>{props => <StudentDashboard {...props} />}</StudentsLayout>;
};
export default PageWrapper;
