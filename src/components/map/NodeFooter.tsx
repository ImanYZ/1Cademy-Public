import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import CloseIcon from "@mui/icons-material/Close";
import CreateIcon from "@mui/icons-material/Create";
import DoneIcon from "@mui/icons-material/Done";
import DraftsIcon from "@mui/icons-material/Drafts";
import FacebookRoundedIcon from "@mui/icons-material/FacebookRounded";
import ImageIcon from "@mui/icons-material/Image";
import LinkIcon from "@mui/icons-material/Link";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import MailIcon from "@mui/icons-material/Mail";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import RecordVoiceOverIcon from "@mui/icons-material/RecordVoiceOver";
import RedditIcon from "@mui/icons-material/Reddit";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import TwitterIcon from "@mui/icons-material/Twitter";
import VoiceOverOffIcon from "@mui/icons-material/VoiceOverOff";
import { Badge, Button, ClickAwayListener, Divider, MenuItem, Paper, Tooltip } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import { Box } from "@mui/system";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useRef, useState } from "react";

import { useNodeBook } from "@/context/NodeBookContext";
import { OpenSidebar } from "@/pages/notebook";

import { User } from "../../knowledgeTypes";
import shortenNumber from "../../lib/utils/shortenNumber";
import { OpenPart } from "../../nodeBookTypes";
import NodeTypeIcon from "../NodeTypeIcon";
import { ContainedButton } from "./ContainedButton";
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
  simulated?: boolean;
  bookmarked: any;
  bookmarks: any;
  reloadPermanentGrpah: any;
  markStudied: any;
  bookmark: any;
  openNodePart: any;
  selectNode: any;
  correctNode: any;
  wrongNode: any;
  disableVotes: boolean;
  uploadNodeImage: any;
  user: User;
  citations: { [key: string]: Set<string> };
  setOpenSideBar: (sidebar: OpenSidebar) => void;
  locked: boolean;
  openSidebar: any;
};

