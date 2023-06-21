import { ISemesterStudentVoteStat, ISemesterStudentVoteStatDay } from "../../types/ICourse";
import { differentBetweenDays, getDateYYMMDDWithHyphens } from "./date.utils";

export type CalculateDailyStreakOutput = { dailyStreak: number; maxDailyStreak: number };

export const calculateDailyStreak = (
  semesterStudentStats: ISemesterStudentVoteStat,
  questionPerDay: number
): CalculateDailyStreakOutput => {
  const dailyCorrectPractices = calcMetricPerDay(semesterStudentStats.days);
  const sortedDailyCorrectPractices: DailyPoints = Object.fromEntries(
    Object.entries(dailyCorrectPractices)
      .sort(
        ([keyA], [keyB]) => Number(new Date(keyA.replaceAll("-", "/"))) - Number(new Date(keyB.replaceAll("-", "/")))
      )
      .reverse() // today, yesterday, ...
  );

  const streak = Object.keys(sortedDailyCorrectPractices).reduce(
    (
      acu: {
        dailyStreak: number;
        tmpDailyStreak: number;
        maxDailyStreak: number;
        lastDate: string;
        isConsecutive: boolean;
      },
      key
    ) => {
      const diff = differentBetweenDaysWithHyphens(acu.lastDate, key);
      const gotThePoint = sortedDailyCorrectPractices[key] >= questionPerDay;
      if (diff === 0) {
        if (gotThePoint) {
          const newDailyStreak = acu.tmpDailyStreak + 1;
          return {
            dailyStreak: acu.isConsecutive ? newDailyStreak : acu.dailyStreak,
            tmpDailyStreak: newDailyStreak,
            maxDailyStreak: Math.max(newDailyStreak, acu.maxDailyStreak),
            lastDate: key,
            isConsecutive: acu.isConsecutive,
          };
        } else {
          return { ...acu, lastDate: key };
        }
      }

      if (diff === 1) {
        if (gotThePoint) {
          const newDailyStreak = acu.tmpDailyStreak + 1;
          return {
            dailyStreak: acu.isConsecutive ? newDailyStreak : acu.dailyStreak,
            tmpDailyStreak: newDailyStreak,
            maxDailyStreak: Math.max(newDailyStreak, acu.maxDailyStreak),
            lastDate: key,
            isConsecutive: acu.isConsecutive,
          };
        }
      }
      return { ...acu, tmpDailyStreak: gotThePoint ? 1 : 0, lastDate: key, isConsecutive: false };
    },
    { dailyStreak: 0, tmpDailyStreak: 0, maxDailyStreak: 0, lastDate: getDateYYMMDDWithHyphens(), isConsecutive: true }
  );

  return { dailyStreak: streak.dailyStreak, maxDailyStreak: streak.maxDailyStreak };
};

export const getLastConsecutiveDaysWithoutGetDailyPoint = (
  semesterStudentStats: ISemesterStudentVoteStat,
  questionPerDay: number
): number => {
  const dailyCorrectPractices = calcMetricPerDay(semesterStudentStats.days);
  const sortedDailyCorrectPractices: DailyPoints = Object.fromEntries(
    Object.entries(dailyCorrectPractices)
      .sort(
        ([keyA], [keyB]) => Number(new Date(keyA.replaceAll("-", "/"))) - Number(new Date(keyB.replaceAll("-", "/")))
      )
      .reverse() // today, yesterday, ...
  );

  const res = Object.keys(sortedDailyCorrectPractices).reduce(
    (acu: { lastDate: string; consecutiveDays: number; ignore: boolean }, key) => {
      if (acu.ignore) return acu;

      const diff = differentBetweenDaysWithHyphens(acu.lastDate, key);
      const gotThePoint = sortedDailyCorrectPractices[key] >= questionPerDay;
      if (gotThePoint) return { ...acu, consecutiveDays: 0, ignore: true };
      return { ...acu, lastDate: key, consecutiveDays: acu.consecutiveDays + diff };
    },
    { lastDate: getDateYYMMDDWithHyphens(), consecutiveDays: 0, ignore: false }
  );

  return res.consecutiveDays;
};

export const differentBetweenDaysWithHyphens = (hyphenDate1: string, hyphenDate2: string): number => {
  const date1 = new Date(hyphenDate1.replaceAll("-", "/"));
  const date2 = new Date(hyphenDate2.replaceAll("-", "/"));
  return differentBetweenDays(date1, date2);
};

type DailyPoints = { [key: string]: number };
const calcMetricPerDay = (days: ISemesterStudentVoteStatDay[]): DailyPoints => {
  return days.reduce((acc: DailyPoints, day) => {
    const today = day.day;
    return { ...acc, [today]: (acc[today] ?? 0) + day["correctPractices"] };
  }, {});
};
