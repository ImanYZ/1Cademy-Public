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
  onSubmitHandler?: any;
  currentSemester?: any;
};
const Chapter: FC<Props> = ({ chapters, setChapters }) => {
  const [expanded, setExpanded] = React.useState<string | false>("panel1");
  const [newChapter, setNewChapter] = useState<boolean>(false);
  const [newSubChapter, setNewSubChapter] = useState<boolean>(false);
  const [newChapterText, setNewChapterText] = useState<string>("");
  const [newChapterEditText, setNewChapterEditText] = useState<string>("");
  const [newSubChapterText, setNewSubChapterText] = useState<string>("");
  const [newSubChapterEditText, setNewSubChapterEditText] = useState<string>("");

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

  const createNewChapter = () => {
    if (newChapterText.length > 0) {
      let id = Math.floor(Math.random() * (100 - 1 + 1));
      let chapterData = {
        node: id,
        isNew: true,
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
        node: id,
        isNew: true,
        title: newSubChapterText,
      };
      let chapterIndex = chapters.findIndex((chapter: any) => chapter.node == chapterId);
      if (chapters[chapterIndex].children) {
        chapters[chapterIndex].children = [...chapters[chapterIndex].children, chapterData];
      } else {
        chapters[chapterIndex]["children"] = [chapterData];
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
        if (prevChap.node == chapter.node) {
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
        if (prevChap.node == chapterId) {
          console.log(prevChap, "prevChap");
          prevChap.children.map((subChap: any) => {
            subChap["editable"] = false;
          });
          let subChapterIndex = prevChap.children.findIndex((subChap: any) => subChap.node == subChapter.node);
          if (subChapterIndex != -1) {
            prevChap.children[subChapterIndex] = { ...prevChap.children[subChapterIndex], editable: true };
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
          if (prevChap.node == id) {
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
        if (prevChap.node == id) {
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
          if (prevChap.node == chapterId) {
            let subChapterIndex = prevChap.children.findIndex((subChap: any) => subChap.node == subChapterId);
            if (subChapterIndex != -1) {
              prevChap.children[subChapterIndex] = {
                ...prevChap.children[subChapterIndex],
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
        if (prevChap.node == chapterId) {
          let subChapterIndex = prevChap.children.findIndex((subChap: any) => subChap.node == subChapterId);
          if (subChapterIndex != -1) {
            prevChap.children[subChapterIndex] = {
              ...prevChap.children[subChapterIndex],
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
    let chapterIndex = chapters.findIndex((chap: any) => chap.node == id);
    chapters.splice(chapterIndex, 1);
    setChapters([...chapters]);
  };

  const deleteSubChapter = (chapterId: number, subChapterId: number) => {
    setChapters((current: any) => {
      return current.map((prevChap: any) => {
        if (prevChap.node == chapterId) {
          let subChapterIndex = prevChap.children.findIndex((subChap: any) => subChap.node == subChapterId);
          if (subChapterIndex != -1) {
            prevChap.children.splice(subChapterIndex, 1);
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
        padding: "40px 40px 40px 40px",
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
              <Box key={chapter.node}>
                {chapter.editable ? (
                  <TextField
                    placeholder="Edit chapter"
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
                            onClick={() => editChapter(chapter.node)}
                          />
                          <CancelIcon
                            sx={{
                              marginLeft: "10px",
                              color: "#757575",
                              ":hover": {
                                color: theme => theme.palette.common.orange,
                              },
                            }}
                            onClick={() => cancelChatperEdit(chapter.node)}
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
                          Ch. {index + 1}
                        </Typography>
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
                    expanded={expanded === chapter.node}
                    onChange={handleChange(chapter.node)}
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
                      <Typography sx={{ marginLeft: "10px" }}>
                        Ch. {index + 1}&nbsp;
                        {chapter.title}
                      </Typography>
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
                          }}
                        >
                          {chapter.children &&
                            chapter.children.map((subChapter: any, subIndex: number) => {
                              if (subChapter.editable) {
                                return (
                                  <Box key={subChapter.node}>
                                    <TextField
                                      placeholder="Edit subchapter"
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
                                              onClick={() => editSubChapter(chapter.node, subChapter.node)}
                                            />
                                            <CancelIcon
                                              sx={{
                                                marginLeft: "10px",
                                                color: "#757575",
                                                ":hover": {
                                                  color: theme => theme.palette.common.orange,
                                                },
                                              }}
                                              onClick={() => cancelSubChatperEdit(chapter.node, subChapter.node)}
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
                                  key={subChapter.node}
                                  style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}
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
                                    onClick={event => makeSubChapterEditable(event, chapter.node, subChapter)}
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
                                    onClick={() => deleteSubChapter(chapter.node, subChapter.node)}
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
                                    onClick={() => createNewSubChapter(chapter.node)}
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
                                  Ch. {index + 1}.{chapter.children ? chapter.children.length + 1 : 1}
                                </Typography>
                              ),
                            }}
                            sx={{
                              fontWeight: 400,
                              marginBottom: "10px",
                              marginLeft: "10px",
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
              startAdornment: (
                <Typography
                  sx={{
                    width: {
                      xs: "130px",
                      md: "110px",
                    },
                  }}
                >
                  Ch. {chapters.length + 1}
                </Typography>
              ),
            }}
            sx={{
              fontWeight: 400,
              marginTop: "10px",
              marginBottom: "10px",
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
    </Box>
  );
};

export default Chapter;
