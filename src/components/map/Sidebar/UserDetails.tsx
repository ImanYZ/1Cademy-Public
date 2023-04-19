import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DoneRoundedIcon from "@mui/icons-material/DoneRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import { Avatar, Box, Stack, Typography } from "@mui/material";
import Image from "next/image";
import React, { ReactNode } from "react";

import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";

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
const DEFAULT_PROFILE_URL = "https://storage.googleapis.com/onecademy-1.appspot.com/ProfilePictures/no-img.png";

const UserDetails = ({ id, imageUrl, fName, lName, uname, chooseUname, points }: UserDetailsProps) => {
  return (
    <Stack direction={"row"} alignItems={"center"} component={"section"} spacing={"24px"} mb="18px">
      <Box id={`${id}-picture`} sx={{ "& img": { borderRadius: "50%" }, borderRadius: "8px" }}>
        {imageUrl && imageUrl !== "" && imageUrl !== DEFAULT_PROFILE_URL ? (
          <Image
            src={imageUrl}
            alt={`${fName} ${lName}`}
            width={90}
            height={90}
            objectFit="cover"
            objectPosition="center center"
          />
        ) : (
          <Avatar
            sx={{
              width: "90px",
              height: "90px",
              color: "white",
              fontSize: "24px",
              fontWeight: "600",
              background: "linear-gradient(143.7deg, #FDC830 15.15%, #F37335 83.11%);",
            }}
          >
            {`${(fName ?? "").charAt(0)}${(lName ?? "").charAt(0)}`}
          </Avatar>
        )}
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

const PointsType = ({ points, children }: { points: number; children: ReactNode }) => {
  const { notebookG700, notebookG50 } = DESIGN_SYSTEM_COLORS;
  return (
    <Stack direction={"row"} alignItems={"center"} spacing={"6px"}>
      <Typography sx={{ fontWeight: "600" }}>{points}</Typography>
      <Box
        sx={{
          width: "20px",
          height: "20px",
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          backgroundColor: theme => (theme.palette.mode === "dark" ? notebookG700 : notebookG50),
        }}
      >
        {children}
      </Box>
    </Stack>
  );
};

export default UserDetails;
