import { Avatar, Box } from "@mui/material";
import { common } from "@mui/material/colors";
import { SxProps, Theme } from "@mui/system";
import { getDownloadURL, getStorage, ref } from "firebase/storage";
import Image from "next/image";
import React, { FC, useEffect, useState } from "react";
type Props = {
  name?: string;
  imageUrl?: string;
  renderAsAvatar?: boolean;
  contained?: boolean;
  sx?: SxProps<Theme>;
};

const OptimizedAvatar: FC<Props> = ({ name = "", imageUrl, renderAsAvatar = true, contained = false, sx }) => {
  const [checkIfFileExist, setCheckIfFileExist] = useState(true);
  useEffect(() => {
    if (imageUrl) {
      const checkIfImageExists = async () => {
        const storage = getStorage();
        const storageRef = ref(storage, imageUrl);

        getDownloadURL(storageRef)
          .then(() => {
            setCheckIfFileExist(true);
          })
          .catch(error => {
            if (error.code === "storage/object-not-found") {
              setCheckIfFileExist(false);
            } else {
              return Promise.reject(error);
            }
          });
      };

      checkIfImageExists();
    }
  }, [imageUrl]);

  const getInstitutions = (instName: string, index: number): string => {
    if (!instName?.split(" ")[index]) return "";
    if (instName?.split(" ")[index].length < 3) {
      const _index = index + 1;
      return getInstitutions(instName, _index);
    } else {
      return instName.split(" ")[index];
    }
  };

  // render an Avatar with the firth Letter
  if (!checkIfFileExist || !imageUrl) {
    return (
      <Avatar
        sx={{
          width: "40px",
          height: "40px",
          backgroundColor: "#ff9800",
          color: common.white,
          ...sx,
        }}
      >
        {name.charAt(0)}
        {getInstitutions(name, 1)?.charAt(0)}
      </Avatar>
    );
  }

  // render an Avatar with image contained
  if (renderAsAvatar && contained) {
    return (
      <Box
        sx={{
          width: "50px",
          height: "50px",
          border: "solid 2px",
          borderColor: theme => theme.palette.common.gray,
          color: theme => theme.palette.common.gray,
          borderRadius: "30px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: theme => theme.palette.common.white,
          ...sx,
        }}
      >
        <Image src={imageUrl} alt={name} width="33px" height="24px" quality={40} />
      </Box>
    );
  }

  // render an Avatar with Image cover
  if (renderAsAvatar && !contained) {
    return (
      <Box
        sx={{
          width: "50px",
          height: "50px",
          position: "relative",
          borderRadius: "30px",
          border: "solid 2px",
          borderColor: theme => theme.palette.common.gray,
          color: theme => theme.palette.common.gray,
          ...sx,
        }}
      >
        <Image
          src={imageUrl}
          alt={name}
          width="46px"
          height="46px"
          quality={40}
          objectFit="cover"
          style={{
            borderRadius: "30px",
          }}
        />
      </Box>
    );
  }

  // render an image without border
  return (
    <Box sx={{ width: "50px", height: "50px", display: "flex", alignItems: "center", justifyContent: "center", ...sx }}>
      <Image src={imageUrl} alt={name} width="33px" height="24px" quality={40} />
    </Box>
  );
};

export default OptimizedAvatar;
