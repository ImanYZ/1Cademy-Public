import Paper from "@mui/material/Paper";
import React from "react";

const PDFView = ({ fileUrl, width = "700px", height }: any) => {
  return fileUrl ? (
    <Paper
      sx={{
        margin: "19px 0px 0px 0px",
        padding: "10px",
        height: height,
        width: width,
      }}
    >
      <embed src={fileUrl} type="application/pdf" width="100%" height="100%" />
    </Paper>
  ) : (
    <div></div>
  );
};

export default PDFView;
