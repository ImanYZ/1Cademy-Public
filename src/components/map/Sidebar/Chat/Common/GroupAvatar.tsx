import { Avatar, AvatarGroup, Box } from "@mui/material";
import React from "react";

import OptimizedAvatar2 from "@/components/OptimizedAvatar2";

type GroupAvatarProps = {
  membersInfo: any;
  max?: number;
  size?: number;
  openDMChannel?: (user2: any) => void;
};

const GroupAvatar = ({ membersInfo, max = 5, size = 30, openDMChannel }: GroupAvatarProps) => {
  return (
    <AvatarGroup
      sx={{ "& .MuiAvatar-root": { width: size, height: size, fontSize: 10 } }}
      max={max}
      total={Object.keys(membersInfo)?.length}
    >
      {Object.keys(membersInfo).map((member: any, index: number) => {
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
    </AvatarGroup>
  );
};

export default GroupAvatar;
