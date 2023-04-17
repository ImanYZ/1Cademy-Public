import CloseIcon from "@mui/icons-material/Close";
import ControlPointIcon from "@mui/icons-material/ControlPoint";
import DoneIcon from "@mui/icons-material/Done";
import SearchIcon from "@mui/icons-material/Search";
import {
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Box } from "@mui/system";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { getFirestore } from "firebase/firestore";
import NextImage from "next/image";
import React, { MutableRefObject, useCallback, useEffect, useMemo, useState, useTransition } from "react";

import OptimizedAvatar from "@/components/OptimizedAvatar";

import NotebookImage from "../../../../../public/notebook.svg";
import { useNodeBook } from "../../../../context/NodeBookContext";
import { useInView } from "../../../../hooks/useObserver";
import { useTagsTreeView } from "../../../../hooks/useTagsTreeView";
import { SearchNodesResponse, SearchNotebookResponse } from "../../../../knowledgeTypes";
import { Post } from "../../../../lib/mapApi";
import shortenNumber from "../../../../lib/utils/shortenNumber";
import { SortDirection, SortValues, TNodeBookState } from "../../../../nodeBookTypes";
import { NodeType } from "../../../../types";
import NodeTypeIcon from "../../../NodeTypeIcon2";
import { ChosenTag, MemoizedTagsSearcher, TagTreeView } from "../../../TagsSearcher";
import Modal from "../../Modal/Modal";
import RecentNodesList from "../../RecentNodesList";
import TimeFilter from "../../TimeFilter";
import ValidatedInput from "../../ValidatedInput";
import PendingProposalList from "../PendingProposalList";
import { SidebarWrapper } from "./SidebarWrapper";
dayjs.extend(relativeTime);

type SearcherSidebarProps = {
  notebookRef: MutableRefObject<TNodeBookState>;
  openLinkedNode: any;
  open: boolean;
  onClose: () => void;
  sidebarWidth: number;
  innerHeight?: number;
  innerWidth: number;
  disableSearcher?: boolean;
  enableElements: string[];
  username: string;
  tagId: string | undefined;
};

type Pagination = {
  data: any[];
  lastPageLoaded: number;
  totalPage: number;
  totalResults: number;
};

const NODE_TYPES_ARRAY: NodeType[] = ["Concept", "Code", "Reference", "Relation", "Question", "Idea"];
const MAX_TAGS_IN_MOBILE = 2;

