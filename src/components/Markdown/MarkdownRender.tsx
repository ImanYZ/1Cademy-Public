import "katex/dist/katex.min.css";

import { Box, Link, Typography } from "@mui/material";
import { SxProps, Theme } from "@mui/system";
import React, { FC } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { darcula } from "react-syntax-highlighter/dist/cjs/styles/prism";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

import { containsHTMLTags } from "@/lib/utils/utils";
type Props = {
  text: string;
  customClass?: string;
  sx?: SxProps<Theme>;
  handleLinkClick?: any;
};
const MarkdownRender: FC<Props> = ({ text, customClass, sx = { fontSize: "inherit" }, handleLinkClick }) => {
  return (
    <ReactMarkdown
      remarkPlugins={!containsHTMLTags(text) ? [remarkMath, remarkGfm] : []}
      rehypePlugins={!containsHTMLTags(text) ? [rehypeKatex, rehypeRaw as any] : [rehypeRaw as any]}
      className={customClass}
      components={{
        p: ({ ...props }) => (
          <Typography lineHeight={"inherit"} {...props} sx={{ p: "0px", wordBreak: "break-word", ...sx }} />
        ),
        a: ({ ...props }) => {
          const isMention = props.href && props.href.startsWith("/mention/");
          return isMention ? (
            <Link href={props.href} onClick={event => handleLinkClick(event, props.href)} {...props}>
              {props.children}
            </Link>
          ) : (
            <Link href={props.href} target="_blank" rel="noopener" {...props}>
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
              component={inline ? "span" : "div"}
              sx={{
                paddingBottom: "5px",
                overflow: "overlay",
                background: theme => (theme.palette.mode === "dark" ? "#363636" : "#d6d6d6"),
                borderRadius: "6px",
              }}
            >
              <code {...props}>{children || ""}</code>
            </Box>
          );
        },
      }}
    >
      {containsHTMLTags(text) ? text.replace(/\$\$|\$/g, "") : text}
    </ReactMarkdown>
  );
};

export default MarkdownRender;
