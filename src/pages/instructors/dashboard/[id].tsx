import { Box } from "@mui/material";

import { InstructorLayoutPage, InstructorsLayout } from "../../../components/layouts/InstructorsLayout";

const StudentDashboard: InstructorLayoutPage = ({ user, currentSemester }) => {
  console.log({ user, currentSemester });
  return <Box>Student dashboard</Box>;
};

// This wrapper expose the shared variables from filters
const PageWrapper = () => {
  return <InstructorsLayout>{props => <StudentDashboard {...props} />}</InstructorsLayout>;
};
export default PageWrapper;
