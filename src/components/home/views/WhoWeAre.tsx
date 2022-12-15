// import Avatar from "@mui/material/Avatar";
// import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
// import Divider from "@mui/material/Divider";
// import Grid from "@mui/material/Grid";
// import List from "@mui/material/List";
// import ListItemAvatar from "@mui/material/ListItemAvatar";
// import ListItemButton from "@mui/material/ListItemButton";
// import ListItemText from "@mui/material/ListItemText";
// import Paper from "@mui/material/Paper";
import React from "react";

// import HonorEducation from "../../../../public//logo-honor.svg";
// import GoogleCloud from "../../../../public/logo-google-cloud.svg";
// import UMLogo from "../../../../public/logo-school-of-information.svg";
import Typography from "../components/Typography";

const WhoWeAre = () => {
  return (
    <Container
      id="WhoWeAreSection"
      component="section"
      sx={{
        pt: 7,
        pb: 10,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        bgcolor: "secondary.light",
      }}
    >
      <Typography variant="h4" marked="center" sx={{ mb: 7 }}>
        Who Is Behind 1Cademy?
      </Typography>
    </Container>
  );
};

export default WhoWeAre;
