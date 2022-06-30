import { Autocomplete, Box, Card, CardHeader, Divider, List, ListItem, TextField, Typography } from "@mui/material";
import { SxProps, Theme } from "@mui/system";
import React, { useState } from 'react'

import { LinkedKnowledgeNode } from '../src/knowledgeTypes';
import { Searcher } from "./Searcher";
import TypographyUnderlined from "./TypographyUnderlined";

type LinkedNodeEditorProps = {
  initialNodes: LinkedKnowledgeNode[];
  header: string;
  sx?: SxProps<Theme>;
}

export const LinkedNodeEditor = ({ initialNodes, header, sx }: LinkedNodeEditorProps) => {

  const [nodesSelected, setNodesSelected] = useState<LinkedKnowledgeNode[]>(initialNodes)

  const renderLinkedNodes = () => {
    return nodesSelected.map((el, idx, src) => (
      <React.Fragment key={idx}>
        {/* <LinkedNodeItem
          title={el.title || ""}
          linkSrc={getNodePageUrl(el.title || "", el.node)}
          nodeType={el.nodeType}
          nodeImageUrl={el.nodeImage}
          nodeContent={el.content}
          label={el.label || ""}
          sx={{ p: "20px" }}
        /> */}
        <Typography>{el.title}</Typography>
        {idx < src.length - 1 && <Divider />}
      </React.Fragment>
    ));
  };


  return (
    <Card sx={{ ...sx }}>
      <CardHeader
        sx={{
          backgroundColor: theme => theme.palette.common.darkGrayBackground,
          color: theme => theme.palette.common.white
        }}
        title={
          <Box sx={{ textAlign: "center" }}>
            <TypographyUnderlined variant="h6" fontWeight="300" gutterBottom align="center">
              {header}
            </TypographyUnderlined>
          </Box>
        }
      ></CardHeader>
      <Box>
        <List sx={{ p: "0px" }}>
          <ListItem>
            {/* <Searcher /> */}
            <Autocomplete
              id="free-solo-demo"
              freeSolo
              options={['sdfds', 'sadf', 'wefew']}
              renderInput={(params) => <Searcher inputBaseProps={params.inputProps} />/*<TextField {...params} label="freeSolo" />*/}
              fullWidth
            />
          </ListItem>
          {renderLinkedNodes()}
        </List>
      </Box>
    </Card>
  )
}
