import { Button } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";
import React, { useEffect, useState } from "react";

export const CSVBtn = ({ BtnText, addNewData, buttonStyles }: any) => {
  const fileReader = new FileReader();
  const [CSVData, setCSVData] = useState<any>({
    columns: [],
    rows: [],
  });
  const [openUploadModal, setOpenUploadModal] = useState(false);

  useEffect(() => {
    if (!openUploadModal) {
      setCSVData({
        columns: [],
        rows: [],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openUploadModal]);

  const handleOnChange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      fileReader.onload = function (event: any) {
        const text = event.target.result;
        csvFileToArray(text);
      };
      fileReader.readAsText(file);
    }
  };

  const csvFileToArray = (string: any) => {
    const csvHeader = string.slice(0, string.indexOf("\n")).split(",");
    const csvRows = string.slice(string.indexOf("\n") + 1).split("\n");

    const array = csvRows.map((i: any) => {
      const values = i.split(",");
      const obj = csvHeader.reduce((object: any, header: any, index: any) => {
        const cleanHeader = header.trim();
        object[cleanHeader] = values[index];
        return object;
      }, {});
      return obj;
    });
    const headerKeys = Object.keys(Object.assign({}, ...array));
    const cleanHeaderKeys = headerKeys.map(x => x.replace("\r", "").trim());
    setCSVData({ columns: cleanHeaderKeys, rows: array });
  };

  const handleAddData = () => {
    console.log({ CSVData });
    addNewData(CSVData);
    setOpenUploadModal(false);
  };

  return (
    <>
      <Dialog open={openUploadModal} onClose={() => setOpenUploadModal(false)}>
        <DialogTitle>
          <Typography variant="h3" fontWeight={"bold"} component="h2">
            Add students from a csv file
          </Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            <input type={"file"} id={"csvFileInput"} accept={".csv"} onChange={handleOnChange} />
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button disabled={CSVData?.rows?.length <= 0} variant="contained" onClick={handleAddData}>
            Add data to Table
          </Button>
          <Button variant="contained" onClick={() => setOpenUploadModal(false)}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
      <Button
        variant="text"
        sx={{
          color: theme => theme.palette.common.black,
          ...buttonStyles,
        }}
        onClick={() => setOpenUploadModal(true)}
      >
        {BtnText}
      </Button>
    </>
  );
};

export default CSVBtn;
