import { Box } from "@mui/system";
import { getAuth } from "firebase/auth";
import React, { useCallback, useEffect, useRef, useState } from "react";

import { postImageWithToken,postWithToken } from "../../../lib/mapApi";
// import { newId } from "../../../lib/utils/newid";
// import { MemoizedMetaButton } from "../MetaButton";
import PercentageLoader from "../PercentageLoader";

// import { firebaseState, imageUrlState, uidState } from "../../../../store/AuthAtoms";
// import PercentageLoader from "../../../PublicComps/PercentageLoader/PercentageLoader";
// import MetaButton from "../../MetaButton/MetaButton";
type ProfileAvatarType = { userId: string; userImage?: string; setUserImage: (newImage: string) => void };
const ProfileAvatar = ({ userId, userImage, setUserImage }: ProfileAvatarType) => {
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
        // const storage = getStorage();
        const auth = getAuth();

        const userAuthObj = auth.currentUser;
        if (!userAuthObj) return;

        const image = event.target.files[0];
        if (image.type !== "image/jpg" && image.type !== "image/jpeg" && image.type !== "image/png") {
          setImageUrlError("We only accept JPG, JPEG, or PNG images. Please upload another image.");
        } else if (image.size > 1024 * 1024) {
          setImageUrlError("We only accept file sizes less than 1MB for profile images. Please upload another image.");
        } else {
          setIsUploading(true);
          // Uploading image by calling this API
          const formData = {
            file: event.target.files[0],
          };
          setPercentageUploaded(10);
          const { imageUrl } = await postImageWithToken("/uploadImage", formData);
          setPercentageUploaded(50);

          //Setting the url everywhere in the DB
          await postWithToken("/updateUserImageInDB", { imageUrl }); // update userImage in everywhere
          setPercentageUploaded(100);

          //Showing profile picture on frontend
          setImageUrlError(false);
          setIsUploading(false);
          setUserImage(imageUrl);
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
    <Box>
      {/* <Box>
        <input
          type="file"
          ref={inputEl}
          onChange={handleImageChange}
          accept="image/png, image/jpg, image/jpeg"
          hidden
        />

      </Box> */}
      <Box
        id=""
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <input
          type="file"
          ref={inputEl}
          onChange={handleImageChange}
          accept="image/png, image/jpg, image/jpeg"
          hidden
        />
        <Box
          // round={true}
          onClick={handleEditImage}
          // tooltip="Change your profile picture."
          // tooltipPosition="right"
          sx={{ position: "relative", width: "170px", height: "170px", padding: "5px" }}
        >
          {/* TODO: change with NextJs image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="profileImage"
            // style={{ width: imageWidth, height: imageHeight, borderRadius: "50%" }}
            src={userImage}
            alt="1Cademist Profile Picture"
          />
          {isUploading && (
            <PercentageLoader percentage={percentageUploaded} radius={78} widthInPx="170px" heightInPx="170px" />
          )}
        </Box>

        {imageUrlError && <div className="errorMessage">{imageUrlError}</div>}
      </Box>
    </Box>
  );
};

export default React.memo(ProfileAvatar);
