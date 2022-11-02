import { Paper } from "@mui/material";
import { Box } from "@mui/system";

import HeaderNavbar from "../../components/instructors/HeaderNavbar";
import { SemesterFilter } from "../../components/instructors/SemesterFilter";
import { useSemesterFilter } from "../../components/instructors/useSemesterFilter";

type InstructorsProps = {};

const Instructors = ({}: InstructorsProps) => {
  const { semesters, selectedSemester, setSelectedSemester, courses, selectedCourse, setSelectedCourse } =
    useSemesterFilter();

  return (
    <Box>
      <HeaderNavbar />
      <Paper sx={{ p: "10px" }}>
        {/* <Box sx={{ pt: "75px" }}> */}
        <SemesterFilter
          semesters={semesters}
          selectedSemester={selectedSemester}
          setSelectedSemester={setSelectedSemester}
          courses={courses}
          selectedCourse={selectedCourse}
          setSelectedCourse={setSelectedCourse}
        />
        <h1>instructor page</h1>
        <p>
          semester {selectedCourse} selected has {courses.length} and course {selectedCourse} is selected
        </p>
      </Paper>
    </Box>
  );
};

export default Instructors;

// const NodeBook = () => (
//   <NodeBookProvider>
//     <Dashboard />
//   </NodeBookProvider>
// );
// export default withAuthUser({
//   shouldRedirectToLogin: true,
//   shouldRedirectToHomeIfAuthenticated: false,
// })(NodeBook);
