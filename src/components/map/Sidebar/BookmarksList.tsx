import BookmarkIcon from "@mui/icons-material/Bookmark";
import CloseIcon from "@mui/icons-material/Close";
import DoneIcon from "@mui/icons-material/Done";
import { Divider, MenuItem, Paper, Select, Tooltip, Typography } from "@mui/material";
import { Box } from "@mui/system";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import NextImage from "next/image";
import React, { useCallback, useEffect, useState } from "react";
import { UserTheme } from "src/knowledgeTypes";

import StudiedBookmarkDarkIcon from "../../../../public/studied-bookmark-dark-mode.svg";
import StudiedBookmarkLightIcon from "../../../../public/studied-bookmark-light-mode.svg";
import UpdatedBookmarkDarkIcon from "../../../../public/updated-bookmark-dark-mode.svg";
import UpdatedBookmarkLightIcon from "../../../../public/updated-bookmark-light-mode.svg";
import { useInView } from "../../../hooks/useObserver";
import shortenNumber from "../../../lib/utils/shortenNumber";
import NodeTypeIcon from "../../NodeTypeIcon2";

dayjs.extend(relativeTime);

type BookmarksListProps = {
  openLinkedNode: any;
  updates: boolean;
  bookmarks: any[];
  bookmark: any;
  theme: UserTheme;
  type: any;
  setType: any;
};

const ELEMENTS_PER_PAGE = 13;

