import AccessTimeFilledOutlinedIcon from "@mui/icons-material/AccessTimeFilledOutlined";
import ArticleIcon from "@mui/icons-material/Article";
import BoltIcon from "@mui/icons-material/Bolt";
// import CheckIcon from "@mui/icons-material/Check";
// import SchoolIcon from "@mui/icons-material/School";
import { Button, Paper, Stack, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { collection, getFirestore, onSnapshot, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { User } from "src/knowledgeTypes";

import { CourseTag } from "../../instructorsTypes";
import Leaderboard from "./Leaderboard";

// const topicComplete = 10;
// const totalTopic = 100;

type CourseDetailProps = {
  user: User;
  currentSemester: CourseTag;
  onStartPractice: () => void;
};

const CourseDetail = ({ user, currentSemester, onStartPractice }: CourseDetailProps) => {
  console.log({ currentSemester });
  const db = getFirestore();
  const [semesterNodes, setSemesterNodes] = useState<Set<string>>(new Set());
  const [studentNodesLearnt, setStudentNodesLearnt] = useState<Set<string>>(new Set());
  useEffect(() => {
    const getCourseDetails = async () => {
      // TODO: add course details
    };
    getCourseDetails();
  }, []);

  useEffect(() => {
    console.log("call use effect");
    const q = query(collection(db, "practice"), where("tagId", "==", currentSemester.tagId));

    const unsub = onSnapshot(q, snapshot => {
      if (snapshot.empty) return;
      const docChanges = snapshot.docChanges();
      setSemesterNodes(prevNodes => {
        return docChanges.reduce((ids: Set<string>, docChange) => {
          ids.add(docChange.doc.id);
          return ids;
        }, prevNodes);
      });
    });

    return () => unsub();
  }, [currentSemester.tagId, db]);

  useEffect(() => {
    console.log("call use effect");
    const q = query(
      collection(db, "practice"),
      where("user", "==", user.uname),
      where("tagId", "==", currentSemester.tagId),
      where("q", "==", 5)
    );

    const unsub = onSnapshot(q, snapshot => {
      if (snapshot.empty) return;

      setStudentNodesLearnt(prevLearnNodes => {
        return snapshot.docChanges().reduce((ids: Set<string>, docChange) => {
          ids.add(docChange.doc.id);
          return ids;
        }, prevLearnNodes);
      });
    });

    return () => unsub();
  }, [currentSemester.tagId, db, user.uname]);
  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ pY: "48px 32px 32px 32px", borderBottom: theme => `solid 1px ${theme.palette.common.notebookG600}` }}>
        <Typography component={"h1"} sx={{ fontSize: "30px", fontWeight: 600 }}>
          Practice
        </Typography>
      </Box>
      <Box sx={{ py: "48px" }}>
        <Box
          sx={{ maxWidth: "1040px", margin: "auto", display: "grid", gridTemplateColumns: "716px 300px", gap: "24px" }}
        >
          <Box sx={{ width: "100%" }}>
            <Paper
              sx={{
                p: "32px 40px 24px 40px",
                mb: "12px",
                backgroundColor: theme =>
                  theme.palette.mode === "dark" ? theme.palette.common.notebookMainBlack : theme.palette.common.gray50,
              }}
            >
              <Typography
                sx={{
                  mb: "12px",
                  color: theme =>
                    theme.palette.mode === "dark" ? theme.palette.common.gray25 : theme.palette.common.gray900,
                  fontSize: "24px",
                  fontWeight: 500,
                }}
              >
                {currentSemester.cTitle}
              </Typography>
              <Box sx={{ display: "flex", mb: "24px" }}>
                <Typography
                  sx={{
                    mr: "48px",
                    color: theme =>
                      theme.palette.mode === "dark" ? theme.palette.common.gray25 : theme.palette.common.gray900,
                    fontSize: "16px",
                    fontWeight: 500,
                  }}
                >
                  {`${((studentNodesLearnt.size * 100) / semesterNodes.size).toFixed(2)}%`}
                </Typography>
                <Typography
                  sx={{
                    mr: "12px",
                    color: theme =>
                      theme.palette.mode === "dark" ? theme.palette.common.gray25 : theme.palette.common.gray900,
                    fontSize: "16px",
                    fontWeight: 500,
                  }}
                >
                  {`${studentNodesLearnt.size}/${semesterNodes.size}`}
                </Typography>
                <Typography
                  sx={{
                    color: theme =>
                      theme.palette.mode === "dark" ? theme.palette.common.gray25 : theme.palette.common.gray900,
                    fontSize: "16px",
                    fontWeight: 500,
                  }}
                >
                  items learned
                </Typography>
              </Box>
              <Box
                sx={{
                  mb: "24px",
                  width: "100%",
                  height: "18px",
                  backgroundColor: theme =>
                    theme.palette.mode === "dark" ? theme.palette.common.notebookG600 : theme.palette.common.gray200,
                  borderRadius: "8px",
                }}
              >
                <Box
                  sx={{
                    width: "50%",
                    height: "100%",
                    backgroundColor: theme =>
                      theme.palette.mode === "dark" ? theme.palette.common.primary800 : theme.palette.common.primary600,
                    borderRadius: "8px",
                  }}
                ></Box>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Stack direction={"row"} spacing={"24px"}>
                  <Box sx={{ width: "50px", display: "flex", justifyContent: "space-between" }}>
                    <ArticleIcon sx={{ color: theme => theme.palette.common.yellow500 }} /> <Typography>8</Typography>
                  </Box>
                  <Box sx={{ width: "50px", display: "flex", justifyContent: "space-between" }}>
                    <AccessTimeFilledOutlinedIcon sx={{ color: theme => theme.palette.common.yellow500 }} />{" "}
                    <Typography>12</Typography>
                  </Box>
                  <Box sx={{ width: "50px", display: "flex", justifyContent: "space-between" }}>
                    <BoltIcon sx={{ color: theme => theme.palette.common.yellow500 }} /> <Typography>12</Typography>
                  </Box>
                </Stack>
                <Button
                  variant="contained"
                  onClick={onStartPractice}
                  sx={{
                    backgroundColor: theme =>
                      theme.palette.mode === "dark" ? theme.palette.common.primary800 : theme.palette.common.primary600,
                    borderRadius: "26px",
                    minWidth: "156px",
                  }}
                >
                  Practice
                </Button>
              </Box>
            </Paper>

            <Paper
              sx={{
                p: "16px 40px",
                mb: "24px",
                backgroundColor: theme =>
                  theme.palette.mode === "dark" ? theme.palette.common.notebookMainBlack : theme.palette.common.gray50,
              }}
            >
              <Stack direction={"row"} spacing={"24px"} justifyContent={"space-between"}>
                <Box sx={{ display: "flex" }}>
                  <ArticleIcon sx={{ mr: "15px", color: theme => theme.palette.common.yellow500 }} />{" "}
                  <Typography
                    sx={{
                      color: theme =>
                        theme.palette.mode === "dark"
                          ? theme.palette.common.notebookG200
                          : theme.palette.common.gray500,
                    }}
                  >
                    Ready to learn
                  </Typography>
                </Box>
                <Box sx={{ display: "flex" }}>
                  <AccessTimeFilledOutlinedIcon sx={{ mr: "15px", color: theme => theme.palette.common.yellow500 }} />{" "}
                  <Typography
                    sx={{
                      color: theme =>
                        theme.palette.mode === "dark"
                          ? theme.palette.common.notebookG200
                          : theme.palette.common.gray500,
                    }}
                  >
                    Ready to review
                  </Typography>
                </Box>
                <Box sx={{ display: "flex" }}>
                  <BoltIcon sx={{ mr: "15px", color: theme => theme.palette.common.yellow500 }} />{" "}
                  <Typography
                    sx={{
                      color: theme =>
                        theme.palette.mode === "dark"
                          ? theme.palette.common.notebookG200
                          : theme.palette.common.gray500,
                    }}
                  >
                    In long term memory
                  </Typography>
                </Box>
              </Stack>
            </Paper>

            {/* <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr", lg: "1fr 1fr 1fr 1fr" },
                gap: "12px",
              }}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map(c => (
                <Paper
                  key={c}
                  sx={{
                    width: "100%",
                    height: "138px",
                    p: "16px",
                    backgroundColor: theme => theme.palette.common.notebookMainBlack,
                  }}
                >
                  <Box>
                    <Box
                      sx={{
                        width: "48px",
                        height: "48px",
                        m: "auto",
                        mb: "12px",
                        display: "grid",
                        placeContent: "center",
                        borderRadius: "50%",
                        background: theme =>
                          `conic-gradient(${
                            theme.palette.mode === "dark"
                              ? topicCompletePercentage < 100
                                ? theme.palette.common.primary600
                                : theme.palette.common.success600
                              : topicCompletePercentage < 100
                              ? theme.palette.common.primary600
                              : theme.palette.common.success600
                          }, ${(topicCompletePercentage * 360) / 100}deg, ${
                            theme.palette.mode === "dark"
                              ? topicCompletePercentage > 0
                                ? theme.palette.common.notebookMainBlack
                                : theme.palette.common.notebookG300
                              : topicCompletePercentage > 0
                              ? theme.palette.common.notebookMainBlack
                              : theme.palette.common.notebookG300
                          } 0deg)`,
                      }}
                    >
                      <Box
                        sx={{
                          width: "42px",
                          height: "42px",
                          display: "grid",
                          placeContent: "center",
                          borderRadius: "50%",
                          background: theme =>
                            theme.palette.mode === "dark"
                              ? theme.palette.common.notebookMainBlack
                              : theme.palette.common.notebookMainBlack,
                        }}
                      >
                        {topicCompletePercentage >= 100 && (
                          <CheckIcon sx={{ color: theme => theme.palette.common.success600 }} />
                        )}
                        {topicCompletePercentage < 100 && topicCompletePercentage > 0 && (
                          <Typography>{`${topicCompletePercentage}%`}</Typography>
                        )}
                      </Box>
                    </Box>
                    <Box sx={{ display: "flex", mb: "6px" }}>
                      <SchoolIcon
                        sx={{
                          mr: "6px",
                          color: theme =>
                            topicCompletePercentage > 0
                              ? theme.palette.common.yellow500
                              : theme.palette.common.notebookG300,
                          fontSize: "14px",
                        }}
                      />
                      <Typography
                        sx={{
                          fontSize: "12px",
                          color: theme => (topicCompletePercentage > 0 ? undefined : theme.palette.common.notebookG300),
                        }}
                      >
                        Section 1
                      </Typography>
                    </Box>
                    <Typography
                      sx={{
                        fontSize: "14px",
                        color: theme => (topicCompletePercentage > 0 ? undefined : theme.palette.common.notebookG300),
                      }}
                    >
                      InData Science
                    </Typography>
                  </Box>
                </Paper>
              ))}
            </Box> */}
          </Box>
          <Paper
            sx={{
              width: "100%",
              mb: "12px",
              backgroundColor: theme =>
                theme.palette.mode === "dark" ? theme.palette.common.notebookMainBlack : theme.palette.common.gray50,
            }}
          >
            <Leaderboard semesterId={currentSemester.tagId} />
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default CourseDetail;
