import { Box, Button, Stack, Typography } from "@mui/material";
import Image from "next/image";
import React from "react";

import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";

type NotebookRequest = {
  requestingUser: string;
  requestingUserInfo: {
    imageUrl: string;
  };
  requestedUser: string;
  requestedUserInfo: {
    imageUrl: string;
  };
  permission: "view" | "edit";
  item: string;
  itemInfo: {
    name: string;
  };
  state: "waiting" | "denied" | "accepted";
  type: "notebook";
};
type RequestNotificationItemProps = {
  notebookRequest: NotebookRequest;
};

const RequestNotificationItem = ({
  notebookRequest: { requestingUser, requestingUserInfo, permission, itemInfo },
}: RequestNotificationItemProps) => {
  return (
    <Box
      sx={{
        backgroundColor: ({ palette: { mode } }) =>
          mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG700 : DESIGN_SYSTEM_COLORS.gray100,
        borderRadius: "8px",
        p: "16px",
      }}
    >
      <Stack direction={"row"}>
        <Image src={requestingUserInfo.imageUrl} width={40} height={40} alt={`${requestingUser} requester`} />
        <Box sx={{ flex: 1, fontSize: "14px" }}>
          <Typography>
            <b>{requestingUser}</b>
            {`requested access to${permission}your`}
          </Typography>
          <Typography>Notebook: {itemInfo.name}</Typography>
        </Box>
      </Stack>
      <Stack direction={"row"} spacing={"6px"}>
        <Button
          variant="contained"
          sx={{
            backgroundColor: DESIGN_SYSTEM_COLORS.orange700,
          }}
          fullWidth
        >
          Deny
        </Button>
        <Button
          variant="contained"
          sx={{
            backgroundColor: DESIGN_SYSTEM_COLORS.success600,
          }}
          fullWidth
        >
          Accept
        </Button>
      </Stack>
    </Box>
  );
};

export default RequestNotificationItem;
