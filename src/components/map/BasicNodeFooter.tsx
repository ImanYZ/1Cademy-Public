import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import CloseIcon from "@mui/icons-material/Close";
import CreateIcon from "@mui/icons-material/Create";
import DoneIcon from "@mui/icons-material/Done";
import FacebookRoundedIcon from "@mui/icons-material/FacebookRounded";
import LinkIcon from "@mui/icons-material/Link";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import RecordVoiceOverIcon from "@mui/icons-material/RecordVoiceOver";
import RedditIcon from "@mui/icons-material/Reddit";
import ShareIcon from "@mui/icons-material/Share";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import TwitterIcon from "@mui/icons-material/Twitter";
import VoiceOverOffIcon from "@mui/icons-material/VoiceOverOff";
import { Button, ClickAwayListener, Divider, MenuItem, MenuList, Paper, Tooltip, useTheme } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import { Box } from "@mui/system";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
// import { getFirestore } from "firebase/firestore";
import NextImage from "next/image";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useState } from "react";

import ReferenceIcon from "../../../public/reference.svg";
import ReferenceDarkIcon from "../../../public/reference-dark.svg";
import ReferenceLightIcon from "../../../public/reference-light.svg";
import TagIcon from "../../../public/tag.svg";
import TagDarkIcon from "../../../public/tag-dark.svg";
import TagLightIcon from "../../../public/tag-light.svg";
import shortenNumber from "../../lib/utils/shortenNumber";
import { OpenPart } from "../../nodeBookTypes";
import NodeTypeIcon from "../NodeTypeIcon";
import OptimizedAvatar from "../OptimizedAvatar";
import { ContainedButton } from "./ContainedButton";
import { MemoizedMetaButton } from "./MetaButton";
import { CustomMenuItem } from "./NodeFooter";

dayjs.extend(relativeTime);

type BasicNodeFooterProps = {
  open: boolean;
  identifier: any;
  // notebookRef: MutableRefObject<TNodeBookState>;
  title: any;
  content: any;
  openPart: OpenPart;
  nodeType: any;
  aImgUrl: any;
  viewers: any;
  correctNum: any;
  markedCorrect: any;
  wrongNum: any;
  markedWrong: any;
  references: any;
  tags: any;
  parents: any;
  nodesChildren: any;
  changedAt: any;
  bookmarked: any;
  bookmarks: any;
  // onNodeShare: (nodeId: string, platform: string) => void;
  openNodePart: any;
  selectNode: any;
  // correctNode: any;
  locked: boolean;
  disabled?: boolean;
  enableChildElements?: string[];
  showProposeTutorial?: boolean;
};

