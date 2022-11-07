import React from "react";

import TrendsPlotRow from "./TrendsPlotRow";

// import TrendsPlotRow from "../../../TrendsPlotRow/TrendsPlotRow";

type UseInfoTrendsProps = {
  theme: string;
  proposalsPerDay: any[];
};

const UseInfoTrends = (props: UseInfoTrendsProps) => {
  console.log("------>> props.proposalsPerDay", props.proposalsPerDay);
  return (
    <>
      <TrendsPlotRow
        trendData={props.proposalsPerDay}
        x="date"
        y="num"
        scaleX="time"
        scaleY="linear"
        labelX="Day"
        labelY="# of Proposals"
        width={400}
        heightTop={250}
        heightBottom={160}
        theme={props.theme}
      >
        # of Proposals per day
      </TrendsPlotRow>
      {/* <TrendsPlotRow
trendData={proposalsTaggedPerDay}
x="date"
y="num"
width={400}
heightTop={250}
heightBottom={160}
>
{"# of Proposals per day about " + tag.title}
</TrendsPlotRow>
<TrendsPlotRow
trendData={proposalsPerDay}
x="date"
y="netVotes"
width={400}
heightTop={250}
heightBottom={160}
>
Total{" "}
<i className="material-icons DoneIcon green-text">done</i>{" "}
<i className="material-icons gray-text">remove</i>{" "}
<i className="material-icons red-text">close</i> on
Proposals per day
</TrendsPlotRow>
<TrendsPlotRow
trendData={proposalsTaggedPerDay}
x="date"
y="netVotes"
width={400}
heightTop={250}
heightBottom={160}
>
Total{" "}
<i className="material-icons DoneIcon green-text">done</i>{" "}
<i className="material-icons gray-text">remove</i>{" "}
<i className="material-icons red-text">close</i> on
Proposals per day about {tag.title}
</TrendsPlotRow>
<TrendsPlotRow
trendData={proposalsPerDay}
x="date"
y="averageVotes"
width={400}
heightTop={250}
heightBottom={160}
>
Average{" "}
<i className="material-icons DoneIcon green-text">done</i>{" "}
<i className="material-icons gray-text">remove</i>{" "}
<i className="material-icons red-text">close</i> on
Proposals per day
</TrendsPlotRow>
<TrendsPlotRow
trendData={proposalsTaggedPerDay}
x="date"
y="averageVotes"
width={400}
heightTop={250}
heightBottom={160}
>
Average{" "}
<i className="material-icons DoneIcon green-text">done</i>{" "}
<i className="material-icons gray-text">remove</i>{" "}
<i className="material-icons red-text">close</i> on
Proposals per day about {tag.title}
</TrendsPlotRow> */}
    </>
  );
};

export default React.memo(UseInfoTrends);
