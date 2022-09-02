import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import CloseIcon from "@mui/icons-material/Close";
import CreateIcon from "@mui/icons-material/Create";
import DoneIcon from "@mui/icons-material/Done";
import DraftsIcon from "@mui/icons-material/Drafts";
import HeightIcon from "@mui/icons-material/Height";
import ImageIcon from "@mui/icons-material/Image";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import MailIcon from "@mui/icons-material/Mail";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import RecordVoiceOverIcon from "@mui/icons-material/RecordVoiceOver";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import VoiceOverOffIcon from "@mui/icons-material/VoiceOverOff";
import { Box } from "@mui/system";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import React, { useCallback, useRef, useState } from "react";

import { User } from "../../knowledgeTypes";
import shortenNumber from "../../lib/utils/shortenNumber";
import { OpenPart } from "../../nodeBookTypes";
import NodeTypeIcon from "../NodeTypeIcon";
import { MemoizedMetaButton } from "./MetaButton";
import { MemoizedUserStatusIcon } from "./UserStatusIcon";

dayjs.extend(relativeTime);

type NodeFooterProps = {
  open: boolean;
  identifier: any;
  activeNode: any;
  citationsSelected: any;
  proposalsSelected: any;
  acceptedProposalsSelected: any;
  commentsSelected: any;
  editable: any;
  title: any;
  content: any;
  unaccepted: any;
  openPart: OpenPart;
  nodeType: any;
  isNew: any;
  admin: any;
  aImgUrl: any;
  aFullname: any;
  aChooseUname: any;
  viewers: any;
  correctNum: any;
  markedCorrect: any;
  wrongNum: any;
  markedWrong: any;
  references: any;
  tags: any;
  parents: any;
  nodesChildren: any;
  commentsNum: any;
  proposalsNum: any;
  studied: any;
  isStudied: any;
  changed: any;
  changedAt: any;
  bookmarked: any;
  bookmarks: any;
  reloadPermanentGrpah: any;
  markStudied: any;
  bookmark: any;
  nodeChanged: any;
  openNodePart: any;
  selectNode: any;
  correctNode: any;
  wrongNode: any;
  uploadNodeImage: any;
  user: User;
};

