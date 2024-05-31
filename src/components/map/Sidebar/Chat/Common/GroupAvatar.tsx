import { Avatar, AvatarGroup } from "@mui/material";
import React from "react";

type GroupAvatarProps = {
  membersInfo: any;
  max?: number;
  size?: number;
};

const GroupAvatar = ({ membersInfo, max = 5, size = 30 }: GroupAvatarProps) => {
  return (
    <AvatarGroup
      sx={{ "& .MuiAvatar-root": { width: size, height: size, fontSize: 10 } }}
      max={max}
      total={Object.keys(membersInfo)?.length}
    >
      {Object.keys(membersInfo).map((member: any, index: number) => {
        return <Avatar key={index} alt={membersInfo[member]?.fullname} src={membersInfo[member]?.imageUrl} />;
      })}
    </AvatarGroup>
  );
};

export default GroupAvatar;
