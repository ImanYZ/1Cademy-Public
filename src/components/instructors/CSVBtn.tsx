import React, { useEffect } from "react";

export const CSVBtn = ({ getCSVData, isOpen }: any) => {
  const fileReader = new FileReader();

  useEffect(() => {
    if (!isOpen) {
      getCSVData({
        columns: [],
        rows: [],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

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
        object[header] = values[index];
        return object;
      }, {});
      return obj;
    });
    const headerKeys = Object.keys(Object.assign({}, ...array));
    getCSVData({ columns: headerKeys, rows: array });
  };

  return <input type={"file"} id={"csvFileInput"} accept={".csv"} onChange={handleOnChange} />;
};

export default CSVBtn;