const NodeFooter = ({
  open,
  identifier,
  // activeNode,
  // proposalsSelected,
  // acceptedProposalsSelected,
  // commentsSelected,
  editable,
  title,
  content,
  unaccepted,
  openPart,
  nodeType,
  isNew,
  admin,
  aImgUrl,
  aFullname,
  aChooseUname,
  // viewers,
  correctNum,
  markedCorrect,
  wrongNum,
  markedWrong,
  references,
  tags,
  parents,
  nodesChildren,
  // commentsNum,
  // proposalsNum,
  studied,
  isStudied,
  // changed,
  changedAt,
  simulated,
  bookmarked,
  bookmarks,
  reloadPermanentGrpah,
  markStudied,
  bookmark,
  openNodePart,
  selectNode,
  correctNode,
  wrongNode,
  disableVotes,
  uploadNodeImage,
  user,
  setOpenSideBar,
  locked,
  openSidebar,
}: NodeFooterProps) => {
  const router = useRouter();
  const { nodeBookState } = useNodeBook();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [percentageUploaded, setPercentageUploaded] = useState(0);
  const [url, setUrl] = useState("");
  const inputEl = useRef<HTMLInputElement>(null);
  const [openMenu, setOpenMenu] = useState(false);

  const messageTwitter = () => {
    return `1Cademy - Collaboratively Designing Learning Pathways
        ${encodeURIComponent(url)}`;
  };

  useEffect(() => {
    const URL = window.location.href;
    setUrl(URL);
  }, [router]);

  const handleClick = () => {
    setOpenMenu(true);
  };

  const handleClose = () => {
    setOpenMenu(false);
  };

  const onShareByLink = () => {
    let { protocol, hostname, port } = new URL(window.location.href);
    let hostName = hostname;
    if (port) {
      hostName = hostName + ":" + port;
    }
    let url: any = protocol + "//" + hostName + "/n/" + identifier;
    navigator.clipboard.writeText(url);
    setOpenMenu(false);
  };

  const selectReferences = useCallback(
    (event: any) => {
      openNodePart(event, "References");
    },
    [openNodePart]
  );
  const selectTags = useCallback(
    (event: any) => {
      openNodePart(event, "Tags");
    },
    [openNodePart]
  );
  const selectPendingProposals = useCallback(
    (event: any) => {
      // if (nodeBookState.selectedNode === identifier) {
      //   console.log("this is selected");
      // }
      // TODO: remove openEditButton and nodeId global states
      // openNodePart(event, "PendingProposals");
      // if (nodeBookState.nodeId != identifier) {
      //   nodeBookDispatch({
      //     type: "setOpenEditButton",
      //     payload: { status: true, nodeId: identifier },
      //   });
      // } else {
      //   nodeBookDispatch({
      //     type: "setOpenEditButton",
      //     payload: { status: !nodeBookState.openEditButton, nodeId: identifier },
      //   });
      // }
      selectNode(event, "Proposals"); // Pass correct data
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
      msg.onend = () => {
        setIsSpeaking(false);
      };
    } else {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [title, content]);
  const uploadImageClicked = useCallback(() => {
    inputEl?.current?.click();
  }, [inputEl]);

  const selectCitations = useCallback(
    (event: any) => {
      selectNode(event, "Citations");
    },
    [selectNode]
  );

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        mt: "10px",
        marginBottom: openSidebar === "PROPOSALS" || openPart ? "0px" : "10px",
      }}
    >
      <Box className="NodeFooter Left" sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
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
              setOpenSideBar={setOpenSideBar}
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
              setOpenSideBar={setOpenSideBar}
            />
          ))}
        <div
          className={open ? "NodeTypeIconOpen Tooltip" : "NodeTypeIconClosed Tooltip"}
          style={{ display: "flex", alignItems: "center", fontSize: "16px" }} // font size refL Map.css ln 71
        >
          {/* <NodeTypeIcon nodeType={nodeType} /> */}
          {locked && <NodeTypeIcon nodeType={"locked"} tooltipPlacement={"top"} fontSize={"inherit"} />}
          {!locked && <NodeTypeIcon nodeType={nodeType} tooltipPlacement={"top"} fontSize={"inherit"} />}

          {open && (
            <Box sx={{ display: editable || simulated ? "none" : "flex", alignItems: "center", marginLeft: "10px" }}>
              {openSidebar === "PROPOSALS" && nodeBookState.selectedNode === identifier ? (
                <Box
                  onClick={selectPendingProposals}
                  className={"select-tab-button-node-footer"}
                  sx={{
                    background: theme =>
                      theme.palette.mode === "dark" ? theme.palette.common.darkBackground1 : "#DCDCDC",
                    cursor: "pointer",
                  }}
                >
                  <CreateIcon sx={{ fontSize: "16px" }} />
                  <span>{` ${dayjs(new Date(changedAt)).fromNow()}`}</span>
                </Box>
              ) : (
                <ContainedButton
                  title="Propose/evaluate versions of this node."
                  onClick={selectPendingProposals}
                  tooltipPosition="top"
                  sx={{
                    background: (theme: any) =>
                      theme.palette.mode === "dark"
                        ? theme.palette.common.darkBackground1
                        : theme.palette.common.lightBackground1,
                    fontWeight: 400,
                    color: "inherit",
                    ":hover": {
                      borderWidth: "0px",
                      background: (theme: any) =>
                        theme.palette.mode === "dark"
                          ? theme.palette.common.darkBackground2
                          : theme.palette.common.lightBackground2,
                    },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: "4px", fill: "inherit" }}>
                    <CreateIcon sx={{ fontSize: "16px" }} />
                    <span>{` ${dayjs(new Date(changedAt)).fromNow()}`}</span>
                  </Box>
                </ContainedButton>
              )}

              <Box
                className="tab-double-button-node-footer"
                sx={{
                  background: theme =>
                    theme.palette.mode === "dark"
                      ? theme.palette.common.darkBackground1
                      : theme.palette.common.lightBackground1,
                  display: "flex",
                  alignItems: "center",
                  marginLeft: "10px",
                }}
              >
                <Box
                  sx={{
                    padding: "2px 0px 2px 5px",
                    borderRadius: "52px 0px 0px 52px",
                    ":hover": {
                      background: theme =>
                        theme.palette.mode === "dark"
                          ? theme.palette.common.darkBackground2
                          : theme.palette.common.lightBackground2,
                    },
                  }}
                >
                  <Tooltip title={"Vote to delete node."} placement={"top"}>
                    <Button
                      onClick={wrongNode}
                      disabled={disableVotes}
                      sx={{
                        padding: "0",
                        color: "inherit",
                        fontWeight: 400,
                        minWidth: "40px",
                        ":hover": {
                          color: "inherit",
                          background: "transparent",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          fontSize: "14px",
                          alignItems: "center",
                        }}
                      >
                        <span>{shortenNumber(wrongNum, 2, false)}</span>
                        <CloseIcon
                          sx={{
                            fontSize: "16px",
                            color: markedWrong ? "red" : "inherit",
                            marginLeft: "1px",
                          }}
                        />
                      </Box>
                    </Button>
                  </Tooltip>
                </Box>
                <Divider
                  orientation="vertical"
                  variant="middle"
                  flexItem
                  sx={{
                    borderColor: disableVotes
                      ? "#6A6A6A"
                      : theme => (theme.palette.mode === "dark" ? "#D3D3D3" : "inherit"),
                  }}
                />
                <Box
                  sx={{
                    padding: "2px 5px 2px 5px",
                    borderRadius: "0px 52px 52px 0px",
                    ":hover": {
                      background: theme =>
                        theme.palette.mode === "dark"
                          ? theme.palette.common.darkBackground2
                          : theme.palette.common.lightBackground2,
                    },
                  }}
                >
                  <Tooltip title={"Vote to prevent further changes."} placement={"top"}>
                    <Button
                      onClick={correctNode}
                      disabled={disableVotes}
                      sx={{
                        padding: "0",
                        color: "inherit",
                        fontWeight: 400,
                        minWidth: "40px",
                        ":hover": {
                          color: "inherit",
                          background: "transparent",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          fontSize: "14px",
                          alignItems: "center",
                        }}
                      >
                        <span>{shortenNumber(correctNum, 2, false)}</span>
                        <DoneIcon
                          sx={{ fontSize: "16px", color: markedCorrect ? "#00E676" : "inherit", marginLeft: "1px" }}
                        />
                      </Box>
                    </Button>
                  </Tooltip>
                </Box>
              </Box>
            </Box>
          )}
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
      <Box className="NodeFooter Right" sx={{ display: simulated ? "none" : "flex", alignItems: "center" }}>
        {open ? (
          // REF: Node.css ln 122
          <Box sx={{ display: "flex", alignItems: "center", fontSize: "13px" }}>
            {!editable && !unaccepted ? (
              // Accepted nodes
              <>
                {/* <MemoizedMetaButton
                  onClick={narrateNode}
                  tooltip={isSpeaking ? "Stop narration." : "Narrate the node."}
                  tooltipPosition="top"
                >
                  {isSpeaking ? (
                    <VoiceOverOffIcon sx={{ fontSize: "16px" }} />
                  ) : (
                    <RecordVoiceOverIcon sx={{ fontSize: "16px" }} />
                  )}
                </MemoizedMetaButton> */}

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
                    event_Citing Nodesavailable
                  </i>
                  <span>{dayjs(changedAt).fromNow()}</span>
                </MemoizedMetaButton> */}
              </>
            ) : (
              // new Node or unaccepted proposal

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  marginRight: "10px",
                }}
              >
                <ContainedButton
                  title="View tags and citations used in this node."
                  onClick={() => uploadImageClicked()}
                  tooltipPosition="top"
                  sx={{
                    background: (theme: any) =>
                      theme.palette.mode === "dark"
                        ? theme.palette.common.darkBackground1
                        : theme.palette.common.lightBackground1,
                    color: "inherit",
                    fontWeight: 400,
                    height: "28.7px",
                    ":hover": {
                      borderWidth: "0px",
                      background: (theme: any) =>
                        theme.palette.mode === "dark"
                          ? theme.palette.common.darkBackground2
                          : theme.palette.common.lightBackground2,
                    },
                  }}
                >
                  <>
                    <input type="file" ref={inputEl} onChange={uploadNodeImageHandler} hidden />
                    {isUploading ? (
                      <span style={{ width: "37px", fontSize: "11px", textAlign: "center" }}>
                        {percentageUploaded + "%"}
                      </span>
                    ) : (
                      <ImageIcon sx={{ fontSize: "16px" }} />
                    )}
                  </>
                </ContainedButton>
              </Box>
            )}
            {!editable && !unaccepted && nodeType === "Reference" ? (
              <>
                {openSidebar === "CITATIONS" ? (
                  <Box
                    onClick={selectCitations}
                    className={"select-tab-button-node-footer"}
                    sx={{
                      background: theme =>
                        theme.palette.mode === "dark" ? theme.palette.common.darkBackground1 : "#DCDCDC",
                      cursor: "pointer",
                    }}
                  >
                    <>
                      <ArrowForwardIcon sx={{ fontSize: "16px", color: theme => theme.palette.common.orange }} />
                      <MenuBookIcon sx={{ fontSize: "16px", color: theme => theme.palette.common.orange }} />
                    </>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      marginRight: "10px",
                    }}
                  >
                    <ContainedButton
                      title="View nodes that have cited this node."
                      onClick={selectCitations}
                      tooltipPosition="top"
                      sx={{
                        background: (theme: any) =>
                          theme.palette.mode === "dark"
                            ? theme.palette.common.darkBackground1
                            : theme.palette.common.lightBackground1,
                        color: "inherit",
                        fontWeight: 400,
                        ":hover": {
                          borderWidth: "0px",
                          background: (theme: any) =>
                            theme.palette.mode === "dark"
                              ? theme.palette.common.darkBackground2
                              : theme.palette.common.lightBackground2,
                        },
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: "4px", fill: "inherit", height: "23px" }}>
                        <ArrowForwardIcon sx={{ fontSize: "16px" }} />
                        <MenuBookIcon sx={{ fontSize: "16px" }} />
                      </Box>
                    </ContainedButton>
                  </Box>
                )}

                {openPart === "Tags" ? (
                  <Box
                    onClick={selectTags}
                    className={"select-tab-button-node-footer"}
                    sx={{
                      background: theme =>
                        theme.palette.mode === "dark" ? theme.palette.common.darkBackground1 : "#DCDCDC",
                      cursor: "pointer",
                    }}
                  >
                    <>
                      <LocalOfferIcon
                        // className={openPart === "Tags" ? "orange-text" : "grey-text"}

                        sx={{ fontSize: "16px" }}
                      />
                      <span>{shortenNumber(tags.length, 2, false)}</span>
                    </>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      marginRight: "10px",
                    }}
                  >
                    <ContainedButton
                      title="View tags assigned to this node."
                      onClick={(e: any) => selectTags(e)}
                      tooltipPosition="top"
                      sx={{
                        background: (theme: any) =>
                          theme.palette.mode === "dark"
                            ? theme.palette.common.darkBackground1
                            : theme.palette.common.lightBackground1,
                        color: "inherit",
                        fontWeight: 400,
                        ":hover": {
                          borderWidth: "0px",
                          background: (theme: any) =>
                            theme.palette.mode === "dark"
                              ? theme.palette.common.darkBackground2
                              : theme.palette.common.lightBackground2,
                        },
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: "4px", fill: "inherit", height: "23px" }}>
                        <LocalOfferIcon
                          // className={openPart === "Tags" ? "orange-text" : "grey-text"}

                          sx={{ fontSize: "16px" }}
                        />
                        <span>{shortenNumber(tags.length, 2, false)}</span>
                      </Box>
                    </ContainedButton>
                  </Box>
                )}
              </>
            ) : (
              <>
                {openPart === "References" ? (
                  <Box
                    onClick={selectReferences}
                    className={"select-tab-button-node-footer"}
                    sx={{
                      background: theme =>
                        theme.palette.mode === "dark" ? theme.palette.common.darkBackground1 : "#DCDCDC",
                      cursor: "pointer",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <MenuBookIcon
                          color={openPart === "References" ? "primary" : "inherit"}
                          sx={{ fontSize: "16px", marginRight: "2px" }}
                        />
                        <span className="CitationsSpanBeforeTagIcon">{shortenNumber(references.length, 2, false)}</span>
                      </Box>
                      <Box component={"span"} sx={{ marginInline: "5px" }}>
                        |
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <LocalOfferIcon color={"primary"} sx={{ fontSize: "16px", marginRight: "2px" }} />
                        <span>{shortenNumber(tags.length, 2, false)}</span>
                      </Box>
                    </Box>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      marginRight: "10px",
                    }}
                  >
                    <ContainedButton
                      title="View tags and citations used in this node."
                      onClick={selectReferences}
                      tooltipPosition="top"
                      sx={{
                        background: (theme: any) =>
                          theme.palette.mode === "dark"
                            ? theme.palette.common.darkBackground1
                            : theme.palette.common.lightBackground1,
                        color: "inherit",
                        fontWeight: 400,
                        height: "28.7px",
                        ":hover": {
                          borderWidth: "0px",
                          background: (theme: any) =>
                            theme.palette.mode === "dark"
                              ? theme.palette.common.darkBackground2
                              : theme.palette.common.lightBackground2,
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          gap: "5px",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <MenuBookIcon
                            // className={openPart === "References" ? "orange-text" : "grey-text"}
                            color={"inherit"}
                            sx={{ fontSize: "16px", marginRight: "2px" }}
                          />

                          <span className="CitationsSpanBeforeTagIcon" style={{ marginTop: "3px" }}>
                            {shortenNumber(references.length, 2, false)}
                          </span>
                        </Box>
                        <Divider
                          orientation="vertical"
                          variant="middle"
                          flexItem
                          sx={{ borderColor: theme => (theme.palette.mode === "dark" ? "#D3D3D3" : "inherit") }}
                        />
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <LocalOfferIcon
                            color={openPart === "Tags" ? "primary" : "inherit"}
                            sx={{ fontSize: "16px", marginRight: "2px" }}
                          />
                          <span style={{ marginTop: "3px" }}>{shortenNumber(tags.length, 2, false)}</span>
                        </Box>
                      </Box>
                    </ContainedButton>
                  </Box>
                )}
              </>
            )}
            {!editable && !unaccepted && (
              <>
                {/* <MemoizedMetaButton
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
                    {bookmarked ? (
                      <BookmarkIcon color={bookmarked ? "primary" : "inherit"} sx={{ fontSize: "16px" }} />
                    ) : (
                      <BookmarkBorderIcon
                        // color={bookmarked ? "orange-text" : "grey-text"}
                        // className={bookmarked ? "orange-text" : "grey-text"}
                        color={bookmarked ? "primary" : "inherit"}
                        sx={{ fontSize: "16px" }}
                      />
                    )}
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
                    {isStudied ? <DraftsIcon sx={{ fontSize: "16px" }} /> : <MailIcon sx={{ fontSize: "16px" }} />}
                    <span>{shortenNumber(studied, 2, false)}</span>
                  </>
                </MemoizedMetaButton> */}
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
            {openPart === "LinkingWords" ? (
              <Box
                onClick={selectLinkingWords}
                className={"select-tab-button-node-footer"}
                sx={{
                  position: "relative",
                  background: theme =>
                    theme.palette.mode === "dark" ? theme.palette.common.darkBackground1 : "#DCDCDC",
                  cursor: "pointer",
                }}
              >
                <span className="FooterParentNodesOpen">{shortenNumber(parents.length, 2, false)}</span>
                <SwapHorizIcon sx={{ fontSize: "16px" }} color={openPart === "LinkingWords" ? "primary" : "inherit"} />
                <span>{shortenNumber(nodesChildren.length, 2, false)}</span>
              </Box>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  marginRight: "10px",
                }}
              >
                <ContainedButton
                  title="View parent and child nodes."
                  onClick={selectLinkingWords}
                  tooltipPosition="top"
                  sx={{
                    background: (theme: any) =>
                      theme.palette.mode === "dark"
                        ? theme.palette.common.darkBackground1
                        : theme.palette.common.lightBackground1,
                    color: "inherit",
                    fontWeight: 400,
                    ":hover": {
                      borderWidth: "0px",
                      background: (theme: any) =>
                        theme.palette.mode === "dark"
                          ? theme.palette.common.darkBackground2
                          : theme.palette.common.lightBackground2,
                    },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: "4px", fill: "inherit" }}>
                    <span className="FooterParentNodesOpen">{shortenNumber(parents.length, 2, false)}</span>
                    <SwapHorizIcon sx={{ fontSize: "16px" }} color={"inherit"} />
                    <span>{shortenNumber(nodesChildren.length, 2, false)}</span>
                  </Box>
                </ContainedButton>
              </Box>
            )}

            <IconButton
              aria-label="more"
              id="long-button"
              aria-controls={openMenu ? "long-menu" : undefined}
              aria-expanded={openMenu ? "true" : undefined}
              aria-haspopup="true"
              onClick={handleClick}
              sx={{
                background: theme =>
                  theme.palette.mode === "dark"
                    ? theme.palette.common.darkBackground1
                    : theme.palette.common.lightBackground1,
                padding: "3px",
                ":hover": {
                  background: (theme: any) =>
                    theme.palette.mode === "dark"
                      ? theme.palette.common.darkBackground2
                      : theme.palette.common.lightBackground2,
                },
              }}
            >
              <MoreHorizIcon
                sx={{
                  color: theme => (theme.palette.mode === "dark" ? "#bebebe" : "#545968"),
                }}
              />
            </IconButton>

            {openMenu && (
              <ClickAwayListener onClickAway={handleClose}>
                <Box sx={{ position: "relative" }}>
                  <Paper
                    sx={{
                      p: "8px 4px",
                      position: "absolute",
                      width: "175px",
                      zIndex: "9",
                      top: "10px",
                      left: "0px",
                    }}
                  >
                    <MenuItem>
                      <MemoizedMetaButton
                        tooltip={!isStudied ? 'Mark this node as "studied."' : 'Mark this node as "not studied."'}
                        style={{ padding: "0" }}
                        tooltipPosition="top"
                      >
                        <Box sx={{ display: "flex", alignItems: "center" }} onClick={markStudied}>
                          <Badge
                            badgeContent={shortenNumber(studied, 2, false) ?? 0}
                            color="error"
                            anchorOrigin={{ vertical: "top", horizontal: "left" }}
                            sx={{ wordBreak: "normal", padding: "1px" }}
                          >
                            {isStudied ? (
                              <DraftsIcon sx={{ fontSize: "16px" }} />
                            ) : (
                              <MailIcon sx={{ fontSize: "16px" }} />
                            )}
                          </Badge>

                          <Box component="span" sx={{ marginLeft: "10px" }}>
                            Mark as studied
                          </Box>
                        </Box>
                      </MemoizedMetaButton>
                    </MenuItem>
                    <MenuItem>
                      <MemoizedMetaButton tooltip="Bookmark this node." tooltipPosition="top" style={{ padding: "0" }}>
                        <Box sx={{ display: "flex", alignItems: "center" }} onClick={bookmark}>
                          <Badge
                            className="toolbarBadge"
                            badgeContent={shortenNumber(bookmarks, 2, false) ?? 0}
                            color="error"
                            anchorOrigin={{ vertical: "top", horizontal: "left" }}
                            sx={{ wordBreak: "normal", padding: "1px" }}
                          >
                            {bookmarked ? (
                              <BookmarkIcon color={bookmarked ? "primary" : "secondary"} sx={{ fontSize: "16px" }} />
                            ) : (
                              <BookmarkBorderIcon
                                color={bookmarked ? "primary" : "secondary"}
                                sx={{ fontSize: "16px" }}
                              />
                            )}
                          </Badge>

                          <Box component="span" sx={{ marginLeft: "10px" }}>
                            Bookmark
                          </Box>
                        </Box>
                      </MemoizedMetaButton>
                    </MenuItem>
                    <MenuItem>
                      <MemoizedMetaButton
                        tooltip={isSpeaking ? "Stop narration." : "Narrate the node."}
                        tooltipPosition="top"
                        style={{ padding: "0" }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center" }} onClick={narrateNode}>
                          {isSpeaking ? (
                            <VoiceOverOffIcon sx={{ fontSize: "16px" }} />
                          ) : (
                            <RecordVoiceOverIcon sx={{ fontSize: "16px" }} />
                          )}
                          <Box component="span" sx={{ marginLeft: "10px" }}>
                            Narrate Node
                          </Box>
                        </Box>
                      </MemoizedMetaButton>
                    </MenuItem>

                    <MenuItem>
                      <MemoizedMetaButton>
                        <Box sx={{ display: "flex", alignItems: "center" }} onClick={onShareByLink}>
                          <IconButton
                            sx={{
                              color: "#BDBDBD",
                              padding: "0",
                            }}
                            aria-label="Share on url"
                          >
                            <LinkIcon
                              sx={{
                                fontSize: "16px",
                                color: theme =>
                                  theme.palette.mode === "dark" ? "#BEBEBE!important" : "#606060!important",
                              }}
                            />
                          </IconButton>
                          <Box component="span" sx={{ marginLeft: "10px" }}>
                            Copy Link
                          </Box>
                        </Box>
                      </MemoizedMetaButton>
                    </MenuItem>
                    <MenuItem>
                      <MemoizedMetaButton>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <IconButton
                            href={`https://twitter.com/intent/tweet?text=${messageTwitter()}`}
                            sx={{
                              color: "#BDBDBD",
                              padding: "0",
                              ":hover": {
                                background: "none",
                              },
                            }}
                            target="_blank"
                            rel="noopener"
                            aria-label="Share on Twitter"
                          >
                            <TwitterIcon
                              sx={{
                                fontSize: "16px",
                                color: theme =>
                                  theme.palette.mode === "dark" ? "#BEBEBE!important" : "#606060!important",
                              }}
                            />
                            <Box
                              component="span"
                              sx={{
                                marginLeft: "10px",
                                fontSize: "16px",
                                color: theme =>
                                  theme.palette.mode === "dark" ? "#BEBEBE!important" : "#606060!important",
                              }}
                            >
                              Twitter
                            </Box>
                          </IconButton>
                        </Box>
                      </MemoizedMetaButton>
                    </MenuItem>
                    <MenuItem>
                      <MemoizedMetaButton>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <IconButton
                            href={`http://www.reddit.com/submit?url=${url}`}
                            sx={{
                              color: "#BDBDBD",
                              padding: "0",
                              ":hover": {
                                background: "none",
                              },
                            }}
                            target="_blank"
                            rel="noopener"
                            aria-label="Share on Facebook"
                          >
                            <RedditIcon
                              sx={{
                                fontSize: "16px",
                                color: theme =>
                                  theme.palette.mode === "dark" ? "#BEBEBE!important" : "#606060!important",
                              }}
                            />
                            <Box
                              component="span"
                              sx={{
                                marginLeft: "10px",
                                fontSize: "16px",
                                color: theme =>
                                  theme.palette.mode === "dark" ? "#BEBEBE!important" : "#606060!important",
                              }}
                            >
                              Reddit
                            </Box>
                          </IconButton>
                        </Box>
                      </MemoizedMetaButton>
                    </MenuItem>
                    <MenuItem>
                      <MemoizedMetaButton>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <IconButton
                            href={`https://www.facebook.com/sharer/sharer.php?u=${url}`}
                            sx={{
                              color: "#BDBDBD",
                              padding: "0",
                              ":hover": {
                                background: "none",
                              },
                            }}
                            target="_blank"
                            rel="noopener"
                            aria-label="Share on Facebook"
                          >
                            <FacebookRoundedIcon
                              sx={{
                                fontSize: "16px",
                                color: theme =>
                                  theme.palette.mode === "dark" ? "#BEBEBE!important" : "#606060!important",
                              }}
                            />
                            <Box
                              component="span"
                              sx={{
                                marginLeft: "10px",
                                fontSize: "16px",
                                color: theme =>
                                  theme.palette.mode === "dark" ? "#BEBEBE!important" : "#606060!important",
                              }}
                            >
                              Facebook
                            </Box>
                          </IconButton>
                        </Box>
                      </MemoizedMetaButton>
                    </MenuItem>
                    <MenuItem>
                      <MemoizedMetaButton>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <IconButton
                            href={`https://www.linkedin.com/shareArticle?mini=true&url=${url}`}
                            sx={{
                              color: "#BDBDBD",
                              padding: "0",
                              ":hover": {
                                background: "none",
                              },
                            }}
                            target="_blank"
                            rel="noopener"
                            aria-label="Share on Linkedin"
                          >
                            <LinkedInIcon
                              sx={{
                                fontSize: "16px",
                                color: theme =>
                                  theme.palette.mode === "dark" ? "#BEBEBE!important" : "#606060!important",
                              }}
                            />
                            <Box
                              component="span"
                              sx={{
                                marginLeft: "10px",
                                fontSize: "16px",
                                color: theme =>
                                  theme.palette.mode === "dark" ? "#BEBEBE!important" : "#606060!important",
                              }}
                            >
                              Linkdein
                            </Box>
                          </IconButton>
                        </Box>
                      </MemoizedMetaButton>
                    </MenuItem>
                  </Paper>
                </Box>
              </ClickAwayListener>
            )}
          </Box>
        ) : (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              fontWeight: "normal",
              fontSize: "13px",
              gap: "4px",
              marginBottom: "4px",
            }}
          >
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
              <Box sx={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <CloseIcon sx={{ fontSize: "16px", color: markedWrong ? "red" : "inherit" }} />
                  <span>{shortenNumber(wrongNum, 2, false)}</span>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <DoneIcon sx={{ fontSize: "16px", color: markedCorrect ? "#00E676" : "inherit" }} />
                  <span>{shortenNumber(correctNum, 2, false)}</span>
                </Box>
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
              <Box sx={{ display: "flex", alignItems: "center" }}>
                {bookmarked ? (
                  <BookmarkIcon color={"primary"} sx={{ fontSize: "16px" }} />
                ) : (
                  <BookmarkBorderIcon color={"inherit"} sx={{ fontSize: "16px" }} />
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
              <Box sx={{ display: "flex", alignItems: "center", gap: "2px" }}>
                <span /*className="FooterParentNodesClosed"*/>{shortenNumber(parents.length, 2, false)}</span>
                <SwapHorizIcon sx={{ fontSize: "16px" }} />
                <span>{shortenNumber(nodesChildren.length, 2, false)}</span>
              </Box>
            </MemoizedMetaButton>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export const MemoizedNodeFooter = React.memo(NodeFooter);
