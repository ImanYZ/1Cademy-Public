import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ConstructionIcon from "@mui/icons-material/Construction";
import { Box, CircularProgress, Collapse, Divider, IconButton, Stack } from "@mui/material";
import { SxProps, Theme } from "@mui/material/styles";
import React, { ReactNode, useState } from "react";

type ToolboxProps = {
  children: ReactNode;
  isLoading?: boolean;
  sx?: SxProps<Theme>;
};

const Toolbox = ({ children, isLoading = false, sx }: ToolboxProps) => {
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
          <Stack direction={"row"} spacing={"10px"} sx={{ p: "10px 0px 10px 10px" }}>
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
            ...(expanded && {
              color: theme =>
                theme.palette.mode === "dark" ? theme.palette.common.primary800 : theme.palette.common.primary600,
            }),
            padding: { xs: "0px !important", sm: "8px!important" },
            width: { xs: "32px", sm: "40px" },
            height: { xs: "30px", sm: "40px" },
            ":hover": {
              background: theme => (expanded ? (theme.palette.mode === "dark" ? "#55402B" : "#FDEAD7") : "inherit"),
            },
          }}
        >
          <ConstructionIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export const MemoizedToolbox = React.memo(Toolbox);
