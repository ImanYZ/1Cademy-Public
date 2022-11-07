import CloseIcon from "@mui/icons-material/Close";
import { Box, Link } from "@mui/material";
import { Button } from "@mui/material";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import LinkNext from "next/link";
import React from "react";

import OptimizedAvatar from "../../../components/OptimizedAvatar";

const StudentsProfile = ({ openProfile, openedProfile, handleOpenCloseProfile }: any) => (
  <Drawer sx={{ backgroundColor: "transparent" }} anchor={"bottom"} open={openProfile} onClose={handleOpenCloseProfile}>
    <Box sx={{ borderRadius: "16px", m: 0, border: 1 }}>
      {"  "}
      <Box sx={{ textAlign: "right" }}>
        <IconButton onClick={handleOpenCloseProfile}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Box sx={{ textAlign: "center", height: "200px" }}>
        <Box sx={{ display: "flex", ml: "33%", mb: "5%", mt: "10%", flexDirection: "row" }}>
          <Box>
            <OptimizedAvatar
              name={openedProfile.username}
              imageUrl={openedProfile.avatar}
              renderAsAvatar={true}
              contained={false}
              sx={{ mr: "15px" }}
            />
            <div
              className={openedProfile.online ? "UserStatusOnlineIcon" : "UserStatusOfflineIcon"}
              style={{ fontSize: "1px", marginLeft: "35px" }}
            ></div>
          </Box>
          <LinkNext href={"#"}>
            <Link>
              {" "}
              <>{openedProfile.firstName + openedProfile.lastName}</>
            </Link>
          </LinkNext>
        </Box>

        <Box sx={{ mr: "30px" }}>{openedProfile.email}</Box>
        <Button
          variant="contained"
          onClick={() => {
            console.log("takemetothe profile");
          }}
          sx={{
            color: theme => theme.palette.common.white,
            background: theme => theme.palette.common.orange,
            fontSize: 13,
            fontWeight: "700",
            my: { xs: "0px", md: "auto" },
            mt: { xs: "15px", md: "auto" },
            marginLeft: { xs: "0px", md: "32px" },
            marginRight: "40px",
            paddingX: "30px",
            borderRadius: 1,
            textAlign: "center",
            alignSelf: "center",
          }}
        >
          See Profile
        </Button>
      </Box>
    </Box>
  </Drawer>
);

export default StudentsProfile;
