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
  FormControl,
  IconButton,
  InputAdornment,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  TextField,
} from "@mui/material";
import { Box } from "@mui/system";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import React, { startTransition, useCallback, useEffect, useState } from "react";

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

type SearcherSidebarProps = { openLinkedNode: any; open: boolean; onClose: () => void };

type Pagination = {
  data: any[];
  lastPageLoaded: number;
  totalPage: number;
  totalResults: number;
};

const NODE_TYPES_ARRAY: NodeType[] = ["Concept", "Code", "Reference", "Relation", "Question", "Idea"];

export const SearcherSidebar = ({ openLinkedNode, open, onClose }: SearcherSidebarProps) => {
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

  const [searchResults, setSearchResults] = useState<Pagination>({
    data: [],
    lastPageLoaded: 0,
    totalPage: 0,
    totalResults: 0,
  });

  const getTagsSelected = useCallback<() => TagTreeView[]>(
    () => Object.values(allTags).filter(tag => tag.checked),
    [allTags]
  );

  const onSearch = useCallback(
    async (page: number, sortOption: SortValues, sortDirection: SortDirection, nodeTypes: NodeType[]) => {
      try {
        // async (page: number = 1) => {
        // console.log("[onSearch]");
        setIsRetrieving(true);
        const data: SearchNodesResponse = await Post<SearchNodesResponse>("/searchNodesInNotebook", {
          q: nodeBookState.searchQuery,
          nodeTypes,
          tags: getTagsSelected().map(cur => cur.title),
          nodesUpdatedSince,
          sortOption,
          sortDirection,
          page,
        });
        // const data = await axios.post<SearchResult>("api/searchNodesInNotebook/", {
        //   q: nodeBookState.searchQuery,
        //   nodeTypes,
        //   tags: getTagsSelected().map(cur => cur.title),
        //   nodesUpdatedSince,
        //   sortOption,
        //   sortDirection,
        //   page,
        // });

        console.log("data", data.data);

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
        console.log(err);
        setIsRetrieving(false);
      }
    },
    [getTagsSelected, nodeBookState.searchQuery, nodesUpdatedSince, searchResults.data]
  );

  useEffect(() => {
    if (nodeBookState.nodeTitleBlured /*&& filteredNodes.length !== 0*/) {
      // doSearch();
      onSearch(1, sortOption, sortDirection, nodeTypes);
      // setNodeTitleBlured(false);
      nodeBookDispatch({ type: "setNodeTitleBlured", payload: false });
    }
  }, [nodeBookDispatch, nodeBookState.nodeTitleBlured, nodeTypes, onSearch, sortDirection, sortOption]);

  const handleChange = useCallback(
    (event: any) => {
      event.persist();
      setSearch(event.target.value);
      startTransition(() => {
        nodeBookDispatch({ type: "setSearchQuery", payload: event.target.value });
      });
      // setSearchQuery(event.target.value);
    },
    [nodeBookDispatch]
  );

  const onChangeSortOptions = (newSortOption: SortValues) => {
    setSortOption(newSortOption);
    onSearch(1, newSortOption, sortDirection, nodeTypes);
  };

  const onChangeSortDirection = (newSortDirection: SortDirection) => {
    setSortDirection(newSortDirection);
    onSearch(1, sortOption, newSortDirection, nodeTypes);
  };

  const onSearchEnter = useCallback(
    (event: any) => {
      if (event.charCode === 13) {
        onSearch(1, sortOption, sortDirection, nodeTypes);
      }
    },
    [nodeTypes, onSearch, sortDirection, sortOption]
  );

  const deleteChip = useCallback(
    (nodeId: string) => {
      setChosenTags(oldChosenTags => {
        // console.log({ status: "DeleteChip", oldChosenTags });
        // Check: I commented this
        // if (oldChosenTags.length === 1) {
        //   setOnlyTags(false);
        // }
        const r = oldChosenTags.filter(tag => tag.id !== nodeId);
        return r;
      });
      setAllTags(oldAllTags => {
        return { ...oldAllTags, [nodeId]: { ...oldAllTags[nodeId], checked: false } };
      });
    },
    [setAllTags]
  );

  const setRecoverDefaultTags = useCallback(() => {
    // console.log("setRecoverDefaultTags");
    // setOnlyTags(true);
    // setAllTags(oldAllTags => {
    //   return { ...oldAllTags, [tag.node]: { ...oldAllTags[tag.node], checked: true } };
    // });
    // setChosenTags([tag.node]);
  }, []);

  const setNodesUpdatedSinceClick = useCallback((event: any) => setNodesUpdatedSince(event.target.value), []);

  const setShowTagSelectorClick = useCallback(() => setShowTagSelector(prevValue => !prevValue), []);

  const onChangeNoteType = (event: SelectChangeEvent<string[]>) => {
    const newNodeTypes = event.target.value as NodeType[];
    setNodeTypes(newNodeTypes);
    onSearch(1, sortOption, sortDirection, newNodeTypes);
  };

  return (
    <SidebarWrapper
      title="Search Nodes"
      headerImage={searcherHeaderImage}
      open={open}
      onClose={onClose}
      width={430}
      // anchor="right"
      SidebarOptions={
        <Box sx={{ p: "10px", borderBottom: 1, borderColor: "divider", width: "100%" }}>
          {showTagSelector && (
            <div id="tagModal">
              <Modal onClick={setShowTagSelectorClick} returnLeft={true}>
                <MemoizedTagsSearcher
                  allTags={allTags}
                  setAllTags={setAllTags}
                  chosenTags={chosenTags}
                  setChosenTags={setChosenTags}
                  sx={{ maxHeight: "235px", height: "235px" }}
                  multiple
                />
                {/* CHECK: add tag searcher */}
                {/* <TagSearch chosenTags={chosenTags} setChosenTags={setChosenTags} setOnlyTags={setOnlyTags} /> */}
                {/* <span>TagSearcher</span> */}
              </Modal>
            </div>
          )}
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
                    <FormControl id="nodeSelect">
                      <Select
                        multiple
                        MenuProps={{ id: "nodeSelectMenu" }}
                        value={nodeTypes}
                        variant="outlined"
                        displayEmpty
                        renderValue={() => "Types"}
                        onChange={onChangeNoteType}
                      >
                        {NODE_TYPES_ARRAY.map(nodeType => (
                          // <FilterNodeTypes
                          //   id="nodeTypesSelect"
                          //   className="searchSelect"
                          //   key={nodeType}
                          //   value={nodeType}
                          //   nodeTypes={nodeTypes}
                          //   // setNodeTypesClick={setNodeTypesClick}
                          //   nodeType={nodeType}
                          // />
                          // CHECK: THIS was in FilterNodeTypes
                          <MenuItem
                            className="searchSelect"
                            key={nodeType}
                            value={nodeType}
                            id="nodeTypesSelect"
                            /*onClick={props.setNodeTypesClick(props.nodeType)}*/
                            // className={props.className}
                          >
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
                    </FormControl>
                    <Divider orientation="vertical" id="searchDivider" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton id="SearchIcon" onClick={() => onSearch(1, sortOption, sortDirection, nodeTypes)}>
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </div>
          <div id="SearchTagsContainer">
            <label className="Tooltip">
              {/* <input
              name="OnlyTagsNodes"
              type="checkbox"
              checked={onlyTags}
              onChange={setOnlyTagsClick}
            /> */}
              <span className="tagText">Tags: </span>
              {chosenTags.length === Object.keys(allTags).length || !onlyTags ? (
                <span className="tagText">All</span>
              ) : (
                getTagsSelected().map(tag => {
                  return (
                    <Chip
                      key={"tag" + tag.nodeId}
                      // name={tag.title}
                      className="chip"
                      variant="outlined"
                      label={tag.title}
                      onDelete={() => deleteChip(tag.nodeId)}
                    />
                  );
                })
              )}
            </label>
            <ControlPointIcon id="AddTagIcon" onClick={setShowTagSelectorClick} />
            {onlyTags ? (
              ""
            ) : (
              <span className="tagText recoverDefaultTags" onClick={setRecoverDefaultTags}>
                Recover Default Tag(s)
              </span>
            )}
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
            {/* Search in <span id="SearchNodesNum">{shortenNumber(filteredNodes.length, 2, false)}</span>{" "} */}
            <Box sx={{ display: "flex", alignItems: "center", gap: "5px" }}>
              Edited in past
              {/* <ValidatedInput
              identification="nodesUpdatedSince"
              type="number"
              onChange={setNodesUpdatedSinceClick}
              inputProps={{ min: 0, style: { width: "50px" } }}
              defaultValue={nodesUpdatedSince}
            />{" "} */}
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
            {/* <div id="SearchSortContainer" style={{ border: "solid" }}>

          </div> */}
          </div>
        </Box>
      }
      SidebarContent={
        <Box sx={{ p: "10px" }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {searchResults.data.map((resNode, idx) => {
              return (
                // <h4 key={idx}>{resNode.title}</h4>
                <Paper
                  elevation={3}
                  // TODO: the result comes from typesense, there are nodes, we need to fill with userNode studied data
                  // className={"collection-item" + ("studied" in resNode && resNode.studied ? " Studied" : " NotStudied")}
                  // key={`resNode${resNode.id}`}
                  key={`resNode${idx}`}
                  // onClick={() => console.log("openLinkedNodeClick(resNode.id)")}
                  onClick={() => openLinkedNode(resNode.id)}
                  sx={{
                    listStyle: "none",
                    padding: "10px",
                    borderLeft: "studied" in resNode && resNode.studied ? "solid 4px #fdc473" : " solid 4px #fd7373",
                    cursor: "pointer",
                    // mx: "10px",
                  }}
                >
                  <div
                    className="SidebarNodeTypeIcon"
                    style={{ display: "flex", justifyContent: "space-between", fontSize: "16px" }}
                  >
                    <NodeTypeIcon nodeType={resNode.nodeType} fontSize="inherit" />
                    <div className="right" style={{ display: "flex", gap: "10px" }}>
                      <MemoizedMetaButton
                      // tooltip="Creation or the last update of this node."
                      // tooltipPosition="BottomLeft"
                      >
                        <>
                          {/* <i className="material-icons grey-text">event_available</i> */}
                          <EventAvailableIcon className="material-icons grey-text" />
                          <span>{dayjs(resNode.changedAt).fromNow()}</span>
                        </>
                      </MemoizedMetaButton>
                      <MemoizedMetaButton
                      // tooltip="# of improvement/child proposals on this node."
                      // tooltipPosition="BottomLeft"
                      >
                        <>
                          {/* <i className="material-icons grey-text">create</i> */}
                          <CreateIcon className="material-icons grey-text" />
                          <span>{shortenNumber(resNode.versions, 2, false)}</span>
                        </>
                      </MemoizedMetaButton>
                      <MemoizedMetaButton
                      // tooltip="# of 1Cademists who have found this node unhelpful."
                      // tooltipPosition="BottomLeft"
                      >
                        <>
                          {/* <i className="material-icons grey-text">close</i> */}
                          <CloseIcon className="material-icons grey-text" />
                          <span>{shortenNumber(resNode.wrongs, 2, false)}</span>
                        </>
                      </MemoizedMetaButton>
                      <MemoizedMetaButton
                      // tooltip="# of 1Cademists who have found this node helpful."
                      // tooltipPosition="BottomLeft"
                      >
                        <>
                          {/* <i className="material-icons DoneIcon grey-text">done</i> */}
                          <DoneIcon className="material-icons DoneIcon grey-text" />
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
                onClick={() => onSearch(searchResults.lastPageLoaded + 1, sortOption, sortDirection, nodeTypes)}
                // tooltip="Load older search results"
                // tooltipPosition="Right"
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
