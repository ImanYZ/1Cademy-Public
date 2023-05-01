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
  getWeekNumber,
  moveDateByDays,
  SHORT_MONTH_NAMES,
} from "../../lib/utils/date.utils";
import { ISemester, ISemesterStudentVoteStat } from "../../types/ICourse";
import { PointsType } from "../PointsType";
import { filterDayStatsByWeek } from "./Leaderboard";

const MAX_DAILY_VALUE = 24;
const DAYS_LABEL = ["M", "T", "W", "T", "F", "S", "S"];

type DailyPoint = { value: number; gotPoint: boolean };

type WeekInfo = { weekNumber: number; dates: Date[] };

type UserStatusProps = {
  user: User;
  semesterId: string;
  displayTitle?: boolean;
};

export const UserStatus = ({ user, semesterId, displayTitle = true }: UserStatusProps) => {
  const db = getFirestore();
  const [daysValue, setDaysValue] = useState<DailyPoint[]>([]);
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

  const practiceDaysInfo: PracticeDayInfo = useMemo(() => {
    if (!semester || !semesterStudentVoteStats) return { successPracticeDays: 0, totalPracticeDays: 0 };
    return getDaysInSemester(semester, semesterStudentVoteStats, semester.dailyPractice.numQuestionsPerDay);
  }, [semester, semesterStudentVoteStats]);

  useEffect(() => {
    const getSemesterStudentVotesStats = async () => {
      const res = await getSemesterStudentVoteStatsByIdAndStudent(db, semesterId, user.uname);
      if (!res) return;
      console.log("res123", res);
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
      weekInfo.weekNumber,
      semester.dailyPractice.numQuestionsPerDay
    );
    console.log({ dailyq: res[0] });
    setDaysValue(res);
    console.log("res345", { res });
  }, [semester, semesterStudentVoteStats, weekInfo.weekNumber]);

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
        <Box sx={{ display: "flex" }}>
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
            {DAYS_LABEL.map((cur, idx) => (
              <Box
                key={idx}
                sx={{
                  width: "35px",
                  height: "35px",
                  display: "grid",
                  placeItems: "center",
                  borderRadius: "50%",
                  border: `solid 2px ${
                    daysValue[idx]
                      ? daysValue[idx].gotPoint === true
                        ? DESIGN_SYSTEM_COLORS.success500
                        : DESIGN_SYSTEM_COLORS.notebookScarlet
                      : DESIGN_SYSTEM_COLORS.notebookG200
                  }`,

                  color: daysValue[idx]
                    ? daysValue[idx].gotPoint === true
                      ? DESIGN_SYSTEM_COLORS.success500
                      : DESIGN_SYSTEM_COLORS.notebookScarlet
                    : DESIGN_SYSTEM_COLORS.notebookG200,
                }}
              >
                <Typography fontSize={"16px"} fontWeight={"500"} color={"inherit"}>
                  {DAYS_LABEL[idx]}
                </Typography>
              </Box>
            ))}
          </Stack>
          <Stack spacing={"20px"} alignItems={"center"} sx={{ width: "100%" }}>
            {daysValue.map((cur, idx) => (
              <Box key={idx} sx={{ width: "100%", display: "flex", alignItems: "center" }}>
                <Box
                  sx={{
                    height: "35px",
                    width: `${(cur.value * 100) / MAX_DAILY_VALUE}%`,
                    backgroundColor: cur.gotPoint
                      ? DESIGN_SYSTEM_COLORS.success500
                      : DESIGN_SYSTEM_COLORS.notebookScarlet,
                    mr: "12px",
                    borderRadius: "0px 3px 3px 0px",
                  }}
                />
                <Typography sx={{ fontWeight: 500 }}>{cur.value}</Typography>
              </Box>
            ))}
          </Stack>
        </Stack>
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
              {calculateDailyStreak(semesterStudentVoteStats)}
            </Typography>
          </Box>
          <Typography sx={{ fontSize: "18px", fontWeight: "500", color: DESIGN_SYSTEM_COLORS.gray25 }}>
            Daily streak
          </Typography>
        </Box>
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
  weekNumber: number,
  numQuestionsPerDay: number
): DailyPoint[] => {
  const dayStats = filterDayStatsByWeek(semesterStudentStats.days, weekNumber);
  const dayStatsSorted = dayStats.sort((a, b) => new Date(a.day).getDay() - new Date(b.day).getDay());
  return dayStatsSorted.map(cur => ({
    value: cur.correctPractices ?? 0,
    gotPoint: cur.correctPractices >= numQuestionsPerDay,
  }));
};

type DailyStreak = { max: number; newMax: number; previousDate: string };

const calculateDailyStreak = (semesterStudentStats: ISemesterStudentVoteStat): number => {
  const dailyStreakResult: DailyStreak = semesterStudentStats.days.reduce(
    (acu: DailyStreak, cur) => {
      if (!acu.previousDate) return { max: 0, newMax: 0, previousDate: cur.day };
      const diff = differentBetweenDays(new Date(acu.previousDate), new Date(cur.day));
      if (diff > 1) return { max: acu.max > acu.newMax ? acu.max : acu.newMax, newMax: 0, previousDate: cur.day };
      return { max: acu.max, newMax: acu.newMax + 1, previousDate: cur.day };
    },
    { max: 0, newMax: 0, previousDate: "" }
  );
  return dailyStreakResult.max > dailyStreakResult.newMax ? dailyStreakResult.max : dailyStreakResult.newMax;
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
