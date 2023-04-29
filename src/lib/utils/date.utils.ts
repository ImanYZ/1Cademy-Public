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

export const getCurrentWeekDatesYYMMDD = () => {
  const date = new Date();
  const numberOfDay = date.getDay();
  const datesOfWeek = [1, 2, 3, 4, 5, 6, 7].map(cur => {
    const date = new Date();
    date.setDate(date.getDate() - numberOfDay + cur);
    return date;
  });
  datesOfWeek.map(cur => getDateYYMMDDWithHyphens(cur));
};

export const getWeekNumber = (currentDate: Date) => {
  const firstDayOfYear = new Date(currentDate.getFullYear(), 0, 1);
  const weekNumber = Math.ceil(
    ((currentDate.getTime() - firstDayOfYear.getTime()) / 86400000 + firstDayOfYear.getDay() + 1) / 7
  );
  return weekNumber;
};
