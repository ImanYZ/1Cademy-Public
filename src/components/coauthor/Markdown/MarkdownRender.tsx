import 'katex/dist/katex.min.css'
import { Box, Link, Typography } from '@mui/material'
import { SxProps, Theme } from '@mui/system'
import React, { FC, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { darcula } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import styled from 'styled-components'

const MarkdownContainer = styled.div`
  font-size: 16px;
  span {
    background-color: transparent !important;
    font-weight: 600;
  }
  code {
    background-color: transparent !important;
  }
`

type Props = {
  text: string
  sx?: SxProps<Theme>
}

const MarkdownRender: FC<Props> = ({ text, sx = { fontSize: 'inherit' } }) => {
  // Use useMemo to process the markdown content once and store the result
  const markdownContent = useMemo(() => {
    const renderers = {
      p: ({ ...props }) => (
        <Typography
          lineHeight={'inherit'}
          {...props}
          sx={{ p: '0px', wordBreak: 'break-word', ...sx }}
        />
      ),
      a: ({ ...props }) => (
        <Link href={props.href} target="_blank" rel="noopener">
          {props.children}
        </Link>
      ),
      code({ inline, className, children, ...props }: any) {
        const match = /language-(\w+)/.exec(className || '')
        return !inline && match ? (
          <SyntaxHighlighter
            style={darcula as any}
            language={match[1]}
            PreTag="div"
            {...props}
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        ) : (
          <Box
            className="scroll-styled"
            component={inline ? 'span' : 'div'}
            sx={{
              paddingBottom: '5px',
              overflow: 'overlay',
              background: (theme) =>
                theme.palette.mode === 'dark' ? '#363636' : '#363636',
              borderRadius: '6px',
            }}
          >
            <code {...props} style={{ backgroundColor: 'none' }}>
              {children || ''}
            </code>
          </Box>
        )
      },
    }

    return (
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={renderers}
      >
        {text}
      </ReactMarkdown>
    )
  }, [text, sx])

  return <MarkdownContainer>{markdownContent}</MarkdownContainer>
}

export default MarkdownRender
