import { Box } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";

type NodeVideoProps = {
  addVideo: boolean;
  videoData: {
    url: string;
    video_id: string;
    video_type: string;
  };
};

const NodeVideo = ({ addVideo, videoData }: NodeVideoProps) => {
  const nodeVideoRef = useRef<HTMLIFrameElement>(null);
  const [showVideo, setShowVideo] = useState(false);
  useEffect(() => {
    if (!nodeVideoRef.current) return;
    if (showVideo !== addVideo) {
      setShowVideo(addVideo && !!videoData.video_id);
    }
  }, [nodeVideoRef, showVideo, addVideo, videoData]);

  return (
    <Box
      sx={{
        display: showVideo ? "flex" : "none",
        width: "100%",
        height: "310px",
      }}
    >
      <iframe
        ref={nodeVideoRef}
        src={videoData.url}
        width={"100%"}
        style={{
          border: "0px",
        }}
      ></iframe>
    </Box>
  );
};

export const MemoizedNodeVideo = React.memo(NodeVideo);
