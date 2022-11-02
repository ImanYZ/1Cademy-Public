import { Box } from "@mui/system";

import AppAppBar from "../../components/AppHeaderNavbar";

type InstructorsProps = {};

const Instructors = ({}: InstructorsProps) => {
  return (
    <Box>
      <AppAppBar></AppAppBar>
      <h1>instructor</h1>;
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
