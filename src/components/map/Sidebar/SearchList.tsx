import ControlPointIcon from "@mui/icons-material/ControlPoint";
import SearchIcon from "@mui/icons-material/Search";
import {
  Checkbox,
  Chip,
  Divider,
  FormControl,
  IconButton,
  InputAdornment,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";
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
import React, { useCallback, useState } from "react";

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
// import LoadingImg from "../../../../../assets/1Cademy_Loading_Dots.gif";
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
import shortenNumber from "../../../lib/utils/shortenNumber";
import { NodeType } from "../../../types";
import NodeTypeIcon from "../../NodeTypeIcon2";
import { MemoizedTagsSearcher, TagTreeView } from "../../TagsSearcher";
// import NodeTypeIcon from "../../../Node/NodeTypeIcon/NodeTypeIcon";
// import RecentNodesList from "../../RecentNodes/RecentNodesList/RecentNodesList";
// import FilterNodeTypes from "../FilterNodeTypes/FilterNodeTypes";
import Modal from "../Modal/Modal";
import RecentNodesList from "../RecentNodesList";
import ValidatedInput from "../ValidatedInput";
// import FilterNodeTypes from "./FilterNodeTypes";

export type SortDirection = "ASCENDING" | "DESCENDING";
export type SortValues = "LAST_VIEWED" | "DATE_MODIFIED" | "PROPOSALS" | "UP_VOTES" | "DOWN_VOTES" | "NET_NOTES";

// const doNothing = () => {};

dayjs.extend(relativeTime);

//search config, contains api keys
// const searchClient = algoliasearch("2GWY1UCT1Q", "df93c72310bc4f8ddd6196363db02905");

// type SearchListProps = {};\

const NODE_TYPES_ARRAY: NodeType[] = ["Concept", "Code", "Reference", "Relation", "Question", "Idea"];

const SearchList = (/*props: SearchListProps*/) => {
  // const firebase = useRecoilValue(firebaseState);
  // const username = useRecoilValue(usernameState);
  // const tag = useRecoilValue(tagState);
  const { allTags, setAllTags } = useTagsTreeView();
  const [nodesUpdatedSince, setNodesUpdatedSince] = useState(100);

  // const [allNodes, setAllNodes] = useRecoilState(allNodesState);
  // const allUserNodes = useRecoilValue(allUserNodesState);
  // const [nodeTitleBlured, setNodeTitleBlured] = useRecoilState(nodeTitleBluredState);
  // const [searchQuery, setSearchQuery] = useRecoilState(searchQueryState);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  // const [allTags, setAllTags] = useRecoilState(allTagsState);

  // const [filteredNodes, setFilteredNodes] = useState([]);
  // const [lastIndex, setLastIndex] = useState(13);
  // const [isRetrieving, setIsRetrieving] = useState(false);
  const [onlyTags /*setOnlyTags*/] = useState(true);
  const [chosenTags /*setChosenTags*/] = useState([]);
  const [showTagSelector, setShowTagSelector] = useState(false);
  const [nodeTypes, setNodeTypes] = useState(NODE_TYPES_ARRAY);
  const [sortOption, setSortOption] = useState<SortValues>("DATE_MODIFIED");
  const [sortDirection, setSortDirection] = useState<SortDirection>("DESCENDING");

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

  // useEffect(() => {
  //   if (nodeTitleBlured && filteredNodes.length !== 0) {
  //     doSearch();
  //     setNodeTitleBlured(false);
  //   }
  // }, [nodeTitleBlured, filteredNodes]);

  const handleChange = useCallback((event: any) => {
    event.persist();
    setSearchQuery(event.target.value);
  }, []);

  const onSearch = () => {
    console.log("[onSearch]", {
      searchQuery,
      nodeTypes,
      tags: getTagsSelected(),
      nodesUpdatedSince,
      sortOption,
      sortDirection,
    });
  };
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
  //   (event) => {
  //     if (lastIndex < searchResults.length) {
  //       setLastIndex(lastIndex + 13);
  //     }
  //   },
  //   [lastIndex, searchResults]
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

  // const deleteChip = useCallback(
  //   () => console.log("deleteChip"),
  //   // chip => () => {
  //   //   setChosenTags(oldChosenTags => {
  //   //     console.log({ status: "DeleteChip", oldChosenTags });
  //   //     if (oldChosenTags.length === 1) {
  //   //       setOnlyTags(false);
  //   //     }
  //   //     return oldChosenTags.filter(tag => tag !== chip.nodeId);
  //   //   });
  //   //   setAllTags(oldAllTags => {
  //   //     return { ...oldAllTags, [chip.nodeId]: { ...oldAllTags[chip.nodeId], checked: false } };
  //   //   });
  //   // },
  //   []
  // );

  const setRecoverDefaultTags = useCallback(() => {
    console.log("setRecoverDefaultTags");
    // setOnlyTags(true);
    // setAllTags(oldAllTags => {
    //   return { ...oldAllTags, [tag.node]: { ...oldAllTags[tag.node], checked: true } };
    // });
    // setChosenTags([tag.node]);
  }, []);

  const setNodesUpdatedSinceClick = useCallback((event: any) => setNodesUpdatedSince(event.target.value), []);

  const setShowTagSelectorClick = useCallback(() => setShowTagSelector(prevValue => !prevValue), []);

  const onChangeNoteType = (event: SelectChangeEvent<string[]>) => {
    setNodeTypes(event.target.value as NodeType[]);
  };

  const getTagsSelected = useCallback<() => TagTreeView[]>(
    () => Object.values(allTags).filter(tag => tag.checked),
    [allTags]
  );

  return (
    <div id="SearchContainer">
      <div id="SearchBoxContainer">
        {showTagSelector && (
          <div id="tagModal">
            <Modal onClick={setShowTagSelectorClick} returnLeft={true}>
              <MemoizedTagsSearcher
                allTags={allTags}
                setAllTags={setAllTags}
                sx={{ maxHeight: "200px", height: "200px" }}
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
            value={searchQuery}
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
                  <IconButton id="SearchIcon" onClick={onSearch}>
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
                    onDelete={() => console.log("deleteChip(tag)")}
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
        <div id="nodesUpdatedSinceContainer" style={{ fontSize: "14px" }}>
          {/* Search in <span id="SearchNodesNum">{shortenNumber(filteredNodes.length, 2, false)}</span>{" "} */}
          <div>
            Edited in past
            <ValidatedInput
              identification="nodesUpdatedSince"
              type="number"
              onChange={setNodesUpdatedSinceClick}
              inputProps={{ min: 0, style: { width: "50px" } }}
              defaultValue={nodesUpdatedSince}
            />{" "}
            days
          </div>
          <div id="SearchResutlsNum">{shortenNumber(searchResults.length, 2, false)} Results</div>
          <div id="SearchSortContainer">
            <RecentNodesList
              id="recentNodesList"
              recentNodes={searchResults}
              setRecentNodes={setSearchResults}
              onlyTags={onlyTags}
              sortOption={sortOption}
              setSortOption={setSortOption}
              sortDirection={sortDirection}
              setSortDirection={setSortDirection}
            />
          </div>
        </div>
        {/* <div id="SearchResutlsNumSortContainer">
        </div> */}
      </div>
      {/* CHECK: I commented this */}
      Instant Search
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
      {/* {!isRetrieving ? (
        <ul className="collection Proposals">
          {searchResults.slice(0, lastIndex).map((resNode) => {
            return (
              <li
                className={
                  "collection-item" +
                  ("studied" in resNode && resNode.studied ? " Studied" : " NotStudied")
                }
                key={`resNode${resNode.id}`}
                onClick={openLinkedNodeClick(resNode.id)}
              >
                <div className="SidebarNodeTypeIcon">
                  <NodeTypeIcon nodeType={resNode.nodeType} />
                  <div className="right">
                    <MetaButton
                    // tooltip="Creation or the last update of this node."
                    // tooltipPosition="BottomLeft"
                    >
                      <i className="material-icons grey-text">event_available</i>{" "}
                      {dayjs(resNode.changedAt).fromNow()}
                    </MetaButton>
                    <MetaButton
                    // tooltip="# of improvement/child proposals on this node."
                    // tooltipPosition="BottomLeft"
                    >
                      <i className="material-icons grey-text">create</i>
                      <span>{shortenNumber(resNode.versions, 2, false)}</span>
                    </MetaButton>
                    <MetaButton
                    // tooltip="# of 1Cademists who have found this node unhelpful."
                    // tooltipPosition="BottomLeft"
                    >
                      <i className="material-icons grey-text">close</i>
                      <span>{shortenNumber(resNode.wrongs, 2, false)}</span>
                    </MetaButton>
                    <MetaButton
                    // tooltip="# of 1Cademists who have found this node helpful."
                    // tooltipPosition="BottomLeft"
                    >
                      <i className="material-icons DoneIcon grey-text">done</i>
                      <span>{shortenNumber(resNode.corrects, 2, false)}</span>
                    </MetaButton>
                  </div>
                </div>
                <div className="SearchResultTitle">
                  <HyperEditor
                    readOnly={true}
                    onChange={doNothing}
                    content={resNode.title}
                    width={580}
                  />
                </div>
              </li>
            );
          })}
          {searchResults.length > lastIndex && (
            <div id="ContinueButton">
              <MetaButton
                onClick={loadOlderSearchResultsClick}
                // tooltip="Load older search results"
                // tooltipPosition="Right"
              >
                <i className="material-icons grey-text">expand_more</i> Older search results{" "}
                <i className="material-icons grey-text">expand_more</i>
              </MetaButton>
            </div>
          )}
        </ul>
      ) : (
        <div className="CenterredLoadingImageSidebar">
          <img className="CenterredLoadingImage" src={LoadingImg} alt="Loading" />
        </div>
      )} */}
    </div>
  );
};

export default React.memo(SearchList);
