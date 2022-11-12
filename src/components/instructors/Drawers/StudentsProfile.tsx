import CloseIcon from "@mui/icons-material/Close";
import { Box, Link } from "@mui/material";
import { Button } from "@mui/material";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import LinkNext from "next/link";
import React from "react";

import OptimizedAvatar from "../../../components/OptimizedAvatar";

const StudentsProfile = ({ openProfile, openedProfile, handleOpenCloseProfile }: any) => (
  <Drawer
    sx={{ backgroundColor: "transparent" }}
    anchor={"bottom"}
    open={openProfile}
    PaperProps={{
      sx: {
        borderRadius: "16px 16px 0px 0px ",
      },
    }}
    onClose={handleOpenCloseProfile}
  >
    <Box>
      {"  "}
      <Box>
        <IconButton onClick={handleOpenCloseProfile}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Box
        sx={{
          textAlign: "center",
          height: "200px",
          diplay: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ pl: "46%" }}>
          <OptimizedAvatar
            name={openedProfile?.username}
            imageUrl={openedProfile?.avatar}
            renderAsAvatar={true}
            contained={false}
            sx={{ marginLef: "50%" }}
          />
        </Box>
        <Box
          sx={{ ml: "46%", mb: "5px" }}
          className={openedProfile?.online ? "UserStatusOnlineIcon" : "UserStatusOfflineIcon"}
        ></Box>
        <LinkNext href={"/instructors/dashboard/" + openedProfile?.username}>
          <Link>
            {" "}
            <>{openedProfile?.firstName + openedProfile?.lastName}</>
          </Link>
        </LinkNext>
        <Box>{openedProfile?.email}</Box>
        <LinkNext href={"/instructors/dashboard/" + openedProfile?.username}>
          <Button
            variant="contained"
            sx={{
              color: theme => theme.palette.common.white,
              background: theme => theme.palette.common.orange,
              mt: { xs: "15px", md: "auto" },
            }}
          >
            See Profile
          </Button>
        </LinkNext>
      </Box>
    </Box>
  </Drawer>
);

export default StudentsProfile;
