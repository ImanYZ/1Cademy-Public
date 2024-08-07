import UploadIcon from "@mui/icons-material/Upload";
import LoadingButton from "@mui/lab/LoadingButton";
import { Box } from "@mui/material";
import Alert from "@mui/material/Alert";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import React, { useState } from "react";

import { orangeDark } from "@/pages/home";

import { appExp } from "../../lib/firestoreClient/firestoreClient.config";
import PDFView from "./PDFView";

const UploadButton = ({
  fullname,
  mimeTypes,
  typeErrorMessage,
  maxSize,
  sizeErrorMessage,
  storageFolder,
  setFileUrl,
  fileUrl,
}: any) => {
  const [isUploading, setIsUploading] = useState(false);
  const [percentUploaded, setPercentUploaded] = useState(0);
  const [uploadError, setUploadError] = useState<any>(false);
  const storage = getStorage(appExp);
  const handleFileChange = (event: any) => {
    try {
      event.preventDefault();
      const fil = event.target.files[0];
      if (!mimeTypes.includes(fil.type)) {
        setUploadError(typeErrorMessage);
      } else if (fil.size > maxSize * 1024 * 1024) {
        setUploadError(sizeErrorMessage);
      } else {
        setIsUploading(true);
        const filesFolder = storageFolder;
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
            setFileUrl(name, generatedUrl);
            setUploadError(false);
            setIsUploading(false);
            setPercentUploaded(100);
          }
        );
      }
    } catch (err) {
      console.error("Upload Error: ", err);
      setIsUploading(false);
      setUploadError("Upload your " + name + "!");
    }
  };

  return (
    <Box>
      <label htmlFor={name + "File"}>
        <input
          onChange={handleFileChange}
          accept={mimeTypes.join(", ")}
          id={name + "File"}
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
          {(isUploading ? percentUploaded + "% " : "") + "Upload " + name}
        </LoadingButton>
      </label>
      {uploadError && <Alert severity="warning">{uploadError}</Alert>}
      <PDFView fileUrl={fileUrl} height="500px" />
    </Box>
  );
};

export default UploadButton;
