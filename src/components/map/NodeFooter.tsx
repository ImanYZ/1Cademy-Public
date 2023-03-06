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
import ShareIcon from "@mui/icons-material/Share";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import TwitterIcon from "@mui/icons-material/Twitter";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import VoiceOverOffIcon from "@mui/icons-material/VoiceOverOff";
import {
  Badge,
  Button,
  ClickAwayListener,
  Divider,
  Grid,
  MenuItem,
  MenuItemProps,
  MenuList,
  Paper,
  Stack,
  styled,
  Tooltip,
  Typography,
} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import { Box } from "@mui/system";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { collection, getDocs, getFirestore, query, where } from "firebase/firestore";
import { useRouter } from "next/router";
import React, { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useNodeBook } from "@/context/NodeBookContext";
import { orange25, orange200 } from "@/pages/home";
import { OpenSidebar, TutorialType } from "@/pages/notebook";

import { User } from "../../knowledgeTypes";
import shortenNumber from "../../lib/utils/shortenNumber";
import { FullNodeData, OpenPart } from "../../nodeBookTypes";
import LeaderboardChip from "../LeaderboardChip";
import { MemoizedHeadlessLeaderboardChip } from "../map/FocusedNotebook/HeadlessLeaderboardChip";
import NodeTypeIcon from "../NodeTypeIcon";
import { Portal } from "../Portal";
import { ContainedButton } from "./ContainedButton";
import { MemoizedMetaButton } from "./MetaButton";
import { MemoizedNodeTypeSelector } from "./Node/NodeTypeSelector";
import { MemoizedUserStatusIcon } from "./UserStatusIcon";

dayjs.extend(relativeTime);

type NodeFooterProps = {
  open: boolean;
  addVideo: boolean;
  setAddVideo: (addVideo: boolean) => void;
  identifier: any;
  activeNode: any;
  citationsSelected: any;
  proposalsSelected: any;
  acceptedProposalsSelected: any;
  commentsSelected: any;
  editable: any;
  setNodeParts: (nodeId: string, callback: (thisNode: FullNodeData) => FullNodeData) => void;
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
  onNodeShare: (nodeId: string, platform: string) => void;
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
  contributors: any;
  institutions: any;
  openUserInfoSidebar: (uname: string, imageUrl: string, fullName: string, chooseUname: string) => void;
  proposeNodeImprovement: any;
  setOperation: any;
  disabled?: boolean;
  enableChildElements?: string[];
  showProposeTutorial?: boolean;
  setCurrentTutorial: (newValue: TutorialType) => void;
};

