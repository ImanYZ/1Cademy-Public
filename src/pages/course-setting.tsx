import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import CreateIcon from "@mui/icons-material/Create";
import DeleteIcon from "@mui/icons-material/Delete";
import IndeterminateCheckBoxOutlinedIcon from "@mui/icons-material/IndeterminateCheckBoxOutlined";
import SaveIcon from "@mui/icons-material/Save";
import StarIcon from "@mui/icons-material/Star";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  FilledInput,
  Grid,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { Box,ThemeProvider } from "@mui/system";
import dynamic from "next/dynamic";
import React, { ComponentType, ReactNode, useEffect, useState } from "react";

import PublicLayout from "../components/layouts/PublicLayout";
import { NextPageWithLayout } from "../knowledgeTypes";
import { brandingLightTheme } from "../lib/theme/brandingTheme";

export const PagesNavbar: ComponentType<any> = dynamic(() => import("@/components/PagesNavbar").then(m => m.default), {
  ssr: false,
});

export const SortByFilters: ComponentType<any> = dynamic(
  () => import("@/components/SortByFilters").then(m => m.default),
  {
    ssr: false,
  }
);

const HomePage: NextPageWithLayout = () => {
  const [chapters, setChapters] = useState<any>([]);
  const [expanded, setExpanded] = React.useState<string | false>("panel1");
  const [newChapter, setNewChapter] = useState<boolean>(false);
  const [newSubChapter, setNewSubChapter] = useState<boolean>(false);
  const [newChapterText, setNewChapterText] = useState<string>("");
  const [newChapterEditText, setNewChapterEditText] = useState<string>("");

  //const [newSubChapterText, setNewSubChapterText] = useState<string>("");

  // const [inputField, setInputField] = useState<any>({
  //   node_proposal_from: "",
  //   node_proposal_to: "",
  //   node_proposal_points: "",
  //   node_proposal_propose_per_day: "",
  //   node_proposal_days: "",
  //   question_proposal_from: "",
  //   question_proposal_to: "",
  //   question_proposal_points: "",
  //   question_proposal_propose_per_day: "",
  //   question_proposal_days: "",
  // });

  const handleChange = (panel: string) => (event: React.SyntheticEvent, newExpanded: boolean) => {
    setExpanded(newExpanded ? panel : false);
  };

  const handleChapterChange = (event: any) => {
    setNewChapterText(event.target.value);
  };

  const handleEditChapterChange = (event: any) => {
    setNewChapterEditText(event.target.value);
  };

  const handleSubChapterChange = (event: any) => {
    setNewSubChapterText(event.target.value);
  };

  // const inputsHandler = (e: any) => {
  //   setInputField({ [e.target.name]: e.target.value });
  // };

  const createNewChapter = () => {
    console.log(newChapterText, "newChapterText");
  };

  const editChapter = (event: any, chapter: any) => {
    event.stopPropagation();
    setNewChapterEditText(chapter.title);
    setChapters((current: any) => {
      return current.map((prevChap: any) => {
        if (prevChap.id == chapter.id) {
          return { ...prevChap, editable: true };
        } else {
          return { ...prevChap, editable: false };
        }
        return prevChap;
      });
    });
  };

  //   function onClickDelete(event) {
  //     event.stopPropagation();
  //     // Handle click here
  //   }
  const CustomExpandIcon = () => {
    return (
      <Box
        sx={{
          ".Mui-expanded & > .collapsIconWrapper": {
            display: "none",
          },
          ".expandIconWrapper": {
            display: "none",
          },
          ".Mui-expanded & > .expandIconWrapper": {
            display: "block",
          },
        }}
      >
        <div className="expandIconWrapper" style={{ marginTop: "5px" }}>
          <IndeterminateCheckBoxOutlinedIcon
            sx={{
              color: theme => theme.palette.common.black,
              marginLeft: "10px",
              marginTop: "auto",
              marginBottom: "auto",
            }}
            fontSize="small"
          />
        </div>
        <div className="collapsIconWrapper" style={{ marginTop: "5px" }}>
          <AddBoxOutlinedIcon
            sx={{
              color: theme => theme.palette.common.black,
              marginLeft: "10px",
              marginTop: "auto",
              marginBottom: "auto",
            }}
            fontSize="small"
          />
        </div>
      </Box>
    );
  };

  useEffect(() => {
    let chapters = [
      {
        id: 1,
        title: "Ch. 1 The way of the program",
        subChapters: [
          {
            id: 2,
            title: "What are variables",
          },
          {
            id: 3,
            title: "Expressions",
          },
          {
            id: 4,
            title: "Statements",
          },
        ],
      },
      {
        id: 5,
        title: "Ch. 1 The way of the program",
        subChapters: [
          {
            id: 6,
            title: "What are variables",
          },
          {
            id: 7,
            title: "Expressions",
          },
          {
            id: 8,
            title: "Statements",
          },
        ],
      },
      {
        id: 9,
        title: "Ch. 1 The way of the program",
        subChapters: [
          {
            id: 10,
            title: "What are variables",
          },
          {
            id: 11,
            title: "Expressions",
          },
          {
            id: 12,
            title: "Statements",
          },
        ],
      },
    ];
    setChapters(chapters);
  }, []);

  return (
    <ThemeProvider theme={brandingLightTheme}>
      <PagesNavbar>
        <div style={{ background: "#F5F5F5", padding: "20px" }}>
          <Grid container spacing={5}>
            <Grid item xs={12} md={6}>
              <Box sx={{ background: "#FFFFFF", padding: "40px 40px", boxShadow: "rgba(0, 0, 0, 0.1) 0px 4px 12px" }}>
                <Typography variant="h3">Course Syllabus</Typography>
                <Typography variant="h4" mt={5}>
                  S1 106 Introduction to Information Science
                </Typography>
                <Box mt={5}>
                  <Typography sx={{ color: "#A5A5A5", fontSize: "0.8rem!important" }} variant="h5">
                    * Adding or editing the chapters will direct you to the dashboard
                  </Typography>
                  <Typography sx={{ color: "#A5A5A5", fontSize: "0.8rem!important" }} variant="h5">
                    * Added chapters could not be deleted
                  </Typography>
                </Box>
                <hr style={{ color: "#A5A5A5" }} />
                <Box>
                  {chapters &&
                    chapters.map((chapter: any) => {
                      return (
                        <div key={chapter.id}>
                          {chapter.editable ? (
                            <TextField
                              placeholder="Add new subchapter"
                              variant="standard"
                              fullWidth
                              value={newChapterEditText}
                              multiline
                              onChange={handleEditChapterChange}
                              InputProps={{
                                endAdornment: (
                                  <div style={{ marginRight: "18px", cursor: "pointer", display: "flex" }}>
                                    <SaveIcon
                                      sx={{
                                        color: "#757575",
                                        ":hover": {
                                          color: theme => theme.palette.common.orange,
                                        },
                                      }}
                                    />
                                    <CancelIcon
                                      sx={{
                                        color: "#757575",
                                        ":hover": {
                                          color: theme => theme.palette.common.orange,
                                        },
                                      }}
                                      onClick={() => setNewSubChapter(false)}
                                    />
                                  </div>
                                ),
                              }}
                              sx={{
                                fontWeight: 400,
                                marginBottom: "5px",
                                width: "50%",
                                display: "block",
                              }}
                            />
                          ) : (
                            <Accordion
                              style={{ background: "white", boxShadow: "none" }}
                              expanded={expanded === chapter.id}
                              onChange={handleChange(chapter.id)}
                            >
                              <AccordionSummary
                                aria-controls="panel1d-content"
                                id="panel1d-header"
                                expandIcon={<CustomExpandIcon />}
                                sx={{
                                  "& .MuiAccordionSummary-expandIconWrapper": {
                                    transition: "none",
                                    "&.Mui-expanded": {
                                      transform: "none",
                                    },
                                  },
                                  flexDirection: "row-reverse",
                                }}
                              >
                                <Typography sx={{ marginLeft: "10px" }}>{chapter.title}</Typography>
                                <CreateIcon
                                  sx={{
                                    color: "#757575",
                                    marginLeft: "15px",
                                    marginTop: "auto",
                                    marginBottom: "auto",
                                    ":hover": {
                                      color: theme => theme.palette.common.orange,
                                    },
                                  }}
                                  fontSize="small"
                                  onClick={event => editChapter(event, chapter)}
                                />
                                <DeleteIcon
                                  sx={{
                                    color: "#757575",
                                    marginLeft: "10px",
                                    marginTop: "auto",
                                    marginBottom: "auto",
                                    ":hover": {
                                      color: theme => theme.palette.common.orange,
                                    },
                                  }}
                                  fontSize="small"
                                />
                              </AccordionSummary>
                              <AccordionDetails>
                                <Box sx={{ marginLeft: "40px" }}>
                                  <div
                                    style={{
                                      borderLeft: "dotted 1px black",
                                      paddingLeft: "10px",
                                      paddingBottom: "8px",
                                    }}
                                  >
                                    {chapter.subChapters.map((subChapter: any) => {
                                      return (
                                        <div
                                          key={subChapter.id}
                                          style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}
                                        >
                                          <Typography sx={{ width: "auto" }}>{subChapter.title}</Typography>
                                          <CreateIcon
                                            sx={{
                                              color: "#757575",
                                              marginLeft: "15px",
                                              marginTop: "auto",
                                              marginBottom: "auto",
                                              ":hover": {
                                                color: theme => theme.palette.common.orange,
                                              },
                                            }}
                                            fontSize="small"
                                          />
                                        </div>
                                      );
                                    })}
                                  </div>
                                  {newSubChapter && (
                                    <TextField
                                      placeholder="Add new subchapter"
                                      variant="standard"
                                      fullWidth
                                      multiline
                                      onChange={handleSubChapterChange}
                                      InputProps={{
                                        endAdornment: (
                                          <div style={{ marginRight: "18px", cursor: "pointer", display: "flex" }}>
                                            <SaveIcon
                                              sx={{
                                                color: "#757575",
                                                ":hover": {
                                                  color: theme => theme.palette.common.orange,
                                                },
                                              }}
                                            />
                                            <CancelIcon
                                              sx={{
                                                color: "#757575",
                                                ":hover": {
                                                  color: theme => theme.palette.common.orange,
                                                },
                                              }}
                                              onClick={() => setNewSubChapter(false)}
                                            />
                                          </div>
                                        ),
                                      }}
                                      sx={{
                                        fontWeight: 400,
                                        marginBottom: "5px",
                                        width: "50%",
                                        display: "block",
                                      }}
                                    />
                                  )}
                                  <Button
                                    startIcon={<ArrowForwardIosIcon />}
                                    variant="outlined"
                                    className="btn waves-effect waves-light hoverable green"
                                    sx={{
                                      color: theme => theme.palette.common.orange,
                                    }}
                                    onClick={() => setNewSubChapter(true)}
                                  >
                                    Add new subchapters
                                  </Button>
                                </Box>
                              </AccordionDetails>
                            </Accordion>
                          )}
                        </div>
                      );
                    })}
                  {newChapter && (
                    <TextField
                      placeholder="Add chapter title here"
                      variant="standard"
                      fullWidth
                      multiline
                      onChange={handleChapterChange}
                      InputProps={{
                        endAdornment: (
                          <div style={{ marginRight: "18px", cursor: "pointer", display: "flex" }}>
                            <SaveIcon
                              sx={{
                                color: "#757575",
                                ":hover": {
                                  color: theme => theme.palette.common.orange,
                                },
                              }}
                              onClick={() => createNewChapter()}
                            />
                            <CancelIcon
                              sx={{
                                color: "#757575",
                                ":hover": {
                                  color: theme => theme.palette.common.orange,
                                },
                              }}
                              onClick={() => setNewChapter(false)}
                            />
                          </div>
                        ),
                      }}
                      sx={{
                        fontWeight: 400,
                        marginBottom: "5px",
                        width: "50%",
                        display: "block",
                      }}
                    />
                  )}
                  <Button
                    startIcon={<ArrowForwardIosIcon />}
                    variant="outlined"
                    className="btn waves-effect waves-light hoverable green"
                    sx={{
                      color: theme => theme.palette.common.orange,
                    }}
                    onClick={() => setNewChapter(true)}
                  >
                    Add new chapter
                  </Button>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ background: "#FFFFFF", padding: "40px 40px", boxShadow: "rgba(0, 0, 0, 0.1) 0px 4px 12px" }}>
                <Typography variant="h3">Proposals & Practice</Typography>
                <Box>
                  <Typography mt={3} variant="h4">
                    This class has&nbsp;
                    <FilledInput
                      type="number"
                      id="filled-adornment-weight"
                      onChange={handleChange("weight")}
                      endAdornment={
                        <div style={{ marginBottom: "-18px" }}>
                          <InputAdornment position="end">days</InputAdornment>
                        </div>
                      }
                      aria-describedby="filled-weight-helper-text"
                      inputProps={{
                        "aria-label": "days",
                      }}
                      sx={{
                        border: "none",
                        paddingBottom: "10px",
                        height: "40px",
                        width: "90px",
                      }}
                    />
                    &nbsp;in total
                  </Typography>
                </Box>
                <Box sx={{ marginTop: "50px" }}>
                  <Typography variant="h3">Node Proposals</Typography>
                  <hr style={{ color: "#A5A5A5" }} />
                  <Box>
                    <Typography mt={3} variant="h4" sx={{ lineHeight: "2.5" }}>
                      From&nbsp;
                      <FilledInput
                        className="remove-outer-inner-buttons"
                        type="date"
                        value={""}
                        id="filled-adornment-weight"
                        onChange={handleChange("weight")}
                        aria-describedby="filled-weight-helper-text"
                        inputProps={{
                          "aria-label": "days",
                        }}
                        sx={{
                          paddingBottom: "10px",
                          height: "40px",
                          width: "150px",
                          borderBottom: "orange",
                        }}
                      />
                      &nbsp; to &nbsp;
                      <FilledInput
                        type="date"
                        id="filled-adornment-weight"
                        onChange={handleChange("weight")}
                        aria-describedby="filled-weight-helper-text"
                        inputProps={{
                          "aria-label": "days",
                        }}
                        sx={{
                          paddingBottom: "10px",
                          height: "40px",
                          width: "150px",
                          borderBottom: "orange",
                        }}
                      />
                      &nbsp;each student can get&nbsp;
                      <FilledInput
                        id="filled-adornment-weight"
                        onChange={handleChange("weight")}
                        endAdornment={
                          <div style={{ marginBottom: "-18px" }}>
                            <InputAdornment position="end">points</InputAdornment>
                          </div>
                        }
                        aria-describedby="filled-weight-helper-text"
                        inputProps={{
                          "aria-label": "days",
                        }}
                        sx={{
                          paddingBottom: "10px",
                          height: "40px",
                          width: "100px",
                          borderBottom: "orange",
                        }}
                      />
                      &nbsp; by submitting &nbsp;
                      <FilledInput
                        id="filled-adornment-weight"
                        onChange={handleChange("weight")}
                        endAdornment={
                          <div style={{ marginBottom: "-18px" }}>
                            <InputAdornment position="end">propose/day</InputAdornment>
                          </div>
                        }
                        aria-describedby="filled-weight-helper-text"
                        inputProps={{
                          "aria-label": "days",
                        }}
                        sx={{
                          paddingBottom: "10px",
                          height: "40px",
                          width: "170px",
                          borderBottom: "orange",
                        }}
                      />
                      &nbsp; in &nbsp;
                      <FilledInput
                        id="filled-adornment-weight"
                        onChange={handleChange("weight")}
                        endAdornment={
                          <div style={{ marginBottom: "-18px" }}>
                            <InputAdornment position="end">days</InputAdornment>
                          </div>
                        }
                        aria-describedby="filled-weight-helper-text"
                        inputProps={{
                          "aria-label": "days",
                        }}
                        sx={{
                          paddingBottom: "10px",
                          height: "40px",
                          width: "90px",
                          borderBottom: "orange",
                        }}
                      />
                      &nbsp; of the course
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ marginTop: "50px" }}>
                  <Typography variant="h3">Question Proposals</Typography>
                  <hr style={{ color: "#A5A5A5" }} />
                  <Box sx={{ display: "flex", flexWrap: "wrap", alignContent: "center", alignItems: "baseline" }}>
                    <Typography mt={3} variant="h4" sx={{ lineHeight: "2.5" }}>
                      From&nbsp;
                      <FilledInput
                        type="date"
                        id="filled-adornment-weight"
                        onChange={handleChange("weight")}
                        aria-describedby="filled-weight-helper-text"
                        inputProps={{
                          "aria-label": "days",
                        }}
                        sx={{
                          paddingBottom: "10px",
                          height: "40px",
                          width: "150px",
                          borderBottom: "orange",
                        }}
                      />
                      &nbsp; to &nbsp;
                      <FilledInput
                        type="date"
                        id="filled-adornment-weight"
                        onChange={handleChange("weight")}
                        aria-describedby="filled-weight-helper-text"
                        inputProps={{
                          "aria-label": "days",
                        }}
                        sx={{
                          paddingBottom: "10px",
                          height: "40px",
                          width: "150px",
                          borderBottom: "orange",
                        }}
                      />
                      &nbsp;each student can get&nbsp;
                      <FilledInput
                        id="filled-adornment-weight"
                        onChange={handleChange("weight")}
                        endAdornment={
                          <div style={{ marginBottom: "-18px" }}>
                            <InputAdornment position="end">points</InputAdornment>
                          </div>
                        }
                        aria-describedby="filled-weight-helper-text"
                        inputProps={{
                          "aria-label": "days",
                        }}
                        sx={{
                          paddingBottom: "10px",
                          height: "40px",
                          width: "100px",
                          borderBottom: "orange",
                        }}
                      />
                      &nbsp; by submitting &nbsp;
                      <FilledInput
                        id="filled-adornment-weight"
                        onChange={handleChange("weight")}
                        endAdornment={
                          <div style={{ marginBottom: "-18px" }}>
                            <InputAdornment position="end">question/day</InputAdornment>
                          </div>
                        }
                        aria-describedby="filled-weight-helper-text"
                        inputProps={{
                          "aria-label": "days",
                        }}
                        sx={{
                          paddingBottom: "10px",
                          height: "40px",
                          width: "170px",
                          borderBottom: "orange",
                        }}
                      />
                      &nbsp; in &nbsp;
                      <FilledInput
                        id="filled-adornment-weight"
                        onChange={handleChange("weight")}
                        endAdornment={
                          <div style={{ marginBottom: "-18px" }}>
                            <InputAdornment position="end">days</InputAdornment>
                          </div>
                        }
                        aria-describedby="filled-weight-helper-text"
                        inputProps={{
                          "aria-label": "days",
                        }}
                        sx={{
                          paddingBottom: "10px",
                          height: "40px",
                          width: "90px",
                          borderBottom: "orange",
                        }}
                      />
                      &nbsp; of the course
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>

          <Grid
            sx={{ background: "#FFFFFF", boxShadow: "rgba(0, 0, 0, 0.1) 0px 4px 12px" }}
            container
            spacing={0}
            mt={5}
          >
            <Grid item xs={12} md={6}>
              <Box sx={{ padding: "40px 40px" }}>
                <Box sx={{ marginTop: "50px" }}>
                  <Typography variant="h3">Votes</Typography>
                  <Typography
                    variant="h4"
                    mt={5}
                    sx={{
                      fontSize: "20px",
                      fontWeight: 500,
                    }}
                  >
                    Casting Votes
                  </Typography>
                  <Box mt={5}>
                    <Typography sx={{ color: "#A5A5A5", fontSize: "0.8rem!important" }} variant="h5">
                      * Note that students do not see the instructor(s)' votes on any proposals
                    </Typography>
                  </Box>
                  <hr style={{ color: "#A5A5A5" }} />
                  <Box sx={{ display: "flex", flexWrap: "wrap", alignContent: "center", alignItems: "baseline" }}>
                    <Typography
                      mt={3}
                      variant="h4"
                      sx={{
                        fontSize: "16px",
                      }}
                    >
                      Each student will earn&nbsp;
                      <FilledInput
                        id="filled-adornment-weight"
                        onChange={handleChange("weight")}
                        endAdornment={
                          <div style={{ marginBottom: "-18px" }}>
                            <InputAdornment position="end">points/vote</InputAdornment>
                          </div>
                        }
                        aria-describedby="filled-weight-helper-text"
                        inputProps={{
                          "aria-label": "days",
                        }}
                        sx={{
                          paddingBottom: "10px",
                          height: "40px",
                          width: "140px",
                          borderBottom: "orange",
                        }}
                      />
                      &nbsp; by casting on other's proposals, which is in agreement with the instructors(s)' vote on the
                      same proposal
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", flexWrap: "wrap", alignContent: "center", alignItems: "baseline" }}>
                    <Typography
                      mt={3}
                      variant="h4"
                      sx={{
                        fontSize: "16px",
                      }}
                    >
                      Each student will lose&nbsp;
                      <FilledInput
                        id="filled-adornment-weight"
                        onChange={handleChange("weight")}
                        endAdornment={
                          <div style={{ marginBottom: "-18px" }}>
                            <InputAdornment position="end">points/vote</InputAdornment>
                          </div>
                        }
                        aria-describedby="filled-weight-helper-text"
                        inputProps={{
                          "aria-label": "days",
                        }}
                        sx={{
                          paddingBottom: "10px",
                          height: "40px",
                          width: "140px",
                          borderBottom: "orange",
                        }}
                      />
                      &nbsp; by casting on other's proposals, which is in disagreement with the instructors(s)' vote on
                      the same proposal
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ padding: "40px 40px" }}>
                <Box sx={{ marginTop: "50px" }}>
                  <Typography
                    variant="h4"
                    sx={{
                      fontSize: "20px",
                      fontWeight: 500,
                      marginTop: {
                        xs: "20px",
                        md: "110px",
                      },
                    }}
                  >
                    Getting Votes
                  </Typography>
                  <hr style={{ color: "#A5A5A5" }} />
                  <Box sx={{ display: "flex", flexWrap: "wrap", alignContent: "center", alignItems: "baseline" }}>
                    <Typography
                      mt={3}
                      variant="h4"
                      sx={{
                        fontSize: "16px",
                      }}
                    >
                      For every
                      <CheckIcon
                        sx={{
                          color: "green",

                          marginTop: "auto",
                          marginRight: "5px",
                          marginBottom: "-5px",
                          marginLeft: "5px",
                        }}
                        fontSize="small"
                      />
                      a student gets from their classmates/instructor(s) on their proposals, they will earn&nbsp;
                      <FilledInput
                        id="filled-adornment-weight"
                        onChange={handleChange("weight")}
                        endAdornment={
                          <div style={{ marginBottom: "-18px" }}>
                            <InputAdornment position="end">points/vote</InputAdornment>
                          </div>
                        }
                        aria-describedby="filled-weight-helper-text"
                        inputProps={{
                          "aria-label": "days",
                        }}
                        autoFocus={true}
                        sx={{
                          paddingBottom: "10px",
                          height: "40px",
                          width: "140px",
                          borderBottom: "orange",
                        }}
                      />
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      mt={3}
                      variant="h4"
                      sx={{
                        fontSize: "16px",
                      }}
                    >
                      For every
                      <ClearIcon
                        sx={{
                          color: "red",

                          marginTop: "auto",
                          marginRight: "5px",
                          marginBottom: "-5px",
                          marginLeft: "5px",
                        }}
                        fontSize="small"
                      />
                      a student gets from their classmates/instructor(s) on their proposals, they will lose&nbsp;
                      <FilledInput
                        id="filled-adornment-weight"
                        onChange={handleChange("weight")}
                        endAdornment={
                          <div style={{ marginBottom: "-18px" }}>
                            <InputAdornment position="end">points/vote</InputAdornment>
                          </div>
                        }
                        aria-describedby="filled-weight-helper-text"
                        inputProps={{
                          "aria-label": "days",
                        }}
                        sx={{
                          paddingBottom: "10px",
                          height: "40px",
                          width: "140px",
                          borderBottom: "orange",
                        }}
                      />
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      mt={3}
                      variant="h4"
                      sx={{
                        fontSize: "16px",
                      }}
                    >
                      For every
                      <StarIcon
                        sx={{
                          color: "#FFE820",
                          marginTop: "auto",
                          marginRight: "5px",
                          marginBottom: "-5px",
                          marginLeft: "5px",
                        }}
                        fontSize="small"
                      />
                      a student gets from their instructor(s) on their proposals, they will earn&nbsp;
                      <FilledInput
                        id="filled-adornment-weight"
                        onChange={handleChange("weight")}
                        endAdornment={
                          <div style={{ marginBottom: "-18px" }}>
                            <InputAdornment position="end">points/vote</InputAdornment>
                          </div>
                        }
                        aria-describedby="filled-weight-helper-text"
                        inputProps={{
                          "aria-label": "days",
                        }}
                        sx={{
                          paddingBottom: "10px",
                          height: "40px",
                          width: "140px",
                          borderBottom: "orange",
                        }}
                      />
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </div>
      </PagesNavbar>
    </ThemeProvider>
  );
};

HomePage.getLayout = (page: ReactNode) => {
  return <PublicLayout>{page}</PublicLayout>;
};
export default HomePage;
