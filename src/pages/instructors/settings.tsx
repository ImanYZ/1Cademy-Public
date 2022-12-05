import { LoadingButton } from "@mui/lab";
import { Button, Grid } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import { Box } from "@mui/system";
import { collection, doc, getDocs, getFirestore, onSnapshot, query } from "firebase/firestore";
import moment from "moment";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { Institution } from "src/knowledgeTypes";

import { Post } from "@/lib/mapApi";

import LoadingImg from "../../../public/animated-icon-1cademy.gif";
import Chapter from "../../components/instructors/setting/Chapter";
import NewCourse from "../../components/instructors/setting/NewCourse";
import Proposal from "../../components/instructors/setting/Proposal";
import Vote from "../../components/instructors/setting/Vote";
import { InstructorLayoutPage, InstructorsLayout } from "../../components/layouts/InstructorsLayout";

const initialErrorsState = {
  startDate: false,
  endDate: false,
  nodeProposalDay: false,
  nodeProposalDate: false,
  questionProposalDay: false,
  questionProposalDate: false,
  errorText: "",
};
const CourseSetting: InstructorLayoutPage = ({ selectedSemester, selectedCourse, currentSemester }) => {
  const db = getFirestore();
  const [open, setOpen] = React.useState(false);
  const [loaded, setLoaded] = useState(false);
  const [errorState, setErrorState] = useState(initialErrorsState);
  const [requestLoader, setRequestLoader] = useState(false);
  const [deleteLoader, setDeleteLoader] = useState(false);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
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

  useEffect(() => {
    const retrieveInstitutions = async () => {
      const db = getFirestore();
      const institutionsRef = collection(db, "institutions");
      const q = query(institutionsRef);

      const querySnapshot = await getDocs(q);
      let institutions: Institution[] = [];
      querySnapshot.forEach(doc => {
        institutions.push({ id: doc.id, ...doc.data() } as Institution);
      });

      const institutionSorted = institutions
        .sort((l1, l2) => (l1.name < l2.name ? -1 : 1))
        .sort((l1, l2) => (l1.country < l2.country ? -1 : 1));
      setInstitutions(institutionSorted);
      setLoaded(true);
    };
    retrieveInstitutions();
  }, []);

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

      let startDate = moment(semester.start);
      //let endDate = moment(semester.endDate);
      //let nodeProposalEndDate = moment(semester.nodeProposals.endDate);
      let questionProposalEndDate = moment(semester.questionProposals.endDate);
      //let nodeProposalDateDiff = nodeProposalEndDate.diff(semester.nodeProposals.startDate, "days") + 1;
      let questionProposalDateDiff = questionProposalEndDate.diff(semester.questionProposals.startDate, "days") + 1;
      console.log(startDate.diff(semester.nodeProposals.startDate, "days"), "diff");
      if (!semester.startDate) {
        setErrorState({ ...initialErrorsState, startDate: true, errorText: `Chapter start date is required.` });
        setRequestLoader(false);
        return;
      } else if (!semester.endDate) {
        setErrorState({ ...initialErrorsState, endDate: true, errorText: `Chapter end date is required.` });
        setRequestLoader(false);
        return;
      } else if (
        semester.nodeProposals.startDate < semester.startDate ||
        semester.nodeProposals.startDate > semester.endDate
      ) {
        setErrorState({
          ...initialErrorsState,
          nodeProposalDate: true,
          errorText: `Node proposal start date should be greater or equal to chapter startDate`,
        });
        setRequestLoader(false);
        return;
      } else if (
        semester.nodeProposals.endDate > semester.endDate ||
        semester.nodeProposals.endDate < semester.startDate
      ) {
        setErrorState({
          ...initialErrorsState,
          nodeProposalDate: true,
          errorText: `Node proposal end date should be less or equal to chapter endDate`,
        });
        setRequestLoader(false);
        return;
      } else if (questionProposalDateDiff > semester.days) {
        setErrorState({
          ...initialErrorsState,
          questionProposalDate: true,
          errorText: `Question proposal date range should not exceed ${semester.days} days.`,
        });
        setRequestLoader(false);
        return;
      } else if (questionProposalDateDiff <= 0) {
        setErrorState({
          ...initialErrorsState,
          questionProposalDate: true,
          errorText: `Ending date should not be less than starting date in question proposal.`,
        });
        setRequestLoader(false);
        return;
      } else if (
        semester.nodeProposals.totalDaysOfCourse > semester.days ||
        semester.nodeProposals.totalDaysOfCourse <= 0
      ) {
        setErrorState({
          ...initialErrorsState,
          nodeProposalDay: true,
          errorText: `Days should be between 1 to ${semester.days} in node proposal.`,
        });
        setRequestLoader(false);
        return;
      } else if (
        semester.questionProposals.totalDaysOfCourse > semester.days ||
        semester.questionProposals.totalDaysOfCourse <= 0
      ) {
        setErrorState({
          ...initialErrorsState,
          questionProposalDay: true,
          errorText: `Days should be between 1 to ${semester.days} in question proposal.`,
        });
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

  if (!loaded) {
    return (
      <Box
        className="CenterredLoadingImageContainer"
        sx={{ background: theme => (theme.palette.mode === "dark" ? "#28282A" : "#F5F5F5") }}
      >
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

  if (!selectedCourse) {
    return <NewCourse institutions={institutions} />;
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
