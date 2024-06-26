import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import CloseIcon from "@mui/icons-material/Close";
import CreateIcon from "@mui/icons-material/Create";
import DoneIcon from "@mui/icons-material/Done";
import FacebookRoundedIcon from "@mui/icons-material/FacebookRounded";
import LinkIcon from "@mui/icons-material/Link";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import RecordVoiceOverIcon from "@mui/icons-material/RecordVoiceOver";
import RedditIcon from "@mui/icons-material/Reddit";
import ShareIcon from "@mui/icons-material/Share";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import TwitterIcon from "@mui/icons-material/Twitter";
import VoiceOverOffIcon from "@mui/icons-material/VoiceOverOff";
import {
  Box,
  Button,
  ClickAwayListener,
  Divider,
  MenuItem,
  MenuList,
  Paper,
  Stack,
  Theme,
  Tooltip,
} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import { SxProps } from "@mui/system";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useRouter } from "next/router";
import React, { ReactNode, useCallback, useEffect, useMemo, useState } from "react";

import shortenNumber from "../../lib/utils/shortenNumber";
import { OpenPart, SelectedUser } from "../../nodeBookTypes";
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
  // aImgUrl: any;
  viewers: any;
  correctNum: any;
  // markedCorrect: any;
  wrongNum: any;
  // markedWrong: any;
  references: any;
  tags: any;
  parents: any;
  nodesChildren: any;
  changedAt: any;
  bookmarked: any;
  bookmarks: any;
  // onNodeShare: (nodeId: string, platform: string) => void;
  openNodePart: any;
  // selectNode: any;
  // correctNode: any;
  locked: boolean;
  disabled?: boolean;
  enableChildElements?: string[];
  showProposeTutorial?: boolean;
  openUserInfoSidebar: (user: SelectedUser) => void;
  admin: SelectedUser;
  displayJoinMessage?: () => void;
};

