// import axios from "axios";
// import React, { useCallback, useEffect, useRef, useState } from "react";
// import { useRecoilState, useRecoilValue } from "recoil";

import React from "react";

import { MemoizedMetaButton } from "../MetaButton";

// import { firebaseState, imageUrlState, uidState } from "../../../../store/AuthAtoms";
// import PercentageLoader from "../../../PublicComps/PercentageLoader/PercentageLoader";
// import MetaButton from "../../MetaButton/MetaButton";
type ProfileAvatarType = { userImage?: string; setUserImage: (newImage: string) => void };
const ProfileAvatar = ({ userImage /*setUserImage*/ }: ProfileAvatarType) => {
  // const firebase = useRecoilValue(firebaseState);
  // const uid = useRecoilValue(uidState);
  // const [imageUrl, setImageUrl] = useRecoilState(imageUrlState);

  // const [isUploading, setIsUploading] = useState(false);
  // const [percentageUploaded, setPercentageUploaded] = useState(0);
  // const [imageUrlError, setImageUrlError] = useState(false);
  // const [imageWidth, setImageWidth] = useState("100%");
  // const [imageHeight, setImageHeight] = useState("auto");

  // const inputEl = useRef(null);

  // const setImageSize = useCallback(({ target: img }) => {
  //   if (img.offsetHeight > img.offsetWidth) {
  //     setImageWidth("100%");
  //     setImageHeight("auto");
  //   } else {
  //     setImageWidth("auto");
  //     setImageHeight("100%");
  //   }
  // }, []);

  // useEffect(() => {
  //   setImageUrlError(
  //     !imageUrl ||
  //       imageUrl === "" ||
  //       imageUrl === "https://storage.googleapis.com/onecademy-1.appspot.com/ProfilePictures/no-img.png"
  //       ? "Upload your profile picture!"
  //       : false
  //   );
  // }, [imageUrl]);

  // const handleImageChange = useCallback(
  //   event => {
  //     try {
  //       event.preventDefault();
  //       const image = event.target.files[0];
  //       if (image.type !== "image/jpg" && image.type !== "image/jpeg" && image.type !== "image/png") {
  //         setImageUrlError("We only accept JPG, JPEG, or PNG images. Please upload another image.");
  //       } else if (image.size > 1024 * 1024) {
  //         setImageUrlError("We only accept file sizes less than 1MB for profile images. Please upload another image.");
  //       } else {
  //         setIsUploading(true);
  //         const rootURL = "https://storage.googleapis.com/" + firebase.storageBucket + "/";
  //         const picturesFolder = "ProfilePictures/";
  //         const imageNameSplit = image.name.split(".");
  //         const imageExtension = imageNameSplit[imageNameSplit.length - 1];
  //         let imageFileName = uid + "/" + new Date().toGMTString() + "." + imageExtension;
  //         const storageRef = firebase.storage.ref(picturesFolder + imageFileName);
  //         const task = storageRef.put(image);
  //         task.on(
  //           "state_changed",
  //           function progress(snapshot) {
  //             setPercentageUploaded(Math.ceil((100 * snapshot.bytesTransferred) / snapshot.totalBytes));
  //           },
  //           function error(err) {
  //             console.error("Image Upload Error: ", err);
  //             setIsUploading(false);
  //             setImageUrlError(
  //               "There is an error with uploading your picture. Please upload your profile picture again! If the problem persists, please try another picture."
  //             );
  //           },
  //           async function complete() {
  //             const imageGeneratedUrl = await task.snapshot.ref.getDownloadURL();
  //             let responseObj = {};
  //             const postData = {
  //               imageUrl: imageGeneratedUrl,
  //             };
  //             const userAuthObj = firebase.auth.currentUser;
  //             await userAuthObj.updateProfile({
  //               photoURL: imageGeneratedUrl,
  //             });
  //             await firebase.idToken();
  //             responseObj = await axios.post("/user/image", postData);
  //             setImageUrlError(false);
  //             setIsUploading(false);
  //             setImageUrl(imageGeneratedUrl);
  //             setPercentageUploaded(100);
  //           }
  //         );
  //       }
  //     } catch (err) {
  //       console.error("Image Upload Error: ", err);
  //       setIsUploading(false);
  //       setImageUrlError("Upload your profile picture!");
  //     }
  //   },
  //   [firebase, uid]
  // );

  // const handleEditImage = useCallback(
  //   event => {
  //     if (!isUploading) {
  //       inputEl.current.click();
  //     }
  //   },
  //   [isUploading, inputEl]
  // );

  return (
    <div id="UserProfilePicture">
      {/* <input type="file" ref={inputEl} onChange={handleImageChange} hidden="hidden" /> */}
      <MemoizedMetaButton
        round={true}
        onClick={() => console.log("handleEditImage")}
        tooltip="Change your profile picture."
        tooltipPosition="right"
      >
        <div className="UserAvatar UserStatusIcon">
          {/* TODO: manage undefinder ser image (show default image) */}
          <img
            src={userImage}
            // style={{ width: imageWidth, height: imageHeight }}
            alt="1Cademist Profile Picture"
            // onLoad={setImageSize}
          />
        </div>
      </MemoizedMetaButton>
      {/* {isUploading && <PercentageLoader percentage={percentageUploaded} radius={85} width="200px" height="200px" />}
      {imageUrlError && <div className="errorMessage">{imageUrlError}</div>} */}
    </div>
  );
};

export default React.memo(ProfileAvatar);
