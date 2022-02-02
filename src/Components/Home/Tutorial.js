import React, { useState, useEffect } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";

import Box from "@mui/material/Box";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import Grid from "@mui/material/Grid";
import Checkbox from "@mui/material/Checkbox";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import FormLabel from "@mui/material/FormLabel";
import Button from "@mui/material/Button";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckIcon from "@mui/icons-material/Check";

import { Fireworks } from "fireworks-js/dist/react";

import { firebaseState, fullnameState } from "../../store/AuthAtoms";
import { tutorialEndedState } from "../../store/ExperimentAtoms";

import PagesNavbar from "./PagesNavbar";
import Typography from "./modules/components/Typography";
import YoutubeEmbed from "./modules/components/YoutubeEmbed/YoutubeEmbed";

import instructs from "./tutorialIntroductionQuestions";

const options = {
  speed: 3,
};

const style = {
  left: "25%",
  bottom: 0,
  width: "49%",
  height: "49%",
  position: "fixed",
};

const Tutorial = (props) => {
  const firebase = useRecoilValue(firebaseState);
  const fullname = useRecoilValue(fullnameState);
  const setTutorialEnded = useSetRecoilState(tutorialEndedState);

  const [instructions, setInstructions] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [expanded, setExpanded] = useState(0);
  const [completed, setCompleted] = useState(-1);
  const [attempts, setAttempts] = useState({});
  const [correctAttempts, setCorrectAttempts] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);

  useEffect(() => {
    const instrs = [];
    for (let instId in instructs) {
      instrs.push({
        ...instructs[instId],
        id: instId,
      });
    }
    setInstructions(instrs);
  }, []);

  useEffect(() => {
    if (instructions.length > 0 && expanded !== false) {
      const quests = [];
      for (let qId in instructions[expanded].questions) {
        const quest = {
          ...instructions[expanded].questions[qId],
          id: qId,
          checks: {},
          error: false,
          helperText: " ",
        };
        for (let choice in quest.choices) {
          quest.checks[choice] = false;
        }
        quests.push(quest);
      }
      setQuestions(quests);
    }
  }, [instructions, expanded]);

  useEffect(() => {
    const loadAttempts = async () => {
      let oAttempts = {};
      const tutorialRef = firebase.db.collection("tutorial").doc(fullname);
      const tutorialDoc = await tutorialRef.get();
      let tutorialData;
      if (tutorialDoc.exists) {
        tutorialData = tutorialDoc.data();
        setCorrectAttempts(tutorialData.corrects);
        setWrongAttempts(tutorialData.wrongs);
        setCompleted(tutorialData.completed);
        oAttempts = tutorialData.attempts;
      }
      for (let instr in instructs) {
        if (!(instr in oAttempts)) {
          oAttempts[instr] = {
            corrects: 0,
            wrongs: 0,
            questions: {},
          };
        } else if ("completed" in oAttempts[instr]) {
          delete oAttempts[instr].completed;
        }
        for (let ques in instructs[instr].questions) {
          if (!(ques in oAttempts[instr].questions)) {
            oAttempts[instr].questions[ques] = {
              answers: [],
              corrects: 0,
              wrongs: 0,
            };
          }
        }
      }
      let sectionChanged = false;
      if (tutorialDoc.exists) {
        if (tutorialData.completed < Object.keys(instructs).length - 1) {
          changeExpand(
            tutorialData.completed + 1,
            tutorialRef,
            tutorialDoc,
            oAttempts
          );
          sectionChanged = true;
        }
      }
      if (!sectionChanged) {
        setAttempts(oAttempts);
      }
    };
    if (instructions.length > 0 && fullname) {
      loadAttempts();
    }
  }, [instructions, fullname]);

  const checkChoice = (idx) => (event) => {
    const quests = [...questions];
    quests[idx].checks[event.target.name] = event.target.checked;
    quests[idx].error = false;
    quests[idx].helperText = " ";
    setQuestions(quests);
  };

  const handleSubmit = (instrId, question) => async (event) => {
    event.preventDefault();

    if (expanded === false) {
      return;
    }
    const oAttempts = { ...attempts };
    const quests = [...questions];
    let cAttempts = correctAttempts;
    let wAttempts = wrongAttempts;
    let wrong = false;
    oAttempts[instrId].submitted = firebase.firestore.Timestamp.fromDate(
      new Date()
    );
    for (let choice in question.checks) {
      if (
        question.checks[choice] &&
        !oAttempts[instrId].questions[question.id].answers.includes(choice)
      ) {
        oAttempts[instrId].questions[question.id].answers.push(choice);
      }
      if (
        !question.checks[choice] &&
        oAttempts[instrId].questions[question.id].answers.includes(choice)
      ) {
        oAttempts[instrId].questions[question.id].answers = oAttempts[
          instrId
        ].questions[question.id].answers.filter((answ) => answ !== choice);
      }
      if (
        (question.checks[choice] && !question.answers.includes(choice)) ||
        (!question.checks[choice] && question.answers.includes(choice))
      ) {
        wrong = true;
      }
    }
    let allCorrect = true;
    const qIdx = quests.findIndex((ques) => ques.id === question.id);
    if (wrong) {
      oAttempts[instrId].questions[question.id].wrongs += 1;
      oAttempts[instrId].wrongs += 1;
      allCorrect = false;
      wAttempts += 1;
      quests[qIdx].helperText =
        "Incorrect! Please rewatch the video and answer again. Please select all that apply.";
      quests[qIdx].error = true;
    } else {
      oAttempts[instrId].questions[question.id].corrects += 1;
      oAttempts[instrId].corrects += 1;
      cAttempts += 1;
      quests[qIdx].helperText = "You got it!";
      quests[qIdx].error = false;
    }
    if (allCorrect) {
      for (let ques of quests) {
        for (let choice in ques.checks) {
          if (
            (ques.checks[choice] && !ques.answers.includes(choice)) ||
            (!ques.checks[choice] && ques.answers.includes(choice))
          ) {
            allCorrect = false;
          }
        }
      }
    }
    setCorrectAttempts(cAttempts);
    setWrongAttempts(wAttempts);
    setAttempts(oAttempts);
    setQuestions(quests);
    let tutorialData = {
      attempts: oAttempts,
      corrects: cAttempts,
      wrongs: wAttempts,
      completed,
    };
    if (allCorrect) {
      // if (expanded < instructions.length - 1) {
      //   changeExpand(expanded + 1);
      // }
      if (completed < expanded) {
        tutorialData.completed = expanded;
        setCompleted(expanded);
        if (expanded === instructions.length - 2) {
          setTutorialEnded(true);
          tutorialData.ended = true;
        }
      }
    }
    if (fullname) {
      const tutorialRef = firebase.db.collection("tutorial").doc(fullname);
      const tutorialDoc = await tutorialRef.get();
      if (tutorialDoc.exists) {
        await tutorialRef.update(tutorialData);
      } else {
        await tutorialRef.set(tutorialData);
      }
      if (tutorialData.ended) {
        const userRef = firebase.db.collection("users").doc(fullname);
        await userRef.update({ tutorialEnded: true });
      }
    }
  };

  const changeExpand = async (
    newExpand,
    tutorialRef,
    tutorialDoc,
    oAttempts
  ) => {
    setExpanded(newExpand);
    if (Number.isInteger(newExpand)) {
      if (!tutorialRef) {
        tutorialRef = firebase.db.collection("tutorial").doc(fullname);
        tutorialDoc = await tutorialRef.get();
        oAttempts = { ...attempts };
      }
      oAttempts[instructions[newExpand].id].started =
        firebase.firestore.Timestamp.fromDate(new Date());
      setAttempts(oAttempts);
      if (tutorialDoc.exists) {
        await tutorialRef.update({ attempts: oAttempts });
      } else {
        await tutorialRef.set({
          attempts: oAttempts,
          corrects: correctAttempts,
          wrongs: wrongAttempts,
          completed,
        });
      }
      setTimeout(() => {
        let cumulativeHeight = 0;
        for (let sIdx = 0; sIdx < newExpand; sIdx++) {
          const sectOffsetHeight = window.document.getElementById(
            "Section" + sIdx
          ).scrollHeight;
          cumulativeHeight += sectOffsetHeight;
        }
        window.document.getElementById("ScrollableContainer").scroll({
          top: 100 + cumulativeHeight,
          left: 0,
          behavior: "smooth",
        });
      }, 400);
    }
  };

  const previousStep = (idx) => (event) => {
    if (idx > 0) {
      changeExpand(idx - 1);
    }
  };

  const nextStep = (idx) => (event) => {
    if (idx <= completed + 1 && idx < instructions.length - 1) {
      changeExpand(idx + 1);
    }
  };

  const handleChange = (idx) => (event, newExpanded) => {
    if (idx <= completed + 1) {
      changeExpand(newExpanded ? idx : false);
    }
  };

  return (
    <PagesNavbar>
      <Typography variant="h3" gutterBottom marked="center" align="center">
        1Cademy Tutorial
      </Typography>
      <Box sx={{ mb: "10px" }}>
        <Box>
          Welcome to the second step in the application process! Please go
          through this tutorial to learn more about 1Cademy and how it works.
          This tutorial takes on average an hour and a half. Please carefully
          read{" "}
          <a href="https://1cademy.us/home" target="_blank">
            the 1Cademy homepage
          </a>{" "}
          and watch the following videos before answering any of the questions,
          and <strong>select all the choices that apply</strong>.{" "}
        </Box>
        <Box sx={{ mt: "10px", fontStyle: "italic", fontSize: "19px" }}>
          The community leaders will decide about your application based on{" "}
          <strong>
            your total correct and wrong attempts. The fewer attempts, the
            better.
          </strong>
        </Box>
        <Box sx={{ mb: "19px" }}>
          <Box sx={{ display: "inline", color: "green", mr: "7px" }}>
            {correctAttempts} Correct
          </Box>
          &amp;
          <Box
            sx={{
              display: "inline",
              color: "red",
              ml: "7px",
              mr: "7px",
            }}
          >
            {wrongAttempts} Wrong
          </Box>
          attemps in all sections so far!
        </Box>
      </Box>
      {instructions.map((instr, idx) => (
        <Accordion
          key={instr.title}
          id={"Section" + idx}
          expanded={expanded === idx}
          onChange={handleChange(idx)}
          disabled={idx > completed + 1}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="TutorialSections-content"
            id="TutorialSections-header"
          >
            <Typography variant="h5" gutterBottom sx={{ fontWeight: "700" }}>
              {(idx > completed + 1
                ? "🔒 "
                : idx === completed + 1 && idx !== instructions.length - 1
                ? "🔓 "
                : "✅ ") +
                (idx + 1) +
                ". " +
                instr.title}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            {expanded === idx && (
              <Grid container spacing={1}>
                <Grid item xs={12} md={8}>
                  <Paper sx={{ padding: "10px", mb: "19px" }}>
                    <Typography
                      variant="body2"
                      component="div"
                      sx={{
                        pb: "19px",
                      }}
                    >
                      {instr.description}
                    </Typography>
                    {instr.video && <YoutubeEmbed embedId={instr.video} />}
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper sx={{ padding: "10px", mb: "19px" }}>
                    {idx === instructions.length - 1 && (
                      <Box sx={{ mb: "10px", fontWeight: 700 }}>
                        You had a total of {correctAttempts + wrongAttempts}{" "}
                        attemps in answering the questions.
                      </Box>
                    )}
                    {questions.map((question, qIdx) => {
                      return (
                        <form
                          key={qIdx}
                          onSubmit={handleSubmit(instr.id, question)}
                        >
                          <FormControl
                            error={question.error}
                            component="fieldset"
                            variant="standard"
                            sx={{ mb: "19px" }}
                          >
                            <FormLabel component="legend">
                              {/* {idx + 1 + "." + (qIdx + 1) + ". "} */}
                              {question.stem}
                            </FormLabel>
                            <FormGroup>
                              {Object.keys(question.choices).map(
                                (choice, cIdx) => {
                                  return (
                                    <FormControlLabel
                                      key={choice}
                                      control={
                                        <Checkbox
                                          checked={question.checks[cIdx]}
                                          onChange={checkChoice(qIdx)}
                                          name={choice}
                                        />
                                      }
                                      label={
                                        <span>
                                          {choice + ". "}
                                          {question.choices[choice]}
                                        </span>
                                      }
                                    />
                                  );
                                }
                              )}
                            </FormGroup>
                            <FormHelperText>
                              <span
                                style={{
                                  color: question.error ? "red" : "green",
                                }}
                              >
                                {question.helperText}
                              </span>
                            </FormHelperText>
                          </FormControl>
                          <Button
                            sx={{
                              display: "block",
                              margin: "-10px 0px 25px 0px",
                              color: "white",
                            }}
                            type="submit"
                            color="success"
                            variant="contained"
                          >
                            Submit Answer
                          </Button>
                        </form>
                      );
                    })}
                    {idx < instructions.length - 1 && (
                      <Box sx={{ mb: "10px" }}>
                        <Box
                          sx={{ display: "inline", color: "green", mr: "7px" }}
                        >
                          {instr.id in attempts && attempts[instr.id].corrects}{" "}
                          Correct
                        </Box>
                        &amp;
                        <Box
                          sx={{
                            display: "inline",
                            color: "red",
                            ml: "7px",
                            mr: "7px",
                          }}
                        >
                          {instr.id in attempts && attempts[instr.id].wrongs}{" "}
                          Wrong
                        </Box>
                        attemps in this section!
                      </Box>
                    )}
                  </Paper>
                  {idx > 0 && (
                    <Button
                      onClick={previousStep(idx)}
                      sx={{ mt: 1, mr: 1 }}
                      color="secondary"
                      variant="contained"
                    >
                      Previous Step
                    </Button>
                  )}
                  {idx < completed + 1 && idx < instructions.length - 1 && (
                    <Button
                      onClick={nextStep(idx)}
                      sx={{ float: "right", mt: 1, mr: 1, color: "white" }}
                      color="success"
                      variant="contained"
                    >
                      Next Step
                    </Button>
                  )}
                </Grid>
              </Grid>
            )}
          </AccordionDetails>
        </Accordion>
      ))}
      {completed === instructions.length - 2 && (
        <Fireworks options={options} style={style} />
      )}
    </PagesNavbar>
  );
};

export default Tutorial;