const BasicNodeFooter = ({
  open,
  identifier,
  // notebookRef,
  title,
  content,
  openPart,
  nodeType,
  // aImgUrl,
  correctNum,
  // markedCorrect,
  wrongNum,
  // markedWrong,
  references,
  tags,
  parents,
  nodesChildren,
  changedAt,
  bookmarked,
  bookmarks,
  // onNodeShare,
  openNodePart,
  // selectNode,// TODO: remove this
  // correctNode,
  locked,
  disabled,
  enableChildElements = [],
  openUserInfoSidebar,
  admin,
  displayJoinMessage,
}: // setAbleToPropose,
BasicNodeFooterProps) => {
  const router = useRouter();
  // const theme = useTheme();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [url, setUrl] = useState("");
  const [openMenu, setOpenMenu] = useState(false);

  const userPictureId = `${identifier}-node-footer-user`;
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
  // const disableMoreOptionsButton = disabled && !enableChildElements.includes(moreOptionsButtonId);
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

  // const handleClick = () => {
  //   setOpenMenu(true);
  // };

  // const handleClose = () => {
  //   setOpenMenu(false);
  // };

  const onShareByLink = useCallback(() => {
    let { protocol, hostname, port } = new URL(window.location.href);
    let hostName = hostname;
    if (port) {
      hostName = hostName + ":" + port;
    }
    let url: any = protocol + "//" + hostName + "/n/" + identifier;
    navigator.clipboard.writeText(url);
    setOpenMenu(false);
    // onNodeShare(identifier, "copy-link");
  }, [identifier]);

  const selectReferences = useCallback(() => openNodePart("References"), [openNodePart]);
  const selectTags = useCallback(() => openNodePart("Tags"), [openNodePart]);
  const selectLinkingWords = useCallback(() => openNodePart("LinkingWords"), [openNodePart]);

  // const selectPendingProposals = useCallback(
  //   (event: any) => {
  //     // if (nodeBookState.selectedNode === identifier) {
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

  // const selectCitations = useCallback(
  //   (event: any) => {
  //     selectNode(event, "Citations");
  //   },
  //   [selectNode]
  // );

  const footerMenu = useMemo(
    () => (
      <ClickAwayListener onClickAway={() => setOpenMenu(false)}>
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
                      </MenuList>
                    </Paper>
                  </Box>
                }
              </CustomMenuItem>
            </MenuList>
          </Paper>
        </Box>
      </ClickAwayListener>
    ),
    [disableFooterMenuOptions, disabled, isSpeaking, messageTwitter, narrateNode, onShareByLink, url]
  );

  return (
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
      {/* left footer options */}
      <Stack direction={"row"} alignItems={"center"} spacing={"10px"}>
        {open && (
          <Box id={userPictureId} onClick={() => openUserInfoSidebar(admin)}>
            <OptimizedAvatar
              imageUrl={admin.imageUrl}
              renderAsAvatar={true}
              contained={false}
              sx={{ border: "none", width: "38px", height: "38px", position: "static", cursor: "pointer" }}
            />
            <Box
              id="OptimizedAvatarUserStatusOnlineIcon"
              className={true ? "UserStatusOnlineIcon" : "UserStatusOfflineIcon"}
              // sx={{
              //   backgroundColor: !openedProfile?.online
              //     ? theme => (theme.palette.mode === "dark" ? "#1b1a1a" : "#fefefe")
              //     : "",
              // }}
            />
          </Box>
        )}

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
          <>
            <CustomIconButton
              id={proposeButtonId}
              disabled={disableProposeButton}
              onClickOnDisable={displayJoinMessage}
            >
              <CreateIcon sx={{ fontSize: "16px" }} />
            </CustomIconButton>

            <CustomWrapperButton
              id={`${identifier}-node-footer-votes`}
              onClickOnWrapper={displayJoinMessage}
              disabled={disableUpvoteButton && disableDownvoteButton}
            >
              <Stack direction={"row"} alignItems={"center"}>
                <Tooltip title={"Vote to prevent further changes."} placement={"top"}>
                  <Button
                    id={downvoteButtonId}
                    disabled={disableUpvoteButton}
                    sx={{ padding: "0px", color: "inherit", minWidth: "0px" }}
                  >
                    <Box sx={{ display: "flex", fontSize: "14px", alignItems: "center" }}>
                      <DoneIcon sx={{ fontSize: "18px" }} />
                      <span style={{ marginLeft: "2px" }}>{shortenNumber(correctNum, 2, false)}</span>
                    </Box>
                  </Button>
                </Tooltip>
                <Divider
                  orientation="vertical"
                  variant="middle"
                  flexItem
                  sx={{
                    borderColor: theme => (theme.palette.mode === "dark" ? "#D3D3D3" : "inherit"),
                    mx: "4px",
                  }} /* sx={{ borderColor: "#6A6A6A" }}  */
                />
                <Tooltip title={"Vote to delete node."} placement={"top"}>
                  <Button
                    id={upvoteButtonId}
                    disabled={disableDownvoteButton}
                    sx={{ padding: "0px", color: "inherit", minWidth: "0px" }}
                  >
                    <Box sx={{ display: "flex", fontSize: "14px", alignItems: "center" }}>
                      <CloseIcon sx={{ fontSize: "18px" }} />
                      <span style={{ marginLeft: "2px" }}>{shortenNumber(wrongNum, 2, false)}</span>
                    </Box>
                  </Button>
                </Tooltip>
              </Stack>
            </CustomWrapperButton>
          </>
        )}
      </Stack>

      {/* right footer options */}
      <Stack direction={"row"} alignItems={"center"} spacing={"10px"}>
        {open && (
          <>
            {nodeType === "Reference" ? (
              <>
                <CustomButton
                  id={`${identifier}-node-footer-tags-referecnes`}
                  // onClick={selectCitations}
                  disabled={disabled}
                >
                  <Stack
                    direction={"row"}
                    alignItems={"center"}
                    spacing={
                      "4px"
                    } /*   sx={{ display: "flex", alignItems: "center", gap: "4px", fill: "inherit", height: "23px" }} */
                  >
                    <ArrowForwardIcon sx={{ fontSize: "16px" }} />
                    <MenuBookIcon sx={{ fontSize: "16px" }} />
                  </Stack>
                </CustomButton>

                {/* tags button */}
                <ButtonWithDetails
                  id={`${identifier}-node-footer-tags-citations`}
                  showDetails={openPart === "Tags"}
                  onClick={selectTags}
                  disabled={disableTagsCitationsButton}
                >
                  <Stack direction={"row"} alignItems={"center"}>
                    {/* <NextImage width={"22px"} src={TagIcon} alt="tag icon" /> */}
                    <LocalOfferIcon sx={{ fontSize: "16px" }} />
                    <span>{shortenNumber(tags.length, 2, false)}</span>
                  </Stack>
                </ButtonWithDetails>
              </>
            ) : (
              <ButtonWithDetails
                id={tagsCitationsButtonId}
                showDetails={openPart === "References"}
                onClick={selectReferences}
                disabled={disableTagsCitationsButton}
              >
                <Stack direction={"row"} alignItems={"center"}>
                  <MenuBookIcon sx={{ fontSize: "16px", marginRight: "2px" }} />
                  <span>{shortenNumber(references.length, 2, false)}</span>
                  <Divider
                    orientation="vertical"
                    variant="middle"
                    flexItem
                    sx={{ borderColor: theme => (theme.palette.mode === "dark" ? "#D3D3D3" : "inherit"), mx: "4px" }}
                  />
                  <LocalOfferIcon sx={{ fontSize: "16px", marginRight: "2px" }} />
                  <span>{shortenNumber(tags.length, 2, false)}</span>
                </Stack>
              </ButtonWithDetails>
            )}

            <ButtonWithDetails
              id={parentChildrenButtonId}
              showDetails={openPart === "LinkingWords"}
              onClick={selectLinkingWords}
              disabled={disableParentChildrenButton}
            >
              <Stack direction={"row"} alignItems={"center"}>
                <span className="FooterParentNodesOpen">{shortenNumber(parents.length, 2, false)}</span>
                <SwapHorizIcon sx={{ fontSize: "20px" }} color={openPart === "LinkingWords" ? "primary" : "inherit"} />
                <span>{shortenNumber(nodesChildren.length, 2, false)}</span>
              </Stack>
            </ButtonWithDetails>

            <CustomIconButton onClick={() => setOpenMenu(true)} id={moreOptionsButtonId}>
              <MoreHorizIcon />
            </CustomIconButton>

            {openMenu && footerMenu}
          </>
        )}

        {!open && (
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
                    <DoneIcon sx={{ fontSize: "18px" }} />
                    <span>{shortenNumber(correctNum, 2, false)}</span>
                  </Box>
                </Tooltip>
              </Box>
              <Divider orientation="vertical" variant="middle" flexItem sx={{ borderColor: "#6A6A6A" }} />
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
                        // color: markedWrong ? "red" : "inherit",
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
      </Stack>
    </Box>
  );
};