const SearcherSidebar = ({
  notebookRef,
  openLinkedNode,
  open,
  onClose,
  sidebarWidth,
  innerHeight,
  innerWidth,
  disableSearcher,
  enableElements = [],
  username,
}: SearcherSidebarProps) => {
  const db = getFirestore();
  const { nodeBookState, nodeBookDispatch } = useNodeBook();
  const { allTags, setAllTags } = useTagsTreeView();
  const theme = useTheme();
  const [nodesUpdatedSince, setNodesUpdatedSince] = useState(1000);
  const [isRetrieving, setIsRetrieving] = useState(false);
  const [onlyTags /*setOnlyTags*/] = useState(true);
  const [showTagSelector, setShowTagSelector] = useState(false);
  const [nodeTypes, setNodeTypes] = useState(NODE_TYPES_ARRAY);
  const [sortOption, setSortOption] = useState<SortValues>("NOT_SELECTED");
  const [timeFilter, setTimeFilter] = useState<any>("");
  const [sortDirection, setSortDirection] = useState<SortDirection>("DESCENDING");
  const [chosenTags, setChosenTags] = useState<ChosenTag[]>([]);
  const [search, setSearch] = useState<string>(nodeBookState.searchQuery);
  const [value, setValue] = React.useState(0);
  const [notebooks, setNoteBooks] = useState<any>({
    data: [],
    lastPageLoaded: 0,
    totalResults: 0,
  });
  const [pendingProposals, setPendingProposals] = useState<any>({
    data: [],
    lastPageLoaded: 0,
    totalResults: 0,
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isPending, startTransition] = useTransition();

  const isMovil = useMediaQuery("(max-width:899px)");

  const [searchResults, setSearchResults] = useState<Pagination>({
    data: [],
    lastPageLoaded: 0,
    totalPage: 0,
    totalResults: 0,
  });

  const { ref: refInfinityLoaderTrigger, inView: inViewInfinityLoaderTrigger } = useInView();

  const selectedTags = useMemo<TagTreeView[]>(() => Object.values(allTags).filter(tag => tag.checked), [allTags]);

  // tutorial constants
  const disableInputSearcher = disableSearcher && !enableElements.includes("search-input");
  const disableSearchIcon = disableSearcher && !enableElements.includes("SearchIcon");
  const disableEditedInThePast = disableSearcher && !enableElements.includes("search-recently-input");
  const disableRecentNodeList = disableSearcher && !enableElements.includes("recentNodesList");
  const disableSearchItem = disableSearcher && !enableElements.includes("search-item");

  const onSearch = useCallback(
    async (page: number, q: string, sortOption: SortValues, sortDirection: SortDirection, nodeTypes: NodeType[]) => {
      try {
        setIsRetrieving(true);
        if (page < 2) {
          setSearchResults({
            data: [],
            lastPageLoaded: 0,
            totalPage: 0,
            totalResults: 0,
          });
        }
        const data: SearchNodesResponse = await Post<SearchNodesResponse>("/searchNodesInNotebook", {
          q,
          nodeTypes,
          tags: selectedTags.map(cur => cur.title),
          nodesUpdatedSince,
          sortOption,
          sortDirection,
          page,
          onlyTitle: nodeBookState.searchByTitleOnly,
        });

        const newData = page === 1 ? data.data : [...searchResults.data, ...data.data];
        setSearchResults({
          data: newData,
          lastPageLoaded: data.page,
          totalPage: Math.ceil((data.numResults || 0) / (data.perPage || 10)),
          totalResults: data.numResults,
        });
        setIsRetrieving(false);
      } catch (err) {
        console.error(err);
        setIsRetrieving(false);
      }
    },
    [selectedTags, nodesUpdatedSince, nodeBookState.searchByTitleOnly, searchResults.data]
  );

  const onSearchNotebooks = useCallback(
    async (page: number, q: string) => {
      try {
        setIsRetrieving(true);
        if (page < 2) {
          setNoteBooks({
            data: [],
            lastPageLoaded: 0,
            totalPage: 0,
            totalResults: 0,
          });
        }
        const data: SearchNotebookResponse = await Post<SearchNotebookResponse>("/searchNotebooks", {
          q,
          page,
          onlyTitle: nodeBookState.searchByTitleOnly,
        });
        const newData = page === 1 ? data.data : [...notebooks.data, ...data.data];
        setNoteBooks({
          data: newData,
          lastPageLoaded: data.page,
          totalResults: data.numResults,
        });
        setIsRetrieving(false);
      } catch (err) {
        console.error(err);
        setIsRetrieving(false);
      }
    },
    [nodeBookState.searchByTitleOnly, notebooks.data]
  );

  const onSearchPendingProposals = useCallback(
    async (page: number, q: string) => {
      try {
        setIsRetrieving(true);
        if (page < 2) {
          setPendingProposals({
            data: [],
            lastPageLoaded: 0,
            totalPage: 0,
            totalResults: 0,
          });
        }
        const data: SearchNotebookResponse = await Post<SearchNotebookResponse>("/searchPendingProposals", {
          q,
          page: 1,
          onlyTitle: nodeBookState.searchByTitleOnly,
        });
        const newData = page === 1 ? data.data : [...pendingProposals.data, ...data.data];
        setPendingProposals({
          data: newData,
          lastPageLoaded: data.page,
          totalResults: data.numResults,
        });
        setIsRetrieving(false);
      } catch (err) {
        console.error(err);
        setIsRetrieving(false);
      }
    },
    [nodeBookState.searchByTitleOnly, pendingProposals.data]
  );

  useEffect(() => {
    if (!inViewInfinityLoaderTrigger) return;
    if (isRetrieving) return;
    if (value === 0) {
      onSearch(searchResults.lastPageLoaded + 1, search, sortOption, sortDirection, nodeTypes);
    }
  }, [
    inViewInfinityLoaderTrigger,
    isRetrieving,
    nodeTypes,
    onSearch,
    refInfinityLoaderTrigger,
    search,
    searchResults.lastPageLoaded,
    sortDirection,
    sortOption,
  ]);

  useEffect(() => {
    if (value === 1) {
      onSearchNotebooks(notebooks.lastPageLoaded + 1, search);
    }
  }, [db, username, onSearch]);

  useEffect(() => {
    if (value === 2) {
      onSearchPendingProposals(pendingProposals.lastPageLoaded + 1, search);
    }
  }, [db, username, onSearch]);

  const onFocusSearcherInput = useCallback(
    (inputTitle: HTMLElement) => {
      if (!open) return;
      if (!inputTitle) return;
      inputTitle.focus();
    },
    [open]
  );

  const viewTagsInMovil = useMemo<TagTreeView[]>(() => selectedTags.slice(0, MAX_TAGS_IN_MOBILE), [selectedTags]);

  useEffect(() => {
    if (nodeBookState.searchQuery && nodeBookState.nodeTitleBlured && value === 0) {
      setSearch(nodeBookState.searchQuery);
      onSearch(1, nodeBookState.searchQuery, sortOption, sortDirection, nodeTypes);
      notebookRef.current.nodeTitleBlured = false;
      nodeBookDispatch({ type: "setNodeTitleBlured", payload: false });
    }
  }, [
    nodeBookDispatch,
    nodeBookState.nodeTitleBlured,
    nodeBookState.searchQuery,
    nodeTypes,
    onSearch,
    sortDirection,
    sortOption,
  ]);

  // add tags by changing a chosenNode
  useEffect(() => {
    // if (!showTagSelector) return;
    if (nodeBookState.choosingNode?.id !== "searcher") return;
    setAllTags(allTags => {
      if (!nodeBookState.chosenNode) return allTags;
      if (!allTags[nodeBookState.chosenNode.id]) return allTags;

      const copyAllTags = { ...allTags };
      copyAllTags[nodeBookState.chosenNode.id] = {
        ...copyAllTags[nodeBookState.chosenNode.id],
        checked: !copyAllTags[nodeBookState.chosenNode.id].checked,
      };

      return copyAllTags;
    });

    notebookRef.current.chosenNode = null;
    nodeBookDispatch({ type: "setChosenNode", payload: null });
  }, [
    allTags,
    nodeBookDispatch,
    nodeBookState.choosingNode?.id,
    nodeBookState.chosenNode,
    setAllTags,
    showTagSelector,
  ]);

  const a11yProps = (index: number) => {
    return {
      "aria-controls": `simple-tabpanel-${index}`,
    };
  };
  const handleChange = useCallback(
    (event: any) => {
      let val = event.target.value;
      setSearch(val);
      startTransition(() => {
        notebookRef.current.searchQuery = val;
        nodeBookDispatch({ type: "setSearchQuery", payload: val });
      });
    },
    [nodeBookDispatch, setSearch]
  );

  const onChangeSortOptions = useCallback(
    (newSortOption: SortValues) => {
      setSortOption(newSortOption);
      if (value === 0) {
        onSearch(1, search, newSortOption, sortDirection, nodeTypes);
      }
    },
    [nodeTypes, onSearch, search, sortDirection]
  );

  const onChangeTimeFilter = useCallback(
    (newTimeFilter: any) => {
      let timeFilter: number = 0;
      const currentDate = new Date();
      switch (newTimeFilter) {
        case "LAST_DAY":
          const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
          timeFilter = currentDate.getTime() - startDate.getTime();
        case "LAST_15_DAYS":
          timeFilter = 15 * 24 * 60 * 60 * 1000;
        case "LAST_30_DAYS":
          timeFilter = 30 * 24 * 60 * 60 * 1000;
        case "LAST_QUARTER":
          // Determine the start and end dates of the last quarter
          const currentMonth = currentDate.getMonth() + 1;
          let startQuarterMonth;
          let endQuarterMonth;
          if (currentMonth >= 1 && currentMonth <= 3) {
            startQuarterMonth = 0;
            endQuarterMonth = 2;
          } else if (currentMonth >= 4 && currentMonth <= 6) {
            startQuarterMonth = 3;
            endQuarterMonth = 5;
          } else if (currentMonth >= 7 && currentMonth <= 9) {
            startQuarterMonth = 6;
            endQuarterMonth = 8;
          } else {
            startQuarterMonth = 9;
            endQuarterMonth = 11;
          }

          const startQuarter = new Date(currentDate.getFullYear(), startQuarterMonth, 1);
          const endQuarter = new Date(currentDate.getFullYear(), endQuarterMonth + 1, 0);

          // Calculate the number of milliseconds between the start and end of the quarter
          timeFilter = endQuarter.getTime() - startQuarter.getTime();
        case "LAST_YEAR":
          const startOfYear = new Date(currentDate.getFullYear(), 0, 1); // Get the start of the current year
          timeFilter = currentDate.getTime() - startOfYear.getTime();
        case "ALL_TIME":
          timeFilter = Number.MAX_SAFE_INTEGER;
      }
      setNodesUpdatedSince(timeFilter);
      setTimeFilter(newTimeFilter);
    },
    [nodeTypes, onSearch, search, timeFilter]
  );

  const onChangeSortDirection = useCallback(
    (newSortDirection: SortDirection) => {
      setSortDirection(newSortDirection);
      if (value === 0) {
        onSearch(1, search, sortOption, newSortDirection, nodeTypes);
      }
    },
    [nodeTypes, onSearch, search, sortOption]
  );

  const onSearchEnter = useCallback(
    (event: any) => {
      if (event.charCode === 13) {
        if (value === 0) {
          onSearch(1, search, sortOption, sortDirection, nodeTypes);
        } else if (value === 1) {
          onSearchNotebooks(1, search);
        } else if (value === 2) {
          onSearchPendingProposals(1, search);
        }
      }
    },
    [nodeTypes, onSearch, search, sortDirection, sortOption]
  );

  const deleteChip = useCallback(
    (nodeId: string) => {
      setChosenTags(oldChosenTags => {
        const r = oldChosenTags.filter(tag => tag.id !== nodeId);
        return r;
      });
      setAllTags(oldAllTags => {
        return { ...oldAllTags, [nodeId]: { ...oldAllTags[nodeId], checked: false } };
      });
    },
    [setAllTags]
  );

  // const setRecoverDefaultTags = useCallback(() => {
  //   // console.log("setRecoverDefaultTags");
  //   // setOnlyTags(true);
  //   // setAllTags(oldAllTags => {
  //   //   return { ...oldAllTags, [tag.node]: { ...oldAllTags[tag.node], checked: true } };
  //   // });
  //   // setChosenTags([tag.node]);
  // }, []);

  const setNodesUpdatedSinceClick = useCallback((event: any) => setNodesUpdatedSince(event.target.value), []);

  const setShowTagSelectorClick = useCallback(() => {
    setShowTagSelector(prevValue => {
      const chosingNodePayload = prevValue ? null : { id: "searcher", type: null };
      notebookRef.current.choosingNode = chosingNodePayload;
      nodeBookDispatch({ type: "setChoosingNode", payload: chosingNodePayload });
      return !prevValue;
    });
  }, [nodeBookDispatch]);

  const onChangeNoteType = useCallback(
    (event: SelectChangeEvent<string[]>) => {
      const newNodeTypes = event.target.value as NodeType[];
      setNodeTypes(newNodeTypes);
      if (value === 0) {
        onSearch(1, search, sortOption, sortDirection, newNodeTypes);
      }
    },
    [onSearch, search, sortDirection, sortOption]
  );

  const contentSignalState = useMemo(() => {
    return { updated: true };
  }, [
    isRetrieving,
    searchResults,
    JSON.stringify(enableElements),
    disableSearcher,
    sortOption,
    timeFilter,
    value,
    notebooks,
  ]);

  const setChosenTagsCallback = useCallback(
    (newChosenTags: ChosenTag[]) => {
      setChosenTags(newChosenTags);
    },
    [setChosenTags]
  );

  const handleTabValueChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const searcherOptionsMemoized = useMemo(() => {
    return (
      <>
        <Box
          id="searcher-sidebar-options"
          sx={{
            marginTop: "20px",
            p: {
              xs: "10px",
              sm: innerHeight && innerHeight < 600 ? "20px 10px 10px 10px" : "0px 10px 10px 10px",
            },
            borderBottom: 1,
            borderColor: theme => (theme.palette.mode === "dark" ? "black" : "divider"),
            width: "100%",
          }}
        >
          {!isMovil && showTagSelector && (
            <div id="tagModal">
              <Modal onClick={setShowTagSelectorClick} returnLeft={true} noBackground={true}>
                <MemoizedTagsSearcher
                  allTags={allTags}
                  setAllTags={setAllTags}
                  chosenTags={chosenTags}
                  setChosenTags={setChosenTagsCallback}
                  sx={{ maxHeight: "235px", height: "235px" }}
                  multiple
                />
              </Modal>
            </div>
          )}

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
                  theme.palette.mode === "dark" ? theme.palette.common.notebookG200 : theme.palette.common.notebookG300,
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
                  theme.palette.mode === "dark" ? theme.palette.common.notebookG200 : theme.palette.common.notebookG300,
                fontWeight: "none",
              }}
            />
          </Box>

          {((isMovil && !showTagSelector) || !isMovil) && (
            <>
              <Box id="search-input">
                <ValidatedInput
                  identification="SearchQuery"
                  name="SearchQuery"
                  type="text"
                  onChange={handleChange}
                  value={search}
                  disabled={disableInputSearcher}
                  onKeyPress={onSearchEnter}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Select
                          disabled={disableSearcher}
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
                                  theme.palette.mode === "dark"
                                    ? theme.palette.common.notebookG600
                                    : theme.palette.common.gray200,
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
                          value={nodeTypes}
                          variant="outlined"
                          displayEmpty
                          renderValue={() => "Types"}
                          onChange={onChangeNoteType}
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
                              theme.palette.mode === "dark"
                                ? theme.palette.common.notebookG700
                                : theme.palette.common.gray100,

                            ":hover .MuiOutlinedInput-notchedOutline": {
                              borderColor: theme => theme.palette.common.orange,
                            },
                            "&> fieldset": {
                              borderColor: theme =>
                                theme.palette.mode === "dark"
                                  ? theme.palette.common.notebookG500
                                  : theme.palette.common.gray400,
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
                                color: nodeTypes.includes(nodeType) ? "blue" : undefined,
                              }}
                            >
                              <Checkbox checked={nodeTypes.includes(nodeType)} />

                              <ListItemText primary={nodeType} sx={{ fontSize: "12px!important" }} />
                              <ListItemIcon>
                                <NodeTypeIcon fontSize="small" nodeType={nodeType} />
                              </ListItemIcon>
                            </MenuItem>
                          ))}
                        </Select>
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end" disablePointerEvents={disableSearchIcon}>
                        <IconButton
                          id="SearchIcon"
                          onClick={() => {
                            if (value === 0) {
                              onSearch(1, search, sortOption, sortDirection, nodeTypes);
                            } else if (value === 1) {
                              onSearchNotebooks(1, search);
                            } else if (value === 2) {
                              onSearchPendingProposals(1, search);
                            }
                          }}
                          sx={{
                            padding: {
                              xs: "5px !important",
                              sm: "10px",
                            },
                            marginRight: {
                              xs: "-11px !important",
                              sm: "-8px",
                            },
                          }}
                        >
                          <SearchIcon
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
                      </InputAdornment>
                    ),
                    inputRef: onFocusSearcherInput,
                  }}
                  inputProps={{
                    style: {
                      padding: innerWidth >= theme.breakpoints.values.sm ? "9.5px 14px" : "2px 0px",
                    },
                  }}
                  sx={{
                    "& fieldset": {
                      borderWidth: 1,
                      borderColor: (theme: any) =>
                        theme.palette.mode === "dark" ? theme.palette.common.notebookG500 : "##D5D9E1",
                      borderRadius: "4px",
                    },
                  }}
                />
              </Box>
              <Box
                id="nodesUpdatedSinceContainer"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: innerWidth > 410 ? "14px" : "11px",
                  flexWrap: "wrap",
                  gap: "10px",
                  paddingTop: "13px",
                }}
              >
                <RecentNodesList
                  recentNodes={searchResults}
                  setRecentNodes={setSearchResults}
                  onlyTags={onlyTags}
                  disabled={disableRecentNodeList}
                  sortOption={sortOption}
                  setSortOption={onChangeSortOptions}
                  sortDirection={sortDirection}
                  setSortDirection={onChangeSortDirection}
                />

                <TimeFilter timeFilter={timeFilter} setTimeFilter={onChangeTimeFilter} />

                {/* <Box id="search-recently-input" sx={{ display: "flex", alignItems: "center", gap: "5px" }}>
                Edited in past
                <InputBase
                  type="number"
                  defaultValue={nodesUpdatedSince}
                  onChange={setNodesUpdatedSinceClick}
                  size="small"
                  disabled={disableEditedInThePast}
                  sx={{
                    width: "76px",
                    p: "0px",
                  }}
                  inputProps={{
                    style: {
                      padding: "4px 8px",
                      border: "solid 1px rgba(88, 88, 88,.7)",
                      borderRadius: "16px",
                    },
                  }}
                />
                days
              </Box> */}

                <div
                  style={{
                    ...(sidebarWidth < 350 && {
                      marginLeft: "auto",
                    }),
                  }}
                  id="SearchResutlsNum"
                >
                  {shortenNumber(searchResults.totalResults, 2, false)} Results
                </div>
              </Box>
            </>
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
          )}
        </Box>
        <Box
          sx={{
            marginTop: "20px",
            borderBottom: 1,
            borderColor: theme => (theme.palette.mode === "dark" ? "black" : "divider"),
            width: "100%",
          }}
        >
          <Tabs value={value} onChange={handleTabValueChange} aria-label={"Search Sidebar Tabs"} variant="fullWidth">
            {[{ title: "Nodes" }, { title: "Notebooks" }, { title: "Proposals" }].map((tabItem: any, idx: number) => (
              <Tab
                key={tabItem.title}
                id={`bookmarks-tab-${tabItem.title.toLowerCase()}`}
                label={tabItem.title}
                {...a11yProps(idx)}
              />
            ))}
          </Tabs>
        </Box>
      </>
    );
  }, [
    innerHeight,
    isMovil,
    showTagSelector,
    setShowTagSelectorClick,
    allTags,
    setAllTags,
    chosenTags,
    setChosenTagsCallback,
    viewTagsInMovil,
    selectedTags,
    disableSearcher,
    handleChange,
    search,
    disableInputSearcher,
    onSearchEnter,
    nodeTypes,
    onChangeNoteType,
    disableSearchIcon,
    onFocusSearcherInput,
    innerWidth,
    theme.breakpoints.values.sm,
    searchResults,
    onlyTags,
    disableRecentNodeList,
    sortOption,
    onChangeSortOptions,
    sortDirection,
    onChangeSortDirection,
    nodesUpdatedSince,
    setNodesUpdatedSinceClick,
    disableEditedInThePast,
    sidebarWidth,
    deleteChip,
    onSearch,
    timeFilter,
    onChangeTimeFilter,
    value,
    setValue,
  ]);

  return (
    <SidebarWrapper
      id="sidebar-wrapper-searcher"
      title="Search Nodes"
      open={open}
      onClose={onClose}
      width={sidebarWidth}
      innerHeight={innerHeight}
      SidebarOptions={searcherOptionsMemoized}
      contentSignalState={contentSignalState}
      disabled={disableSearcher}
      sx={{
        boxShadow: "none",
      }}
      SidebarContent={
        <Box>
          {value === 0 && (
            <Box id="search-list" sx={{ p: "2px 4px" }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                {searchResults.data.map((resNode, idx) => {
                  return (
                    <Paper
                      elevation={3}
                      key={`resNode${idx}`}
                      onClick={
                        disableSearchItem
                          ? () => {}
                          : () => {
                              openLinkedNode(resNode.id, "Searcher");
                            }
                      }
                      sx={{
                        listStyle: "none",
                        padding: {
                          xs: "5px 10px",
                          sm: "12px 16px 10px 16px",
                        },
                        background: theme =>
                          theme.palette.mode === "dark"
                            ? theme.palette.common.notebookG700
                            : theme.palette.common.gray100,
                        borderRadius: "8px",
                        borderLeft:
                          "studied" in resNode && resNode.studied ? "solid 6px #fdc473" : " solid 6px #fd7373",
                        cursor: disableSearchItem ? "not-allowed" : "pointer",
                        opacity: disableSearchItem ? "0.5" : "1",
                        marginBottom: "5px",
                      }}
                    >
                      {/* {innerWidth > theme.breakpoints.values.sm && (
                    <Box
                      className="SidebarNodeTypeIcon"
                      style={{ display: "flex", justifyContent: "space-between", fontSize: "16px" }}
                    >
                      <NodeTypeIcon nodeType={resNode.nodeType} fontSize="inherit" />
                      <div className="right" style={{ display: "flex", gap: "10px" }}>
                        <MemoizedMetaButton>
                          <>
                            <EventAvailableIcon className="material-icons grey-text" sx={{ fontSize: "inherit" }} />
                            <span>{dayjs(resNode.changedAt).fromNow()}</span>
                          </>
                        </MemoizedMetaButton>
                        <MemoizedMetaButton>
                          <>
                            <CreateIcon className="material-icons grey-text" sx={{ fontSize: "inherit" }} />
                            <span>{shortenNumber(resNode.versions, 2, false)}</span>
                          </>
                        </MemoizedMetaButton>
                        <MemoizedMetaButton>
                          <>
                            <CloseIcon className="material-icons grey-text" sx={{ fontSize: "inherit" }} />
                            <span>{shortenNumber(resNode.wrongs, 2, false)}</span>
                          </>
                        </MemoizedMetaButton>
                        <MemoizedMetaButton>
                          <>
                            <DoneIcon className="material-icons DoneIcon grey-text" sx={{ fontSize: "inherit" }} />
                            <span>{shortenNumber(resNode.corrects, 2, false)}</span>
                          </>
                        </MemoizedMetaButton>
                      </div>
                    </Box>
                  )} */}
                      <Typography
                        sx={{
                          fontSize: "16px",
                          fontWeight: "500",
                          lineHeight: "24px",
                        }}
                      >
                        {resNode.title}
                      </Typography>
                      <Box
                        sx={{
                          marginTop: "10px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <Box
                            sx={{
                              width: "28px",
                              height: "28px",
                              borderRadius: "50%",
                              background: theme =>
                                theme.palette.mode === "dark"
                                  ? theme.palette.common.notebookG500
                                  : theme.palette.common.gray200,
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          >
                            <NodeTypeIcon nodeType={resNode.nodeType || ""} fontSize="inherit" />
                          </Box>
                          <Box
                            sx={{
                              fontSize: "12px",
                              marginLeft: "5px",
                              color: theme =>
                                theme.palette.mode === "dark"
                                  ? theme.palette.common.notebookG200
                                  : theme.palette.common.gray500,
                            }}
                          >
                            {dayjs(new Date(resNode.changedAt)).fromNow()}
                          </Box>
                        </Box>
                        <Box
                          className="tab-double-button-node-footer"
                          sx={{
                            background: (theme: any) => (theme.palette.mode === "dark" ? "#404040" : "#EAECF0"),
                            display: "flex",
                            alignItems: "center",
                            marginRight: "0px",
                            cursor: "auto",
                          }}
                        >
                          <Box
                            sx={{
                              padding: "2px 10px 2px 10px",
                              borderRadius: "52px 0px 0px 52px",
                            }}
                          >
                            <Tooltip title={"Correct votes"} placement={"top"}>
                              <Box
                                sx={{
                                  display: "flex",
                                  fontSize: "14px",
                                  alignItems: "center",
                                }}
                              >
                                <DoneIcon sx={{ fontSize: "18px", color: "inherit" }} />
                                <span>{shortenNumber(resNode.corrects, 2, false)}</span>
                              </Box>
                            </Tooltip>
                          </Box>
                          <Divider
                            orientation="vertical"
                            variant="middle"
                            flexItem
                            sx={{
                              background: theme => (theme.palette.mode === "dark" ? "#D3D3D3" : "inherit"),
                            }}
                          />
                          <Box
                            sx={{
                              padding: "2px 10px 2px 10px",
                              borderRadius: "0px 52px 52px 0px",
                            }}
                          >
                            <Tooltip title={"Wrong votes"} placement={"top"}>
                              <Box
                                sx={{
                                  display: "flex",
                                  fontSize: "14px",
                                  alignItems: "center",
                                }}
                              >
                                <CloseIcon
                                  sx={{
                                    fontSize: "18px",
                                    color: "inherit",
                                  }}
                                />
                                <span>{shortenNumber(resNode.wrongs, 2, false)}</span>
                              </Box>
                            </Tooltip>
                          </Box>
                        </Box>
                      </Box>
                    </Paper>
                  );
                })}
              </Box>
              {isRetrieving && (
                <Box sx={{ py: "10px", display: "flex", justifyContent: "center" }}>
                  <CircularProgress />
                </Box>
              )}
              {!isRetrieving && searchResults.lastPageLoaded < searchResults.totalPage && (
                <Box id="ContinueButton" ref={refInfinityLoaderTrigger}></Box>
              )}
            </Box>
          )}

          <Box sx={{ p: "10px" }}>
            {isRetrieving && (value === 1 || value === 2) && (
              <Box sx={{ py: "10px", display: "flex", justifyContent: "center" }}>
                <CircularProgress />
              </Box>
            )}
            {!isRetrieving && value === 1 && (
              <Box>
                {notebooks.data.map((notebook: any, idx: number) => (
                  <Box
                    key={`notebook-${idx}`}
                    sx={{
                      width: "455px",
                      height: "238px",
                      border: "solid 1px #2F2F2F",
                      borderRadius: "8px",
                      background: theme => (theme.palette.mode === "dark" ? "#1F1F1F" : theme.palette.common.gray100),
                      marginBottom: "10px",
                    }}
                  >
                    <Box
                      sx={{
                        height: "172px",
                      }}
                    >
                      <NextImage src={NotebookImage.src} width={"455px"} height={"172px"} />
                    </Box>
                    <Stack mt={"7px"} direction={"row"} spacing={"10px"} alignItems={"center"}>
                      <Box>
                        <OptimizedAvatar
                          imageUrl={notebook.ownerImgUrl}
                          renderAsAvatar={true}
                          contained={false}
                          sx={{ border: "none", width: "48px", height: "48px", position: "static" }}
                        />
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <Typography
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            display: "inline-block",
                            fontWeight: "500",
                            lineHeight: "24px",
                          }}
                        >{`${notebook.title}`}</Typography>
                        <Typography
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            display: "inline-block",
                            fontSize: "12px",
                            lineHeight: "18px",
                            color: theme =>
                              theme.palette.mode === "dark"
                                ? theme.palette.common.notebookG200
                                : theme.palette.common.gray500,
                          }}
                        >{`Edited in 3 months ago`}</Typography>
                      </Box>
                    </Stack>
                  </Box>
                ))}
              </Box>
            )}
            {!isRetrieving && value === 2 && (
              <Box>
                <PendingProposalList proposals={pendingProposals.data} openLinkedNode={openLinkedNode} />
              </Box>
            )}
          </Box>
        </Box>
      }
    />
  );
};
export const MemoizedSearcherSidebar = React.memo(SearcherSidebar);
