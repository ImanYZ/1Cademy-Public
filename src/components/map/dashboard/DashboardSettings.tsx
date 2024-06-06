import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { LoadingButton } from "@mui/lab";
import { Box, Grid, Typography } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import { doc, getFirestore, onSnapshot } from "firebase/firestore";
import moment from "moment";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { CourseTag } from "src/instructorsTypes";
import { ISemester } from "src/types/ICourse";

import Chapter from "@/components/instructors/setting/Chapter";
import Proposal from "@/components/instructors/setting/Proposal";
import Vote from "@/components/instructors/setting/Vote";
import { Post } from "@/lib/mapApi";
import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";
import { InstructorSemesterSettingPayload } from "@/pages/api/instructor/students/[semesterId]/setting";

import LoadingImg from "../../../../public/animated-icon-1cademy.gif";
import { getCourseTitleFromSemester } from "./DashboardWrapper";

const INITIAL_SEMESTER: InstructorSemesterSettingPayload = {
  syllabus: [],
  startDate: "",
  endDate: "",
  nodeProposals: {
    startDate: "",
    endDate: "",
    numPoints: 1,
    numProposalPerDay: 1,
    totalDaysOfCourse: 1,
  },
  questionProposals: {
    startDate: "",
    endDate: "",
    numPoints: 1,
    numQuestionsPerDay: 1,
    totalDaysOfCourse: 1,
  },
  dailyPractice: {
    startDate: "",
    endDate: "",
    numPoints: 1,
    numQuestionsPerDay: 1,
    totalDaysOfCourse: 1,
  },
  votes: {
    pointIncrementOnAgreement: 1,
    pointDecrementOnAgreement: 1,
    onReceiveVote: 1,
    onReceiveDownVote: 1,
    onReceiveStar: 1,
  },
  isProposalRequired: false,
  isDailyPracticeRequired: false,
  isQuestionProposalRequired: false,
  isCastingVotesRequired: false,
  isGettingVotesRequired: false,
};

const initialErrorsState = {
  startDate: false,
  endDate: false,
  nodeProposalStartDate: false,
  nodeProposalEndDate: false,
  questionProposalStartDate: false,
  questionProposalEndDate: false,
  dailyPracticeStartDate: false,
  dailyPracticeEndDate: false,
  errorText: "",
};

type DashboardSettingsProps = {
  currentSemester: CourseTag | null;
  confirmIt: any;
};