const NodeFooter = ({
  open,
  citationsSelected,
  editable,
  title,
  content,
  unaccepted,
  nodeType,
  isNew,
  admin,
  aImgUrl,
  aFullname,
  aChooseUname,
  correctNum,
  markedCorrect,
  wrongNum,
  markedWrong,
  references,
  tags,
  parents,
  nodesChildren,
  studied,
  isStudied,
  changedAt,
  bookmarked,
  bookmarks,
  reloadPermanentGrpah,
  markStudied,
  bookmark,
  nodeChanged,
  openNodePart,
  selectNode,
  correctNode,
  wrongNode,
  uploadNodeImage,
  user,
}: NodeFooterProps) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [percentageUploaded, setPercentageUploaded] = useState(0);
  const inputEl = useRef<HTMLInputElement>(null);

  const selectReferences = useCallback(
    (event: any) => {
      openNodePart(event, "References");
    },
    [openNodePart]
  );

  const selectPendingProposals = useCallback(
    (event: any) => {
      selectNode(event, "Proposals");
    },
    [selectNode]
  );
  const uploadNodeImageHandler = useCallback(
    (event: any) => uploadNodeImage(event, isUploading, setIsUploading, setPercentageUploaded),
    [uploadNodeImage, isUploading]
  );
  const selectLinkingWords = useCallback(
    (event: any) => {
      openNodePart(event, "LinkingWords");
    },
    [openNodePart]
  );

  const narrateNode = useCallback(() => {
    if (!window.speechSynthesis.speaking) {
      const msg = new SpeechSynthesisUtterance("Node title: " + title + " \n " + "Node content: " + content);
      window.speechSynthesis.speak(msg);
      setIsSpeaking(true);
      //   window.speechSynthesis.onend = () => {
      //   setIsSpeaking(false);
      // };
    } else {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [title, content]);
  const uploadImageClicked = useCallback(() => {
    if (!inputEl?.current) return;

    inputEl.current.click();
  }, [inputEl]);

  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: "10px" }}>
      <Box className="NodeFooter Left" sx={{ display: "flex", alignItems: "center" }}>
        {open &&
          (isNew ? (
            //   <UserStatusIcon
            //     uname={username}
            //     imageUrl={imageUrl}
            //     fullname={fName + " " + lName}
            //     chooseUname={chooseUname}
            //     online={false}
            //     inUserBar={false}
            //     inNodeFooter={true}
            //     reloadPermanentGrpah={reloadPermanentGrpah}
            //   />
            // ) : (
            //   <UserStatusIcon
            //     uname={admin}
            //     imageUrl={aImgUrl}
            //     fullname={aFullname}
            //     chooseUname={aChooseUname}
            //     online={false}
            //     inUserBar={false}
            //     inNodeFooter={true}
            //     reloadPermanentGrpah={reloadPermanentGrpah}
            //   />
            <MemoizedUserStatusIcon
              uname={user.uname}
              imageUrl={user.imageUrl || ""}
              fullname={user.fName + " " + user.lName}
              chooseUname={user.chooseUname}
              online={false}
              inUserBar={false}
              inNodeFooter={true}
              reloadPermanentGrpah={reloadPermanentGrpah}
            />
          ) : (
            <MemoizedUserStatusIcon
              uname={admin}
              imageUrl={aImgUrl}
              fullname={aFullname}
              chooseUname={aChooseUname}
              online={false}
              inUserBar={false}
              inNodeFooter={true}
              reloadPermanentGrpah={reloadPermanentGrpah}
            />
          ))}
        <div
          className={open ? "NodeTypeIconOpen Tooltip" : "NodeTypeIconClosed Tooltip"}
          style={{ display: "flex", alignItems: "center" }}
        >
          {/* <NodeTypeIcon nodeType={nodeType} /> */}
          <NodeTypeIcon nodeType={nodeType} tooltipPlacement={"top"} />
          {/* <span
            className={"TooltipText " + (open ? "Top" : "Bottom")}
            onClick={preventEventPropagation}
          >
            This is{" "}
            {nodeType[0] == "A" ||
              nodeType[0] == "E" ||
              nodeType[0] == "I" ||
              nodeType[0] == "O" ||
              nodeType[0] == "U"
              ? "an"
              : "a"}{" "}
            "{nodeType}" node.
          </span> */}
        </div>
      </Box>
      <Box className="NodeFooter Right" sx={{ display: "flex", alignItems: "center" }}>
        {open ? (
          <>
            {!editable && !unaccepted ? (
              // Accepted nodes
              <>
                <MemoizedMetaButton onClick={nodeChanged} tooltip="Adjust the node height." tooltipPosition="top">
                  <HeightIcon fontSize="inherit" />
                </MemoizedMetaButton>
                <MemoizedMetaButton
                  onClick={narrateNode}
                  tooltip={isSpeaking ? "Stop narration." : "Narrate the node."}
                  tooltipPosition="top"
                >
                  {isSpeaking ? <VoiceOverOffIcon fontSize="inherit" /> : <RecordVoiceOverIcon fontSize="inherit" />}
                </MemoizedMetaButton>
                <MemoizedMetaButton
                  onClick={selectPendingProposals}
                  tooltip="Propose/evaluate versions of this node."
                  // {
                  //   shortenNumber(proposalsNum, 2, false) +
                  //   " proposal" +
                  //   (proposalsNum > 1 ? "s" : "") +
                  //   " exist" +
                  //   (proposalsNum === 1 ? "s" : "") +
                  //   " on this node. Click to propose an improvement or review a proposal on the pending proposals list."
                  // }
                  tooltipPosition="top"
                >
                  <>
                    <CreateIcon fontSize="inherit" />
                    {` ${dayjs(new Date(changedAt)).fromNow()}`}
                  </>
                </MemoizedMetaButton>
                {/* <MemoizedMetaButton
                  onClick={selectAcceptedProposals}
                  tooltip="See version history."
                  tooltipPosition="Top"
                >
                  <i
                    className={
                      "material-icons SeparateIcon " +
                      (acceptedProposalsSelected ? "orange-text" : "grey-text")
                    }
                  >
                    event_available
                  </i>
                  <span>{dayjs(changedAt).fromNow()}</span>
                </MemoizedMetaButton> */}
              </>
            ) : (
              // new Node or unaccepted proposal

              // {/* CHECK: I commented this, please uncomented when work in proposal */}
              <>
                <input type="file" ref={inputEl} onChange={uploadNodeImageHandler} hidden />
                <MemoizedMetaButton
                  onClick={uploadImageClicked}
                  tooltip="Upload an image for this node."
                  tooltipPosition="top"
                >
                  <>
                    <ImageIcon fontSize="small" />
                    {isUploading && (
                      <>
                        <div className="preloader-wrapper active inherit ImageUploadButtonLoader">
                          <div className="spinner-layer spinner-yellow-only">
                            <div className="circle-clipper left">
                              <div className="circle"></div>
                            </div>
                          </div>
                        </div>
                        <span className="ImageUploadPercentage">{percentageUploaded + "%"}</span>
                      </>
                    )}
                  </>
                </MemoizedMetaButton>
              </>
            )}
            {!editable && !unaccepted && nodeType === "Reference" ? (
              <>
                <MemoizedMetaButton
                  onClick={() => console.log("selectCitations")}
                  tooltip="View nodes that have cited this node."
                  tooltipPosition="top"
                >
                  <>
                    {citationsSelected ? (
                      <>
                        <ArrowForwardIcon fontSize="inherit" sx={{ color: theme => theme.palette.common.orange }} />
                        <MenuBookIcon fontSize="inherit" sx={{ color: theme => theme.palette.common.orange }} />
                      </>
                    ) : (
                      <>
                        <ArrowForwardIcon fontSize="inherit" />
                        <MenuBookIcon fontSize="inherit" />
                      </>
                    )}
                    <span>{shortenNumber(10, 2, false)}</span>
                  </>
                </MemoizedMetaButton>

                <MemoizedMetaButton
                  onClick={() => console.log("selectTags")}
                  tooltip="View tags assigned to this node."
                  tooltipPosition="top"
                >
                  <>
                    <LocalOfferIcon fontSize="inherit" />
                    <span>{shortenNumber(tags.length, 2, false)}</span>
                  </>
                </MemoizedMetaButton>
              </>
            ) : (
              <MemoizedMetaButton
                onClick={selectReferences}
                tooltip="View tags and citations used in this node."
                tooltipPosition="top"
              >
                <>
                  <MenuBookIcon fontSize="inherit" />
                  <span className="CitationsSpanBeforeTagIcon">{shortenNumber(references.length, 2, false)}</span>
                  <Box component={"span"} sx={{ mx: "5px" }}>
                    {" "}
                    |{" "}
                  </Box>
                  <LocalOfferIcon fontSize="inherit" />
                  <span>{shortenNumber(tags.length, 2, false)}</span>
                </>
              </MemoizedMetaButton>
            )}
            {!editable && !unaccepted && (
              <>
                <MemoizedMetaButton onClick={wrongNode} tooltip="Vote to delete node." tooltipPosition="top">
                  <>
                    <CloseIcon fontSize="inherit" sx={{ color: markedCorrect ? "red" : "inherit" }} />
                    <span>{shortenNumber(wrongNum, 2, false)}</span>
                  </>
                </MemoizedMetaButton>

                <MemoizedMetaButton
                  onClick={correctNode}
                  tooltip="Vote to prevent further changes."
                  tooltipPosition="top"
                >
                  <>
                    <DoneIcon fontSize="inherit" sx={{ color: markedCorrect ? "green" : "inherit" }} />
                    <span>{shortenNumber(correctNum, 2, false)}</span>
                  </>
                </MemoizedMetaButton>

                <MemoizedMetaButton
                  onClick={bookmark}
                  tooltip="Bookmark this node."
                  // {
                  //   `You've ${
                  //     !bookmarked ? "not " : ""
                  //   }bookmarked this node. ` +
                  //   shortenNumber(bookmarks, 2, false) +
                  //   " 1Cademist" +
                  //   (bookmarks === 1 ? " has" : "s have") +
                  //   " bookmarked this node."
                  // }
                  tooltipPosition="top"
                >
                  <>
                    {bookmarked ? <BookmarkIcon fontSize="inherit" /> : <BookmarkBorderIcon fontSize="inherit" />}
                    <span>{shortenNumber(bookmarks, 2, false)}</span>
                  </>
                </MemoizedMetaButton>
                <MemoizedMetaButton
                  onClick={markStudied}
                  tooltip={!isStudied ? 'Mark this node as "studied."' : 'Mark this node as "not studied."'}
                  // {
                  //   (!isStudied
                  //     ? "You've not marked this node as Studied. "
                  //     : `This node is ${
                  //         changed ? "changed" : "not chagned"
                  //       } since the last time you marked it as Studied. `) +
                  //   shortenNumber(studied, 2, false) +
                  //   " 1Cademist" +
                  //   (studied === 1 ? " has" : "s have") +
                  //   " studied this node."
                  // }
                  tooltipPosition="top"
                >
                  <>
                    {isStudied ? <DraftsIcon fontSize="inherit" /> : <MailIcon fontSize="inherit" />}
                    <span>{shortenNumber(studied, 2, false)}</span>
                  </>
                </MemoizedMetaButton>
                {/* <MemoizedMetaButton
                  onClick={event => {}}
                  tooltip="# of comments and Q&amp;As about this node."
                    tooltipPosition="Top"
                >
                  <i
                    className={
                      "material-icons " + 
                      (activeNode &&
                      commentsSelected
                        ? "orange-text"
                        : "grey-text"
                      )}
                  >forum</i>
                  <span>{shortenNumber(commentsNum, 2, false)}</span>
                </MemoizedMetaButton> */}
                {/* <MemoizedMetaButton
                    tooltip="# of 1Admins who have awarded this node."
                    tooltipPosition="Top"
                  >
                  <i
                    className={"material-icons "
                      (markedAdmired
                        ? "amber-text"
                        : "amber-text text-lighten-3")
                    }
                  >grade</i>
                  <span>{shortenNumber(admiredNum, 2, false)}</span>
                </MemoizedMetaButton> */}

                {/* <MemoizedMetaButton
                    tooltip="# of 1Cademists who have this node visible on their map."
                    tooltipPosition="Top"
                  >
                  <i className="material-icons grey-text">visibility</i>
                  <span>{shortenNumber(viewers, 2, false)}</span>
                </MemoizedMetaButton> */}
              </>
            )}
            <MemoizedMetaButton
              onClick={selectLinkingWords}
              tooltip="View parent and child nodes."
              // {
              //   "This node has " +
              //   shortenNumber(parents.length, 2, false) +
              //   " parent node" +
              //   (parents.length === 1 ? "" : "s") +
              //   " and " +
              //   shortenNumber(children.length, 2, false) +
              //   " child node" +
              //   (children.length === 1 ? "." : "s.") +
              //   " Click to see the child and parent nodes of this node."
              // }
              tooltipPosition="top"
            >
              <>
                <span className="FooterParentNodesOpen">{shortenNumber(parents.length, 2, false)}</span>
                <SwapHorizIcon fontSize="inherit" />
                <span>{shortenNumber(nodesChildren.length, 2, false)}</span>
              </>
            </MemoizedMetaButton>
          </>
        ) : (
          <>
            <MemoizedMetaButton
              tooltip={
                shortenNumber(correctNum, 2, false) +
                " 1Cademist" +
                (correctNum === 1 ? " has" : "s have") +
                " found this node helpful and " +
                shortenNumber(wrongNum, 2, false) +
                " found it unhelpful."
              }
            >
              <Box sx={{ display: "flex", alignItems: "center", p: "4px 7px", fontSize: "15px" }}>
                <CloseIcon fontSize="inherit" sx={{ color: markedWrong ? "red" : "inherit" }} />
                <span>{shortenNumber(wrongNum, 2, false)}</span>
                <DoneIcon fontSize="inherit" sx={{ color: markedCorrect ? "green" : "inherit" }} />
                <span>{shortenNumber(wrongNum, 2, false)}</span>
              </Box>
            </MemoizedMetaButton>
            <MemoizedMetaButton
              tooltip={
                `You've ${!bookmarked ? "not " : ""}bookmarked this node. ` +
                shortenNumber(bookmarks, 2, false) +
                " 1Cademist" +
                (bookmarks === 1 ? " has" : "s have") +
                " bookmarked this node."
              }
            >
              <Box sx={{ display: "flex", alignItems: "center", p: "4px 7px", fontSize: "15px" }}>
                {bookmarked ? (
                  <BookmarkIcon fontSize="inherit" className={"orange-text"} />
                ) : (
                  <BookmarkBorderIcon fontSize="inherit" className={"grey-text"} />
                )}
                <span>{shortenNumber(bookmarks, 2, false)}</span>
              </Box>
            </MemoizedMetaButton>

            <MemoizedMetaButton
              tooltip={
                "This node has " +
                shortenNumber(parents.length, 2, false) +
                " parent node" +
                (parents.length === 1 ? "" : "s") +
                " and " +
                shortenNumber(nodesChildren.length, 2, false) +
                " child node" +
                (nodesChildren.length === 1 ? "." : "s.")
              }
            >
              <Box sx={{ display: "flex", alignItems: "center", p: "4px 7px", fontSize: "15px" }}>
                <span /*className="FooterParentNodesClosed"*/>{shortenNumber(parents.length, 2, false)}</span>
                <SwapHorizIcon fontSize="inherit" />
                <span>{shortenNumber(nodesChildren.length, 2, false)}</span>
              </Box>
            </MemoizedMetaButton>

            {/* <MemoizedMetaButton tooltip="# of 1Cademists who have this node visible on their map.">
              <i className="material-icons grey-text">visibility</i>
              <span>{shortenNumber(viewers, 2, false)}</span>
            </MemoizedMetaButton> */}

            {/* <MemoizedMetaButton tooltip="# of 1Cademists who have studied this node.">
              <i
                className={
                  "material-icons " + (
                  studied
                    ? "orange-text"
                    : "grey-text"
                  )}
              >school</i>
              <span>{shortenNumber(studied, 2, false)}</span>
            </MemoizedMetaButton> */}
          </>
        )}
      </Box>
    </Box>
  );
};

export const MemoizedNodeFooter = React.memo(NodeFooter);
