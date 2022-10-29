// import "./PendingProposalsButton.css";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import { Badge, Box } from "@mui/material";
import React from "react";

// import shortenNumber from "../../../lib/utils/shortenNumber";
import { MemoizedMetaButton } from "../MetaButton";

type PendingProposalsButtonProps = {
  openSideBar: any;
  pendingProposalsNum: number;
  pendingProposalsLoaded: boolean;
};

const PendingProposalsButton = (props: PendingProposalsButtonProps) => {
  // const pendingProposalsNum = useRecoilValue(pendingProposalsNumState);
  // const pendingProposalsLoaded = useRecoilValue(pendingP
  // const [pendingProposalsLoaded] = useState(true);
  // const [pendingProposalsNum] = useState(0);

  return (
    <MemoizedMetaButton
      onClick={() => props.openSideBar("PendingProposals")}
      // tooltip="Click to open the list of pending proposals."
      // tooltipPosition="Right"
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-start", gap: "5px", height: "30px" }}>
        <Badge
          badgeContent={props.pendingProposalsLoaded ? props.pendingProposalsNum ?? 0 : 0}
          color="error"
          anchorOrigin={{ vertical: "top", horizontal: "left" }}
          sx={{ padding: "1px", wordBreak: "normal" }}
        >
          <FormatListBulletedIcon />
        </Badge>
        <span className="SidebarDescription">Pending List</span>
        {/* {pendingProposalsLoaded && pendingProposalsNum > 0 && (
          <div className="NotificationsNum">{shortenNumber(pendingProposalsNum, 2, false)}</div>
        )} */}
      </Box>
    </MemoizedMetaButton>
  );
};

export default React.memo(PendingProposalsButton);