export const MemoizedBasicNodeFooter = React.memo(BasicNodeFooter);

type CustomIconButtonProps = {
  id: string;
  children: ReactNode;
  onClick?: () => void;
  onClickOnDisable?: () => void;
  disabled?: boolean;
  sx?: SxProps<Theme>;
};

const CustomIconButton = ({ id, children, disabled = false, sx, onClick, onClickOnDisable }: CustomIconButtonProps) => {
  const DisableStyles: SxProps<Theme> = {
    backgroundColor: ({ palette }) =>
      palette.mode === "dark" ? palette.common.notebookG500 : palette.common.notebookG50,
    color: ({ palette }) => (palette.mode === "dark" ? palette.common.notebookG300 : palette.common.notebookG200),
  };

  if (onClickOnDisable)
    return (
      <Box
        onClick={onClickOnDisable}
        sx={{
          p: "6px 8px",
          borderRadius: "16px",
          width: "30px",
          height: "30px",
          color: ({ palette }) => (palette.mode === "dark" ? "rgba(255, 255, 255, 0.3)" : "#475467"),
          ...DisableStyles,
        }}
      >
        {children}
      </Box>
    );

  return (
    <IconButton
      id={id}
      disabled={disabled}
      // className={disabled ? "Mui-disabled" : ""}
      onClick={disabled ? undefined : onClick}
      sx={{
        width: "30px",
        height: "30px",
        backgroundColor: ({ palette }) =>
          palette.mode === "dark" ? palette.common.notebookG500 : palette.common.gray200,
        ":hover": ({ palette }) =>
          palette.mode === "dark" ? palette.common.notebookG400 : palette.common.lightBackground2,
        "&.Mui-disabled": {
          ...DisableStyles,
        },
        ...sx,
      }}
    >
      {children}
    </IconButton>
  );
};

