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
  SelectChangeEvent,
} from "@mui/material";
import { Box } from "@mui/system";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import React, { useCallback, useEffect, useRef, useState } from "react";

import { SortDirection, SortValues } from "./Sidebar/SearchList";

// import { useRecoilValue } from "recoil";

// import { allNodesState, allUserNodesState, selectedTagsState } from "../../../../../store/MapAtoms";
// import shortenNumber from "../../../../../utils/shortenNumber";
// import HyperEditor from "../../../../Editor/HyperEditor/HyperEditorWrapper";
// import MetaButton from "../../../MetaButton/MetaButton";
// import NodeTypeIcon from "../../../Node/NodeTypeIcon/NodeTypeIcon";
// import FilterNodeTypes from "../../Search/FilterNodeTypes/FilterNodeTypes";

// const doNothing = () => {};

type SortOptions = { name: string; icon: JSX.Element; value: SortValues };

const sortByTypeClick = (setSortByType: any) => /*(event: any) =>*/ setSortByType(prevValue => !prevValue);

const sortByTypeAscendingClick = (setSortByTypeAscending: any) => (event: any) =>
  setSortByTypeAscending(event.target.value);

dayjs.extend(relativeTime);

const SORT_OPTIONS: SortOptions[] = [
  {
    name: "Last Viewed",
    icon: <VisibilityIcon key={"Last Viewed icon"} />,
    value: "LAST_VIEWED",
  },
  {
    name: "Date Modified",
    icon: <EventAvailableIcon key={"Date Modified icon"} />,
    value: "DATE_MODIFIED",
  },
  {
    name: "Proposals",
    icon: <CreateIcon key={"Proposals icon"} />,
    value: "PROPOSALS",
  },
  {
    name: "Upvotes",
    icon: <DoneIcon key={"Upvotes icon"} />,
    value: "UP_VOTES",
  },
  {
    name: "Downvotes",
    icon: <CloseIcon key={"Downvotes icon"} />,
    value: "DOWN_VOTES",
  },
  {
    name: "Net Votes",
    icon: (
      <>
        <DoneIcon />
        <RemoveIcon />
        <CloseIcon />
      </>
    ),
    value: "NET_NOTES",
  },
];

