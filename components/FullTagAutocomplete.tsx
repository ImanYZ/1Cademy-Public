import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import { Autocomplete, InputLabel } from '@mui/material'
import { Box } from '@mui/system'
import React, { useState } from 'react'
import { useQuery } from 'react-query';
import { useDebounce } from 'use-debounce';

import { getFullTagAutocomplete } from '../lib/knowledgeApi';
import { getNodePageUrl, getReferenceTitle } from '../lib/utils';
import { LinkedKnowledgeNode } from '../src/knowledgeTypes';
import { LinkedTag } from './LinkedTag'
import { Searcher } from './Searcher';

/**
 * difference from tag Autocomplete
 *  - has a custom searcher component
 *  - render de tags selected as Linked Tag (full information)
 */

export const FullTagAutocomplete = () => {
  const [searchText, setSearchText] = useState('')
  const [searchTextDebounce] = useDebounce(searchText, 250);
  const { data } = useQuery(["fullTags", searchTextDebounce], () => getFullTagAutocomplete(searchTextDebounce));
  const [tagsSelected, setTagsSelected] = useState<LinkedKnowledgeNode[]>([])

  const onRemoveTag = (nodeTag: string) => {
    setTagsSelected(currentTags => currentTags.filter(cur => cur.node !== nodeTag))
  }

  const getTagsSuggestions = (): LinkedKnowledgeNode[] => {
    return data?.results || []
  }

  const onInputChange = (event: React.SyntheticEvent<Element, Event>, query: string) => {
    if (!event || !query.trim()) return
    setSearchText(query)
  };

  const onChangeMultiple = (e: any, tag: any) => {
    setTagsSelected(tag)
  }

  return (
    <Box>
      <InputLabel htmlFor="tag-searcher" sx={{
        display: 'flex',
        alignItems: 'center',
        mb: '16px',
        color: theme => theme.palette.grey[600]
      }}>
        <LocalOfferIcon fontSize='small' sx={{
          mr: '10px',
          color: theme => theme.palette.grey[400]
        }} />Tags
      </InputLabel>
      <Autocomplete
        id="tag-searcher"
        freeSolo
        fullWidth
        options={getTagsSuggestions()}
        multiple
        value={tagsSelected}
        onChange={onChangeMultiple}
        getOptionLabel={(option: string | LinkedKnowledgeNode) => typeof option === 'string' ? option : option.title || ''}
        isOptionEqualToValue={(option, value) => option.node === value.node}
        renderInput={(params) => <Searcher
          ref={params.InputProps.ref}
          inputBaseProps={params.inputProps}
          searchText={searchText}
          onSearchTextChange={setSearchText}
        />}
        onInputChange={onInputChange}
        sx={{ mb: '16px' }}
      />
      {
        tagsSelected.map((cur, idx) => {
          return <LinkedTag
            node={cur.node}
            key={idx}
            nodeImageUrl={cur.nodeImage}
            nodeContent={cur.content}
            title={getReferenceTitle(cur)}
            linkSrc={getNodePageUrl(cur.title || "", cur.node)}
            openInNewTab
            onDelete={(node: string) => onRemoveTag(node)}
          />
        })
      }
    </Box>
  )
}
