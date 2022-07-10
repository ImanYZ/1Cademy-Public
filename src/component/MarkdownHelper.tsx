import AddIcon from "@mui/icons-material/Add";
import { Collapse, Typography } from '@mui/material'
import { Box } from '@mui/system'
import React, { useState } from 'react'

export const MarkdownHelper = () => {

  const [showHelper, setShowHelper] = useState(false);

  return (
    <Box
      sx={{
        background: "#EE7E2A12",
        p: "8px 16px"
      }}
    >
      <Box onClick={() => setShowHelper(!showHelper)} sx={{ display: "flex", cursor: "pointer" }}>
        <AddIcon
          sx={{
            mr: '24px',
            transform: `rotate(${showHelper ? "45deg" : "0deg"})`,
            transition: "0.2s"
          }}
        />
        <Typography>Click to see how to format your text</Typography>
      </Box>
      <Collapse in={showHelper} timeout="auto" unmountOnExit>
        <ul style={{ paddingLeft: "20px", margin: "0px", display: "flex", flexDirection: "column", gap: "10px" }}>
          <li>
            <Typography>use ``` to create code fenses</Typography>
            <Box
              sx={{
                p: "10px",
                ml: "-20px",
                lineHeight: "35px",
                background: theme => theme.palette.common.darkGrayBackground,
                color: theme => theme.palette.common.white,
                borderRadius: "5px"
              }}
            >
              <code>```</code>
              <br />
              <code>any programming languages</code>
              <br />
              <code>```</code>
            </Box>
          </li>
          <li>_italic_ and **bold**</li>
          <li>
            <Typography>insert links</Typography>
            <Box
              sx={{
                p: "10px",
                ml: "-20px",
                lineHeight: "35px",
                background: theme => theme.palette.common.white,
                color: theme => theme.palette.common.black,
                borderRadius: "5px"
              }}
            >
              <code>{"<https://example.com>"}</code>
              <br />
              <code>{"[example](https://example.com)"}</code>
              <br />
              <code>{'<a href="https://example.com">example</a>'}</code>
            </Box>
          </li>
          <li>
            <i># Header 1 #</i>
          </li>
          <li>
            <i>## Header 2 ##</i>
          </li>
          <li>
            <i>### Header 3 ###</i>
          </li>
        </ul>
      </Collapse>
    </Box>
  )
}
