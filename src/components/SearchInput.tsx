import SearchIcon from "@mui/icons-material/Search";
import { Autocomplete, IconButton, InputBase } from "@mui/material";
import { Box } from "@mui/system";
import { useRouter } from "next/router";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { useQuery } from "react-query";
import { useDebounce } from "use-debounce";

import { getSearchAutocomplete } from "@/lib/knowledgeApi";

type SearchInputProps = {
  onSearch: (text: string) => void;
};

export type SearchInputRef = {
  setFocusOnInput: () => void;
};

const SearchInput = forwardRef<SearchInputRef, SearchInputProps>(({ onSearch }, ref) => {
  const router = useRouter();
  const [text, setText] = useState<string>((router.query.q as string) || "");
  const [searchText] = useDebounce(text, 250);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const { data, isLoading } = useQuery(["searchAutocomplete", searchText], () => getSearchAutocomplete(searchText));

  const autcompleteRef = useRef<any | null>(null);

  useEffect(() => {
    setText((router.query.q as string) || "");
  }, [router.query]);

  useEffect(() => {
    if (isLoading) return;
    setSuggestions(data?.results || []);
  }, [data, isLoading]);

  useImperativeHandle(ref, () => ({
    setFocusOnInput: () => {
      if (!inputRef.current) return;
      inputRef.current.focus({ preventScroll: true });
    },
  }));

  const handleSearch = (e: React.FormEvent) => {
    (document.activeElement as HTMLElement).blur();
    e.preventDefault();
    onSearch(text);
  };

  const handleChangeOption = (value: string) => {
    (document.activeElement as HTMLElement).blur();
    setText(value);
    onSearch(value);
  };

  const onHandleEnter = (e: any) => {
    if (e.key !== "Enter") return;
    if (!autcompleteRef.current) return;

    autcompleteRef.current.blur();
  };

  return (
    <Box component="form" onSubmit={handleSearch} sx={{ width: "100%" }}>
      <Autocomplete
        id="custom-input-demo"
        ref={autcompleteRef}
        fullWidth
        options={suggestions}
        freeSolo={true}
        loading={isLoading}
        onChange={(e, value) => handleChangeOption(value || "")}
        openOnFocus={true}
        inputValue={text}
        sx={{
          display: "inline-block",
          width: "100%",
          "& input": {
            width: "100%",
            p: "0",
            fontSize: { xs: "16px", md: "25px" },
            fontWeight: 300,
            border: "none",
            color: theme => theme.palette.common.black,
            background: theme => theme.palette.common.white,
          },
          "& input:focus": {
            outline: "none",
          },
        }}
        renderInput={params => (
          <Box
            sx={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              borderRadius: 1,
              height: { xs: "40px", md: "55px" },
              p: { xs: "0px 10px 0px 12px", md: "0px 12px 0px 25px" },
              background: theme => theme.palette.common.white,
            }}
            ref={params.InputProps.ref}
          >
            <InputBase
              inputRef={inputRef}
              value={text}
              inputProps={params.inputProps}
              onChange={e => setText(e.target.value)}
              placeholder="What do you want to learn today?"
              className="home-search-input"
              sx={{
                flex: 1,
                "& .MuiAutocomplete-input": {
                  fontWeight: 400,
                  "::placeholder": {
                    fontSize: "21px",
                  },
                },
              }}
            />
            <IconButton
              type="submit"
              sx={{ p: "5px", color: "#757575", fontSize: "inherit" }}
              aria-label="search"
              onClick={handleSearch}
            >
              <SearchIcon sx={{ color: "inherit", fontSize: { xs: "25px", md: "35px" } }} />
            </IconButton>
          </Box>
        )}
        onKeyDown={onHandleEnter}
      />
    </Box>
  );
});

SearchInput.displayName = "SearchInput";

export default SearchInput;
