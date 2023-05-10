import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DoneRoundedIcon from "@mui/icons-material/DoneRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import { Box, Stack, Typography } from "@mui/material";
import React from "react";

import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";

import OptimizedAvatar2 from "../../OptimizedAvatar2";
import { PointsType } from "../../PointsType";
import { UserPoints } from "./SidebarV2/UserSettigsSidebar";

type UserDetailsProps = {
  id?: string;
  imageUrl: any;
  fName: string;
  lName: string;
  uname: string;
  points: UserPoints;
  chooseUname?: boolean;
};

const UserDetails = ({ id, imageUrl, fName, lName, uname, chooseUname, points }: UserDetailsProps) => {
  return (
    <Stack direction={"row"} alignItems={"center"} component={"section"} spacing={"24px"} mb="18px">
      <Box id={`${id}-picture`} sx={{ "& img": { borderRadius: "50%" }, borderRadius: "8px" }}>
        <OptimizedAvatar2 alt={`${uname}`} imageUrl={imageUrl} size={90} />
      </Box>
      <Box>
        <Typography id={`${id}-username`} sx={{ fontSize: "20px", fontWeight: "700", borderRadius: "4px" }}>
          {chooseUname ? uname : `${fName} ${lName}`}
        </Typography>
        <Typography
          sx={{
            fontSize: "14px",
            mb: "8px",
            color: theme =>
              theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.gray300 : DESIGN_SYSTEM_COLORS.gray500,
          }}
        >
          @{uname}
        </Typography>
        <Stack id={`${id}-statistics`} direction={"row"} spacing={"12px"} borderRadius={"4px"}>
          <PointsType points={points.positives}>
            <DoneRoundedIcon sx={{ color: DESIGN_SYSTEM_COLORS.success600, fontSize: "16px" }} />
          </PointsType>
          <PointsType points={points.negatives}>
            <CloseRoundedIcon sx={{ color: DESIGN_SYSTEM_COLORS.orange600, fontSize: "16px" }} />
          </PointsType>
          <PointsType points={points.stars}>
            <StarRoundedIcon sx={{ color: DESIGN_SYSTEM_COLORS.yellow400, fontSize: "16px" }} />
          </PointsType>
        </Stack>
      </Box>
    </Stack>
  );
};

export default UserDetails;
