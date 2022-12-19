import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Step from "@mui/material/Step";
import StepContent from "@mui/material/StepContent";
import Stepper from "@mui/material/Stepper";
import React from "react";

import Button from "./Button";
import sectionsOrder from "./sectionsOrder";
import Typography from "./Typography";
const sectionIdx = sectionsOrder.findIndex(sect => sect.id === "JoinUsSection");

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const JoinUs = (props: any) => {
  return (
    <Container
      id="JoinUsSection"
      component="section"
      sx={{
        pt: 7,
        pb: 10,
      }}
    >
      <Typography variant="h4" marked="center" align="center" sx={{ mb: 7 }}>
        {sectionsOrder[sectionIdx].title}
      </Typography>
      <Alert severity="success">
        <strong>Note:</strong> Our application process is sequential; i.e., you need to complete each step to unlock the
        following steps.
      </Alert>
      <Stepper
        activeStep={0}
        orientation="vertical"
        sx={{
          mt: "19px",
          "& .MuiStepIcon-root": {
            color: "warning.dark",
          },
          "& .MuiStepIcon-root.Mui-active": {
            color: "secondary.main",
          },
          "& .MuiStepIcon-root.Mui-completed": {
            color: "success.main",
          },
          "& .MuiButton-root": {
            backgroundColor: "secondary.main",
          },
          "& .MuiButton-root:hover": {
            backgroundColor: "secondary.dark",
          },
          "& .MuiButton-root.Mui-disabled": {
            backgroundColor: "secondary.light",
          },
        }}
      >
        <Step>
          <StepContent>
            <>
              <Typography>
                Choose one of our communities and complete its application requirements. These requirements may differ
                from community to community. Click the following button to jump to our list of communities. Then, you
                can find more information about each community and their requirements by clicking the corresponding
                community section.
              </Typography>
              <Box sx={{ mb: 2 }}>
                <div>
                  <Button
                    variant="contained"
                    component="a"
                    href="https://1cademy.us/communities"
                    target="_blank"
                    sx={{ mt: 1, mr: 1, color: "common.white" }}
                  >
                    Explore our communities &amp; their requirements
                  </Button>
                </div>
              </Box>
              <Typography>
                Meanwhile, you can go through the 1Cademy tutorial by clicking the following button:
              </Typography>
              <Box sx={{ mb: 2 }}>
                <div>
                  <Button
                    variant="contained"
                    component="a"
                    href={"https://1cademy.us/tutorial"}
                    target="_blank"
                    sx={{ mt: 1, mr: 1, color: "common.white" }}
                  >
                    1Cademy Tutorial
                  </Button>
                </div>
              </Box>
            </>
          </StepContent>
        </Step>
      </Stepper>
    </Container>
  );
};

export default JoinUs;