export const DashboardSettings = ({ currentSemester, confirmIt }: DashboardSettingsProps) => {
  const db = getFirestore();
  const [loaded, setLoaded] = useState(false);
  const [errorState, setErrorState] = useState(initialErrorsState);
  const [requestLoader, setRequestLoader] = useState(false);
  const [deleteLoader, setDeleteLoader] = useState(false);
  const [chapters, setChapters] = useState<any>([]);
  const [baseSemester, setBaseSemester] = useState<InstructorSemesterSettingPayload>(INITIAL_SEMESTER);
  const [semester, setSemester] = useState<ISemester | null>(null);

  useEffect(() => {
    if (currentSemester) {
      setLoaded(false);
      const semesterSnapshot = onSnapshot(doc(db, "semesters", currentSemester.tagId), snapshot => {
        if (!snapshot.exists()) return;

        let semesterData = snapshot.data() as ISemester;
        if (semesterData) {
          setSemester(semesterData);
          setBaseSemester(prevSemester => {
            return {
              ...prevSemester,
              startDate: semesterData.startDate
                ? moment(new Date(semesterData?.startDate.toDate())).format("YYYY-MM-DD")
                : "",
              endDate: semesterData.endDate
                ? moment(new Date(semesterData?.endDate.toDate())).format("YYYY-MM-DD")
                : "",
              syllabus: semesterData.syllabus,
              nodeProposals: {
                ...semesterData.nodeProposals,
                startDate: moment(new Date(semesterData?.nodeProposals?.startDate.toDate())).format("YYYY-MM-DD"),
                endDate: moment(new Date(semesterData?.nodeProposals?.endDate.toDate())).format("YYYY-MM-DD"),
              },
              questionProposals: {
                ...semesterData.questionProposals,
                startDate: moment(new Date(semesterData?.questionProposals?.startDate.toDate())).format("YYYY-MM-DD"),
                endDate: moment(new Date(semesterData?.questionProposals?.endDate.toDate())).format("YYYY-MM-DD"),
              },
              dailyPractice: {
                ...semesterData?.dailyPractice,
                startDate: moment(new Date(semesterData?.dailyPractice?.startDate.toDate())).format("YYYY-MM-DD"),
                endDate: moment(new Date(semesterData?.dailyPractice?.endDate.toDate())).format("YYYY-MM-DD"),
              },
              votes: semesterData?.votes,
              isProposalRequired: semesterData?.isProposalRequired,
              isDailyPracticeRequired: semesterData?.isDailyPracticeRequired,
              isQuestionProposalRequired: semesterData?.isQuestionProposalRequired,
              isCastingVotesRequired: semesterData?.isCastingVotesRequired,
              isGettingVotesRequired: semesterData?.isGettingVotesRequired,
            };
          });
          setChapters(semesterData.syllabus);
          setLoaded(true);
        }
      });
      return () => semesterSnapshot();
    }
  }, [currentSemester, db]);

  const inputsHandler = (e: any, type: any, field: any = null) => {
    if (type === "nodeProposals") {
      if (field == "startDate" || field == "endDate") {
        setBaseSemester({
          ...baseSemester,
          nodeProposals: { ...baseSemester.nodeProposals, [field]: String(e.target.value) },
        });
      } else if (field == "numPoints") {
        setBaseSemester({
          ...baseSemester,
          nodeProposals: { ...baseSemester.nodeProposals, [field]: Number(e.target.value) },
        });
      } else {
        setBaseSemester({
          ...baseSemester,
          nodeProposals: { ...baseSemester.nodeProposals, [field]: Number(parseInt(e.target.value)) },
        });
      }
    } else if (type === "questionProposals") {
      if (field == "startDate" || field == "endDate") {
        setBaseSemester({
          ...baseSemester,
          questionProposals: { ...baseSemester.questionProposals, [field]: String(e.target.value) },
        });
      } else if (field == "numPoints") {
        setBaseSemester({
          ...baseSemester,
          questionProposals: { ...baseSemester.questionProposals, [field]: Number(e.target.value) },
        });
      } else {
        setBaseSemester({
          ...baseSemester,
          questionProposals: { ...baseSemester.questionProposals, [field]: Number(parseInt(e.target.value)) },
        });
      }
    } else if (type === "dailyPractice") {
      if (field == "startDate" || field == "endDate") {
        setBaseSemester({
          ...baseSemester,
          dailyPractice: { ...baseSemester.dailyPractice, [field]: String(e.target.value) },
        });
      } else if (field == "numPoints") {
        setBaseSemester({
          ...baseSemester,
          dailyPractice: { ...baseSemester.dailyPractice, [field]: Number(e.target.value) },
        });
      } else {
        setBaseSemester({
          ...baseSemester,
          dailyPractice: { ...baseSemester.dailyPractice, [field]: Number(parseInt(e.target.value)) },
        });
      }
    } else if (type === "votes") {
      setBaseSemester({
        ...baseSemester,
        votes: { ...baseSemester.votes, [field]: Number(e.target.value) },
      });
    } else {
      if (e.target) {
        setBaseSemester({
          ...baseSemester,
          [field]: String(e.target.value),
        });
      }
    }
  };

  const switchHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBaseSemester({ ...baseSemester, [event.target.name]: event.target.checked });
  };

  const onSubmitHandler = async () => {
    try {
      const confirmSubmit = await confirmIt(
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            gap: "10px",
          }}
        >
          <DeleteForeverIcon />
          <Typography sx={{ fontWeight: "bold" }}>Are you sure you want to save your changes?</Typography>
        </Box>,
        "Save changes",
        "Ignore changes"
      );
      if (!confirmSubmit) {
        return;
      }
      setRequestLoader(true);
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

      let startDate = moment(baseSemester.startDate);
      let endDate = moment(baseSemester.endDate);
      let nodeProposalStartDate = moment(baseSemester.nodeProposals.startDate);
      let nodeProposalEndDate = moment(baseSemester.nodeProposals.endDate);

      let questionProposalStartDate = moment(baseSemester.questionProposals.startDate);
      let questionProposalEndDate = moment(baseSemester.questionProposals.endDate);

      let dailyPracticeStartDate = moment(baseSemester.dailyPractice.startDate);
      let dailyPracticeEndDate = moment(baseSemester.dailyPractice.endDate);

      let chapterDateDiff = endDate.diff(startDate, "days");

      if (!baseSemester.startDate) {
        setErrorState({ ...initialErrorsState, startDate: true, errorText: `Chapter start date is required.` });
        setRequestLoader(false);
        return;
      } else if (!baseSemester.endDate) {
        setErrorState({ ...initialErrorsState, endDate: true, errorText: `Chapter end date is required.` });
        setRequestLoader(false);
        return;
      } else if (chapterDateDiff < 0) {
        setErrorState({
          ...initialErrorsState,
          endDate: true,
          errorText: `The end date should be greater than the start date.`,
        });
        setRequestLoader(false);
        return;
      } else if (!nodeProposalStartDate.isBetween(startDate, endDate, null, "[]") && baseSemester.isProposalRequired) {
        setErrorState({
          ...initialErrorsState,
          nodeProposalStartDate: true,
          errorText: `The start date of the node proposal should fall between the start and end dates of the chapter.`,
        });
        setRequestLoader(false);
        return;
      } else if (!nodeProposalEndDate.isBetween(startDate, endDate, null, "[]") && baseSemester.isProposalRequired) {
        setErrorState({
          ...initialErrorsState,
          nodeProposalEndDate: true,
          errorText: `The end date of a node proposal should fall between the start and end dates of the chapter.`,
        });
        setRequestLoader(false);
        return;
      } else if (nodeProposalEndDate < nodeProposalStartDate && baseSemester.isProposalRequired) {
        setErrorState({
          ...initialErrorsState,
          nodeProposalEndDate: true,
          errorText: `The end date of a node proposal should be less than the start date of the node proposal.`,
        });
        setRequestLoader(false);
        return;
      } else if (
        !questionProposalStartDate.isBetween(startDate, endDate, null, "[]") &&
        baseSemester.isQuestionProposalRequired
      ) {
        setErrorState({
          ...initialErrorsState,
          questionProposalStartDate: true,
          errorText: `The start date of the question proposal should fall between the start and end dates of the chapter.`,
        });
        setRequestLoader(false);
        return;
      } else if (
        !questionProposalEndDate.isBetween(startDate, endDate, null, "[]") &&
        baseSemester.isQuestionProposalRequired
      ) {
        setErrorState({
          ...initialErrorsState,
          questionProposalEndDate: true,
          errorText: `The end date of the question proposal should fall between the start and end dates of the chapter.`,
        });
        setRequestLoader(false);
        return;
      } else if (questionProposalEndDate < questionProposalStartDate && baseSemester.isQuestionProposalRequired) {
        setErrorState({
          ...initialErrorsState,
          questionProposalEndDate: true,
          errorText: `The end date of the question proposal should be less than the start date of the question proposal.`,
        });
        setRequestLoader(false);
        return;
      } else if (
        !dailyPracticeStartDate.isBetween(startDate, endDate, null, "[]") &&
        baseSemester.isDailyPracticeRequired
      ) {
        setErrorState({
          ...initialErrorsState,
          dailyPracticeStartDate: true,
          errorText: `The start date of the daily practice should fall between the start and end dates of the chapter.`,
        });
        setRequestLoader(false);
        return;
      } else if (
        !dailyPracticeEndDate.isBetween(startDate, endDate, null, "[]") &&
        baseSemester.isDailyPracticeRequired
      ) {
        setErrorState({
          ...initialErrorsState,
          dailyPracticeEndDate: true,
          errorText: `The end date of the daily practice should fall between the start and end dates of the chapter.`,
        });
        setRequestLoader(false);
        return;
      } else if (dailyPracticeEndDate < dailyPracticeStartDate && baseSemester.isDailyPracticeRequired) {
        setErrorState({
          ...initialErrorsState,
          dailyPracticeEndDate: true,
          errorText: `The end date of the daily practice should be less than the start date of the daily practice.`,
        });
        setRequestLoader(false);
        return;
      } else {
        setErrorState({ ...initialErrorsState });
      }

      let payload = { ...baseSemester, syllabus: chaptersData };
      await Post("/instructor/students/" + currentSemester?.tagId + "/setting", payload);
      setRequestLoader(false);
    } catch (error: any) {
      setRequestLoader(false);
    }
  };

  const onDeleteHandler = async () => {
    try {
      if (
        await confirmIt(
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              gap: "10px",
            }}
          >
            <DeleteForeverIcon />
            <Typography sx={{ fontWeight: "bold" }}>Do you want delete this course?</Typography>
            <Typography>Deleting a course will permanently remove it from 1Cademy.</Typography>
          </Box>,
          "Delete Course",
          "Keep Course"
        )
      ) {
        setDeleteLoader(true);
        await Post("/instructor/course/" + currentSemester?.tagId + "/delete", {});
        setDeleteLoader(false);
      }
    } catch (error: any) {
      setDeleteLoader(false);
    }
  };

  if (!loaded) {
    return (
      <Box className="CenterredLoadingImageContainer" sx={{ background: "transparent" }}>
        <Image
          className="CenterredLoadingImage"
          loading="lazy"
          src={LoadingImg}
          alt="Loading"
          width={250}
          height={250}
        />
      </Box>
    );
  }
  if (!semester) return <Typography>Sorry Semester does not exist</Typography>;

  return (
    <Box sx={{ px: { xs: "10px", md: "20px" }, py: "10px", pb: 0 }}>
      <Grid container spacing={5}>
        <Grid item xs={12} md={6}>
          <Chapter
            selectedCourse={getCourseTitleFromSemester(semester)}
            chapters={chapters}
            setChapters={setChapters}
            onSubmitHandler={onSubmitHandler}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Proposal
            errorState={errorState}
            semester={baseSemester}
            inputsHandler={inputsHandler}
            switchHandler={switchHandler}
          />
        </Grid>
      </Grid>
      <Grid container spacing={0} mt={5}>
        <Vote semester={baseSemester} inputsHandler={inputsHandler} switchHandler={switchHandler} />
      </Grid>
      <Box
        display="flex"
        justifyContent="flex-end"
        alignItems="center"
        gap="10px"
        mt={3}
        sx={{
          position: "sticky",
          bottom: 0,
          background: theme =>
            theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG900 : DESIGN_SYSTEM_COLORS.gray100,
          height: "50px",
          p: "15px",
        }}
      >
        <LoadingButton
          onClick={onDeleteHandler}
          loading={deleteLoader}
          variant="outlined"
          loadingIndicator={
            <CircularProgress
              sx={{ color: theme => (theme.palette.mode === "dark" ? theme.palette.common.white : "#555") }}
            />
          }
          sx={{
            fontWeight: "bold",
            padding: {
              xs: "5px 50px",
            },
            borderRadius: "32px",
          }}
        >
          Delete
        </LoadingButton>
        <LoadingButton
          onClick={onSubmitHandler}
          loading={requestLoader}
          variant="contained"
          loadingIndicator={
            <CircularProgress
              sx={{ color: theme => (theme.palette.mode === "dark" ? theme.palette.common.white : "#555") }}
            />
          }
          sx={{
            fontWeight: "bold",
            padding: {
              xs: "5px 50px",
            },

            borderRadius: "32px",
            backgroundColor: DESIGN_SYSTEM_COLORS.primary800,
            ":hover": {
              backgroundColor: DESIGN_SYSTEM_COLORS.primary900,
            },
          }}
        >
          Submit
        </LoadingButton>
      </Box>
    </Box>
  );
};
