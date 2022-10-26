import CloseIcon from "@mui/icons-material/Close";
import ControlPointIcon from "@mui/icons-material/ControlPoint";
import CreateIcon from "@mui/icons-material/Create";
import DoneIcon from "@mui/icons-material/Done";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
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
// import axios from "axios";
// import "./SearchList.css";
// import Chip from "@material-ui/core/Chip";
// import Divider from "@material-ui/core/Divider";
// import FormControl from "@material-ui/core/FormControl";
// import InputAdornment from "@material-ui/core/InputAdornment";
// import Select from "@material-ui/core/Select";
// import AddCircleOutline from "@material-ui/icons/AddCircleOutline";
// import Search from "@material-ui/icons/Search";
// import algoliasearch from "algoliasearch";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import React, { useCallback, useEffect, useState, useTransition } from "react";

// import {
//   ClearRefinements,
//   Configure,
//   Highlight,
//   Hits,
//   InstantSearch,
//   Pagination,
//   RefinementList,
// } from "react-instantsearch-dom";
// import { useRecoilState, useRecoilValue } from "recoil";
// import Worker from "worker-loader!./searchWorker.js"; // eslint-disable-line import/no-webpack-loader-syntax
import { useNodeBook } from "../../../context/NodeBookContext";
// import Modal from "../../../../../containers/Modal/Modal";
// import { firebaseState, tagState, usernameState } from "../../../../../store/AuthAtoms";
// import {
//   allTagsState,
//   nodeTitleBluredState,
//   searchQueryState,
//   searchResultsState,
// } from "../../../../../store/MapAtoms";
// import shortenNumber from "../../../../../utils/shortenNumber";
// import ValidatedInput from "../../../../Editor/ValidatedInput/ValidatedInput";
// import TagSearch from "../../../../PublicComps/TagSearch/TagSearch";
import { useTagsTreeView } from "../../../hooks/useTagsTreeView";
import { SearchNodesResponse } from "../../../knowledgeTypes";
import { Post } from "../../../lib/mapApi";
import shortenNumber from "../../../lib/utils/shortenNumber";
import { SortDirection, SortValues } from "../../../nodeBookTypes";
// import { SortDirection, SortValues } from "../../../noteBookTypes";
import { NodeType } from "../../../types";
import { Editor } from "../../Editor";
import NodeTypeIcon from "../../NodeTypeIcon2";
import { ChosenTag, MemoizedTagsSearcher, TagTreeView } from "../../TagsSearcher";
import { MemoizedMetaButton } from "../MetaButton";
// import NodeTypeIcon from "../../../Node/NodeTypeIcon/NodeTypeIcon";
// import RecentNodesList from "../../RecentNodes/RecentNodesList/RecentNodesList";
// import FilterNodeTypes from "../FilterNodeTypes/FilterNodeTypes";
import Modal from "../Modal/Modal";
import RecentNodesList from "../RecentNodesList";
import ValidatedInput from "../ValidatedInput";
// import FilterNodeTypes from "./FilterNodeTypes";

const doNothing = () => {};

dayjs.extend(relativeTime);

//search config, contains api keys
// const searchClient = algoliasearch("2GWY1UCT1Q", "df93c72310bc4f8ddd6196363db02905");

type SearchListProps = {
  openLinkedNode: any;
};

type Pagination = {
  data: any[];
  lastPageLoaded: number;
  totalPage: number;
  totalResults: number;
};

const NODE_TYPES_ARRAY: NodeType[] = ["Concept", "Code", "Reference", "Relation", "Question", "Idea"];

