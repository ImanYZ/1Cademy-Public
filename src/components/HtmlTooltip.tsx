import { styled } from "@mui/material/styles";
import Tooltip, { tooltipClasses, TooltipProps } from "@mui/material/Tooltip";

const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.mode === "dark" ? "#303134" : "#f0f0f0",
    color: theme.palette.mode === "dark" ? theme.palette.common.white : theme.palette.common.black,
    maxWidth: "340px",
    fontWeight: theme.typography.fontWeightRegular,
    padding: "20px 40px",
    border: `1px solid ${theme.palette.grey[400]}`,
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
  },
}));

export default HtmlTooltip;
