import CloseIcon from "@mui/icons-material/Close";
import DoneIcon from "@mui/icons-material/Done";
import SearchIcon from "@mui/icons-material/Search";
import { Button, CircularProgress, Divider, IconButton, InputBase, Stack, Tooltip, Typography } from "@mui/material";
import { Box } from "@mui/system";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import React, { useMemo, useState } from "react";

import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";

import shortenNumber from "../../../../lib/utils/shortenNumber";
// import { FullNodeData, TNodeBookState } from "../../../../nodeBookTypes";
import NodeTypeIcon from "../../../NodeTypeIcon2";
import { CustomWrapperButton } from "../../Buttons/Buttons";
import { SidebarWrapper2 } from "./SidebarWrapper2";

dayjs.extend(relativeTime);

type SearcherSidebarProps = {
  //   notebookRef: MutableRefObject<TNodeBookState>;
  //   openLinkedNode: any;
  open: boolean;
  onClose: () => void;
  //   sidebarWidth: number;
  //   innerHeight?: number;
  //   innerWidth: number;
  //   disableSearcher?: boolean;
  //   enableElements: string[];
  //   preLoadNodes: (nodeIds: string[], fullNodes: FullNodeData[]) => Promise<void>;
};

// type Pagination = {
//   data: any[];
//   lastPageLoaded: number;
//   totalPage: number;
//   totalResults: number;
// };

// const NODE_TYPES_ARRAY: NodeType[] = ["Concept", "Code", "Reference", "Relation", "Question", "Idea"];
// const MAX_TAGS_IN_MOBILE = 2;

