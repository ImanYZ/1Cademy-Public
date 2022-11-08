import { Button, Grid, TextField } from "@mui/material";
import { Box } from "@mui/system";
import { doc, getFirestore, onSnapshot } from "firebase/firestore";
import { useFormik } from "formik";
import moment from "moment";
import React, { useEffect, useState } from "react";
import * as yup from "yup";

import { Post } from "@/lib/mapApi";

import Chapter from "../../components/instructors/setting/Chapter";
import Proposal from "../../components/instructors/setting/Proposal";
import Vote from "../../components/instructors/setting/Vote";
import { InstructorLayoutPage, InstructorsLayout } from "../../components/layouts/InstructorsLayout";

const validationSchema = yup.object({
  courseCode: yup.string().required("Course code is required"),
  semesterName: yup.string().required("Semester name is required"),
  programName: yup.string().required("Program name is required"),
  departmentName: yup.string().required("Department name is required"),
  universityTitle: yup.string().required("University title is required"),
});

const CourseSetting: InstructorLayoutPage = ({
  selectedSemester,
  selectedCourse,
  currentSemester,
  allCourses,
  setAllCourses,
}) => {
  const db = getFirestore();
  const [chapters, setChapters] = useState<any>([]);
  const [semester, setSemester] = useState<any>({
    syllabus: [],
    days: 0,
    nodeProposals: {
      startDate: "",
      endDate: "",
      numPoints: 0,
      numProposalPerDay: 0,
      totalDaysOfCourse: 0,
    },
    questionProposals: {
      startDate: "",
      endDate: "",
      numPoints: 0,
      numQuestionsPerDay: 0,
      totalDaysOfCourse: 0,
    },
    votes: {
      pointIncrementOnAgreement: 0,
      pointDecrementOnAgreement: 0,
      onReceiveVote: 0,
      onReceiveDownVote: 0,
      onReceiveStar: 0,
    },
  });

  const formik = useFormik({
    initialValues: {
      courseCode: "",
      semesterName: "",
      programName: "",
      departmentName: "",
      universityTitle: "",
    },
    validationSchema: validationSchema,
    onSubmit: values => {
      console.log(values, "values");
      console.log(selectedSemester, "selectedSemester");
      console.log(allCourses, "allCourses");
      console.log(values, "values");
      allCourses[String(selectedSemester)] = [...allCourses[String(selectedSemester)], values.courseCode];

      setAllCourses(Object.assign({}, allCourses));
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
      } else {
        setSemester({ ...semester, nodeProposals: { ...semester.nodeProposals, [field]: Number(e.target.value) } });
      }
    } else if (type === "questionProposals") {
      if (field == "startDate" || field == "endDate") {
        setSemester({
          ...semester,
          questionProposals: { ...semester.questionProposals, [field]: String(e.target.value) },
        });
      } else {
        setSemester({
          ...semester,
          questionProposals: { ...semester.questionProposals, [field]: Number(e.target.value) },
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
          days: Number(e.target.value),
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

  if (!selectedCourse) {
    return (
      <Box sx={{ marginTop: "50px" }}>
        <Grid container sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <Grid item xs={12} md={4}>
            <form
              onSubmit={formik.handleSubmit}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "25px" }}
            >
              <TextField
                fullWidth
                id="courseCode"
                name="courseCode"
                label="Course Code"
                value={formik.values.courseCode}
                onChange={formik.handleChange}
                error={formik.touched.courseCode && Boolean(formik.errors.courseCode)}
                helperText={formik.touched.courseCode && formik.errors.courseCode}
              />

              <TextField
                fullWidth
                id="semesterName"
                name="semesterName"
                label="Semester Name"
                value={formik.values.semesterName}
                onChange={formik.handleChange}
                error={formik.touched.semesterName && Boolean(formik.errors.semesterName)}
                helperText={formik.touched.semesterName && formik.errors.semesterName}
              />

              <TextField
                fullWidth
                id="programName"
                name="programName"
                label="Program Name"
                value={formik.values.programName}
                onChange={formik.handleChange}
                error={formik.touched.programName && Boolean(formik.errors.programName)}
                helperText={formik.touched.programName && formik.errors.programName}
              />

              <TextField
                fullWidth
                id="departmentName"
                name="departmentName"
                label="Department Name"
                value={formik.values.departmentName}
                onChange={formik.handleChange}
                error={formik.touched.departmentName && Boolean(formik.errors.departmentName)}
                helperText={formik.touched.departmentName && formik.errors.departmentName}
              />

              <TextField
                fullWidth
                id="universityTitle"
                name="universityTitle"
                label="University Title"
                value={formik.values.universityTitle}
                onChange={formik.handleChange}
                error={formik.touched.universityTitle && Boolean(formik.errors.universityTitle)}
                helperText={formik.touched.universityTitle && formik.errors.universityTitle}
              />
              <Button color="primary" variant="contained" fullWidth type="submit">
                Submit
              </Button>
            </form>
          </Grid>
        </Grid>
      </Box>
    );
  }

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
