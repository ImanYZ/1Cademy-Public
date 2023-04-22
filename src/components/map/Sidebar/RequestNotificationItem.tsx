import { LoadingButton } from "@mui/lab";
import { Avatar, Box, Paper, Stack, Typography } from "@mui/material";
import React, { useState } from "react";

import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";

export type NotebookRequestType = "waiting" | "denied" | "accepted";
export type NotebookRequest = {
  id: string;
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
  state: NotebookRequestType;
  type: "notebook";
};
type RequestNotificationItemProps = {
  notebookRequest: NotebookRequest;
  handleSubmitRequest: (
    requestId: string,
    state: NotebookRequestType,
    onLoad: (loading: { state: NotebookRequestType; loading: boolean }) => void
  ) => void;
};

const RequestNotificationItem = ({
  handleSubmitRequest,
  notebookRequest: { requestingUser, requestingUserInfo, permission, itemInfo, id },
}: RequestNotificationItemProps) => {
  const [isLoading, setIsLoading] = useState<{ state: NotebookRequestType; loading: boolean }>({
    state: "waiting",
    loading: false,
  });
  return (
    <Paper
      elevation={1}
      sx={{
        backgroundColor: ({ palette: { mode } }) =>
          mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG700 : DESIGN_SYSTEM_COLORS.gray100,
        borderRadius: "8px",
        p: "16px",
      }}
    >
      <Stack direction={"row"} spacing={"8px"} mb="12px">
        <Avatar src={requestingUserInfo.imageUrl} alt={`${requestingUser} requester`} />
        <Box sx={{ flex: 1, fontSize: "14px" }}>
          <Typography>
            <b>{requestingUser}</b>
            {` requested access to ${permission} your`}
          </Typography>
          <Typography>{`Notebook: ${itemInfo.name}`}</Typography>
        </Box>
      </Stack>
      <Stack direction={"row"} spacing={"6px"}>
        <LoadingButton
          variant="contained"
          sx={{
            fontWeight: "600",
            borderRadius: "24px",
            backgroundColor: DESIGN_SYSTEM_COLORS.orange700,
            ":hover": {
              backgroundColor: DESIGN_SYSTEM_COLORS.orange600,
            },
          }}
          fullWidth
          onClick={() => handleSubmitRequest(id, "denied", setIsLoading)}
          disabled={isLoading.state === "accepted"}
          loading={isLoading.state === "denied" ? isLoading.loading : undefined}
        >
          Deny
        </LoadingButton>
        <LoadingButton
          variant="contained"
          sx={{
            fontWeight: "600",
            borderRadius: "24px",
            backgroundColor: DESIGN_SYSTEM_COLORS.success600,
            ":hover": {
              backgroundColor: DESIGN_SYSTEM_COLORS.success500,
            },
          }}
          fullWidth
          onClick={() => handleSubmitRequest(id, "accepted", setIsLoading)}
          disabled={isLoading.state === "denied"}
          loading={isLoading.state === "accepted" ? isLoading.loading : undefined}
        >
          Accept
        </LoadingButton>
      </Stack>
    </Paper>
  );
};

export default RequestNotificationItem;
