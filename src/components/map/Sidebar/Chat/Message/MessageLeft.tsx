import { Typography } from "@mui/material";
import { Box } from "@mui/system";
import React from "react";

import OptimizedAvatar2 from "@/components/OptimizedAvatar2";
type MessageLeftProps = {
  message: any;
};
export const MessageLeft = ({ message }: MessageLeftProps) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
      }}
    >
      <Box
        //className={className}
        sx={{
          width: `${50}px`,
          height: `${50}px`,
          cursor: "pointer",
          // display: "inline-block",
          // position: "absolute",
          // left: "0px",
          // bottom: "0px",
          transition: "all 0.2s 0s ease",
          background: "linear-gradient(143.7deg, #FDC830 15.15%, #F37335 83.11%);",
          borderRadius: "50%",
          // transform: `translate(-50%, ${verticalPosition}px)`,
          "& > .user-image": {
            borderRadius: "50%",
            overflow: "hidden",
            width: "50px",
            height: "50px",
          },
          "&.GainedPoint": {
            "& > .user-image": {
              boxShadow: "1px 1px 13px 4px rgba(21, 255, 0, 1)",
            },
          },
          "&.LostPoint": {
            "& > .user-image": {
              boxShadow: "1px 1px 13px 4px rgba(255, 0, 0, 1)",
            },
          },
          "@keyframes slidein": {
            from: {
              transform: "translateY(0%)",
            },
            to: {
              transform: "translateY(100%)",
            },
          },
        }}
      >
        <Box className="user-image">
          <OptimizedAvatar2
            alt={"Haroon Waheed"}
            imageUrl={
              "https://firebasestorage.googleapis.com/v0/b/onecademy-1.appspot.com/o/ProfilePictures%2FJqxTY6ZE08dudguFF0KDPqbkoZt2%2FWed%2C%2018%20Jan%202023%2022%3A14%3A06%20GMT_430x1300.jpeg?alt=media&token=9ef2b4e0-1d78-483a-ae3d-79c2007dfb31"
            }
            size={50}
            sx={{ border: "none" }}
          />
        </Box>
        <Box sx={{ background: "#12B76A" }} className="UserStatusOnlineIcon" />
      </Box>
      <Box sx={{ marginTop: "45px", width: "90%" }}>
        <Typography
          sx={{
            fontSize: "16px",
            fontWeight: "500",
            lineHeight: "24px",
          }}
        >
          {message.sender}
        </Typography>

        <Typography
          sx={{
            fontSize: "16px",
            fontWeight: "400",
            lineHeight: "24px",
            p: "10px 14px",
            background: "#242425",
          }}
        >
          {message.message}
        </Typography>
      </Box>
    </Box>
  );
};
