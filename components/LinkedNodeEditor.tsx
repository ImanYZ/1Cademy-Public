import CloseIcon from '@mui/icons-material/Close';
import { Autocomplete, Box, Card, CardHeader, Divider, IconButton, List, ListItem } from "@mui/material";
import { SxProps, Theme } from "@mui/system";
import React, { useState } from 'react'
import { useQuery } from 'react-query';
import { useDebounce } from 'use-debounce';

import { getFullNodeAutocomplete } from '../lib/knowledgeApi';
import { getNodePageUrl } from '../lib/utils';
import { LinkedKnowledgeNode } from '../src/knowledgeTypes';
import LinkedNodeItem from './LinkedNodeItem';
import { Searcher } from "./Searcher";
import TypographyUnderlined from "./TypographyUnderlined";

type LinkedNodeEditorProps = {
  header: string;
  nodesSelected: LinkedKnowledgeNode[];
  setNodesSelected: (newNodesSelected: LinkedKnowledgeNode[]) => void;
  sx?: SxProps<Theme>;
}

export const LinkedNodeEditor = ({ nodesSelected, setNodesSelected, header, sx }: LinkedNodeEditorProps) => {

  const [searchText, setSearchText] = useState('')
  const [searchTextDebounce] = useDebounce(searchText, 250);
  const { data } = useQuery(["fullLinkedNode", searchTextDebounce], () => getFullNodeAutocomplete(searchTextDebounce), {
    enabled: Boolean(searchTextDebounce)
  });
  // const [nodesSelected, setNodesSelected] = useState<LinkedKnowledgeNode[]>(initialNodes)

  const onRemoveLinkedNode = (nodeTitle: string) => {
    const newLinkedNode = nodesSelected.filter(cur => cur.title !== nodeTitle)
    setNodesSelected(newLinkedNode)
  }

  const onInputChange = (event: React.SyntheticEvent<Element, Event>, query: string) => {
    if (!event || !query.trim()) return
    setSearchText(query)
  };

  const onChangeMultiple = (e: any, node: any[]) => {
    setNodesSelected(node)
  }

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
          secondaryActions={<IconButton
            sx={{ alignItems: 'center', justifyContent: 'flex-end' }}
            onClick={() => onRemoveLinkedNode(el.title || '')}
          >
            <CloseIcon />
          </IconButton>}
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
              options={data?.results || []}
              multiple
              value={nodesSelected}
              onChange={onChangeMultiple}
              getOptionLabel={(option: string | LinkedKnowledgeNode) => typeof option === 'string' ? option : option.title || ''}
              isOptionEqualToValue={(option, value) => option.node === value.node}
              renderOption={(props, option) => <li {...props} key={option.node}>
                {typeof option === 'string' ? option : option.title || ''}
              </li>}
              renderInput={(params) => <Searcher
                ref={params.InputProps.ref}
                inputBaseProps={params.inputProps}
                searchText={searchText}
                onSearchTextChange={setSearchText}
              />}
              onInputChange={onInputChange}
            />
          </ListItem>
          {renderLinkedNodes()}
        </List>
      </Box>
    </Card>
  )
}