export const CustomButton = ({ id, children, disabled = false, sx, onClick }: CustomIconButtonProps) => (
  <Button
    id={id}
    disabled={disabled}
    onClick={disabled ? undefined : onClick}
    sx={{
      // minWidth: "0px",
      minWidth: "30px",
      height: "30px",
      borderRadius: "16px",
      backgroundColor: ({ palette }) =>
        disabled
          ? palette.mode === "dark"
            ? palette.common.notebookG600
            : palette.common.notebookG50
          : palette.mode === "dark"
          ? palette.common.notebookG500
          : palette.common.gray200,
      color: ({ palette }) =>
        disabled
          ? palette.mode === "dark"
            ? palette.common.notebookG300
            : palette.common.notebookG200
          : palette.mode === "dark"
          ? palette.common.gray50
          : palette.common.gray600,
      ":hover": ({ palette }) =>
        palette.mode === "dark" ? palette.common.notebookG400 : palette.common.lightBackground2,
      "&.Mui-disabled": {
        backgroundColor: ({ palette }) =>
          palette.mode === "dark" ? palette.common.notebookG600 : palette.common.notebookG50,
        // color: ({ palette }) => (palette.mode === "dark" ? palette.common.notebookG300 : palette.common.notebookG200),
      },
      ...sx,
    }}
  >
    {children}
  </Button>
);

type ButtonWithDetailsProps = {
  id: string;
  children: ReactNode;
  showDetails: boolean;
  disabled?: boolean;
  onClick?: () => void;
};
const ButtonWithDetails = ({ id, children, showDetails, disabled = false, onClick }: ButtonWithDetailsProps) => {
  return (
    <CustomButton
      id={id}
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      sx={{
        minWidth: "0px",
        width: "auto",
        backgroundColor: ({ palette }) =>
          disabled
            ? palette.mode === "dark"
              ? palette.common.notebookG600
              : palette.common.notebookG50
            : palette.mode === "dark"
            ? palette.common.notebookG500
            : palette.common.gray200,
        ":hover": {
          backgroundColor: ({ palette }) =>
            palette.mode === "dark" ? palette.common.notebookG400 : palette.common.gray300,
        },
        ...(showDetails && {
          marginBottom: "-2px",
          height: "48px",
          marginRight: "10px",
          borderBottomLeftRadius: "0px",
          borderBottomRightRadius: "0px",
          // TODO: add color when is focus
        }),
      }}
    >
      {children}
    </CustomButton>
  );
};

const CustomWrapperButton = ({
  id,
  children,
  sx,
  disabled,
  onClickOnWrapper,
}: CustomIconButtonProps & { onClickOnWrapper?: () => void }) => {
  return (
    <Box
      id={id}
      onClick={onClickOnWrapper}
      sx={{
        height: "30px",
        p: "6px 8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "16px",
        backgroundColor: ({ palette }) =>
          disabled
            ? palette.mode === "dark"
              ? palette.common.notebookG600
              : palette.common.notebookG50
            : palette.mode === "dark"
            ? palette.common.notebookG500
            : palette.common.notebookG200,
        color: ({ palette }) => (palette.mode === "dark" ? palette.common.gray50 : palette.common.gray600),
        ...(!disabled && {
          ":hover": {
            backgroundColor: ({ palette }) =>
              palette.mode === "dark" ? palette.common.notebookG400 : palette.common.lightBackground2,
          },
        }),
        ...sx,
      }}
    >
      {children}
    </Box>
  );
};
