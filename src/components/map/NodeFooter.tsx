import { ArrowForwardIos } from "@mui/icons-material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import CloseIcon from "@mui/icons-material/Close";
import CreateIcon from "@mui/icons-material/Create";
import DoneIcon from "@mui/icons-material/Done";
import FacebookRoundedIcon from "@mui/icons-material/FacebookRounded";
import ImageIcon from "@mui/icons-material/Image";
import LinkIcon from "@mui/icons-material/Link";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import MailIcon from "@mui/icons-material/Mail";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import RedditIcon from "@mui/icons-material/Reddit";
import ShareIcon from "@mui/icons-material/Share";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import TwitterIcon from "@mui/icons-material/Twitter";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import {
  Button,
  ClickAwayListener,
  Divider,
  Grid,
  LinearProgress,
  MenuItem,
  MenuItemProps,
  MenuList,
  Paper,
  styled,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import { Box } from "@mui/system";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { collection, getDocs, getFirestore, query, where } from "firebase/firestore";
import NextImage from "next/image";
import { useRouter } from "next/router";
import React, { MutableRefObject, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";
import { ChosenType, OpenLeftSidebar } from "@/pages/notebook";

import ReferenceIcon from "../../../public/reference.svg";
import ReferenceDarkIcon from "../../../public/reference-dark.svg";
import ReferenceLightIcon from "../../../public/reference-light.svg";
import TagIcon from "../../../public/tag.svg";
import TagDarkIcon from "../../../public/tag-dark.svg";
import TagLightIcon from "../../../public/tag-light.svg";
import { User } from "../../knowledgeTypes";
import shortenNumber from "../../lib/utils/shortenNumber";
import { DispatchNodeBookActions, FullNodeData, OpenPart, TNodeBookState } from "../../nodeBookTypes";
import LeaderboardChip from "../LeaderboardChip";
import { MemoizedHeadlessLeaderboardChip } from "../map/FocusedNotebook/HeadlessLeaderboardChip";
import NodeTypeIcon from "../NodeTypeIcon";
import { ContainedButton } from "./ContainedButton";
import { MemoizedNodeTypeSelector } from "./Node/NodeTypeSelector";
import { MemoizedUserStatusIcon } from "./UserStatusIcon";

dayjs.extend(relativeTime);

type NodeFooterProps = {
  open: boolean;
  addVideo: boolean;
  setAddVideo: (addVideo: boolean) => void;
  identifier: any;
  notebookRef: MutableRefObject<TNodeBookState>;
  nodeBookDispatch: React.Dispatch<DispatchNodeBookActions>;
  // activeNode: any;
  // citationsSelected: any;
  proposalsSelected: any;
  // acceptedProposalsSelected: any;
  // commentsSelected: any;
  editable: any;
  setNodeParts: (nodeId: string, callback: (thisNode: FullNodeData) => FullNodeData) => void;
  title: string;
  content: string;
  unaccepted: boolean;
  openPart: OpenPart;
  nodeType: any;
  isNew: any;
  isTag: any;
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
  selectNode: (chosenType: ChosenType) => void;
  correctNode: any;
  wrongNode: any;
  disableVotes: boolean;
  uploadNodeImage: any;
  user: User;
  citations: { [key: string]: Set<string> };
  setOpenSideBar: (sidebar: OpenLeftSidebar) => void;
  locked: boolean;
  openSidebar: any;
  contributors: any;
  institutions: any;
  openUserInfoSidebar: (uname: string, imageUrl: string, fullName: string, chooseUname: string) => void;
  proposeNodeImprovement: any;
  disabled?: boolean;
  enableChildElements?: string[];
  showProposeTutorial?: boolean;
  setAbleToPropose: any;
  choosingNode: any;
  onChangeChosenNode: () => void;
};

const NodeFooter = ({
  open,
  addVideo,
  setAddVideo,
  identifier,
  notebookRef,
  nodeBookDispatch,
  // activeNode,
  // proposalsSelected,
  // acceptedProposalsSelected,
  // commentsSelected,
  editable,
  setNodeParts,
  // title,
  // content,
  unaccepted,
  openPart,
  nodeType,
  isNew,
  isTag,
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
  disabled,
  enableChildElements = [],
  setAbleToPropose,
  choosingNode,
  onChangeChosenNode,
}: NodeFooterProps) => {
  const router = useRouter();
  const db = getFirestore();
  const theme = useTheme();
  // const [isSpeaking, setIsSpeaking] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [percentageUploaded, setPercentageUploaded] = useState(0);
  const [url, setUrl] = useState("");
  const inputEl = useRef<HTMLInputElement>(null);
  const [openMenu, setOpenMenu] = useState(false);
  // const [openSocialMenu, setOpenSocialMenu] = useState(false);
  const [institutionLogos, setInstitutionLogos] = useState<{
    [institutionName: string]: string;
  }>({});

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
  const disableMoreOptionsButton = editable;
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
  // const narrateNode = useCallback(() => {
  //   if (!window.speechSynthesis.speaking) {
  //     const msg = new SpeechSynthesisUtterance("Node title: " + title + " \n " + "Node content: " + content);
  //     window.speechSynthesis.speak(msg);
  //     setIsSpeaking(true);
  //     msg.onend = () => {
  //       setIsSpeaking(false);
  //     };
  //   } else {
  //     window.speechSynthesis.cancel();
  //     setIsSpeaking(false);
  //   }
  // }, [title, content]);

  const uploadImageClicked = useCallback(() => {
    inputEl?.current?.click();
  }, [inputEl]);

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
    if (notebookRef.current.contributorsNodeId != identifier) {
      notebookRef.current.contributorsNodeId = { nodeId: identifier, showContributors: true };
      nodeBookDispatch({
        type: "setContributorsNodeId",
        payload: { nodeId: identifier, showContributors: true },
      });
    } else {
      notebookRef.current.contributorsNodeId = {
        nodeId: identifier,
        showContributors: !notebookRef.current.showContributors,
      };
      nodeBookDispatch({
        type: "setContributorsNodeId",
        payload: { nodeId: identifier, showContributors: !notebookRef.current.showContributors },
      });
    }
  }, [nodeBookDispatch]);

  const displayProposals = useCallback(() => {
    selectNode("Proposals");
    notebookRef.current.selectedNode = identifier;
    nodeBookDispatch({ type: "setSelectedNode", payload: identifier });
  }, [identifier, nodeBookDispatch, notebookRef, selectNode]);

  const proposeNodeImprovementClick = useCallback(
    (event: any) => {
      displayProposals();
      proposeNodeImprovement(event, identifier);
    },
    [displayProposals, identifier, proposeNodeImprovement]
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
          color: theme => (theme.palette.mode === "dark" ? theme.palette.common.gray50 : theme.palette.common.gray600),
        }}
      >
        <Box className="NodeFooter Left" sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {open &&
            (isNew ? (
              <Box onClick={openContributorsSection}>
                <MemoizedUserStatusIcon
                  id={userPictureId}
                  nodeBookDispatch={nodeBookDispatch}
                  uname={user.uname}
                  imageUrl={user.imageUrl || ""}
                  fullname={user.fName + " " + user.lName}
                  chooseUname={user.chooseUname}
                  online={false}
                  inUserBar={false}
                  inNodeFooter={true}
                  reloadPermanentGraph={reloadPermanentGrpah}
                  setOpenSideBar={setOpenSideBar}
                  disabled={disableUserPicture}
                />
              </Box>
            ) : (
              <Box onClick={openContributorsSection}>
                <MemoizedUserStatusIcon
                  id={userPictureId}
                  nodeBookDispatch={nodeBookDispatch}
                  uname={admin}
                  imageUrl={aImgUrl}
                  fullname={aFullname}
                  chooseUname={aChooseUname}
                  online={false}
                  inUserBar={false}
                  inNodeFooter={true}
                  reloadPermanentGraph={reloadPermanentGrpah}
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
                sx={{ fontSize: "22px" }}
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
                  setAbleToPropose={setAbleToPropose}
                />
              ) : (
                <NodeTypeIcon id={identifier} nodeType={nodeType} tooltipPlacement={"top"} sx={{ fontSize: "24px" }} />
              ))}
            <Tooltip
              title={`This node was last edited at ${dayjs(new Date(changedAt)).hour()}:${dayjs(
                new Date(changedAt)
              ).minute()}:${dayjs(new Date(changedAt)).second()} on ${dayjs(new Date(changedAt)).day() + 1}/${
                dayjs(new Date(changedAt)).month() + 1
              }/${dayjs(new Date(changedAt)).year()}`}
              placement={"top"}
            >
              <Box
                id={`${identifier}-node-footer-timestamp`}
                component={"span"}
                sx={{
                  marginLeft: "10px",
                  display: editable ? "none" : "block",
                  lineHeight: "normal",
                  cursor: "pointer",
                  ":hover": {
                    color:
                      theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.orange400 : DESIGN_SYSTEM_COLORS.orange500,
                  },
                }}
                onClick={displayProposals}
              >
                {dayjs(new Date(changedAt)).fromNow().includes("NaN")
                  ? "a few minutes ago"
                  : `${dayjs(new Date(changedAt)).fromNow()}`}
              </Box>
            </Tooltip>

            {open && !choosingNode && (
              <Box sx={{ display: editable || simulated ? "none" : "flex", alignItems: "center", marginLeft: "10px" }}>
                <ContainedButton
                  id={proposeButtonId}
                  title="Propose/evaluate versions of this node."
                  onClick={proposeNodeImprovementClick}
                  tooltipPosition="top"
                  sx={{
                    background: (theme: any) => (theme.palette.mode === "dark" ? "#404040" : "#EAECF0"),
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
                    background: (theme: any) => (theme.palette.mode === "dark" ? "#404040" : "#EAECF0"),
                    display: "flex",
                    alignItems: "center",
                    marginLeft: "10px",
                  }}
                >
                  <Box
                    id={upvoteButtonId}
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
                    <Tooltip title={"Vote to prevent further changes."} placement={"top"}>
                      <span>
                        <Button
                          onClick={correctNode}
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
                            <DoneIcon sx={{ fontSize: "18px", color: markedCorrect ? "#00E676" : "inherit" }} />
                            <span style={{ marginLeft: "2px" }}>{shortenNumber(correctNum, 2, false)}</span>
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
                    id={downvoteButtonId}
                    sx={{
                      padding: "2px 5px 2px 0px",
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
                    <Tooltip title={"Vote to delete node."} placement={"top"}>
                      <span>
                        <Button
                          onClick={wrongNode}
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
                            <CloseIcon
                              sx={{
                                fontSize: "18px",
                                color: markedWrong ? "red" : "inherit",
                              }}
                            />
                            <span style={{ marginLeft: "2px" }}>{shortenNumber(wrongNum, 2, false)}</span>
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

        <LinearProgress
          sx={{
            display: simulated && !unaccepted ? "block" : "none",
            width: "54%",
            position: "absolute",
            left: "245px",
          }}
        />

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
                <>
                  {nodeType !== "Reference" && editable && (
                    <Box
                      id={`${identifier}-node-footer-image-video`}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        marginRight: "10px",
                      }}
                    >
                      <ContainedButton
                        id={`${identifier}-node-footer-image`}
                        title="Upload an image to better explain this node."
                        onClick={() => uploadImageClicked()}
                        tooltipPosition="top"
                        sx={{
                          background: (theme: any) => (theme.palette.mode === "dark" ? "#404040" : "#EAECF0"),
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
                        id={`${identifier}-node-footer-video`}
                        title="Cite a video from Youtube or Vimeo."
                        onClick={() => setAddVideo(!addVideo)}
                        tooltipPosition="top"
                        sx={{
                          background: (theme: any) => (theme.palette.mode === "dark" ? "#404040" : "#EAECF0"),
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
                </>
              )}
              {!editable && !unaccepted && nodeType === "Reference" && !choosingNode ? (
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
                      id={`${identifier}-node-footer-tags-referecnes`}
                      title="View nodes that have cited this node."
                      onClick={() => selectNode("Citations")}
                      tooltipPosition="top"
                      sx={{
                        background: (theme: any) => (theme.palette.mode === "dark" ? "#404040" : "#EAECF0"),
                        color:
                          openSidebar === "CITATIONS" && notebookRef.current.selectedNode === identifier
                            ? theme => theme.palette.common.primary600
                            : "inherit",
                        fontWeight: 400,
                        border:
                          openSidebar === "CITATIONS" && notebookRef.current.selectedNode === identifier
                            ? `solid 1px ${theme.palette.common.primary600}`
                            : undefined,
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
                        <NextImage
                          width={"22px"}
                          src={
                            openSidebar === "CITATIONS" && notebookRef.current.selectedNode === identifier
                              ? ReferenceIcon
                              : theme.palette.mode === "dark"
                              ? ReferenceLightIcon
                              : ReferenceDarkIcon
                          }
                          alt="tag icon"
                        />
                      </Box>
                    </ContainedButton>
                  </Box>

                  {openPart === "Tags" ? (
                    <Box
                      onClick={selectTags}
                      className={"select-tab-button-node-footer"}
                      sx={{
                        background: theme => (theme.palette.mode === "dark" ? "#303134" : "#EAECF0"),
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      <>
                        <NextImage width={"22px"} src={TagIcon} alt="tag icon" />
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
                          background: (theme: any) => (theme.palette.mode === "dark" ? "#404040" : "#EAECF0"),
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
                          <NextImage
                            width={"22px"}
                            src={theme.palette.mode === "dark" ? TagLightIcon : TagDarkIcon}
                            alt="tag icon"
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
                        background: theme => (theme.palette.mode === "dark" ? "#303134" : "#EAECF0"),
                        border: "none",
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
                            justifyContent: "space-between",
                          }}
                        >
                          <NextImage width={"22px"} src={ReferenceIcon} alt="tag icon" style={{ marginRight: "2px" }} />
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
                            justifyContent: "space-between",
                          }}
                        >
                          <NextImage width={"22px"} src={TagIcon} alt="tag icon" />
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
                          background: (theme: any) => (theme.palette.mode === "dark" ? "#404040" : "#EAECF0"),
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
                              justifyContent: "space-between",
                            }}
                          >
                            <NextImage
                              width={"22px"}
                              src={theme.palette.mode === "dark" ? ReferenceLightIcon : ReferenceDarkIcon}
                              alt="tag icon"
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
                              justifyContent: "space-between",
                            }}
                          >
                            <NextImage
                              width={"22px"}
                              src={theme.palette.mode === "dark" ? TagLightIcon : TagDarkIcon}
                              alt="tag icon"
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
                    background: theme => (theme.palette.mode === "dark" ? "#303134" : "#EAECF0"),
                    border: "none",
                    cursor: disableParentChildrenButton ? "not-allowed" : "pointer",
                  }}
                >
                  <span className="FooterParentNodesOpen">{shortenNumber(parents.length, 2, false)}</span>
                  <SwapHorizIcon
                    sx={{ fontSize: "20px" }}
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
                      background: (theme: any) => (theme.palette.mode === "dark" ? "#404040" : "#EAECF0"),
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
                    // disabled={disableParentChildrenButton}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: "4px", fill: "inherit" }}>
                      <span className="FooterParentNodesOpen">{shortenNumber(parents.length, 2, false)}</span>
                      <SwapHorizIcon sx={{ fontSize: "16px" }} color={"inherit"} />
                      <span>{shortenNumber(nodesChildren.length, 2, false)}</span>
                    </Box>
                  </ContainedButton>
                </Box>
              )}

              {!editable && !choosingNode?.type && choosingNode?.id !== identifier && (
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
                    background: (theme: any) => (theme.palette.mode === "dark" ? "#404040" : "#EAECF0"),
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
                      color: "inherit",
                    }}
                  />
                </IconButton>
              )}

              {openMenu && (
                <ClickAwayListener onClickAway={handleClose}>
                  <Box sx={{ position: "relative" }}>
                    <Paper
                      sx={{
                        p: "3px 0px 3px 0px",
                        position: "absolute",
                        width: "199px",
                        zIndex: "9",
                        top: "-15px",
                        left: "23px",
                        borderRadius: "4px",
                        boxShadow: theme =>
                          theme.palette.mode === "dark"
                            ? "0px 4px 4px rgba(0, 0, 0, 0.25), 0px 8px 8px -4px rgba(0, 0, 0, 0.03)"
                            : "0px 4px 4px rgba(0, 0, 0, 0.25), 0px 8px 8px -4px rgba(0, 0, 0, 0.03)",
                        background: theme =>
                          theme.palette.mode === "dark"
                            ? theme.palette.common.notebookG700
                            : theme.palette.common.gray50,
                      }}
                    >
                      <MenuList
                        sx={{
                          paddingY: "0px",
                        }}
                      >
                        {/* ----------------------- */}

                        <CustomMenuItem
                          menuItemProps={{ disabled: disableFooterMenuOptions, onClick: markStudied }}
                          tooltipText={!isStudied ? 'Mark this node as "studied."' : 'Mark this node as "not studied."'}
                          icon={
                            <MailIcon
                              sx={{
                                fontSize: "19px",
                                color: theme =>
                                  isStudied
                                    ? theme.palette.common.primary600
                                    : theme.palette.mode === "dark"
                                    ? theme.palette.common.gray300
                                    : theme.palette.common.gray600,
                              }}
                            />
                          }
                          badgeContent={shortenNumber(studied, 2, false) ?? 0}
                          text="Mark as studied"
                        />
                        <CustomMenuItem
                          menuItemProps={{ disabled: disableFooterMenuOptions, onClick: bookmark }}
                          tooltipText={"Bookmark this node."}
                          icon={
                            <BookmarkIcon
                              sx={{
                                fontSize: "19px",
                                color: theme =>
                                  bookmarked
                                    ? theme.palette.common.primary600
                                    : theme.palette.mode === "dark"
                                    ? theme.palette.common.gray300
                                    : theme.palette.common.gray600,
                              }}
                            />
                          }
                          badgeContent={shortenNumber(bookmarks, 2, false) ?? 0}
                          text="Bookmark"
                        />
                        <CustomMenuItem
                          menuItemProps={
                            {
                              // onMouseOver: () => {
                              //   setOpenSocialMenu(true);
                              // },
                              // onMouseOut: () => setOpenSocialMenu(false),
                            }
                          }
                          tooltipText={""}
                          icon={
                            <ShareIcon
                              sx={{
                                fontSize: "19px",
                                color: theme =>
                                  theme.palette.mode === "dark"
                                    ? theme.palette.common.gray300
                                    : theme.palette.common.gray600,
                              }}
                            />
                          }
                          badgeContent={null}
                          text="Share"
                          rightAdornment={
                            <ArrowForwardIos
                              sx={{
                                fontSize: "19px",
                                color: theme =>
                                  theme.palette.mode === "dark"
                                    ? theme.palette.common.gray300
                                    : theme.palette.common.gray600,
                              }}
                            />
                          }
                        >
                          {
                            <Box sx={{ position: "relative" }}>
                              <Paper
                                sx={{
                                  p: "3px 0px 3px 0px",
                                  position: "absolute",
                                  width: "199px",
                                  zIndex: "9",
                                  top: "-18px",
                                  left: "12px",
                                  borderRadius: "4px",
                                  boxShadow: theme =>
                                    theme.palette.mode === "dark"
                                      ? "0px 4px 4px rgba(0, 0, 0, 0.25), 0px 8px 8px -4px rgba(0, 0, 0, 0.03)"
                                      : "0px 4px 4px rgba(0, 0, 0, 0.25), 0px 8px 8px -4px rgba(0, 0, 0, 0.03)",
                                  background: theme =>
                                    theme.palette.mode === "dark"
                                      ? theme.palette.common.notebookG700
                                      : theme.palette.common.gray50,
                                }}
                              >
                                <MenuList
                                  sx={{
                                    paddingY: "0px",
                                  }}
                                >
                                  <MenuItem disabled={disableFooterMenuOptions}>
                                    <Button
                                      sx={{
                                        minWidth: "0",
                                        padding: "0",
                                        display: "flex",
                                        justifyContent: "stretch",
                                        ":hover": {
                                          background: "transparent",
                                        },
                                      }}
                                    >
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
                                              fontSize: "19px",
                                              color: theme =>
                                                theme.palette.mode === "dark"
                                                  ? theme.palette.common.gray300
                                                  : theme.palette.common.gray600,
                                            }}
                                          />
                                          <Typography
                                            sx={{
                                              marginLeft: "10px",
                                              fontWeight: 500,
                                              color: theme =>
                                                theme.palette.mode === "dark"
                                                  ? theme.palette.common.gray200
                                                  : theme.palette.common.gray600,
                                            }}
                                          >
                                            Twitter
                                          </Typography>
                                        </IconButton>
                                      </Box>
                                    </Button>
                                  </MenuItem>
                                  <MenuItem disabled={disableFooterMenuOptions}>
                                    <Button
                                      sx={{
                                        minWidth: "0",
                                        padding: "0",
                                        display: "flex",
                                        justifyContent: "stretch",
                                        ":hover": {
                                          background: "transparent",
                                        },
                                      }}
                                    >
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
                                              fontSize: "19px",
                                              color: theme =>
                                                theme.palette.mode === "dark"
                                                  ? theme.palette.common.gray300
                                                  : theme.palette.common.gray600,
                                            }}
                                          />
                                          <Typography
                                            sx={{
                                              marginLeft: "10px",
                                              fontWeight: 500,
                                              color: theme =>
                                                theme.palette.mode === "dark"
                                                  ? theme.palette.common.gray200
                                                  : theme.palette.common.gray600,
                                            }}
                                          >
                                            Reddit
                                          </Typography>
                                        </IconButton>
                                      </Box>
                                    </Button>
                                  </MenuItem>
                                  <MenuItem disabled={disableFooterMenuOptions}>
                                    <Button
                                      sx={{
                                        minWidth: "0",
                                        padding: "0",
                                        display: "flex",
                                        justifyContent: "stretch",
                                        ":hover": {
                                          background: "transparent",
                                        },
                                      }}
                                    >
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
                                              fontSize: "19px",
                                              color: theme =>
                                                theme.palette.mode === "dark"
                                                  ? theme.palette.common.gray300
                                                  : theme.palette.common.gray600,
                                            }}
                                          />
                                          <Typography
                                            sx={{
                                              marginLeft: "10px",
                                              fontWeight: 500,
                                              color: theme =>
                                                theme.palette.mode === "dark"
                                                  ? theme.palette.common.gray200
                                                  : theme.palette.common.gray600,
                                            }}
                                          >
                                            Facebook
                                          </Typography>
                                        </IconButton>
                                      </Box>
                                    </Button>
                                  </MenuItem>
                                  <MenuItem disabled={disableFooterMenuOptions}>
                                    <Button
                                      sx={{
                                        minWidth: "0",
                                        padding: "0",
                                        display: "flex",
                                        justifyContent: "stretch",
                                        ":hover": {
                                          background: "transparent",
                                        },
                                      }}
                                    >
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
                                              fontSize: "19px",
                                              color: theme =>
                                                theme.palette.mode === "dark"
                                                  ? theme.palette.common.gray300
                                                  : theme.palette.common.gray600,
                                            }}
                                          />
                                          <Typography
                                            sx={{
                                              marginLeft: "10px",
                                              fontWeight: 500,
                                              color: theme =>
                                                theme.palette.mode === "dark"
                                                  ? theme.palette.common.gray200
                                                  : theme.palette.common.gray600,
                                            }}
                                          >
                                            Linkedin
                                          </Typography>
                                        </IconButton>
                                      </Box>
                                    </Button>
                                  </MenuItem>
                                  <MenuItem disabled={disableFooterMenuOptions}>
                                    <Button
                                      sx={{
                                        minWidth: "0",
                                        padding: "0",
                                        display: "flex",
                                        justifyContent: "stretch",
                                        ":hover": {
                                          background: "transparent",
                                        },
                                      }}
                                    >
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
                                              fontSize: "19px",
                                              color: theme =>
                                                theme.palette.mode === "dark"
                                                  ? theme.palette.common.gray200
                                                  : theme.palette.common.gray600,
                                            }}
                                          />
                                        </IconButton>
                                        <Typography
                                          sx={{
                                            marginLeft: "10px",
                                            fontWeight: 500,
                                            color: theme =>
                                              theme.palette.mode === "dark"
                                                ? theme.palette.common.gray200
                                                : theme.palette.common.gray600,
                                          }}
                                        >
                                          Copy Link
                                        </Typography>
                                      </Box>
                                    </Button>
                                  </MenuItem>
                                </MenuList>
                              </Paper>
                            </Box>
                          }
                        </CustomMenuItem>
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
              <Box
                id={`${identifier}-node-footer-votes`}
                className="tab-double-button-node-footer"
                sx={{
                  background: (theme: any) => (theme.palette.mode === "dark" ? "#404040" : "#EAECF0"),
                  display: "flex",
                  alignItems: "center",
                  marginRight: "0px",
                }}
              >
                <Box
                  id={downvoteButtonId}
                  sx={{
                    padding: "2px 10px 2px 10px",
                    borderRadius: "52px 0px 0px 52px",
                  }}
                >
                  <Tooltip title={"Correct votes"} placement={"top"}>
                    <Box
                      sx={{
                        display: "flex",
                        fontSize: "14px",
                        alignItems: "center",
                      }}
                    >
                      <DoneIcon sx={{ fontSize: "18px", color: markedCorrect ? "#00E676" : "inherit" }} />
                      <span>{shortenNumber(correctNum, 2, false)}</span>
                    </Box>
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
                    padding: "2px 10px 2px 10px",
                    borderRadius: "0px 52px 52px 0px",
                  }}
                >
                  <Tooltip title={"Wrong votes"} placement={"top"}>
                    <Box
                      sx={{
                        display: "flex",
                        fontSize: "14px",
                        alignItems: "center",
                      }}
                    >
                      <CloseIcon
                        sx={{
                          fontSize: "18px",
                          color: markedWrong ? "red" : "inherit",
                        }}
                      />
                      <span>{shortenNumber(wrongNum, 2, false)}</span>
                    </Box>
                  </Tooltip>
                </Box>
              </Box>

              <ContainedButton
                id={proposeButtonId}
                title={
                  `You've ${!bookmarked ? "not " : ""}bookmarked this node. ` +
                  shortenNumber(bookmarks, 2, false) +
                  " 1Cademist" +
                  (bookmarks === 1 ? " has" : "s have") +
                  " bookmarked this node."
                }
                onClick={() => {}}
                tooltipPosition="top"
                sx={{
                  background: (theme: any) => (theme.palette.mode === "dark" ? "#404040" : "#EAECF0"),
                  fontWeight: 400,
                  color: "inherit",
                  ":hover": {
                    borderWidth: "0px",
                    background: (theme: any) => (theme.palette.mode === "dark" ? "#404040" : "#EAECF0"),
                    cursor: "auto",
                  },
                  padding: "7px 7px",
                  minWidth: "30px",
                  height: "30px",
                }}
                disabled={disableProposeButton}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: "4px", fill: "inherit" }}>
                  {bookmarked ? (
                    <BookmarkIcon
                      sx={{
                        fontSize: "18px",
                        color: theme => (theme.palette.mode === "dark" ? "#FF6D00" : "#FF8134"),
                      }}
                    />
                  ) : (
                    <BookmarkIcon color={"inherit"} sx={{ fontSize: "16px" }} />
                  )}
                </Box>
              </ContainedButton>
              <ContainedButton
                id={parentChildrenButtonId}
                title="Parent and child nodes."
                onClick={() => {}}
                tooltipPosition="top"
                sx={{
                  background: (theme: any) => (theme.palette.mode === "dark" ? "#404040" : "#EAECF0"),
                  color: "inherit",
                  fontWeight: 400,
                  ":hover": {
                    borderWidth: "0px",
                    background: (theme: any) => (theme.palette.mode === "dark" ? "#404040" : "#EAECF0"),
                    cursor: "auto",
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
        </Box>
        {choosingNode && choosingNode?.type && choosingNode?.id !== identifier && (
          <Button
            variant="contained"
            onClick={onChangeChosenNode}
            sx={{
              borderRadius: "26px",
              backgroundColor: DESIGN_SYSTEM_COLORS.primary800,
              mt: "5px",
              display:
                (choosingNode?.type === "Tag" && choosingNode?.impact !== "node" && !isTag) ||
                (choosingNode?.type === "Reference" && choosingNode.type !== nodeType)
                  ? "none"
                  : "block",
            }}
          >
            {choosingNode?.type === "Reference"
              ? "Cite It"
              : choosingNode?.type === "Tag" && (choosingNode?.impact === "node" || isTag)
              ? "Tag it"
              : choosingNode?.type === "Child"
              ? "Link it"
              : choosingNode?.type === "Parent"
              ? "Link it"
              : choosingNode?.type === "Improvement"
              ? "Choose to improve"
              : null}
          </Button>
        )}
      </Box>
      {openSidebar === "USER_INFO" &&
        notebookRef.current.contributorsNodeId?.showContributors &&
        notebookRef.current.contributorsNodeId?.nodeId === identifier &&
        contributors &&
        Object.keys(contributors).length > 0 && (
          <>
            <Box
              sx={{
                marginTop: "10px",
                borderTop: theme => (theme.palette.mode === "dark" ? "1px solid #404040" : "solid 1px #D0D5DD"),
              }}
            />
            <Box sx={{ paddingX: "10px", mt: "5px" }}>
              <Box
                sx={{
                  py: "5px",
                }}
              >
                <Typography
                  sx={{
                    fontWeight: "500",
                  }}
                >
                  Contributors are:
                </Typography>
                <Grid container spacing={1} sx={{ mt: "5px" }}>
                  {renderContributors()}
                </Grid>
              </Box>
              <Box
                sx={{
                  py: "5px",
                }}
              >
                <Typography
                  sx={{
                    fontWeight: "500",
                  }}
                >
                  Who are from:
                </Typography>
                <Grid container spacing={1} sx={{ mt: "5px" }}>
                  {renderInstitutions()}
                </Grid>
              </Box>
            </Box>
          </>
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
  rightAdornment?: ReactNode;
};

export const CustomMenuItem = ({
  menuItemProps,
  icon,
  text,
  tooltipText,
  //badgeContent,
  children = null,
  rightAdornment = null,
}: CustomMenuItemProps) => {
  const [showMenu, setShowMenu] = useState(false);
  return (
    <StyledMenuItem
      // disabled={menuItemProps.disabled}
      {...menuItemProps}
      onMouseOver={() => {
        setShowMenu(true);
      }}
      onMouseOut={() => setShowMenu(false)}
      sx={{
        padding: "6px 12px 6px 12px",
        ":hover": {
          background: theme =>
            theme.palette.mode === "dark" ? theme.palette.common.notebookG600 : theme.palette.common.gray200,
        },
      }}
    >
      {menuItemProps.disabled ? (
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {icon}
          <Typography
            sx={{
              ml: "8px",
              fontWeight: 500,
              color: theme =>
                theme.palette.mode === "dark" ? theme.palette.common.gray200 : theme.palette.common.gray600,
            }}
          >
            {text}
          </Typography>
        </Box>
      ) : (
        <Tooltip title={tooltipText} placement="right">
          <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
            <Box
              sx={{ display: "flex", alignItems: "center" }}
              // onMouseOver={() => {
              //   setShowMenu(true);
              // }}
              // onMouseOut={() => setShowMenu(false)}
            >
              {/* <Badge
                badgeContent={badgeContent}
                color="error"
                anchorOrigin={{ vertical: "top", horizontal: "left" }}
                sx={{ wordBreak: "normal", padding: "1px" }}
              > */}
              {icon}
              {/* </Badge> */}
              <Typography
                sx={{
                  ml: "8px",
                  fontWeight: 500,
                  color: theme =>
                    theme.palette.mode === "dark" ? theme.palette.common.gray200 : theme.palette.common.gray600,
                }}
              >
                {text}
              </Typography>
            </Box>
            {rightAdornment}
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
