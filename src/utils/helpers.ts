export const firstWeekMonthDays = (thisDate?: any) => {
    let today = new Date();
    if (thisDate) {
      today = new Date(thisDate.getTime());
    }
    let theDay = today;
    // daysDiff gives us the first day of the week
    const daysDiff = theDay.getDate() - theDay.getDay();
    let firstWeekDay: any = new Date(theDay.setDate(daysDiff));
    firstWeekDay =
      firstWeekDay.getMonth() + 1 + "-" + firstWeekDay.getDate() + "-" + firstWeekDay.getFullYear();
    theDay = today;
    let firstMonthDay = theDay.getMonth() + 1 + "-" + 1 + "-" + theDay.getFullYear();
    return { firstWeekDay, firstMonthDay };
  };
  