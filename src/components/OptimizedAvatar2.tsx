import { Avatar, Box } from "@mui/material";
import { common } from "@mui/material/colors";
import { SxProps, Theme } from "@mui/system";
import Image from "next/image";
import React, { FC, useState } from "react";

import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";
type Props = {
  imageUrl: string;
  alt: string;
  size: number;
  onClick?: () => void;
  sx?: SxProps<Theme>;
};

const OptimizedAvatar2: FC<Props> = ({ imageUrl, alt, size, onClick, sx }) => {
  const [hasError, setHasError] = useState(false);

  return (
    <Box
      onClick={onClick}
      sx={{
        minWidth: `${size}px`,
        width: `${size}px`,
        height: `${size}px`,
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
      {hasError ? (
        <Avatar
          sx={{
            background: "linear-gradient(143.7deg, #FDC830 15.15%, #F37335 83.11%);",
            fontWeight: "500",
            fontSize: `${(size - 8) / 2}px`,
            color: common.white,
            width: `${size - 2}px`,
            height: `${size - 2}px`,
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
          quality={40}
          objectFit="cover"
          style={{ borderRadius: "50%" }}
          onError={() => setHasError(true)}
        />
      )}
    </Box>
  );
};

export default OptimizedAvatar2;
