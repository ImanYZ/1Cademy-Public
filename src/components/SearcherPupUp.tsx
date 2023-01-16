import { Box, ClickAwayListener } from "@mui/material";
import React from "react";

import AppHeaderSearchBar from "./AppHeaderSearchBar";

type SearcherPupUpProps = {
  onClose: any;
};

const SearcherPupUp = ({ onClose }: SearcherPupUpProps) => {
  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        background: theme => (theme.palette.mode === "dark" ? "#6464647e" : "#c9c9c985"),
        backdropFilter: "blur(5px)",

        p: "70px 16px",
        zIndex: "12",
      }}
    >
      <ClickAwayListener
        onClickAway={() => {
          onClose(false);
          console.log("click away");
        }}
      >
        <Box>
          <AppHeaderSearchBar
            searcherUrl={"search"}
            sx={{
              color: theme => (theme.palette.mode === "dark" ? theme.palette.common.white : theme.palette.common.black),
            }}
          />
        </Box>
      </ClickAwayListener>
    </Box>
  );
};

export default SearcherPupUp;
