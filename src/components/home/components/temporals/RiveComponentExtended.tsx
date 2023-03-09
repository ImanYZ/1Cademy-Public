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

  return <RiveComponent className={`rive-canvas`} />;
};
export const RiveComponentMemoized = React.memo(RiveComponentExtended);
