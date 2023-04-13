import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { CircularProgress, Collapse, Divider, IconButton, Stack, useTheme } from "@mui/material";
import { SxProps, Theme } from "@mui/material/styles";
import { Box } from "@mui/system";
import NextImage from "next/image";
import React, { ReactNode, useState } from "react";

import toolBox from "../../../public/toolbox.svg";
import toolBoxDark from "../../../public/toolbox-dark.svg";
import toolBoxDarkOpen from "../../../public/toolbox-dark-open.svg";
import toolBoxOpen from "../../../public/toolbox-open.svg";

type ToolboxProps = {
  children: ReactNode;
  isLoading?: boolean;
  sx?: SxProps<Theme>;
};

const Toolbox = ({ children, isLoading = false, sx }: ToolboxProps) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);

  return (
    <Box
      sx={{
        borderRadius: "8px",
        height: { xs: "44px", sm: "60px" },
        display: "flex",
        opacity: 1,
        cursor: "pointer",
        background: theme =>
          theme.palette.mode === "dark" ? theme.palette.common.notebookMainBlack : theme.palette.common.gray50,
        zIndex: 10,
        ...sx,
      }}
    >
      {/* collapse button */}
      {expanded && (
        <>
          <Box
            onClick={() => setExpanded(false)}
            sx={{ display: "grid", placeItems: "center", cursor: "pointer", width: "28px" }}
          >
            <ArrowForwardIosIcon
              fontSize="inherit"
              sx={{ color: theme => (theme.palette.mode === "dark" ? "#A4A4A4" : "#98A2B3") }}
            />
          </Box>

          <Divider orientation="vertical" />
        </>
      )}

      {/* options */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          gap: { xs: "5px", md: "16px" },
        }}
      >
        <Collapse in={expanded} timeout="auto" orientation="horizontal" unmountOnExit>
          <Stack direction={"row"} spacing={"10px"} sx={{ px: "10px 0px 10px 10px" }}>
            {children}
            <Divider orientation="vertical" sx={{ height: "auto" }} />
          </Stack>
        </Collapse>
      </Box>

      {/* toggle button */}
      <Box
        sx={{
          width: { xs: "50px", sm: "60px" },
          right: "8px",
          height: { xs: "44px", sm: "60px" },
          padding: "10px",
          boxShadow: theme =>
            theme.palette.mode === "dark"
              ? "0px 1px 2px rgba(0, 0, 0, 0.06), 0px 1px 3px rgba(0, 0, 0, 0.1)"
              : "box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.06), 0px 1px 3px rgba(0, 0, 0, 0.1)",
        }}
        onClick={() => setExpanded(!expanded)}
      >
        {isLoading && (
          <CircularProgress
            size={46}
            sx={{
              position: "absolute",
              right: { xs: "1px", sm: "7px" },
              bottom: { xs: "0px", sm: "7px" },
              zIndex: "1300",
            }}
          />
        )}
        <IconButton
          color="secondary"
          sx={{
            padding: { xs: "0px !important", sm: "8px!important" },
            width: { xs: "32px", sm: "40px" },
            height: { xs: "30px", sm: "40px" },
            ":hover": {
              width: { xs: "32px", sm: "40px" },
              height: { xs: "30px", sm: "40px" },
              borderRadius: "8px",
              background: theme => (expanded ? (theme.palette.mode === "dark" ? "#55402B" : "#FDEAD7") : "inherit"),
            },
          }}
        >
          <NextImage
            src={
              theme.palette.mode === "dark"
                ? expanded
                  ? toolBoxDarkOpen
                  : toolBoxDark
                : expanded
                ? toolBoxOpen
                : toolBox
            }
            alt="logo 1cademy"
            width="24px"
            height="24px"
          />
        </IconButton>
      </Box>
    </Box>
  );
};

export const MemoizedToolbox = React.memo(Toolbox);
