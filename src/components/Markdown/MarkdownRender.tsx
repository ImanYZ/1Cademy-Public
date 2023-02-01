import "katex/dist/katex.min.css";

import { Box, Link, Typography } from "@mui/material";
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
        p: ({ ...props }) => (
          <Typography lineHeight={"inherit"} {...props} sx={{ p: "0px", wordBreak: "break-word", ...sx }} />
        ),
        a: ({ ...props }) => {
          // console.log(props);
          return (
            <Link href={props.href} target="_blank" rel="noopener">
              {props.children}
            </Link>
          );
        },
        code({ inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "");
          return !inline && match ? (
            <SyntaxHighlighter style={darcula as any} language={match[1]} PreTag="div" {...props}>
              {String(children).replace(/\n$/, "")}
            </SyntaxHighlighter>
          ) : (
            <Box
              className="scroll-styled"
              sx={{
                paddingBottom: "5px",
                overflow: "overlay",
              }}
            >
              <code {...props}>{children || ""}</code>
            </Box>
          );
        },
      }}
    >
      {text}
    </ReactMarkdown>
  );
};

export default MarkdownRender;
