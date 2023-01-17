import { CardActionArea, Typography, useTheme } from "@mui/material";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Collapse from "@mui/material/Collapse";
import Grid from "@mui/material/Grid";
import React, { useEffect, useState } from "react";
import { useRive } from "rive-react";

import { gray03 } from "../../pages/assistant";
import valuesItems from "./whyItems";

const iniStepChecked: any[] = [];

const Values = () => {
  const theme = useTheme();
  const [stepChecked, setStepChecked] = useState(iniStepChecked);

  const { rive, RiveComponent: RiveComponentMeettings } = useRive({
    src: "rive-assistant/meetings.riv",
    artboard: "meetings",
    animations: ["Timeline 1", theme.palette.mode === "dark" ? "dark" : "light"],
    autoplay: true,
  });

  useEffect(() => {
    if (!rive) return;

    rive.play(["Timeline 1", theme.palette.mode === "dark" ? "dark" : "light"]);
  }, [rive, theme.palette.mode]);

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
            <Grid key={value.name} item xs={12} sm={6} md={4}>
              <Card>
                <CardActionArea onClick={() => flipCard(idx)}>
                  <Box
                    sx={{
                      display: "flex",
                      justify: "center",
                      alignItems: "center",
                      height: "250px",
                      p: "16px",
                    }}
                  >
                    {idx === 2 ? (
                      <RiveComponentMeettings />
                    ) : (
                      <CardMedia
                        component="img"
                        width="100%"
                        image={theme.palette.mode === "light" ? value.image : value.imageDark}
                        alt={value.name}
                      />
                    )}
                  </Box>
                  <CardContent
                    sx={{
                      "&": {
                        padding: "16px",
                      },
                    }}
                  >
                    <Typography
                      gutterBottom
                      variant="h5"
                      component="div"
                      sx={{ fontSize: "20px", textAlign: "center" }}
                    >
                      {value.name}
                    </Typography>
                    <Collapse in={stepChecked[idx]} timeout={1000} sx={{ textAlign: "center" }}>
                      Learn more ...
                    </Collapse>
                    <Collapse in={!stepChecked[idx]} timeout={1000}>
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