const BasicNodeFooter = ({
  open,
  identifier,
  // notebookRef,
  title,
  content,
  openPart,
  nodeType,
  aImgUrl,
  correctNum,
  markedCorrect,
  wrongNum,
  markedWrong,
  references,
  tags,
  parents,
  nodesChildren,
  changedAt,
  bookmarked,
  bookmarks,
  // onNodeShare,
  openNodePart,
  selectNode,
  // correctNode,
  locked,
  disabled,
  enableChildElements = [],
}: // setAbleToPropose,
BasicNodeFooterProps) => {
  const router = useRouter();
  // const db = getFirestore();
  const theme = useTheme();
  const [isSpeaking, setIsSpeaking] = useState(false);
  // const [isUploading, setIsUploading] = useState(false);
  // const [percentageUploaded, setPercentageUploaded] = useState(0);
  const [url, setUrl] = useState("");
  // const inputEl = useRef<HTMLInputElement>(null);
  const [openMenu, setOpenMenu] = useState(false);
  // const [openSocialMenu, setOpenSocialMenu] = useState(false);
  // const [institutionLogos, setInstitutionLogos] = useState<{
  //   [institutionName: string]: string;
  // }>({});

  // const userPictureId = `${identifier}-node-footer-user`;
  const proposeButtonId = `${identifier}-node-footer-propose`;
  const downvoteButtonId = `${identifier}-node-footer-downvotes`;
  const upvoteButtonId = `${identifier}-node-footer-upvotes`;
  const tagsCitationsButtonId = `${identifier}-node-footer-tags-citations`;
  const parentChildrenButtonId = `${identifier}-button-parent-children`;
  const moreOptionsButtonId = `${identifier}-node-footer-ellipsis`;
  // const nodeTypeSelectorId = `${identifier}-node-type-selector`;

  // this will execute the includes operation only when disable is TRUE (in tutorial)
  // const disableUserPicture = disabled && !enableChildElements.includes(userPictureId);
  const disableProposeButton = disabled && !enableChildElements.includes(proposeButtonId);
  const disableDownvoteButton = disabled && !enableChildElements.includes(downvoteButtonId);
  const disableUpvoteButton = disabled && !enableChildElements.includes(upvoteButtonId);
  const disableTagsCitationsButton = disabled && !enableChildElements.includes(tagsCitationsButtonId);
  const disableParentChildrenButton = disabled && !enableChildElements.includes(parentChildrenButtonId);
  const disableMoreOptionsButton = disabled && !enableChildElements.includes(moreOptionsButtonId);
  const disableFooterMenuOptions = enableChildElements.includes(moreOptionsButtonId);
  // const disableNodeTypeSelector = disabled && !enableChildElements.includes(nodeTypeSelectorId);

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
    // onNodeShare(identifier, "copy-link");
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

  // const selectPendingProposals = useCallback(
  //   (event: any) => {
  //     // if (nodeBookState.selectedNode === identifier) {
  //     //   console.log("this is selected");
  //     // }
  //     // TODO: remove openEditButton and nodeId global states
  //     // openNodePart(event, "PendingProposals");
  //     // if (nodeBookState.nodeId != identifier) {
  //     //   nodeBookDispatch({
  //     //     type: "setOpenEditButton",
  //     //     payload: { status: true, nodeId: identifier },
  //     //   });
  //     // } else {
  //     //   nodeBookDispatch({
  //     //     type: "setOpenEditButton",
  //     //     payload: { status: !nodeBookState.openEditButton, nodeId: identifier },
  //     //   });
  //     // }
  //     selectNode(event, "Proposals"); // Pass correct data
  //   },
  //   [selectNode]
  // );
  // const uploadNodeImageHandler = useCallback(
  //   (event: any) => uploadNodeImage(event, isUploading, setIsUploading, setPercentageUploaded),
  //   [uploadNodeImage, isUploading]
  // );

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
  // const uploadImageClicked = useCallback(() => {
  //   inputEl?.current?.click();
  // }, [inputEl]);

  const selectCitations = useCallback(
    (event: any) => {
      selectNode(event, "Citations");
    },
    [selectNode]
  );

  // const openUserInfo = useCallback(
  //   (idx: any) => {
  //     const contributor = Object.keys(contributors)[idx];
  //     openUserInfoSidebar(
  //       contributor,
  //       contributors[contributor].imageUrl,
  //       contributors[contributor].fullname,
  //       contributors[contributor].chooseUname
  //     );
  //   },
  //   [openUserInfoSidebar]
  // );

  // const fetchInstitutionLogo = useCallback(
  //   async (institutionName: string) => {
  //     const institutionsQuery = query(collection(db, "institutions"), where("name", "==", institutionName));

  //     const institutionsDocs = await getDocs(institutionsQuery);

  //     for (let institutionDoc of institutionsDocs.docs) {
  //       const institutionData = institutionDoc.data();
  //       return institutionData.logoURL;
  //     }
  //   },
  //   [db]
  // );

  // const _institutions = useMemo(() => {
  //   return Object.keys(institutions || {}).map((name: string) => {
  //     if (!institutionLogos.hasOwnProperty(name)) {
  //       fetchInstitutionLogo(name).then(logoUrl => {
  //         setInstitutionLogos({
  //           ...institutionLogos,
  //           [name]: logoUrl,
  //         });
  //       });
  //     }
  //     return {
  //       name,
  //       ...institutions[name],
  //       logoURL: institutionLogos[name],
  //     };
  //   });
  // }, [institutions, institutionLogos]);

  // const renderContributors = useCallback(() => {
  //   if (contributors) {
  //     return Object.keys(contributors).map((el: any, idx: any) => (
  //       <Grid item key={idx}>
  //         <LeaderboardChip
  //           key={idx}
  //           name={contributors[el].chooseUname ? contributors[el].username : contributors[el].fullname}
  //           imageUrl={contributors[el].imageUrl}
  //           reputation={contributors[el].reputation || 0}
  //           isChamp={idx === 0}
  //           href=""
  //           openUserInfo={() => openUserInfo(idx)}
  //         />
  //       </Grid>
  //     ));
  //   } else {
  //     return <></>;
  //   }
  // }, [contributors]);

  // const renderInstitutions = useCallback(() => {
  //   return _institutions.map((el: any, idx: number) => (
  //     <Grid item key={idx}>
  //       <MemoizedHeadlessLeaderboardChip
  //         key={idx}
  //         name={el.name}
  //         imageUrl={el.logoURL}
  //         reputation={el.reputation || 0}
  //         isChamp={idx === 0}
  //         renderAsAvatar={false}
  //       />
  //     </Grid>
  //   ));
  // }, [_institutions]);

  // const openContributorsSection = useCallback(() => {
  //   if (notebookRef.current.contributorsNodeId != identifier) {
  //     notebookRef.current.contributorsNodeId = { nodeId: identifier, showContributors: true };
  //     nodeBookDispatch({
  //       type: "setContributorsNodeId",
  //       payload: { nodeId: identifier, showContributors: true },
  //     });
  //   } else {
  //     notebookRef.current.contributorsNodeId = {
  //       nodeId: identifier,
  //       showContributors: !notebookRef.current.showContributors,
  //     };
  //     nodeBookDispatch({
  //       type: "setContributorsNodeId",
  //       payload: { nodeId: identifier, showContributors: !notebookRef.current.showContributors },
  //     });
  //   }
  // }, [nodeBookDispatch]);

  // const proposeNodeImprovementClick = useCallback(
  //   (event: any) => {
  //     selectPendingProposals(event);
  //     setOperation("CancelProposals");
  //     notebookRef.current.selectedNode = identifier;
  //     nodeBookDispatch({ type: "setSelectedNode", payload: identifier });
  //     proposeNodeImprovement(event, identifier);
  //   },
  //   [identifier, nodeBookDispatch, proposeNodeImprovement, selectPendingProposals, setOperation]
  // );

  return (
    <>
      <Box
        id={`${identifier}-node-footer`}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mt: "10px",
          color: theme => (theme.palette.mode === "dark" ? "#F9FAFB" : "#475467"),
        }}
      >
        <Box className="NodeFooter Left" sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {open && (
            <Box>
              <OptimizedAvatar
                imageUrl={aImgUrl}
                renderAsAvatar={true}
                contained={false}
                sx={{ border: "none", width: "38px", height: "38px", position: "static", cursor: "pointer" }}
              />
            </Box>
          )}
          <div
            className={open ? "NodeTypeIconOpen Tooltip" : "NodeTypeIconClosed Tooltip"}
            style={{ display: "flex", alignItems: "center", fontSize: "16px" }}
          >
            {locked && (
              <NodeTypeIcon
                id={identifier}
                nodeType={"locked"}
                tooltipPlacement={"top"}
                fontSize={"inherit"}
                // disabled={disabled}
              />
            )}
            {!locked && (
              <NodeTypeIcon
                id={identifier}
                nodeType={nodeType}
                tooltipPlacement={"top"}
                fontSize={"inherit"}
                // disabled={disabled}
              />
            )}
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
                  display: "block",
                  lineHeight: "normal",
                }}
              >
                {dayjs(new Date(changedAt)).fromNow().includes("NaN")
                  ? "a few minutes ago"
                  : `${dayjs(new Date(changedAt)).fromNow()}`}
              </span>
            </Tooltip>
            {open && (
              <Box sx={{ display: "flex", alignItems: "center", marginLeft: "10px" }}>
                <ContainedButton
                  id={proposeButtonId}
                  title="Propose/evaluate versions of this node."
                  onClick={undefined}
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
                    <Tooltip title={"Vote to prevent further changes."} placement={"top"}>
                      <span>
                        <Button
                          // onClick={wrongNode}
                          disabled={disableDownvoteButton}
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
                    sx={{ borderColor: "#6A6A6A" }}
                    // sx={{
                    //   borderColor: disableVotes
                    //     ? "#6A6A6A"
                    //     : theme => (theme.palette.mode === "dark" ? "#D3D3D3" : "inherit"),
                    // }}
                  />
                  <Box
                    id={upvoteButtonId}
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
                          // onClick={correctNode}
                          disabled={true}
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
          </div>
        </Box>

        <Box className="NodeFooter Right" sx={{ display: "flex", alignItems: "center" }}>
          {open ? (
            <Box sx={{ display: "flex", alignItems: "center", fontSize: "13px" }}>
              {nodeType === "Reference" ? (
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
                      onClick={selectCitations}
                      tooltipPosition="top"
                      sx={{
                        background: (theme: any) => (theme.palette.mode === "dark" ? "#404040" : "#EAECF0"),
                        // color:
                        //   notebookRef.current.selectedNode === identifier
                        //     ? theme => theme.palette.common.orange
                        //     : "inherit",
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
                      <Box sx={{ display: "flex", alignItems: "center", gap: "4px", fill: "inherit", height: "23px" }}>
                        <ArrowForwardIcon sx={{ fontSize: "16px" }} />
                        <NextImage
                          width={"22px"}
                          src={theme.palette.mode === "dark" ? ReferenceLightIcon : ReferenceDarkIcon}
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
                  display: "flex",
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

                        {/* <CustomMenuItem
                          menuItemProps={{ disabled: disableFooterMenuOptions }}
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
                        /> */}

                        {/* <CustomMenuItem
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
                        /> */}

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

                        <CustomMenuItem
                          menuItemProps={{}}
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
                                          // onClick={() => onNodeShare(identifier, "twitter")}
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
                                          // onClick={() => onNodeShare(identifier, "reddit")}
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
                                          // onClick={() => onNodeShare(identifier, "facebook")}
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
                                          // onClick={() => onNodeShare(identifier, "linkedin")}
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
                      sx={{ fontSize: "18px", color: theme => (theme.palette.mode === "dark" ? "#FF6D00" : "#FF8134") }}
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
      </Box>
    </>
  );
};

export const MemoizedBasicNodeFooter = React.memo(BasicNodeFooter);
