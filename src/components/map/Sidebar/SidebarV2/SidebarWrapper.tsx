import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import CloseIcon from "@mui/icons-material/Close";
import { Drawer, DrawerProps, IconButton } from "@mui/material";
import { Box } from "@mui/system";
import Image, { StaticImageData } from "next/image";
import React, { ReactNode } from "react";
type SidebarWrapperProps = {
  open: boolean;
  onClose: () => void;
  SidebarContent: ReactNode;
  SidebarOptions?: ReactNode;
  anchor?: DrawerProps["anchor"];
  headerImage?: StaticImageData;
  width: number;
};
/**
 * Only Sidebar content should be scrollable
 */
export const SidebarWrapper = ({
  open,
  onClose,
  anchor = "left",
  width,
  headerImage,
  SidebarOptions = null,
  SidebarContent,
}: SidebarWrapperProps) => {
  // const contentHight=useMemo(() => {
  //   if(headerImage && sidbe)
  // }, [second])

  return (
    <Drawer
      variant="persistent"
      anchor={anchor}
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width, border: "solid 2px yellow" } }}
    >
      {headerImage && (
        <Box>
          <Image src={headerImage} alt="header image" width={width} height={200} />
        </Box>
      )}
      <Box sx={{ border: "solid 2px red" }}>{SidebarOptions}</Box>
      <Box
        sx={{
          border: "solid 2px blue",
          height: "100%",
          overflowY: "auto",
          "::-webkit-scrollbar-thumb": {
            background: "rgba(119, 119, 119, 0.692)",
            borderRadius: "4px",
          },
          "::-webkit-scrollbar ": { width: "4px", height: "4px" },
        }}
      >
        {SidebarContent}
      </Box>
      <Box sx={{ position: "absolute", top: "10px", right: "10px" }}>
        <IconButton>
          <CloseIcon />
        </IconButton>
      </Box>
      <Box
        sx={{
          position: "absolute",
          bottom: "10px",
          right: "10px",
        }}
      >
        <IconButton>
          <ArrowUpwardIcon />
        </IconButton>
      </Box>
    </Drawer>
  );
};
