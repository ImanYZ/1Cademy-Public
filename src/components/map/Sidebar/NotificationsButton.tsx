// import React, { useCallback } from "react";
// import { useRecoilValue } from "recoil";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import { Badge, Box } from "@mui/material";

// import shortenNumber from "../../../lib/utils/shortenNumber";
import { MemoizedMetaButton } from "../MetaButton";

// import { uncheckedNotificationsNumState } from "../../../../../store/MapAtoms";

// import MetaButton from "../../../MetaButton/MetaButton";

// import shortenNumber from "../../../../../utils/shortenNumber";

// import "./NotificationsButton.css";

type NotificationsButtonProps = {
  openSideBar: any;
  uncheckedNotificationsNum: number;
};

export const NotificationsButton = ({ openSideBar, uncheckedNotificationsNum }: NotificationsButtonProps) => {
  return (
    <MemoizedMetaButton
      onClick={() => openSideBar("Notifications")}
      // tooltip="Click to open the notifications."
      // tooltipPosition="Right"
    >
      <Box>
        <Badge
          badgeContent={uncheckedNotificationsNum ?? 0}
          color="error"
          anchorOrigin={{ vertical: "top", horizontal: "left" }}
          sx={{ padding: "1px" }}
        >
          {uncheckedNotificationsNum > 0 ? <NotificationsActiveIcon /> : <NotificationsNoneIcon />}
        </Badge>
        {/* {uncheckedNotificationsNum > 0 ? <NotificationsActiveIcon /> : <NotificationsNoneIcon />} */}
        {/* <i className="material-icons ">
          {uncheckedNotificationsNum > 0 ? "notifications_active" : "notifications_none"}
        </i> */}
        <span className="SidebarDescription">Notifications</span>
        {/* {uncheckedNotificationsNum > 0 && <div className="">{shortenNumber(uncheckedNotificationsNum, 2, false)}</div>} */}
      </Box>
    </MemoizedMetaButton>
  );
};