const RecentNodesList = (props: any) => {
  // const selectedTags = useRecoilValue(selectedTagsState);
  // const allNodes = useRecoilValue(allNodesState);
  // const allUserNodes = useRecoilValue(allUserNodesState);

  const selectedTags: any[] = [];
  const allNodes: any = {};
  const allUserNodes: any = {};

  // const [sortOptions, setSortOptions] = useState<SortValues>("DATE_MODIFIED");
  // const [sortDirection, setSortDirection] = useState<SortDirection>("DESCENDING");
  // const [sortByUpdate, setSortByUpdate] = useState(true);
  // const [sortByUpdateAscending, setSortByUpdateAscending] = useState("descending");
  // const [sortByViewed, setSortByViewed] = useState(true);
  // const [sortByViewedAscending, setSortByViewedAscending] = useState("descending");
  // const [sortByProposals, setSortByProposals] = useState(false);
  // const [sortByProposalsAscending, setSortByProposalsAscending] = useState("descending");
  // const [sortByUpvote, setSortByUpvote] = useState(false);
  // const [sortByUpvoteAscending, setSortByUpvoteAscending] = useState("descending");
  // const [sortByDownvote, setSortByDownvote] = useState(false);
  // const [sortByDownvoteAscending, setSortByDownvoteAscending] = useState("descending");
  // const [sortByNetvote, setSortByNetvote] = useState(false);
  // const [sortByNetvoteAscending, setSortByNetvoteAscending] = useState("descending");
  const [onlyTags, setOnlyTags] = useState(true);
  const [allTags, setAllTags] = useState<any[]>([]);

  const [chosenTags, setChosenTags] = useState<any[]>([]);
  const [nodeTypes, setNodeTypes] = useState(["Concept", "Relation", "Reference", "Idea", "Code", "Question"]);

  const notagsSelect = useRef(null);
  const nodeTypeSelectOptions = useRef(null);

  // useEffect(() => {
  //   // M.FormSelect.init(notagsSelect.current, {});
  //   props.setRecentNodes((oRecentNodes: any[]) => {
  //     const oldRecentNodes = [...oRecentNodes];
  //     if (oldRecentNodes.length === 0) {
  //       for (let nodeId of Object.keys(allNodes)) {
  //         if (nodeTypes.includes(allNodes[nodeId].nodeType)) {
  //           if (!props.onlyTags) {
  //             oldRecentNodes.push(allNodes[nodeId]);
  //           } else {
  //             for (let thisTag of allNodes[nodeId].tags) {
  //               if (chosenTags.includes(thisTag.node)) {
  //                 oldRecentNodes.push(allNodes[nodeId]);
  //                 break;
  //               }
  //             }
  //           }
  //         }
  //       }
  //     }
  //     if (sortByUpdate) {
  //       if (sortByUpdateAscending === "ascending") {
  //         oldRecentNodes.sort((n1, n2) => n1.changedAt - n2.changedAt);
  //       } else {
  //         oldRecentNodes.sort((n1, n2) => n2.changedAt - n1.changedAt);
  //       }
  //     }

  //     if (sortByViewed) {
  //       if (sortByViewedAscending) {
  //         oldRecentNodes.sort((n1, n2) => {
  //           if (!("lastVisit" in n1) && "lastVisit" in n2) {
  //             return 1;
  //           } else if ("lastVisit" in n1 && !("lastVisit" in n2)) {
  //             return -1;
  //           } else if (!("lastVisit" in n1) && !("lastVisit" in n2)) {
  //             return 0;
  //           } else {
  //             return n1.lastVisit - n2.lastVisit;
  //           }
  //         });
  //       } else {
  //         oldRecentNodes.sort((n2, n1) => {
  //           if (!("lastVisit" in n1) && "lastVisit" in n2) {
  //             return 1;
  //           } else if ("lastVisit" in n1 && !("lastVisit" in n2)) {
  //             return -1;
  //           } else if (!("lastVisit" in n1) && !("lastVisit" in n2)) {
  //             return 0;
  //           } else {
  //             return n1.lastVisit - n2.lastVisit;
  //           }
  //         });
  //       }
  //     }

  //     if (sortByProposals) {
  //       if (sortByProposalsAscending === "ascending") {
  //         oldRecentNodes.sort((n1, n2) => n1.versions - n2.versions);
  //       } else {
  //         oldRecentNodes.sort((n1, n2) => n2.versions - n1.versions);
  //       }
  //     }
  //     if (sortByUpvote) {
  //       if (sortByUpvoteAscending === "ascending") {
  //         oldRecentNodes.sort((n1, n2) => n1.corrects - n2.corrects);
  //       } else {
  //         oldRecentNodes.sort((n1, n2) => n2.corrects - n1.corrects);
  //       }
  //     }
  //     if (sortByDownvote) {
  //       if (sortByDownvoteAscending === "ascending") {
  //         oldRecentNodes.sort((n1, n2) => n1.wrongs - n2.wrongs);
  //       } else {
  //         oldRecentNodes.sort((n1, n2) => n2.wrongs - n1.wrongs);
  //       }
  //     }
  //     if (sortByNetvote) {
  //       if (sortByNetvoteAscending === "ascending") {
  //         oldRecentNodes.sort((n1, n2) => n1.corrects - n1.wrongs - n2.corrects + n2.wrongs);
  //       } else {
  //         oldRecentNodes.sort((n1, n2) => n2.corrects - n2.wrongs - n1.corrects + n1.wrongs);
  //       }
  //     }
  //     for (let nIdx = 0; nIdx < oldRecentNodes.length; nIdx++) {
  //       if (
  //         oldRecentNodes[nIdx].id in allUserNodes &&
  //         allUserNodes[oldRecentNodes[nIdx].id].studied &&
  //         !allUserNodes[oldRecentNodes[nIdx].id].changed
  //       ) {
  //         oldRecentNodes[nIdx] = { ...oldRecentNodes[nIdx], studied: true };
  //       } else {
  //         oldRecentNodes[nIdx] = { ...oldRecentNodes[nIdx], studied: false };
  //       }
  //     }
  //     return oldRecentNodes;
  //   });
  //   // CHECK: fix dependencies please
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [
  //   sortByUpdate,
  //   sortByViewed,
  //   sortByProposals,
  //   sortByUpvote,
  //   sortByDownvote,
  //   sortByNetvote,
  //   sortByUpdateAscending,
  //   sortByViewedAscending,
  //   sortByProposalsAscending,
  //   sortByUpvoteAscending,
  //   sortByDownvoteAscending,
  //   sortByNetvoteAscending,
  //   props.onlyTags,
  //   chosenTags,
  //   nodeTypes,
  //   props.setRecentNodes,
  //   props.openLinkedNode,
  // ]);

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

  // const setSortOptionsClick = (event: any) => setSortOptions(event.target.value);
  const onChangeSortOption = (event: SelectChangeEvent) => {
    props.setSortOption(event.target.value as SortValues);
  };

  const onChangeSortDirection = (event: React.ChangeEvent<HTMLInputElement>) => {
    props.setSortDirection((event.target as HTMLInputElement).value as SortDirection);
  };

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
          // multiple
          value={props.sortOption}
          variant="outlined"
          onChange={onChangeSortOption}
          displayEmpty
          renderValue={() => "Sort"}
        >
          {SORT_OPTIONS.map(cur => {
            const isSelected = props.sortOption === cur.value;
            return (
              <MenuItem
                className="searchSelect"
                key={cur.name}
                value={cur.value}
                sx={{ p: "0px", display: "flex", justifyContent: "space-between" }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <FormControlLabel
                    className={isSelected ? "selected" : ""}
                    control={<Checkbox className="searchCheckbox" checked={isSelected} />}
                    label=""
                    sx={{ p: "0px" }}
                  />

                  <Box className={"searchIcon " + (isSelected ? "selected" : "")} sx={{ mr: "5px" }}>
                    {cur.icon}
                  </Box>
                  <ListItemText className={isSelected ? "selected" : ""} primary={cur.name} />
                </Box>

                {cur.name !== "Relevance" && (
                  <RadioGroup
                    value={props.sortDirection}
                    onChange={onChangeSortDirection}
                    sx={{ display: "flex", flexDirection: "row", mr: "5px" }}
                  >
                    <Radio
                      className={"searchIcon " + (isSelected && props.sortDirection === "DESCENDING" ? "selected" : "")}
                      icon={<ArrowDownward />}
                      checkedIcon={<ArrowDownward />}
                      sx={{ p: "1px" }}
                      value={"DESCENDING"}
                    />
                    <Radio
                      className={"searchIcon " + (isSelected && props.sortDirection === "ASCENDING" ? "selected" : "")}
                      icon={<ArrowUpward />}
                      checkedIcon={<ArrowUpward />}
                      sx={{ p: "1px" }}
                      value={"ASCENDING"}
                    />
                  </RadioGroup>
                )}
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
    </>
  );
};

export default React.memo(RecentNodesList);
