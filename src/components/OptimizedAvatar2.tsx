import { Avatar, Box } from "@mui/material";
import { common } from "@mui/material/colors";
import { SxProps, Theme } from "@mui/system";
import Image from "next/image";
import React, { FC, useState } from "react";

import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";

import { DEFAULT_AVATAR } from "../lib/utils/constants";
type Props = {
  imageUrl: string;
  alt: string;
  size: number;
  onClick?: () => void;
  quality?: number;
  sx?: SxProps<Theme>;
};

const OptimizedAvatar2: FC<Props> = ({ imageUrl, alt, size, onClick, quality = 50, sx }) => {
  const [hasError, setHasError] = useState(false);

  return (
    <Box
      onClick={onClick}
      sx={{
        ...(size > 0 && {
          minWidth: `${size}px`,
          width: `${size}px`,
          height: `${size}px`,
        }),
        position: "relative",
        borderRadius: "50%",
        cursor: "pointer",
        border: theme =>
          `solid 1px ${
            theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG600 : DESIGN_SYSTEM_COLORS.gray50
          }`,
        ":hover": { ...(onClick && { border: `solid 1px ${DESIGN_SYSTEM_COLORS.primary600}` }) },
        ...sx,
      }}
    >
      {hasError || !imageUrl || imageUrl === DEFAULT_AVATAR ? (
        <Avatar
          sx={{
            background: "linear-gradient(143.7deg, #FDC830 15.15%, #F37335 83.11%);",
            fontWeight: "500",
            fontSize: `${(size - 8) / 2}px`,
            color: common.white,
            width: `${size}px`,
            height: `${size}px`,
          }}
        >
          {alt
            .split(" ")
            .map(c => c[0])
            .join("")
            .toUpperCase()}
        </Avatar>
      ) : (
        <Image
          src={imageUrl}
          alt={alt}
          width={`${size}px`}
          height={`${size}px`}
          quality={quality}
          objectFit="cover"
          style={{ borderRadius: "50%" }}
          onError={() => setHasError(true)}
        />
      )}
    </Box>
  );
};

export default OptimizedAvatar2;
