import UploadIcon from "@mui/icons-material/Upload";
import LoadingButton from "@mui/lab/LoadingButton";
import Alert from "@mui/material/Alert";
import React, { useState } from "react";

import { orangeDark } from "@/pages/home";

import PDFView from "./PDFView";
const UploadButton = (props: any) => {
  const [isUploading, setIsUploading] = useState(false);
  const [percentUploaded, setPercentUploaded] = useState(0);

  const handleFileChange = async (event: any) => {
    console.log("fullname", props.fullname);
    const fil = event.target.files[0];
    let childWindo: any = document.getElementById("1cademy.usIframe");
    childWindo.contentWindow.postMessage(
      {
        fil,
        fullname: props.fullname,
        storageFolder: props.storageFolder,
        nameFeild: props.nameFeild,
        function: "uploadButton",
      },
      "*"
    );
    setIsUploading(true);
    setTimeout(() => {
      props.setNeedsUpdate(true);
      setIsUploading(false);
      setPercentUploaded(100);
    }, 6000);
  };

  return (
    <>
      <label htmlFor={props.name + "File"}>
        <input
          onChange={handleFileChange}
          accept={"application/pdf"}
          id={props.name + "File"}
          type="file"
          style={{ display: "none" }}
        />
        <LoadingButton
          loading={isUploading}
          loadingPosition="start"
          startIcon={<UploadIcon />}
          variant="outlined"
          component="span"
          style={{
            color: isUploading ? "gray" : "white",
            border: "none",
            backgroundColor: orangeDark,
          }}
        >
          {(isUploading ? percentUploaded + "% " : "") + "Upload " + props.name}
        </LoadingButton>
      </label>
      {props.uploadError && <Alert severity="warning">{props.uploadError}</Alert>}
      <PDFView fileUrl={props.fileUrl} height="220px" />
    </>
  );
};

export default UploadButton;
