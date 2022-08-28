import React from "react";

const RightArrow = (color: string) => {
  return (
    <div
      style={{
        width: "0",
        height: "0",
        borderTop: "10px solid transparent",
        borderBottom: "10px solid transparent",
        borderLeft: `10px solid ${color}`,
        float: "right",
        marginTop: "-9.1px",
        marginRight: "-1px"
      }}
    ></div>
  );
};

export default React.memo(RightArrow);
