// import "./LinkingWords.css";
// import Button from "@material-ui/core/Button";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import { Box, Link } from "@mui/material";
import React, { useCallback, useEffect } from "react";

// import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { useNodeBook } from "@/context/NodeBookContext";

import { MemoizedMetaButton } from "../MetaButton";
// import { selectedNodeState } from "../../../../store/MapAtoms";
// import {
//   choosingNodeState,
//   choosingTypeState,
//   chosenNodeState,
//   chosenNodeTitleState,
// } from "../../../../store/NodeAtoms";
// import ValidatedInput from "../../../Editor/ValidatedInput/ValidatedInput";
// import { compareLinks } from "../../MapUtils";
// import MetaButton from "../../MetaButton/MetaButton";
import LinkingButton from "./LinkingButton";
import { ReferenceLabelInput } from "./ReferenceLabelInput";

const separateURL = (text: string): [boolean, any] => {
  // console.log("separateURL", text);
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const matches = text.match(urlRegex);
  if (matches && matches.length > 0) {
    return [
      true,
      // eslint-disable-next-line react/jsx-key
      <Link href={matches[0]} target="_blank" rel="noreferrer">
        Open the URL in new tab.
      </Link>,
    ];
  } else {
    return [false, text];
  }
};

type LinkingWordsProps = {
  identifier: string;
  editable: any;
  isNew: any;
  openPart: any;
  title: any;
  reason: any;
  references: any;
  tags: any;
  parents: any;
  nodesChildren: any;
  chosenNodeChanged: any;
  referenceLabelChange: any;
  deleteLink: any;
  openLinkedNode: any;
  openAllChildren: any;
  saveProposedChildNode: any;
  saveProposedImprovement: any;
  closeSideBar: any;
  ableToPropose?: boolean;
  setAbleToPropose: (value: boolean) => void;
  isLoading: boolean;
  onResetButton: (newState: boolean) => void;
  setOperation: (operation: string) => void;
};

