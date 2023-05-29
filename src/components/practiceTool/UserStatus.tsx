import CheckIcon from "@mui/icons-material/Check";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { Box, Divider, IconButton, PaletteMode, Stack, Typography } from "@mui/material";
import { getFirestore } from "firebase/firestore";
import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";

import { getAvatarName } from "@/lib/utils/Map.utils";

import { getSemesterById } from "../../client/firestore/semesters.firestore";
import { getSemesterStudentVoteStatsByIdAndStudent } from "../../client/firestore/semesterStudentVoteStat.firestores";
import { User } from "../../knowledgeTypes";
import { DESIGN_SYSTEM_COLORS } from "../../lib/theme/colors";
import {
  differentBetweenDays,
  getDatesOfWeek,
  getDateYYMMDDWithHyphens,
  getWeekNumber,
  moveDateByDays,
  SHORT_MONTH_NAMES,
} from "../../lib/utils/date.utils";
import { calculateDailyStreak, CalculateDailyStreakOutput } from "../../lib/utils/userStatus.utils";
import { ISemester, ISemesterStudentVoteStat, ISemesterStudentVoteStatDay } from "../../types/ICourse";
import { PointsType } from "../PointsType";

const MAX_DAILY_VALUE = 24;
const DEFAULT_AVATAR = "https://storage.googleapis.com/onecademy-1.appspot.com/ProfilePictures/no-img.png";

type DailyPoint = {
  [key: string]: { value: number; gotPoint: boolean };
};

type WeekInfo = { weekNumber: number; dates: Date[] };

type UserStatusProps = {
  user: User;
  semesterId: string;
  displayTitle?: boolean;
  displayFooterStreak?: boolean;
  displayHeaderStreak?: boolean;
};

