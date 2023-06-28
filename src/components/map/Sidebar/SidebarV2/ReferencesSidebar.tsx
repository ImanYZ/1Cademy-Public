import CloseIcon from "@mui/icons-material/Close";
import ControlPointIcon from "@mui/icons-material/ControlPoint";
import DoneIcon from "@mui/icons-material/Done";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import SearchIcon from "@mui/icons-material/Search";
import {
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  InputBase,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import React, { useCallback, useMemo, useState } from "react";
import { SortDirection, SortValues } from "src/nodeBookTypes";

import { ChosenTag, MemoizedTagsSearcher, TagTreeView } from "@/components/TagsSearcher";
import { useTagsTreeView } from "@/hooks/useTagsTreeView";
// import { Post } from "@/lib/mapApi";
import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";

import shortenNumber from "../../../../lib/utils/shortenNumber";
// import { FullNodeData, TNodeBookState } from "../../../../nodeBookTypes";
import NodeTypeIcon from "../../../NodeTypeIcon2";
import { CustomWrapperButton } from "../../Buttons/Buttons";
import RecentNodesList from "../../RecentNodesList";
import TimeFilter from "../../TimeFilter";
import { NODE_TYPES_ARRAY } from "./SearcherSidebar";
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
  const { allTags, setAllTags } = useTagsTreeView();
  const [showTagSelector, setShowTagSelector] = useState(false);
  const [chosenTags, setChosenTags] = useState<ChosenTag[]>([]);
  const [timeFilter, setTimeFilter] = useState<any>("ALL_TIME");

  const [sortOption, setSortOption] = useState<SortValues>("NOT_SELECTED");
  const [sortDirection, setSortDirection] = useState<SortDirection>("DESCENDING");
  const [references /* setReferences */] = useState(MOCK_REFERENCES);

  const selectedTags = useMemo<TagTreeView[]>(() => Object.values(allTags).filter(tag => tag.checked), [allTags]);

  const results = useMemo(() => {
    return 10;
    // if (value === 0) {
    //   return searchResults.totalResults;
    // } else if (value === 1) {
    //   // return notebooks.totalResults;
    //   return pendingProposals.totalResults;
    // }
  }, []);

  // const onSearch  =async ()=> Post('/',{})

  const onChangeSortDirection = useCallback(
    (newSortDirection: SortDirection) => {
      setSortDirection(newSortDirection);
      //   onSearch(1, search, sortOption, newSortDirection, nodeTypes);
    },
    [sortOption]
  );

  const onChangeSortOptions = useCallback(
    (newSortOption: SortValues) => {
      setSortOption(newSortOption);
      //   onSearch(1, search, newSortOption, sortDirection, nodeTypes);
    },
    [sortDirection]
  );

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
          <Box
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
            {selectedTags.map(tag => {
              return (
                <Chip
                  key={"tag" + tag.nodeId}
                  variant="outlined"
                  label={tag.title}
                  onDelete={() => setChosenTags(prev => prev.filter(c => c.id !== tag.nodeId))} //
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

            {/* {isMovil && selectedTags.length > MAX_TAGS_IN_MOBILE && (
              <Chip
                key={"more-tags"}
                variant="outlined"
                label={`${selectedTags.length - MAX_TAGS_IN_MOBILE}+`}
                size="small"
              />
            )} */}

            <ControlPointIcon
              id="searcher-tags-button"
              onClick={() => setShowTagSelector(prev => !prev)}
              sx={{
                zIndex: 1,
                transform: showTagSelector ? "rotate(45deg)" : "rotate(0deg)",
                cursor: "pointer",
                color: theme =>
                  theme.palette.mode === "dark" ? theme.palette.common.notebookG200 : theme.palette.common.notebookG400,
                fontWeight: "500",
              }}
            />
          </Box>

          {/* search input */}
          {!showTagSelector && (
            <SearchInput
              id="reference-search-input"
              value={query}
              handleChange={setQuery}
              handleSearch={() => console.log("search")}
              placeholder="Nodes search"
              nodeTypeProps={null}
            />
          )}

          {/* search options */}
          {!showTagSelector && (
            <Stack
              id="nodesUpdatedSinceContainer"
              direction={"row"}
              // spacing={"4px"}
              alignItems={"center"}
              justifyContent={"space-between"}
              sx={{
                mt: "13px",
                mb: "16px",
              }}
            >
              <Stack direction={"row"} spacing={"4px"}>
                <RecentNodesList
                  id={"search-sort-options"}
                  // disabled={disableRecentNodeList}
                  sortOption={sortOption}
                  setSortOption={onChangeSortOptions}
                  sortDirection={sortDirection}
                  setSortDirection={onChangeSortDirection}
                />
                <TimeFilter id="search-filter-options" timeFilter={timeFilter} setTimeFilter={setTimeFilter} />
              </Stack>
              <Box>{shortenNumber(results, 2, false)} Results</Box>
            </Stack>
          )}

          {showTagSelector && (
            <MemoizedTagsSearcher
              allTags={allTags}
              setAllTags={setAllTags}
              chosenTags={chosenTags}
              setChosenTags={setChosenTags}
              sx={{ maxHeight: "235px", height: "235px" }}
              multiple
            />
          )}
        </Box>
      </Box>
    ),
    [
      allTags,
      chosenTags,
      onChangeSortDirection,
      onChangeSortOptions,
      query,
      results,
      selectedTags,
      setAllTags,
      showTagSelector,
      sortDirection,
      sortOption,
      timeFilter,
    ]
  );

  const sidebarContentMemo = useMemo(
    () => (
      <Stack spacing={"8px"} sx={{ p: "16px" }}>
        {references.map(cur => (
          <ReferenceItem key={cur.id} {...cur} />
        ))}
        <Box sx={{ py: "10px", display: "flex", justifyContent: "center" }}>{isLoading && <CircularProgress />}</Box>
      </Stack>
    ),
    [isLoading, references]
  );

  return (
    <SidebarWrapper2
      id="sidebar-wrapper-searcher"
      title="References to link"
      open={open}
      onClose={onClose}
      SidebarOptions={searcherOptionsMemoized}
      SidebarContent={sidebarContentMemo}
      sx={{ boxShadow: "none" }}
      sxContentWrapper={{
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
  nodeTypeProps: {
    value: any;
    onChange: (newValue: any) => void;
  } | null;
};

const SearchInput = ({ id, value, handleChange, handleSearch, placeholder, nodeTypeProps }: SearchInputProps) => (
  <InputBase
    id={id}
    type="text"
    placeholder={placeholder}
    value={value}
    onChange={e => handleChange(e.target.value)}
    fullWidth
    startAdornment={
      nodeTypeProps ? (
        <Select
          // disabled={disableSearcher}
          multiple
          MenuProps={{
            sx: {
              "& .MuiMenu-paper": {
                backgroundColor: theme =>
                  theme.palette.mode === "dark" ? theme.palette.common.notebookMainBlack : theme.palette.common.gray50,
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
          onChange={nodeTypeProps.onChange}
          sx={{
            padding: {
              xs: "2px 0px",
              sm: "0px",
            },
            height: {
              xs: "31px",
              sm: "46px",
            },
            marginLeft: "-14px",
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
    sx={{
      p: "10px 14px",
      borderRadius: "4px",
      border: theme =>
        `solid 1px ${theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG500 : DESIGN_SYSTEM_COLORS.gray300}`,
    }}
  />
);

type ReferenceItemProps = {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  correct: boolean;
  corrects: number;
  wrong: boolean;
  wrongs: number;
};
const ReferenceItem = ({ id, title, content, createdAt, correct, corrects, wrong, wrongs }: ReferenceItemProps) => {
  const [expandItem, setExpandItem] = useState(false);

  return (
    <Stack
      key={id}
      spacing={"10px"}
      sx={{
        borderRadius: "8px",
        p: "12px 16px 10px 16px",
        backgroundColor: theme =>
          theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG700 : DESIGN_SYSTEM_COLORS.gray300,
      }}
    >
      <Box>
        <Typography sx={{ fontSize: "16px", fontWeight: 500, mb: "8px" }}>{title}</Typography>
        <Box sx={{ height: expandItem ? undefined : "59px" }}>
          {/* height in Box enable multiline ellipsis */}
          <Typography
            sx={{
              fontSize: "14px",
              fontWeight: 400,
              ...(!expandItem && {
                display: "-webkit-box",
                overflow: "hidden",
                textOverflow: "ellipsis",
                "-webkit-box-orient": "vertical",
                "-webkit-line-clamp": "3" /* start showing ellipsis when 3rd line is reached */,
                whiteSpace: "pre-wrap" /* let the text wrap preserving spaces */,
              }),
            }}
          >
            {content}
          </Typography>
        </Box>

        {!expandItem && (
          <Button onClick={() => setExpandItem(true)}>
            Show More
            <KeyboardArrowDownIcon sx={{ ml: "8px" }} />
          </Button>
        )}
      </Box>
      <Stack direction={"row"} justifyContent={"space-between"}>
        <Stack direction={"row"} justifyContent={"space-between"} alignItems={"center"} spacing={"6px"}>
          <NodeTypeIcon nodeType={"Code"} fontSize="inherit" />
          <Typography
            sx={{
              fontSize: "12px",
              color: theme =>
                theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG200 : DESIGN_SYSTEM_COLORS.gray500,
            }}
          >
            {dayjs(createdAt).fromNow()}
          </Typography>
        </Stack>
        <CustomWrapperButton id={`${id}-node-footer-votes`}>
          <Stack direction={"row"} alignItems={"center"}>
            <Tooltip title={"Vote to prevent further changes."} placement={"top"}>
              <Button
                onClick={() => console.log("correct")}
                // disabled={nodeCopy?.disableVotes}
                sx={{
                  p: "0px 8px 0px 5px",
                  color: "inherit",
                  minWidth: "0px",
                  borderRadius: "16px 0px 0px 16px",
                  ":hover": {
                    backgroundColor: ({ palette }) =>
                      palette.mode === "dark" ? palette.common.notebookG400 : palette.common.lightBackground2,
                  },
                }}
              >
                <Box sx={{ display: "flex", fontSize: "14px", alignItems: "center" }}>
                  <DoneIcon sx={{ fontSize: "14px", color: correct ? "#00E676" : undefined }} />
                  <span style={{ fontSize: "12px", marginLeft: "2px" }}>{shortenNumber(corrects, 2, false)}</span>
                </Box>
              </Button>
            </Tooltip>
            <Divider
              orientation="vertical"
              variant="middle"
              flexItem
              sx={{
                my: "4px",
                borderColor: theme => (theme.palette.mode === "dark" ? "#D3D3D3" : DESIGN_SYSTEM_COLORS.gray300),
              }}
            />
            <Tooltip title={"Vote to delete node."} placement={"top"}>
              <Button
                onClick={() => console.log("wrong")}
                // disabled={nodeCopy?.disableVotes}
                sx={{
                  p: "0px 5px 0px 8px",
                  color: "inherit",
                  minWidth: "0px",
                  borderRadius: "0px 16px 16px 0px",
                  ":hover": {
                    backgroundColor: ({ palette }) =>
                      palette.mode === "dark" ? palette.common.notebookG400 : palette.common.lightBackground2,
                  },
                }}
              >
                <Box sx={{ display: "flex", fontSize: "14px", alignItems: "center" }}>
                  <CloseIcon sx={{ fontSize: "14px", color: wrong ? "red" : undefined }} />
                  <span style={{ fontSize: "12px", marginLeft: "2px" }}>{shortenNumber(wrongs, 2, false)}</span>
                </Box>
              </Button>
            </Tooltip>
          </Stack>
        </CustomWrapperButton>
      </Stack>
    </Stack>
  );
};

export const ReferencesSidebarMemoized = React.memo(ReferencesSidebar);

const MOCK_REFERENCES = [
  {
    id: "1",
    correctNum: 2,
    wrongNum: 1,
    nodeType: "Code",
    createdAt: new Date(),
    correct: false,
    corrects: 2,
    wrong: false,
    wrongs: 2,
    title: "Protecting online communities while embracing newcomers is challenging",
    content: `Newcomers, who often have limited information and less commitment to the community compared to established
    members, may base their decision to stay or leave on their initial observations and interactions. This,
    coupled with the fact that newcomers may not yet be familiar with the appropriate ways to participate in the
    community, can lead to disruptions for existing members. To mitigate these risks, it is important for online
    communities to implement strategies for effectively screening and educating new members.`,
  },
];
