import CloseIcon from '@mui/icons-material/Close';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { Autocomplete, Divider, IconButton, InputLabel } from '@mui/material'
import { Box } from '@mui/system'
import React, { useState } from 'react'
import { useQuery } from 'react-query';
import { useDebounce } from 'use-debounce';

import { getFullReferencesAutocomplete, getFullTagAutocomplete } from '../lib/knowledgeApi';
import { getNodePageUrl, getReferenceTitle } from '../lib/utils';
import { LinkedKnowledgeNode } from '../src/knowledgeTypes';
import { LinkedReference } from './LinkedReference';
import { Searcher } from './Searcher';

/**
 * difference from tag Autocomplete
 *  - has a custom searcher component
 *  - render de references selected as Linked Tag (full information)
 */

export const FullReferencesAutocomplete = () => {
  const [searchText, setSearchText] = useState('')
  const [searchTextDebounce] = useDebounce(searchText, 250);
  const { data } = useQuery(["fullReferences", searchTextDebounce], () => getFullReferencesAutocomplete(searchTextDebounce));
  const [referencesSelected, setReferencesSelected] = useState<LinkedKnowledgeNode[]>([])

  const getReferencesSuggestions = (): LinkedKnowledgeNode[] => {
    return data?.results || []
  }

  const onInputChange = (event: React.SyntheticEvent<Element, Event>, query: string) => {
    if (!event || !query.trim()) return
    setSearchText(query)
  };

  const onChangeMultiple = (e: any, tag: any) => {
    setReferencesSelected(tag)
  }

  const onRemoveReferences = (referenceNode: string) => {
    setReferencesSelected(currentReferences => currentReferences.filter(cur => cur.node !== referenceNode))
  }

  return (
    <Box>
      <InputLabel htmlFor="references-searcher" sx={{
        display: 'flex',
        alignItems: 'center',
        mb: '16px',
        color: theme => theme.palette.grey[600]
      }}>
        <MenuBookIcon fontSize='small' sx={{
          mr: '10px',
          color: theme => theme.palette.grey[400]
        }} />References
      </InputLabel>
      <Autocomplete
        id="references-searcher"
        freeSolo
        fullWidth
        options={getReferencesSuggestions()}
        multiple
        value={referencesSelected}
        onChange={onChangeMultiple}
        getOptionLabel={(option: string | LinkedKnowledgeNode) => typeof option === 'string' ? option : option.title || ''}
        isOptionEqualToValue={(option, value) => option.node === value.node}
        renderOption={(props, option) => {
          return (
            <li {...props} key={option.node}>
              {typeof option === 'string' ? option : option.title || ''}
            </li>
          );
        }}
        renderInput={(params) => <Searcher
          ref={params.InputProps.ref}
          inputBaseProps={params.inputProps}
          searchText={searchText}
          onSearchTextChange={setSearchText}
        />}
        onInputChange={onInputChange}
        sx={{ mb: '16px' }}
      />
      {referencesSelected.map((reference, idx) =>
        <React.Fragment key={idx}>
          {idx === 0 && <Divider />}
          <LinkedReference
            title={reference.title || ""}
            linkSrc={getNodePageUrl(reference.title || "", reference.node)}
            nodeType={reference.nodeType}
            nodeImageUrl={reference.nodeImage}
            nodeContent={getReferenceTitle(reference)}
            showListItemIcon={false}
            label={reference.label || ""}
            sx={{ p: "20px 16px" }}
            openInNewTab
            secondaryActionSx={{ mr: "34px" }}
            secondaryAction={<IconButton
              sx={{ alignItems: 'center', justifyContent: 'flex-end' }}
              onClick={() => onRemoveReferences(reference.node)}
            >
              <CloseIcon />
            </IconButton>}
          />
          <Divider />
        </React.Fragment>
      )}
    </Box>
  )
}
