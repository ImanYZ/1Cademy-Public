import SearchIcon from "@mui/icons-material/Search";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import Paper from "@mui/material/Paper";
import { alpha, styled, SxProps, Theme } from "@mui/material/styles";
import { useRouter } from "next/router";
import React, { MouseEvent, useEffect, useState } from "react";

type AppHeaderSearchBarProps = {
  searcherUrl?: string;
  sx?: SxProps<Theme>;
};

const AppHeaderSearchBar = ({ searcherUrl, sx }: AppHeaderSearchBarProps) => {
  const router = useRouter();
  const [searchText, setSearchText] = useState<string>((router.query.q as string) || "");

  useEffect(() => setSearchText((router.query.q as string) || ""), [router.query]);

  const handleSearch = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    router.push({ pathname: searcherUrl ?? "/", query: { ...router.query, q: searchText, page: 1 } });
  };

  return (
    <Paper
      component="form"
      sx={{
        p: "0px 4px",
        display: "flex",
        alignItems: "center",
        width: "100%",
        background: theme => alpha(theme.palette.grey[100], 0.1),
        borderRadius: "3px",
        border: "solid 1px",
        borderColor: theme => alpha(theme.palette.grey[100], 0.1),
        color: theme => theme.palette.common.white,
        ":hover": {
          borderColor: theme => theme.palette.common.white,
          color: theme => theme.palette.common.white,
        },
        ":focus-within": {
          background: theme => theme.palette.common.white,
          color: theme => theme.palette.common.black,
        },
        ...sx,
      }}
    >
      <StyledInputBase
        value={searchText}
        onChange={e => setSearchText(e.target.value)}
        placeholder="Search on 1Cademy"
        inputProps={{ "aria-label": "search node" }}
        sx={{ ml: 1, flex: 1, color: "inherit" }}
      />
      <IconButton type="submit" sx={{ p: "5px", color: "inherit" }} aria-label="search" onClick={handleSearch}>
        <SearchIcon />
      </IconButton>
    </Paper>
  );
};

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  "& .MuiInputBase-input": {
    padding: 0,
    width: "100%",
  },
  "& .MuiInputBase-input::placeholder": {
    opacity: 1,
    color: theme.palette.mode === "dark" ? theme.palette.common.white : theme.palette.common.black,
    fontWeight: "400",
  },
  "& .MuiInputBase-input:focus": {
    color: theme.palette.common.black,
    background: theme.palette.common.white,
    fontWeight: "400",
  },
}));

export default AppHeaderSearchBar;
