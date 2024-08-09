import { Avatar, AvatarGroup, Box, Typography } from "@mui/material";
import React from "react";

import OptimizedAvatar2 from "@/components/OptimizedAvatar2";

type GroupAvatarProps = {
  membersInfo: any;
  max?: number;
  size?: number;
  openDMChannel?: (user2: any) => void;
};

const GroupAvatar = ({ membersInfo, max = 5, size = 30, openDMChannel }: GroupAvatarProps) => {
  const formatNumber = (number: any) => {
    if (number >= 1000) {
      return `+${(number / 1000).toFixed(1)}k`;
    }
    return `+${number}`;
  };

  const CustomAvatar = ({ count }: any) => {
    return (
      <Avatar>
        <Typography sx={{ fontSize: "11px", fontWeight: "600" }} variant="caption" color="white">
          {formatNumber(count)}
        </Typography>
      </Avatar>
    );
  };
  const additionalCount = Object.keys(membersInfo).length > max ? Object.keys(membersInfo).length - max : 0;
  return (
    <AvatarGroup
      sx={{
        "& .MuiAvatar-root": {
          width: size,
          height: size,
          fontSize: 10,
          background: "linear-gradient(143.7deg, #FDC830 15.15%, #F37335 83.11%);",
          color: "white",
        },
      }}
      max={max}
    >
      {Object.keys(membersInfo)
        .slice(0, 4)
        .map((member: any, index: number) => {
          return (
            <Avatar
              key={index}
              alt={membersInfo[member]?.fullname}
              src={!membersInfo[member]?.imageUrl.includes("no-img") ? membersInfo[member]?.imageUrl : null}
              onClick={openDMChannel ? () => openDMChannel(membersInfo[member]) : () => {}}
            >
              <Box>
                <OptimizedAvatar2
                  alt={membersInfo[member]?.fullname || ""}
                  imageUrl={membersInfo[member]?.imageUrl || ""}
                  size={0}
                  sx={{ border: "none" }}
                />
              </Box>
            </Avatar>
          );
        })}
      {additionalCount > 0 && <CustomAvatar count={additionalCount} />}
    </AvatarGroup>
  );
};

export default GroupAvatar;
