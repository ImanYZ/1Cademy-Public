import SearchIcon from "@mui/icons-material/Search";
import { Box, IconButton } from '@mui/material';
import InputBase, { InputBaseProps } from "@mui/material/InputBase";
import { alpha, styled } from "@mui/material/styles";
import React, { FC, forwardRef, useState } from 'react'


type Ref = {
  viewState: HTMLInputElement;
};

type SearcherProps = {
  initialSearchText?: string
  darkVersion?: boolean
  inputBaseProps: InputBaseProps
}

export const Searcher = forwardRef<HTMLInputElement, SearcherProps>(({
  inputBaseProps,
  initialSearchText = '',
  darkVersion = false
}, ref) => {
  const [searchText, setSearchText] = useState<string>(initialSearchText);
  const handleSearch = () => { console.log('handle search') }

  return (
    <Box
      component="form"
      sx={{
        p: "0px 4px",
        display: "flex",
        alignItems: "center",
        width: "100%",
        background: theme => darkVersion ? alpha(theme.palette.grey[100], 0.1) : '#EEEEEE',
        borderRadius: "3px",
        border: "solid 1px",
        borderColor: theme => darkVersion ? alpha(theme.palette.grey[100], 0.1) : '#EEEEEE',
        color: theme => darkVersion ? theme.palette.common.white : theme.palette.common.darkGrayBackground,
        ":hover": {
          borderColor: theme => darkVersion ? theme.palette.common.white : theme.palette.common.darkGrayBackground,
          color: theme => darkVersion ? theme.palette.common.white : theme.palette.common.darkGrayBackground
        },
        ":focus-within": {
          borderColor: theme => darkVersion ? alpha(theme.palette.grey[100], 0.1) : theme.palette.common.darkGrayBackground,
          background: theme => darkVersion ? theme.palette.common.white : '#EEEEEE',
          color: theme => theme.palette.common.black
        }
      }}
    >
      <StyledInputBase
        ref={ref}
        value={searchText}
        onChange={e => setSearchText(e.target.value)}
        placeholder="Search on 1Cademy"
        inputProps={{ ...inputBaseProps, "aria-label": "search node" }}
        sx={{ ml: 1, flex: 1, color: "inherit" }}
      />
      <IconButton type="submit" sx={{ p: "5px", color: "inherit" }} aria-label="search" onClick={handleSearch}>
        <SearchIcon />
      </IconButton>
    </Box>
  )
})

Searcher.displayName = "Searcher";

const StyledInputBase = styled(InputBase)
  <{ darkVersion?: boolean }>(({ theme, darkVersion = false }) => ({
    "& .MuiInputBase-input": {
      padding: 0,
      width: "100%"
    },
    "& .MuiInputBase-input::placeholder": {
      opacity: 1,
      color: darkVersion ? theme.palette.common.white : theme.palette.common.darkGrayBackground,
      fontWeight: "400"
    },
    "& .MuiInputBase-input:focus": {
      color: theme.palette.common.black,
      background: darkVersion ? theme.palette.common.white : '#EEEEEE',
      fontWeight: "400"
    }
  }));
