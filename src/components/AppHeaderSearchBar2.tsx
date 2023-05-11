import SearchIcon from "@mui/icons-material/Search";
import { Box } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import { styled, SxProps, Theme } from "@mui/material/styles";
import { useRouter } from "next/router";
import React, { MouseEvent, useEffect, useState } from "react";

import { DESIGN_SYSTEM_COLORS } from "../lib/theme/colors";

type AppHeaderSearchBarProps = {
  sx?: SxProps<Theme>;
};

const AppHeaderSearchBar = ({ /* searcherUrl, */ sx }: AppHeaderSearchBarProps) => {
  const router = useRouter();
  const [searchText, setSearchText] = useState<string>((router.query.q as string) || "");

  useEffect(() => setSearchText((router.query.q as string) || ""), [router.query]);

  const handleSearch = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    router.push({ pathname: "/search", query: { ...router.query, q: searchText, page: 1 } });
  };

  return (
    <Box
      component="form"
      sx={{
        p: "4px 7px 4px 14px",
        display: "flex",
        alignItems: "center",
        width: "100%",
        borderRadius: "8px",
        border: theme =>
          `solid 1px ${
            theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG400 : DESIGN_SYSTEM_COLORS.gray300
          }`,
        color: theme => (theme.palette.mode === "dark" ? theme.palette.common.white : theme.palette.common.black),
        backgroundColor: theme =>
          theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.baseGraphit : theme.palette.common.white,
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
    </Box>
  );
};

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  "& .MuiInputBase-input": {
    padding: 0,
    width: "100%",
    color: "inherit",
  },
  "& .MuiInputBase-input::placeholder": {
    opacity: 1,
    color: theme.palette.mode === "dark" ? "#636363" : "#838383",
    fontWeight: "400",
  },
}));

export default AppHeaderSearchBar;
