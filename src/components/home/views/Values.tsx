import { CardActionArea } from "@mui/material";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Collapse from "@mui/material/Collapse";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import React, { useState } from "react";

import Typography from "../components/Typography";
import { sectionsOrder } from "../sectionsOrder";
import valuesItems from "./valuesItems";
// import sectionsOrder from "./sectionsOrder";
// import valuesItems from "./valuesItems";

const iniStepChecked: any[] = [];
// for (let value of valuesItems) {
//   iniStepChecked.push(false);
// }

const sectionIdx = sectionsOrder.findIndex(sect => sect.id === "ValuesSection");

const Values = () => {
  const [stepChecked, setStepChecked] = useState(iniStepChecked);

  const flipCard = (idx: number) => {
    const sChecked = [...stepChecked];
    sChecked[idx] = !sChecked[idx];
    setStepChecked(sChecked);
  };

  return (
    <Container
      id="ValuesSection"
      component="section"
      sx={{
        pt: 7,
        pb: 10,
        // bgcolor: "secondary.light",
        backgroundColor: "rgb(255, 245, 248)",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* <Box
          component="img"
          src="/static/CurvyLines.png"
          alt="curvy lines"
          sx={{
            pointerEvents: "none",
            position: "absolute",
            top: -180,
            opacity: 0.7,
          }}
        /> */}
      <Typography variant="h4" marked="center" align="center" sx={{ mb: 7 }}>
        {sectionsOrder[sectionIdx].title}
      </Typography>
      <Grid container spacing={2.5} /* align="center" */>
        {valuesItems.map((value, idx) => {
          return (
            <Grid key={value.name} item xs={12} sm={6} md={4} lg={3}>
              <Card sx={{ maxWidth: 340 }}>
                <CardActionArea onClick={() => flipCard(idx)}>
                  <Box
                    sx={{
                      display: "flex",
                      justify: "center",
                      alignItems: "center",
                      height: "250px",
                    }}
                  >
                    <CardMedia
                      component="img"
                      width="100%"
                      image={"/static/" + value.image}
                      alt={value.name}
                      sx={{ padding: "10px 37px 0px 37px" }}
                    />
                  </Box>
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                      {value.name}
                    </Typography>
                    <Collapse in={!stepChecked[idx]} timeout={1000}>
                      Learn more ...
                    </Collapse>
                    <Collapse in={stepChecked[idx]} timeout={1000}>
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: "left" }}>
                        {value.body}
                      </Typography>
                    </Collapse>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Container>
  );
};

export default Values;
