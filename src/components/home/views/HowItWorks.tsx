import Box from "@mui/material/Box";
// import Collapse from "@mui/material/Collapse";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import MUITypography from "@mui/material/Typography";
import { useRive, useStateMachineInput } from "@rive-app/react-canvas";
import React, { useCallback, useEffect, useRef } from "react";

import { useWindowSize } from "../../../hooks/useWindowSize";
// import { CardActionArea } from "@mui/material";
// import Button from "../components/Button";
import YoutubeEmbed from "../components/YoutubeEmbed";
import { sectionsOrder } from "../sectionsOrder";
// import YoutubeEmbed from "../components/YoutubeEmbed/YoutubeEmbed";
// import sectionsOrder from "./sectionsOrder";
const sectionIdx = sectionsOrder.findIndex(sect => sect.id === "HowItWorksSection");

const item = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  backgroundColor: "white",
};

const number = {
  fontSize: 24,
  fontFamily: "default",
  color: "secondary.main",
  fontWeight: "medium",
  margin: "10px 0px 10px 0px",
};

// const image = {
//   height: 130,
//   my: 4,
// };

const howElements = [
  {
    id: "Summarizing",
    title: "Summarize",
    content: `We summarize the gist of every valuable piece of knowledge
    on the Web into small chunks of knowledge that we call
    "nodes."`,
  },
  {
    id: "Linking",
    title: "Link",
    content: `We identify and visualize the prerequisite knowledge "links"
    between nodes.`,
  },
  {
    id: "Evaluating",
    title: "Evaluate",
    content: `We group-evaluate the nodes and links, through up/down-votes
    and comments.`,
  },
  {
    id: "Improving",
    title: "Improve",
    content: `We collaboratively improve and up-date nodes and links
    through proposals and community approvals.`,
  },
];

const HowItWorks = () => {
  const step1Ref = useRef(null);
  const step2Ref = useRef(null);
  const step3Ref = useRef(null);
  const step4Ref = useRef(null);
  const step5Ref = useRef(null);

  const { rive, RiveComponent } = useRive({
    src: "rive/gg.riv",
    stateMachines: "State Machine 1",
    autoplay: true,
  });

  const { height, width } = useWindowSize();

  const scrollInput = useStateMachineInput(rive, "State Machine 1", "scroll");

  const onChangeObserver = useCallback(
    (e: IntersectionObserverEntry[]) => {
      if (!scrollInput) return;

      e.forEach(({ isIntersecting, target }) => {
        let idx = null;
        if (target.id === "step-1") idx = 0;
        if (target.id === "step-2") idx = 1;
        if (target.id === "step-3") idx = 2;
        if (target.id === "step-4") idx = 3;

        if (isIntersecting && idx !== null) {
          scrollInput.value = 5 + idx * 10;
          console.log("onChangeObserver:scrollInput.value", target.id, scrollInput.value);
        }
      });
    },
    [scrollInput]
  );

  useEffect(() => {
    if (!step1Ref.current || !step2Ref.current || !step3Ref.current || !step4Ref.current) return;

    let options = {
      root: null,
      rootMargin: "0px",
      threshold: 0.51,
    };
    const ob = new IntersectionObserver(onChangeObserver, options);
    ob.observe(step1Ref.current);
    ob.observe(step2Ref.current);
    ob.observe(step3Ref.current);
    ob.observe(step4Ref.current);

    return () => {
      ob.disconnect();
    };
  }, [onChangeObserver]);

  return (
    <Container
      id="HowItWorksSection"
      component="section"
      sx={{
        pt: 7,
        pb: 10,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        // bgcolor: "secondary.light",
      }}
    >
      {/* animation start */}
      <div style={{ position: "relative", border: "dashed 2px royalBlue" }}>
        <div id="step-1" ref={step1Ref} style={{ height, background: "#0f375f79" }}></div>
        <div id="step-2" ref={step2Ref} style={{ height, background: "#218f7d79" }}></div>
        <div id="step-3" ref={step3Ref} style={{ height, background: "#4bb48079" }}></div>
        {/* step-4 is an empty reference to know show last animation */}
        <div
          id="step-4"
          ref={step4Ref}
          style={{ height, background: "#c5f35b79", position: "absolute", bottom: "0px", left: "0px" }}
        ></div>
        <Box
          sx={{
            height,
            borderRight: "solid 6px pink",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "sticky",
            bottom: "0px",
          }}
        >
          <Box sx={{ height: width, width }}>
            <RiveComponent className="rive-canvas" />
          </Box>
        </Box>
      </div>
      {/* animation end */}

      <div id="step-5" ref={step5Ref} style={{ height, background: "#f3b65b79" }}>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Amet voluptates quibusdam earum. Harum blanditiis
        veniam quidem? Aliquid, aliquam in maxime numquam repudiandae doloribus voluptatum doloremque. Ea reiciendis
        atque doloribus maxime!
      </div>
      {/* <Typography variant="h4" marked="center" sx={{ mb: 7 }}>
        {sectionsOrder[sectionIdx].title}
      </Typography> */}
      <MUITypography variant="h4" /* marked="center" */ sx={{ mb: 7, fontSize: "34px" }}>
        {sectionsOrder[sectionIdx].title}
      </MUITypography>
      <Box sx={{ zIndex: 1, mx: "auto" }}>
        <Grid container spacing={2.5} /* align="center" */>
          {howElements.map((elem, idx) => {
            return (
              <Grid key={elem.id + idx} item xs={12} sm={6} md={4} lg={3}>
                <Card sx={{ ...item, maxWidth: 355 }}>
                  {/* <CardActionArea onClick={flipCard(idx)}> */}
                  <Box sx={number}>{idx + 1}.</Box>
                  <Box
                    alignItems="center"
                    sx={{
                      display: "flex",
                      justify: "center",
                      alignItems: "center",
                      height: "190px",
                      mb: "10px",
                    }}
                  >
                    <CardMedia
                      component="img"
                      src={"/static/" + elem.id + ".svg"}
                      alt={elem.id}
                      height="100%"
                      width="100%"
                      sx={{ px: "10px" }}
                    />
                  </Box>
                  <CardContent>
                    <MUITypography
                      gutterBottom
                      variant="h5"
                      component="div"
                      sx={{ fontSize: "20px", textAlign: "center", mb: "10px" }}
                    >
                      {elem.title}
                    </MUITypography>
                    {/* <Collapse in={!stepChecked[idx]} timeout={1000}>
                        Learn more ...
                      </Collapse>
                      <Collapse in={stepChecked[idx]} timeout={1000}> */}
                    <MUITypography variant="body2" color="text.secondary" sx={{ textAlign: "left", fontSize: "14px" }}>
                      {elem.content}
                    </MUITypography>
                    {/* <Typography variant="body2" color="text.secondary" sx={{ textAlign: "left" }}>
                      {elem.content}
                    </Typography> */}
                    {/* </Collapse> */}
                  </CardContent>
                  {/* </CardActionArea> */}
                </Card>
              </Grid>
            );
          })}
        </Grid>
        <Box sx={{ mt: "19px" }}>
          <YoutubeEmbed embedId="vkNx-QUmbNI" />
        </Box>
      </Box>
    </Container>
  );
};

export default HowItWorks;
