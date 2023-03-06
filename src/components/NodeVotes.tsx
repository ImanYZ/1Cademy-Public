import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { Divider } from "@mui/material";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { FC } from "react";

type Props = {
  corrects?: number;
  wrongs?: number;
};

const NodeVotes: FC<Props> = ({ corrects = 0, wrongs = 0 }) => {
  return (
    <Box
      className="tab-double-button-node-footer"
      sx={{
        display: "flex",
        flexDirection: "row",
        background: "white",
      }}
    >
      <Tooltip
        title={`${wrongs}  people found this node unhelpful and voted to delete it. To vote, you should create an account.`}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            mr: 2,
          }}
        >
          <CloseIcon fontSize="small" color="error" />
          <Typography sx={{ ml: 1, color: theme => theme.palette.error.main }} color="disabled">
            {wrongs}
          </Typography>
        </Box>
      </Tooltip>
      <Divider
        orientation="vertical"
        variant="middle"
        flexItem
        sx={{
          borderColor: theme => (theme.palette.mode === "dark" ? "#D3D3D3" : "inherit"),
        }}
      />
      <Tooltip
        title={`${corrects} people found this node helpful and voted to prevent further changes. To vote, you should create an account.`}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            mr: 2,
          }}
        >
          <CheckIcon fontSize="small" color="success" />
          <Typography sx={{ ml: 1, color: theme => theme.palette.success.main }} color="disabled">
            {corrects}
          </Typography>
        </Box>
      </Tooltip>
    </Box>
  );
};

export default NodeVotes;
