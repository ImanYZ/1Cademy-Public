import { Accordion, AccordionDetails, AccordionSummary, Box, Typography } from "@mui/material";
import React, { useState } from "react";
// type TutorialStage = {
//   tittle: string;
// };
// type TutorialProgess = {
//   [key: string]: TutorialStage[];
// };

const stages = {
  "node tutorial": [
    {
      title: "step 1",
    },
    {
      title: "step 2",
    },
    {
      title: "step 3",
    },
  ],
  "sidebar tutorial": [
    {
      title: "step 1",
    },
    {
      title: "step 2",
    },
    {
      title: "step 3",
    },
  ],
};

const ProgressBar = () => {
  const [expanded, setExpanded] = useState<string | false>("Option1");

  const handleChange = (option: string) => (event: React.SyntheticEvent, newExpanded: boolean) => {
    setExpanded(newExpanded ? option : false);
  };
  return (
    <Box>
      <Box></Box>
      <Box>
        {Object.keys(stages).map((stage, idx) => (
          <Accordion
            key={stage}
            disableGutters
            elevation={0}
            square
            sx={{
              background: "transparent",
              border: "none",

              // "&:before": {
              //   display: "none",
              // },
            }}
            expanded={expanded === `Option${idx + 1}`}
            onChange={handleChange(`Option${idx + 1}`)}
          >
            <AccordionSummary>
              <Typography
                component={"h4"}
                variant={"h4"}
                sx={{
                  fontSize: "20px",
                  fontWeight: 400,
                  p: "8px",
                  cursor: "pointer",
                }}
              >
                {stage}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box component={"ul"}>
                {stages["node tutorial"].map(cur => (
                  <Box key={cur.title} component={"li"}>
                    <Typography
                      sx={{
                        p: "8px",
                        pt: "0",
                        color: theme => (theme.palette.mode === "light" ? "#475467" : "#EAECF0"),
                      }}
                      fontSize={"16px"}
                    >
                      {cur.title}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Box>
  );
};

export default ProgressBar;
