import UploadIcon from "@mui/icons-material/Upload";
import LoadingButton from "@mui/lab/LoadingButton";
import Alert from "@mui/material/Alert";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import React, { useState } from "react";

import { orangeDark } from "@/pages/home";

import { appExp } from "../../lib/firestoreClient/firestoreClient.config";
import PDFView from "./PDFView";

const UploadButton = (props: any) => {
  const fullname = props.fullname;
  const [isUploading, setIsUploading] = useState(false);
  const [percentUploaded, setPercentUploaded] = useState(0);
  const [uploadError, setUploadError] = useState<any>(false);
  const storage = getStorage(appExp);
  const handleFileChange = (event: any) => {
    try {
      event.preventDefault();
      const fil = event.target.files[0];
      if (!props.mimeTypes.includes(fil.type)) {
        setUploadError(props.typeErrorMessage);
      } else if (fil.size > props.maxSize * 1024 * 1024) {
        setUploadError(props.sizeErrorMessage);
      } else {
        setIsUploading(true);
        const filesFolder = props.storageFolder;
        const fileNameSplit = fil.name.split(".");
        const fileExtension = fileNameSplit[fileNameSplit.length - 1];
        let fileName = fullname + "/" + new Date().toString() + "." + fileExtension;
        const storageRef = ref(storage, filesFolder + fileName);
        const task = uploadBytesResumable(storageRef, fil);
        task.on(
          "state_changed",
          function progress(snapshot: any) {
            setPercentUploaded(Math.ceil((100 * snapshot.bytesTransferred) / snapshot.totalBytes));
          },
          function error(err: any) {
            console.error("Upload Error: ", err);
            setIsUploading(false);
            setUploadError(
              "There is an error with uploading your file. Please upload it again! If the problem persists, please try another file."
            );
          },
          async function complete() {
            const generatedUrl = await getDownloadURL(storageRef);
            props.setFileUrl(props.name, generatedUrl);
            setUploadError(false);
            setIsUploading(false);
            setPercentUploaded(100);
          }
        );
      }
    } catch (err) {
      console.error("Upload Error: ", err);
      setIsUploading(false);
      setUploadError("Upload your " + props.name + "!");
    }
  };

  return (
    <>
      <label htmlFor={props.name + "File"}>
        <input
          onChange={handleFileChange}
          accept={props.mimeTypes.join(", ")}
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
      {uploadError && <Alert severity="warning">{uploadError}</Alert>}
      <PDFView fileUrl={props.fileUrl} height="500px" />
    </>
  );
};

export default UploadButton;
