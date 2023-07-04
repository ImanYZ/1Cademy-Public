import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { TextField, Typography } from "@mui/material";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import FormHelperText from "@mui/material/FormHelperText";
import FormLabel from "@mui/material/FormLabel";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Snackbar from "@mui/material/Snackbar";
import { collection, doc, getDoc, getFirestore, setDoc, Timestamp, updateDoc } from "firebase/firestore";
import { useRouter } from "next/router";
// import { Fireworks } from "@fireworks-js/dist/react";
import React, { useEffect, useState } from "react";

import YoutubeEmbed from "@/components/home/components/YoutubeEmbed";
import PagesNavbar from "@/components/PagesNavbar";
import tutoIntroQuestions from "@/components/tutoIntroQuestions";
import { useAuth } from "@/context/AuthContext";
import ROUTES from "@/lib/utils/routes";

const Tutorial = () => {
  const db = getFirestore();
  const [instructions, setInstructions] = useState<any>([]);
  const [questions, setQuestions] = useState<any>({});
  const [expanded, setExpanded] = useState<number>(0);
  const [completed, setCompleted] = useState(-1);
  //   const [fireworks, setFireworks] = useState(false);
  const [attempts, setAttempts] = useState({});
  const [correctAttempts, setCorrectAttempts] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [open, setOpen] = useState(false);
  const [{ user, isLoading }] = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.push(`${ROUTES.signIn}?from=${ROUTES.tutorial}`);
    }
  }, [isLoading, router, user]);

  useEffect(() => {
    const instrs: any = [];
    for (let instId in tutoIntroQuestions) {
      instrs.push({
        ...tutoIntroQuestions[instId],
        id: instId,
      });
    }
    setInstructions(instrs);
  }, []);
  useEffect(() => {
    const loadAttempts = async () => {
      if (!user?.uname) return;
      let oAttempts: any = {};
      const quests: any = {};
      const tutorialRef = doc(db, "tutorial", user?.uname);
      const tutorialDoc = await getDoc(tutorialRef);
      let tutorialData: any;
      if (tutorialDoc.exists()) {
        tutorialData = tutorialDoc.data();
        setCorrectAttempts(tutorialData.corrects);
        setWrongAttempts(tutorialData.wrongs);
        setCompleted(tutorialData.completed);
        oAttempts = tutorialData.attempts;
      }
      for (let instr in tutoIntroQuestions) {
        if (!(instr in oAttempts)) {
          oAttempts[instr] = {
            corrects: 0,
            wrongs: 0,
            questions: {},
          };
        } else if ("completed" in oAttempts[instr]) {
          delete oAttempts[instr].completed;
        }
        for (let ques in tutoIntroQuestions[instr].questions) {
          if (!(ques in oAttempts[instr].questions)) {
            oAttempts[instr].questions[ques] = {
              answers: [],
              corrects: 0,
              wrongs: 0,
            };
          }
          const quest = {
            ...tutoIntroQuestions[instr].questions[ques],
            id: ques,
            checks: {},
            error: false,
            helperText: " ",
          };
          if ("explanation" in oAttempts[instr].questions[ques] && oAttempts[instr].questions[ques].explanation) {
            quest.explanation = oAttempts[instr].questions[ques].explanation;
            if ("explaId" in oAttempts[instr].questions[ques] && oAttempts[instr].questions[ques].explaId) {
              quest.explaId = oAttempts[instr].questions[ques].explaId;
            }
          }
          if (oAttempts[instr].questions[ques].answers.length > 0) {
            let wrong = false;
            for (let choice in quest.choices) {
              if (oAttempts[instr].questions[ques].answers.includes(choice)) {
                quest.checks[choice] = true;
                if (!quest.answers.includes(choice)) {
                  wrong = true;
                }
              } else {
                quest.checks[choice] = false;
                if (quest.answers.includes(choice)) {
                  wrong = true;
                }
              }
            }
            if (wrong) {
              quest.helperText = "Incorrect! Please rewatch the video and answer again. Please select all that apply.";
              quest.error = true;
            } else {
              quest.helperText = "You got it!";
              quest.error = false;
            }
          } else {
            for (let choice in quest.choices) {
              quest.checks[choice] = false;
            }
          }
          if (instr in quests) {
            quests[instr].push(quest);
          } else {
            quests[instr] = [quest];
          }
        }
      }
      console.log({ quests });
      setQuestions(quests);
      if (tutorialDoc.exists()) {
        changeExpand(tutorialData.completed + 1, tutorialRef, tutorialDoc, oAttempts);
      } else {
        setAttempts(oAttempts);
      }
    };
    if (instructions.length > 0 && user?.uname) {
      loadAttempts();
    }
  }, [instructions, user?.uname]);

  //   useEffect(() => {
  //     if (completed !== -1 && completed === instructions.length - 2) {
  //       setFireworks(true);
  //       setTimeout(() => {
  //         setFireworks(false);
  //       }, 7000);
  //     }
  //   }, [instructions, completed]);

  const checkChoice = (instrId: any, qIdx: any) => (event: any) => {
    const quests = { ...questions };
    quests[instrId][qIdx].checks[event.target.name] = event.target.checked;
    quests[instrId][qIdx].error = false;
    quests[instrId][qIdx].helperText = " ";
    setQuestions(quests);
  };

  const openExplanation = (instrId: any, qIdx: any) => {
    const quests = { ...questions };
    quests[instrId][qIdx].explanationOpen = !quests[instrId][qIdx].explanationOpen;
    setQuestions(quests);
  };

  const changeExplanation = (instrId: any, qIdx: any) => (event: any) => {
    const quests = { ...questions };
    quests[instrId][qIdx].explanation = event.target.value;
    setQuestions(quests);
  };

  const handleSubmit = async (instrId: any, qIdx: any, event: any) => {
    try {
      event.preventDefault();
      if (expanded === null) return;
      const oAttempts: any = { ...attempts };
      const quests = { ...questions };
      const question = quests[instrId][qIdx];
      let cAttempts = correctAttempts;
      let wAttempts = wrongAttempts;
      let wrong = false;
      oAttempts[instrId].submitted = Timestamp.fromDate(new Date());
      if ("explanation" in question && question.explanation) {
        oAttempts[instrId].questions[question.id].explanation = question.explanation;
        if ("explaId" in question && question.explaId) {
          oAttempts[instrId].questions[question.id].explaId = question.explaId;
        }
      }
      for (let choice in question.checks) {
        if (question.checks[choice] && !oAttempts[instrId].questions[question.id].answers.includes(choice)) {
          oAttempts[instrId].questions[question.id].answers.push(choice);
        }
        if (!question.checks[choice] && oAttempts[instrId].questions[question.id].answers.includes(choice)) {
          oAttempts[instrId].questions[question.id].answers = oAttempts[instrId].questions[question.id].answers.filter(
            (answ: any) => answ !== choice
          );
        }
        if (
          (question.checks[choice] && !question.answers.includes(choice)) ||
          (!question.checks[choice] && question.answers.includes(choice))
        ) {
          wrong = true;
        }
      }
      let allCorrect = true;
      if (wrong) {
        oAttempts[instrId].questions[question.id].wrongs += 1;
        oAttempts[instrId].wrongs += 1;
        allCorrect = false;
        wAttempts += 1;
        question.helperText = "Incorrect! Please rewatch the video and answer again. Please select all that apply.";
        question.error = true;
      } else {
        oAttempts[instrId].questions[question.id].corrects += 1;
        oAttempts[instrId].corrects += 1;
        cAttempts += 1;
        question.helperText = "You got it!";
        question.error = false;
      }
      if (allCorrect) {
        for (let ques of quests[instrId]) {
          for (let choice in ques.checks) {
            if (
              (ques.checks[choice] && !ques.answers.includes(choice)) ||
              (!ques.checks[choice] && ques.answers.includes(choice))
            ) {
              allCorrect = false;
              break;
            }
          }
        }
      }
      setCorrectAttempts(cAttempts);
      setWrongAttempts(wAttempts);
      setAttempts(oAttempts);
      setQuestions(quests);
      let tutorialData: any = {
        attempts: oAttempts,
        corrects: cAttempts,
        wrongs: wAttempts,
        completed,
      };
      if (allCorrect) {
        if (completed < expanded) {
          tutorialData.completed = expanded;
          setCompleted(expanded);
          if (expanded === instructions.length - 2) {
            tutorialData.ended = true;
          }
        }
      }
      if (user?.uname) {
        const tutorialRef = doc(db, "tutorial", user?.uname);
        const tutorialDoc = await getDoc(tutorialRef);
        if ("explanation" in question && question.explanation) {
          let explaRef = doc(collection(db, "explanations"));
          let explaDoc;
          if ("explaId" in question && question.explaId) {
            explaRef = doc(db, "explanations", question.explaId);
            explaDoc = await getDoc(explaRef);
          } else {
            oAttempts[instrId].questions[question.id].explaId = explaRef.id;
            question.explaId = explaRef.id;
            tutorialData.attempts[instrId].questions[question.id].explaId = explaRef.id;
          }
          const explaData = {
            uname: user?.uname,
            instrId,
            qId: question.id,
            explanation: question.explanation,
          };
          if (explaDoc && explaDoc.exists()) {
            await updateDoc(explaRef, {
              ...explaData,
              updatedAt: Timestamp.fromDate(new Date()),
            });
          } else {
            await setDoc(explaRef, {
              ...explaData,
              createdAt: Timestamp.fromDate(new Date()),
            });
          }
          setSnackbarMessage("You successfully submitted your feedback about this question!");
        }
        if (tutorialDoc.exists()) {
          await updateDoc(tutorialRef, tutorialData);
        } else {
          await setDoc(tutorialRef, tutorialData);
        }
        if (tutorialData.ended) {
          const userRef = doc(db, "users", user?.uname);
          await updateDoc(userRef, { tutorialEnded: true });
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const submitExplanation = async (instrId: any, qIdx: any) => {
    try {
      if (expanded === null) return;
      const question = questions[instrId][qIdx];
      if (user?.uname && "explanation" in question && question.explanation) {
        const oAttempts: any = { ...attempts };
        oAttempts[instrId].submitted = Timestamp.fromDate(new Date());
        oAttempts[instrId].questions[question.id].explanation = question.explanation;
        if ("explaId" in question && question.explaId) {
          oAttempts[instrId].questions[question.id].explaId = question.explaId;
        }
        setAttempts(oAttempts);
        let tutorialData = {
          attempts: oAttempts,
        };
        const tutorialRef = doc(db, "tutorial", user?.uname);
        const tutorialDoc = await getDoc(tutorialRef);
        if ("explanation" in question && question.explanation) {
          let explaRef: any = doc(collection(db, "explanations"));
          let explaDoc;
          if ("explaId" in question && question.explaId) {
            explaRef = doc(db, "explanations", question.explaId);
            explaDoc = await getDoc(explaRef);
          } else {
            oAttempts[instrId].questions[question.id].explaId = explaRef.id;
            question.explaId = explaRef.id;
            tutorialData.attempts[instrId].questions[question.id].explaId = explaRef.id;
          }
          const explaData = {
            uname: user?.uname,
            instrId,
            qId: question.id,
            explanation: question.explanation,
          };
          if (explaDoc && explaDoc.exists()) {
            await updateDoc(explaRef, {
              ...explaData,
              updatedAt: Timestamp.fromDate(new Date()),
            });
          } else {
            await setDoc(explaRef, {
              ...explaData,
              createdAt: Timestamp.fromDate(new Date()),
            });
          }
          setSnackbarMessage("You successfully submitted your feedback about this question!");
        }
        if (tutorialDoc.exists()) {
          await updateDoc(tutorialRef, tutorialData);
        } else {
          await setDoc(tutorialRef, tutorialData);
        }
        openExplanation(instrId, qIdx);
      }
    } catch (error) {
      setSnackbarMessage("There was an issue submitting your feedback about this question. Please try again!");
      console.log(error);
    }
  };

  const changeExpand = async (newExpand: any, tutorialRef: any, tutorialDoc: any, oAttempts: any) => {
    setExpanded(newExpand);
    if (Number.isInteger(newExpand)) {
      if (!tutorialRef && user?.uname) {
        tutorialRef = doc(db, "tutorial", user?.uname);
        tutorialDoc = await getDoc(tutorialRef);
        oAttempts = { ...attempts };
      }
      if (!Object.keys(oAttempts).length) return;
      oAttempts[instructions[newExpand].id].started = Timestamp.fromDate(new Date());
      setAttempts(oAttempts);
      if (tutorialDoc.exists) {
        await updateDoc(tutorialRef, { attempts: oAttempts });
      } else {
        await setDoc(tutorialRef, {
          attempts: oAttempts,
          corrects: correctAttempts,
          wrongs: wrongAttempts,
          completed,
        });
      }
      let cumulativeHeight: any = window?.document?.getElementById("TutorialHeader")?.scrollHeight;
      for (let sIdx = 0; sIdx < newExpand; sIdx++) {
        const sectOffsetHeight: any = window?.document?.getElementById("Section" + sIdx)?.scrollHeight;
        cumulativeHeight += sectOffsetHeight;
      }
      window.document.getElementById("ScrollableContainer")?.scroll({
        top: cumulativeHeight + 40,
        left: 0,
        behavior: "smooth",
      });
    }
  };

  const previousStep = (idx: any) => {
    if (idx > 0) {
      changeExpand(idx - 1, null, null, attempts);
    }
  };

  const nextStep = (idx: any) => {
    if (idx <= completed + 1 && idx < instructions.length - 1) {
      changeExpand(idx + 1, null, null, attempts);
    }
  };

  const handleChange = (idx: any) => (newExpanded: any) => {
    if (idx <= completed + 1) {
      changeExpand(newExpanded ? idx : null, null, null, attempts);
    }
  };
  useEffect(() => {
    if (snackbarMessage) {
      setOpen(true);
      setTimeout(() => {
        setOpen(false);
        setSnackbarMessage("");
      }, 3000);
    }
  }, [snackbarMessage]);
  const close = (event: any, reason: any) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  return (
    <>
      <PagesNavbar title={`1Cademy`} enableMenu={false}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography
            variant="h1"
            gutterBottom
            align="center"
            sx={{
              borderBottom: "6px solid orange",
              paddingBottom: "8px",
              width: "fit-content",
              margin: "0 auto",
              mb: "20px",
            }}
          >
            1Cademy Tutorial
          </Typography>
          <Paper
            sx={{
              position: "fixed",
              width: "340px",
              left: "calc(49vw - 169px)",
              top: "0px",
              padding: "10px",
              textAlign: "center",
              zIndex: 1300,
            }}
          >
            <Box sx={{ mt: "4px", fontWeight: "bold" }}>The fewer wrong attempts, the better.</Box>
            <Box>
              <Box
                sx={{
                  display: "inline",
                  color: "red",
                  fontWeight: 700,
                  ml: "7px",
                  mr: "7px",
                }}
              >
                {wrongAttempts} Wrong
              </Box>
              attemps so far!
            </Box>
          </Paper>
        </Box>
        {instructions.map((instr: any, idx: any) => (
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
                  : "✅ ") + instr.title}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {expanded === idx && (
                <Grid container spacing={1}>
                  <Grid item xs={12} md={8}>
                    <Paper
                      sx={{
                        padding: "10px",
                        mb: "19px",
                        maxHeight: { sx: "none", md: "calc(100vh - 160px)" },
                        overflowY: { sx: "hidden", md: "auto" },
                      }}
                    >
                      {instr.description && (
                        <Alert severity="warning">
                          <Typography
                            variant="body2"
                            component="div"
                            sx={{
                              fontSize: "19px",
                            }}
                          >
                            {instr.description}
                          </Typography>
                        </Alert>
                      )}
                      {instr.video && (
                        <Box style={{ width: "90%", margin: "0 auto" }}>
                          <YoutubeEmbed embedId={instr.video} />
                        </Box>
                      )}
                      <Typography
                        variant="body2"
                        component="div"
                        sx={{
                          fontSize: "19px",
                        }}
                      >
                        {instr.stem}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper
                      sx={{
                        padding: "10px",
                        mb: "19px",
                        maxHeight: { sx: "none", md: "calc(100vh - 160px)" },
                        overflowY: { sx: "hidden", md: "auto" },
                      }}
                    >
                      {idx === instructions.length - 1 && (
                        <Box sx={{ mb: "10px", fontWeight: 700 }}>
                          You had a total of {wrongAttempts} wrong attemps in answering the questions.
                        </Box>
                      )}
                      {questions.hasOwnProperty(instr.id) &&
                        questions[instr.id].map((question: any, qIdx: any) => {
                          return (
                            <>
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
                                  {Object.keys(question.choices).map((choice, cIdx) => {
                                    return (
                                      <FormControlLabel
                                        key={cIdx}
                                        sx={{
                                          "&:hover": {
                                            bgcolor: "rgba(100, 100, 100, 0.1) !important",
                                          },
                                        }}
                                        control={
                                          <Checkbox
                                            checked={question.checks[choice]}
                                            onChange={checkChoice(instr.id, qIdx)}
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
                                  })}
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
                              <Box
                                sx={{
                                  display: "grid",
                                  gridTemplateColumns: "repeat(2, 1fr)",
                                  width: "100%",
                                  margin: "-10px 0px 10px 0px",
                                }}
                              >
                                <Button
                                  sx={{
                                    margin: "0px 7px 10px 7px",
                                    color: "common.white",
                                  }}
                                  type="submit"
                                  color="success"
                                  variant="contained"
                                  disabled={
                                    Object.values(question.checks).findIndex(chec => chec) === -1 ||
                                    question.helperText === "You got it!"
                                  }
                                  onClick={event => handleSubmit(instr.id, qIdx, event)}
                                >
                                  Submit Answer
                                </Button>
                                <Button
                                  onClick={() => openExplanation(instr.id, qIdx)}
                                  sx={{
                                    margin: "0px 7px 10px 7px",
                                    color: "common.white",
                                  }}
                                  color="warning"
                                  variant="contained"
                                >
                                  Report Difficulty
                                </Button>
                              </Box>
                              {question.explanationOpen && (
                                <Box>
                                  <TextField
                                    label="Report Difficulty"
                                    variant="outlined"
                                    value={question.explanation}
                                    onChange={changeExplanation(instr.id, qIdx)}
                                    fullWidth
                                    multiline
                                    rows={3}
                                    sx={{ width: "95%", m: 0.5 }}
                                    placeholder={
                                      "If you're experiencing difficulties with this question, please explain why and which options are confusing."
                                    }
                                  />

                                  <Button
                                    sx={{
                                      display: "block",
                                      margin: "10px 0px 25px 0px",
                                      color: "common.white",
                                    }}
                                    onClick={() => submitExplanation(instr.id, qIdx)}
                                    color="success"
                                    variant="contained"
                                  >
                                    Submit Explanation
                                  </Button>
                                </Box>
                              )}
                            </>
                          );
                        })}
                    </Paper>
                    {idx > 0 && (
                      <Button
                        onClick={() => previousStep(idx)}
                        sx={{ mt: 1, mr: 1, color: "common.white" }}
                        color="secondary"
                        variant="contained"
                      >
                        Previous Step
                      </Button>
                    )}
                    {idx < completed + 1 && idx < instructions.length - 1 && (
                      <Button
                        onClick={() => nextStep(idx)}
                        sx={{
                          float: "right",
                          mt: 1,
                          mr: 1,
                          color: "common.white",
                        }}
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
        {/* {fireworks && (
          <Fireworks
            options={{
              speed: 3,
            }}
            style={{
              left: "25%",
              bottom: 0,
              width: "49%",
              height: "49%",
              position: "fixed",
            }}
          />
        )} */}
      </PagesNavbar>

      <Snackbar open={open} autoHideDuration={4000} onClose={close} message={snackbarMessage} />
    </>
  );
};
export default React.memo(Tutorial);