const NodeFooter = ({
  open,
  addVideo,
  setAddVideo,
  identifier,
  // activeNode,
  // proposalsSelected,
  // acceptedProposalsSelected,
  // commentsSelected,
  editable,
  setNodeParts,
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
  onNodeShare,
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
  contributors,
  institutions,
  openUserInfoSidebar,
  proposeNodeImprovement,
  setOperation,
  disabled,
  enableChildElements = [],
  showProposeTutorial = false,
  setCurrentTutorial,
}: NodeFooterProps) => {
  const router = useRouter();
  const db = getFirestore();
  const { nodeBookState, nodeBookDispatch } = useNodeBook();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [percentageUploaded, setPercentageUploaded] = useState(0);
  const [url, setUrl] = useState("");
  const inputEl = useRef<HTMLInputElement>(null);
  const [openMenu, setOpenMenu] = useState(false);
  // const [openSocialMenu, setOpenSocialMenu] = useState(false);
  const [institutionLogos, setInstitutionLogos] = useState<{
    [institutionName: string]: string;
  }>({});
  const [openProposalConfirm, setOpenProposalConfirm] = useState(false);

  const userPictureId = `${identifier}-node-footer-user`;
  const proposeButtonId = `${identifier}-node-footer-propose`;
  const downvoteButtonId = `${identifier}-node-footer-downvotes`;
  const upvoteButtonId = `${identifier}-node-footer-upvotes`;
  const tagsCitationsButtonId = `${identifier}-node-footer-tags-citations`;
  const parentChildrenButtonId = `${identifier}-button-parent-children`;
  const moreOptionsButtonId = `${identifier}-node-footer-ellipsis`;
  const nodeTypeSelectorId = `${identifier}-node-type-selector`;

  // this will execute the includes operation only when disable is TRUE (in tutorial)
  const disableUserPicture = disabled && !enableChildElements.includes(userPictureId);
  const disableProposeButton = disabled && !enableChildElements.includes(proposeButtonId);
  const disableDownvoteButton = disabled && !enableChildElements.includes(downvoteButtonId);
  const disableUpvoteButton = disabled && !enableChildElements.includes(upvoteButtonId);
  const disableTagsCitationsButton = disabled && !enableChildElements.includes(tagsCitationsButtonId);
  const disableParentChildrenButton = disabled && !enableChildElements.includes(parentChildrenButtonId);
  const disableMoreOptionsButton = disabled && !enableChildElements.includes(moreOptionsButtonId);
  const disableFooterMenuOptions = enableChildElements.includes(moreOptionsButtonId);
  const disableNodeTypeSelector = disabled && !enableChildElements.includes(nodeTypeSelectorId);

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
    // setOpenSocialMenu(false);
    onNodeShare(identifier, "copy-link");
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

  const openUserInfo = useCallback(
    (idx: any) => {
      const contributor = Object.keys(contributors)[idx];
      openUserInfoSidebar(
        contributor,
        contributors[contributor].imageUrl,
        contributors[contributor].fullname,
        contributors[contributor].chooseUname
      );
    },
    [openUserInfoSidebar]
  );

  const fetchInstitutionLogo = useCallback(
    async (institutionName: string) => {
      const institutionsQuery = query(collection(db, "institutions"), where("name", "==", institutionName));

      const institutionsDocs = await getDocs(institutionsQuery);

      for (let institutionDoc of institutionsDocs.docs) {
        const institutionData = institutionDoc.data();
        return institutionData.logoURL;
      }
    },
    [db]
  );

  const _institutions = useMemo(() => {
    return Object.keys(institutions || {}).map((name: string) => {
      if (!institutionLogos.hasOwnProperty(name)) {
        fetchInstitutionLogo(name).then(logoUrl => {
          setInstitutionLogos({
            ...institutionLogos,
            [name]: logoUrl,
          });
        });
      }
      return {
        name,
        ...institutions[name],
        logoURL: institutionLogos[name],
      };
    });
  }, [institutions, institutionLogos]);

  const renderContributors = useCallback(() => {
    if (contributors) {
      return Object.keys(contributors).map((el: any, idx: any) => (
        <Grid item key={idx}>
          <LeaderboardChip
            key={idx}
            name={contributors[el].chooseUname ? contributors[el].username : contributors[el].fullname}
            imageUrl={contributors[el].imageUrl}
            reputation={contributors[el].reputation || 0}
            isChamp={idx === 0}
            href=""
            openUserInfo={() => openUserInfo(idx)}
          />
        </Grid>
      ));
    } else {
      return <></>;
    }
  }, [contributors]);

  const renderInstitutions = useCallback(() => {
    return _institutions.map((el: any, idx: number) => (
      <Grid item key={idx}>
        <MemoizedHeadlessLeaderboardChip
          key={idx}
          name={el.name}
          imageUrl={el.logoURL}
          reputation={el.reputation || 0}
          isChamp={idx === 0}
          renderAsAvatar={false}
        />
      </Grid>
    ));
  }, [_institutions]);

  const openContributorsSection = useCallback(() => {
    if (nodeBookState.contributorsNodeId != identifier) {
      nodeBookDispatch({
        type: "setContributorsNodeId",
        payload: { nodeId: identifier, showContributors: true },
      });
    } else {
      nodeBookDispatch({
        type: "setContributorsNodeId",
        payload: { nodeId: identifier, showContributors: !nodeBookState.showContributors },
      });
    }
  }, [nodeBookDispatch, nodeBookState.contributorsNodeId]);

  const proposeNodeImprovementClick = useCallback(
    (event: any) => {
      // const searcherTutorialFinalized = userTutorial.searcher.done || userTutorial.searcher.skipped;
      console.log({ showProposeTutorial });

      selectPendingProposals(event);
      setOperation("CancelProposals");
      nodeBookDispatch({ type: "setSelectedNode", payload: identifier });
      proposeNodeImprovement(event, identifier);
    },
    [identifier, nodeBookDispatch, proposeNodeImprovement, selectPendingProposals, setOperation, showProposeTutorial]
  );

  return (
    <>
      <Box
        id={`${identifier}-node-footer`}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mt: "10px",
        }}
      >
        <Box className="NodeFooter Left" sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {open &&
            (isNew ? (
              <Box onClick={openContributorsSection}>
                <MemoizedUserStatusIcon
                  id={userPictureId}
                  uname={user.uname}
                  imageUrl={user.imageUrl || ""}
                  fullname={user.fName + " " + user.lName}
                  chooseUname={user.chooseUname}
                  online={false}
                  inUserBar={false}
                  inNodeFooter={true}
                  reloadPermanentGrpah={reloadPermanentGrpah}
                  setOpenSideBar={setOpenSideBar}
                  disabled={disableUserPicture}
                />
              </Box>
            ) : (
              <Box onClick={openContributorsSection}>
                <MemoizedUserStatusIcon
                  id={userPictureId}
                  uname={admin}
                  imageUrl={aImgUrl}
                  fullname={aFullname}
                  chooseUname={aChooseUname}
                  online={false}
                  inUserBar={false}
                  inNodeFooter={true}
                  reloadPermanentGrpah={reloadPermanentGrpah}
                  setOpenSideBar={setOpenSideBar}
                  disabled={disableUserPicture}
                />
              </Box>
            ))}
          {/* {open && disableUserPicture && (
            <Box
              id={userPictureId}
              sx={{ width: "28px", height: "28px", backgroundColor: "gray", borderRadius: "50%" }}
            />
          )} */}
          <div
            className={open ? "NodeTypeIconOpen Tooltip" : "NodeTypeIconClosed Tooltip"}
            style={{ display: "flex", alignItems: "center", fontSize: "16px" }} // font size refL Map.css ln 71
          >
            {/* <NodeTypeIcon nodeType={nodeType} /> */}

            {locked && (
              <NodeTypeIcon
                id={identifier}
                nodeType={"locked"}
                tooltipPlacement={"top"}
                fontSize={"inherit"}
                // disabled={disabled}
              />
            )}
            {!locked &&
              (editable ? (
                <MemoizedNodeTypeSelector
                  nodeId={identifier}
                  setNodeParts={setNodeParts}
                  nodeType={nodeType}
                  disabled={disableNodeTypeSelector}
                  disabledItems={disabled}
                />
              ) : (
                <NodeTypeIcon
                  id={identifier}
                  nodeType={nodeType}
                  tooltipPlacement={"top"}
                  fontSize={"inherit"}
                  // disabled={disabled}
                />
              ))}
            <Tooltip
              title={`This node was last edited at ${dayjs(new Date(changedAt)).hour()}:${dayjs(
                new Date(changedAt)
              ).minute()}:${dayjs(new Date(changedAt)).second()} on ${dayjs(new Date(changedAt)).day() + 1}/${
                dayjs(new Date(changedAt)).month() + 1
              }/${dayjs(new Date(changedAt)).year()}`}
              placement={"top"}
            >
              <span
                id={`${identifier}-node-footer-timestamp`}
                style={{
                  marginLeft: "10px",
                  display: editable ? "none" : "block",
                  lineHeight: "normal",
                }}
              >
                {dayjs(new Date(changedAt)).fromNow().includes("NaN")
                  ? "a few minutes ago"
                  : `${dayjs(new Date(changedAt)).fromNow()}`}
              </span>
            </Tooltip>
            {open && (
              <Box sx={{ display: editable || simulated ? "none" : "flex", alignItems: "center", marginLeft: "10px" }}>
                <ContainedButton
                  id={proposeButtonId}
                  title="Propose/evaluate versions of this node."
                  onClick={showProposeTutorial ? () => setOpenProposalConfirm(true) : proposeNodeImprovementClick}
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
                    padding: "7px 7px",
                    minWidth: "30px",
                    height: "30px",
                  }}
                  disabled={disableProposeButton}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: "4px", fill: "inherit" }}>
                    <CreateIcon sx={{ fontSize: "16px" }} />
                  </Box>
                </ContainedButton>

                <Box
                  id={`${identifier}-node-footer-votes`}
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
                    id={downvoteButtonId}
                    sx={{
                      padding: "2px 0px 2px 5px",
                      borderRadius: "52px 0px 0px 52px",
                      ...(!disableDownvoteButton && {
                        ":hover": {
                          background: theme =>
                            theme.palette.mode === "dark"
                              ? theme.palette.common.darkBackground2
                              : theme.palette.common.lightBackground2,
                        },
                      }),
                    }}
                  >
                    <Tooltip title={"Vote to delete node."} placement={"top"}>
                      <span>
                        <Button
                          onClick={wrongNode}
                          disabled={disableVotes || disableDownvoteButton}
                          sx={{
                            padding: "0",
                            color: "inherit",
                            fontWeight: 400,
                            minWidth: "40px",
                            ...(!disabled && {
                              ":hover": {
                                color: "inherit",
                                background: "transparent",
                              },
                            }),
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
                      </span>
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
                    id={upvoteButtonId}
                    sx={{
                      padding: "2px 5px 2px 5px",
                      borderRadius: "0px 52px 52px 0px",
                      ...(!disabled && {
                        ":hover": {
                          background: theme =>
                            theme.palette.mode === "dark"
                              ? theme.palette.common.darkBackground2
                              : theme.palette.common.lightBackground2,
                        },
                      }),
                    }}
                  >
                    <Tooltip title={"Vote to prevent further changes."} placement={"top"}>
                      <span>
                        <Button
                          onClick={correctNode}
                          disabled={disableVotes || disableUpvoteButton}
                          sx={{
                            padding: "0",
                            color: "inherit",
                            fontWeight: 400,
                            minWidth: "40px",
                            ...(!disableUpvoteButton && {
                              ":hover": {
                                color: "inherit",
                                background: "transparent",
                              },
                            }),
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
                      </span>
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
                    display: editable ? "flex" : "none",
                    alignItems: "center",
                    gap: "5px",
                    marginRight: "10px",
                  }}
                >
                  <ContainedButton
                    title="Upload an image to better explain this node."
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
                    disabled={disabled}
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

                  <ContainedButton
                    title="Cite a video from Youtube or Vimeo."
                    onClick={() => setAddVideo(!addVideo)}
                    tooltipPosition="top"
                    sx={{
                      background: (theme: any) =>
                        theme.palette.mode === "dark"
                          ? theme.palette.common.darkBackground1
                          : theme.palette.common.lightBackground1,
                      color: addVideo ? "#ff8a33" : "inherit",
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
                    disabled={disabled}
                  >
                    <VideoCallIcon sx={{ fontSize: "20px" }} />
                  </ContainedButton>
                </Box>
              )}
              {!editable && !unaccepted && nodeType === "Reference" ? (
                <>
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
                        color:
                          openSidebar === "CITATIONS" && nodeBookState.selectedNode === identifier
                            ? theme => theme.palette.common.orange
                            : "inherit",
                        fontWeight: 400,
                        ":hover": {
                          borderWidth: "0px",
                          background: (theme: any) =>
                            theme.palette.mode === "dark"
                              ? theme.palette.common.darkBackground2
                              : theme.palette.common.lightBackground2,
                        },
                      }}
                      disabled={disabled}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: "4px", fill: "inherit", height: "23px" }}>
                        <ArrowForwardIcon sx={{ fontSize: "16px" }} />
                        <MenuBookIcon sx={{ fontSize: "16px" }} />
                      </Box>
                    </ContainedButton>
                  </Box>

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
                        id={`${identifier}-node-footer-tags-citations`}
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
                        disabled={disabled}
                      >
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: "4px", fill: "inherit", height: "23px" }}
                        >
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
                      id={tagsCitationsButtonId}
                      onClick={disableTagsCitationsButton ? undefined : selectReferences}
                      className={"select-tab-button-node-footer"}
                      sx={{
                        background: theme =>
                          theme.palette.mode === "dark" ? theme.palette.common.darkBackground1 : "#DCDCDC",
                        cursor: disableTagsCitationsButton ? "not-allowed" : "pointer",
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
                          <span className="CitationsSpanBeforeTagIcon">
                            {shortenNumber(references.length, 2, false)}
                          </span>
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
                        id={tagsCitationsButtonId}
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
                        disabled={disableTagsCitationsButton}
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
                  //   (bookmarks === 1 ? " has" : " have") +
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
                  id={parentChildrenButtonId}
                  onClick={disableParentChildrenButton ? undefined : selectLinkingWords}
                  className={"select-tab-button-node-footer"}
                  sx={{
                    position: "relative",
                    background: theme =>
                      theme.palette.mode === "dark" ? theme.palette.common.darkBackground1 : "#DCDCDC",
                    cursor: disableParentChildrenButton ? "not-allowed" : "pointer",
                  }}
                >
                  <span className="FooterParentNodesOpen">{shortenNumber(parents.length, 2, false)}</span>
                  <SwapHorizIcon
                    sx={{ fontSize: "16px" }}
                    color={openPart === "LinkingWords" ? "primary" : "inherit"}
                  />
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
                    id={parentChildrenButtonId}
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
                    disabled={disableParentChildrenButton}
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
                id={moreOptionsButtonId}
                aria-controls={openMenu ? "long-menu" : undefined}
                aria-expanded={openMenu ? "true" : undefined}
                aria-haspopup="true"
                onClick={handleClick}
                disabled={disableMoreOptionsButton}
                sx={{
                  display: simulated ? "none" : "flex",
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
                      <MenuList>
                        {/* ----------------------- */}

                        <CustomMenuItem
                          menuItemProps={{ disabled: disableFooterMenuOptions, onClick: markStudied }}
                          tooltipText={!isStudied ? 'Mark this node as "studied."' : 'Mark this node as "not studied."'}
                          icon={
                            isStudied ? (
                              <DraftsIcon sx={{ fontSize: "16px" }} />
                            ) : (
                              <MailIcon sx={{ fontSize: "16px" }} />
                            )
                          }
                          badgeContent={shortenNumber(studied, 2, false) ?? 0}
                          text="Mark as studied"
                        />

                        {/* <MenuItem
                          disabled={disableFooterMenuOptions}
                          sx={{ cursor: disableFooterMenuOptions ? "not-allowed" : undefined }}
                        >
                          <MemoizedMetaButton
                            id={`${identifier}-node-footer-studied`}
                            tooltip={!isStudied ? 'Mark this node as "studied."' : 'Mark this node as "not studied."'}
                            style={{ padding: "0" }}
                            tooltipPosition="top"
                            disabled={disabled}
                            onClick={markStudied}
                          >
                            {disableFooterMenuOptions ? (
                              // is required to remove badge because content is blurred when is disabled
                              <Box sx={{ display: "flex", alignItems: "center" }}>
                                {isStudied ? (
                                  <DraftsIcon sx={{ fontSize: "16px" }} />
                                ) : (
                                  <MailIcon sx={{ fontSize: "16px" }} />
                                )}
                                <Typography sx={{ ml: "8px" }}>Mark as studied</Typography>
                              </Box>
                            ) : (
                              <Box>
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
                                <Typography sx={{ ml: "8px" }}>Mark as studied</Typography>
                              </Box>
                            )}
                          </MemoizedMetaButton>
                        </MenuItem> */}

                        <CustomMenuItem
                          menuItemProps={{ disabled: disableFooterMenuOptions, onClick: bookmark }}
                          tooltipText={"Bookmark this node."}
                          icon={
                            bookmarked ? (
                              <BookmarkIcon color={bookmarked ? "primary" : "secondary"} sx={{ fontSize: "16px" }} />
                            ) : (
                              <BookmarkBorderIcon
                                color={bookmarked ? "primary" : "secondary"}
                                sx={{ fontSize: "16px" }}
                              />
                            )
                          }
                          badgeContent={shortenNumber(bookmarks, 2, false) ?? 0}
                          text="Bookmark"
                        />

                        {/* <MenuItem disabled={disableFooterMenuOptions}>
                          <MemoizedMetaButton
                            tooltip="Bookmark this node."
                            tooltipPosition="top"
                            style={{ padding: "0" }}
                            disabled={disabled}
                          >
                            <Box sx={{ display: "flex", alignItems: "center" }} onClick={bookmark}>
                              <Badge
                                className="toolbarBadge"
                                badgeContent={shortenNumber(bookmarks, 2, false) ?? 0}
                                color="error"
                                anchorOrigin={{ vertical: "top", horizontal: "left" }}
                                sx={{ wordBreak: "normal", padding: "1px" }}
                              >
                                {bookmarked ? (
                                  <BookmarkIcon
                                    color={bookmarked ? "primary" : "secondary"}
                                    sx={{ fontSize: "16px" }}
                                  />
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
                        </MenuItem> */}

                        <CustomMenuItem
                          menuItemProps={{ onClick: narrateNode }}
                          tooltipText={isSpeaking ? "Stop narration." : "Narrate the node."}
                          icon={
                            isSpeaking ? (
                              <VoiceOverOffIcon sx={{ fontSize: "16px" }} />
                            ) : (
                              <RecordVoiceOverIcon sx={{ fontSize: "16px" }} />
                            )
                          }
                          badgeContent={null}
                          text="Narrate Node"
                        />

                        {/* <MenuItem>
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
                        </MenuItem> */}

                        <CustomMenuItem
                          menuItemProps={
                            {
                              // onMouseOver: () => {
                              //   console.log("onMouseOver");
                              //   setOpenSocialMenu(true);
                              // },
                              // onMouseOut: () => setOpenSocialMenu(false),
                            }
                          }
                          tooltipText={""}
                          icon={<ShareIcon sx={{ fontSize: "16px" }} />}
                          badgeContent={null}
                          text="Share Node"
                        >
                          {
                            <Box sx={{ position: "relative" }}>
                              <Paper
                                sx={{
                                  p: "8px 4px",
                                  position: "absolute",
                                  width: "175px",
                                  zIndex: "9",
                                  top: "-18px",
                                  left: "40px",
                                }}
                              >
                                <MenuList>
                                  <MenuItem disabled={disableFooterMenuOptions}>
                                    <MemoizedMetaButton>
                                      <Box sx={{ display: "flex", alignItems: "center" }}>
                                        <IconButton
                                          onClick={() => onNodeShare(identifier, "twitter")}
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
                                          disabled={disabled}
                                        >
                                          <TwitterIcon
                                            sx={{
                                              fontSize: "16px",
                                              color: theme =>
                                                theme.palette.mode === "dark"
                                                  ? "#BEBEBE!important"
                                                  : "#606060!important",
                                            }}
                                          />
                                          <Box
                                            component="span"
                                            sx={{
                                              marginLeft: "10px",
                                              fontSize: "16px",
                                              color: theme =>
                                                theme.palette.mode === "dark"
                                                  ? "#BEBEBE!important"
                                                  : "#606060!important",
                                            }}
                                          >
                                            Twitter
                                          </Box>
                                        </IconButton>
                                      </Box>
                                    </MemoizedMetaButton>
                                  </MenuItem>
                                  <MenuItem disabled={disableFooterMenuOptions}>
                                    <MemoizedMetaButton>
                                      <Box sx={{ display: "flex", alignItems: "center" }}>
                                        <IconButton
                                          onClick={() => onNodeShare(identifier, "reddit")}
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
                                          disabled={disabled}
                                        >
                                          <RedditIcon
                                            sx={{
                                              fontSize: "16px",
                                              color: theme =>
                                                theme.palette.mode === "dark"
                                                  ? "#BEBEBE!important"
                                                  : "#606060!important",
                                            }}
                                          />
                                          <Box
                                            component="span"
                                            sx={{
                                              marginLeft: "10px",
                                              fontSize: "16px",
                                              color: theme =>
                                                theme.palette.mode === "dark"
                                                  ? "#BEBEBE!important"
                                                  : "#606060!important",
                                            }}
                                          >
                                            Reddit
                                          </Box>
                                        </IconButton>
                                      </Box>
                                    </MemoizedMetaButton>
                                  </MenuItem>
                                  <MenuItem disabled={disableFooterMenuOptions}>
                                    <MemoizedMetaButton>
                                      <Box sx={{ display: "flex", alignItems: "center" }}>
                                        <IconButton
                                          onClick={() => onNodeShare(identifier, "facebook")}
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
                                          disabled={disabled}
                                        >
                                          <FacebookRoundedIcon
                                            sx={{
                                              fontSize: "16px",
                                              color: theme =>
                                                theme.palette.mode === "dark"
                                                  ? "#BEBEBE!important"
                                                  : "#606060!important",
                                            }}
                                          />
                                          <Box
                                            component="span"
                                            sx={{
                                              marginLeft: "10px",
                                              fontSize: "16px",
                                              color: theme =>
                                                theme.palette.mode === "dark"
                                                  ? "#BEBEBE!important"
                                                  : "#606060!important",
                                            }}
                                          >
                                            Facebook
                                          </Box>
                                        </IconButton>
                                      </Box>
                                    </MemoizedMetaButton>
                                  </MenuItem>
                                  <MenuItem disabled={disableFooterMenuOptions}>
                                    <MemoizedMetaButton>
                                      <Box sx={{ display: "flex", alignItems: "center" }}>
                                        <IconButton
                                          onClick={() => onNodeShare(identifier, "linkedin")}
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
                                          disabled={disabled}
                                        >
                                          <LinkedInIcon
                                            sx={{
                                              fontSize: "16px",
                                              color: theme =>
                                                theme.palette.mode === "dark"
                                                  ? "#BEBEBE!important"
                                                  : "#606060!important",
                                            }}
                                          />
                                          <Box
                                            component="span"
                                            sx={{
                                              marginLeft: "10px",
                                              fontSize: "16px",
                                              color: theme =>
                                                theme.palette.mode === "dark"
                                                  ? "#BEBEBE!important"
                                                  : "#606060!important",
                                            }}
                                          >
                                            Linkedin
                                          </Box>
                                        </IconButton>
                                      </Box>
                                    </MemoizedMetaButton>
                                  </MenuItem>
                                  <MenuItem disabled={disableFooterMenuOptions}>
                                    <MemoizedMetaButton>
                                      <Box sx={{ display: "flex", alignItems: "center" }} onClick={onShareByLink}>
                                        <IconButton
                                          sx={{
                                            color: "#BDBDBD",
                                            padding: "0",
                                          }}
                                          aria-label="Share on url"
                                          disabled={disabled}
                                        >
                                          <LinkIcon
                                            sx={{
                                              fontSize: "16px",
                                              color: theme =>
                                                theme.palette.mode === "dark"
                                                  ? "#BEBEBE!important"
                                                  : "#606060!important",
                                            }}
                                          />
                                        </IconButton>
                                        <Box component="span" sx={{ marginLeft: "10px" }}>
                                          Copy Link
                                        </Box>
                                      </Box>
                                    </MemoizedMetaButton>
                                  </MenuItem>

                                  {/* <CustomMenuItem
                          menuItemProps={{ disabled: disableFooterMenuOptions, onClick: narrateNode }}
                          tooltipText={isSpeaking ? "Stop narration." : "Narrate the node."}
                          icon={
                            isSpeaking ? (
                              <VoiceOverOffIcon sx={{ fontSize: "16px" }} />
                            ) : (
                              <RecordVoiceOverIcon sx={{ fontSize: "16px" }} />
                            )
                          }
                          badgeContent={null}
                          text="Narrate Node"
                        /> */}
                                </MenuList>
                              </Paper>
                            </Box>
                          }
                        </CustomMenuItem>

                        {/* <MenuItem
                          onMouseOver={() => setOpenSocialMenu(true)}
                          onMouseOut={() => setOpenSocialMenu(false)}
                        >
                          <MemoizedMetaButton>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <ShareIcon sx={{ fontSize: "16px" }} />
                              <Box component="span" sx={{ marginLeft: "10px" }}>
                                Share Node
                              </Box>
                              <ArrowForwardIosIcon sx={{ fontSize: "16px", marginLeft: "20px" }} />
                            </Box>
                          </MemoizedMetaButton>
                          {openSocialMenu && (
                            <Box sx={{ position: "relative" }}>
                              <Paper
                                sx={{
                                  p: "8px 4px",
                                  position: "absolute",
                                  width: "175px",
                                  zIndex: "9",
                                  top: "-18px",
                                  left: "7px",
                                }}
                              >
                                <MenuItem disabled={disableFooterMenuOptions}>
                                  <MemoizedMetaButton>
                                    <Box sx={{ display: "flex", alignItems: "center" }}>
                                      <IconButton
                                        onClick={() => onNodeShare(identifier, "twitter")}
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
                                        disabled={disabled}
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
                                <MenuItem disabled={disableFooterMenuOptions}>
                                  <MemoizedMetaButton>
                                    <Box sx={{ display: "flex", alignItems: "center" }}>
                                      <IconButton
                                        onClick={() => onNodeShare(identifier, "reddit")}
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
                                        disabled={disabled}
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
                                <MenuItem disabled={disableFooterMenuOptions}>
                                  <MemoizedMetaButton>
                                    <Box sx={{ display: "flex", alignItems: "center" }}>
                                      <IconButton
                                        onClick={() => onNodeShare(identifier, "facebook")}
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
                                        disabled={disabled}
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
                                <MenuItem disabled={disableFooterMenuOptions}>
                                  <MemoizedMetaButton>
                                    <Box sx={{ display: "flex", alignItems: "center" }}>
                                      <IconButton
                                        onClick={() => onNodeShare(identifier, "linkedin")}
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
                                        disabled={disabled}
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
                                          Linkedin
                                        </Box>
                                      </IconButton>
                                    </Box>
                                  </MemoizedMetaButton>
                                </MenuItem>
                                <MenuItem disabled={disableFooterMenuOptions}>
                                  <MemoizedMetaButton>
                                    <Box sx={{ display: "flex", alignItems: "center" }} onClick={onShareByLink}>
                                      <IconButton
                                        sx={{
                                          color: "#BDBDBD",
                                          padding: "0",
                                        }}
                                        aria-label="Share on url"
                                        disabled={disabled}
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
                              </Paper>
                            </Box>
                          )}
                        </MenuItem> */}
                      </MenuList>
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
                disabled={disabled}
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
                disabled={disabled}
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
                disabled={disabled}
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
      {openSidebar === "USER_INFO" &&
        nodeBookState.showContributors &&
        nodeBookState.contributorsNodeId === identifier &&
        contributors &&
        Object.keys(contributors).length > 0 && (
          <Box sx={{ paddingY: "10px" }}>
            <Grid container spacing={1} sx={{ mt: 0 }}>
              {renderContributors()}
            </Grid>
            <Box
              sx={{
                marginTop: "10px",
                borderTop: theme =>
                  theme.palette.mode === "dark" ? `solid 1px ${theme.palette.common.borderColor}` : "solid 1px",
              }}
            />
            <Grid container spacing={1} sx={{ mt: "5px" }}>
              {renderInstitutions()}
            </Grid>
          </Box>
        )}
      {showProposeTutorial && openProposalConfirm && (
        <Portal anchor="portal">
          <div
            style={{
              position: "absolute",
              top: "0px",
              bottom: "0px",
              left: "0px",
              right: "0px",
              backgroundColor: "#555555a9",
              transition: "top 1s ease-out,left 1s ease-out",
              boxSizing: "border-box",
              display: "grid",
              placeItems: "center",
              zIndex: 99999,
            }}
          >
            <Box
              sx={{
                transition: "top 1s ease-out,left 1s ease-out",
                width: "450px",
                backgroundColor: theme => (theme.palette.mode === "dark" ? "#353535" : orange25),
                border: theme => `2px solid ${theme.palette.mode === "dark" ? "#816247" : orange200}`,
                p: "24px 32px",
                borderRadius: "8px",
                color: "white",
                zIndex: 99999,
              }}
            >
              <Typography
                component={"h2"}
                sx={{ fontSize: "18px", fontWeight: "bold", display: "inline-block", textAlign: "center" }}
              >
                Tutorial Proposal
              </Typography>
              <Typography component={"p"} sx={{ fontSize: "16px", display: "inline-block" }}>
                Would you like to take the Proposals Tutorial ?
              </Typography>
              <Stack direction={"row"} justifyContent={"space-between"} alignItems={"center"} sx={{ mt: "16px" }}>
                <Button
                  variant="text"
                  onClick={e => {
                    setOpenProposalConfirm(false);
                    proposeNodeImprovementClick(e);
                  }}
                  sx={{
                    p: "8px 0px",
                  }}
                >
                  Cancel
                </Button>
                <Box>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setCurrentTutorial("PROPOSAL");
                    }}
                    sx={{
                      borderRadius: "32px",
                      mr: "16px",

                      p: "8px 32px",
                    }}
                  >
                    Get Started
                  </Button>
                </Box>
              </Stack>
            </Box>
          </div>
        </Portal>
      )}
    </>
  );
};