const SearchList = ({ openLinkedNode }: SearchListProps) => {
  // const firebase = useRecoilValue(firebaseState);
  // const username = useRecoilValue(usernameState);
  // const tag = useRecoilValue(tagState);

  const { nodeBookState, nodeBookDispatch } = useNodeBook();
  const { allTags, setAllTags } = useTagsTreeView();
  const [nodesUpdatedSince, setNodesUpdatedSince] = useState(1000);

  // const [allNodes, setAllNodes] = useRecoilState(allNodesState);
  // const allUserNodes = useRecoilValue(allUserNodesState);
  // const [nodeTitleBlured, setNodeTitleBlured] = useRecoilState(nodeTitleBluredState);
  // const [searchQuery, setSearchQuery] = useRecoilState(searchQueryState);
  // const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Pagination>({
    data: [],
    lastPageLoaded: 0,
    totalPage: 0,
    totalResults: 0,
  });
  // const [allTags, setAllTags] = useRecoilState(allTagsState);

  // const [filteredNodes, setFilteredNodes] = useState([]);
  // const [lastIndex, setLastIndex] = useState(13);
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

  // useEffect(() => {
  //   setFilteredNodes((oFilteredNodes) => {
  //     const oldFilteredNodes = [];
  //     const tenDaysAgo = new Date();
  //     tenDaysAgo.setDate(tenDaysAgo.getDate() - nodesUpdatedSince);
  //     for (let aNode of Object.values(allNodes)) {
  //       const node = { ...aNode };
  //       if (node.updatedAt >= tenDaysAgo && nodeTypes.includes(node.nodeType)) {
  //         if (!onlyTags) {
  //           oldFilteredNodes.push(node);
  //         } else {
  //           for (let thisTag of node.tags) {
  //             if (chosenTags.includes(thisTag.node)) {
  //               oldFilteredNodes.push(node);
  //               break;
  //             }
  //           }
  //         }
  //       }
  //     }
  //     for (let nIdx = 0; nIdx < oldFilteredNodes.length; nIdx++) {
  //       if (
  //         oldFilteredNodes[nIdx].id in allUserNodes &&
  //         allUserNodes[oldFilteredNodes[nIdx].id].studied &&
  //         !allUserNodes[oldFilteredNodes[nIdx].id].changed
  //       ) {
  //         oldFilteredNodes[nIdx].studied = true;
  //       } else {
  //         oldFilteredNodes[nIdx].studied = false;
  //       }
  //     }
  //     return oldFilteredNodes;
  //   });
  // }, [nodesUpdatedSince, allNodes, onlyTags, chosenTags, nodeTypes]);

  // useEffect(() => {
  //   // setAllTags(oldAllTags => {
  //   //   const newAllTags = { ...oldAllTags };
  //   //   const newChosenTags = [];
  //   //   for (let aTagId in newAllTags) {
  //   //     if (newAllTags[aTagId].checked) {
  //   //       newChosenTags.push(aTagId);
  //   //     }
  //   //   }
  //   //   if (newChosenTags.length === 0 && tag.node in oldAllTags) {
  //   //     newAllTags[tag.node] = { ...oldAllTags[tag.node], checked: true };
  //   //     newChosenTags.push(tag.node);
  //   //   }
  //   //   setChosenTags(newChosenTags);
  //   //   return newAllTags;
  //   // });
  // }, [tag]);

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
          q: search,
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
    [getTagsSelected, search, nodesUpdatedSince, searchResults.data]
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
      // event.persist();
      let val = event.target.value;
      setSearch(val);
      startTransition(() => {
        nodeBookDispatch({ type: "setSearchQuery", payload: val });
      });
      // setSearchQuery(event.target.value);
    },
    [nodeBookDispatch, setSearch]
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
  // useEffect(() => {
  //   onSearch();
  // }, [onSearch, sortDirection]);

  // const doSearch = useCallback(() => {
  //   // const worker = new window.Worker(process.env.PUBLIC_URL + "/searchWorker.js");
  //   const worker = new Worker();
  //   setIsRetrieving(true);
  //   worker.postMessage({ filteredNodes, searchQuery });
  //   // worker.onerror = (err) => err;
  //   worker.onmessage = (e) => {
  //     const { workerResults, time } = e.data;
  //     worker.terminate();
  //     setSearchResults(workerResults);
  //     console.log({ time });
  //     setIsRetrieving(false);
  //     const userSearchLogRef = firebase.db.collection("userSearchLog").doc();
  //     userSearchLogRef.set({
  //       uname: username,
  //       queryStr: searchQuery,
  //       createdAt: firebase.firestore.Timestamp.fromDate(new Date()),
  //     });
  //   };
  // }, [filteredNodes, searchQuery, firebase, username]);

  // const loadOlderSearchResultsClick = useCallback(
  //   // (event: any) => {
  //   //   if (!searchResults) return onSearch();

  //   //   if (searchResults.page < getTotalPage()) {
  //   //     return onSearch(searchResults.page + 1);
  //   //   }
  //   //   // if (lastIndex < searchResults.length) {
  //   //   //   setLastIndex(lastIndex + 13);
  //   //   // }
  //   // },
  //   // [getTotalPage, onSearch, searchResults]
  // );

  // const onEnter = useCallback(
  //   (event) => {
  //     if (event.key === "Enter") {
  //       doSearch();
  //     }
  //   },
  //   [doSearch]
  // );

  // const setOnlyTagsClick = useCallback((event) => setOnlyTags((prevValue) => !prevValue), []);

  // const setChosenTagsClick = useCallback((event) => {
  //   return setChosenTags([...event.target.selectedOptions].map((o) => o.value));
  // }, []);

  // const setNodeTypesClick = useCallback(
  //   () => console.log("setNodeTypesClick"),
  //   // nodeType => event =>
  //   //   setNodeTypes(oldNodeTypes =>
  //   //     oldNodeTypes.includes(nodeType)
  //   //       ? oldNodeTypes.filter(oldNodeType => oldNodeType !== nodeType)
  //   //       : [...oldNodeTypes, nodeType]
  //   //   ),
  //   []
  // );

  // CHECK: I commented this
  // const openLinkedNodeClick = useCallback(
  //   nodeId => event => {
  //     props.openLinkedNode(nodeId);
  //   },
  //   []
  // );

  // const setCheckboxes = useCallback(
  //   (event) => {
  //     setAllTags((oldAllTags) => {
  //       return {
  //         ...oldAllTags,
  //         [event.target.name]: { ...oldAllTags[event.target.name], checked: event.target.checked },
  //       };
  //     });
  //     if (event.target.checked) {
  //       if (chosenTags.length === 0) {
  //         setOnlyTags(true);
  //       }
  //       setChosenTags([...chosenTags, event.target.name]);
  //     } else {
  //       if (chosenTags.length === 1) {
  //         setOnlyTags(false);
  //       }
  //       setChosenTags(chosenTags.filter((nodeId) => nodeId != event.target.name));
  //     }
  //   },
  //   [chosenTags]
  // );

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
    <div id="SearchContainer">
      <div id="SearchBoxContainer">
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
                          <ListItemText className={nodeTypes.includes(nodeType) ? "selected" : ""} primary={nodeType} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Divider orientation="vertical" light id="searchDivider" />
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
          {/* </FormGroup> */}
          {/* <div id="SubmitSearch">
      <MetaButton
        onClick={doSearch}
        tooltip="Click to search..."
        tooltipPosition="Left"
      > */}
          {/* <i className="material-icons grey-text">search</i> Search */}
          {/* </MetaButton>
    </div> */}
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
        {/* <div id="SearchResutlsNumSortContainer">
        </div> */}
      </div>
      {/* CHECK: I commented this */}
      {/* Instant Search: {searchResults?.data.length} */}
      {/* <InstantSearch
        indexName="nodesIndex"
        searchClient={searchClient}
        searchState={{
          query: { searchQuery },
          refinementList: {
            nodeType: nodeTypes,
          },
        }}
      >
      </InstantSearch> */}
      {/* Widgets */}
      {/* <Divider orientation="horizontal" /> */}

      <Box
        className="collection Proposals"
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          paddingY: "5px",
          overflow: "hidden",
        }}
      >
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
                mx: "10px",
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
        {/* <Image className="CenterredLoadingImage" src={LoadingImg} alt="Loading" /> */}
        {isRetrieving && (
          <Box sx={{ py: "10px", display: "flex", justifyContent: "center" }}>
            <CircularProgress />
          </Box>
        )}
        {searchResults.lastPageLoaded < searchResults.totalPage && (
          <div id="ContinueButton">
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
          </div>
        )}
      </Box>
    </div>
  );
};

export default React.memo(SearchList);
