import { Box } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import Image from "next/image";

import LogoDarkMode from "../../public/DarkModeLogo.svg";

const FullPageLogoLoading = () => {
  return (
    <Box sx={{ width: "100vw", height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          textAlign: "center",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <Image src={LogoDarkMode.src} alt="logo" width="200px" height="200px" />
        <CircularProgress sx={{ mt: 5 }} />
      </Box>
    </Box>
  );
};

export default FullPageLogoLoading;
