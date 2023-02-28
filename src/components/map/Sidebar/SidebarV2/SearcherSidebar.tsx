import CloseIcon from "@mui/icons-material/Close";
import ControlPointIcon from "@mui/icons-material/ControlPoint";
import CreateIcon from "@mui/icons-material/Create";
import DoneIcon from "@mui/icons-material/Done";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import FilterListIcon from "@mui/icons-material/FilterList";
import SearchIcon from "@mui/icons-material/Search";
import {
  Checkbox,
  Chip,
  CircularProgress,
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
  useTheme,
} from "@mui/material";
import { Box } from "@mui/system";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import React, { MutableRefObject, useCallback, useEffect, useMemo, useState, useTransition } from "react";

import searcherHeaderImage from "../../../../../public/Magnifier_Compas.jpg";
import { useNodeBook } from "../../../../context/NodeBookContext";
import { useInView } from "../../../../hooks/useObserver";
import { useTagsTreeView } from "../../../../hooks/useTagsTreeView";
import { SearchNodesResponse } from "../../../../knowledgeTypes";
import { Post } from "../../../../lib/mapApi";
import shortenNumber from "../../../../lib/utils/shortenNumber";
import { SortDirection, SortValues, TNodeBookState } from "../../../../nodeBookTypes";
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
}: SearcherSidebarProps) => {
  const { nodeBookState, nodeBookDispatch } = useNodeBook();
  const { allTags, setAllTags } = useTagsTreeView();
  const theme = useTheme();
  const [nodesUpdatedSince, setNodesUpdatedSince] = useState(1000);
  const [isRetrieving, setIsRetrieving] = useState(false);
  const [onlyTags /*setOnlyTags*/] = useState(true);
  const [showTagSelector, setShowTagSelector] = useState(false);
  const [nodeTypes, setNodeTypes] = useState(NODE_TYPES_ARRAY);
  const [sortOption, setSortOption] = useState<SortValues>("NOT_SELECTED");
  const [sortDirection, setSortDirection] = useState<SortDirection>("DESCENDING");
  const [chosenTags, setChosenTags] = useState<ChosenTag[]>([]);
  const [search, setSearch] = useState<string>(nodeBookState.searchQuery);
  const [openSortOptions, setOpenSortOptions] = useState<boolean>(false);
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

  console.log("enableElements", enableElements);

  // tutorial constants
  const disableInputSearcher = disableSearcher && !enableElements.includes("search-input");
  const disableSearchIcon = disableSearcher && !enableElements.includes("SearchIcon");
  const disableEditedInThePast = disableSearcher && !enableElements.includes("search-recently-input");
  const disableRecentNodeList = disableSearcher && !enableElements.includes("recentNodesList");
  const disableSearchItem = disableSearcher && !enableElements.includes("search-item");

  console.log({ disableSearchList: disableSearchItem });

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
    if (!inViewInfinityLoaderTrigger) return;
    if (isRetrieving) return;

    onSearch(searchResults.lastPageLoaded + 1, search, sortOption, sortDirection, nodeTypes);
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

  const onFocusSearcherInput = useCallback(
    (inputTitle: HTMLElement) => {
      if (!open) return;
      if (!inputTitle) return;
      //inputTitle.focus();
    },
    [open]
  );

  const viewTagsInMovil = useMemo<TagTreeView[]>(() => selectedTags.slice(0, MAX_TAGS_IN_MOBILE), [selectedTags]);

  useEffect(() => {
    if (nodeBookState.searchQuery && nodeBookState.nodeTitleBlured) {
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
      notebookRef.current.choosingNode = chosingNodePayload;
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
  }, [isRetrieving, searchResults, JSON.stringify(enableElements), disableSearcher]);

  const setChosenTagsCallback = useCallback(
    (newChosenTags: ChosenTag[]) => {
      setChosenTags(newChosenTags);
    },
    [setChosenTags]
  );

  const searcherOptionsMemoized = useMemo(() => {
    return (
      <Box
        id="searcher-sidebar-options"
        sx={{
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
            id="searcher-tags-button"
            onClick={disableSearcher ? undefined : setShowTagSelectorClick}
            sx={{
              zIndex: 1,
              transform: showTagSelector ? "rotate(45deg)" : "rotate(0deg)",
              cursor: disableSearcher ? "not-allowed" : "pointer",

              color: "rgba(88, 88, 88,1)",
              fontWeight: "none",
            }}
          />

          <FilterListIcon
            onClick={() => setOpenSortOptions(!openSortOptions)}
            sx={{
              display: theme => (innerWidth < theme.breakpoints.values.sm ? "block" : "none"),
              zIndex: 1,
              cursor: "pointer",
              color: "rgba(88, 88, 88,1)",
              fontWeight: "none",
            }}
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
                        MenuProps={{ id: "nodeSelectMenu" }}
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
                          borderRadius: "32px 0 0 32px ",
                          background: theme =>
                            theme.palette.mode === "dark"
                              ? theme.palette.common.darkBackground1
                              : theme.palette.common.lightBackground1,

                          ":hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: theme => theme.palette.common.orange,
                          },
                          "&> fieldset": {
                            borderWidth: "1px",
                            borderRadius: "32px 0 0 32px ",
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
                              fontSize: "12px",
                            }}
                          >
                            <Checkbox
                              // className={"searchCheckbox " + (nodeTypes.includes(nodeType) ? "selected" : "")}
                              checked={nodeTypes.includes(nodeType)}
                              // sx={{}}
                            />
                            <ListItemIcon>
                              <NodeTypeIcon
                                // className={nodeTypes.includes(nodeType) ? "selected" : ""}
                                nodeType={nodeType}
                              />
                            </ListItemIcon>
                            <ListItemText
                              // className={nodeTypes.includes(nodeType) ? "selected" : ""}
                              primary={nodeType}
                              sx={{ fontSize: "12px" }}
                            />
                          </MenuItem>
                        ))}
                      </Select>
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end" disablePointerEvents={disableSearchIcon}>
                      <IconButton
                        id="SearchIcon"
                        onClick={() => onSearch(1, search, sortOption, sortDirection, nodeTypes)}
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
                    borderColor: "rgba(88, 88, 88,.7)",
                    borderRadius: "32px",
                  },
                }}
              />
            </Box>
            <div
              id="nodesUpdatedSinceContainer"
              style={{
                display: innerWidth > theme.breakpoints.values.sm || openSortOptions ? "flex" : "none",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: innerWidth > 410 ? "14px" : "11px",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <RecentNodesList
                id="recentNodesList"
                recentNodes={searchResults}
                setRecentNodes={setSearchResults}
                onlyTags={onlyTags}
                disabled={disableRecentNodeList}
                sortOption={sortOption}
                setSortOption={onChangeSortOptions}
                sortDirection={sortDirection}
                setSortDirection={onChangeSortDirection}
              />
              <Box id="search-recently-input" sx={{ display: "flex", alignItems: "center", gap: "5px" }}>
                Edited in past
                <TextField
                  type="number"
                  defaultValue={nodesUpdatedSince}
                  onChange={setNodesUpdatedSinceClick}
                  size="small"
                  disabled={disableEditedInThePast}
                  sx={{
                    width: "76px",
                    p: "0px",
                    "& fieldset": {
                      borderWidth: 1,
                      borderRadius: "16px",
                      borderColor: "rgba(88, 88, 88,.7)",
                    },
                    "&:hover": {
                      borderColor: "red",
                    },
                  }}
                  inputProps={{ style: { padding: "4px 8px" } }}
                  variant="outlined"
                />
                days
              </Box>
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
    openSortOptions,
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
  ]);

  return (
    <SidebarWrapper
      id="sidebar-wrapper-searcher"
      title="Search Nodes"
      headerImage={searcherHeaderImage}
      open={open}
      onClose={onClose}
      width={sidebarWidth}
      height={innerWidth >= theme.breakpoints.values.sm ? 100 : 25}
      innerHeight={innerHeight}
      // anchor="right"
      SidebarOptions={searcherOptionsMemoized}
      contentSignalState={contentSignalState}
      disabled={disableSearcher}
      SidebarContent={
        <Box id="search-list" sx={{ p: "2px 4px" }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {searchResults.data.map((resNode, idx) => {
              return (
                <Paper
                  elevation={3}
                  key={`resNode${idx}`}
                  onClick={
                    disableSearchItem
                      ? () => {
                          console.log("calling Openlinked true");
                        }
                      : () => {
                          console.log("calling Openlinked");
                          openLinkedNode(resNode.id, "Searcher");
                        }
                  }
                  sx={{
                    listStyle: "none",
                    padding: {
                      xs: "5px 10px",
                      sm: "10px",
                    },
                    borderLeft: "studied" in resNode && resNode.studied ? "solid 4px #fdc473" : " solid 4px #fd7373",
                    cursor: disableSearchItem ? "not-allowed" : "pointer",
                    opacity: disableSearchItem ? "0.5" : "1",
                  }}
                >
                  {innerWidth > theme.breakpoints.values.sm && (
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
                  )}
                  <div className="SearchResultTitle">
                    {/* CHECK: here is causing problems to hide scroll */}
                    <Editor
                      sxPreview={{
                        fontSize: {
                          xs: "14px",
                          sm: "16px",
                        },
                      }}
                      label=""
                      readOnly={true}
                      setValue={doNothing}
                      value={resNode.title}
                    />
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
            <Box id="ContinueButton" ref={refInfinityLoaderTrigger}></Box>
          )}
        </Box>
      }
    />
  );
};
export const MemoizedSearcherSidebar = React.memo(SearcherSidebar);
