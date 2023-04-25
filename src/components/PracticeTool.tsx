import { Check } from "@mui/icons-material";
import AccessTimeFilledOutlinedIcon from "@mui/icons-material/AccessTimeFilledOutlined";
import ArticleIcon from "@mui/icons-material/Article";
import BoltIcon from "@mui/icons-material/Bolt";
import CheckIcon from "@mui/icons-material/Check";
import SchoolIcon from "@mui/icons-material/School";
import { Box, Button, ButtonGroup, Paper, Stack, Typography } from "@mui/material";
import Image from "next/image";
import React, { useEffect, useState } from "react";

import { NO_USER_IMAGE } from "../lib/utils/constants";

const topicComplete = 10;
const totalTopic = 100;
export const PracticeTool = () => {
  const topicCompletePercentage = Math.round((topicComplete * 100) / totalTopic);
  const [selectedLeaderboardOption, setSelectedLeaderboardOption] = useState<"WEEK" | "MONTH" | "ALL_TIME">("WEEK");

  const [leaderBoardUsers, setLeaderBoardUSers] = useState<number[]>([]);

  const getColorFromLeaderboardUser = (position: number) => {
    if (position === 1) return "#FAC515";
    if (position === 2) return "#98A2B3";
    if (position === 3) return "#FFA168";
    return "#A4A4A4";
  };

  useEffect(() => {
    if (selectedLeaderboardOption === "WEEK") setLeaderBoardUSers([1, 2, 3, 4, 5]);
    if (selectedLeaderboardOption === "MONTH") setLeaderBoardUSers([1, 2, 3, 4, 5, 6]);
    if (selectedLeaderboardOption === "ALL_TIME") setLeaderBoardUSers([1, 2, 3, 4, 5, 7, 8]);
  }, [selectedLeaderboardOption]);

  return (
    <Box
      sx={{
        position: "absolute",
        inset: "0px",
        background: theme =>
          theme.palette.mode === "dark" ? theme.palette.common.notebookG900 : theme.palette.common.notebookG900,
        zIndex: 1,
      }}
    >
      <Box sx={{ p: "48px 32px 32px 32px", borderBottom: theme => `solid 1px ${theme.palette.common.notebookG600}` }}>
        <Typography component={"h1"} sx={{ fontSize: "30px", fontWeight: 600 }}>
          1Cademy Assistant
        </Typography>
      </Box>
      <Box sx={{ p: "48px 100px" }}>
        <Box
          sx={{ maxWidth: "1040px", margin: "auto", display: "grid", gridTemplateColumns: "716px 300px", gap: "24px" }}
        >
          <Box sx={{ width: "100%" }}>
            <Paper
              sx={{
                p: "32px 40px 24px 40px",
                mb: "12px",
                backgroundColor: theme => theme.palette.common.notebookMainBlack,
              }}
            >
              <Typography
                sx={{ mb: "12px", color: theme => theme.palette.common.gray25, fontSize: "24px", fontWeight: 500 }}
              >
                Course 1
              </Typography>
              <Box sx={{ display: "flex", mb: "24px" }}>
                <Typography
                  sx={{ mr: "48px", color: theme => theme.palette.common.gray25, fontSize: "16px", fontWeight: 500 }}
                >
                  51%
                </Typography>
                <Typography
                  sx={{ mr: "12px", color: theme => theme.palette.common.gray25, fontSize: "16px", fontWeight: 500 }}
                >
                  500 / 999
                </Typography>
                <Typography sx={{ color: theme => theme.palette.common.gray25, fontSize: "16px", fontWeight: 500 }}>
                  items learned
                </Typography>
              </Box>
              <Box
                sx={{
                  mb: "24px",
                  width: "100%",
                  height: "18px",
                  backgroundColor: theme => theme.palette.common.notebookG600,
                  borderRadius: "8px",
                }}
              >
                <Box
                  sx={{
                    width: "50%",
                    height: "100%",
                    backgroundColor: theme => theme.palette.common.primary800,
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
                  sx={{ backgroundColor: theme => theme.palette.common.primary800, borderRadius: "26px" }}
                >
                  Review (12)
                </Button>
              </Box>
            </Paper>

            <Paper
              sx={{ p: "16px 40px", mb: "24px", backgroundColor: theme => theme.palette.common.notebookMainBlack }}
            >
              <Stack direction={"row"} spacing={"24px"} justifyContent={"space-between"}>
                <Box sx={{ display: "flex" }}>
                  <ArticleIcon sx={{ mr: "15px", color: theme => theme.palette.common.yellow500 }} />{" "}
                  <Typography>Ready to learn</Typography>
                </Box>
                <Box sx={{ display: "flex" }}>
                  <AccessTimeFilledOutlinedIcon sx={{ mr: "15px", color: theme => theme.palette.common.yellow500 }} />{" "}
                  <Typography>Ready to review</Typography>
                </Box>
                <Box sx={{ display: "flex" }}>
                  <BoltIcon sx={{ mr: "15px", color: theme => theme.palette.common.yellow500 }} />{" "}
                  <Typography>In long term memory</Typography>
                </Box>
              </Stack>
            </Paper>

            <Box
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
            </Box>
          </Box>
          <Paper
            sx={{
              width: "100%",
              mb: "12px",
              backgroundColor: theme => theme.palette.common.notebookMainBlack,
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                height: "112px",
                borderBottom: theme => `solid 1px ${theme.palette.common.notebookG600}`,
              }}
            >
              <Typography
                sx={{ my: "18px", color: theme => theme.palette.common.gray25, fontSize: "24px", fontWeight: 500 }}
              >
                Leaderboard
              </Typography>
              <ButtonGroup variant="contained" aria-label="leaderboard options">
                <Button onClick={() => setSelectedLeaderboardOption("WEEK")} sx={{ p: "4px 14px" }}>
                  Week
                </Button>
                <Button onClick={() => setSelectedLeaderboardOption("MONTH")} sx={{ p: "4px 14px" }}>
                  Month
                </Button>
                <Button onClick={() => setSelectedLeaderboardOption("ALL_TIME")} sx={{ p: "4px 14px" }}>
                  All Time
                </Button>
              </ButtonGroup>
            </Box>
            <Box className="scroll-styled" sx={{ maxHeight: "476px", overflowY: "auto" }}>
              {leaderBoardUsers.map((cur, idx) => (
                <Box
                  key={cur}
                  sx={{
                    p: "8px 20px",
                    height: "74px",
                    display: "flex",
                    alignItems: "center",
                    ":hover": {
                      backgroundColor: theme => theme.palette.common.notebookO900,
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: "56px",
                      height: "56px",
                      mr: "20px",
                      border: `solid 2px ${getColorFromLeaderboardUser(idx + 1)}`,
                      borderRadius: "50%",
                      position: "relative",
                    }}
                  >
                    <Image
                      src={NO_USER_IMAGE}
                      alt={"user-image"}
                      width="52px"
                      height="52px"
                      quality={40}
                      objectFit="cover"
                      style={{
                        borderRadius: "30px",
                      }}
                    />
                    <svg
                      width="46"
                      height="17"
                      viewBox="0 0 46 17"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ position: "absolute", bottom: "-1px", left: "3px" }}
                    >
                      <path
                        opacity="0.4"
                        d="M0 4.99882C3 10.4988 15.4021 16.5751 22.7069 16.5751C30.0117 16.5751 41 12.5 46 5C30.5003 -2.49824 6.01306 1.87455 0 4.99882Z"
                        fill={getColorFromLeaderboardUser(idx + 1)}
                      />
                    </svg>
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: "0px",
                        left: "0px",
                        right: "0px",
                        display: "grid",
                        placeItems: "center",
                      }}
                    >
                      <Typography sx={{ fontSize: "12px" }}>1</Typography>
                    </Box>
                  </Box>
                  <Box>
                    <Typography sx={{ mb: "4px" }}>Carl Johnson</Typography>
                    <Box sx={{ display: "flex" }}>
                      <Typography sx={{ mr: "6px" }}>999K</Typography>
                      <Box
                        sx={{
                          backgroundColor: theme => theme.palette.common.notebookG700,
                          borderRadius: "50%",
                          display: "grid",
                          placeItems: "center",
                          width: "20px",
                          height: "20px",
                        }}
                      >
                        <Check sx={{ fontSize: "12px", color: theme => theme.palette.common.success600 }} />
                      </Box>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};
