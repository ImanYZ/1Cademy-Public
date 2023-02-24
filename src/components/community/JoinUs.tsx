import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Step from "@mui/material/Step";
import StepContent from "@mui/material/StepContent";
import StepLabel from "@mui/material/StepLabel";
import Stepper from "@mui/material/Stepper";
import TextareaAutosize from "@mui/material/TextareaAutosize";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import React, { useEffect, useState } from "react";

import { gray200, gray600, gray700, gray900, orangeDark, orangeLight } from "@/pages/home";

import Button from "../home/components/Button";
import UploadButton from "./UploadButton";
type JoinUsProps = {
  themeName: string;
  community: any;
};

const JoinUs = (props: JoinUsProps) => {
  const { themeName } = props || {};
  const [hasScheduled, setHasScheduled] = useState(false);
  const [completedExperiment, setCompletedExperiment] = useState(false);
  const [communiTestsEnded, setCommuniTestsEnded] = useState<any>({});
  const [resumeUrl, setResumeUrl] = useState("");
  const [transcriptUrl, setTranscriptUrl] = useState("");
  const [applicationsSubmitted, setApplicationsSubmitted] = useState<any>({});
  const [activeStep, setActiveStep] = useState(0);
  const [checkedInnerStep, setCheckedInnerStep] = useState(0);
  const [activeInnerStep, setActiveInnerStep] = useState(0);
  const [explanation, setExplanation] = useState("");
  const [courseraUrl, setCourseraUrl] = useState("");
  const [courseraUrlError, setCourseraUrlError] = useState(false);
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [portfolioUrlError, setPortfolioUrlError] = useState(false);
  const [fullname, setFullname] = useState("");
  const [needsUpdate, setNeedsUpdate] = useState(true);
  const [applicationProcess, setApplicationProcess] = useState<any>({});
  const [uploadError, setUploadError] = useState(false);

  useEffect(() => {
    if (!needsUpdate) return;
    let childWindo: any = document.getElementById("1cademy.usIframe");
    const childWindow = childWindo?.contentWindow;
    console.log("childWindow :: :: ", childWindow);
    childWindow.postMessage({ communityId: props.community.id }, "*");
    setNeedsUpdate(false);
  }, [needsUpdate]);

  const applyButton = () => {
    window.open("https://1cademy.us/Activities/experiment", "popup");
  };
  useEffect(() => {
    const childResponse = (event: any) => {
      console.log("event", event.origin);
      if (!(event.origin === "https://1cademy.us")) return;
      console.log("event", event?.data);
      if (event?.data) {
        const {
          completedExperiment,
          applicationsSubmitted,
          hasScheduled,
          resumeUrl,
          transcriptUrl,
          fullname,
          applicationProcess,
          uploadError,
        } = event.data;
        setCompletedExperiment(completedExperiment);
        setApplicationsSubmitted(applicationsSubmitted);
        setHasScheduled(hasScheduled);
        setResumeUrl(resumeUrl);
        setTranscriptUrl(transcriptUrl);
        setFullname(fullname);
        setApplicationProcess(applicationProcess);
        setNeedsUpdate(true);
        setUploadError(uploadError);
      }
    };
    window.addEventListener("message", childResponse);
    return () => {
      window.removeEventListener("message", childResponse);
    };
  }, []);

  useEffect(() => {
    if (
      applicationsSubmitted &&
      Object.keys(applicationsSubmitted).length > 0 &&
      "community" in props &&
      props.community &&
      props.community.id &&
      applicationsSubmitted[props.community.id]
    ) {
      setActiveStep(3);
    } else if (completedExperiment) {
      setActiveStep(2);
    } else if (hasScheduled) {
      setActiveStep(1);
    } else {
      setActiveStep(0);
    }
  }, [hasScheduled, completedExperiment, applicationsSubmitted, props.community, props]);

  const isValidHttpUrl = (string: string) => {
    let url;
    try {
      url = new URL(string);
      if (string.includes(" ")) {
        return false;
      }
    } catch (_) {
      return false;
    }
    return url.protocol === "http:" || url.protocol === "https:";
  };

  useEffect(() => {
    if (needsUpdate) {
      if (!props.community) return;
      let stepsIdx = 0;
      const commTestEnded = props.community.id in communiTestsEnded && communiTestsEnded[props.community.id];
      if (applicationProcess["courseraUrl"] && applicationProcess["portfolioUrl"] && commTestEnded) {
        stepsIdx = 6;
      } else if (
        (applicationProcess["courseraUrl"] && applicationProcess["portfolioUrl"]) ||
        (applicationProcess["courseraUrl"] && commTestEnded) ||
        (applicationProcess["portfolioUrl"] && commTestEnded)
      ) {
        stepsIdx = 5;
      } else if (applicationProcess["courseraUrl"] || commTestEnded || applicationProcess["portfolioUrl"]) {
        stepsIdx = 4;
      } else if (applicationProcess["explanation"]) {
        stepsIdx = 3;
      } else if (transcriptUrl) {
        stepsIdx = 2;
      } else if (resumeUrl) {
        stepsIdx = 1;
      }
      setCheckedInnerStep(stepsIdx);
      setActiveInnerStep(stepsIdx);
      setNeedsUpdate(false);
    }
  }, [needsUpdate, applicationProcess]);

  useEffect(() => {
    let childWindo: any = document.getElementById("1cademy.usIframe");
    const childWindow = childWindo?.contentWindow;
    childWindow.postMessage(
      { communityId: props.community.id, function: "applications" },
      "https://1cademy.us/JoinUsIframe"
    );
  }, [activeStep]);

  useEffect(() => {
    const loadExistingApplication = async () => {
      if (!props.community) return;
      if (!applicationProcess) {
        setCommuniTestsEnded((oldObj: any) => {
          return {
            ...oldObj,
            [props.community.id]: false,
          };
        });
        setExplanation("");
        setCourseraUrl("");
        setPortfolioUrl("");
      } else {
        if ("explanation" in applicationProcess && applicationProcess.explanation) {
          setExplanation(applicationProcess["explanation"]);
          setNeedsUpdate(true);
        } else {
          setExplanation("");
        }
        if ("courseraUrl" in applicationProcess && applicationProcess.courseraUrl) {
          setCourseraUrl(applicationProcess["courseraUrl"]);
        } else {
          setCourseraUrl("");
        }
        if ("portfolioUrl" in applicationProcess && applicationProcess.portfolioUrl) {
          setPortfolioUrl(applicationProcess["portfolioUrl"]);
        } else {
          setPortfolioUrl("");
        }
        if ("ended" in applicationProcess && applicationProcess.ended) {
          setCommuniTestsEnded((oldObj: any) => {
            return {
              ...oldObj,
              [props.community.id]: true,
            };
          });
        } else {
          setCommuniTestsEnded((oldObj: any) => {
            return {
              ...oldObj,
              [props.community.id]: false,
            };
          });
        }
      }
    };

    if (applicationProcess) {
      loadExistingApplication();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationProcess]);

  const changeExplanation = (event: any) => {
    setExplanation(event.target.value);
  };

  const changeCourseraUrl = (event: any) => {
    setCourseraUrl(event.target.value);
    if (!isValidHttpUrl(event.target.value) || !event.target.value.startsWith("https://coursera.org/share/")) {
      setCourseraUrlError(true);
    } else {
      setCourseraUrlError(false);
    }
  };

  const changePortfolioUrl = (event: any) => {
    setPortfolioUrl(event.target.value);
    if (!isValidHttpUrl(event.target.value)) {
      setPortfolioUrlError(true);
    } else {
      setPortfolioUrlError(false);
    }
  };

  const submitExplanation = async () => {
    if (explanation) {
      let childWindo: any = document.getElementById("1cademy.usIframe");
      childWindo.contentWindow.postMessage(
        { fullname, communityId: props.community.id, explanation, function: "explanation" },
        "https://1cademy.us/"
      );
    }
  };

  const submitCourseraUrl = async () => {
    if (courseraUrl && !courseraUrlError) {
      let childWindo: any = document.getElementById("1cademy.usIframe");
      childWindo.contentWindow.postMessage(
        { communityId: props.community.id, courseraUrl, function: "courseraUrl" },
        "https://1cademy.us/"
      );
      if (!props.community.portfolio && !props.community.hasTest) {
        setApplicationsSubmitted((oldApplicatonsSubmitted: any) => {
          return { ...oldApplicatonsSubmitted, [props.community.id]: true };
        });
      }
      setNeedsUpdate(true);
    }
  };

  const submitPortfolioUrl = async () => {
    if (portfolioUrl && !portfolioUrlError) {
      let childWindo: any = document.getElementById("1cademy.usIframe");
      childWindo.contentWindow.postMessage(
        { communityId: props.community.id, portfolioUrl, function: "portfolioUrl" },
        "https://1cademy.us/"
      );
      if (!props.community.hasTest) {
        setApplicationsSubmitted((oldApplicatonsSubmitted: any) => {
          return { ...oldApplicatonsSubmitted, [props.community.id]: true };
        });
      }
      setNeedsUpdate(true);
    }
  };

  const changeInnerStep = (newStep: number) => () => {
    if (newStep <= checkedInnerStep) {
      setActiveInnerStep(newStep);
    }
  };

  return (
    <Box
      id="JoinUsSection"
      component="section"
      sx={{
        scrollMarginTop: "80px",

        p: 0,
        m: 0,
      }}
    >
      <Alert severity="success" sx={{ p: "24px 20px", mb: "16px", borderRadius: "12px", color: gray700 }}>
        <strong style={{ color: gray900 }}>Please note: </strong>
        <br />
        Our application process is sequential; i.e., you need to complete each step to unlock the following steps.
      </Alert>
      {props.community && (
        <Alert severity="warning" sx={{ p: "24px 20px", borderRadius: "12px", color: gray700 }}>
          <strong style={{ color: gray900 }}>Please note: </strong>
          <br />
          Participation is unpaid, solely for the purpose of improving research and education, and this position meets{" "}
          <a href="https://www.dol.gov/whd/regs/compliance/whdfs71.htm" target="_blank" rel="noreferrer">
            US Department of Labor Federal Internship Guidelines
          </a>
          . We DO NOT sponsor CPT or OPT for international students. If you have any questions regarding this community,
          contact{" "}
          <a
            href={"mailto:onecademy@umich.edu?subject=" + props.community.title + " - Question"}
            aria-label="email"
            target="_blank"
            rel="noreferrer"
          >
            the community leaders
          </a>
          .
        </Alert>
      )}

      <Stepper
        activeStep={activeStep}
        orientation="vertical"
        sx={{
          mt: "19px",
          "& .MuiStepIcon-root": {
            color: "warning.dark",
          },
          "& .MuiStepIcon-root.Mui-active": {
            color: orangeDark,
          },
          "& .MuiStepIcon-root.Mui-completed": {
            color: "success.main",
          },
          "& .MuiStepLabel-label": {
            fontSize: "20px",
            fontWeight: 600,
            color: gray600,
          },

          "& .MuiStepLabel-label.Mui-active": {
            fontWeight: 600,
            color: gray200,
          },
          "& .MuiStepLabel-label.Mui-completed": {
            fontWeight: 600,
            color: gray200,
          },
          "& .MuiButton-root": {
            backgroundColor: orangeDark,
          },
          "& .MuiButton-root:hover": {
            backgroundColor: orangeLight,
          },
          "& .MuiButton-root.Mui-disabled": {
            backgroundColor: "secondary.light",
          },
        }}
      >
        <Step>
          <iframe id="1cademy.usIframe" src="https://1cademy.us/JoinUsIframe" style={{ display: "none" }} />
          <StepLabel>Create an account and Schedule for our knowledge representation test.</StepLabel>
          <StepContent>
            <Typography
              sx={{
                color: gray200,
                lineHeight: "24px",
              }}
            >
              One of the most important aspects of 1Cademy is its unique knowledge representation format. To become a
              researcher on 1Cademy, you should first engage in one of our ongoing research projects, as a participant.
              In the project, randomly chosen for you, we will test which type of knowledge representation format works
              better for your reading comprehension, short-term learning, and long-term learning. This will not only
              help us improve the design of 1Cademy, but along the way, you will get experience about how to use
              1Cademy. For this purpose, you should create an account on our research website and specify your
              availabilities for three sessions with our UX researchers. In the first session, they will ask you to read
              two short passages and answer some questions about those passages. This will take an hour. The second and
              third sessions will be only for 30 minutes each and follow a similar format. Note that it is necessary to
              complete the second and third sessions, exactly three and seven days after the first session. So, please
              carefully specify your availability on our research website.
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                component="a"
                onClick={applyButton}
                target="_blank"
                sx={{
                  p: "10px 36px",
                  color: "common.white",
                  borderRadius: "8px",
                  fontSize: "18px",
                  textTransform: "none",
                }}
              >
                Apply to join
              </Button>
            </Box>
          </StepContent>
        </Step>
        <Step>
          <StepLabel>Complete our knowledge representation test.</StepLabel>
          <StepContent>
            <Typography
              sx={{
                color: themeName === "dark" ? "common.white" : undefined,
              }}
            >
              Please check your Google Calendar. You're invited to three UX Experiment sessions. Please attend all the
              experiment sessions on-time and carefully answer the questions. Your answers will significantly help
              1Cademy communities to improve our collaborative learning and research. Note that your test scores may
              affect our community leaders' decision in whether to accept your application.
            </Typography>
          </StepContent>
        </Step>
        <Step>
          <StepLabel>Complete the community-specific application requirements.</StepLabel>
          <StepContent>
            {props.community ? (
              <Stepper
                activeStep={activeInnerStep}
                orientation="vertical"
                sx={{
                  mt: "19px",
                  "& .MuiStepIcon-root": {
                    color: "warning.dark",
                  },
                  "& .MuiStepIcon-root.Mui-active": {
                    color: "secondary.main",
                  },
                  "& .MuiStepIcon-root.Mui-completed": {
                    color: "success.main",
                  },
                  "& .MuiButton-root": {
                    backgroundColor: "secondary.main",
                  },
                  "& .MuiButton-root:hover": {
                    backgroundColor: "secondary.dark",
                  },
                  "& .MuiButton-root.Mui-disabled": {
                    backgroundColor: "secondary.light",
                  },
                }}
              >
                <Step>
                  <StepLabel
                    onClick={changeInnerStep(0)}
                    sx={
                      0 <= checkedInnerStep
                        ? {
                            cursor: "pointer",
                            "&:hover": {
                              backgroundColor: "rgba(100, 100, 100, 0.1) !important",
                            },
                          }
                        : {}
                    }
                  >
                    Upload your CV/Résumé in PDF format.
                  </StepLabel>
                  <StepContent>
                    <UploadButton
                      name="Resume"
                      communiId={props.community.id}
                      mimeTypes={["application/pdf"]} // Alternatively "image/png, image/gif, image/jpeg"
                      typeErrorMessage="We only accept a file with PDF format. Please upload another file."
                      sizeErrorMessage="We only accept file sizes less than 10MB. Please upload another file."
                      maxSize={10}
                      storageBucket="visualexp-a7d2c"
                      storageFolder="Resumes/"
                      nameFeild="Resume"
                      fileUrl={resumeUrl}
                      setResumeUrl={setResumeUrl}
                      fullname={fullname}
                      setNeedsUpdate={setNeedsUpdate}
                      needsUpdate={needsUpdate}
                      uploadError={uploadError}
                    />
                  </StepContent>
                </Step>
                <Step>
                  <StepLabel
                    onClick={changeInnerStep(1)}
                    sx={
                      1 <= checkedInnerStep
                        ? {
                            cursor: "pointer",
                            "&:hover": {
                              backgroundColor: "rgba(100, 100, 100, 0.1) !important",
                            },
                          }
                        : {}
                    }
                  >
                    Upload your most recent unofficial transcript in PDF format.
                  </StepLabel>
                  <StepContent>
                    <UploadButton
                      name="Transcript"
                      communiId={props.community.id}
                      mimeTypes={["application/pdf"]}
                      typeErrorMessage="We only accept a file with PDF format. Please upload another file."
                      sizeErrorMessage="We only accept file sizes less than 10MB. Please upload another file."
                      maxSize={10}
                      storageBucket="visualexp-a7d2c"
                      storageFolder="Transcripts/"
                      nameFeild="Transcript"
                      fileUrl={transcriptUrl}
                      setTranscriptUrl={setTranscriptUrl}
                      fullname={fullname}
                      setNeedsUpdate={setNeedsUpdate}
                      needsUpdate={needsUpdate}
                      uploadError={uploadError}
                    />
                  </StepContent>
                </Step>
                <Step>
                  <StepLabel
                    onClick={changeInnerStep(2)}
                    sx={
                      2 <= checkedInnerStep
                        ? {
                            cursor: "pointer",
                            "&:hover": {
                              backgroundColor: "rgba(100, 100, 100, 0.1) !important",
                            },
                          }
                        : {}
                    }
                  >
                    Explain why you are applying to join the {props.community.title} community.
                  </StepLabel>
                  <StepContent>
                    <TextareaAutosize
                      style={{ width: "90%", borderRadius: "6px", fontFamily: "Times New Roman", fontSize: "19px" }}
                      aria-label="explanation text box"
                      minRows={7}
                      placeholder={
                        "Type one or a few paragraph(s) explaining why you are applying to join the " +
                        props.community.title +
                        " community."
                      }
                      onChange={changeExplanation}
                      value={explanation}
                    />
                    <Button
                      style={{
                        display: "block",
                        margin: "10px 10px 25px 10px",
                        color: "white",
                        backgroundColor: orangeDark,
                      }}
                      onClick={submitExplanation}
                      color="success"
                      variant="contained"
                    >
                      Submit Explanation
                    </Button>
                  </StepContent>
                </Step>
                {props.community.coursera && (
                  <Step>
                    <StepLabel
                      onClick={changeInnerStep(3)}
                      sx={
                        3 <= checkedInnerStep
                          ? {
                              cursor: "pointer",
                              "&:hover": {
                                backgroundColor: "rgba(100, 100, 100, 0.1) !important",
                              },
                            }
                          : {}
                      }
                    >
                      Complete{" "}
                      <a href={props.community.coursera} target="_blank" rel="noreferrer">
                        this Coursera MOOC
                      </a>
                      and enter the certificate URL.
                    </StepLabel>
                    <StepContent>
                      <Typography
                        sx={{
                          color: themeName === "dark" ? "common.white" : undefined,
                        }}
                      >
                        As a requirement to apply to this community, you should complete{" "}
                        <a href={props.community.coursera} target="_blank" rel="noreferrer">
                          this Coursera MOOC
                        </a>
                        . Please enter the webpage address (URL) of your Coursera MOOC certificate in the textbox below.
                        You can find this URL by following the following steps:
                        <ol>
                          <li>
                            Complete{" "}
                            <a href={props.community.coursera} target="_blank" rel="noreferrer">
                              this Coursera MOOC
                            </a>
                            .
                          </li>
                          <li>Log in to Coursera and click your name in the top-right corner.</li>
                          <li>In the drop-down menu, click "Accomplishments."</li>
                          <li>In "My Courses" list, click the corresponding course.</li>
                          <li>
                            In the page that opens, you should be able to see the image of your certificate, otherwise,
                            you can contact Coursera customer service to give you guidance on where to find your
                            certificate.
                          </li>
                          <li>Click the "Share Certificate" button.</li>
                          <li>Click "copy."</li>
                          <li>Paste the copied URL in the textbox below.</li>
                          <li>Click "Submit Certificate URL."</li>
                        </ol>
                      </Typography>
                      <TextField
                        style={{ width: "100%" }}
                        error={courseraUrlError}
                        aria-label="Coursera Certificate URL text box"
                        label="Paste Your Coursera MOOC Certificate URL"
                        variant="outlined"
                        helperText={courseraUrlError ? "Invalid Coursera MOOC Certificate URL!" : undefined}
                        onChange={changeCourseraUrl}
                        value={courseraUrl}
                      />
                      <Button
                        style={{
                          display: "block",
                          margin: "10px 0px 25px 0px",
                          color: "white",
                          backgroundColor: orangeDark,
                        }}
                        onClick={submitCourseraUrl}
                        color="success"
                        variant="contained"
                      >
                        Submit Certificate URL
                      </Button>
                    </StepContent>
                  </Step>
                )}
                {props.community.portfolio && (
                  <Step>
                    <StepLabel
                      onClick={changeInnerStep(3)}
                      sx={
                        3 <= checkedInnerStep
                          ? {
                              cursor: "pointer",
                              "&:hover": {
                                backgroundColor: "rgba(100, 100, 100, 0.1) !important",
                              },
                            }
                          : {}
                      }
                    >
                      Enter your online portfolio URL.
                    </StepLabel>
                    <StepContent>
                      <TextField
                        style={{ width: "100%" }}
                        error={portfolioUrlError}
                        aria-label="Online portfolio URL text box"
                        label="Enter Your Online Portfolio URL"
                        variant="outlined"
                        helperText={portfolioUrlError ? "Invalid online portfolio URL!" : undefined}
                        onChange={changePortfolioUrl}
                        value={portfolioUrl}
                      />
                      <Button
                        style={{
                          display: "block",
                          margin: "10px 0px 25px 0px",
                          color: "white",
                          backgroundColor: orangeDark,
                        }}
                        onClick={submitPortfolioUrl}
                        color="success"
                        variant="contained"
                      >
                        Submit Portfolio URL
                      </Button>
                    </StepContent>
                  </Step>
                )}
                {props.community.hasTest && (
                  <Step>
                    <StepLabel
                      onClick={changeInnerStep(3)}
                      sx={
                        3 <= checkedInnerStep
                          ? {
                              cursor: "pointer",
                              "&:hover": {
                                backgroundColor: "rgba(100, 100, 100, 0.1) !important",
                              },
                            }
                          : {}
                      }
                    >
                      Complete your domain-specific knowledge test.
                    </StepLabel>
                    <StepContent>
                      <Typography
                        sx={{
                          color: themeName === "dark" ? "common.white" : undefined,
                        }}
                      >
                        The last step to apply to this community is a test of your domain-specific knowledge. If you are
                        interested in joining this community but don't have the background knowledge, no worries.
                        Similar to the second phase, we have provided you with a document about the topic and ask you
                        only questions from that document. Just make sure you carefully read the document and choose the
                        most appropriate answers for each question. The community leaders will evaluate your application
                        based on your number of WRONG attempts in answering the questions. Click the button to start the
                        community-specific test.
                      </Typography>
                      <Button
                        variant="contained"
                        component="a"
                        href={"https://1cademy.us/paperTest/" + props.community.id}
                        target="_blank"
                        style={{ mt: 1, mr: 1, color: "white", backgroundColor: orangeDark }}
                      >
                        Start the Test
                      </Button>
                    </StepContent>
                  </Step>
                )}
              </Stepper>
            ) : (
              <>
                <Typography sx={{ color: "#f8f8f8" }}>
                  Choose one of our communities and complete its application requirements. These requirements may differ
                  from community to community. Click the following button to jump to our list of communities. Then, you
                  can find more information about each community and their requirements by clicking the corresponding
                  community section.
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <div>
                    <Button
                      variant="contained"
                      component="a"
                      href="/communities"
                      target="_blank"
                      style={{ mt: 1, mr: 1, color: "white", backgroundColor: orangeDark }}
                    >
                      Explore our communities &amp; their requirements
                    </Button>
                  </div>
                </Box>
                <Typography sx={{ color: "#f8f8f8" }}>
                  Meanwhile, you can go through the 1Cademy tutorial by clicking the following button:
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <div>
                    <Button
                      variant="contained"
                      component="a"
                      href="/tutorial"
                      target="_blank"
                      style={{ mt: 1, mr: 1, color: "white", backgroundColor: orangeDark }}
                    >
                      1Cademy Tutorial
                    </Button>
                  </div>
                </Box>
              </>
            )}
          </StepContent>
        </Step>
      </Stepper>
      {activeStep === 3 && (
        <Paper square elevation={0} sx={{ p: 3 }}>
          <Typography>
            All steps completed. After reviewing your application, our community leaders will email you regarding their
            decision.
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default JoinUs;
