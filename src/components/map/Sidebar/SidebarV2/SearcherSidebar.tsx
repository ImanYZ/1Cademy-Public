import CloseIcon from "@mui/icons-material/Close";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ControlPointIcon from "@mui/icons-material/ControlPoint";
import SearchIcon from "@mui/icons-material/Search";
import {
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Box } from "@mui/system";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { collection, getDocs, getFirestore, query, where } from "firebase/firestore";
import React, { MutableRefObject, useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { filterOnDaysAgo } from "src/utils/dates";

import { RiveComponentMemoized } from "@/components/home/components/temporals/RiveComponentExtended";
import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";
import { buildFullNodes, getNodesPromises } from "@/lib/utils/nodesSyncronization.utils";

import { useNodeBook } from "../../../../context/NodeBookContext";
import { useInView } from "../../../../hooks/useObserver";
import { useTagsTreeView } from "../../../../hooks/useTagsTreeView";
import { SearchNodesResponse, SearchNotebookResponse } from "../../../../knowledgeTypes";
import { Post } from "../../../../lib/mapApi";
import shortenNumber from "../../../../lib/utils/shortenNumber";
import {
  /* FullNodeData, */ SortDirection,
  SortValues,
  TNodeBookState,
  UserNodeFirestore,
} from "../../../../nodeBookTypes";
import { NodeType, SimpleNode2 } from "../../../../types";
import NodeTypeIcon from "../../../NodeTypeIcon2";
import { ChosenTag, MemoizedTagsSearcher, TagTreeView } from "../../../TagsSearcher";
import RecentNodesList from "../../RecentNodesList";
import TimeFilter from "../../TimeFilter";
import ValidatedInput from "../../ValidatedInput";
import PendingProposalList from "../PendingProposalList";
import { SidebarNodeLink } from "../SidebarNodeLink";
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
  //preLoadNodes: (nodeIds: string[], fullNodes: FullNodeData[]) => Promise<void>;
  user: any;
};

export type Pagination = {
  data: SimpleNode2[];
  lastPageLoaded: number;
  totalPage: number;
  totalResults: number;
};

