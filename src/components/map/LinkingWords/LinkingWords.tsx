// import "./LinkingWords.css";
// import Button from "@material-ui/core/Button";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import LaunchIcon from "@mui/icons-material/Launch";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import { Box, Button, IconButton, Link, Tooltip } from "@mui/material";
import React, { MutableRefObject, useCallback, useMemo } from "react";
import { DispatchNodeBookActions, TNodeBookState } from "src/nodeBookTypes";

// import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
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

const separateURL = (text: string, url: string): [boolean, any] => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const matches = url.match(urlRegex);
  if (matches && matches.length > 0) {
    return [
      true,
      // eslint-disable-next-line react/jsx-key
      <Link
        href={matches[0]}
        target="_blank"
        rel="noreferrer"
        sx={{
          display: "grid",
          placeItems: "center",
          color: "#bebebe",
          ":hover": {
            color: theme => theme.palette.common.orange,
          },
        }}
      >
        <LaunchIcon sx={{ fontSize: "16px" }} /> {/* {text} */}
      </Link>,
    ];
  } else {
    return [false, url];
  }
};

type LinkingWordsProps = {
  notebookRef: MutableRefObject<TNodeBookState>;
  nodeBookDispatch: React.Dispatch<DispatchNodeBookActions>;
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
  openAllParent: any;
  saveProposedChildNode: any;
  saveProposedImprovement: any;
  closeSideBar: any;
  ableToPropose?: boolean;
  setAbleToPropose: (value: boolean) => void;
  isLoading: boolean;
  onResetButton: (newState: boolean) => void;
  setOperation: (operation: string) => void;
  disabled?: boolean;
  enableChildElements?: string[];
  nodeType: any;
};