export const MemoizedNodeFooter = React.memo(NodeFooter);

type CustomMenuItemProps = {
  menuItemProps: MenuItemProps;
  icon: ReactNode;
  text: string;
  tooltipText: string;
  badgeContent: ReactNode;
  children?: ReactNode;
};

const CustomMenuItem = ({
  menuItemProps,
  icon,
  text,
  tooltipText,
  badgeContent,
  children = null,
}: CustomMenuItemProps) => {
  const [showMenu, setShowMenu] = useState(false);
  return (
    <StyledMenuItem
      // disabled={menuItemProps.disabled}
      {...menuItemProps}
      onMouseOver={() => {
        console.log("onMouseOver");
        setShowMenu(true);
      }}
      onMouseOut={() => setShowMenu(false)}
    >
      {menuItemProps.disabled ? (
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {icon}
          <Typography sx={{ ml: "8px" }}>{text}</Typography>
        </Box>
      ) : (
        <Tooltip title={tooltipText} placement="right">
          <Box
            sx={{ display: "flex", alignItems: "center" }}
            // onMouseOver={() => {
            //   console.log("onMouseOver");
            //   setShowMenu(true);
            // }}
            // onMouseOut={() => setShowMenu(false)}
          >
            <Badge
              badgeContent={badgeContent}
              color="error"
              anchorOrigin={{ vertical: "top", horizontal: "left" }}
              sx={{ wordBreak: "normal", padding: "1px" }}
            >
              {icon}
            </Badge>
            <Typography sx={{ ml: "8px" }}>{text}</Typography>
          </Box>
        </Tooltip>
      )}
      {showMenu && children}
    </StyledMenuItem>
  );
};

const StyledMenuItem = styled(MenuItem)<MenuItemProps>(({}) => ({
  "& .Mui-disabled": {
    cursor: "not-allowed",
  },
}));
