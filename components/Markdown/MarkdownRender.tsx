import "katex/dist/katex.min.css";

import { Typography } from "@mui/material";
import React, { FC } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { darcula } from "react-syntax-highlighter/dist/cjs/styles/prism";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";

type Props = {
  text: string;
};
const MarkdownRender: FC<Props> = ({ text }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        p: ({ ...props }) => <Typography fontSize={"inherit"} lineHeight={"inherit"} {...props} />,
        code({ inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "");
          return !inline && match ? (
            <SyntaxHighlighter style={darcula as any} language={match[1]} PreTag="div" {...props}>
              {String(text).replace(/\n$/, "")}
            </SyntaxHighlighter>
          ) : (
            <code className={className} {...props}>
              {children || ""}
            </code>
          );
        }
      }}
    >
      {text}
    </ReactMarkdown>
  );
};

export default MarkdownRender;