const ReferencesSidebar = ({ open, onClose }: SearcherSidebarProps) => {
  const [isLoading /* setIsLoading */] = useState(false);
  const [query, setQuery] = useState("");

  const searcherOptionsMemoized = useMemo(
    () => (
      <Box>
        <Box
          id="references-sidebar-options"
          sx={{
            marginTop: "20px",
            p: { xs: "10px" },
            borderBottom: 1,
            borderColor: theme =>
              theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG700 : DESIGN_SYSTEM_COLORS.gray200,
            width: "100%",
          }}
        >
          {/* tag searcher */}
          {/* <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              columnGap: "4px",
              rowGap: "8px",
              marginTop: { xs: "0px", sm: "0px" },
              marginBottom: { xs: "8px", sm: "8px" },
              pr: "40px",
            }}
          >
            <Typography
              sx={{
                color: theme =>
                  theme.palette.mode === "dark" ? theme.palette.common.notebookG200 : theme.palette.common.notebookG400,
                fontWeight: "500",
              }}
              className="tagText"
            >
              Tags:
            </Typography>
            {(isMovil ? viewTagsInMovil : selectedTags).map(tag => {
              return (
                <Chip
                  key={"tag" + tag.nodeId}
                  variant="outlined"
                  label={tag.title}
                  onDelete={() => deleteChip(tag.nodeId)} //
                  size="small"
                  sx={{
                    paddingY: "15px!important",
                    paddingX: "10px!important",
                    background: theme =>
                      theme.palette.mode === "dark" ? theme.palette.common.notebookG600 : theme.palette.common.gray200,
                    color: theme =>
                      theme.palette.mode === "dark" ? theme.palette.common.gray50 : theme.palette.common.gray600,
                    border: "none!important",
                  }}
                />
              );
            })}

            {isMovil && selectedTags.length > MAX_TAGS_IN_MOBILE && (
              <Chip
                key={"more-tags"}
                variant="outlined"
                label={`${selectedTags.length - MAX_TAGS_IN_MOBILE}+`}
                size="small"
              />
            )}

            <ControlPointIcon
              id="searcher-tags-button"
              onClick={disableSearcher ? undefined : setShowTagSelectorClick}
              sx={{
                zIndex: 1,
                transform: showTagSelector ? "rotate(45deg)" : "rotate(0deg)",
                cursor: disableSearcher ? "not-allowed" : "pointer",
                color: theme =>
                  theme.palette.mode === "dark" ? theme.palette.common.notebookG200 : theme.palette.common.notebookG400,
                fontWeight: "500",
              }}
            />
          </Box> */}

          {/* search input */}
          <SearchInput
            id="reference-search-input"
            value={query}
            handleChange={setQuery}
            handleSearch={() => console.log("search")}
            placeholder=""
          />

          {/* search options */}
          {/* {((isMovil && !showTagSelector) || !isMovil) && (
            <Stack
              id="nodesUpdatedSinceContainer"
              direction={"row"}
              spacing={"4px"}
              alignItems={"center"}
              sx={{
                mt: "13px",
                mb: "16px",
              }}
            >
              <RecentNodesList
                id={"search-sort-options"}
                recentNodes={searchResults}
                setRecentNodes={setSearchResults}
                onlyTags={onlyTags}
                disabled={disableRecentNodeList}
                sortOption={sortOption}
                setSortOption={onChangeSortOptions}
                sortDirection={sortDirection}
                setSortDirection={onChangeSortDirection}
              />

              <TimeFilter id="search-filter-options" timeFilter={timeFilter} setTimeFilter={onChangeTimeFilter} />
              <Box
                sx={{
                  ...(sidebarWidth < 350 && {
                    marginLeft: "auto",
                  }),
                }}
                id="SearchResutlsNum"
              >
                {shortenNumber(results, 2, false)} Results
              </Box>
            </Stack>
          )} */}

          {/* {!isMovil && showTagSelector && (
            <Box
              id="tagModal"
              sx={{
                position: "relative",
                background: theme =>
                  theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG900 : DESIGN_SYSTEM_COLORS.gray100,
                p: "16px 10px",
                borderRadius: "8px",
                border: theme =>
                  `1px solid ${
                    theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG600 : DESIGN_SYSTEM_COLORS.gray300
                  }`,
              }}
            >
              <Typography textAlign={"center"} fontSize={"18px"} fontWeight={"600"} m={"8px 0 24px 0"}>
                Search for tags
              </Typography>
              <IconButton
                size="small"
                sx={{ position: "absolute", top: "20px", right: "8px" }}
                onClick={closeTagSelector}
              >
                <CloseRoundedIcon />
              </IconButton>
              <MemoizedTagsSearcher
                id="user-settings-tag-searcher"
                setChosenTags={setChosenTags}
                chosenTags={chosenTags}
                allTags={allTags}
                setAllTags={setAllTags}
                sx={{ maxHeight: "450px", height: "450px" }}
                multiple
              />
            </Box>
          )}

          {isMovil && showTagSelector && (
            <MemoizedTagsSearcher
              allTags={allTags}
              setAllTags={setAllTags}
              chosenTags={chosenTags}
              setChosenTags={setChosenTagsCallback}
              sx={{ maxHeight: "235px", height: "235px" }}
              multiple
            />
          )} */}
        </Box>
      </Box>
    ),
    [query]
  );

  const sidebarContentMemo = useMemo(
    () => (
      <Box sx={{ p: "10px" }}>
        {[{ identifier: "1", correctNum: 2, wrongNum: 1, nodeType: "Code", createdAt: "" }].map(cur => (
          <Box key={cur.identifier}>
            <Box>
              <Typography>title here</Typography>
              <Typography>
                Newcomers, who often have limited information and less commitment to the community compared to
                established members, may base their decision to stay or leave on their initial observations and
                interactions. This, coupled with the fact that newcomers may not yet be familiar with the appropriate
                ways to participate in the community, can lead to disruptions for existing members. To mitigate these
                risks, it is important for online communities to implement strategies for effectively screening and
                educating new members.
              </Typography>
              <Button>Show More</Button>
            </Box>
            <Box>
              <Box>
                <NodeTypeIcon nodeType={"Code"} fontSize="inherit" />
                <Typography>{dayjs(cur.createdAt).fromNow()}</Typography>
              </Box>
              <CustomWrapperButton
                id={`${cur.identifier}-node-footer-votes`}
                //   onClickOnWrapper={displayJoinMessage}
                //   disabled={disableUpvoteButton && disableDownvoteButton}
              >
                <Stack direction={"row"} alignItems={"center"}>
                  <Tooltip title={"Vote to prevent further changes."} placement={"top"}>
                    <Button
                      // id={downvoteButtonId}
                      //   disabled={disableUpvoteButton}
                      sx={{ padding: "0px", color: "inherit", minWidth: "0px" }}
                    >
                      <Box sx={{ display: "flex", fontSize: "14px", alignItems: "center" }}>
                        <DoneIcon sx={{ fontSize: "18px" }} />
                        <span style={{ marginLeft: "2px" }}>{shortenNumber(cur.correctNum, 2, false)}</span>
                      </Box>
                    </Button>
                  </Tooltip>
                  <Divider
                    orientation="vertical"
                    variant="middle"
                    flexItem
                    sx={{
                      borderColor: theme => (theme.palette.mode === "dark" ? "#D3D3D3" : "inherit"),
                      mx: "4px",
                    }} /* sx={{ borderColor: "#6A6A6A" }}  */
                  />
                  <Tooltip title={"Vote to delete node."} placement={"top"}>
                    <Button
                      // id={upvoteButtonId}
                      // disabled={disableDownvoteButton}
                      sx={{ padding: "0px", color: "inherit", minWidth: "0px" }}
                    >
                      <Box sx={{ display: "flex", fontSize: "14px", alignItems: "center" }}>
                        <CloseIcon sx={{ fontSize: "18px" }} />
                        <span style={{ marginLeft: "2px" }}>{shortenNumber(cur.wrongNum, 2, false)}</span>
                      </Box>
                    </Button>
                  </Tooltip>
                </Stack>
              </CustomWrapperButton>
            </Box>
          </Box>
        ))}
        {isLoading && (
          <Box sx={{ py: "10px", display: "flex", justifyContent: "center" }}>
            <CircularProgress />
          </Box>
        )}
      </Box>
    ),
    [isLoading]
  );

  return (
    <SidebarWrapper2
      id="sidebar-wrapper-searcher"
      title="Search Nodes"
      open={open}
      onClose={onClose}
      SidebarOptions={searcherOptionsMemoized}
      SidebarContent={sidebarContentMemo}
      //   disabled={disableSearcher}
      sx={{ boxShadow: "none" }}
      sxContentWrapper={{
        height: "100%",
        minHeight: "calc(100% - 60px)",
        overflowX: "auto",
        overflowY: "auto",
      }}
    />
  );
};
export const MemoizedSearcherSidebar = React.memo(ReferencesSidebar);

