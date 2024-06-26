import { LoadingButton } from "@mui/lab";
import { Button, Grid } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import { Box } from "@mui/system";
import { doc, getFirestore, onSnapshot } from "firebase/firestore";
import moment from "moment";
import Image from "next/image";
import React, { useEffect, useState } from "react";

import { Post } from "@/lib/mapApi";

import LoadingImg from "../../../public/animated-icon-1cademy.gif";
import Chapter from "../../components/instructors/setting/Chapter";
import Proposal from "../../components/instructors/setting/Proposal";
import Vote from "../../components/instructors/setting/Vote";
import { InstructorLayoutPage, InstructorsLayout } from "../../components/layouts/InstructorsLayout";

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
const CourseSetting: InstructorLayoutPage = ({ selectedSemester, selectedCourse, currentSemester }) => {
  const db = getFirestore();
  const [open, setOpen] = React.useState(false);
  const [loaded, setLoaded] = useState(false);
  const [errorState, setErrorState] = useState(initialErrorsState);
  const [requestLoader, setRequestLoader] = useState(false);
  const [deleteLoader, setDeleteLoader] = useState(false);
  const [chapters, setChapters] = useState<any>([]);
  const [semester, setSemester] = useState<any>({
    syllabus: [],
    startDate: "",
    endDate: "",
    nodeProposals: {
      startDate: "",
      endDate: "",
      numPoints: 1,
      numProposalPerDay: 1,
    },
    questionProposals: {
      startDate: "",
      endDate: "",
      numPoints: 1,
      numQuestionsPerDay: 1,
    },
    dailyPractice: {
      startDate: "",
      endDate: "",
      numPoints: 1,
      numQuestionsPerDay: 1,
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
  });

  useEffect(() => {
    if (currentSemester) {
      setLoaded(false);
      const semesterSnapshot = onSnapshot(doc(db, "semesters", currentSemester.tagId), snapshot => {
        let semester: any = snapshot.data();
        if (semester) {
          setSemester((prevSemester: any) => {
            return {
              ...prevSemester,
              startDate: semester.startDate ? moment(new Date(semester?.startDate.toDate())).format("YYYY-MM-DD") : "",
              endDate: semester.endDate ? moment(new Date(semester?.endDate.toDate())).format("YYYY-MM-DD") : "",
              syllabus: semester.syllabus,
              nodeProposals: {
                ...semester.nodeProposals,
                startDate: moment(new Date(semester?.nodeProposals?.startDate.toDate())).format("YYYY-MM-DD"),
                endDate: moment(new Date(semester?.nodeProposals?.endDate.toDate())).format("YYYY-MM-DD"),
              },
              questionProposals: {
                ...semester.questionProposals,
                startDate: moment(new Date(semester?.questionProposals?.startDate.toDate())).format("YYYY-MM-DD"),
                endDate: moment(new Date(semester?.questionProposals?.endDate.toDate())).format("YYYY-MM-DD"),
              },
              dailyPractice: {
                ...semester?.dailyPractice,
                startDate: moment(new Date(semester?.dailyPractice?.startDate.toDate())).format("YYYY-MM-DD"),
                endDate: moment(new Date(semester?.dailyPractice?.endDate.toDate())).format("YYYY-MM-DD"),
              },
              votes: semester?.votes,
              isProposalRequired: semester?.isProposalRequired,
              isDailyPracticeRequired: semester?.isDailyPracticeRequired,
              isQuestionProposalRequired: semester?.isQuestionProposalRequired,
              isCastingVotesRequired: semester?.isCastingVotesRequired,
              isGettingVotesRequired: semester?.isGettingVotesRequired,
            };
          });
          setChapters(semester.syllabus);
          setLoaded(true);
        }
      });
      return () => semesterSnapshot();
    }
  }, [selectedSemester, selectedCourse, currentSemester]);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

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
    } else if (type === "dailyPractice") {
      if (field == "startDate" || field == "endDate") {
        setSemester({
          ...semester,
          dailyPractice: { ...semester.dailyPractice, [field]: String(e.target.value) },
        });
      } else if (field == "numPoints") {
        setSemester({
          ...semester,
          dailyPractice: { ...semester.dailyPractice, [field]: Number(e.target.value) },
        });
      } else {
        setSemester({
          ...semester,
          dailyPractice: { ...semester.dailyPractice, [field]: Number(parseInt(e.target.value)) },
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
          [field]: String(e.target.value),
        });
      }
    }
  };

  const switchHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSemester({ ...semester, [event.target.name]: event.target.checked });
  };

  const onSubmitHandler = async () => {
    try {
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

      let startDate = moment(semester.startDate);
      let endDate = moment(semester.endDate);
      let nodeProposalStartDate = moment(semester.nodeProposals.startDate);
      let nodeProposalEndDate = moment(semester.nodeProposals.endDate);

      let questionProposalStartDate = moment(semester.questionProposals.startDate);
      let questionProposalEndDate = moment(semester.questionProposals.endDate);

      let dailyPracticeStartDate = moment(semester.dailyPractice.startDate);
      let dailyPracticeEndDate = moment(semester.dailyPractice.endDate);

      let chapterDateDiff = endDate.diff(startDate, "days");

      if (!semester.startDate) {
        setErrorState({ ...initialErrorsState, startDate: true, errorText: `Chapter start date is required.` });
        setRequestLoader(false);
        return;
      } else if (!semester.endDate) {
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
      } else if (!nodeProposalStartDate.isBetween(startDate, endDate, null, "[]") && semester.isProposalRequired) {
        setErrorState({
          ...initialErrorsState,
          nodeProposalStartDate: true,
          errorText: `The start date of the node proposal should fall between the start and end dates of the chapter.`,
        });
        setRequestLoader(false);
        return;
      } else if (!nodeProposalEndDate.isBetween(startDate, endDate, null, "[]") && semester.isProposalRequired) {
        setErrorState({
          ...initialErrorsState,
          nodeProposalEndDate: true,
          errorText: `The end date of a node proposal should fall between the start and end dates of the chapter.`,
        });
        setRequestLoader(false);
        return;
      } else if (nodeProposalEndDate < nodeProposalStartDate && semester.isProposalRequired) {
        setErrorState({
          ...initialErrorsState,
          nodeProposalEndDate: true,
          errorText: `The end date of a node proposal should be less than the start date of the node proposal.`,
        });
        setRequestLoader(false);
        return;
      } else if (
        !questionProposalStartDate.isBetween(startDate, endDate, null, "[]") &&
        semester.isQuestionProposalRequired
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
        semester.isQuestionProposalRequired
      ) {
        setErrorState({
          ...initialErrorsState,
          questionProposalEndDate: true,
          errorText: `The end date of the question proposal should fall between the start and end dates of the chapter.`,
        });
        setRequestLoader(false);
        return;
      } else if (questionProposalEndDate < questionProposalStartDate && semester.isQuestionProposalRequired) {
        setErrorState({
          ...initialErrorsState,
          questionProposalEndDate: true,
          errorText: `The end date of the question proposal should be less than the start date of the question proposal.`,
        });
        setRequestLoader(false);
        return;
      } else if (
        !dailyPracticeStartDate.isBetween(startDate, endDate, null, "[]") &&
        semester.isDailyPracticeRequired
      ) {
        setErrorState({
          ...initialErrorsState,
          dailyPracticeStartDate: true,
          errorText: `The start date of the daily practice should fall between the start and end dates of the chapter.`,
        });
        setRequestLoader(false);
        return;
      } else if (!dailyPracticeEndDate.isBetween(startDate, endDate, null, "[]") && semester.isDailyPracticeRequired) {
        setErrorState({
          ...initialErrorsState,
          dailyPracticeEndDate: true,
          errorText: `The end date of the daily practice should fall between the start and end dates of the chapter.`,
        });
        setRequestLoader(false);
        return;
      } else if (dailyPracticeEndDate < dailyPracticeStartDate && semester.isDailyPracticeRequired) {
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

      let payload = { ...semester, syllabus: chaptersData };
      let response = await Post("/instructor/students/" + currentSemester?.tagId + "/setting", payload);
      setRequestLoader(false);
      console.error(response, "response");
    } catch (error: any) {
      setRequestLoader(false);
    }
  };

  const onDeleteHandler = async () => {
    try {
      setOpen(false);
      setDeleteLoader(true);
      await Post("/instructor/course/" + currentSemester?.tagId + "/delete", {});
      setDeleteLoader(false);
    } catch (error: any) {
      setDeleteLoader(false);
    }
  };

  if (!loaded) {
    return (
      <Box className="CenteredLoadingImageContainer" sx={{ background: "transparent" }}>
        <Image
          className="CenteredLoadingImage"
          loading="lazy"
          src={LoadingImg}
          alt="Loading"
          width={250}
          height={250}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ px: { xs: "10px", md: "20px" }, py: "10px" }}>
      <Grid container spacing={5}>
        <Grid item xs={12} md={6}>
          <Chapter
            selectedCourse={selectedCourse}
            chapters={chapters}
            setChapters={setChapters}
            onSubmitHandler={onSubmitHandler}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Proposal
            errorState={errorState}
            semester={semester}
            inputsHandler={inputsHandler}
            switchHandler={switchHandler}
          />
        </Grid>
      </Grid>
      <Grid container spacing={0} mt={5}>
        <Vote semester={semester} inputsHandler={inputsHandler} switchHandler={switchHandler} />
      </Grid>
      <Box display="flex" justifyContent="space-between" alignItems="center" gap="10px" mt={3}>
        <LoadingButton
          onClick={handleClickOpen}
          loading={deleteLoader}
          variant="contained"
          color="error"
          loadingIndicator={
            <CircularProgress
              sx={{ color: theme => (theme.palette.mode === "dark" ? theme.palette.common.white : "#555") }}
            />
          }
          sx={{
            color: theme => theme.palette.common.white,
            fontWeight: "bold",
            padding: {
              xs: "5px 50px",
              md: "15px 80px",
            },
            fontSize: "20px",
          }}
        >
          Delete
        </LoadingButton>
        <LoadingButton
          onClick={onSubmitHandler}
          loading={requestLoader}
          variant="contained"
          color="success"
          loadingIndicator={
            <CircularProgress
              sx={{ color: theme => (theme.palette.mode === "dark" ? theme.palette.common.white : "#555") }}
            />
          }
          sx={{
            color: theme => theme.palette.common.white,
            fontWeight: "bold",
            padding: {
              xs: "5px 50px",
              md: "15px 80px",
            },
            fontSize: "20px",
          }}
        >
          Submit
        </LoadingButton>
      </Box>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogContent>
          <DialogContentText id="alert-dialog-description">Do you want delete this course?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>No</Button>
          <Button onClick={onDeleteHandler} autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const PageWrapper = () => {
  return <InstructorsLayout>{props => <CourseSetting {...props} />}</InstructorsLayout>;
};
export default PageWrapper;
