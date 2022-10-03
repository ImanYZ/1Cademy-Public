import "katex/dist/katex.min.css";

import { Typography } from "@mui/material";
import { SxProps, Theme } from "@mui/system";
import React, { FC } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { darcula } from "react-syntax-highlighter/dist/cjs/styles/prism";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
type Props = {
  text: string;
  customClass?: string;
  sx?: SxProps<Theme>;
};
const MarkdownRender: FC<Props> = ({ text, customClass, sx = { fontSize: "inherit" } }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeKatex]}
      className={customClass}
      components={{
        p: ({ ...props }) => <Typography lineHeight={"inherit"} {...props} sx={{ ...sx }} />,
        code({ inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "");
          return !inline && match ? (
            <SyntaxHighlighter style={darcula as any} language={match[1]} PreTag="div" {...props}>
              {String(children).replace(/\n$/, "")}
            </SyntaxHighlighter>
          ) : (
            <code className={className} {...props}>
              {children || ""}
            </code>
          );
        },
      }}
    >
      {text}
    </ReactMarkdown>
  );
};

export default MarkdownRender;
