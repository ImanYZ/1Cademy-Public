import styled from "@emotion/styled";
import React from "react";

const VideoResponsive = styled.div`
  overflow: hidden;
  padding-bottom: 56.25%;
  position: relative;
  height: 0;
`;

const VideoResponsiveIFrame = styled.iframe`
  left: 0;
  top: 0;
  height: 100%;
  width: 100%;
  position: absolute;
`;

const YoutubeEmbed = ({ embedId }: any) => (
  <VideoResponsive>
    <VideoResponsiveIFrame
      width="853"
      height="480"
      src={`https://www.youtube.com/embed/${embedId}`}
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      title="Embedded youtube"
    />
  </VideoResponsive>
);

export default YoutubeEmbed;
