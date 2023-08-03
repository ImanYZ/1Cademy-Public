import { Button, SxProps, Theme } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";
import React, { ReactNode, useEffect, useState } from "react";

export type CsvData = { columns: string[]; rows: { [key: string]: string }[] };

type CSVButtonProps = {
  BtnText: ReactNode;
  addNewData: (csvData: CsvData) => void;
  sx?: SxProps<Theme>;
  disabled?: boolean;
};
export const CsvButton = ({ BtnText, addNewData, sx, disabled = false }: CSVButtonProps) => {
  const fileReader = new FileReader();
  const [CSVData, setCSVData] = useState<CsvData>({
    columns: [],
    rows: [],
  });
  const [openUploadModal, setOpenUploadModal] = useState(false);
  const [fileError, setFileError] = useState("");

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
        try {
          const text = event.target.result;
          const csvData = csvFileToArray(text);
          const isValid = validateCsvData(csvData);
          if (!isValid) return setFileError("The file has invalid data");

          setCSVData(csvData);
        } catch (err) {
          setFileError("The file has errors");
        }
      };
      fileReader.readAsText(file);
    }
  };

  const handleAddData = () => {
    addNewData(CSVData);
    setOpenUploadModal(false);
  };

  return (
    <div>
      <Dialog open={openUploadModal} onClose={() => setOpenUploadModal(false)} sx={{ zIndex: 2200 }}>
        <DialogTitle>
          <Typography variant="h3" fontWeight={"bold"} component="p">
            Add students from a csv file
          </Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            <input type={"file"} id={"csvFileInput"} accept={".csv"} onChange={handleOnChange} />
          </DialogContentText>
          {fileError && <Typography sx={{ color: theme => theme.palette.error.main }}>{fileError}</Typography>}
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
        disabled={disabled}
        sx={{
          color: theme => theme.palette.common.black,
          ...sx,
        }}
        onClick={() => setOpenUploadModal(true)}
      >
        {BtnText}
      </Button>
    </div>
  );
};

export default CsvButton;

const csvFileToArray = (string: any) => {
  const csvHeader = string.slice(0, string.indexOf("\n")).split(",");
  const csvRows = string.slice(string.indexOf("\n") + 1).split("\n");

  const array: { [key: string]: string }[] = csvRows.map((i: any) => {
    const values = i.split(",");
    const obj = csvHeader.reduce((object: any, header: any, index: number) => {
      const cleanHeader = header.trim();
      object[cleanHeader] = values[index];
      return object;
    }, {});
    return obj;
  });
  const headerKeys = Object.keys(Object.assign({}, ...array));
  const cleanHeaderKeys = headerKeys.map(x => x.replace("\r", "").trim());
  return { columns: cleanHeaderKeys, rows: array };
};

const validateCsvData = (data: CsvData) => {
  const checkPropertiesIsOnObject = (properties: string[], myObject: { [key: string]: string }) => {
    return properties.reduce((acu, cur) => acu && myObject.hasOwnProperty(cur), true);
  };
  return data.rows.reduce((acu, cur) => {
    const tt = checkPropertiesIsOnObject(data.columns, cur);
    return acu && tt;
  }, true);
};
