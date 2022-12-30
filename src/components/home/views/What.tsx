import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
// import Container from "@mui/material/Container";
import { styled } from "@mui/material/styles";
import React from "react";

import Typography from "../components/Typography";
// import { sectionsOrder } from "../sectionsOrder";
import communities from "./communitiesOrder";

// import sectionsOrder from "./sectionsOrder";
// const sectionIdx = sectionsOrder.findIndex(sect => sect.id === "CommunitiesSection");

const ImageBackdrop = styled("div")(({ theme }) => ({
  position: "absolute",
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  background: "#000",
  opacity: 0.5,
  transition: theme.transitions.create("opacity"),
}));

const ImageIconButton = styled(ButtonBase)(({ theme }) => ({
  position: "relative",
  display: "block",
  padding: 0,
  borderRadius: 0,
  height: "40vh",
  [theme.breakpoints.down("md")]: {
    width: "100% !important",
    height: 100,
  },
  "&:hover": {
    zIndex: 1,
  },
  "&:hover .imageBackdrop": {
    opacity: 0.15,
  },
  "&:hover .imageMarked": {
    opacity: 0,
  },
  "&:hover .imagepTitle": {
    border: "4px solid currentColor",
    maxWidth: "100%",
    padding: "10px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  "& .imageTitle": {
    position: "relative",
    padding: `10px 20px`,
  },
  "& .imageMarked": {
    height: 3,
    width: 18,
    background: theme.palette.common.white,
    // position: "absolute",
    // bottom: -2,
    // left: "calc(50% - 9px)",

    transition: theme.transitions.create("opacity"),
  },
}));

const goToCommPage = (commId: string) => {
  window.open("/community/" + commId, "_blank");
};

const What = () => {
  return (
    <Box id="CommunitiesSection" component="section" sx={{ pt: 10, pb: 4 }}>
      {/* <Typography variant="h4" marked="center" align="center" sx={{ mb: 7 }}>
        {sectionsOrder[sectionIdx].title}
      </Typography> */}
      <Box sx={{ mt: 7, display: "flex", flexWrap: "wrap" }}>
        {communities.map(communi => (
          <ImageIconButton
            key={communi.id}
            onClick={() => goToCommPage(communi.id)}
            style={{
              width: communi.width,
            }}
          >
            <Box
              sx={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                backgroundSize: "cover",
                backgroundPosition: "center 40%",
                backgroundImage: `url(${communi.url})`,
              }}
            />
            <ImageBackdrop className="imageBackdrop" />
            <Box
              sx={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "common.white",
              }}
            >
              <Box className="imagepTitle">
                <Typography component="h3" variant="h6" sx={{ color: "inherit" }}>
                  {communi.title}
                </Typography>
              </Box>
              <div className="imageMarked"></div>
            </Box>
          </ImageIconButton>
        ))}
      </Box>
    </Box>
  );
};

export default What;