const LinkingWords = ({
  notebookRef,
  nodeBookDispatch,
  identifier,
  editable,
  isNew,
  openPart,
  references,
  tags,
  parents,
  nodesChildren,
  referenceLabelChange,
  openLinkedNode,
  openAllChildren,
  openAllParent,
  setAbleToPropose,
  disabled,
  enableChildElements = [],
  nodeType,
  deleteLink,
}: LinkingWordsProps) => {
  const disableAddReference = disabled;
  const disableAddTag = disabled;
  const disableRemoveReference = disabled;
  const disableRemoveTag = disabled;

  // const referenceLabelChangeHandler = useCallback(
  //   (idx: any) => {
  //     return (event: any) => {
  //       return referenceLabelChange(event, idx);
  //     };
  //   },
  //   // TODO: check dependencies to remove eslint-disable-next-line
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  //   [referenceLabelChange]
  // );
  const referenceLabelChangeHandler = useCallback(
    (newLabel: string, idx: number) => {
      referenceLabelChange(newLabel, identifier, idx);
      setAbleToPropose(true);
    },
    [referenceLabelChange, setAbleToPropose]
  );

  const choosingNewLinkedNode = useCallback(
    (linkType: any) => (/*event: any*/) => {
      // if (!isSubmitting) {
      // setChoosingType(linkType);
      {
        // if (linkType === "Reference") {
        //   let nodes = [...graph.nodes];
        //   let edges = [...graph.edges];
        //   const removableNodes = nodes.filter(
        //     node => node.nodeType !== linkType && node.id !== identifier
        //   );
        //   nodes = nodes.filter(
        //     node => node.nodeType === linkType || node.id === identifier
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
      notebookRef.current.choosingNode = { id: identifier, type: linkType, impact: "node" };
      notebookRef.current.selectedNode = identifier;
      notebookRef.current.chosenNode = null;
      nodeBookDispatch({ type: "setChoosingNode", payload: { id: identifier, type: linkType } });
      nodeBookDispatch({ type: "setSelectedNode", payload: identifier });
      nodeBookDispatch({ type: "setChosenNode", payload: null });
      // setChoosingNode(identifier);
      // }
    },
    // TODO: check dependencies to remove eslint-disable-next-line
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [identifier]
  );

  const onDeleteLink = useCallback(
    (idx: any, linkType: any) => (/*event: any*/) => {
      deleteLink(idx, linkType);
      setAbleToPropose(true);
    },
    // TODO: check dependencies to remove eslint-disable-next-line
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [deleteLink, setAbleToPropose]
  );
  const lockedTags = useMemo(() => {
    return tags.filter((tag: any) => tag.locked);
  }, [tags]);

  return openPart === "LinkingWords" || openPart === "Tags" || openPart === "References" ? (
    <Box id={`${identifier}-linking-words`}>
      {/* <Box
        sx={{
          mx: "10px",

          borderTop: theme =>
            theme.palette.mode === "dark" ? `solid 1px ${theme.palette.common.borderColor}` : "solid 1px",
        }}
      /> */}
      <Box
        // className="LinkingWordsContainer card-action"
        sx={{
          py: "8px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          background: theme => (theme.palette.mode === "dark" ? "#303134" : "#EAECF0"),
        }}
      >
        <Box
          className="LearnBefore"
          sx={{
            p: "10px 6px 10px 13px",
          }}
        >
          {openPart === "LinkingWords" && (
            <Box id={`${identifier}-parents-list`} sx={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <strong>Parents (Prerequisites)</strong>

              {parents.map((parent: any, idx: number) => {
                return (
                  <Box
                    id={`${identifier}-parent-button-${idx}`}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: editable && parents.length > 1 ? "1fr 32px" : "1fr",
                      alignItems: "center",
                    }}
                    key={identifier + "LinkTo" + parent.node}
                  >
                    <LinkingButton
                      onClick={openLinkedNode}
                      // nodeID={identifier}
                      linkedNodeID={parent.node}
                      linkedNodeTitle={parent.title}
                      linkedNodeType="parent"
                      nodeType={parent.type}
                      visible={parent.visible}
                      disabled={disabled && !enableChildElements.includes(`${identifier}-parent-button-${idx}`)}
                      removed={parent.removed}
                      added={parent.added}
                    />
                    {editable && parents.length > 1 && (
                      <Tooltip
                        title="Delete the link to this parent."
                        placement="right"
                        sx={{
                          color: "#bebebe",
                          ":hover": {
                            color: theme => theme.palette.common.orange,
                          },
                        }}
                      >
                        <IconButton onClick={onDeleteLink(idx, "Parent")}>
                          <DeleteForeverIcon sx={{ fontSize: "16px" }} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                );
              })}
              {parents.length > 0 && !isNew && !editable && (
                <Button
                  onClick={() =>
                    openAllParent({
                      parents,
                      node: identifier,
                    })
                  }
                  sx={{
                    justifyContent: "stretch",
                    textAlign: "left",
                    ":hover": {
                      background: "transparent",
                    },
                  }}
                >
                  Open All Parents
                </Button>
              )}

              {editable && !isNew && notebookRef.current.selectedNode === identifier && (
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
              )}
            </Box>
          )}

          {openPart === "References" && nodeType !== "Reference" && (
            <Box id={`${identifier}-node-references`} sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <strong>References</strong>

              {references.map((reference: any, idx: number) => {
                let refTitle = reference.title;
                let urlRefLabel = [false, false];
                if ("label" in reference && reference.label !== "") {
                  const separatedURL = separateURL(reference.title ?? "", reference.label ?? "");
                  if (separatedURL[0]) {
                    urlRefLabel = separatedURL;
                  } else {
                    refTitle += ": " + reference.label;
                  }
                }
                return (
                  <Box
                    key={identifier + "LinkTo" + reference.node + "DIV"}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "1fr 32px",
                      gridTemplateRows: "auto",
                      alignItems: "center",
                      gap: "1px 4px",
                    }}
                  >
                    <Box sx={{ gridColumn: urlRefLabel[0] || editable ? "1 / 2" : "1 / span 2" }}>
                      <LinkingButton
                        id={`${identifier}-reference-button-${idx}`}
                        key={identifier + "LinkTo" + reference.node}
                        onClick={openLinkedNode}
                        // nodeID={identifier}
                        linkedNodeID={reference.node}
                        // linkedNodeTitle={refTitle+(reference.label?':'+{reference.label}:'')}
                        linkedNodeTitle={refTitle}
                        linkedNodeType="reference"
                        iClassName="menu_book"
                        disabled={disabled && !enableChildElements.includes(`${identifier}-reference-button-${idx}`)}
                        removed={reference.removed}
                        added={reference.added}
                      />
                    </Box>
                    {editable && (
                      <>
                        <Tooltip
                          title="Delete the link to this reference."
                          placement="right"
                          sx={{
                            color: "#bebebe",
                            ":hover": {
                              color: theme => theme.palette.common.orange,
                            },
                          }}
                        >
                          <IconButton onClick={onDeleteLink(idx, "Reference")} disabled={disableRemoveReference}>
                            <DeleteForeverIcon sx={{ fontSize: "16px" }} />
                          </IconButton>
                        </Tooltip>

                        <ReferenceLabelInput
                          key={identifier + "LinkTo" + reference.node + "Label"}
                          inputProperties={{
                            id: identifier + "LinkTo" + reference.node + "Label",
                            name: identifier + "LinkTo" + reference.node + "Label",
                          }}
                          referenceLabelChangeHandler={(newLabel: string) => referenceLabelChangeHandler(newLabel, idx)}
                          reference={reference}
                        />
                      </>
                    )}

                    {urlRefLabel[0] && (
                      <Tooltip
                        title=" Open link in new tab."
                        placement="right"
                        sx={{
                          color: "#bebebe",
                          ":hover": {
                            color: theme => theme.palette.common.orange,
                          },
                        }}
                      >
                        <IconButton>{urlRefLabel[1]}</IconButton>
                      </Tooltip>
                    )}
                  </Box>
                );
              })}

              {editable && (
                <Box
                  id={`${identifier}-link-reference-button`}
                  sx={{ display: "flex", flexDirection: "column", gap: "16px" }}
                >
                  <MemoizedMetaButton
                    disabled={disableAddReference}
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
                </Box>
              )}
            </Box>
          )}
        </Box>

        {/* <Box sx={{ mx: "10px", borderLeft: "solid 1px" }} /> */}

        <Box
          className="LearnAfter"
          sx={{
            borderLeft: theme => (theme.palette.mode === "dark" ? `solid 1px #404040` : "solid 1px #D0D5DD"),
            // border: "solid 1px royalBlue",
            p: "10px 13px 10px 13px",
          }}
        >
          {openPart === "References" && (
            //StyleRef, f-size from Map.css ln 71
            <Box
              id={`${identifier}-node-tags`}
              sx={{ display: "flex", flexDirection: "column", gap: "5px", fontSize: "16px" }}
            >
              {lockedTags.length > 0 && (
                <Box
                  sx={{
                    borderBottom: theme => (theme.palette.mode === "dark" ? `solid 1px #404040` : "solid 1px #D0D5DD"),
                  }}
                >
                  <strong>Courses</strong>
                  {lockedTags.map((tag: any, idx: number) => {
                    return (
                      <Box
                        sx={{
                          display: "flex",
                          //gridTemplateColumns: editable && tags.length ? "1fr 32px" : "1fr",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                        key={identifier + "LinkTo" + tag.node + "DIV"}
                      >
                        <LinkingButton
                          id={`${identifier}-tag-button-${idx}`}
                          key={identifier + "LinkTo" + tag.node}
                          onClick={openLinkedNode}
                          linkedNodeID={tag.node}
                          linkedNodeTitle={tag.title}
                          linkedNodeType="tag"
                          iClassName="locked_tag"
                          disabled={disabled && !enableChildElements.includes(`${identifier}-tag-button-${idx}`)}
                          removed={tag.removed}
                          added={tag.added}
                        />
                        {editable && (
                          <Tooltip
                            title="Delete the link to this tag."
                            placement="right"
                            sx={{
                              color: "#bebebe",
                              ":hover": {
                                color: theme => theme.palette.common.orange,
                              },
                            }}
                          >
                            <IconButton onClick={onDeleteLink(tag.index, "Tag")} disabled={disableRemoveTag}>
                              <DeleteForeverIcon sx={{ fontSize: "16px" }} />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    );
                  })}
                </Box>
              )}
              <strong>Tags</strong>
              {tags
                .filter((tag: any) => !tag.locked)
                .map((tag: any, idx: number) => {
                  return (
                    <Box
                      sx={{
                        display: "flex",
                        //gridTemplateColumns: editable && tags.length ? "1fr 32px" : "1fr",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                      key={identifier + "LinkTo" + tag.node + "DIV"}
                    >
                      <LinkingButton
                        id={`${identifier}-tag-button-${idx}`}
                        key={identifier + "LinkTo" + tag.node}
                        onClick={openLinkedNode}
                        linkedNodeID={tag.node}
                        linkedNodeTitle={tag.title}
                        linkedNodeType="tag"
                        iClassName="local_offer"
                        disabled={disabled && !enableChildElements.includes(`${identifier}-tag-button-${idx}`)}
                        removed={tag.removed}
                        added={tag.added}
                      />
                      {editable && (
                        <Tooltip
                          title="Delete the link to this tag."
                          placement="right"
                          sx={{
                            color: "#bebebe",
                            ":hover": {
                              color: theme => theme.palette.common.orange,
                            },
                          }}
                        >
                          <IconButton onClick={onDeleteLink(tag.index, "Tag")} disabled={disableRemoveTag}>
                            <DeleteForeverIcon sx={{ fontSize: "16px" }} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  );
                })}

              {editable && openPart === "References" && (
                <MemoizedMetaButton
                  id={`${identifier}-tag-node`}
                  onClick={choosingNewLinkedNode("Tag")}
                  tooltip="Link to a node."
                  tooltipPosition="left"
                  disabled={disableAddTag}
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

          {openPart === "Tags" && (
            <Box id={`${identifier}-node-tags`} sx={{ fontSize: "16px" }}>
              <strong>Tags</strong>
              {tags.map((tag: any, idx: number) => {
                return (
                  <div key={identifier + "LinkTo" + tag.node + "DIV"}>
                    <LinkingButton
                      key={identifier + "LinkTo" + tag.node}
                      onClick={openLinkedNode}
                      // nodeID={identifier}
                      linkedNodeID={tag.node}
                      linkedNodeTitle={tag.title}
                      linkedNodeType="tag"
                      iClassName="local_offer"
                      disabled={disabled && !enableChildElements.includes(`${identifier}-tag-button-${idx}`)}
                      removed={tag.removed}
                      added={tag.added}
                    />
                    {editable && (
                      <div className="LinkDeleteButton">
                        <MemoizedMetaButton
                          onClick={onDeleteLink(tag.index, "Tag")}
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
          {openPart === "LinkingWords" && (
            <Box id={`${identifier}-children-list`} sx={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <strong>Children (Follow-ups)</strong>
              {nodesChildren.map((child: any, idx: number) => {
                return (
                  <Box
                    id={`${identifier}-child-button-${idx}`}
                    sx={{
                      display: "flex",
                      //gridTemplateColumns: editable && parents.length ? "1fr 32px" : "1fr",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                    key={identifier + "LinkTo" + child.node + "DIV"}
                  >
                    <LinkingButton
                      key={identifier + "LinkTo" + child.node}
                      onClick={openLinkedNode}
                      // nodeID={identifier}
                      linkedNodeID={child.node}
                      linkedNodeTitle={child.title}
                      linkedNodeType="child"
                      nodeType={child.type}
                      visible={child.visible}
                      disabled={disabled && !enableChildElements.includes(`${identifier}-child-button-${idx}`)}
                      removed={child.removed}
                      added={child.added}
                    />
                    {editable && (
                      <Tooltip
                        title="Delete the link to this child."
                        placement="right"
                        sx={{
                          color: "#bebebe",
                          ":hover": {
                            color: theme => theme.palette.common.orange,
                          },
                        }}
                      >
                        <IconButton onClick={onDeleteLink(idx, "Child")}>
                          <DeleteForeverIcon sx={{ fontSize: "16px" }} />
                        </IconButton>
                      </Tooltip>
                      // <div className="LinkDeleteButton">
                      //   <MemoizedMetaButton
                      //     onClick={deleteLink(idx, "Child")}
                      //     tooltip="Delete the link to this child."
                      //     tooltipPosition="right"
                      //   >
                      //     <DeleteForeverIcon sx={{ fontSize: "16px" }} />
                      //   </MemoizedMetaButton>
                      // </div>
                    )}
                  </Box>
                );
              })}
              {nodesChildren.length > 0 && !isNew && !editable && (
                <Button
                  onClick={() =>
                    openAllChildren({
                      children: nodesChildren,
                      node: identifier,
                    })
                  }
                  sx={{
                    justifyContent: "stretch",
                    textAlign: "left",
                    ":hover": {
                      background: "transparent",
                    },
                  }}
                >
                  Open All Children
                </Button>
              )}
              {editable && !isNew && nodeType !== "Reference" && notebookRef.current.selectedNode === identifier && (
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
          )}
        </Box>
      </Box>
    </Box>
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
