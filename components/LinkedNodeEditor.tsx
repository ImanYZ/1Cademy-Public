import CloseIcon from '@mui/icons-material/Close';
import { Autocomplete, Box, Card, CardHeader, Divider, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, TextField, Typography } from "@mui/material";
import { SxProps, Theme } from "@mui/system";
import React, { useState } from 'react'

import { getNodePageUrl } from '../lib/utils';
import { LinkedKnowledgeNode } from '../src/knowledgeTypes';
import LinkedNodeItem from './LinkedNodeItem';
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
        {idx < src.length && <Divider />}
        <LinkedNodeItem
          title={el.title || ""}
          linkSrc={getNodePageUrl(el.title || "", el.node)}
          nodeType={el.nodeType}
          nodeImageUrl={el.nodeImage}
          nodeContent={el.content}
          label={el.label || ""}
          sx={{ p: "20px" }}
          openInNewTab
          secondaryActions={
            <>
              <IconButton sx={{ alignItems: 'center', justifyContent: 'flex-end' }} onClick={() => console.log('close')}>
                <CloseIcon />
              </IconButton>
            </>
          }
        />

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
          <ListItem sx={{ p: '24px 25px' }}>
            <Autocomplete
              id="linked-node-searcher"
              freeSolo
              fullWidth
              options={['sdfds', 'sadf', 'wefew']}
              renderInput={(params) => <Searcher
                ref={params.InputProps.ref}
                inputBaseProps={params.inputProps}
              />}
            />
          </ListItem>
          {renderLinkedNodes()}
        </List>
      </Box>
    </Card>
  )
}
