import React from "react";
import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";
import { Tooltip } from "@mui/material";

const ContributorComp = ({ users, sx }: { users: any[]; sx?: any }) => {
  return (
    <Stack direction="row" alignItems="center" sx={{ height: "20px", width: "20px", gap: "5px", ...sx }}>
      {users.slice(0, 7).map((user, index) => (
        <Tooltip key={index} placement="top" title={user.score}>
          <Avatar
            key={index}
            alt={`Avatar ${index + 1}`}
            src={user.imageUrl}
            sx={{
              height: "25px",
              width: "25px",
              fontSize: "14px",
              transition: "all 0.3s ease",
              ":hover": {
                mb: 1,
              },
            }}
          />
        </Tooltip>
      ))}
    </Stack>
  );
};

export default ContributorComp;