export const BookmarksList = ({
  openLinkedNode,
  bookmarks,
  updates,
  bookmark,
  theme,
  type,
  setType,
}: BookmarksListProps) => {
  const [lastIndex, setLastIndex] = useState(ELEMENTS_PER_PAGE);
  const [isRetrieving, setIsRetrieving] = useState(false);

  const { ref: refInfinityLoaderTrigger, inView: inViewInfinityLoaderTrigger } = useInView();

  // TODO: improve with memo to not recalculate in every render
  const getBookmarksProcessed = useCallback(() => {
    const bookmarksFiltered = bookmarks.filter(cur => {
      if (updates) return cur.changed || !cur.isStudied;
      return !cur.changed && cur.isStudied;
    });

    return bookmarksFiltered.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }, [bookmarks, updates]);

  const loadOlderNotificationsClick = useCallback(() => {
    if (lastIndex >= getBookmarksProcessed().length) return;
    setIsRetrieving(true);
    setLastIndex(lastIndex + ELEMENTS_PER_PAGE);
    setTimeout(() => {
      setIsRetrieving(false);
    }, 500);
  }, [getBookmarksProcessed, lastIndex]);

  useEffect(() => {
    if (!inViewInfinityLoaderTrigger) return;
    if (isRetrieving) return;

    loadOlderNotificationsClick();
  }, [inViewInfinityLoaderTrigger, isRetrieving, loadOlderNotificationsClick]);

  const bookmarkHandler = useCallback((event: any, identifier: string) => bookmark(event, identifier), [bookmark]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "right",
          marginY: "5px",
          py: "10px",
        }}
      >
        <Typography>Show</Typography>
        <Select
          sx={{
            marginLeft: "10px",
            height: "35px",
            width: "120px",
          }}
          MenuProps={{
            sx: {
              "& .MuiMenu-paper": {
                backgroundColor: theme =>
                  theme.palette.mode === "dark" ? theme.palette.common.notebookMainBlack : theme.palette.common.gray50,
                color: "text.white",
              },
              "& .MuiMenuItem-root:hover": {
                backgroundColor: theme =>
                  theme.palette.mode === "dark" ? theme.palette.common.notebookG600 : theme.palette.common.gray200,
                color: "text.white",
              },
              "& .Mui-selected": {
                backgroundColor: "transparent!important",
                color: theme => theme.palette.common.primary600,
              },
              "& .Mui-selected:hover": {
                backgroundColor: "transparent",
              },
            },
          }}
          labelId="demo-select-small"
          id="demo-select-small"
          value={type}
          onChange={e => {
            setType(e.target.value);
          }}
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="Concept">Concepts</MenuItem>
          <MenuItem value="Relation">Relations</MenuItem>
          <MenuItem value="Question">Questions</MenuItem>
          <MenuItem value="Idea">Ideas</MenuItem>
          <MenuItem value="Code">Codes</MenuItem>
          <MenuItem value="Reference">References</MenuItem>
        </Select>
      </Box>
      {!getBookmarksProcessed().length && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            marginTop: "25%",
          }}
        >
          <NextImage
            src={
              theme === "Dark"
                ? updates
                  ? UpdatedBookmarkDarkIcon
                  : StudiedBookmarkDarkIcon
                : updates
                ? UpdatedBookmarkLightIcon
                : StudiedBookmarkLightIcon
            }
            alt="Notification icon"
          />
          <Typography
            sx={{
              fontSize: "18px",
              lineHeight: "24px",
              width: "300px",
              fontWeight: "500",
              textAlign: "center",
              marginTop: "10px",
            }}
          >
            {updates
              ? "Nothing to worry about your bookmarked nodes"
              : "You haven't marked any of your bookmarked nodes as studied yet"}
          </Typography>

          <Typography
            sx={{
              fontSize: "13px",
              lineHeight: "24px",
              width: "300px",
              fontWeight: "400",
              textAlign: "center",
              marginTop: "10px",
            }}
          >
            {updates
              ? "This list displays the bookmarked nodes that have been updated by others or those that you haven't marked as studied."
              : "By marking a node as studied after bookmarking it, it'll be reflected here."}
          </Typography>
        </Box>
      )}

      {getBookmarksProcessed()
        .slice(0, lastIndex)
        .map((node: any) => (
          <Paper
            elevation={3}
            className="CollapsedProposal collection-item"
            // CHECK: I changed: node.id to node.userNodeId
            key={`node${node.userNodeId}`}
            onClick={() => openLinkedNode(node.node)}
            sx={{
              display: "flex",
              flexDirection: "column",
              padding: "12px 16px 10px 16px",
              borderRadius: "8px",
              boxShadow: theme =>
                theme.palette.mode === "light"
                  ? "0px 1px 2px rgba(0, 0, 0, 0.06), 0px 1px 3px rgba(0, 0, 0, 0.1)"
                  : "none",
              background: theme =>
                theme.palette.mode === "dark" ? theme.palette.common.notebookG700 : theme.palette.common.gray100,
              marginBottom: "5px",
              cursor: "pointer",
              ":hover": {
                background: theme =>
                  theme.palette.mode === "dark" ? theme.palette.common.notebookG600 : theme.palette.common.gray200,
              },
            }}
          >
            <Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <Typography
                  sx={{
                    width: "86%",
                    fontSize: "16px",
                    fontWeight: "500",
                    lineHeight: "24px",
                  }}
                >
                  {node.title}
                </Typography>
                <Box onClick={event => bookmarkHandler(event, node.node)}>
                  <BookmarkIcon
                    sx={{
                      color: theme => theme.palette.common.primary600,
                    }}
                  />
                </Box>
              </Box>
              <Box
                sx={{
                  marginTop: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box
                    sx={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      background: theme =>
                        theme.palette.mode === "dark"
                          ? theme.palette.common.notebookG500
                          : theme.palette.common.gray200,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <NodeTypeIcon nodeType={node.nodeType || ""} fontSize="inherit" />
                  </Box>
                  <Box
                    sx={{
                      fontSize: "12px",
                      marginLeft: "5px",
                      color: theme =>
                        theme.palette.mode === "dark"
                          ? theme.palette.common.notebookG200
                          : theme.palette.common.gray500,
                    }}
                  >
                    {dayjs(new Date(node.changedAt)).fromNow()}
                  </Box>
                </Box>
                <Box
                  className="tab-double-button-node-footer"
                  sx={{
                    background: (theme: any) => (theme.palette.mode === "dark" ? "#404040" : "#EAECF0"),
                    display: "flex",
                    alignItems: "center",
                    marginRight: "0px",
                    cursor: "auto",
                  }}
                >
                  <Box
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
                        <DoneIcon sx={{ fontSize: "18px", color: "inherit" }} />
                        <span>{shortenNumber(node.corrects, 2, false)}</span>
                      </Box>
                    </Tooltip>
                  </Box>
                  <Divider
                    orientation="vertical"
                    variant="middle"
                    flexItem
                    sx={{
                      background: theme => (theme.palette.mode === "dark" ? "#D3D3D3" : "inherit"),
                    }}
                  />
                  <Box
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
                            color: "inherit",
                          }}
                        />
                        <span>{shortenNumber(node.wrongs, 2, false)}</span>
                      </Box>
                    </Tooltip>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Paper>
        ))}
      {getBookmarksProcessed().length > lastIndex && <Box id="ContinueButton" ref={refInfinityLoaderTrigger} />}
    </Box>
  );
};
