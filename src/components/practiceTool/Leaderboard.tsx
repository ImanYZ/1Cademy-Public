import CheckIcon from "@mui/icons-material/Check";
import { Box, Button, ButtonGroup, SxProps, Theme, Typography } from "@mui/material";
import Image from "next/image";
import React, { useEffect, useState } from "react";

import { DESIGN_SYSTEM_COLORS } from "../../lib/theme/colors";
import { NO_USER_IMAGE } from "../../lib/utils/constants";
import { PointsType } from "../PointsType";

type LeaderBoardOption = "WEEK" | "MONTH" | "ALL_TIME";
type LeaderboardProps = {
  sxBody?: SxProps<Theme>;
};

const Leaderboard = ({ sxBody }: LeaderboardProps) => {
  const [leaderBoardUsers, setLeaderBoardUSers] = useState<number[]>([]);
  const [selectedLeaderboardOption, setSelectedLeaderboardOption] = useState<LeaderBoardOption>("WEEK");
  // TODO: get ISemesterStudentVoteStat by uname and semester
  // const mapSemesterStudentVoteStatToLeaderboard = (stats: ISemesterStudentVoteStat, option: LeaderBoardOption) => {
  //   // move to backend to not get unrequired data
  // };

  useEffect(() => {
    if (selectedLeaderboardOption === "WEEK") setLeaderBoardUSers([1, 2, 3, 4, 5]);
    if (selectedLeaderboardOption === "MONTH") setLeaderBoardUSers([1, 2, 3, 4, 5, 6]);
    if (selectedLeaderboardOption === "ALL_TIME") setLeaderBoardUSers([1, 2, 3, 4, 5, 7, 8]);
  }, [selectedLeaderboardOption]);

  return (
    <Box sx={{ width: "100%", height: "100%" }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          height: "112px",
          borderBottom: theme => `solid 1px ${theme.palette.common.notebookG600}`,
        }}
      >
        <Box sx={{ my: "18px", display: "flex", alignItems: "center" }}>
          <svg width="24" height="19" viewBox="0 0 24 19" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12.4001 18.6H4.49407L0.799999 7.61995L7.39409 10.2725L12.4001 0.200012L17.406 10.2725L24 7.61995L20.3061 18.6H12.4001Z"
              fill="#FAC515"
            />
          </svg>
          <Typography
            sx={{
              ml: "12px",
              color: theme =>
                theme.palette.mode === "dark" ? theme.palette.common.gray25 : theme.palette.common.gray900,
              fontSize: "24px",
              fontWeight: 500,
            }}
          >
            Leaderboard
          </Typography>
        </Box>
        <ButtonGroup
          variant="contained"
          aria-label="leaderboard options"
          sx={{
            "& .MuiButtonGroup-grouped:not(:last-of-type)": {
              borderWidth: "0px",
            },
          }}
        >
          <Button
            onClick={() => setSelectedLeaderboardOption("WEEK")}
            sx={{
              height: "28px",
              p: "4px 14px",
              background: theme =>
                theme.palette.mode === "dark"
                  ? selectedLeaderboardOption === "WEEK"
                    ? theme.palette.common.primary800
                    : theme.palette.common.notebookG600
                  : selectedLeaderboardOption === "WEEK"
                  ? theme.palette.common.primary600
                  : theme.palette.common.gray200,
              color: theme =>
                selectedLeaderboardOption === "WEEK"
                  ? theme.palette.common.primary25
                  : theme.palette.mode === "dark"
                  ? theme.palette.common.gray25
                  : theme.palette.common.gray800,
            }}
          >
            Week
          </Button>
          <Button
            onClick={() => setSelectedLeaderboardOption("MONTH")}
            sx={{
              height: "28px",
              p: "4px 14px",
              background: theme =>
                theme.palette.mode === "dark"
                  ? selectedLeaderboardOption === "MONTH"
                    ? theme.palette.common.primary800
                    : theme.palette.common.notebookG600
                  : selectedLeaderboardOption === "MONTH"
                  ? theme.palette.common.primary600
                  : theme.palette.common.gray200,
              color: theme =>
                selectedLeaderboardOption === "MONTH"
                  ? theme.palette.common.primary25
                  : theme.palette.mode === "dark"
                  ? theme.palette.common.gray25
                  : theme.palette.common.gray800,
            }}
          >
            Month
          </Button>
          <Button
            onClick={() => setSelectedLeaderboardOption("ALL_TIME")}
            sx={{
              height: "28px",
              p: "4px 14px",
              background: theme =>
                theme.palette.mode === "dark"
                  ? selectedLeaderboardOption === "ALL_TIME"
                    ? theme.palette.common.primary800
                    : theme.palette.common.notebookG600
                  : selectedLeaderboardOption === "ALL_TIME"
                  ? theme.palette.common.primary600
                  : theme.palette.common.gray200,
              color: theme =>
                selectedLeaderboardOption === "ALL_TIME"
                  ? theme.palette.common.primary25
                  : theme.palette.mode === "dark"
                  ? theme.palette.common.gray25
                  : theme.palette.common.gray800,
            }}
          >
            All Time
          </Button>
        </ButtonGroup>
      </Box>
      <Box className="scroll-styled" sx={{ py: "18px", overflowY: "auto", ...sxBody }}>
        {leaderBoardUsers.map((cur, idx) => (
          <Box
            key={cur}
            sx={{
              p: "8px 20px",
              height: "74px",
              display: "flex",
              alignItems: "center",
              ":hover": {
                backgroundColor: theme =>
                  theme.palette.mode === "dark" ? theme.palette.common.notebookO900 : theme.palette.common.primary25,
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

              <PointsType points={999} fontWeight={400}>
                <CheckIcon sx={{ color: DESIGN_SYSTEM_COLORS.success600, fontSize: "16px" }} />
              </PointsType>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default Leaderboard;

const getColorFromLeaderboardUser = (position: number) => {
  if (position === 1) return "#FAC515";
  if (position === 2) return "#98A2B3";
  if (position === 3) return "#FFA168";
  return "#A4A4A4";
};
