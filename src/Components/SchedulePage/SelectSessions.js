import React, { useState, useEffect } from "react";

import ScheduleSelector from "react-schedule-selector";

const startingTomorrow = (d1) => {
  let d = new Date();
  d = new Date(d.getTime() + 24 * 60 * 60 * 1000);
  return (
    d1.getDate() >= d.getDate() &&
    d1.getMonth() >= d.getMonth() &&
    d1.getFullYear() >= d.getFullYear()
  );
};

const daysLater = (d1, d2, days) => {
  let d = new Date(d1);
  d = new Date(d.getTime() + days * 24 * 60 * 60 * 1000);
  return (
    d.getDate() === d2.getDate() &&
    d.getMonth() === d2.getMonth() &&
    d.getFullYear() === d2.getFullYear()
  );
};

const currentTime = new Date();
const tZoneOffset = currentTime.getTimezoneOffset();
const tZoneDiff = Math.floor((240 - tZoneOffset) / 60);
let start = 6 + tZoneDiff;
if (start < 6) {
  start = 6;
}
let end = 23 + tZoneDiff;
if (end > 23) {
  end = 23;
}

const SelectSessions = (props) => {
  const [firstRender, setFirstRender] = useState(true);

  useEffect(() => {
    if (props.schedule && props.schedule.length > 0) {
      const orderedSch = [...props.schedule];
      orderedSch.sort((a, b) => a.getTime() - b.getTime());
      let fSession = null;
      let sSession = null;
      let tSession = null;
      for (let sIdx = 0; sIdx < orderedSch.length - 2; sIdx++) {
        if (
          // startingTomorrow(orderedSch[sIdx]) &&
          orderedSch[sIdx] > new Date() &&
          orderedSch[sIdx].getTime() + 30 * 60000 ===
            orderedSch[sIdx + 1].getTime()
          //    &&
          // orderedSch[sIdx + 1].getTime() + 30 * 60000 ===
          //   orderedSch[sIdx + 2].getTime()
        ) {
          const secondSIdx = orderedSch.findIndex((s) =>
            daysLater(orderedSch[sIdx], s, 3)
          );
          if (secondSIdx !== -1) {
            const thirdSIdx = orderedSch.findIndex((s) =>
              daysLater(orderedSch[sIdx], s, 7)
            );
            if (thirdSIdx !== -1) {
              fSession = orderedSch[sIdx];
              sSession = orderedSch[secondSIdx];
              tSession = orderedSch[thirdSIdx];
              break;
            }
          }
        }
      }
      if (fSession && sSession && tSession) {
        props.setFirstSession(fSession);
        props.setSecondSession(sSession);
        props.setThirdSession(tSession);
      }
      if (sSession && tSession) {
        props.setSubmitable(true);
      } else {
        props.setSubmitable(false);
      }
    }
  }, [props.schedule]);

  const renderDateCell = (datetime, selected, refSetter) => {
    const scheduledSession =
      (props.firstSession &&
        (props.firstSession.getTime() === datetime.getTime() ||
          props.firstSession.getTime() ===
            new Date(datetime.getTime() - 30 * 60000).getTime())) ||
      (props.secondSession &&
        props.secondSession.getTime() === datetime.getTime()) ||
      (props.thirdSession &&
        props.thirdSession.getTime() === datetime.getTime());
    return (
      <div
        className={
          selected ? "ScheduleCell SelectedCell" : "ScheduleCell UnselectedCell"
        }
        ref={refSetter}
      >
        {scheduledSession
          ? "✅"
          : datetime.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })}
      </div>
    );
  };

  const scheduleChange = (newSchedule) => {
    if (!firstRender || newSchedule.length > 0) {
      props.setSchedule(newSchedule);
      setFirstRender(false);
    }
  };

  return (
    <ScheduleSelector
      selection={props.schedule}
      selectionScheme="linear"
      startDate={props.startDate}
      numDays={props.numDays}
      minTime={start}
      maxTime={end}
      hourlyChunks={2}
      dateFormat="ddd MM/DD"
      timeFormat="hh:mma"
      onChange={scheduleChange}
      renderDateCell={renderDateCell}
    />
  );
};

export default React.memo(SelectSessions, (prevProps, nextProps) => {
  return (
    prevProps.schedule.length === nextProps.schedule.length &&
    prevProps.firstSession === nextProps.firstSession &&
    prevProps.secondSession === nextProps.secondSession &&
    prevProps.thirdSession === nextProps.thirdSession &&
    prevProps.startDate === nextProps.startDate &&
    prevProps.numDays === nextProps.numDays
  );
});
