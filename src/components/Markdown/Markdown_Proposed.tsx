import "katex/dist/katex.min.css";

import React, { FC, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

type Props = {
  text: string;
};

let remarkMath: any, rehypeKatex: any, Prism: any, darcula: any;

const MarkdownRender: FC<Props> = ({ text }) => {
  const [hasMath, setHasMath] = useState(false);
  const [hasCode, setHasCode] = useState(false);

  useEffect(() => {
    const loadMathCode = async () => {
      if (text.includes("$")) {
        setHasMath(true);
        remarkMath = await import("remark-math");
      }
      if (text.includes("`")) {
        setHasCode(true);
        rehypeKatex = await import("rehype-katex");
        ({ Prism } = await import("react-syntax-highlighter"));
        ({ darcula } = await import("react-syntax-highlighter/dist/cjs/styles/prism"));
      }
    };
    if (text) {
      loadMathCode();
    }
  }, [text]);

  return (
    <ReactMarkdown
      remarkPlugins={hasMath ? [remarkMath] : []}
      rehypePlugins={hasCode ? [rehypeKatex] : []}
      components={
        hasCode
          ? {
              code({ inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || "");
                return !inline && match ? (
                  <Prism style={darcula as any} language={match[1]} PreTag="div" {...props}>
                    {String(text).replace(/\n$/, "")}
                  </Prism>
                ) : (
                  <code className={className} {...props}>
                    {children || ""}
                  </code>
                );
              },
            }
          : {}
      }
    >
      {text}
    </ReactMarkdown>
  );
};

export default MarkdownRender;
