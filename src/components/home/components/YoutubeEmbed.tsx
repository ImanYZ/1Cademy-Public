// import "./YoutubeEmbed.css";

// import PropTypes from "prop-types";
import React from "react";

type YoutubeEmbedProps = { embedId: string };

const YoutubeEmbed = ({ embedId }: YoutubeEmbedProps) => (
  <div className="video-responsive">
    <iframe
      width="853"
      height="480"
      src={`https://www.youtube.com/embed/${embedId}`}
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      title="Embedded youtube"
    />
  </div>
);

// YoutubeEmbed.propTypes = {
//   embedId: PropTypes.string.isRequired,
// };

export default YoutubeEmbed;