export const NODE_TYPES_ARRAY: NodeType[] = ["Concept", "Code", "Reference", "Relation", "Question", "Idea"];
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
  //preLoadNodes,
  user,
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
  const [timeFilter, setTimeFilter] = useState<any>("ALL_TIME");
  const [sortDirection, setSortDirection] = useState<SortDirection>("DESCENDING");
  const [chosenTags, setChosenTags] = useState<ChosenTag[]>([]);
  const [search, setSearch] = useState<string>(nodeBookState.searchQuery);
  const [value] = React.useState(0);
  // const [notebooks, setNoteBooks] = useState<any>({
  //   data: [],
  //   lastPageLoaded: 0,
  //   totalResults: 0,
  //   totalPage: 0,
  // });
  const [pendingProposals, setPendingProposals] = useState<any>({
    data: [],
    lastPageLoaded: 0,
    totalResults: 0,
    totalPage: 0,
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
  // const disableEditedInThePast = disableSearcher && !enableElements.includes("search-recently-input");
  const disableRecentNodeList = disableSearcher && !enableElements.includes("recentNodesList");
  // const disableSearchItem = disableSearcher && !enableElements.includes("search-item");

  const onSearch = useCallback(
    async (
      page: number,
      q: string,
      sortOption: SortValues,
      sortDirection: SortDirection,
      nodeTypes: NodeType[],
      daysAgo?: number,
      initialBookmarkedNodes: any = []
    ) => {
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
          sortOption: !sortOption ? "NOT_SELECTED" : sortOption,
          sortDirection,
          page,
          onlyTitle: nodeBookState.searchByTitleOnly,
        });

        const newData: SimpleNode2[] = page === 1 ? data.data : [...searchResults.data, ...data.data];
        const filteredData = daysAgo ? filterOnDaysAgo(newData, daysAgo) : newData;
        setSearchResults({
          data: [...initialBookmarkedNodes, ...filteredData],
          lastPageLoaded: data.page,
          totalPage: Math.ceil((data.numResults || 0) / (data.perPage || 10)),
          totalResults: data.numResults,
        });
        setIsRetrieving(false);

        // const mostHelpfulNodes = filteredData.slice(0, 10).map(c => c.id);
        // preLoadNodes(mostHelpfulNodes, []);
      } catch (err) {
        console.error(err);
        setIsRetrieving(false);
      }
    },
    [selectedTags, nodesUpdatedSince, nodeBookState.searchByTitleOnly, searchResults.data /* preLoadNodes */]
  );
  useEffect(() => {
    (async () => {
      if (value === 0) {
        const initialBookmarkedNodes = await bookmarkedNodes();
        onSearch(1, search, sortOption, sortDirection, nodeTypes, 0, initialBookmarkedNodes);
      } else if (value === 1) {
        onSearchPendingProposals(1, search);
        // onSearchNotebooks(1, search);
      } /* else if (value === 2) {
          onSearchPendingProposals(1, search);
        } */
    })();
  }, []);
  // const onSearchNotebooks = useCallback(
  //   async (page: number, q: string) => {
  //     try {
  //       setIsRetrieving(true);
  //       if (page < 2) {
  //         setNoteBooks({
  //           data: [],
  //           lastPageLoaded: 0,
  //           totalPage: 0,
  //           totalResults: 0,
  //         });
  //       }
  //       const data: SearchNotebookResponse = await Post<SearchNotebookResponse>("/searchNotebooks", {
  //         q,
  //         page,
  //         onlyTitle: nodeBookState.searchByTitleOnly,
  //       });
  //       const newData = page === 1 ? data.data : [...notebooks.data, ...data.data];
  //       setNoteBooks({
  //         data: newData,
  //         lastPageLoaded: data.page,
  //         totalPage: Math.ceil((data.numResults || 0) / (data.perPage || 10)),
  //         totalResults: data.numResults,
  //       });
  //       setIsRetrieving(false);
  //     } catch (err) {
  //       console.error(err);
  //       setIsRetrieving(false);
  //     }
  //   },
  //   [nodeBookState.searchByTitleOnly, notebooks.data]
  // );

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
          page: page,
          onlyTitle: nodeBookState.searchByTitleOnly,
        });
        const newData = page === 1 ? data.data : [...pendingProposals.data, ...data.data];
        setPendingProposals({
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
    [nodeBookState.searchByTitleOnly, pendingProposals.data]
  );

  useEffect(() => {
    if (!inViewInfinityLoaderTrigger) return;
    if (isRetrieving) return;

    if (value === 0) {
      onSearch(searchResults.lastPageLoaded + 1, search, sortOption, sortDirection, nodeTypes);
    } else if (value === 1) {
      onSearchPendingProposals(pendingProposals.lastPageLoaded + 1, search);
      // onSearchNotebooks(notebooks.lastPageLoaded + 1, search);
    } /* else if (value === 2) {
      onSearchPendingProposals(pendingProposals.lastPageLoaded + 1, search);
    } */
  }, [
    inViewInfinityLoaderTrigger,
    isRetrieving,
    nodeTypes,
    onSearch,
    onSearchPendingProposals,
    pendingProposals.lastPageLoaded,
    refInfinityLoaderTrigger,
    search,
    searchResults.lastPageLoaded,
    sortDirection,
    sortOption,
    value,
  ]);

  useEffect(() => {
    if (value === 1) {
      onSearchPendingProposals(pendingProposals.lastPageLoaded + 1, search);
      // onSearchNotebooks(notebooks.lastPageLoaded + 1, search);
    }
  }, [onSearch]);

  // useEffect(() => {
  //   if (value === 2) {
  //     onSearchPendingProposals(pendingProposals.lastPageLoaded + 1, search);
  //   }
  // }, [onSearch]);

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
    notebookRef,
    onSearch,
    sortDirection,
    sortOption,
    value,
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
    notebookRef,
    setAllTags,
    showTagSelector,
  ]);

  // const a11yProps = (index: number) => {
  //   return {
  //     "aria-controls": `simple-tabpanel-${index}`,
  //   };
  // };
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

  const onChangeTimeFilter = useCallback((newTimeFilter: any) => {
    let timeFilter: number = 0;
    switch (newTimeFilter) {
      case "LAST_DAY":
        timeFilter = 1;
        break;
      case "LAST_15_DAYS":
        timeFilter = 15;
        break;
      case "LAST_30_DAYS":
        timeFilter = 30;
        break;
      case "LAST_QUARTER":
        timeFilter = 92;
        break;
      case "LAST_YEAR":
        timeFilter = 365;
        break;
    }
    setNodesUpdatedSince(timeFilter);
    setTimeFilter(newTimeFilter);
  }, []);

  const onChangeSortDirection = useCallback(
    (newSortDirection: SortDirection) => {
      setSortDirection(newSortDirection);
      if (value === 0) {
        onSearch(1, search, sortOption, newSortDirection, nodeTypes);
      }
    },
    [nodeTypes, onSearch, search, sortOption, value]
  );

  const onSearchEnter = useCallback(
    (event: any) => {
      if (event.charCode === 13) {
        if (value === 0) {
          onSearch(1, search, sortOption, sortDirection, nodeTypes);
        } else if (value === 1) {
          // onSearchNotebooks(1, search);
          onSearchPendingProposals(1, search);
        } /* else if (value === 2) {
          onSearchPendingProposals(1, search);
        } */
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
  //   // setOnlyTags(true);
  //   // setAllTags(oldAllTags => {
  //   //   return { ...oldAllTags, [tag.node]: { ...oldAllTags[tag.node], checked: true } };
  //   // });
  //   // setChosenTags([tag.node]);
  // }, []);

  // const setNodesUpdatedSinceClick = useCallback((event: any) => setNodesUpdatedSince(event.target.value), []);

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

  const onUnselectAll = useCallback(() => {
    setNodeTypes([]);
    if (value === 0) {
      onSearch(1, search, sortOption, sortDirection, []);
    }
  }, [onSearch, search, sortDirection, sortOption]);

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

    // notebooks,
  ]);

  const setChosenTagsCallback = useCallback(
    (newChosenTags: ChosenTag[]) => {
      setChosenTags(newChosenTags);
    },
    [setChosenTags]
  );

  const closeTagSelector = useCallback(() => {
    notebookRef.current.chosenNode = null;
    notebookRef.current.choosingNode = null;
    nodeBookDispatch({ type: "setChosenNode", payload: null });
    nodeBookDispatch({ type: "setChoosingNode", payload: null });
    setShowTagSelector(false);
  }, [nodeBookDispatch]);

  // const handleTabValueChange = (event: React.SyntheticEvent, newValue: number) => {
  //   setValue(newValue);
  // };

  const results = useMemo(() => {
    if (value === 0) {
      return searchResults.totalResults;
    } else if (value === 1) {
      // return notebooks.totalResults;
      return pendingProposals.totalResults;
    } /* else {
      return pendingProposals.totalResults;
    } */
  }, [value, searchResults.totalResults, pendingProposals.totalResults]);

  const bookmarkedNodes = useCallback(async () => {
    const userNodesRef = collection(db, "userNodes");
    const bookmarkNodeQ = query(
      userNodesRef,
      where("user", "==", user.uname),
      where("bookmarked", "==", true),
      where("deleted", "==", false)
    );

    const bookmarkSnapshot = await getDocs(bookmarkNodeQ);
    const bookmarksUserNodes: { [nodeId: string]: any } = {};
    const bookmarksNodeIds: string[] = [];

    bookmarkSnapshot.docs.map(cur => {
      bookmarksNodeIds.push(cur.data().node);
      bookmarksUserNodes[cur.data().node] = {
        uNodeData: cur.data() as UserNodeFirestore,
      };
    });

    const bookmarksNodesData = await getNodesPromises(db, bookmarksNodeIds);
    const fullNodes = buildFullNodes(bookmarksUserNodes, bookmarksNodesData) as any;
    const bookmarkedNodes = fullNodes.map((cur: any) => {
      const bookmark = {
        id: cur.node,
        nodeType: cur.nodeType,
        title: cur.title,
        corrects: cur.corrects,
        wrongs: cur.wrongs,
        changedAt: cur.changedAt,
      };
      return bookmark;
    });
    return bookmarkedNodes;
  }, [open]);

  const searcherOptionsMemoized = useMemo(() => {
    return (
      <Box>
        <Box
          id="searcher-sidebar-options"
          sx={{
            marginTop: "8px",
            p: {
              xs: "10px",
              sm: innerHeight && innerHeight < 600 ? "20px 10px 10px 10px" : "0px 15px 10px 15px",
            },
            borderBottom: 1,
            borderColor: theme =>
              theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG700 : DESIGN_SYSTEM_COLORS.gray200,
            width: "100%",
          }}
        >
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
          </Box>

          {((isMovil && !showTagSelector) || !isMovil) && (
            <>
              <Box id="search-input">
                <ValidatedInput
                  identification="SearchQuery"
                  name="SearchQuery"
                  type="text"
                  placeholder={"Nodes Search"}
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
                          <MenuItem sx={{ display: "flex", justifyContent: "center" }}>
                            <Button
                              disabled={!nodeTypes.length}
                              variant="contained"
                              fullWidth
                              onClick={() => onUnselectAll()}
                            >
                              Unselect All
                            </Button>
                          </MenuItem>
                        </Select>
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end" disablePointerEvents={disableSearchIcon}>
                        <Stack direction={"row"} spacing={"10px"}>
                          {search && (
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
                          )}
                          <IconButton
                            id="SearchIcon"
                            onClick={() => {
                              if (value === 0) {
                                onSearch(1, search, sortOption, sortDirection, nodeTypes);
                              } else if (value === 1) {
                                onSearchPendingProposals(1, search);
                                // onSearchNotebooks(1, search);
                              } /* else if (value === 2) {
                                onSearchPendingProposals(1, search);
                              } */
                            }}
                            sx={{
                              padding: {
                                xs: "5px !important",
                                sm: "10px 10px 10px 0px",
                              },
                              marginRight: {
                                xs: "-11px !important",
                                sm: "-8px",
                              },
                              marginLeft: "0px!important",
                              ":hover": {
                                background: "transparent!important",
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
                        </Stack>
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
                        theme.palette.mode === "dark" ? theme.palette.common.notebookG500 : "#D0D5DD",
                      borderRadius: "4px",
                    },
                  }}
                />
              </Box>
              <Stack
                id="nodesUpdatedSinceContainer"
                direction={"row"}
                spacing={"4px"}
                alignItems={"center"}
                sx={{
                  mt: "13px",
                  mb: "13px",
                }}
              >
                <RecentNodesList
                  id={"search-sort-options"}
                  // recentNodes={searchResults}
                  // setRecentNodes={setSearchResults}
                  // onlyTags={onlyTags}
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
                  id="SearchResultsNum"
                >
                  {shortenNumber(results, 2, false)} Results
                </Box>
              </Stack>
            </>
          )}
          {!isMovil && showTagSelector && (
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
                height={"450px"}
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
              height="235px"
              multiple
            />
          )}
        </Box>
        {/* <Box
          sx={{
            borderBottom: 1,
            borderColor: theme => (theme.palette.mode === "dark" ? "black" : "divider"),
            width: "100%",
          }}
        > */}
        {/* <Tabs value={value} onChange={handleTabValueChange} aria-label={"Search Sidebar Tabs"} variant="fullWidth">
            // {[{ title: "Nodes" }, { title: "Proposals" }].map(
              // (tabItem: any, idx: number) => (
              //   <Tab
              //     key={tabItem.title}
              //     id={`bookmarks-tab-${tabItem.title.toLowerCase()}`}
              //     label={tabItem.title}
              //     {...a11yProps(idx)}
              //     sx={{ py: "20px" }}
              //   />
              // )
            //</Box>)}
          </Tabs> */}
        {/* </Box> */}
      </Box>
    );
  }, [
    innerHeight,
    isMovil,
    viewTagsInMovil,
    selectedTags,
    disableSearcher,
    setShowTagSelectorClick,
    showTagSelector,
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
    timeFilter,
    onChangeTimeFilter,
    sidebarWidth,
    results,
    closeTagSelector,
    chosenTags,
    allTags,
    setAllTags,
    setChosenTagsCallback,
    value,
    deleteChip,
    onSearch,
    onSearchPendingProposals,
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
      sxContentWrapper={{
        height: "100%",
        minHeight: "calc(100% - 60px)",
        overflowX: "auto",
        overflowY: "auto",
      }}
      SidebarContent={
        <Box>
          {value === 0 && (
            <Box id="search-list" sx={{ p: "6px" }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {!isRetrieving && searchResults.data.length === 0 && (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      marginTop: "25%",
                    }}
                  >
                    <Box sx={{ width: { xs: "250px", sm: "300" }, height: { xs: "250px", sm: "300" } }}>
                      <RiveComponentMemoized
                        src="./rive-notebook/search-engine.riv"
                        artboard="New Artboard"
                        animations="Timeline 1"
                        autoplay={true}
                      />
                    </Box>
                    <Typography
                      sx={{
                        fontSize: "18px",
                        lineHeight: "24px",
                        width: "300px",
                        fontWeight: "500",
                        textAlign: "center",
                        marginTop: "10px",
                      }}
                    >
                      Looking for something specific?
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: "13px",
                        lineHeight: "24px",
                        width: "300px",
                        fontWeight: "400",
                        textAlign: "center",
                        marginTop: "10px",
                        color: theme => (theme.palette.mode === "dark" ? "#AEAEAE" : theme.palette.common.gray700),
                      }}
                    >
                      Add tags, select type, or simply enter a keyword and we will find all relevant nodes for you.
                    </Typography>
                  </Box>
                )}
                {searchResults.data.map(resNode => (
                  <SidebarNodeLink
                    key={resNode.id}
                    onClick={() => openLinkedNode(resNode.id, "Searcher")}
                    linkMessage={"Open"}
                    {...resNode}
                    sx={{
                      borderLeft: "studied" in resNode && resNode.studied ? "solid 6px #fdc473" : " solid 6px #fd7373",
                    }}
                  />
                ))}
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
            {/* INFO: I commented this while we develop the endpoints */}
            {/* {value === 1 && (
              <Box>
                {notebooks.data.map((notebook: any, idx: number) => (
                  <Box
                    key={`notebook-${idx}`}
                    sx={{
                      width: "98%",
                      height: "238px",
                      border: theme => (theme.palette.mode === "dark" ? "solid 1px #2F2F2F" : "solid 1px #D0D5DD"),
                      borderRadius: "8px",
                      background: theme => (theme.palette.mode === "dark" ? "#1F1F1F" : theme.palette.common.gray100),
                      marginBottom: "10px",
                      marginX: "auto",
                    }}
                  >
                    <Box
                      sx={{
                        height: "172px",
                      }}
                    >
                      <NextImage
                        src={theme.palette.mode === "dark" ? NotebookDarkImage.src : NotebookLightImage.src}
                        width={"455px"}
                        height={"172px"}
                      />
                    </Box>
                    <Stack paddingX={"15px"} mt={"7px"} direction={"row"} spacing={"10px"} alignItems={"center"}>
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
                        >
                          {notebook.createdAt
                            ? `Edited in ${dayjs(new Date(notebook.createdAt)).fromNow()}`
                            : `Edited in 3 months ago`}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                ))}
                {!isRetrieving && notebooks.lastPageLoaded < notebooks.totalPage && (
                  <Box id="ContinueButton" ref={refInfinityLoaderTrigger}></Box>
                )}
              </Box>
            )} */}
            {/* {value === 2 && ( */}
            {value === 1 && (
              <Box>
                <PendingProposalList proposals={pendingProposals.data} openLinkedNode={openLinkedNode} />
                {!isRetrieving && pendingProposals.lastPageLoaded < pendingProposals.totalPage && (
                  <Box id="ContinueButton" ref={refInfinityLoaderTrigger}></Box>
                )}
              </Box>
            )}
            {isRetrieving && (value === 1 || value === 2) && (
              <Box sx={{ py: "10px", display: "flex", justifyContent: "center" }}>
                <CircularProgress />
              </Box>
            )}
          </Box>
        </Box>
      }
    />
  );
};
export const MemoizedSearcherSidebar = React.memo(SearcherSidebar);
