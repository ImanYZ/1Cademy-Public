import { Avatar } from "@mui/material";
import { Box } from "@mui/system";
import { getAuth } from "firebase/auth";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import Image from "next/image";
import React, { useCallback, useEffect, useRef, useState } from "react";

import { getAvatarName } from "@/lib/utils/Map.utils";
import { addSuffixToUrlGMT } from "@/lib/utils/string.utils";

import { postWithToken } from "../../../lib/mapApi";
import { imageLoaded, isValidHttpUrl } from "../../../lib/utils/utils";
// import { newId } from "../../../lib/utils/newid";
// import { MemoizedMetaButton } from "../MetaButton";
import PercentageLoader from "../PercentageLoader";

// import { firebaseState, imageUrlState, uidState } from "../../../../store/AuthAtoms";
// import PercentageLoader from "../../../PublicComps/PercentageLoader/PercentageLoader";
// import MetaButton from "../../MetaButton/MetaButton";
type ProfileAvatarType = {
  id?: string;
  userId: string;
  userImage?: string;
  setUserImage: (newImage: string) => void;
  name: string;
  lastName: string;
};
const ProfileAvatar = ({ id, userId, userImage, setUserImage, name, lastName }: ProfileAvatarType) => {
  // const firebase = useRecoilValue(firebaseState);
  // const uid = useRecoilValue(uidState);
  // const [imageUrl, setImageUrl] = useRecoilState(imageUrlState);

  const [isUploading, setIsUploading] = useState(false);
  const [percentageUploaded, setPercentageUploaded] = useState(0);
  const [imageUrlError, setImageUrlError] = useState<string | boolean>(false);
  // const [imageWidth, setImageWidth] = useState("100%");
  // const [imageHeight, setImageHeight] = useState("auto");

  const inputEl = useRef<HTMLInputElement>(null);

  // const setImageSize = useCallback(({ target: img }: { target: any }) => {
  //   if (img.offsetHeight > img.offsetWidth) {
  //     setImageWidth("100%");
  //     setImageHeight("auto");
  //   } else {
  //     setImageWidth("auto");
  //     setImageHeight("100%");
  //   }
  // }, []);

  useEffect(() => {
    setImageUrlError(
      !userImage ||
        userImage === "" ||
        userImage === "https://storage.googleapis.com/onecademy-1.appspot.com/ProfilePictures/no-img.png"
        ? "Upload your profile picture!"
        : false
    );
  }, [userImage]);

  const handleImageChange = useCallback(
    async (event: any) => {
      try {
        event.preventDefault();
        const storage = getStorage();
        const auth = getAuth();

        const userAuthObj = auth.currentUser;
        if (!userAuthObj) return;

        const image = event.target.files[0];
        if (image.type !== "image/jpg" && image.type !== "image/jpeg" && image.type !== "image/png") {
          setImageUrlError("We only accept JPG, JPEG, or PNG images. Please upload another image.");
        } else if (image.size > 1024 * 1024) {
          setImageUrlError("We only accept file sizes less than 1MB for profile images. Please upload another image.");
        } else {
          let fullName = prompt(
            "Type your full name below to consent that you have all the rights to upload this image and the image does not violate any laws."
          );
          if (fullName !== `${name} ${lastName}`) {
            alert("Entered full name is not correct");
            return;
          }
          setIsUploading(true);
          // Uploading image by calling this API
          // const formData = {
          //   file: event.target.files[0],
          // };
          // setPercentageUploaded(30);
          // const { imageUrl } = await postImageWithToken("/uploadImage", formData);
          // setPercentageUploaded(50);
          // await imageLoaded(imageUrl);
          // setPercentageUploaded(100);

          // setImageUrlError(false);
          // setIsUploading(false);
          // setUserImage(imageUrl);
          //Setting the url everywhere in the DB
          //await postWithToken("/updateUserImageInDB", { imageUrl }); // update userImage in everywhere

          //Showing profile picture on frontend
          let bucket = process.env.NEXT_PUBLIC_STORAGE_BUCKET ?? "onecademy-dev.appspot.com";
          if (isValidHttpUrl(bucket)) {
            const { hostname } = new URL(bucket);
            bucket = hostname;
          }
          const rootURL = "https://storage.googleapis.com/" + bucket + "/";
          const picturesFolder = rootURL + "ProfilePictures/";
          const imageNameSplit = image.name.split(".");
          const imageExtension = imageNameSplit[imageNameSplit.length - 1];
          let imageFileName = userId + "/" + new Date().toUTCString() + "." + imageExtension;
          const storageRef = ref(storage, picturesFolder + imageFileName);
          const task = uploadBytesResumable(storageRef, image);
          task.on(
            "state_changed",
            function progress(snapshot) {
              setPercentageUploaded(Math.ceil((100 * snapshot.bytesTransferred) / snapshot.totalBytes));
            },
            function error(err) {
              console.error("Image Upload Error: ", err);
              setIsUploading(false);
              setImageUrlError(
                "There is an error with uploading your picture. Please upload your profile picture again! If the problem persists, please try another picture."
              );
            },
            async function complete() {
              let imageGeneratedUrl = await getDownloadURL(storageRef);
              imageGeneratedUrl = addSuffixToUrlGMT(imageGeneratedUrl, "_430x1300");
              // TODO: REQUEST TO BACKEND
              // const postData = {
              //   imageUrl: imageGeneratedUrl,
              // };
              await imageLoaded(imageGeneratedUrl);
              setImageUrlError(false);
              setIsUploading(false);
              setUserImage(imageGeneratedUrl);
              setPercentageUploaded(100);
              await postWithToken("/updateUserImageInDB", { imageUrl: imageGeneratedUrl });
            }
          );
        }
      } catch (err) {
        console.error("Image Upload Error: ", err);
        setIsUploading(false);
        setImageUrlError("Upload your profile picture!");
      }
    },
    [setUserImage, userId]
  );

  const handleEditImage = useCallback(() => {
    if (!inputEl.current) return;
    if (isUploading) return;
    inputEl.current.click();
  }, [isUploading, inputEl]);

  return (
    <Box
      id={id}
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: "6px",
        py: "8px",
      }}
    >
      <input type="file" ref={inputEl} onChange={handleImageChange} accept="image/png, image/jpg, image/jpeg" hidden />
      <Box
        onClick={handleEditImage}
        sx={{
          position: "relative",
          "& img": {
            borderRadius: "50%",
            ":hover": {
              cursor: "pointer",
            },
          },
          "&  span": {
            ":hover": {
              borderRadius: "50%",
              boxShadow: "0 0 16px 0 #bebebe",
            },
          },
        }}
      >
        {imageUrlError ? (
          <Avatar
            sx={{
              width: "90px",
              height: "90px",
              color: "white",
              background: "linear-gradient(143.7deg, #FDC830 15.15%, #F37335 83.11%);",
              fontSize: "24px",
              fontWeight: "600",
              ":hover": {
                boxShadow: "0 0 16px 0 #bebebe",
                cursor: "pointer",
              },
            }}
          >
            {getAvatarName(name, lastName)}
          </Avatar>
        ) : (
          <>
            <Image
              width="90px"
              height="90px"
              src={userImage ?? ""}
              alt="1Cademist Profile Picture"
              objectFit="cover"
              objectPosition="center center"
            />
            {isUploading && (
              <PercentageLoader percentage={percentageUploaded} radius={78} widthInPx="90px" heightInPx="90px" />
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export default React.memo(ProfileAvatar);
