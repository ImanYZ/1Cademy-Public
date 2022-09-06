/* eslint-disable @typescript-eslint/no-unused-vars */
// import "./RecentNodesList.css";

// import {
//   Checkbox,
//   FormControl,
//   FormControlLabel,
//   FormLabel,
//   ListItemIcon,
//   ListItemText,
//   MenuItem,
//   Radio,
//   RadioGroup,
//   Select,
// } from "@material-ui/core";
// import {
//   ArrowDownward,
//   ArrowUpward,
//   Close,
//   Create,
//   Done,
//   EventAvailable,
//   Remove,
//   Visibility,
// } from "@material-ui/icons";
import { ArrowDownward, ArrowUpward } from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import CreateIcon from "@mui/icons-material/Create";
import DoneIcon from "@mui/icons-material/Done";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import RemoveIcon from "@mui/icons-material/Remove";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  ListItemText,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
} from "@mui/material";
import { Box } from "@mui/system";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import React, { useCallback, useEffect, useRef, useState } from "react";

// import { useRecoilValue } from "recoil";

// import { allNodesState, allUserNodesState, selectedTagsState } from "../../../../../store/MapAtoms";
// import shortenNumber from "../../../../../utils/shortenNumber";
// import HyperEditor from "../../../../Editor/HyperEditor/HyperEditorWrapper";
// import MetaButton from "../../../MetaButton/MetaButton";
// import NodeTypeIcon from "../../../Node/NodeTypeIcon/NodeTypeIcon";
// import FilterNodeTypes from "../../Search/FilterNodeTypes/FilterNodeTypes";

// const doNothing = () => {};

const sortByTypeClick = (setSortByType: any) => /*(event: any) =>*/ setSortByType(prevValue => !prevValue);

const sortByTypeAscendingClick = (setSortByTypeAscending: any) => (event: any) =>
  setSortByTypeAscending(event.target.value);

dayjs.extend(relativeTime);

