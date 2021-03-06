import { Avatar, Box } from "@mui/material";
import Image from "next/image";
import React, { FC } from "react";

type Props = {
  name?: string;
  imageUrl?: string;
  renderAsAvatar?: boolean;
  contained?: boolean;
};

const OptimizedAvatar: FC<Props> = ({ name = "", imageUrl, renderAsAvatar = true, contained = false }) => {
  // render an Avatar with the firth Letter
  if (!imageUrl) {
    return (
      <Avatar
        sx={{
          width: "50px",
          height: "50px"
        }}
      >
        {name.charAt(0)}
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
          background: theme => theme.palette.common.white
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
          color: theme => theme.palette.common.gray
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
            borderRadius: "30px"
          }}
        />
      </Box>
    );
  }

  // render an image without border
  return (
    <Box sx={{ width: "50px", height: "50px", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Image src={imageUrl} alt={name} width="33px" height="24px" quality={40} />
    </Box>
  );
};

export default OptimizedAvatar;
