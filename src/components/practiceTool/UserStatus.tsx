import CheckIcon from "@mui/icons-material/Check";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { Box, Divider, IconButton, Stack, Typography } from "@mui/material";
import { getFirestore } from "firebase/firestore";
import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";

import { getSemesterById } from "../../client/serveless/semesters.serverless";
import { getSemesterStudentVoteStatsByIdAndStudent } from "../../client/serveless/semesterStudentVoteStat.serverless";
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
import { ISemester, ISemesterStudentVoteStat, ISemesterStudentVoteStatDay } from "../../types/ICourse";
import { PointsType } from "../PointsType";

const MAX_DAILY_VALUE = 24;

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

  const studentStrike = useMemo(() => {
    if (!semester) return 0;
    if (!semesterStudentVoteStats) return 0;

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
          //   height: "64px",
          p: "16px 20px 24px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: `solid 1px ${DESIGN_SYSTEM_COLORS.notebookG600}`,
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
                mr: "20px",
              }}
            >
              <Image
                src={user.imageUrl ?? ""}
                alt={`${user.uname} profile picture`}
                width="90px"
                height="90px"
                quality={80}
                objectFit="cover"
                style={{ borderRadius: "50%" }}
              />
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
                    studentStrike > 0 ? DESIGN_SYSTEM_COLORS.success500 : DESIGN_SYSTEM_COLORS.notebookScarlet
                  }`,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <Typography
                  fontSize={"16px"}
                  fontWeight={"500"}
                  color={studentStrike > 0 ? DESIGN_SYSTEM_COLORS.success500 : DESIGN_SYSTEM_COLORS.notebookScarlet}
                >
                  {studentStrike}
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
                  border: `solid 2px ${
                    daysValue[keyDate]
                      ? daysValue[keyDate].gotPoint === true
                        ? DESIGN_SYSTEM_COLORS.success500
                        : DESIGN_SYSTEM_COLORS.notebookScarlet
                      : DESIGN_SYSTEM_COLORS.notebookG200
                  }`,

                  color: daysValue[keyDate]
                    ? daysValue[keyDate].gotPoint === true
                      ? DESIGN_SYSTEM_COLORS.success500
                      : DESIGN_SYSTEM_COLORS.notebookScarlet
                    : DESIGN_SYSTEM_COLORS.notebookG200,
                  boxShadow:
                    daysValue[keyDate] && getTodayYYYYMMDD() === keyDate
                      ? `0 0 4px 2px ${
                          daysValue[keyDate].gotPoint === true
                            ? DESIGN_SYSTEM_COLORS.success500
                            : DESIGN_SYSTEM_COLORS.notebookScarlet
                        }`
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
            <Box sx={{ display: "grid", placeItems: "center", gap: "8px" }}>
              <Box
                sx={{
                  width: "60px",
                  height: "60px",
                  border: `solid 2px ${DESIGN_SYSTEM_COLORS.success500}`,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <Typography fontSize={"18px"} fontWeight={"500"} color={DESIGN_SYSTEM_COLORS.success500}>
                  {calculateDailyStreak(semesterStudentVoteStats, semester?.dailyPractice.numQuestionsPerDay ?? 0)}
                </Typography>
              </Box>
              <Typography sx={{ fontSize: "18px", fontWeight: "500", color: DESIGN_SYSTEM_COLORS.gray25 }}>
                Daily streak
              </Typography>
            </Box>
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
const calcMetricPerDay = (
  days: ISemesterStudentVoteStatDay[],
  metric: keyof Numbers<ISemesterStudentVoteStatDay>
): DailyPoints => {
  return days.reduce((acc: DailyPoints, day) => {
    const today = day.day;
    return { ...acc, [today]: acc[today] ? (acc[today] = acc[today] + day[metric]) : day[metric] };
  }, {});
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
const calculateDailyStreak = (semesterStudentStats: ISemesterStudentVoteStat, questionPerDay: number): number => {
  const dailyCorrectPractices = calcMetricPerDay(semesterStudentStats.days, "correctPractices");
  const sortedDailyCorrectPractices: DailyPoints = Object.fromEntries(
    Object.entries(dailyCorrectPractices).sort(([keyA], [keyB]) => keyB.localeCompare(keyA))
  );

  const dailyKeys = Object.keys(sortedDailyCorrectPractices);

  const streak = Object.keys(sortedDailyCorrectPractices).reduce(
    (streak: { counter: number; lastDate: string }, key) => {
      if (getTodayYYYYMMDD() < key) return streak;
      if (streak.lastDate && substractDatesIntoDays(streak.lastDate, key) > 1) return streak;

      if (getTodayYYYYMMDD() === dailyKeys[0] && sortedDailyCorrectPractices[key] < questionPerDay)
        return (streak = { counter: streak.counter, lastDate: key });

      if (sortedDailyCorrectPractices[key] >= questionPerDay) {
        return (streak = { counter: streak.counter + 1, lastDate: key });
      }
      return streak;
    },
    { counter: 0, lastDate: getTodayYYYYMMDD() }
  );

  return streak.counter;
};

const substractDatesIntoDays = (date1: string, date2: string): number => {
  const diffTime = Math.abs(new Date(date2).getTime() - new Date(date1).getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const getTodayYYYYMMDD = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
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
