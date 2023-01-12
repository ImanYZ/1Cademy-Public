import { CardActionArea, Typography, useTheme } from "@mui/material";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Collapse from "@mui/material/Collapse";
import Grid from "@mui/material/Grid";
import React, { useState } from "react";

import { gray03 } from "../../../pages";
import valuesItems from "./valuesItems";
const iniStepChecked: any[] = [];
const Values = () => {
  const theme = useTheme();
  const [stepChecked, setStepChecked] = useState(iniStepChecked);

  const getGrayColorText = () => (theme.palette.mode === "dark" ? gray03 : theme.palette.common.darkBackground2);

  const flipCard = (idx: number) => {
    const sChecked = [...stepChecked];
    sChecked[idx] = !sChecked[idx];
    setStepChecked(sChecked);
  };

  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Grid container spacing={2.5}>
        {valuesItems.map((value, idx) => {
          return (
            <Grid key={value.name} item xs={12} sm={6} md={4} lg={4}>
              <Card sx={{ width: "100%" }}>
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
                      sx={{ padding: "30px" }}
                    />
                  </Box>
                  <CardContent
                    sx={{
                      "&": {
                        padding: "16px",
                      },
                    }}
                  >
                    <Typography
                      onClick={() => (stepChecked[idx] = !stepChecked[idx])}
                      gutterBottom
                      variant="h5"
                      component="div"
                      sx={{ fontSize: "20px", textAlign: "center" }}
                    >
                      {value.name}
                    </Typography>

                    <Collapse in={!stepChecked[idx]} timeout={1000} sx={{ textAlign: "center" }}>
                      <Typography
                        variant="body2"
                        sx={{ textAlign: "left", color: getGrayColorText(), fontSize: "14px" }}
                      >
                        {value.body.substring(0, 100)}
                      </Typography>
                      <br />
                      Learn more ...
                    </Collapse>
                    <Collapse in={stepChecked[idx]} timeout={1000}>
                      <Typography
                        variant="body2"
                        sx={{ textAlign: "left", color: getGrayColorText(), fontSize: "14px" }}
                      >
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
    </Box>
  );
};

export default Values;
