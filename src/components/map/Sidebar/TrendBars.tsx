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
        heightTop={180}
        heightBottom={200}
        theme={props.theme}
      >
        # of Proposals per day
      </TrendsPlotRow>
    </>
  );
};

export default React.memo(UseInfoTrends);
