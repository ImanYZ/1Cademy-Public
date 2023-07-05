import ControlPointIcon from "@mui/icons-material/ControlPoint";
import { Chip, CircularProgress, Stack, Typography } from "@mui/material";
import { Box } from "@mui/system";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { getFirestore } from "firebase/firestore";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getNodes } from "src/client/firestore/nodes.firestore";
import { getRecentUserNodesByUser } from "src/client/firestore/recentUserNodes.firestore";
import { SearchNodesResponse } from "src/knowledgeTypes";
import { FullNodeData, SortDirection, SortValues } from "src/nodeBookTypes";
import { NodeType, SimpleNode2 } from "src/types";

import { ChosenTag, MemoizedTagsSearcher, TagTreeView } from "@/components/TagsSearcher";
import { useInView } from "@/hooks/useObserver";
import { useTagsTreeView } from "@/hooks/useTagsTreeView";
import { Post } from "@/lib/mapApi";
import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";
import { mapNodeToSimpleNode } from "@/lib/utils/maps.utils";

import shortenNumber from "../../../../lib/utils/shortenNumber";
import RecentNodesList from "../../RecentNodesList";
import TimeFilter from "../../TimeFilter";
import { SearchInput } from "../SearchInput";
import { SidebarNodeLink } from "../SidebarNodeLink";
import { NODE_TYPES_ARRAY, Pagination } from "./SearcherSidebar";
import { SidebarWrapper2 } from "./SidebarWrapper2";

dayjs.extend(relativeTime);

type TagsSidebarProps = {
  username: string;
  open: boolean;
  onClose: () => void;
  onChangeChosenNode: ({ nodeId, title }: { nodeId: string; title: string }) => void;
  preLoadNodes: (nodeIds: string[], fullNodes: FullNodeData[]) => Promise<void>;
};

