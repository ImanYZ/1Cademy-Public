import { Paper, Typography } from "@mui/material";
import { Box } from "@mui/system";

import { InstructorLayoutPage, InstructorsLayout } from "../../components/layouts/InstructorsLayout";

const Instructors: InstructorLayoutPage = ({ selectedSemester, selectedCourse }) => {
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
        <Paper sx={{ p: "40px" }}>
          <Typography>
            hello world {selectedSemester} + {selectedCourse}
          </Typography>
        </Paper>
        <Paper sx={{ p: "40px" }}>
          <Typography>
            hello world {selectedSemester} + {selectedCourse}
          </Typography>
        </Paper>
        <Paper sx={{ p: "40px" }}>
          <Typography>
            hello world {selectedSemester} + {selectedCourse}
          </Typography>
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
          <Typography>
            1 hello world {selectedSemester} + {selectedCourse}
          </Typography>
        </Paper>
        <Paper sx={{ p: "40px" }}>
          <Typography>
            2 hello world {selectedSemester} + {selectedCourse}
          </Typography>
        </Paper>
        <Paper sx={{ p: "40px" }}>
          <Typography>
            3 hello world {selectedSemester} + {selectedCourse}
          </Typography>
        </Paper>

        <Paper sx={{ p: "40px" }}>
          <Typography>
            4 hello world {selectedSemester} + {selectedCourse}
          </Typography>
        </Paper>

        <Paper sx={{ p: "40px" }}>
          <Typography>
            5 hello world {selectedSemester} + {selectedCourse}
          </Typography>
        </Paper>

        <Paper sx={{ p: "40px" }}>
          <Typography>
            6 hello world {selectedSemester} + {selectedCourse}
          </Typography>
        </Paper>

        <Paper sx={{ p: "40px" }}>
          <Typography>
            7 hello world {selectedSemester} + {selectedCourse}
          </Typography>
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

// const NodeBook = () => (
//   <NodeBookProvider>
//     <Dashboard />
//   </NodeBookProvider>
// );
// export default withAuthUser({
//   shouldRedirectToLogin: true,
//   shouldRedirectToHomeIfAuthenticated: false,
// })(NodeBook);