export const UserStatus = ({
  user,
  semesterId,
  displayTitle = true,
  displayFooterStreak = true,
  displayHeaderStreak = false,
}: UserStatusProps) => {
  const db = getFirestore();
  const [daysValue, setDaysValue] = useState<DailyPoint>({});
  const [semester, setSemester] = useState<ISemester | null>(null);
  const [semesterStudentVoteStats, setSemesterStudentVoteStats] = useState<ISemesterStudentVoteStat | null>(null);
  const [weekInfo, setWeekInfo] = useState<WeekInfo>({
    weekNumber: getWeekNumber(),
    dates: getDatesOfWeek(),
  });
  const onNextWeek = () => {
    setWeekInfo(prev => ({
      weekNumber: prev.weekNumber + 1,
      dates: prev.dates.map(cur => moveDateByDays(cur, 7)),
    }));
  };

  const onPreviousWeek = () => {
    setWeekInfo(prev => ({
      weekNumber: prev.weekNumber - 1,
      dates: prev.dates.map(cur => moveDateByDays(cur, -7)),
    }));
  };

  const currentWeek = useMemo(() => {
    return weekInfo.dates.reduce((acc: { [key: string]: string }, cur) => {
      const dateKey = getDateYYMMDDWithHyphens(cur);
      return {
        ...acc,
        [dateKey]: cur.toLocaleDateString("en-US", { weekday: "long" }).charAt(0).toUpperCase(),
      };
    }, {});
  }, [weekInfo.dates]);

  const practiceDaysInfo: PracticeDayInfo = useMemo(() => {
    if (!semester || !semesterStudentVoteStats) return { successPracticeDays: 0, totalPracticeDays: 0 };
    return getDaysInSemester(semester, semesterStudentVoteStats, semester.dailyPractice.numQuestionsPerDay);
  }, [semester, semesterStudentVoteStats]);

  useEffect(() => {
    const getSemesterStudentVotesStats = async () => {
      const res = await getSemesterStudentVoteStatsByIdAndStudent(db, semesterId, user.uname);
      if (!res) return;
      setSemesterStudentVoteStats(res);
    };
    const getSemester = async () => {
      const res = await getSemesterById(db, semesterId);
      if (!res) return;

      setSemester(res);
    };
    getSemesterStudentVotesStats();
    getSemester();
  }, [db, semesterId, user.uname]);

  useEffect(() => {
    if (!semester) return;
    if (!semesterStudentVoteStats) return;

    const res = mapSemesterStudentStatsToWeekStats(
      semesterStudentVoteStats,
      weekInfo.dates.map(date => getDateYYMMDDWithHyphens(date)),
      semester.dailyPractice.numQuestionsPerDay
    );

    setDaysValue(res);
  }, [semester, semesterStudentVoteStats, weekInfo.dates]);

  const studentStrike: CalculateDailyStreakOutput = useMemo(() => {
    console.log("x11");
    if (!semester) return { dailyStreak: 0, maxDailyStreak: 0 };
    console.log("x12");
    if (!semesterStudentVoteStats) return { dailyStreak: 0, maxDailyStreak: 0 };
    console.log("x13");

    return calculateDailyStreak(semesterStudentVoteStats, semester.dailyPractice.numQuestionsPerDay);
  }, [semester, semesterStudentVoteStats]);

  if (!semesterStudentVoteStats) return null;

  return (
    <Box>
      {displayTitle && (
        <Box sx={{ width: "100%", height: "64px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <LeaderboardIcon sx={{ color: DESIGN_SYSTEM_COLORS.yellow400, mr: "12px" }} />
          <Typography sx={{ fontSize: "18px", fontWeight: 500 }}>Your Status</Typography>
        </Box>
      )}
      <Box
        sx={{
          p: "16px 20px 24px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: `solid 1px ${DESIGN_SYSTEM_COLORS.gray300}`,
        }}
      >
        <Box sx={{ width: "100%", display: "flex", justifyContent: "space-betweens" }}>
          <Stack direction={"row"} flex={1}>
            <Box
              sx={{
                width: "90px",
                height: "90px",
                borderRadius: "50%",
                color: theme => theme.palette.common.gray,
                background: "linear-gradient(143.7deg, #FDC830 15.15%, #F37335 83.11%);",
                mr: "20px",
              }}
            >
              {user.imageUrl && user.imageUrl !== DEFAULT_AVATAR ? (
                <Image
                  src={user.imageUrl ?? ""}
                  alt={`${user.uname} profile picture`}
                  width="90px"
                  height="90px"
                  quality={80}
                  objectFit="cover"
                  style={{ borderRadius: "50%" }}
                />
              ) : (
                <Box sx={{ width: "100%", height: "100%", display: "grid", placeItems: "center" }}>
                  <Typography sx={{ fontSize: "32px", fontWeight: "600", color: DESIGN_SYSTEM_COLORS.baseWhite }}>
                    {getAvatarName(user.fName ?? "", user.lName ?? "")}
                  </Typography>
                </Box>
              )}
            </Box>
            <Stack spacing={"6px"}>
              <Typography sx={{ fontWeight: 500, fontSize: "20px" }}>{`${user.fName} ${user.lName}`}</Typography>
              <Stack direction={"row"} spacing="12px">
                <PointsType points={semesterStudentVoteStats.totalPractices ?? 0} fontWeight={400}>
                  <CheckIcon sx={{ color: DESIGN_SYSTEM_COLORS.success600, fontSize: "16px" }} />
                </PointsType>
              </Stack>
              <Typography
                fontWeight={"500"}
              >{`Days in semester ${practiceDaysInfo.successPracticeDays}/${practiceDaysInfo.totalPracticeDays}`}</Typography>
            </Stack>
          </Stack>
          {displayHeaderStreak && (
            <Box sx={{ display: "grid", placeItems: "center", gap: "6px" }}>
              <Box
                sx={{
                  width: "48px",
                  height: "48px",
                  border: `solid 2px ${
                    studentStrike.dailyStreak > 0
                      ? DESIGN_SYSTEM_COLORS.success500
                      : DESIGN_SYSTEM_COLORS.notebookScarlet
                  }`,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <Typography
                  fontSize={"16px"}
                  fontWeight={"500"}
                  color={
                    studentStrike.dailyStreak > 0
                      ? DESIGN_SYSTEM_COLORS.success500
                      : DESIGN_SYSTEM_COLORS.notebookScarlet
                  }
                >
                  {studentStrike.dailyStreak}
                </Typography>
              </Box>
              <Typography sx={{ fontSize: "16px", color: DESIGN_SYSTEM_COLORS.gray25 }}>Daily streak</Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* body */}
      <Box>
        <Box sx={{ p: "24px 20px 20px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography sx={{ fontSize: "18px" }}>Daily Progress</Typography>
          <Stack direction={"row"} alignItems="center" spacing={"18px"}>
            <IconButton onClick={onPreviousWeek} sx={{ p: "2px", color: DESIGN_SYSTEM_COLORS.primary800 }}>
              <NavigateBeforeIcon />
            </IconButton>
            <Typography>{weekInfoToString(weekInfo)}</Typography>
            <IconButton onClick={onNextWeek} sx={{ p: "2px", color: DESIGN_SYSTEM_COLORS.primary800 }}>
              <NavigateNextIcon />
            </IconButton>
          </Stack>
        </Box>
        <Stack direction={"row"} spacing={"12px"} sx={{ p: "8px 20px 24px 20px" }}>
          <Stack spacing={"20px"} sx={{ width: "51px", borderRight: `solid 1px ${DESIGN_SYSTEM_COLORS.notebookG600}` }}>
            {Object.keys(currentWeek).map((keyDate, idx) => (
              <Box
                key={idx}
                sx={{
                  width: "35px",
                  height: "35px",
                  display: "grid",
                  placeItems: "center",
                  borderRadius: "50%",
                  border: theme => `solid 2px ${getDailyCircleColor(theme.palette.mode, daysValue[keyDate])}`,
                  color: theme => getDailyCircleColor(theme.palette.mode, daysValue[keyDate]),
                  boxShadow: theme =>
                    getDateYYMMDDWithHyphens() === keyDate
                      ? `0 0 4px 2px ${getDailyCircleColor(theme.palette.mode, daysValue[keyDate])}`
                      : undefined,
                }}
              >
                <Typography fontSize={"16px"} fontWeight={"500"} color={"inherit"}>
                  {currentWeek[keyDate]}
                </Typography>
              </Box>
            ))}
          </Stack>
          <Stack spacing={"20px"} alignItems={"center"} sx={{ width: "100%" }}>
            {Object.keys(currentWeek).map(keyDate => (
              <Box key={keyDate} sx={{ width: "100%", display: "flex", alignItems: "center" }}>
                <Box
                  sx={{
                    height: "35px",
                    width: `${daysValue[keyDate] ? (daysValue[keyDate].value * 100) / MAX_DAILY_VALUE : 0}%`,
                    backgroundColor: daysValue[keyDate]
                      ? daysValue[keyDate].gotPoint
                        ? DESIGN_SYSTEM_COLORS.success500
                        : DESIGN_SYSTEM_COLORS.notebookScarlet
                      : undefined,
                    mr: "12px",
                    borderRadius: "3px",
                  }}
                />
                <Typography sx={{ fontWeight: 500 }}>{daysValue[keyDate] ? daysValue[keyDate].value : ""}</Typography>
              </Box>
            ))}
          </Stack>
        </Stack>
        {displayFooterStreak && (
          <>
            <Divider sx={{ mb: "24px" }} />
            <Stack direction={"row"} spacing="16px" justifyContent={"center"}>
              <Box
                sx={{
                  width: "60px",
                  height: "60px",
                  border: `solid 2px ${
                    studentStrike.dailyStreak > 0
                      ? DESIGN_SYSTEM_COLORS.success500
                      : DESIGN_SYSTEM_COLORS.notebookScarlet
                  }`,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <Typography
                  fontSize={"18px"}
                  fontWeight={"500"}
                  color={
                    studentStrike.dailyStreak > 0
                      ? DESIGN_SYSTEM_COLORS.success500
                      : DESIGN_SYSTEM_COLORS.notebookScarlet
                  }
                >
                  {studentStrike.dailyStreak}
                </Typography>
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontSize: "18px",
                    fontWeight: "500",
                    color: theme =>
                      theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.gray25 : DESIGN_SYSTEM_COLORS.gray800,
                  }}
                >
                  Daily streak
                </Typography>
                <Typography
                  sx={{
                    color: theme =>
                      theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG200 : DESIGN_SYSTEM_COLORS.gray500,
                  }}
                >
                  Highest daily streak: {studentStrike.maxDailyStreak}
                </Typography>
              </Box>
            </Stack>
          </>
        )}
      </Box>
    </Box>
  );
};

/**
 * will represent week like this: July 12 - 18
 */
const weekInfoToString = (weekInfo: WeekInfo) => {
  const lastDate = weekInfo.dates[weekInfo.dates.length - 1];
  const firstDate = weekInfo.dates[0];
  const monthIdx = lastDate.getMonth();
  return `${SHORT_MONTH_NAMES[monthIdx]} ${firstDate.getDate()}-${lastDate.getDate()}`;
};

const mapSemesterStudentStatsToWeekStats = (
  semesterStudentStats: ISemesterStudentVoteStat,
  weekdays: string[],
  numQuestionsPerDay: number
): DailyPoint => {
  const weeklyStatsByDay = getWeeklyMetric(semesterStudentStats.days, "correctPractices", weekdays);
  return Object.keys(weeklyStatsByDay).reduce((acc: DailyPoint, key) => {
    return {
      ...acc,
      [key]: {
        value: weeklyStatsByDay[key] ?? 0,
        gotPoint: weeklyStatsByDay[key] >= numQuestionsPerDay,
      },
    };
  }, {});
};

type Numbers<T> = Pick<
  T,
  {
    [K in keyof T]: T[K] extends number ? K : never;
  }[keyof T]
>;

type DailyPoints = {
  [key: string]: number;
};
const getWeeklyMetric = (
  days: ISemesterStudentVoteStatDay[],
  metric: keyof Numbers<ISemesterStudentVoteStatDay>,
  weekdays: string[]
): DailyPoints => {
  return days.reduce((acc: DailyPoints, day) => {
    const date = day.day;
    if (!weekdays.includes(date)) return acc;

    return { ...acc, [date]: acc[date] ? (acc[date] = acc[date] + day[metric]) : day[metric] };
  }, {});
};

type PracticeDayInfo = { successPracticeDays: number; totalPracticeDays: number };

const getDaysInSemester = (
  semester: ISemester,
  semesterStudentStats: ISemesterStudentVoteStat,
  numQuestionsPerDay: number
): PracticeDayInfo => {
  const endDate = semester.dailyPractice.endDate.toDate();
  const startDate = semester.dailyPractice.startDate.toDate();
  const totalPracticeDays = differentBetweenDays(endDate, startDate);
  const successPracticeDays = semesterStudentStats.days.filter(
    cur => cur.correctPractices >= numQuestionsPerDay
  ).length;
  return { successPracticeDays, totalPracticeDays };
};

const getDailyCircleColor = (theme: PaletteMode, dailyPoint?: { value: number; gotPoint: boolean }) => {
  if (!dailyPoint) return theme === "dark" ? DESIGN_SYSTEM_COLORS.primary800 : DESIGN_SYSTEM_COLORS.primary600;
  if (dailyPoint.gotPoint) return DESIGN_SYSTEM_COLORS.success500;
  return DESIGN_SYSTEM_COLORS.notebookScarlet;
};