const LinkingWords = (props: LinkingWordsProps) => {
  // const selectedNode = useRecoilValue(selectedNodeState);
  // const setChoosingNode = useSetRecoilState(choosingNodeState);
  // const setChoosingType = useSetRecoilState(choosingTypeState);
  // const [chosenNode, setChosenNode] = useRecoilState(chosenNodeState);
  // const setChosenNodeTitle = useSetRecoilState(chosenNodeTitleState);

  const { nodeBookState, nodeBookDispatch } = useNodeBook();
  // const selectedNode = useRecoilValue(selectedNodeState);
  // const setChoosingNode = useSetRecoilState(choosingNodeState);
  // const setChoosingType = useSetRecoilState(choosingTypeState);
  // const [chosenNode, setChosenNode] = useRecoilState(chosenNodeState);
  // const setChosenNodeTitle = useSetRecoilState(chosenNodeTitleState);

  useEffect(() => {
    props.chosenNodeChanged(props.identifier);
    props.setAbleToPropose(true);
    // TODO: check dependencies to remove eslint-disable-next-line
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodeBookState.chosenNode]);

  // const referenceLabelChangeHandler = useCallback(
  //   (idx: any) => {
  //     return (event: any) => {
  //       console.log("is called");
  //       return props.referenceLabelChange(event, idx);
  //     };
  //   },
  //   // TODO: check dependencies to remove eslint-disable-next-line
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  //   [props.referenceLabelChange]
  // );
  const referenceLabelChangeHandler = useCallback(
    (newLabel: string, idx: number) => {
      props.referenceLabelChange(newLabel, props.identifier, idx);
      props.setAbleToPropose(true);
    },
    [props.referenceLabelChange, props.setAbleToPropose]
  );

  const choosingNewLinkedNode = useCallback(
    (linkType: any) => (/*event: any*/) => {
      // if (!props.isSubmitting) {
      // setChoosingType(linkType);
      {
        // if (linkType === "Reference") {
        //   let nodes = [...graph.nodes];
        //   let edges = [...graph.edges];
        //   const removableNodes = nodes.filter(
        //     node => node.nodeType !== linkType && node.id !== props.identifier
        //   );
        //   nodes = nodes.filter(
        //     node => node.nodeType === linkType || node.id === props.identifier
        //   );
        //   for (let node of removableNodes) {
        //     edges = edges.filter(
        //       edge => edge.from !== node.id && edge.to !== node.id
        //     );
        //   }
        //   setGraph({ nodes, edges });
        //   window.scrollTo(0, 0);
        // }
      }
      // setChosenNode(null);
      // setChosenNodeTitle(null);
      nodeBookDispatch({ type: "setChoosingNode", payload: { id: props.identifier, type: linkType } });
      nodeBookDispatch({ type: "setSelectedNode", payload: props.identifier });
      nodeBookDispatch({ type: "setChosenNode", payload: null });
      // setChoosingNode(props.identifier);
      // }
    },
    // TODO: check dependencies to remove eslint-disable-next-line
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props.identifier]
  );

  const deleteLink = useCallback(
    (idx: any, linkType: any) => (/*event: any*/) => {
      props.deleteLink(idx, linkType);
      props.setAbleToPropose(true);
    },
    // TODO: check dependencies to remove eslint-disable-next-line
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props.deleteLink, props.setAbleToPropose]
  );

  return props.openPart === "LinkingWords" || props.openPart === "Tags" || props.openPart === "References" ? (
    <>
      <Box
        sx={{
          mx: "10px",
          borderTop: theme =>
            theme.palette.mode === "dark" ? `solid 1px ${theme.palette.common.borderColor}` : "solid 1px",
        }}
      />
      <div className="LinkingWordsContainer card-action">
        <Box className="LearnBefore" sx={{ borderRight: "solid 1px" }}>
          {props.openPart === "LinkingWords" && (
            <div>
              <strong>Parents (Prerequisites)</strong>
              {props.parents.map((parent: any, idx: number) => {
                return (
                  <div
                    style={{
                      margin: "5px 5px 0px 0px",
                    }}
                    key={props.identifier + "LinkTo" + parent.node}
                  >
                    <LinkingButton
                      onClick={props.openLinkedNode}
                      // nodeID={props.identifier}
                      linkedNodeID={parent.node}
                      linkedNodeTitle={parent.title}
                      linkedNodeType="parent"
                      nodeType={parent.type}
                      visible={parent.visible}
                    />
                    {props.editable && props.parents.length > 1 && (
                      <div className="LinkDeleteButton">
                        {/* <div>Delete the link to this parent.</div> */}
                        <MemoizedMetaButton
                          onClick={deleteLink(idx, "Parent")}
                          tooltip="Delete the link to this parent."
                          tooltipPosition="right"
                        >
                          {/* <i className="material-icons grey-text">delete_forever</i> */}
                          <DeleteForeverIcon sx={{ fontSize: "16px" }} />
                        </MemoizedMetaButton>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {props.openPart === "References" && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <strong>References</strong>
              {props.references.map((reference: any, idx: number) => {
                let refTitle = reference.title;
                let urlRefLabel = [false, false];
                if ("label" in reference && reference.label !== "") {
                  const separatedURL = separateURL(reference.label ?? "");
                  if (separatedURL[0]) {
                    urlRefLabel = separatedURL;
                  } else {
                    refTitle += ": " + reference.label;
                  }
                }
                return (
                  <div
                    style={{
                      margin: "5px 5px 0px 0px",
                    }}
                    key={props.identifier + "LinkTo" + reference.node + "DIV"}
                    className="ReferenceLink"
                  >
                    <LinkingButton
                      key={props.identifier + "LinkTo" + reference.node}
                      onClick={props.openLinkedNode}
                      // nodeID={props.identifier}
                      linkedNodeID={reference.node}
                      // linkedNodeTitle={refTitle+(reference.label?':'+{reference.label}:'')}
                      linkedNodeTitle={refTitle}
                      linkedNodeType="reference"
                      iClassName="menu_book"
                    />
                    {urlRefLabel[0] && urlRefLabel[1]}
                    {props.editable && (
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <ReferenceLabelInput
                          key={props.identifier + "LinkTo" + reference.node + "Label"}
                          inputProperties={{
                            id: props.identifier + "LinkTo" + reference.node + "Label",
                            name: props.identifier + "LinkTo" + reference.node + "Label",
                          }}
                          referenceLabelChangeHandler={(newLabel: string) => referenceLabelChangeHandler(newLabel, idx)}
                          reference={reference}
                          sx={{ mt: "10px" }}
                        />
                        {/* <TextField
                        key={props.identifier + "LinkTo" + reference.node + "Label"}
                        id={props.identifier + "LinkTo" + reference.node + "Label"}
                        name={props.identifier + "LinkTo" + reference.node + "Label"}
                        type="text"
                        value={reference.label}
                        onChange={referenceLabelChangeHandler(idx)}
                        onBlur={referenceLabelChangeHandler(idx)}
                        label="Enter page # or voice/video time"
                        size="small"
                      /> */}
                        <div className="LinkDeleteButton">
                          <MemoizedMetaButton
                            onClick={deleteLink(idx, "Reference")}
                            tooltip="Delete the link to this reference."
                            tooltipPosition="right"
                          >
                            <DeleteForeverIcon sx={{ fontSize: "16px" }} />
                          </MemoizedMetaButton>
                        </div>
                      </Box>
                    )}
                  </div>
                );
              })}
            </Box>
          )}
          {props.editable && (
            <Box sx={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
              {props.openPart === "LinkingWords" && !props.isNew && nodeBookState.selectedNode === props.identifier ? (
                <MemoizedMetaButton
                  onClick={choosingNewLinkedNode("Parent")}
                  tooltip="Link to an existing parent node."
                  tooltipPosition="left"
                >
                  <>
                    <ArrowBackIcon fontSize="small" sx={{ color: "#00E676", fontSize: "16px" }} />
                    <AddIcon fontSize="small" sx={{ color: "#00E676", fontSize: "16px" }} />
                    <span>Link to an existing Parent</span>
                  </>
                </MemoizedMetaButton>
              ) : (
                props.openPart === "References" && (
                  <MemoizedMetaButton
                    onClick={choosingNewLinkedNode("Reference")}
                    tooltip="Link to a reference node."
                    tooltipPosition="left"
                  >
                    <Box sx={{ fontSize: "16px", display: "flex", gap: "5px" }}>
                      <MenuBookIcon sx={{ color: "#f9a825", fontSize: "inherit" }} />
                      <AddIcon sx={{ color: "#00E676", fontSize: "inherit" }} />
                      <span> Cite an existing Reference</span>
                    </Box>
                  </MemoizedMetaButton>
                )
              )}
            </Box>
          )}
        </Box>

        {/* <Box sx={{ mx: "10px", borderLeft: "solid 1px" }} /> */}

        <Box
          className="LearnAfter"
          sx={{
            borderLeft: theme =>
              theme.palette.mode === "dark" ? `solid 1px ${theme.palette.common.borderColor}` : "solid 1px",
          }}
        >
          {props.openPart === "References" && (
            //StyleRef, f-size from Map.css ln 71
            <Box sx={{ fontSize: "16px" }}>
              <strong>Tags</strong>
              {props.tags.map((tag: any, idx: number) => {
                return (
                  <div
                    style={{
                      margin: "5px 5px 0px 0px",
                    }}
                    key={props.identifier + "LinkTo" + tag.node + "DIV"}
                  >
                    <LinkingButton
                      key={props.identifier + "LinkTo" + tag.node}
                      onClick={props.openLinkedNode}
                      linkedNodeID={tag.node}
                      linkedNodeTitle={tag.title}
                      linkedNodeType="tag"
                      iClassName="local_offer"
                    />
                    {props.editable && (
                      <div className="LinkDeleteButton">
                        <MemoizedMetaButton
                          onClick={deleteLink(idx, "Tag")}
                          tooltip="Delete the link to this tag."
                          tooltipPosition="right"
                        >
                          <DeleteForeverIcon sx={{ fontSize: "inherit" }} />
                        </MemoizedMetaButton>
                      </div>
                    )}
                  </div>
                );
              })}
              {props.editable && props.openPart === "References" && (
                <MemoizedMetaButton
                  onClick={choosingNewLinkedNode("Tag")}
                  tooltip="Link to a node."
                  tooltipPosition="left"
                >
                  <Box sx={{ display: "flex", gap: "px" }}>
                    <LocalOfferIcon sx={{ color: "#f9a825", fontSize: "inherit" }} />
                    <AddIcon sx={{ color: "#00E676", fontSize: "inherit" }} />
                    <span> Add an existing Tag</span>
                  </Box>
                </MemoizedMetaButton>
              )}
            </Box>
          )}

          {props.openPart === "Tags" && (
            <Box sx={{ fontSize: "16px" }}>
              <strong>Tags</strong>
              {props.tags.map((tag: any, idx: number) => {
                return (
                  <div key={props.identifier + "LinkTo" + tag.node + "DIV"}>
                    <LinkingButton
                      key={props.identifier + "LinkTo" + tag.node}
                      onClick={props.openLinkedNode}
                      // nodeID={props.identifier}
                      linkedNodeID={tag.node}
                      linkedNodeTitle={tag.title}
                      linkedNodeType="tag"
                      iClassName="local_offer"
                    />
                    {props.editable && (
                      <div className="LinkDeleteButton">
                        <MemoizedMetaButton
                          onClick={deleteLink(idx, "Tag")}
                          tooltip="Click to delete the link to this tag."
                          tooltipPosition="right"
                        >
                          <DeleteForeverIcon sx={{ fontSize: "16px" }} />
                        </MemoizedMetaButton>
                      </div>
                    )}
                  </div>
                );
              })}
            </Box>
          )}
          {props.openPart === "LinkingWords" && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <strong>Children (Follow-ups)</strong>
              {props.nodesChildren.map((child: any, idx: number) => {
                return (
                  <div
                    style={{
                      margin: "5px 5px 0px 0px",
                    }}
                    key={props.identifier + "LinkTo" + child.node + "DIV"}
                  >
                    <LinkingButton
                      key={props.identifier + "LinkTo" + child.node}
                      onClick={props.openLinkedNode}
                      // nodeID={props.identifier}
                      linkedNodeID={child.node}
                      linkedNodeTitle={child.title}
                      linkedNodeType="child"
                      nodeType={child.type}
                      visible={child.visible}
                    />
                    {props.editable && (
                      <div className="LinkDeleteButton">
                        <MemoizedMetaButton
                          onClick={deleteLink(idx, "Child")}
                          tooltip="Delete the link to this child."
                          tooltipPosition="right"
                        >
                          <DeleteForeverIcon sx={{ fontSize: "16px" }} />
                        </MemoizedMetaButton>
                      </div>
                    )}
                  </div>
                );
              })}
              <LinkingButton
                key={props.identifier + "LinkToAllChildren"}
                onClick={props.openAllChildren}
                // nodeID={props.identifier}
                linkedNodeID={props.identifier}
                linkedNodeTitle={"All Children"}
                linkedNodeType="children"
                nodeType={"Relation"}
                visible={false}
              />
            </Box>
          )}
          {props.editable &&
            !props.isNew &&
            nodeBookState.selectedNode === props.identifier &&
            props.openPart === "LinkingWords" && (
              <MemoizedMetaButton
                onClick={choosingNewLinkedNode("Child")}
                tooltip="Link to an existing child node."
                tooltipPosition="right"
              >
                <>
                  <span>Link to an existing Child node</span>
                  <AddIcon sx={{ color: "#00E676", fontSize: "16px" }} />
                  <ArrowForwardIcon sx={{ color: "#00E676", fontSize: "16px" }} />
                </>
              </MemoizedMetaButton>
            )}
        </Box>
      </div>
    </>
  ) : null;
};

export default React.memo(LinkingWords);
// export default React.memo(LinkingWords,
//   (prevProps, nextProps) =>
//     prevProps.identifier === nextProps.identifier &&
//     prevProps.isNew === nextProps.isNew &&
//     prevProps.editable === nextProps.editable &&
//     prevProps.openPart === nextProps.openPart &&
//     prevProps.title === nextProps.title &&
//     prevProps.reason === nextProps.reason &&
//     // prevProps.isSubmitting === nextProps.isSubmitting &&
//     prevProps.chosenNodeChanged === nextProps.chosenNodeChanged &&
//     compareLinks(prevProps.references, nextProps.references, true, false) &&
//     compareLinks(prevProps.tags, nextProps.tags, true, false) &&
//     compareLinks(prevProps.parents, nextProps.parents, true, true) &&
//     compareLinks(prevProps.children, nextProps.children, true, true) &&
//     prevProps.referenceLabelChange === nextProps.referenceLabelChange &&
//     prevProps.deleteLink === nextProps.deleteLink &&
//     prevProps.openLinkedNode === nextProps.openLinkedNode &&
//     prevProps.openAllChildren === nextProps.openAllChildren &&
//     prevProps.saveProposedChildNode === nextProps.saveProposedChildNode &&
//     prevProps.saveProposedImprovement === nextProps.saveProposedImprovement &&
//     prevProps.closeSideBar === nextProps.closeSideBar
// );
