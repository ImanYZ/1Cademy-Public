import { Typography } from "@mui/material";
import React from "react";

type TagWrapper = "b" | "i";

export const wrapStringWithTag = (paragraph: string, RE: RegExp, tag: TagWrapper = "b") => {
  const SPACE_DELIMITER = "-----";
  const wrapWithTag = (content: string, tag: TagWrapper) => {
    if (tag === "i") return <Typography component="i">{content} </Typography>;
    if (tag === "b")
      return (
        <Typography component="b" sx={{ fontWeight: 600 }}>
          {content}{" "}
        </Typography>
      );
    return <Typography component="span">{content}</Typography>;
  };

  const removeDelimiters = (content: string) => {
    return content.substring(1, content.length - 1).replaceAll(SPACE_DELIMITER, " ");
  };

  const tt = paragraph
    .replace(RE, e => e.replaceAll(" ", SPACE_DELIMITER))
    .split(" ")
    .map((str, idx) => (
      <React.Fragment key={idx}>{str.match(RE) ? wrapWithTag(removeDelimiters(str), tag) : `${str} `}</React.Fragment>
    ));

  return tt;
};

export const wrapStringWithBoldTag = (paragraph: string, RE: RegExp) => {
  return paragraph
    .split(" ")
    .map((str, idx) => (
      <React.Fragment key={idx}>
        {str.match(RE) ? <b>{`${str.substring(1, str.length - 1)} `}</b> : `${str} `}
      </React.Fragment>
    ));
};
