import { Box, IconButton, Tooltip } from "@mui/material";
import React from "react";
import { useRive } from "rive-react";

export type RiveProps = {
  src: string;
  artboard: string;
  animations: string | string[];
  autoplay: boolean;
  inView?: boolean;
  displayControls?: boolean;
};

const RiveComponentExtended = ({ src, artboard, animations, autoplay, displayControls = false }: RiveProps) => {
  const { RiveComponent, rive } = useRive({
    src,
    artboard,
    animations,
    autoplay,
  });

  const onResetAnimation = () => {
    if (!rive) return;
    // rive.stop();
    // rive.reset();
    // rive.ap
    rive.scrub(animations, 0);
    // rive.startRendering();
    rive.play();
  };

  return (
    <Box sx={{ width: "inherit", height: "inherit", position: "relative" }}>
      <RiveComponent className={`rive-canvas`} />
      {displayControls && (
        <Tooltip title="Restarts the animation">
          <IconButton onClick={onResetAnimation} sx={{ position: "absolute", bottom: "0px", right: "0px" }}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              version="1.1"
              id="Layer_1"
              x="0"
              y="0"
              viewBox="0 0 100 100"
              xmlSpace="preserve"
              width={"24px"}
              height={"24px"}
            >
              <path d="M51.2 18.5l.5-12c-5.7-.2-11.4.7-16.8 2.7l4.2 11.3c3.9-1.5 8-2.1 12.1-2z" fill="#f0af6b" />
              <path
                d="M34.3 22.7c.8-.5 1.7-.9 2.6-1.3l-5-10.9-3.6 1.8c-3.8 2.2-7.2 4.9-10.1 8.1l8.8 8.2c2-2.3 4.5-4.3 7.3-5.9z"
                fill="#a8b980"
              />
              <path d="M25.3 30.4L15.9 23c-3.5 4.5-6.1 9.5-7.7 15l11.5 3.3c1.2-4 3-7.6 5.6-10.9z" fill="#829985" />
              <path d="M71.1 12c-5-2.8-10.4-4.5-16.1-5.2l-1.4 11.9c4.1.5 8 1.7 11.7 3.8L71.1 12z" fill="#ea7c60" />
              <path
                d="M87.7 28.3c-1.9-3.3-4.2-6.3-6.9-9-2-2.1-4.3-3.9-6.7-5.5l-6.6 10c1.7 1.2 3.4 2.5 4.9 4 1.9 2 3.6 4.1 5 6.5C80 39 81.5 44.5 81.5 50c0 11.2-6 21.7-15.7 27.3-9 5.2-19.7 5.6-28.9 1.4l3.8-3.9-23.2-6 6.4 23.1 4.2-4.3c6.8 4 14.3 6 21.9 6 7.5 0 15-2 21.8-5.9C85.2 79.9 93.5 65.5 93.5 50c0-7.6-2-15.1-5.8-21.7z"
                fill="#d65a62"
              />
            </svg>
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
};
export const RiveComponentMemoized = React.memo(RiveComponentExtended);