const RecentNodesList = (props: any) => {
  // const selectedTags = useRecoilValue(selectedTagsState);
  // const allNodes = useRecoilValue(allNodesState);
  // const allUserNodes = useRecoilValue(allUserNodesState);

  const selectedTags: any[] = [];
  const allNodes: any = {};
  const allUserNodes: any = {};

  const [sortOptions, setSortOptions] = useState([]);
  const [sortByUpdate, setSortByUpdate] = useState(true);
  const [sortByUpdateAscending, setSortByUpdateAscending] = useState("descending");
  const [sortByViewed, setSortByViewed] = useState(true);
  const [sortByViewedAscending, setSortByViewedAscending] = useState("descending");
  const [sortByProposals, setSortByProposals] = useState(false);
  const [sortByProposalsAscending, setSortByProposalsAscending] = useState("descending");
  const [sortByUpvote, setSortByUpvote] = useState(false);
  const [sortByUpvoteAscending, setSortByUpvoteAscending] = useState("descending");
  const [sortByDownvote, setSortByDownvote] = useState(false);
  const [sortByDownvoteAscending, setSortByDownvoteAscending] = useState("descending");
  const [sortByNetvote, setSortByNetvote] = useState(false);
  const [sortByNetvoteAscending, setSortByNetvoteAscending] = useState("descending");
  const [onlyTags, setOnlyTags] = useState(true);
  const [allTags, setAllTags] = useState<any[]>([]);

  const [chosenTags, setChosenTags] = useState<any[]>([]);
  const [nodeTypes, setNodeTypes] = useState(["Concept", "Relation", "Reference", "Idea", "Code", "Question"]);

  const notagsSelect = useRef(null);
  const nodeTypeSelectOptions = useRef(null);

  useEffect(() => {
    // M.FormSelect.init(notagsSelect.current, {});
    props.setRecentNodes((oRecentNodes: any[]) => {
      const oldRecentNodes = [...oRecentNodes];
      if (oldRecentNodes.length === 0) {
        for (let nodeId of Object.keys(allNodes)) {
          if (nodeTypes.includes(allNodes[nodeId].nodeType)) {
            if (!props.onlyTags) {
              oldRecentNodes.push(allNodes[nodeId]);
            } else {
              for (let thisTag of allNodes[nodeId].tags) {
                if (chosenTags.includes(thisTag.node)) {
                  oldRecentNodes.push(allNodes[nodeId]);
                  break;
                }
              }
            }
          }
        }
      }
      if (sortByUpdate) {
        if (sortByUpdateAscending === "ascending") {
          oldRecentNodes.sort((n1, n2) => n1.changedAt - n2.changedAt);
        } else {
          oldRecentNodes.sort((n1, n2) => n2.changedAt - n1.changedAt);
        }
      }

      if (sortByViewed) {
        if (sortByViewedAscending) {
          oldRecentNodes.sort((n1, n2) => {
            if (!("lastVisit" in n1) && "lastVisit" in n2) {
              return 1;
            } else if ("lastVisit" in n1 && !("lastVisit" in n2)) {
              return -1;
            } else if (!("lastVisit" in n1) && !("lastVisit" in n2)) {
              return 0;
            } else {
              return n1.lastVisit - n2.lastVisit;
            }
          });
        } else {
          oldRecentNodes.sort((n2, n1) => {
            if (!("lastVisit" in n1) && "lastVisit" in n2) {
              return 1;
            } else if ("lastVisit" in n1 && !("lastVisit" in n2)) {
              return -1;
            } else if (!("lastVisit" in n1) && !("lastVisit" in n2)) {
              return 0;
            } else {
              return n1.lastVisit - n2.lastVisit;
            }
          });
        }
      }

      if (sortByProposals) {
        if (sortByProposalsAscending === "ascending") {
          oldRecentNodes.sort((n1, n2) => n1.versions - n2.versions);
        } else {
          oldRecentNodes.sort((n1, n2) => n2.versions - n1.versions);
        }
      }
      if (sortByUpvote) {
        if (sortByUpvoteAscending === "ascending") {
          oldRecentNodes.sort((n1, n2) => n1.corrects - n2.corrects);
        } else {
          oldRecentNodes.sort((n1, n2) => n2.corrects - n1.corrects);
        }
      }
      if (sortByDownvote) {
        if (sortByDownvoteAscending === "ascending") {
          oldRecentNodes.sort((n1, n2) => n1.wrongs - n2.wrongs);
        } else {
          oldRecentNodes.sort((n1, n2) => n2.wrongs - n1.wrongs);
        }
      }
      if (sortByNetvote) {
        if (sortByNetvoteAscending === "ascending") {
          oldRecentNodes.sort((n1, n2) => n1.corrects - n1.wrongs - n2.corrects + n2.wrongs);
        } else {
          oldRecentNodes.sort((n1, n2) => n2.corrects - n2.wrongs - n1.corrects + n1.wrongs);
        }
      }
      for (let nIdx = 0; nIdx < oldRecentNodes.length; nIdx++) {
        if (
          oldRecentNodes[nIdx].id in allUserNodes &&
          allUserNodes[oldRecentNodes[nIdx].id].studied &&
          !allUserNodes[oldRecentNodes[nIdx].id].changed
        ) {
          oldRecentNodes[nIdx] = { ...oldRecentNodes[nIdx], studied: true };
        } else {
          oldRecentNodes[nIdx] = { ...oldRecentNodes[nIdx], studied: false };
        }
      }
      return oldRecentNodes;
    });
    // CHECK: fix dependencies please
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    sortByUpdate,
    sortByViewed,
    sortByProposals,
    sortByUpvote,
    sortByDownvote,
    sortByNetvote,
    sortByUpdateAscending,
    sortByViewedAscending,
    sortByProposalsAscending,
    sortByUpvoteAscending,
    sortByDownvoteAscending,
    sortByNetvoteAscending,
    props.onlyTags,
    chosenTags,
    nodeTypes,
    props.setRecentNodes,
    props.openLinkedNode,
  ]);

  // useEffect(() => {
  //   const tempAllTags = [];
  //   for (let nodeId of Object.keys(allNodes)) {
  //     if ("isTag" in allNodes[nodeId] && allNodes[nodeId].isTag) {
  //       tempAllTags.push({ node: nodeId, title: allNodes[nodeId].title });
  //     }
  //   }
  //   tempAllTags.sort((t1, t2) => (t1.title > t2.title ? 1 : -1));
  //   setAllTags(tempAllTags);
  //   // M.FormSelect.init(nodeTypeSelectOptions.current, {});
  // }, []);

  // useEffect(() => {
  //   setChosenTags(selectedTags.map((tag: any) => tag.node));
  // }, [selectedTags]);

  // useEffect(() => {
  //   if (allTags.length !== 0) {
  //     // M.FormSelect.init(nodeTagsSelect.current, {});
  //   }
  // }, [allTags]);

  const setSortOptionsClick = useCallback((event: any) => setSortOptions(event.target.value), []);

  // const setOnlyTagsClick = useCallback(
  //   (event) => setOnlyTags((prevValue) => !prevValue),
  //   []
  // );

  // const setChosenTagsClick = useCallback((event: any) => {
  //   setChosenTags([...event.target.selectedOptions].map(o => o.value));
  // }, []);

  // const setNodeTypesClick = useCallback(
  //   (nodeType: any) => (event: any) =>
  //     setNodeTypes(oldNodeTypes =>
  //       oldNodeTypes.includes(nodeType)
  //         ? oldNodeTypes.filter(nodeType => nodeType !== nodeType)
  //         : [...oldNodeTypes, nodeType]
  //     ),
  //   []
  // );

  // const openLinkedNodeClick = useCallback(
  //   (nodeId: string) => (event: any) => {
  //     props.openLinkedNode(nodeId);
  //   },
  //   [props.openLinkedNode]
  // );

  return (
    <>
      <FormControl id={props.id}>
        <Select
          MenuProps={{ id: "sortFilterMenu" }}
          multiple
          value={sortOptions}
          variant="outlined"
          onChange={setSortOptionsClick}
          displayEmpty
          renderValue={() => "Sort"}
        >
          {[
            [
              "Last Viewed",
              <VisibilityIcon key={"Last Viewed icon"} />,
              sortByViewed,
              setSortByViewed,
              sortByViewedAscending,
              setSortByViewedAscending,
            ],
            [
              "Date Modified",
              <EventAvailableIcon key={"Date Modified icon"} />,
              // <EventAvailable />,
              sortByUpdate,
              setSortByUpdate,
              sortByUpdateAscending,
              setSortByUpdateAscending,
            ],
            [
              "Proposals",
              <CreateIcon key={"Proposals icon"} />,
              sortByProposals,
              setSortByProposals,
              sortByProposalsAscending,
              setSortByProposalsAscending,
            ],
            [
              "Upvotes",
              <DoneIcon key={"Upvotes icon"} />,
              sortByUpvote,
              setSortByUpvote,
              sortByUpvoteAscending,
              setSortByUpvoteAscending,
            ],
            [
              "Downvotes",
              <CloseIcon key={"Downvotes icon"} />,
              sortByDownvote,
              setSortByDownvote,
              sortByDownvoteAscending,
              setSortByDownvoteAscending,
            ],
            [
              "Net Votes",
              <>
                <DoneIcon />
                <RemoveIcon />
                <CloseIcon />
              </>,
              sortByNetvote,
              setSortByNetvote,
              sortByNetvoteAscending,
              setSortByNetvoteAscending,
            ],
          ].map((option: any) => (
            <MenuItem
              className="searchSelect"
              key={option[0]}
              value={option[0]}
              sx={{ p: "0px", display: "flex", justifyContent: "space-between" }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <FormControlLabel
                  className={option[2] ? "selected" : ""}
                  control={
                    <Checkbox
                      className="searchCheckbox"
                      checked={option[2]}
                      onChange={() => sortByTypeClick(option[3])}
                    />
                  }
                  label=""
                  sx={{ p: "0px" }}
                />
                {/* <ListItemIcon className={"searchIcon " + (option[2] ? "selected" : "")} sx={{ p: "0px" }}>
                  {option[1]}
                </ListItemIcon> */}
                <Box className={"searchIcon " + (option[2] ? "selected" : "")} sx={{ mr: "5px" }}>
                  {option[1]}
                </Box>
                <ListItemText className={option[2] ? "selected" : ""} primary={option[0]} />
              </Box>
              {/* <FormLabel> */}
              {option[0] !== "Relevance" && (
                <RadioGroup
                  value={option[4]}
                  onChange={sortByTypeAscendingClick(option[5])}
                  sx={{ display: "flex", flexDirection: "row", mr: "5px" }}
                >
                  {/* <FormControlLabel
                    control={
                      
                    }
                    value={"descending"}
                    label=""
                    sx={{ width: "20px" }}
                  /> */}
                  <Radio
                    className={"searchIcon " + (option[2] && option[4] === "descending" ? "selected" : "")}
                    icon={<ArrowDownward />}
                    checkedIcon={<ArrowDownward />}
                    sx={{ p: "1px" }}
                    value={"descending"}
                  />
                  <Radio
                    className={"searchIcon " + (option[2] && option[4] === "ascending" ? "selected" : "")}
                    icon={<ArrowUpward />}
                    checkedIcon={<ArrowUpward />}
                    sx={{ p: "1px" }}
                    value={"ascending"}
                  />
                  {/* <FormControlLabel
                    control={
                      
                    }
                    value={"ascending"}
                    label=""
                  /> */}
                </RadioGroup>
              )}
              {/* </FormLabel> */}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {/* <div id="NodesStatistics">
        <div className="row">
          <div className="col s10 grey-text">Total # of nodes:</div>
          <div className="col s2">{Object.keys(allNodes).length}</div>
        </div>
        <div className="row">
          <div className="col s10 grey-text">
            # of nodes added/modified since yesterday:
          </div>
          <div className="col s2">
            {
              Object.values(allNodes).filter(
                (n) =>
                  n.changedAt >=
                  ((d) => new Date(d.setDate(d.getDate() - 1)))(new Date())
              ).length
            }
          </div>
        </div>
      </div>
      <ul className="collection">
        <li className="collection-item NodeSortButton">
          <form action="#">
            <div className="row">
              <div className="col s8">
                <label className="Tooltip">
                  <input
                    name="SortBy"
                    type="checkbox"
                    checked={sortByUpdate}
                    onChange={sortByUpdateClick}
                  />
                  <span>
                    <i className="material-icons grey-text">event_available</i>{" "}
                    update date/time
                  </span>
                  <span className="TooltipText Left">
                    Sort by node{" "}
                    <i className="material-icons grey-text">event_available</i>{" "}
                    creation/change date/time.
                  </span>
                </label>
              </div>
              <div className="col s2">
                <label className="Tooltip">
                  <input
                    name="SortByUpdateAscendingDescending"
                    type="radio"
                    checked={sortByUpdateAscending}
                    onChange={sortByUpdateAscendingClick(true)}
                  />
                  <span>
                    <i className="material-icons">arrow_upward</i>
                  </span>
                  <span className="TooltipText Left">
                    Sort in Ascending order.
                  </span>
                </label>
              </div>
              <div className="col s2">
                <label className="Tooltip">
                  <input
                    name="SortByUpdateAscendingDescending"
                    type="radio"
                    checked={!sortByUpdateAscending}
                    onChange={sortByUpdateAscendingClick(false)}
                  />
                  <span>
                    <i className="material-icons">arrow_downward</i>
                  </span>
                  <span className="TooltipText Left">
                    Sort in Descending order.
                  </span>
                </label>
              </div>
            </div>
            <div className="row">
              <div className="col s8">
                <label className="Tooltip">
                  <input
                    name="SortBy"
                    type="checkbox"
                    checked={sortByProposals}
                    onChange={sortByProposalsClick}
                  />
                  <span>
                    <i className="material-icons orange-text">
                      create
                    </i>{" "}
                    Proposals
                  </span>
                  <span className="TooltipText Left">
                    Sort by # of node{" "}
                    <i className="material-icons orange-text">
                      create
                    </i>{" "}
                    Proposals
                  </span>
                </label>
              </div>
              <div className="col s2">
                <label className="Tooltip">
                  <input
                    name="SortByProposalsAscendingDescending"
                    type="radio"
                    checked={sortByProposalsAscending}
                    onChange={sortByProposalsAscendingClick(true)}
                  />
                  <span>
                    <i className="material-icons">arrow_upward</i>
                  </span>
                  <span className="TooltipText Left">
                    Sort in Ascending order.
                  </span>
                </label>
              </div>
              <div className="col s2">
                <label className="Tooltip">
                  <input
                    name="SortByProposalsAscendingDescending"
                    type="radio"
                    checked={!sortByProposalsAscending}
                    onChange={sortByProposalsAscendingClick(false)}
                  />
                  <span>
                    <i className="material-icons">arrow_downward</i>
                  </span>
                  <span className="TooltipText Left">
                    Sort in Descending order.
                  </span>
                </label>
              </div>
            </div>
            <div className="row">
              <div className="col s8">
                <label className="Tooltip">
                  <input
                    name="SortBy"
                    type="checkbox"
                    checked={sortByUpvote}
                    onChange={sortByUpvoteClick}
                  />
                  <span>
                    <i className="material-icons green-text">
                      done
                    </i>
                  </span>
                  <span className="TooltipText Left">
                    Sort by # of node{" "}
                    <i className="material-icons green-text">
                      done
                    </i>
                    .
                  </span>
                </label>
              </div>
              <div className="col s2">
                <label className="Tooltip">
                  <input
                    name="SortByUpvoteAscendingDescending"
                    type="radio"
                    checked={sortByUpvoteAscending}
                    onChange={sortByUpvoteAscendingClick(true)}
                  />
                  <span>
                    <i className="material-icons">arrow_upward</i>
                  </span>
                  <span className="TooltipText Left">
                    Sort in Ascending order.
                  </span>
                </label>
              </div>
              <div className="col s2">
                <label className="Tooltip">
                  <input
                    name="SortByUpvoteAscendingDescending"
                    type="radio"
                    checked={!sortByUpvoteAscending}
                    onChange={sortByUpvoteAscendingClick(false)}
                  />
                  <span>
                    <i className="material-icons">arrow_downward</i>
                  </span>
                  <span className="TooltipText Left">
                    Sort in Descending order.
                  </span>
                </label>
              </div>
            </div>
            <div className="row">
              <div className="col s8">
                <label className="Tooltip">
                  <input
                    name="SortBy"
                    type="checkbox"
                    checked={sortByDownvote}
                    onChange={sortByDownvoteClick}
                  />
                  <span>
                    <i className="material-icons red-text">
                      close
                    </i>
                  </span>
                  <span className="TooltipText Left">
                    Sort by # of node{" "}
                    <i className="material-icons red-text">
                      close
                    </i>
                    .
                  </span>
                </label>
              </div>
              <div className="col s2">
                <label className="Tooltip">
                  <input
                    name="SortByDownvoteAscendingDescending"
                    type="radio"
                    checked={sortByDownvoteAscending}
                    onChange={sortByDownvoteAscendingClick(true)}
                  />
                  <span>
                    <i className="material-icons">arrow_upward</i>
                  </span>
                  <span className="TooltipText Left">
                    Sort in Ascending order.
                  </span>
                </label>
              </div>
              <div className="col s2">
                <label className="Tooltip">
                  <input
                    name="SortByDownvoteAscendingDescending"
                    type="radio"
                    checked={!sortByDownvoteAscending}
                    onChange={sortByDownvoteAscendingClick(false)}
                  />
                  <span>
                    <i className="material-icons">arrow_downward</i>
                  </span>
                  <span className="TooltipText Left">
                    Sort in Descending order.
                  </span>
                </label>
              </div>
            </div>
            <div className="row">
              <div className="col s8">
                <label className="Tooltip">
                  <input
                    name="SortBy"
                    type="checkbox"
                    checked={sortByNetvote}
                    onChange={sortByNetvoteClick}
                  />
                  <span>
                    <i className="material-icons green-text">
                      done
                    </i>{" "}
                    <i className="material-icons">remove</i>{" "}
                    <i className="material-icons red-text">
                      close
                    </i>
                  </span>
                  <span className="TooltipText Left">
                    Sort by # of node{" "}
                    <i className="material-icons green-text">
                      done
                    </i>{" "}
                    <i className="material-icons">remove</i>{" "}
                    <i className="material-icons red-text">
                      close
                    </i>
                    .
                  </span>
                </label>
              </div>
              <div className="col s2">
                <label className="Tooltip">
                  <input
                    name="SortByNetvoteAscendingDescending"
                    type="radio"
                    checked={sortByNetvoteAscending}
                    onChange={sortByNetvoteAscendingClick(true)}
                  />
                  <span>
                    <i className="material-icons">arrow_upward</i>
                  </span>
                  <span className="TooltipText Left">
                    Sort in Ascending order.
                  </span>
                </label>
              </div>
              <div className="col s2">
                <label className="Tooltip">
                  <input
                    name="SortByNetvoteAscendingDescending"
                    type="radio"
                    checked={!sortByNetvoteAscending}
                    onChange={sortByNetvoteAscendingClick(false)}
                  />
                  <span>
                    <i className="material-icons">arrow_downward</i>
                  </span>
                  <span className="TooltipText Left">
                    Sort in Descending order.
                  </span>
                </label>
              </div>
            </div>
            <div className="row">
              <div className="col s12">
                <label className="Tooltip">
                  <input
                    name="OnlyTagsNodes"
                    type="checkbox"
                    checked={onlyTags}
                    onChange={setOnlyTagsClick}
                  />
                  <span>
                    Only nodes with{" "}
                    <i className="material-icons orange-text">
                      local_offer
                    </i>
                    s:
                  </span>
                  <span className="TooltipText Left">
                    Show only nodes with the selected{" "}
                    <i className="material-icons orange-text">
                      local_offer
                    </i>
                    s.
                  </span>
                </label>
              </div>
            </div>
            <div className="row">
              <div
                id="FilterTagsSelector"
                className="input-field col s12 Tooltip"
              >
                <select
                  ref={nodeTagsSelect}
                  value={chosenTags}
                  onChange={setChosenTagsClick}
                  multiple={true}
                >
                  {allTags.map((tag) => {
                    return (
                      <option key={"TagId" + tag.node} value={tag.node}>
                        {tag.title}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
            <div className="row">
              <div id="OnlyShowTypes">Node Type Filters:</div>
              <FilterNodeTypes
                nodeTypes={nodeTypes}
                setNodeTypesClick={setNodeTypesClick}
                nodeType={"Concept"}
              />
              <FilterNodeTypes
                nodeTypes={nodeTypes}
                setNodeTypesClick={setNodeTypesClick}
                nodeType={"Relation"}
              />
              <FilterNodeTypes
                nodeTypes={nodeTypes}
                setNodeTypesClick={setNodeTypesClick}
                nodeType={"Reference"}
              />
              <FilterNodeTypes
                nodeTypes={nodeTypes}
                setNodeTypesClick={setNodeTypesClick}
                nodeType={"Idea"}
              />
              <FilterNodeTypes
                nodeTypes={nodeTypes}
                setNodeTypesClick={setNodeTypesClick}
                nodeType={"Code"}
              />
              <FilterNodeTypes
                nodeTypes={nodeTypes}
                setNodeTypesClick={setNodeTypesClick}
                nodeType={"Question"}
              />
            </div>
          </form>
        </li>
        <li className="collection-item">
          <div id="NumberOfFilteredNodes" className="row">
            <div className="col s10 grey-text"># of filtered nodes:</div>
            <div className="col s2">{recentNodes.length}</div>
          </div>
        </li>
        {recentNodes.slice(0, lastIndex).map((node) => {
          return (
            <li
              className={
                "collection-item" +
                ("studied" in node && node.studied ? " Studied" : " NotStudied")
              }
              key={`node${node.id}`}
              onClick={openLinkedNodeClick(node.id)}
            >
              <div className="SidebarNodeTypeIcon">
                <NodeTypeIcon nodeType={node.nodeType} />
                <div className="right">
                  <MetaButton
                    tooltip="Creation or the last update of this node."
                    tooltipPosition="BottomLeft"
                  >
                    <i className="material-icons grey-text">event_available</i>{" "}
                    {dayjs(node.changedAt).fromNow()}
                  </MetaButton>
                  <MetaButton
                    tooltip="# of improvement/child proposals on this node."
                    tooltipPosition="BottomLeft"
                  >
                    <i className="material-icons grey-text">create</i>
                    <span>{shortenNumber(node.versions, 2, false)}</span>
                  </MetaButton>
                  <MetaButton
                    tooltip="# of 1Cademists who have found this node unhelpful."
                    tooltipPosition="BottomLeft"
                  >
                    <i className="material-icons grey-text">close</i>
                    <span>{shortenNumber(node.wrongs, 2, false)}</span>
                  </MetaButton>
                  <MetaButton
                    tooltip="# of 1Cademists who have found this node helpful."
                    tooltipPosition="BottomLeft"
                  >
                    <i className="material-icons DoneIcon grey-text">done</i>
                    <span>{shortenNumber(node.corrects, 2, false)}</span>
                  </MetaButton>
                </div>
              </div>
              <div className="SearchResultTitle">
                <HyperEditor
                  readOnly={true}
                  onChange={doNothing}
                  content={node.title}
                />
              </div>
            </li>
          );
        })}
        {lastIndex < recentNodes.length && (
          <div id="ContinueButton">
            <MetaButton
              onClick={continueNodes}
              tooltip="Click to load older nodes."
            >
              <i className="material-icons grey-text">expand_more</i> Older
              Nodes <i className="material-icons grey-text">expand_more</i>
            </MetaButton>
          </div>
        )}
      </ul> */}
    </>
  );
};

export default React.memo(RecentNodesList);
