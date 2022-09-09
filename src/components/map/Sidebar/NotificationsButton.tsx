// import React, { useCallback } from "react";
// import { useRecoilValue } from "recoil";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";

import shortenNumber from "../../../lib/utils/shortenNumber";
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
      <>
        {uncheckedNotificationsNum > 0 ? <NotificationsActiveIcon /> : <NotificationsNoneIcon />}
        {/* <i className="material-icons ">
          {uncheckedNotificationsNum > 0 ? "notifications_active" : "notifications_none"}
        </i> */}
        <span className="SidebarDescription">Notifications</span>
        {uncheckedNotificationsNum > 0 && (
          <div className="NotificationsNum">{shortenNumber(uncheckedNotificationsNum, 2, false)}</div>
        )}
      </>
    </MemoizedMetaButton>
  );
};
