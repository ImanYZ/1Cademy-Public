import React, { useCallback, useState } from "react";

type RoundImageProps = {
  imageUrl: string;
  alt: string;
};

const RoundImage = (props: RoundImageProps) => {
  const [imageWidth, setImageWidth] = useState("100%");
  const [imageHeight, setImageHeight] = useState("auto");

  const setImageSize = useCallback(({ target: img }: any) => {
    if (img.offsetHeight > img.offsetWidth) {
      setImageWidth("100%");
      setImageHeight("auto");
    } else {
      setImageWidth("auto");
      setImageHeight("100%");
    }
  }, []);

  return (
    <div className="UserAvatar UserStatusIcon">
      {/* TODO: change to Next Image */}
      {/* eslint-disable @next/next/no-img-element */}
      <img
        src={props.imageUrl}
        style={{ width: imageWidth, height: imageHeight }}
        alt={props.alt}
        onLoad={setImageSize}
      />
    </div>
  );
};

export default React.memo(RoundImage);
