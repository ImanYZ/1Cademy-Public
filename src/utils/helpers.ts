export const firstWeekMonthDays = (thisDate?: any) => {
  let today = new Date();
  if (thisDate) {
    today = new Date(thisDate.getTime());
  }
  let theDay = today;
  // daysDiff gives us the first day of the week
  const daysDiff = theDay.getDate() - theDay.getDay();
  let firstWeekDay: any = new Date(theDay.setDate(daysDiff));
  firstWeekDay = firstWeekDay.getMonth() + 1 + "-" + firstWeekDay.getDate() + "-" + firstWeekDay.getFullYear();
  theDay = today;
  let firstMonthDay = theDay.getMonth() + 1 + "-" + 1 + "-" + theDay.getFullYear();
  return { firstWeekDay, firstMonthDay };
};

export type DetachCallback = () => Promise<void>

// we defined it like this because, we need to control behaviour of this in tests
// maybe we implement queues from it in future
export const detach = (callback: DetachCallback) => {
  setImmediate(callback)
}