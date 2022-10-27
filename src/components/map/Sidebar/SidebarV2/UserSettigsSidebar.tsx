import { Box } from "@mui/system";
import React from "react";
import { UserTheme } from "src/knowledgeTypes";

import { SidebarWrapper } from "./SidebarWrapper";
type UserSettingsSidebarProps = {
  open: boolean;
  onClose: () => void;
  theme: UserTheme;
  openLinkedNode: any;
  username: string;
};
export const UserSettigsSidebar = ({ open, onClose }: UserSettingsSidebarProps) => {
  return (
    <SidebarWrapper
      title=""
      open={open}
      onClose={onClose}
      width={430}
      // anchor="right"
      SidebarOptions={
        <Box sx={{ borderBottom: 1, borderColor: "divider", width: "100%" }}>
          {/* <Tabs value={value} onChange={handleChange} aria-label={"Bookmarks Tabs"}>
            {[{ title: "Updated" }, { title: "Studied" }].map((tabItem: any, idx: number) => (
              <Tab key={tabItem.title} label={tabItem.title} {...a11yProps(idx)} />
            ))}
          </Tabs> */}
        </Box>
      }
      SidebarContent={
        <Box sx={{ p: "10px" }}>
          {/* {value === 0 && (
            <BookmarksList openLinkedNode={openLinkedNode} updates={true} bookmarks={bookmarkedUserNodes} />
          )}
          {value === 1 && (
            <BookmarksList openLinkedNode={openLinkedNode} updates={false} bookmarks={bookmarkedUserNodes} />
          )} */}
        </Box>
      }
    />
  );
};
