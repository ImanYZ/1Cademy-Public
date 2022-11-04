import { Grid } from "@mui/material";
import { Box } from "@mui/system";
import React, { useEffect, useState } from "react";

import Chapter from "../../components/instructors/setting/Chapter";
import Proposal from "../../components/instructors/setting/Proposal";
import Vote from "../../components/instructors/setting/Vote";
import { InstructorLayoutPage, InstructorsLayout } from "../../components/layouts/InstructorsLayout";
import ChaptersData from "./chapters.json";
const CourseSetting: InstructorLayoutPage = () => {
  const [chapters, setChapters] = useState<any>([]);
  // const [inputField, setInputField] = useState<any>({
  //   node_proposal_from: "",
  //   node_proposal_to: "",
  //   node_proposal_points: "",
  //   node_proposal_propose_per_day: "",
  //   node_proposal_days: "",
  //   question_proposal_from: "",
  //   question_proposal_to: "",
  //   question_proposal_points: "",
  //   question_proposal_propose_per_day: "",
  //   question_proposal_days: "",
  // });
  useEffect(() => {
    setChapters(ChaptersData);
  }, []);

  const inputsHandler = (e: any) => {
    console.log(e);
    //setInputField({ [e.target.name]: e.target.value });
  };

  return (
    <Box sx={{ padding: "20px" }}>
      <Grid container spacing={5}>
        <Grid item xs={12} md={6}>
          <Chapter chapters={chapters} setChapters={setChapters} chaptersData={ChaptersData} />
        </Grid>
        <Grid item xs={12} md={6}>
          <Proposal inputsHandler={inputsHandler} />
        </Grid>
      </Grid>
      <Grid sx={{ boxShadow: "rgba(0, 0, 0, 0.1) 0px 4px 12px" }} container spacing={0} mt={5}>
        <Vote inputsHandler={inputsHandler} />
      </Grid>
    </Box>
  );
};

const PageWrapper = () => {
  return <InstructorsLayout>{props => <CourseSetting {...props} />}</InstructorsLayout>;
};
export default PageWrapper;
