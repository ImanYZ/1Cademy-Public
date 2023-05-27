import { ISemesterStudentVoteStat, ISemesterStudentVoteStatDay } from "../../types/ICourse";
import { differentBetweenDays, getDateYYMMDDWithHyphens } from "./date.utils";

export type CalculateDailyStreakOutput = { dailyStreak: number; maxDailyStreak: number };

export const calculateDailyStreak = (
  semesterStudentStats: ISemesterStudentVoteStat,
  questionPerDay: number
): CalculateDailyStreakOutput => {
  const dailyCorrectPractices = calcMetricPerDay(semesterStudentStats.days);
  const sortedDailyCorrectPractices: DailyPoints = Object.fromEntries(
    Object.entries(dailyCorrectPractices).sort(
      ([keyA], [keyB]) => Number(new Date(keyA.replaceAll("-", "/"))) - Number(new Date(keyB.replaceAll("-", "/")))
    )
  );

  const streak = Object.keys(sortedDailyCorrectPractices).reduce(
    (acu: { dailyStreak: number; maxDailyStreak: number; lastDate: string }, key) => {
      if (differentBetweenDaysWithHyphens(getDateYYMMDDWithHyphens(), key) < 0) return acu;
      if (differentBetweenDaysWithHyphens(getDateYYMMDDWithHyphens(), key) === 0) {
        if (sortedDailyCorrectPractices[key] < questionPerDay) return acu; // if there is not daily point, use previous
        const newDailyStreak = acu.dailyStreak + 1;
        return {
          dailyStreak: newDailyStreak,
          maxDailyStreak: Math.max(newDailyStreak, acu.maxDailyStreak),
          lastDate: key,
        };
      }
      if (differentBetweenDaysWithHyphens(key, acu.lastDate) === 1) {
        // next day
        if (sortedDailyCorrectPractices[key] < questionPerDay) return { ...acu, dailyStreak: 0, lastDate: key }; // if there is not daily point, use previous
        const newDailyStreak = acu.dailyStreak + 1;
        return {
          dailyStreak: newDailyStreak,
          maxDailyStreak: Math.max(newDailyStreak, acu.maxDailyStreak),
          lastDate: key,
        };
      }
      // many days of separations
      if (sortedDailyCorrectPractices[key] < questionPerDay) return { ...acu, dailyStreak: 0, lastDate: key }; // if there is not daily point, use previous
      return { dailyStreak: 1, maxDailyStreak: Math.max(1, acu.maxDailyStreak), lastDate: key };
    },
    { dailyStreak: 0, maxDailyStreak: 0, lastDate: getDateYYMMDDWithHyphens() }
  );

  return { dailyStreak: streak.dailyStreak, maxDailyStreak: streak.maxDailyStreak };
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