const TagsSidebar = ({ username, open, onClose, onChangeChosenNode, preLoadNodes }: TagsSidebarProps) => {
  const db = getFirestore();
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [showTagSelector, setShowTagSelector] = useState(false);
  const [chosenTags, setChosenTags] = useState<ChosenTag[]>([]);
  const [timeFilter, setTimeFilter] = useState<string>("ALL_TIME");
  const [sortOption, setSortOption] = useState<SortValues>("NOT_SELECTED");
  const [sortDirection, setSortDirection] = useState<SortDirection>("DESCENDING");
  const [nodeTypes, setNodeTypes] = useState(NODE_TYPES_ARRAY);
  const [searchResults, setSearchResults] = useState<Pagination>(INITIAL_SEARCH_RESULT);

  const { allTags, setAllTags, resetSelectedTags } = useTagsTreeView();
  const { ref: refInfinityLoaderTrigger, inView: inViewInfinityLoaderTrigger } = useInView();
  const previousOpenRef = useRef(false);

  const selectedTags = useMemo<TagTreeView[]>(() => Object.values(allTags).filter(tag => tag.checked), [allTags]);

  const onGetTheMostUsedNodes = useCallback(async () => {
    setIsLoading(true);
    const nodeIds = await getRecentUserNodesByUser(db, username);
    const uniqueNodesIds = Array.from(new Set(nodeIds));
    const nodes = await getNodes(db, uniqueNodesIds);
    const newMostUsedNodes = nodes.flatMap(c => c || []).map((cur): SimpleNode2 => mapNodeToSimpleNode(cur, username));

    setSearchResults({
      data: newMostUsedNodes,
      lastPageLoaded: 1,
      totalPage: 1,
      totalResults: newMostUsedNodes.length,
    });
    setIsLoading(false);
  }, [db, username]);

  const onSearchQuery = useCallback(
    async ({
      q,
      sortOption,
      sortDirection,
      nodesUpdatedSince,
      nodeTypes,
      page = 1,
    }: {
      q: string;
      sortOption: SortValues;
      sortDirection: SortDirection;
      nodesUpdatedSince: number;
      nodeTypes: NodeType[];
      page?: number;
    }) => {
      console.log(" -> SEARCH");
      setIsLoading(true);
      if (page < 2) setSearchResults(INITIAL_SEARCH_RESULT);
      const res = await Post<SearchNodesResponse>("/searchNodesInNotebook", {
        q,
        nodeTypes,
        tags: selectedTags.map(c => c.title),
        nodesUpdatedSince,
        sortOption: !sortOption ? "NOT_SELECTED" : sortOption,
        sortDirection,
        page,
        onlyTitle: false,
      });
      setSearchResults(prev => ({
        data: prev.lastPageLoaded === 1 ? res.data : [...prev.data, ...res.data],
        lastPageLoaded: res.page,
        totalPage: Math.ceil((res.numResults || 0) / (res.perPage || 10)),
        totalResults: res.numResults,
      }));
      setIsLoading(false);
      preLoadNodes(
        res.data.map(c => c.id),
        []
      );
    },
    [preLoadNodes, selectedTags]
  );

  const onChangeSortDirection = useCallback(
    (newSortDirection: SortDirection) => {
      setSortDirection(newSortDirection);
      onSearchQuery({
        q: query,
        sortOption,
        sortDirection: newSortDirection,
        nodeTypes,
        nodesUpdatedSince: mapTimeFilterToDays(timeFilter),
      });
    },
    [nodeTypes, onSearchQuery, query, sortOption, timeFilter]
  );

  const onChangeSortOptions = useCallback(
    (newSortOption: SortValues) => {
      setSortOption(newSortOption);
      onSearchQuery({
        q: query,
        sortOption: newSortOption,
        sortDirection,
        nodeTypes,
        nodesUpdatedSince: mapTimeFilterToDays(timeFilter),
      });
    },
    [nodeTypes, onSearchQuery, query, sortDirection, timeFilter]
  );

  const onChangeTimeFilter = useCallback(
    (newTimeFilter: string) => {
      setTimeFilter(newTimeFilter);
      onSearchQuery({
        q: query,
        sortOption,
        sortDirection,
        nodeTypes,
        nodesUpdatedSince: mapTimeFilterToDays(newTimeFilter),
      });
    },
    [nodeTypes, onSearchQuery, query, sortDirection, sortOption]
  );

  const onChangeNodeType = useCallback(
    (newNodeTypes: NodeType[]) => {
      console.log("onChangeNodeType:", { newNodeTypes });
      setNodeTypes(newNodeTypes);
      onSearchQuery({
        q: query,
        sortOption,
        sortDirection,
        nodeTypes: newNodeTypes,
        nodesUpdatedSince: mapTimeFilterToDays(timeFilter),
      });
    },
    [onSearchQuery, query, sortDirection, sortOption, timeFilter]
  );

  const references = useMemo(() => {
    return searchResults.data;
  }, [searchResults.data]);

  const sidebarOptionsMemo = useMemo(
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
              handleSearch={() =>
                onSearchQuery({
                  q: query,
                  sortOption,
                  sortDirection,
                  nodeTypes,
                  nodesUpdatedSince: mapTimeFilterToDays(timeFilter),
                })
              }
              placeholder="Nodes search"
              nodeTypeProps={{ value: nodeTypes, onChange: onChangeNodeType }}
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
                <TimeFilter id="search-filter-options" timeFilter={timeFilter} setTimeFilter={onChangeTimeFilter} />
              </Stack>
              <Box>{shortenNumber(searchResults.totalResults, 2, false)} Results</Box>
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
      nodeTypes,
      onChangeNodeType,
      onChangeSortDirection,
      onChangeSortOptions,
      onChangeTimeFilter,
      onSearchQuery,
      query,
      searchResults.totalResults,
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
          <SidebarNodeLink
            key={cur.id}
            onClick={() => {
              onChangeChosenNode({ nodeId: cur.id, title: cur.title });
            }}
            linkMessage="Tag it"
            {...cur}
          />
        ))}
        <Box sx={{ py: "10px", display: "flex", justifyContent: "center" }}>
          {isLoading && <CircularProgress />}
          {!isLoading && searchResults.lastPageLoaded < searchResults.totalPage && (
            <Box id="ContinueButton" ref={refInfinityLoaderTrigger}></Box>
          )}
        </Box>
      </Stack>
    ),
    [
      isLoading,
      onChangeChosenNode,
      refInfinityLoaderTrigger,
      references,
      searchResults.lastPageLoaded,
      searchResults.totalPage,
    ]
  );

  useEffect(() => {
    if (!inViewInfinityLoaderTrigger) return;
    if (isLoading) return;
    onSearchQuery({
      q: query,
      sortOption,
      sortDirection,
      nodeTypes,
      nodesUpdatedSince: mapTimeFilterToDays(timeFilter),
      page: searchResults.lastPageLoaded + 1,
    });
  }, [
    inViewInfinityLoaderTrigger,
    isLoading,
    nodeTypes,
    onSearchQuery,
    query,
    searchResults.lastPageLoaded,
    sortDirection,
    sortOption,
    timeFilter,
  ]);

  useEffect(() => {
    if (open === previousOpenRef.current) return;

    previousOpenRef.current = open;
    if (!open) return;

    setSearchResults(INITIAL_SEARCH_RESULT);
    setIsLoading(false);
    setQuery("");
    resetSelectedTags();
    onGetTheMostUsedNodes();
  }, [onGetTheMostUsedNodes, onSearchQuery, open, resetSelectedTags]);

  return (
    <SidebarWrapper2
      id="tags-sidebar-wrapper"
      title="Tags to link"
      open={open}
      onClose={onClose}
      SidebarOptions={sidebarOptionsMemo}
      SidebarContent={sidebarContentMemo}
      sx={{ boxShadow: "none" }}
      sxContentWrapper={{
        overflowX: "auto",
        overflowY: "auto",
      }}
    />
  );
};

export const TagsSidebarMemoized = React.memo(TagsSidebar);

const mapTimeFilterToDays = (timeFilter: string): number => {
  if (timeFilter === "LAST_DAY") return 1;
  if (timeFilter === "LAST_15_DAYS") return 15;
  if (timeFilter === "LAST_30_DAYS") return 30;
  if (timeFilter === "LAST_QUARTER") return 92;
  if (timeFilter === "LAST_YEAR") return 365;
  return 1000;
};

const INITIAL_SEARCH_RESULT: Pagination = {
  data: [],
  lastPageLoaded: 0,
  totalPage: 0,
  totalResults: 0,
};
