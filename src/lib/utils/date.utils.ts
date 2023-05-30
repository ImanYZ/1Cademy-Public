// export const MONTHS = [
//   "January",
//   "February",
//   "March",
//   "April",
//   "May",
//   "June",
//   "July",
//   "August",
//   "September",
//   "October",
//   "November",
//   "December",
// ];

export const SHORT_MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const getDateYYMMDD = (date = new Date()) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return { year, month, day };
};

export const getDateYYMMDDWithHyphens = (date = new Date()) => {
  const { year, month, day } = getDateYYMMDD(date);
  const monthFixed = month < 10 ? `0${month}` : month;
  const dayFixed = day < 10 ? `0${day}` : day;
  return [year, monthFixed, dayFixed].join("-");
};

export const moveDateByDays = (date: Date, offset: number): Date => {
  const copyDate = new Date(date);
  copyDate.setDate(copyDate.getDate() + offset);
  return copyDate;
};

export const getDatesOfWeek = (date = new Date()) => {
  const numberOfDay = date.getDay();
  return [1, 2, 3, 4, 5, 6, 7].map(cur => {
    return moveDateByDays(date, -numberOfDay + cur);
    // const date = new Date();
    // date.setDate(date.getDate() - numberOfDay + cur);
    // return date;
  });
};

export const getWeekNumber = (currentDate = new Date()) => {
  const firstDayOfYear = new Date(currentDate.getFullYear(), 0, 1);
  const firstMondayOfYear = new Date(firstDayOfYear.getTime() + ((8 - firstDayOfYear.getDay()) % 7) * 86400000);
  const daysSinceFirstMonday = Math.floor((currentDate.getTime() - firstMondayOfYear.getTime()) / 86400000);
  const weekNumber = Math.floor(daysSinceFirstMonday / 7) + 1;
  return weekNumber;
};

export const differentBetweenDays = (date1: Date, date2: Date) => {
  const timeDiff = date1.getTime() - date2.getTime();
  const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
  return diffDays;
};
