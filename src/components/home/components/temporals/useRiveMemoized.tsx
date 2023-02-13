import React, { useMemo } from "react";
import { useRive } from "rive-react";

export type RiveProps = {
  src: string;
  artboard: string;
  animations: string | string[];
  autoplay: boolean;
  inView?: boolean;
};

export const useRiveMemoized = ({ src, artboard, animations, autoplay }: RiveProps) => {
  const { rive, RiveComponent } = useRive({
    src,
    artboard,
    animations,
    autoplay,
  });

  const riveComponentMemoized = useMemo(() => {
    return (
      <div style={{ width: "700px", height: "700px" }}>
        <RiveComponent className={`rive-canvas `} />
      </div>
    );
  }, [RiveComponent]);

  return { riveComponentMemoized, rive };
};
