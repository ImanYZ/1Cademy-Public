import { Box } from "@mui/material";

import withAuthUser from "@/components/hoc/withAuthUser";
import TrackingHours from "@/components/instructors/TrackingHours";
import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";

const Tracking = () => {
  return (
    <Box
      sx={{
        background: theme =>
          theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG900 : DESIGN_SYSTEM_COLORS.gray100,
        px: "55px",
      }}
    >
      <TrackingHours />;
    </Box>
  );
};

export default withAuthUser({
  shouldRedirectToLogin: true,
  shouldRedirectToHomeIfAuthenticated: false,
})(Tracking);
