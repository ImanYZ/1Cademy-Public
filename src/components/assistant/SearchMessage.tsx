import React, { useEffect, useState } from "react";

import { RiveComponentMemoized } from "../home/components/temporals/RiveComponentExtended";

const SEARCH_ANIMATION_LOADER: { text: string; url: string }[] = [
  {
    text: "Generation of final response...",
    url: "rive-assistant/loader/8.riv",
  },
  {
    text: "Sending your question",
    url: "rive-assistant/loader/1.riv",
  },
  {
    text: "Sending information about nodes...",
    url: "rive-assistant/loader/5.riv",
  },
  {
    text: "Providing title, content, and other information about nodes...",
    url: "rive-assistant/loader/7.riv",
  },
];

const SearchMessage = () => {
  const [loaderIdx, setLoaderIdx] = useState<number>(0);
  useEffect(() => {
    setInterval(() => {
      setLoaderIdx(prev => {
        return (prev + 1) % (SEARCH_ANIMATION_LOADER.length - 1);
      });
    }, 10000);
  }, []);

  return (
    <RiveComponentMemoized
      key={`talking-${loaderIdx}`}
      src={SEARCH_ANIMATION_LOADER[loaderIdx].url}
      artboard="New Artboard"
      animations={["Timeline 1"]}
      autoplay={true}
    />
  );
};

export default SearchMessage;
