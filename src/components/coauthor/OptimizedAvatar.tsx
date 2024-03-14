import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";
import { Avatar, Box, Typography } from "@mui/material";
import { common } from "@mui/material/colors";
import { SxProps, Theme } from "@mui/system";
import React, { useState } from "react";

type Props = {
  name?: string;
  imageUrl?: string;
  renderAsAvatar?: boolean;
  contained?: boolean;
  sx?: SxProps<Theme>;
  imageSx?: any;
};

const DEFAULT_AVATAR = "https://storage.googleapis.com/onecademy-1.appspot.com/ProfilePictures/no-img.png";

const OptimizedAvatar = ({ name = "", imageUrl, sx, imageSx }: Props) => {
  const [imageSource, setImageSource] = useState(imageUrl || DEFAULT_AVATAR);

  const handleImageError = () => {
    setImageSource(DEFAULT_AVATAR);
  };

  return (
    <Box
      sx={{
        width: "50px",
        height: "50px",
        position: "relative",
        borderRadius: "30px",
        border: "solid 2px",
        borderColor: "gray",
        color: "gray",
        ...sx,
      }}
    >
      {!imageSource && (
        <Avatar
          sx={{
            background: "linear-gradient(143.7deg, #FDC830 15.15%, #F37335 83.11%);",
            color: common.white,
            width: "100%",
            height: "100%",
          }}
        >
          <Typography
            sx={{
              fontWeight: "600",
              fontSize: "16px",
              color: DESIGN_SYSTEM_COLORS.baseWhite,
            }}
          >
            {name.split(" ")[0].charAt(0).toUpperCase()}
            {name.split(" ")[1]?.charAt(0).toUpperCase()}
          </Typography>
        </Avatar>
      )}
      {imageSource && (
        <img
          src={imageSource}
          alt={name}
          width="46px"
          height="46px"
          data-quality={40}
          // objectFit="cover"
          style={{
            borderRadius: "30px",
            objectFit: "cover",
            ...imageSx,
          }}
          onError={handleImageError}
        />
      )}
    </Box>
  );
};

export default OptimizedAvatar;
