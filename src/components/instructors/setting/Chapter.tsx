import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import CancelIcon from "@mui/icons-material/Cancel";
import CreateIcon from "@mui/icons-material/Create";
import DeleteIcon from "@mui/icons-material/Delete";
import IndeterminateCheckBoxOutlinedIcon from "@mui/icons-material/IndeterminateCheckBoxOutlined";
import SaveIcon from "@mui/icons-material/Save";
import { Accordion, AccordionDetails, AccordionSummary, Button, TextField, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { FC } from "react";
import React, { useState } from "react";
type Props = {
  chapters: any;
  setChapters: any;
  chaptersData: any;
};
const Chapter: FC<Props> = ({ chapters, setChapters }) => {
  const [expanded, setExpanded] = React.useState<string | false>("panel1");
  const [newChapter, setNewChapter] = useState<boolean>(false);
  const [newSubChapter, setNewSubChapter] = useState<boolean>(false);
  const [newChapterText, setNewChapterText] = useState<string>("");
  const [newChapterEditText, setNewChapterEditText] = useState<string>("");
  const [newSubChapterText, setNewSubChapterText] = useState<string>("");
  const [newSubChapterEditText, setNewSubChapterEditText] = useState<string>("");

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

  const handleEditSubChapterChange = (event: any) => {
    setNewSubChapterEditText(event.target.value);
  };

  const handleSubChapterChange = (event: any) => {
    setNewSubChapterText(event.target.value);
  };

  // const inputsHandler = (e: any) => {
  //   setInputField({ [e.target.name]: e.target.value });
  // };

  const createNewChapter = () => {
    if (newChapterText.length > 0) {
      let id = Math.floor(Math.random() * (100 - 1 + 1));
      let chapterData = {
        id: id,
        title: newChapterText,
      };
      setChapters([...chapters, chapterData]);
      setNewChapter(false);
      setNewChapterText("");
    }
  };

  const createNewSubChapter = (chapterId: number) => {
    if (newSubChapterText.length > 0) {
      let id = Math.floor(Math.random() * (100 - 1 + 1));
      let chapterData = {
        id: id,
        title: newSubChapterText,
      };
      let chapterIndex = chapters.findIndex((chapter: any) => chapter.id == chapterId);
      if (chapters[chapterIndex].subChapters) {
        chapters[chapterIndex].subChapters = [...chapters[chapterIndex].subChapters, chapterData];
      } else {
        chapters[chapterIndex]["subChapters"] = [chapterData];
      }
      setChapters([...chapters]);
      setNewSubChapter(false);
      setNewSubChapterText("");
    }
  };

  const makeChapterEditable = (event: any, chapter: any) => {
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

  const makeSubChapterEditable = (event: any, chapterId: number, subChapter: any) => {
    event.stopPropagation();
    setNewSubChapterEditText(subChapter.title);
    setChapters((current: any) => {
      return current.map((prevChap: any) => {
        if (prevChap.id == chapterId) {
          prevChap.subChapters.map((subChap: any) => {
            subChap["editable"] = false;
          });
          let subChapterIndex = prevChap.subChapters.findIndex((subChap: any) => subChap.id == subChapter.id);
          if (subChapterIndex != -1) {
            prevChap.subChapters[subChapterIndex] = { ...prevChap.subChapters[subChapterIndex], editable: true };
          }
        }
        return prevChap;
      });
    });
  };

  const editChapter = (id: number) => {
    if (newChapterEditText.length > 0) {
      setChapters((current: any) => {
        return current.map((prevChap: any) => {
          if (prevChap.id == id) {
            return { ...prevChap, title: newChapterEditText, editable: false };
          }
          return prevChap;
        });
      });
      setNewChapterEditText("");
    }
  };

  const cancelChatperEdit = (id: number) => {
    setChapters((current: any) => {
      return current.map((prevChap: any) => {
        if (prevChap.id == id) {
          return { ...prevChap, editable: false };
        }
        return prevChap;
      });
    });
    setNewChapterEditText("");
  };

  const editSubChapter = (chapterId: number, subChapterId: number) => {
    if (newSubChapterEditText.length > 0) {
      setChapters((current: any) => {
        return current.map((prevChap: any) => {
          if (prevChap.id == chapterId) {
            let subChapterIndex = prevChap.subChapters.findIndex((subChap: any) => subChap.id == subChapterId);
            if (subChapterIndex != -1) {
              prevChap.subChapters[subChapterIndex] = {
                ...prevChap.subChapters[subChapterIndex],
                title: newSubChapterEditText,
                editable: false,
              };
            }
          }
          return prevChap;
        });
      });
      setNewChapterEditText("");
    }
  };

  const cancelSubChatperEdit = (chapterId: number, subChapterId: number) => {
    setChapters((current: any) => {
      return current.map((prevChap: any) => {
        if (prevChap.id == chapterId) {
          let subChapterIndex = prevChap.subChapters.findIndex((subChap: any) => subChap.id == subChapterId);
          if (subChapterIndex != -1) {
            prevChap.subChapters[subChapterIndex] = {
              ...prevChap.subChapters[subChapterIndex],
              editable: false,
            };
          }
        }
        return prevChap;
      });
    });
    setNewChapterEditText("");
  };

  const deleteChapter = (id: number) => {
    let chapterIndex = chapters.findIndex((chap: any) => chap.id == id);
    chapters.splice(chapterIndex, 1);
    setChapters([...chapters]);
  };

  const deleteSubChapter = (chapterId: number, subChapterId: number) => {
    setChapters((current: any) => {
      return current.map((prevChap: any) => {
        if (prevChap.id == chapterId) {
          let subChapterIndex = prevChap.subChapters.findIndex((subChap: any) => subChap.id == subChapterId);
          if (subChapterIndex != -1) {
            prevChap.subChapters.splice(subChapterIndex, 1);
          }
        }
        return prevChap;
      });
    });
  };

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
        <Box className="expandIconWrapper" style={{ marginTop: "5px" }}>
          <IndeterminateCheckBoxOutlinedIcon
            sx={{
              color: theme => (theme.palette.mode == "dark" ? "grey" : "black"),
              marginLeft: "10px",
              marginTop: "auto",
              marginBottom: "auto",
            }}
            fontSize="small"
          />
        </Box>
        <Box className="collapsIconWrapper" style={{ marginTop: "5px" }}>
          <AddBoxOutlinedIcon
            sx={{
              color: theme => (theme.palette.mode == "dark" ? "grey" : "black"),
              marginLeft: "10px",
              marginTop: "auto",
              marginBottom: "auto",
            }}
            fontSize="small"
          />
        </Box>
      </Box>
    );
  };

  return (
    <Box
      sx={{
        padding: "40px 40px 80px 40px",
        boxShadow: "rgba(0, 0, 0, 0.1) 0px 4px 12px",
      }}
    >
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
          chapters.map((chapter: any, index: number) => {
            return (
              <Box key={chapter.id}>
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
                        <Box style={{ marginRight: "18px", cursor: "pointer", display: "flex" }}>
                          <SaveIcon
                            sx={{
                              color: "#757575",
                              ":hover": {
                                color: theme => theme.palette.common.orange,
                              },
                            }}
                            onClick={() => editChapter(chapter.id)}
                          />
                          <CancelIcon
                            sx={{
                              marginLeft: "10px",
                              color: "#757575",
                              ":hover": {
                                color: theme => theme.palette.common.orange,
                              },
                            }}
                            onClick={() => cancelChatperEdit(chapter.id)}
                          />
                        </Box>
                      ),
                    }}
                    sx={{
                      fontWeight: 400,
                      marginBottom: "5px",
                      marginLeft: "20px",
                      width: "50%",
                      display: "block",
                    }}
                  />
                ) : (
                  <Accordion
                    style={{ boxShadow: "none" }}
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
                        onClick={event => makeChapterEditable(event, chapter)}
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
                        onClick={() => deleteChapter(chapter.id)}
                      />
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box sx={{ marginLeft: "40px" }}>
                        <Box
                          style={{
                            borderLeft: "dotted 1px black",
                            paddingLeft: "10px",
                            paddingBottom: "8px",
                          }}
                        >
                          {chapter.subChapters &&
                            chapter.subChapters.map((subChapter: any, subIndex: number) => {
                              if (subChapter.editable) {
                                return (
                                  <Box key={subChapter.id}>
                                    <TextField
                                      placeholder="Add new subchapter"
                                      variant="standard"
                                      fullWidth
                                      value={newSubChapterEditText}
                                      multiline
                                      onChange={handleEditSubChapterChange}
                                      InputProps={{
                                        endAdornment: (
                                          <Box style={{ marginRight: "18px", cursor: "pointer", display: "flex" }}>
                                            <SaveIcon
                                              sx={{
                                                color: "#757575",
                                                ":hover": {
                                                  color: theme => theme.palette.common.orange,
                                                },
                                              }}
                                              onClick={() => editSubChapter(chapter.id, subChapter.id)}
                                            />
                                            <CancelIcon
                                              sx={{
                                                marginLeft: "10px",
                                                color: "#757575",
                                                ":hover": {
                                                  color: theme => theme.palette.common.orange,
                                                },
                                              }}
                                              onClick={() => cancelSubChatperEdit(chapter.id, subChapter.id)}
                                            />
                                          </Box>
                                        ),
                                        startAdornment: (
                                          <Typography
                                            sx={{
                                              width: {
                                                xs: "130px",
                                                md: "110px",
                                              },
                                            }}
                                          >
                                            Ch. {index + 1}.{subIndex + 1}
                                          </Typography>
                                        ),
                                      }}
                                      sx={{
                                        fontWeight: 400,
                                        marginBottom: "5px",
                                        width: {
                                          xs: "100%",
                                          md: "50%",
                                        },
                                        display: "block",
                                      }}
                                    />
                                  </Box>
                                );
                              }
                              return (
                                <Box
                                  key={subChapter.id}
                                  style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}
                                >
                                  <Typography sx={{ width: "auto" }}>
                                    Ch. {index + 1}.{subIndex + 1} {subChapter.title}
                                  </Typography>
                                  <CreateIcon
                                    sx={{
                                      cursor: "pointer",
                                      color: "#757575",
                                      marginLeft: "15px",
                                      marginTop: "auto",
                                      marginBottom: "auto",
                                      ":hover": {
                                        color: theme => theme.palette.common.orange,
                                      },
                                    }}
                                    fontSize="small"
                                    onClick={event => makeSubChapterEditable(event, chapter.id, subChapter)}
                                  />
                                  <DeleteIcon
                                    sx={{
                                      cursor: "pointer",
                                      color: "#757575",
                                      marginLeft: "10px",
                                      marginTop: "auto",
                                      marginBottom: "auto",
                                      ":hover": {
                                        color: theme => theme.palette.common.orange,
                                      },
                                    }}
                                    fontSize="small"
                                    onClick={() => deleteSubChapter(chapter.id, subChapter.id)}
                                  />
                                </Box>
                              );
                            })}
                        </Box>
                        {newSubChapter && (
                          <TextField
                            placeholder="Add new subchapter"
                            variant="standard"
                            fullWidth
                            multiline
                            onChange={handleSubChapterChange}
                            InputProps={{
                              endAdornment: (
                                <Box style={{ marginRight: "18px", cursor: "pointer", display: "flex" }}>
                                  <SaveIcon
                                    sx={{
                                      color: "#757575",
                                      ":hover": {
                                        color: theme => theme.palette.common.orange,
                                      },
                                    }}
                                    onClick={() => createNewSubChapter(chapter.id)}
                                  />
                                  <CancelIcon
                                    sx={{
                                      marginLeft: "10px",
                                      color: "#757575",
                                      ":hover": {
                                        color: theme => theme.palette.common.orange,
                                      },
                                    }}
                                    onClick={() => setNewSubChapter(false)}
                                  />
                                </Box>
                              ),
                              startAdornment: (
                                <Typography
                                  sx={{
                                    width: {
                                      xs: "130px",
                                      md: "110px",
                                    },
                                  }}
                                >
                                  Ch. {index + 1}.{chapter.subChapters ? chapter.subChapters.length + 1 : 1}
                                </Typography>
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
              </Box>
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
                <Box style={{ marginRight: "18px", cursor: "pointer", display: "flex" }}>
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
                      marginLeft: "10px",
                      color: "#757575",
                      ":hover": {
                        color: theme => theme.palette.common.orange,
                      },
                    }}
                    onClick={() => setNewChapter(false)}
                  />
                </Box>
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
            marginTop: "5px",
            color: theme => theme.palette.common.orange,
          }}
          onClick={() => setNewChapter(true)}
        >
          Add new chapter
        </Button>
      </Box>
      <Box display="flex" justifyContent="flex-end" alignItems="flex-end">
        <Button
          variant="contained"
          className="btn waves-effect waves-light hoverable green"
          sx={{
            color: theme => theme.palette.common.white,
          }}
        >
          Submit
        </Button>
      </Box>
    </Box>
  );
};

export default Chapter;
