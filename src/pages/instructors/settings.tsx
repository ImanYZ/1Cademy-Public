import { LoadingButton } from "@mui/lab";
import { Grid } from "@mui/material";
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

const CourseSetting: InstructorLayoutPage = ({ selectedSemester, selectedCourse, currentSemester }) => {
  const db = getFirestore();
  const [loaded, setLoaded] = useState(false);
  const [requestLoader, setRequestLoader] = useState(false);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
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
      setInstitutions(institutionSorted.slice(0, 10));
      setLoaded(true);
    };
    retrieveInstitutions();
  }, []);

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
    let payload = { ...semester, syllabus: chaptersData };
    let response = await Post("/instructor/students/" + currentSemester?.tagId + "/setting", payload);
    setRequestLoader(false);
    console.log(response, "response");
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
    <Box sx={{ padding: "20px" }}>
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
          <Proposal semester={semester} inputsHandler={inputsHandler} />
        </Grid>
      </Grid>
      <Grid sx={{ boxShadow: "rgba(0, 0, 0, 0.1) 0px 4px 12px" }} container spacing={0} mt={5}>
        <Vote semester={semester} inputsHandler={inputsHandler} />
      </Grid>
      <Box display="flex" justifyContent="center" alignItems="center" gap="10px">
        <LoadingButton
          onClick={onSubmitHandler}
          loading={requestLoader}
          variant="contained"
          color="success"
          sx={{
            color: theme => theme.palette.common.white,
            fontWeight: "bold",
            padding: "15px 80px",
            marginTop: "20px",
            fontSize: "20px",
          }}
        >
          Submit
        </LoadingButton>
      </Box>
    </Box>
  );
};

const PageWrapper = () => {
  return <InstructorsLayout>{props => <CourseSetting {...props} />}</InstructorsLayout>;
};
export default PageWrapper;
