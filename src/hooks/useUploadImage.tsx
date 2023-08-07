import { FirebaseStorage, getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { useState } from "react";

import { imageLoaded } from "@/lib/utils/utils";

export type UploadConfirmation = { question: string; comparator: string; errorMessage: string };
export type UploadImageInput = {
  event: any;
  path: string;
  confirmatory?: UploadConfirmation;
  imageFileName: string;
};
type UseUploadImage = { storage: FirebaseStorage };

export const useUploadImage = ({ storage }: UseUploadImage) => {
  const [isUploading, setIsUploading] = useState(false);
  const [percentageUploaded, setPercentageUploaded] = useState(0);

  const uploadImage = ({ event, path, confirmatory, imageFileName }: UploadImageInput): Promise<string> =>
    new Promise((resolve, reject) => {
      try {
        event.preventDefault();
        const image = event.target.files[0];
        if (!image) return reject("cancel upload image");
        const hasValidFormat = ["image/jpg", "image/jpeg", "image/gif", "image/png"].includes(image.type);
        if (!hasValidFormat) {
          return reject("We only accept JPG, JPEG, PNG, or GIF images. Please upload another image.");
          //   throw Error("We only accept JPG, JPEG, PNG, or GIF images. Please upload another image.");
          // return alert("We only accept JPG, JPEG, PNG, or GIF images. Please upload another image.");
        }

        if (confirmatory) {
          let userName = prompt(
            confirmatory.question
            //   "Type your full name below to consent that you have all the rights to upload this image and the image does not violate any laws."
          );
          if (!userName) return reject("no confirmation");
          if (userName !== confirmatory.comparator /* `${user?.fName} ${user?.lName}` */) {
            return reject(confirmatory.errorMessage);
            // throw Error(confirmatory.errorMessage /* "Entered full name is not correct" */);
            //   return;
          }
        }
        setIsUploading(true);

        // let bucket = process.env.NEXT_PUBLIC_STORAGE_BUCKET ?? "onecademy-dev.appspot.com";
        // if (isValidHttpUrl(bucket)) {
        //   const { hostname } = new URL(bucket);
        //   bucket = hostname;
        // }
        // const rootURL = "https://storage.googleapis.com/" + bucket + "/";
        // const picturesFolder = rootURL + "UploadedImages/";
        const imageNameSplit = image.name.split(".");
        const imageExtension = imageNameSplit[imageNameSplit.length - 1];
        //   let imageFileName = user.userId + "/" + new Date().toUTCString() + "." + imageExtension;

        const storageRef = ref(storage, `${path}/${imageFileName}.${imageExtension}`);

        const task = uploadBytesResumable(storageRef, image);
        task.on(
          "state_changed",
          function progress(snapshot: any) {
            setPercentageUploaded(Math.ceil((100 * snapshot.bytesTransferred) / snapshot.totalBytes));
          },
          function error(err: any) {
            console.error("Image Upload Error: ", err);
            //   setIsSubmitting(false);
            setIsUploading(false);
            return reject(
              "There is an error with uploading your image. Please upload it again! If the problem persists, please try another image."
            );
          },
          async function complete() {
            const imageGeneratedUrl = await getDownloadURL(storageRef);
            //   setIsSubmitting(false);
            setIsUploading(false);
            await imageLoaded(imageGeneratedUrl);
            //   if (imageGeneratedUrl && imageGeneratedUrl !== "") {
            //     setNodeParts(nodeId, (thisNode: any) => {
            //       thisNode.nodeImage = imageGeneratedUrl;
            //       return { ...thisNode };
            //     });
            //   }
            setPercentageUploaded(0);
            resolve(imageGeneratedUrl);
          }
        );
      } catch (err) {
        console.error("Image Upload Error: ", err);
        setIsUploading(false);
        setPercentageUploaded(0);
        reject(err);
        // setIsSubmitting(false);
      }
    });

  return { isUploading, percentageUploaded, uploadImage };
};
