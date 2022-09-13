// import "./PendingProposalsButton.css";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import React, { useState } from "react";

import shortenNumber from "../../../lib/utils/shortenNumber";
import { MemoizedMetaButton } from "../MetaButton";

type PendingProposalsButtonProps = {
  openSideBar: any;
};

const PendingProposalsButton = (props: PendingProposalsButtonProps) => {
  // const pendingProposalsNum = useRecoilValue(pendingProposalsNumState);
  // const pendingProposalsLoaded = useRecoilValue(pendingP
  const [pendingProposalsLoaded] = useState(true);
  const [pendingProposalsNum] = useState(0);

  return (
    <MemoizedMetaButton
      onClick={() => props.openSideBar("PendingProposals")}
      // tooltip="Click to open the list of pending proposals."
      // tooltipPosition="Right"
    >
      <>
        <FormatListBulletedIcon />
        <span className="SidebarDescription">Pending List</span>
        {pendingProposalsLoaded && pendingProposalsNum > 0 && (
          <div className="NotificationsNum">{shortenNumber(pendingProposalsNum, 2, false)}</div>
        )}
      </>
    </MemoizedMetaButton>
  );
};

export default React.memo(PendingProposalsButton);
