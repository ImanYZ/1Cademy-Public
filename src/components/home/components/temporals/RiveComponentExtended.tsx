import React from "react";
import { useRive } from "rive-react";

export type RiveProps = {
  src: string;
  artboard: string;
  animations: string | string[];
  autoplay: boolean;
  inView?: boolean;
};

const RiveComponentExtended = ({ src, artboard, animations, autoplay }: RiveProps) => {
  const { RiveComponent } = useRive({
    src,
    artboard,
    animations,
    autoplay,
  });

  return (
    <div style={{ width: "700px", height: "700px" }}>
      <RiveComponent className={`rive-canvas `} />
    </div>
  );
};
export const RiveComponentMemoized = React.memo(RiveComponentExtended);
