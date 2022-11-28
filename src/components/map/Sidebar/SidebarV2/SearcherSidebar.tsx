import CloseIcon from "@mui/icons-material/Close";
import ControlPointIcon from "@mui/icons-material/ControlPoint";
import CreateIcon from "@mui/icons-material/Create";
import DoneIcon from "@mui/icons-material/Done";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
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
  TextField,
  useMediaQuery,
} from "@mui/material";
import { Box } from "@mui/system";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import React, { useCallback, useEffect, useMemo, useState, useTransition } from "react";

import searcherHeaderImage from "../../../../../public/Magnifier_Compas.jpg";
import { useNodeBook } from "../../../../context/NodeBookContext";
import { useTagsTreeView } from "../../../../hooks/useTagsTreeView";
import { SearchNodesResponse } from "../../../../knowledgeTypes";
import { Post } from "../../../../lib/mapApi";
import shortenNumber from "../../../../lib/utils/shortenNumber";
import { SortDirection, SortValues } from "../../../../nodeBookTypes";
import { NodeType } from "../../../../types";
import { Editor } from "../../../Editor";
import NodeTypeIcon from "../../../NodeTypeIcon2";
import { ChosenTag, MemoizedTagsSearcher, TagTreeView } from "../../../TagsSearcher";
import { MemoizedMetaButton } from "../../MetaButton";
import Modal from "../../Modal/Modal";
import RecentNodesList from "../../RecentNodesList";
import ValidatedInput from "../../ValidatedInput";
import { SidebarWrapper } from "./SidebarWrapper";

const doNothing = () => {};

dayjs.extend(relativeTime);

type SearcherSidebarProps = { openLinkedNode: any; open: boolean; onClose: () => void; innerHeight?: number };

type Pagination = {
  data: any[];
  lastPageLoaded: number;
  totalPage: number;
  totalResults: number;
};

const NODE_TYPES_ARRAY: NodeType[] = ["Concept", "Code", "Reference", "Relation", "Question", "Idea"];
const MAX_TAGS_IN_MOBILE = 2;

