export const justADate = (initDate?: Date | string) => {
  const utcMidnightDateObj: Date = getUtcMidnightDateObj(initDate);
  // if (typeof initDate === "string" && initDate.match(/((\+|-)\d{2}:\d{2}|Z)$/gm)) {
  //   utcMidnightDateObj = new Date(initDate.substring(0, 10) + "T00:00:00Z");
  // } else {
  //   // if init date is not already a date object, feed it to the date constructor.
  //   if (!(initDate instanceof Date)) initDate = new Date(initDate);
  //   // Vital Step! Strip time part. Create UTC midnight dateObj according to local timezone.
  //   utcMidnightDateObj = new Date(Date.UTC(initDate.getFullYear(), initDate.getMonth(), initDate.getDate()));
  // }

  return {
    toISOString: () => utcMidnightDateObj.toISOString(),
    getUTCDate: () => utcMidnightDateObj.getUTCDate(),
    getUTCDay: () => utcMidnightDateObj.getUTCDay(),
    getUTCFullYear: () => utcMidnightDateObj.getUTCFullYear(),
    getUTCMonth: () => utcMidnightDateObj.getUTCMonth(),
    setUTCDate: (arg: any) => utcMidnightDateObj.setUTCDate(arg),
    setUTCFullYear: (arg: any) => utcMidnightDateObj.setUTCFullYear(arg),
    setUTCMonth: (arg: any) => utcMidnightDateObj.setUTCMonth(arg),
    addDays: (days: number) => utcMidnightDateObj.setUTCDate(utcMidnightDateObj.getUTCDate() + days),
    toString: () => utcMidnightDateObj.toString(),
    toLocaleDateString: (locale: string, options: any) => {
      options = options || {};
      options.timezone = "UTC";
      locale = locale || "en-EN";
      return utcMidnightDateObj.toLocaleDateString(locale, options);
    },
  };
};

const getUtcMidnightDateObj = (initDate?: Date | string): Date => {
  // if no date supplied, use Now.
  if (!initDate) initDate = new Date();

  if (typeof initDate === "string" && initDate.match(/((\+|-)\d{2}:\d{2}|Z)$/gm)) {
    return new Date(initDate.substring(0, 10) + "T00:00:00Z");
  } else {
    // if init date is not already a date object, feed it to the date constructor.
    if (!(initDate instanceof Date)) initDate = new Date(initDate);
    // Vital Step! Strip time part. Create UTC midnight dateObj according to local timezone.
    return new Date(Date.UTC(initDate.getFullYear(), initDate.getMonth(), initDate.getDate()));
  }
};