type SearchInputProps = {
  id: string;
  value: string;
  handleChange: (newValue: string) => void;
  handleSearch: () => void;
  placeholder: string;
};

const SearchInput = ({ id, value, handleChange, handleSearch, placeholder }: SearchInputProps) => (
  <InputBase
    id={id}
    type="text"
    placeholder={placeholder}
    value={value}
    onChange={e => handleChange(e.target.value)}
    // startAdornment={
    //   <Select
    //     disabled={disableSearcher}
    //     multiple
    //     MenuProps={{
    //       sx: {
    //         "& .MuiMenu-paper": {
    //           backgroundColor: theme =>
    //             theme.palette.mode === "dark" ? theme.palette.common.notebookMainBlack : theme.palette.common.gray50,
    //           color: "text.white",
    //           width: "180px",
    //         },
    //         "& .MuiMenuItem-root:hover": {
    //           backgroundColor: theme =>
    //             theme.palette.mode === "dark" ? theme.palette.common.notebookG600 : theme.palette.common.gray200,
    //           color: "text.white",
    //         },
    //         "& .MuiMenuItem-root": {
    //           padding: "3px 0px 3px 0px",
    //         },
    //         "& .Mui-selected": {
    //           backgroundColor: theme =>
    //             theme.palette.mode === "dark" ? `${theme.palette.common.notebookO900}!important` : "",
    //           color: theme => theme.palette.common.primary600,
    //         },
    //         "& .Mui-selected:hover": {
    //           backgroundColor: "transparent",
    //         },
    //       },
    //     }}
    //     value={nodeTypes}
    //     variant="outlined"
    //     displayEmpty
    //     renderValue={() => "Types"}
    //     onChange={onChangeNoteType}
    //     sx={{
    //       padding: {
    //         xs: "2px 0px",
    //         sm: "0px",
    //       },
    //       height: {
    //         xs: "31px",
    //         sm: "46px",
    //       },
    //       marginLeft: "-14px",
    //       zIndex: "99",
    //       borderRadius: "4px 0 0 4px",
    //       background: theme =>
    //         theme.palette.mode === "dark" ? theme.palette.common.notebookG700 : theme.palette.common.gray100,

    //       ":hover .MuiOutlinedInput-notchedOutline": {
    //         borderColor: theme => theme.palette.common.orange,
    //       },
    //       "&> fieldset": {
    //         borderColor: theme =>
    //           theme.palette.mode === "dark" ? theme.palette.common.notebookG500 : theme.palette.common.gray400,
    //         borderWidth: "1px",
    //         borderRadius: "4px 0 0 4px ",
    //       },
    //     }}
    //   >
    //     {NODE_TYPES_ARRAY.map(nodeType => (
    //       <MenuItem
    //         key={nodeType}
    //         value={nodeType}
    //         id="nodeTypesSelect"
    //         sx={{
    //           py: "0px",
    //           color: nodeTypes.includes(nodeType) ? "blue" : undefined,
    //         }}
    //       >
    //         <Checkbox checked={nodeTypes.includes(nodeType)} />

    //         <ListItemText primary={nodeType} sx={{ fontSize: "12px!important" }} />
    //         <ListItemIcon>
    //           <NodeTypeIcon fontSize="small" nodeType={nodeType} />
    //         </ListItemIcon>
    //       </MenuItem>
    //     ))}
    //   </Select>
    // }
    endAdornment={
      <Stack direction={"row"} spacing={"10px"}>
        {/* {search && (
          <IconButton
            onClick={() => setSearch("")}
            sx={{
              padding: {
                xs: "5px !important",
                sm: "10px",
              },
              marginRight: {
                xs: "-11px !important",
                sm: "-8px",
              },
              ":hover": {
                background: "transparent!important",
              },
            }}
          >
            <CloseIcon
              sx={{
                width: {
                  xs: "16px",
                  sm: "1em",
                },
                height: {
                  xs: "16px",
                  sm: "1em",
                },
              }}
            />
          </IconButton>
        )}
        {search && (
          <Divider
            orientation="vertical"
            variant="middle"
            flexItem
            sx={{
              borderColor: theme => (theme.palette.mode === "dark" ? "#D3D3D3" : "inherit"),
            }}
          />
        )} */}
        <IconButton id={`${id}-button`} onClick={handleSearch} sx={{ padding: "10px" }}>
          <SearchIcon
            sx={{
              width: "16px",
              height: "16px",
            }}
          />
        </IconButton>
      </Stack>
    }
    // sx={{
    //   "& fieldset": {
    //     borderWidth: 1,
    //     borderColor: (theme: any) => (theme.palette.mode === "dark" ? theme.palette.common.notebookG500 : "#D0D5DD"),
    //     borderRadius: "4px",
    //   },
    // }}
  />
);

export const ReferencesSidebarMemoized = React.memo(ReferencesSidebar);
