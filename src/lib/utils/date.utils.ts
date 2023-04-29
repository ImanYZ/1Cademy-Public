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
  return [year, month, day].join("-");
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
  const weekNumber = Math.ceil(
    ((currentDate.getTime() - firstDayOfYear.getTime()) / 86400000 + firstDayOfYear.getDay() + 1) / 7
  );
  return weekNumber;
};

export const differentBetweenDays = (date1: Date, date2: Date) => {
  const timeDiff = Math.abs(date2.getTime() - date1.getTime());
  const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
  return diffDays;
};
