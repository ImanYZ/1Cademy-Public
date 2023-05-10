import CheckIcon from "@mui/icons-material/Check";
import { Box, Button, ButtonGroup, SxProps, Theme, Typography } from "@mui/material";
import { getFirestore } from "firebase/firestore";
import Image from "next/image";
import React, { useEffect, useState } from "react";

import { getAvatarName } from "@/lib/utils/Map.utils";

import { getSemesterById } from "../../client/serveless/semesters.serverless";
import { getSemesterStudentVoteStats } from "../../client/serveless/semesterStudentVoteStat.serverless";
import { DESIGN_SYSTEM_COLORS } from "../../lib/theme/colors";
import { NO_USER_IMAGE } from "../../lib/utils/constants";
import { getWeekNumber } from "../../lib/utils/date.utils";
import { ISemesterStudentVoteStat, ISemesterStudentVoteStatDay } from "../../types/ICourse";
import { PointsType } from "../PointsType";

type UsersInfo = { [key: string]: { name: string; imageUrl: string; fName: string; lName: string } };
type LeaderboardOption = "WEEK" | "MONTH" | "ALL_TIME";
type LeaderboardItem = { uname: string; totalPoints: number };
type LeaderboardProps = {
  semesterId: string;
  sxBody?: SxProps<Theme>;
};

const DEFAULT_AVATAR = "https://storage.googleapis.com/onecademy-1.appspot.com/ProfilePictures/no-img.png";

const Leaderboard = ({ semesterId, sxBody }: LeaderboardProps) => {
  console.log({ semesterId });
  const db = getFirestore();
  const [usersInfo, setUsersInfo] = useState<UsersInfo>({});
  const [leaderBoardUsers, setLeaderBoardUSers] = useState<LeaderboardItem[]>([]);
  const [selectedLeaderboardOption, setSelectedLeaderboardOption] = useState<LeaderboardOption>("WEEK");
  const [studentStatsBySemester, setStudentStatsBySemester] = useState<ISemesterStudentVoteStat[]>([]);

  useEffect(() => {
    const getStudentsStatsBySemester = async () => {
      const res = await getSemesterStudentVoteStats(db, semesterId);
      console.log("1ress", { res });
      setStudentStatsBySemester(res);
    };

    const getSemester = async () => {
      const res = await getSemesterById(db, semesterId);
      if (!res) return;
      const usersInfoBySemester = res.students.reduce(
        (acu, cur): UsersInfo => ({
          ...acu,
          [cur.uname]: {
            imageUrl: cur.imageUrl,
            name: `${cur.fName} ${cur.lName}`,
            fName: cur.fName,
            lName: cur.lName,
          },
        }),
        {}
      );
      setUsersInfo(usersInfoBySemester);
    };
    getStudentsStatsBySemester();
    getSemester();
  }, [db, semesterId]);

  useEffect(() => {
    const res = mapSemesterStudentVoteStatToLeaderboard(studentStatsBySemester, selectedLeaderboardOption);
    console.log("2ress", { res });
    setLeaderBoardUSers(res);
  }, [selectedLeaderboardOption, studentStatsBySemester]);

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
            key={cur.uname}
            sx={{
              p: "8px 20px",
              height: "74px",
              display: "flex",
              alignItems: "center",
              borderRadius: "4px",
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
                background: "linear-gradient(143.7deg, #FDC830 15.15%, #F37335 83.11%);",
              }}
            >
              {usersInfo[cur.uname]?.imageUrl && usersInfo[cur.uname]?.imageUrl !== DEFAULT_AVATAR ? (
                <Image
                  src={usersInfo[cur.uname]?.imageUrl ?? NO_USER_IMAGE}
                  alt={"user-image"}
                  width="52px"
                  height="52px"
                  quality={40}
                  objectFit="cover"
                  style={{
                    borderRadius: "30px",
                  }}
                />
              ) : (
                <Box sx={{ width: "100%", height: "100%", display: "grid", placeItems: "center" }}>
                  <Typography sx={{ fontSize: "16px", fontWeight: "600", color: DESIGN_SYSTEM_COLORS.baseWhite }}>
                    {getAvatarName(usersInfo[cur.uname]?.fName, usersInfo[cur.uname]?.lName)}
                  </Typography>
                </Box>
              )}
              <svg
                width="46"
                height="17"
                viewBox="0 0 46 17"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ position: "absolute", bottom: "-1px", left: "3px", fontWeight: "bold" }}
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
                <Typography sx={{ fontSize: "12px", fontWeight: "600" }}>{idx + 1}</Typography>
              </Box>
            </Box>
            <Box>
              <Typography sx={{ mb: "4px" }}>{usersInfo[cur.uname]?.name ?? cur.uname}</Typography>

              <PointsType points={cur.totalPoints} fontWeight={400}>
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

export const filterDayStatsByWeek = (dayStats: ISemesterStudentVoteStatDay[], weekNumber: number) => {
  // dayStats.day: YY-MM-DD

  return dayStats.filter(cur => getWeekNumber(new Date(cur.day.replace("-", " "))) === weekNumber);
};

const filterDayStatsByLastWeek = (dayStats: ISemesterStudentVoteStatDay[]) => {
  // dayStats.day: YY-MM-DD
  const currentWeekNumber = getWeekNumber(new Date());
  return filterDayStatsByWeek(dayStats, currentWeekNumber);
};

const filterDayStatsByLastMonth = (dayStats: ISemesterStudentVoteStatDay[]) => {
  // dayStats.day: YY-MM-DD
  const currentWeekNumber = new Date().getMonth();
  return dayStats.filter(cur => new Date(cur.day.replace("-", " ")).getMonth() === currentWeekNumber);
};

const filterDaysStatsByOption = (option: LeaderboardOption, dayStats: ISemesterStudentVoteStatDay[]) => {
  if (option === "WEEK") return filterDayStatsByLastWeek(dayStats);
  if (option === "MONTH") return filterDayStatsByLastMonth(dayStats);
  if (option === "ALL_TIME") return dayStats;
  return [];
};

const mapSemesterStudentVoteStatToLeaderboard = (
  stats: ISemesterStudentVoteStat[],
  option: LeaderboardOption
): LeaderboardItem[] => {
  // move to backend to not get unused data
  return stats.map(cur => {
    const statDaysFiltered = filterDaysStatsByOption(option, cur.days);
    console.log({ statDaysFiltered });
    const totalPoints = statDaysFiltered.reduce((acu, cur) => acu + (cur?.totalPractices ?? 0), 0);
    console.log({ totalPoints });
    return { uname: cur.uname, totalPoints };
  });
};
