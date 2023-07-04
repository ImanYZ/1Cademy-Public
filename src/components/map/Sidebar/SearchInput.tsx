import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import {
  Checkbox,
  Divider,
  IconButton,
  InputBase,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  Stack,
} from "@mui/material";
import { useCallback } from "react";
import { NodeType } from "src/types";

import NodeTypeIcon from "@/components/NodeTypeIcon2";
import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";

import { NODE_TYPES_ARRAY } from "./SidebarV2/SearcherSidebar";

type SearchInputProps = {
  id: string;
  value: string;
  handleChange: (newValue: string) => void;
  handleSearch: () => void;
  placeholder: string;
  nodeTypeProps?: {
    value: any;
    onChange: (newValue: NodeType[]) => void;
  } | null;
};

export const SearchInput = ({
  id,
  value,
  handleChange,
  handleSearch,
  placeholder,
  nodeTypeProps = null,
}: SearchInputProps) => {
  const onEnterKey = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Enter") handleSearch();
    },
    [handleSearch]
  );
  return (
    <InputBase
      id={id}
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={e => handleChange(e.target.value)}
      onKeyDownCapture={onEnterKey}
      fullWidth
      sx={{
        borderRadius: "4px",
        border: theme =>
          `solid 1px ${
            theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG500 : DESIGN_SYSTEM_COLORS.gray300
          }`,
      }}
      inputProps={{
        style: { padding: "10px 14px" },
      }}
      startAdornment={
        nodeTypeProps ? (
          <Select
            // disabled={disableSearcher}
            multiple
            MenuProps={{
              sx: {
                "& .MuiMenu-paper": {
                  backgroundColor: theme =>
                    theme.palette.mode === "dark"
                      ? theme.palette.common.notebookMainBlack
                      : theme.palette.common.gray50,
                  color: "text.white",
                  width: "180px",
                },
                "& .MuiMenuItem-root:hover": {
                  backgroundColor: theme =>
                    theme.palette.mode === "dark" ? theme.palette.common.notebookG600 : theme.palette.common.gray200,
                  color: "text.white",
                },
                "& .MuiMenuItem-root": {
                  padding: "3px 0px 3px 0px",
                },
                "& .Mui-selected": {
                  backgroundColor: theme =>
                    theme.palette.mode === "dark" ? `${theme.palette.common.notebookO900}!important` : "",
                  color: theme => theme.palette.common.primary600,
                },
                "& .Mui-selected:hover": {
                  backgroundColor: "transparent",
                },
              },
            }}
            value={nodeTypeProps.value}
            variant="outlined"
            displayEmpty
            renderValue={() => "Types"}
            onChange={e => nodeTypeProps.onChange(e.target.value as NodeType[])}
            sx={{
              padding: "0px",
              height: "46px",
              zIndex: "99",
              borderRadius: "4px 0 0 4px",
              background: theme =>
                theme.palette.mode === "dark" ? theme.palette.common.notebookG700 : theme.palette.common.gray100,
              ":hover .MuiOutlinedInput-notchedOutline": {
                borderColor: theme => theme.palette.common.orange,
              },
              "&> fieldset": {
                borderColor: theme =>
                  theme.palette.mode === "dark" ? theme.palette.common.notebookG500 : theme.palette.common.gray400,
                borderWidth: "1px",
                borderRadius: "4px 0 0 4px ",
              },
            }}
          >
            {NODE_TYPES_ARRAY.map(nodeType => (
              <MenuItem
                key={nodeType}
                value={nodeType}
                id="nodeTypesSelect"
                sx={{
                  py: "0px",
                  color: nodeTypeProps.value.includes(nodeType) ? "blue" : undefined,
                }}
              >
                <Checkbox checked={nodeTypeProps.value.includes(nodeType)} />

                <ListItemText primary={nodeType} sx={{ fontSize: "12px!important" }} />
                <ListItemIcon>
                  <NodeTypeIcon fontSize="small" nodeType={nodeType} />
                </ListItemIcon>
              </MenuItem>
            ))}
          </Select>
        ) : undefined
      }
      endAdornment={
        <Stack direction={"row"} spacing={"10px"}>
          {value && (
            <IconButton onClick={() => handleChange("")} size="small">
              <CloseIcon />
            </IconButton>
          )}
          {value && (
            <Divider
              orientation="vertical"
              variant="middle"
              flexItem
              sx={{
                borderColor: theme => (theme.palette.mode === "dark" ? "#D3D3D3" : "inherit"),
              }}
            />
          )}
          <IconButton id={`${id}-button`} onClick={handleSearch} size="small">
            <SearchIcon />
          </IconButton>
        </Stack>
      }
    />
  );
};
