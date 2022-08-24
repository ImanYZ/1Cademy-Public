// import "./LinkingWords.css";

// import Button from "@material-ui/core/Button";
import AddIcon from "@mui/icons-material/Add";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import { Button, Tooltip } from "@mui/material";
import { Box } from "@mui/system";
import React, { useCallback, useEffect } from "react";

// import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { useNodeBook } from "@/context/NodeBookContext";

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
import { MemoizedMetaButton } from "../MetaButton";

const separateURL = (text: string): [boolean, any] => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const matches = text.match(urlRegex);
  if (matches && matches.length > 0) {
    return [
      true,
      // eslint-disable-next-line react/jsx-key
      <p>
        <a href={matches[0]} target="_blank" rel="noreferrer">
          Open the URL in new tab.
        </a>
      </p>
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
  }, [nodeBookState.choosingNode]);

  const referenceLabelChangeHandler = useCallback(
    (idx: any) => {
      return (event: any) => {
        return props.referenceLabelChange(event, idx);
      };
    },
    [props.referenceLabelChange]
  );

  const choosingNewLinkedNode = useCallback(
    (linkType: any) => (event: any) => {
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
      nodeBookDispatch({ type: "setChosenNode", payload: null });
      // setChoosingNode(props.identifier);
      // }
    },
    [props.identifier]
  );

  const deleteLink = useCallback(
    (idx: any, linkType: any) => (event: any) => props.deleteLink(idx, linkType),
    [props.deleteLink]
  );

  const proposalSubmit = useCallback(
    () =>
      props.isNew
        ? props.saveProposedChildNode(
            props.identifier,
            // summary,
            "",
            props.reason
          )
        : props.saveProposedImprovement(
            // summary,
            "",
            props.reason
          ),
    [props.isNew, props.identifier, props.reason, props.saveProposedChildNode, props.saveProposedImprovement]
  );

  return props.openPart === "LinkingWords" || props.openPart === "Tags" || props.openPart === "References" ? (
    <div className="LinkingWordsContainer card-action">
      <div className="LearnBefore">
        {props.openPart === "LinkingWords" && (
          <div>
            <strong>Parents (Prerequisites)</strong>
            {props.parents.map((parent: any, idx: number) => {
              return (
                <div key={props.identifier + "LinkTo" + parent.node}>
                  <LinkingButton
                    onClick={props.openLinkedNode}
                    // nodeID={props.identifier}
                    linkedNodeID={parent.node}
                    linkedNodeTitle={parent.title}
                    linkedNodeType="parent"
                    nodeType={parent.nodeType}
                    visible={parent.visible}
                  />
                  {props.editable && props.parents.length > 1 && (
                    <div className="LinkDeleteButton">
                      {/* CHECK */}
                      <div>Delete the link to this parent.</div>
                      {/* <MemoizedMetaButton
                        onClick={deleteLink(idx, "Parent")}
                        tooltip="Delete the link to this parent."
                        tooltipPosition="Right"
                      >
                        <i className="material-icons grey-text">delete_forever</i>
                      </MemoizedMetaButton> */}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {/* {props.openPart === "Tags" &&
            props.tags.map((tag, idx) => {
              return (
                <div key={props.identifier + "LinkTo" + tag.node + "DIV"}>
                  <LinkingButton
                    key={props.identifier + "LinkTo" + tag.node}
                    onClick={props.openLinkedNode}
                    nodeID={props.identifier}
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
                        tooltipPosition="Right"
                      >
                          <i className="material-icons grey-text">delete_forever</i>
                      </MemoizedMetaButton>
                    </div>
                  )}
                </div>
              );
            })} */}
        {props.openPart === "References" && (
          <>
            <strong>References</strong>
            {props.references.map((reference: any, idx: number) => {
              let refTitle = reference.title;
              let urlRefLabel = [false, false];
              if ("label" in reference && reference.label !== "") {
                const separatedURL = separateURL(reference.label);
                if (separatedURL[0]) {
                  urlRefLabel = separatedURL;
                } else {
                  refTitle += ": " + reference.label;
                }
              }
              return (
                <div key={props.identifier + "LinkTo" + reference.node + "DIV"} className="ReferenceLink">
                  <LinkingButton
                    key={props.identifier + "LinkTo" + reference.node}
                    onClick={props.openLinkedNode}
                    // nodeID={props.identifier}
                    linkedNodeID={reference.node}
                    linkedNodeTitle={refTitle}
                    linkedNodeType="reference"
                    iClassName="menu_book"
                  />
                  {urlRefLabel[0] && urlRefLabel[1]}
                  {props.editable && (
                    <>
                      <div>ValidatedInput Editable</div>
                      {/* <ValidatedInput
                        key={props.identifier + "LinkTo" + reference.node + "Label"}
                        id={props.identifier + "LinkTo" + reference.node + "Label"}
                        name={props.identifier + "LinkTo" + reference.node + "Label"}
                        type="text"
                        onChange={referenceLabelChangeHandler(idx)}
                        value={reference.label}
                        label="Enter page # or voice/video time"
                      /> */}
                      <div className="LinkDeleteButton">
                        {/* <MemoizedMetaButton
                          onClick={deleteLink(idx, "Reference")}
                          tooltip="Delete the link to this reference."
                          tooltipPosition="Right"
                        >
                          <i className="material-icons grey-text">delete_forever</i>
                        </MemoizedMetaButton> */}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </>
        )}
        {props.editable && (
          <>
            {props.openPart === "LinkingWords" && !props.isNew && nodeBookState.selectedNode === props.identifier ? (
              <div>Link to an existing parent node.</div>
            ) : (
              // <MemoizedMetaButton
              //   onClick={choosingNewLinkedNode("Parent")}
              //   tooltip="Link to an existing parent node."
              //   tooltipPosition="Left"
              // >
              //   <i className="material-icons green-text">arrow_back</i>{" "}
              //   <i className="material-icons green-text">add</i> Link to an existing Parent
              // </MemoizedMetaButton>
              props.openPart === "References" && (
                <Tooltip title="Link to a reference node.">
                  <Button sx={{ display: "flex", alignItems: "center" }}>
                    <MenuBookIcon sx={{ color: "#f9a825" }} />
                    <AddIcon sx={{ color: "#00E676" }} />
                    <span>Cite an existing Reference</span>
                  </Button>
                </Tooltip>
                // <MemoizedMetaButton
                //   onClick={choosingNewLinkedNode("Reference")}
                //   tooltip="Link to a reference node."
                //   tooltipPosition="Left"
                // >
                //   <i className="material-icons yellow-text">menu_book</i>{" "}
                //   <i className="material-icons green-text">add</i> Cite an existing Reference
                // </MemoizedMetaButton>
              )
            )}
            <div className="ProposalCommentSubmitButton">
              <Button
                color="error"
                variant="contained"
                className="btn waves-effect waves-light hoverable red"
                onClick={props.closeSideBar}
                // tooltip="Click to cancel this proposal."
                // tooltipPosition="bottom"
              >
                Cancel
              </Button>
              <Button
                color="success"
                variant="contained"
                className="btn waves-effect waves-light hoverable green"
                onClick={proposalSubmit}
                // tooltip="Click to submit this proposed node."
                // tooltipPosition="bottom"
              >
                {/* <i className="material-icons grey-text">send</i> */}
                {/* Propose {props.isNew ? "Node" : "Version"} */}
                Propose
              </Button>
            </div>
          </>
        )}
      </div>
      <div className="LearnAfter">
        {props.openPart === "References" && (
          <>
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
                    // linkedNodeTitle={tag}
                    linkedNodeType="tag"
                    iClassName="local_offer"
                  />
                  {props.editable && (
                    <div className="LinkDeleteButton">
                      <Tooltip title="Delete the link to this tag." placement="right">
                        <DeleteForeverIcon />
                      </Tooltip>
                      {/* CHECK */}
                      {/* <MemoizedMetaButton
                        onClick={deleteLink(idx, "Tag")}
                        tooltip="Delete the link to this tag."
                        tooltipPosition="Right"
                      >
                        <i className="material-icons grey-text">delete_forever</i>
                      </MemoizedMetaButton> */}
                    </div>
                  )}
                </div>
              );
            })}
            {props.editable && props.openPart === "References" && (
              <Tooltip title="Delete the link to this child." placement="right">
                <DeleteForeverIcon />
              </Tooltip>
              // CHECK
              // <MemoizedMetaButton
              //   onClick={choosingNewLinkedNode("Tag")}
              //   tooltip="Link to a node."
              //   tooltipPosition="Left"
              // >
              //   <i className="material-icons orange-text">local_offer</i>{" "}
              //   <i className="material-icons green-text">add</i> Add an existing Tag
              // </MemoizedMetaButton>
            )}
          </>
        )}
        {props.openPart === "LinkingWords" && (
          <>
            <strong>Children (Follow-ups)</strong>
            {props.nodesChildren.map((child: any) => {
              return (
                <div key={props.identifier + "LinkTo" + child.node + "DIV"}>
                  <LinkingButton
                    key={props.identifier + "LinkTo" + child.node}
                    onClick={props.openLinkedNode}
                    // nodeID={props.identifier}
                    linkedNodeID={child.node}
                    linkedNodeTitle={child.title}
                    linkedNodeType="child"
                    nodeType={child.nodeType}
                    visible={child.visible}
                  />
                  {props.editable && (
                    <div className="LinkDeleteButton">
                      <MemoizedMetaButton
                        onClick={deleteLink(idx, "Child")}
                        tooltip="Delete the link to this child."
                        tooltipPosition="right"
                      >
                        <DeleteForeverIcon />
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
          </>
        )}
        {props.editable &&
          !props.isNew &&
          nodeBookState.selectedNode === props.identifier &&
          props.openPart === "LinkingWords" && (
            <div>LinkingWords</div>
            // CHECKED
            // <MemoizedMetaButton
            //   onClick={choosingNewLinkedNode("Child")}
            //   tooltip="Link to an existing child node."
            //   tooltipPosition="Right"
            // >
            //   Link to an existing Child node <i className="material-icons green-text">add</i>{" "}
            //   <i className="material-icons green-text">arrow_forward</i>
            // </MemoizedMetaButton>
          )}
      </div>
    </div>
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
