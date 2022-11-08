import { Grid } from "@mui/material";
import { Box } from "@mui/system";
import { doc, getFirestore, onSnapshot } from "firebase/firestore";
import moment from "moment";
import React, { useEffect, useState } from "react";

import { Post } from "@/lib/mapApi";

import Chapter from "../../components/instructors/setting/Chapter";
import Proposal from "../../components/instructors/setting/Proposal";
import Vote from "../../components/instructors/setting/Vote";
import { InstructorLayoutPage, InstructorsLayout } from "../../components/layouts/InstructorsLayout";
const CourseSetting: InstructorLayoutPage = ({ selectedSemester, selectedCourse, currentSemester }) => {
  console.log(currentSemester, "currentSemester");
  const db = getFirestore();
  const [chapters, setChapters] = useState<any>([]);
  const [semester, setSemester] = useState<any>({
    syllabus: [],
    days: 100,
    nodeProposals: {
      startDate: "",
      endDate: "",
      numPoints: 1,
      numProposalPerDay: 1,
      totalDaysOfCourse: 50,
    },
    questionProposals: {
      startDate: "",
      endDate: "",
      numPoints: 1,
      numQuestionsPerDay: 1,
      totalDaysOfCourse: 50,
    },
    votes: {
      pointIncrementOnAgreement: 1,
      pointDecrementOnAgreement: 1,
      onReceiveVote: 1,
      onReceiveDownVote: 1,
      onReceiveStar: 1,
    },
  });

  useEffect(() => {
    if (currentSemester) {
      const semesterSnapshot = onSnapshot(doc(db, "semesters", currentSemester.tagId), snapshot => {
        let semester: any = snapshot.data();
        if (semester) {
          setSemester((prevSemester: any) => {
            return {
              ...prevSemester,
              days: semester.days,
              syllabus: semester.syllabus,
              nodeProposals: {
                ...semester.nodeProposals,
                startDate: moment(new Date(semester.nodeProposals.startDate.toDate())).format("YYYY-DD-MM"),
                endDate: moment(new Date(semester.nodeProposals.endDate.toDate())).format("YYYY-DD-MM"),
              },
              questionProposals: {
                ...semester.questionProposals,
                startDate: moment(new Date(semester.questionProposals.startDate.toDate())).format("YYYY-DD-MM"),
                endDate: moment(new Date(semester.questionProposals.endDate.toDate())).format("YYYY-DD-MM"),
              },
              votes: semester.votes,
            };
          });
          setChapters(semester.syllabus);
        }
      });
      return () => semesterSnapshot();
    }
  }, [selectedSemester, selectedCourse, currentSemester]);

  const inputsHandler = (e: any, type: any, field: any = null) => {
    if (type === "nodeProposals") {
      if (field == "startDate" || field == "endDate") {
        setSemester({ ...semester, nodeProposals: { ...semester.nodeProposals, [field]: String(e.target.value) } });
      } else if (field == "numPoints") {
        setSemester({
          ...semester,
          nodeProposals: { ...semester.nodeProposals, [field]: Number(e.target.value) },
        });
      } else {
        setSemester({
          ...semester,
          nodeProposals: { ...semester.nodeProposals, [field]: Number(parseInt(e.target.value)) },
        });
      }
    } else if (type === "questionProposals") {
      if (field == "startDate" || field == "endDate") {
        setSemester({
          ...semester,
          questionProposals: { ...semester.questionProposals, [field]: String(e.target.value) },
        });
      } else if (field == "numPoints") {
        setSemester({
          ...semester,
          questionProposals: { ...semester.questionProposals, [field]: Number(e.target.value) },
        });
      } else {
        setSemester({
          ...semester,
          questionProposals: { ...semester.questionProposals, [field]: Number(parseInt(e.target.value)) },
        });
      }
    } else if (type === "votes") {
      setSemester({
        ...semester,
        votes: { ...semester.votes, [field]: Number(e.target.value) },
      });
    } else {
      if (e.target) {
        setSemester({
          ...semester,
          days: Number(parseInt(e.target.value)),
        });
      }
    }
  };

  const onSubmitHandler = async () => {
    let chaptersData = chapters.map((x: any) => {
      return {
        ...x,
        children: x.children
          ? x.children.map((y: any) => {
              return { ...y };
            })
          : undefined,
      };
    });

    chaptersData.map((chapter: any) => {
      if (chapter.hasOwnProperty("editable")) {
        delete chapter.editable;
      }
      if (chapter.isNew) {
        delete chapter.isNew;
        delete chapter.node;
      }
      if (chapter.children) {
        chapter.children.map((subChap: any) => {
          if (subChap.hasOwnProperty("editable")) {
            delete subChap.editable;
          }
          if (subChap.isNew) {
            delete subChap.isNew;
            delete subChap.node;
          }
        });
      }
    });
    let payload = { ...semester, syllabus: chaptersData };
    let response = await Post("/instructor/students/" + currentSemester?.tagId + "/setting", payload);
    console.log(response, "response");
  };

  return (
    <Box sx={{ padding: "20px" }}>
      <Grid container spacing={5}>
        <Grid item xs={12} md={6}>
          <Chapter
            currentSemester={currentSemester}
            chapters={chapters}
            setChapters={setChapters}
            onSubmitHandler={onSubmitHandler}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Proposal semester={semester} inputsHandler={inputsHandler} />
        </Grid>
      </Grid>
      <Grid sx={{ boxShadow: "rgba(0, 0, 0, 0.1) 0px 4px 12px" }} container spacing={0} mt={5}>
        <Vote semester={semester} inputsHandler={inputsHandler} />
      </Grid>
    </Box>
  );
};

const PageWrapper = () => {
  return <InstructorsLayout>{props => <CourseSetting {...props} />}</InstructorsLayout>;
};
export default PageWrapper;
