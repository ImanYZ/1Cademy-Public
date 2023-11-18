import UploadIcon from "@mui/icons-material/Upload";
import LoadingButton from "@mui/lab/LoadingButton";
import { Tooltip } from "@mui/material";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import React, { useState } from "react";

import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";
import { orangeDark } from "@/pages/home";

const UploadButtonCademy = (props: any) => {
  const [isUploading, setIsUploading] = useState(false);
  const [percentUploaded, setPercentUploaded] = useState(0);

  const storage = getStorage();
  const handleFileChange = (event: any) => {
    try {
      event.preventDefault();
      const fil = event.target.files[0];
      if (!props.mimeTypes.includes(fil.type)) {
        props.setUploadError(props.typeErrorMessage);
      } else if (fil.size > props.maxSize * 1024 * 1024) {
        props.setUploadError(props.sizeErrorMessage);
      } else {
        setIsUploading(true);
        const filesFolder = props.storageFolder;
        const fileNameSplit = fil.name.split(".");
        const fileExtension = fileNameSplit[fileNameSplit.length - 1];
        let fileName = new Date().toString() + "." + fileExtension;
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
            props.setUploadError(
              "There is an error with uploading your file. Please upload it again! If the problem persists, please try another file."
            );
          },
          async function complete() {
            const generatedUrl = await getDownloadURL(storageRef);
            props.setFileUrl(generatedUrl);
            if (generatedUrl) {
              props.saveBook(generatedUrl);
            }
            props.setUploadError(false);
            setIsUploading(false);
            setPercentUploaded(100);
          }
        );
      }
    } catch (err) {
      console.error("Upload Error: ", err);
      setIsUploading(false);
    }
  };

  return (
    <>
      <label htmlFor={props.name + "File"}>
        {!props.disabled && (
          <input
            onChange={handleFileChange}
            accept={props.mimeTypes.join(", ")}
            id={props.name + "File"}
            type="file"
            style={{ display: "none" }}
          />
        )}
        <Tooltip title={"Upload " + props.name}>
          <LoadingButton
            loading={isUploading}
            loadingPosition="start"
            startIcon={<UploadIcon />}
            variant="outlined"
            component="span"
            style={{
              color: props.disabled ? "black" : "white",
              border: "none",
              backgroundColor: props.disabled ? DESIGN_SYSTEM_COLORS.gray200 : orangeDark,
              width: "100%",
            }}
            disabled={props.disabled}
          >
            {isUploading ? percentUploaded + "% " : "Upload Document"}
          </LoadingButton>
        </Tooltip>
      </label>
    </>
  );
};

export default UploadButtonCademy;