const SearcherSidebar = ({ openLinkedNode, open, onClose, innerHeight }: SearcherSidebarProps) => {
  const { nodeBookState, nodeBookDispatch } = useNodeBook();
  const { allTags, setAllTags } = useTagsTreeView();

  const [nodesUpdatedSince, setNodesUpdatedSince] = useState(1000);
  const [isRetrieving, setIsRetrieving] = useState(false);
  const [onlyTags /*setOnlyTags*/] = useState(true);
  const [showTagSelector, setShowTagSelector] = useState(false);
  const [nodeTypes, setNodeTypes] = useState(NODE_TYPES_ARRAY);
  const [sortOption, setSortOption] = useState<SortValues>("NOT_SELECTED");
  const [sortDirection, setSortDirection] = useState<SortDirection>("DESCENDING");
  const [chosenTags, setChosenTags] = useState<ChosenTag[]>([]);
  const [search, setSearch] = useState<string>(nodeBookState.searchQuery);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isPending, startTransition] = useTransition();

  const isMovil = useMediaQuery("(max-width:899px)");

  const [searchResults, setSearchResults] = useState<Pagination>({
    data: [],
    lastPageLoaded: 0,
    totalPage: 0,
    totalResults: 0,
  });

  const onFocusSearcherInput = useCallback(
    (inputTitle: HTMLElement) => {
      if (!open) return;
      if (!inputTitle) return;
      inputTitle.focus();
    },
    [open]
  );

  const selectedTags = useMemo<TagTreeView[]>(() => Object.values(allTags).filter(tag => tag.checked), [allTags]);
  const viewTagsInMovil = useMemo<TagTreeView[]>(() => selectedTags.slice(0, MAX_TAGS_IN_MOBILE), [selectedTags]);

  const onSearch = useCallback(
    async (page: number, q: string, sortOption: SortValues, sortDirection: SortDirection, nodeTypes: NodeType[]) => {
      try {
        setIsRetrieving(true);
        setSearchResults({
          data: [],
          lastPageLoaded: 0,
          totalPage: 0,
          totalResults: 0,
        });
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
        // };
        setIsRetrieving(false);
      } catch (err) {
        console.error(err);
        setIsRetrieving(false);
      }
    },
    [selectedTags, nodesUpdatedSince, nodeBookState.searchByTitleOnly, searchResults.data]
  );

  useEffect(() => {
    if (nodeBookState.searchQuery && nodeBookState.nodeTitleBlured) {
      setSearch(nodeBookState.searchQuery);
      onSearch(1, nodeBookState.searchQuery, sortOption, sortDirection, nodeTypes);
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

    nodeBookDispatch({ type: "setChosenNode", payload: null });
  }, [
    allTags,
    nodeBookDispatch,
    nodeBookState.choosingNode?.id,
    nodeBookState.chosenNode,
    setAllTags,
    showTagSelector,
  ]);

  const handleChange = useCallback(
    (event: any) => {
      let val = event.target.value;
      setSearch(val);
      startTransition(() => {
        nodeBookDispatch({ type: "setSearchQuery", payload: val });
      });
    },
    [nodeBookDispatch, setSearch]
  );

  const onChangeSortOptions = useCallback(
    (newSortOption: SortValues) => {
      setSortOption(newSortOption);
      onSearch(1, search, newSortOption, sortDirection, nodeTypes);
    },
    [nodeTypes, onSearch, search, sortDirection]
  );

  const onChangeSortDirection = useCallback(
    (newSortDirection: SortDirection) => {
      setSortDirection(newSortDirection);
      onSearch(1, search, sortOption, newSortDirection, nodeTypes);
    },
    [nodeTypes, onSearch, search, sortOption]
  );

  const onSearchEnter = useCallback(
    (event: any) => {
      if (event.charCode === 13) {
        onSearch(1, search, sortOption, sortDirection, nodeTypes);
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
      nodeBookDispatch({ type: "setChoosingNode", payload: chosingNodePayload });
      return !prevValue;
    });
  }, [nodeBookDispatch]);

  const onChangeNoteType = useCallback(
    (event: SelectChangeEvent<string[]>) => {
      const newNodeTypes = event.target.value as NodeType[];
      setNodeTypes(newNodeTypes);
      onSearch(1, search, sortOption, sortDirection, newNodeTypes);
    },
    [onSearch, search, sortDirection, sortOption]
  );

  const contentSignalState = useMemo(() => {
    return { updated: true };
  }, [isRetrieving, searchResults]);

  const setChosenTagsCallback = useCallback(
    (newChosenTags: ChosenTag[]) => {
      setChosenTags(newChosenTags);
    },
    [setChosenTags]
  );

  const searcherOptionsMemoized = useMemo(() => {
    return (
      <Box
        sx={{
          p: "10px",
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
            rowGap: "2px",
            marginTop: { xs: "8px", sm: "8px" },
            marginBottom: { xs: "8px", sm: "8px" },
            pr: "40px",
          }}
        >
          <span className="tagText">Tags: </span>
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
            onClick={setShowTagSelectorClick}
            sx={{ zIndex: 1, transform: showTagSelector ? "rotate(45deg)" : "rotate(0deg)", cursor: "pointer" }}
          />

          {/* {onlyTags ? (
              ""
            ) : (
              <span className="tagText recoverDefaultTags" onClick={setRecoverDefaultTags}>
                Recover Default Tag(s)
              </span>
            )} */}
        </Box>

        {((isMovil && !showTagSelector) || !isMovil) && (
          <>
            <div id="SearchQueryContainer">
              <ValidatedInput
                identification="SearchQuery"
                name="SearchQuery"
                type="text"
                onChange={handleChange}
                value={search}
                onKeyPress={onSearchEnter}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Select
                        multiple
                        MenuProps={{ id: "nodeSelectMenu" }}
                        value={nodeTypes}
                        variant="outlined"
                        displayEmpty
                        renderValue={() => "Types"}
                        onChange={onChangeNoteType}
                        sx={{
                          height: "46.31px",
                          marginLeft: "-14px",
                          zIndex: "99",
                        }}
                      >
                        {NODE_TYPES_ARRAY.map(nodeType => (
                          <MenuItem className="searchSelect" key={nodeType} value={nodeType} id="nodeTypesSelect">
                            <Checkbox
                              className={"searchCheckbox " + (nodeTypes.includes(nodeType) ? "selected" : "")}
                              checked={nodeTypes.includes(nodeType)}
                            />
                            <ListItemIcon>
                              <NodeTypeIcon
                                className={"searchIcon " + (nodeTypes.includes(nodeType) ? "selected" : "")}
                                nodeType={nodeType}
                              />
                            </ListItemIcon>
                            <ListItemText
                              className={nodeTypes.includes(nodeType) ? "selected" : ""}
                              primary={nodeType}
                            />
                          </MenuItem>
                        ))}
                      </Select>
                      <Divider orientation="vertical" id="searchDivider" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        id="SearchIcon"
                        onClick={() => onSearch(1, search, sortOption, sortDirection, nodeTypes)}
                      >
                        <SearchIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                  inputRef: onFocusSearcherInput,
                }}
                inputProps={{
                  style: { paddingLeft: "0", paddingRight: "0" },
                }}
              />
            </div>

            <div
              id="nodesUpdatedSinceContainer"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "14px",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: "5px" }}>
                Edited in past
                <TextField
                  type="number"
                  defaultValue={nodesUpdatedSince}
                  onChange={setNodesUpdatedSinceClick}
                  size="small"
                  sx={{ width: "76px", p: "0px" }}
                  inputProps={{ style: { padding: "4px 8px" } }}
                />
                days
              </Box>
              <div id="SearchResutlsNum">{shortenNumber(searchResults.totalResults, 2, false)} Results</div>
              <RecentNodesList
                id="recentNodesList"
                recentNodes={searchResults}
                setRecentNodes={setSearchResults}
                onlyTags={onlyTags}
                sortOption={sortOption}
                setSortOption={onChangeSortOptions}
                sortDirection={sortDirection}
                setSortDirection={onChangeSortDirection}
              />
            </div>
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
    );
  }, [
    allTags,
    chosenTags,
    deleteChip,
    handleChange,
    isMovil,
    nodeTypes,
    nodesUpdatedSince,
    onChangeNoteType,
    onChangeSortDirection,
    onChangeSortOptions,
    onFocusSearcherInput,
    onSearch,
    onSearchEnter,
    onlyTags,
    search,
    searchResults,
    selectedTags,
    setAllTags,
    setChosenTagsCallback,
    setNodesUpdatedSinceClick,
    setShowTagSelectorClick,
    showTagSelector,
    sortDirection,
    sortOption,
    viewTagsInMovil,
  ]);

  return (
    <SidebarWrapper
      title="Search Nodes"
      headerImage={searcherHeaderImage}
      open={open}
      onClose={onClose}
      width={window.innerWidth > 899 ? 430 : window.innerWidth}
      height={window.innerWidth > 899 ? 100 : window.innerWidth > 375 ? 40 : 50}
      innerHeight={innerHeight}
      // anchor="right"
      SidebarOptions={searcherOptionsMemoized}
      contentSignalState={contentSignalState}
      SidebarContent={
        <Box sx={{ p: "2px 4px" }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {searchResults.data.map((resNode, idx) => {
              return (
                <Paper
                  elevation={3}
                  key={`resNode${idx}`}
                  onClick={() => openLinkedNode(resNode.id, "Searcher")}
                  sx={{
                    listStyle: "none",
                    padding: "10px",
                    borderLeft: "studied" in resNode && resNode.studied ? "solid 4px #fdc473" : " solid 4px #fd7373",
                    cursor: "pointer",
                  }}
                >
                  <div
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
                  </div>
                  <div className="SearchResultTitle">
                    {/* CHECK: here is causing problems to hide scroll */}
                    <Editor label="" readOnly={true} setValue={doNothing} value={resNode.title} />
                  </div>
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
            <Box id="ContinueButton" sx={{ display: "flex", justifyContent: "center" }}>
              <MemoizedMetaButton
                onClick={() => onSearch(searchResults.lastPageLoaded + 1, search, sortOption, sortDirection, nodeTypes)}
              >
                <>
                  <ExpandMoreIcon className="material-icons grey-text" />
                  <span>Older search results</span>
                  <ExpandMoreIcon className="material-icons grey-text" />
                </>
              </MemoizedMetaButton>
            </Box>
          )}
        </Box>
      }
    />
  );
};
export const MemoizedSearcherSidebar = React.memo(SearcherSidebar);
