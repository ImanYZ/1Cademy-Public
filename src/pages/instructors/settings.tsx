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
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";

import { Post } from "@/lib/mapApi";

import Chapter from "../../components/instructors/setting/Chapter";
import NewCourse from "../../components/instructors/setting/NewCourse";
import Proposal from "../../components/instructors/setting/Proposal";
import Vote from "../../components/instructors/setting/Vote";
import { InstructorLayoutPage, InstructorsLayout } from "../../components/layouts/InstructorsLayout";

const initialErrorsState = {
  days: false,
  nodeProposalDay: false,
  nodeProposalDate: false,
  questionProposalDay: false,
  questionProposalDate: false,
};
const CourseSetting: InstructorLayoutPage = ({ selectedSemester, selectedCourse, currentSemester }) => {
  const db = getFirestore();
  const [open, setOpen] = React.useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const [errorState, setErrorState] = useState(initialErrorsState);
  const [requestLoader, setRequestLoader] = useState(false);
  const [deleteLoader, setDeleteLoader] = useState(false);
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
                startDate: moment(new Date(semester.nodeProposals.startDate.toDate())).format("YYYY-MM-DD"),
                endDate: moment(new Date(semester.nodeProposals.endDate.toDate())).format("YYYY-MM-DD"),
              },
              questionProposals: {
                ...semester.questionProposals,
                startDate: moment(new Date(semester.questionProposals.startDate.toDate())).format("YYYY-MM-DD"),
                endDate: moment(new Date(semester.questionProposals.endDate.toDate())).format("YYYY-MM-DD"),
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

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const showErrorPop = (error: string) => {
    return enqueueSnackbar(error, {
      variant: "error",
      anchorOrigin: {
        horizontal: "right",
        vertical: "top",
      },
    });
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

      let nodeProposalEndDate = moment(semester.nodeProposals.endDate);
      let questionProposalEndDate = moment(semester.questionProposals.endDate);
      if (semester.days <= 0) {
        setErrorState({ ...initialErrorsState, days: true });
        showErrorPop(`Total days should be greater than 0.`);
        setRequestLoader(false);
        return;
      } else if (nodeProposalEndDate.diff(semester.nodeProposals.startDate, "days") !== semester.days) {
        setErrorState({ ...initialErrorsState, nodeProposalDate: true });
        showErrorPop(`Date range should be ${semester.days} days in node proposal.`);
        setRequestLoader(false);
        return;
      } else if (questionProposalEndDate.diff(semester.questionProposals.startDate, "days") !== semester.days) {
        setErrorState({ ...initialErrorsState, questionProposalDate: true });
        showErrorPop(`Date range should be ${semester.days} days in question proposal.`);
        setRequestLoader(false);
        return;
      } else if (
        semester.nodeProposals.totalDaysOfCourse > semester.days ||
        semester.nodeProposals.totalDaysOfCourse <= 0
      ) {
        setErrorState({ ...initialErrorsState, nodeProposalDay: true });
        showErrorPop(`Days should be between 1 to ${semester.days} in node proposal.`);
        setRequestLoader(false);
        return;
      } else if (
        semester.questionProposals.totalDaysOfCourse > semester.days ||
        semester.questionProposals.totalDaysOfCourse <= 0
      ) {
        setErrorState({ ...initialErrorsState, questionProposalDay: true });
        showErrorPop(`Days should be between 1 to ${semester.days} in question proposal.`);
        setRequestLoader(false);
        return;
      } else {
        setErrorState({ ...initialErrorsState });
      }

      let payload = { ...semester, syllabus: chaptersData };
      let response = await Post("/instructor/students/" + currentSemester?.tagId + "/setting", payload);
      setRequestLoader(false);
      console.log(response, "response");
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

  if (selectedCourse === null) {
    return <NewCourse />;
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
          <Proposal errorState={errorState} semester={semester} inputsHandler={inputsHandler} />
        </Grid>
      </Grid>
      <Grid container spacing={0} mt={5}>
        <Vote semester={semester} inputsHandler={inputsHandler} />
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
