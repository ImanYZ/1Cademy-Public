import EditIcon from "@mui/icons-material/Edit";
import ReplyIcon from "@mui/icons-material/Reply";
import { Button, CardContent, IconButton, Stack, Tab, Tabs, useTheme } from "@mui/material";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import Divider from "@mui/material/Divider";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import NextImage from "next/image";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { FC, ReactNode, useEffect, useState } from "react";

import ROUTES from "@/lib/utils/routes";
import { getNodePageWithDomain } from "@/lib/utils/utils";

import NarrateNodeSpeak from "../../public/narrate-node-speak.svg";
import NarrateNodeStopDark from "../../public/narrate-node-stop-dark.svg";
import NarrateNodeStopLight from "../../public/narrate-node-stop-light.svg";
import ShareIcon from "../../public/share.svg";
import ShareLightIcon from "../../public/share-light.svg";
import { KnowledgeNode } from "../knowledgeTypes";
import FullScreenImage from "./FullScreenImage";
import MarkdownRender from "./Markdown/MarkdownRender";
import NodeTypeIcon from "./NodeTypeIcon";
import { FocusedViewNodeVotes, NodeVotes } from "./NodeVotes";
import QuestionItem from "./QuestionItem";
import { ShareButtons } from "./ShareButtons";

dayjs.extend(relativeTime);

type Props = {
  nodeId: string;
  node: KnowledgeNode;
  contributors?: ReactNode;
  references?: ReactNode;
  tags?: ReactNode;
  editable?: boolean;
};

type FocusedNodeProps = {
  nodeId: string;
  node: any;
  contributors?: ReactNode;
  references?: ReactNode;
  tags?: ReactNode;
  relatedNodes?: ReactNode;
  editable?: boolean;
};

export const NodeItemFull: FC<Props> = ({ nodeId, node, contributors, references, tags, editable = true }) => {
  const router = useRouter();
  const [imageFullScreen, setImageFullScreen] = useState(false);
  const [showShareButtons, setShowShareButtons] = useState(false);
  const handleClickImageFullScreen = () => {
    setImageFullScreen(true);
  };
  const [paddingTop, setPaddingTop] = useState("0");

  return (
    <Card data-testid="node-item-full">
      <CardHeader
        sx={{ px: { xs: 5, md: 10 }, pt: { xs: 4, md: 10 }, pb: 8 }}
        title={<MarkdownRender sx={{ fontSize: "30px" }} text={node.title || ""} />}
      ></CardHeader>
      <CardContent
        sx={{
          p: { xs: 5, md: 10 },
          "&:last-child": {
            paddingBottom: { xs: 4, md: 10 },
          },
        }}
      >
        {node.content && (
          <Typography
            variant="body1"
            color="text.secondary"
            component="div"
            sx={{
              color: theme => (theme.palette.mode === "dark" ? theme.palette.common.white : theme.palette.common.black),
              lineHeight: 2,
              fontSize: "19px",
            }}
          >
            <MarkdownRender text={node.content || ""} />
          </Typography>
        )}

        {node.nodeType === "Question" && <QuestionItem choices={node.choices} />}

        {node.nodeImage && (
          <Tooltip title="Click to view image in full-screen!">
            <Box
              style={{ paddingTop }}
              onClick={handleClickImageFullScreen}
              sx={{
                display: "block",
                position: "relative",
                width: "100%",
                height: "100%",
                cursor: "pointer",
                mt: 3,
              }}
            >
              <Image
                alt="node image"
                src={node.nodeImage}
                objectFit="contain"
                layout="fill"
                priority
                onLoad={({ target }) => {
                  const { naturalWidth, naturalHeight } = target as HTMLImageElement;
                  setPaddingTop(`calc(100% / (${naturalWidth} / ${naturalHeight})`);
                }}
              />
            </Box>
          </Tooltip>
        )}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexDirection: { xs: "column", sm: "row" },
            flexWrap: "wrap",
            justifyContent: "space-between",
            mt: 5,
          }}
        >
          <Box
            sx={{
              width: { xs: "100%" },
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <NodeVotes corrects={node.corrects} wrongs={node.wrongs} />

            <Box sx={{ display: "flex", alignItems: "center" }}>
              <NodeTypeIcon nodeType={node.nodeType} />
              {node.changedAt && (
                <Tooltip title={`Last updated on ${new Date(node.changedAt).toLocaleString()}`}>
                  <Typography sx={{ ml: 1 }} component="span" color="text.secondary" variant="caption">
                    {dayjs(new Date(node.changedAt)).fromNow()}
                  </Typography>
                </Tooltip>
              )}
            </Box>

            <Box sx={{ display: "flex" }}>
              <Button
                onClick={() => setShowShareButtons(!showShareButtons)}
                sx={{
                  minWidth: "20px",
                  justifyContent: "start",
                  color: theme => (showShareButtons ? theme.palette.common.orange : theme.palette.grey[600]),
                }}
              >
                <ReplyIcon sx={{ ml: "10px", transform: "scale(-1,1)" }} />

                {!showShareButtons && <Typography py="2px">Share</Typography>}
              </Button>
              {showShareButtons && <ShareButtons url={getNodePageWithDomain(String(node.title), nodeId)} />}
              {editable && (
                <IconButton onClick={() => router.push({ pathname: `${ROUTES.proposal}/${node.id}` })}>
                  <EditIcon />
                </IconButton>
              )}
            </Box>
          </Box>
        </Box>
        <Divider sx={{ my: 8 }} />
        <Box>{contributors}</Box>
        <Box>{references}</Box>
        <Box>{tags}</Box>
      </CardContent>
      {node.nodeImage && (
        <FullScreenImage
          alt={node.title || ""}
          src={node.nodeImage}
          open={imageFullScreen}
          onClose={() => setImageFullScreen(false)}
        />
      )}
    </Card>
  );
};

export const FocusedNodeItemFull: FC<FocusedNodeProps> = ({
  nodeId,
  node,
  contributors,
  tags,
  references,
  relatedNodes,
  editable = true,
}) => {
  const desktopTabs = [
    {
      title: "Contributors",
      content: <Box>{contributors}</Box>,
    },

    {
      title: "Refs & Tags",
      content: <Box>{tags}</Box>,
    },
    {
      title: "Related Nodes",
      content: <Box>{relatedNodes}</Box>,
    },
  ];
  const router = useRouter();
  const theme = useTheme();
  const [imageFullScreen, setImageFullScreen] = useState(false);
  const [showShareButtons, setShowShareButtons] = useState(false);
  const handleClickImageFullScreen = () => {
    setImageFullScreen(true);
  };
  const [paddingTop, setPaddingTop] = useState("0");
  const [value, setValue] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [tabsItems, setTabsItems] = useState(desktopTabs);
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  const a11yProps = (index: number) => {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`,
    };
  };

  const narrateNode = (title: string, content: string) => {
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
  };

  useEffect(() => {
    console.log(window.innerWidth, "window.innerWidth");
    if (window.innerWidth <= 599) {
      setTabsItems([
        {
          title: "Contributors",
          content: <Box>{contributors}</Box>,
        },

        {
          title: "References",
          content: <Box>{references}</Box>,
        },
        {
          title: "Tags",
          content: <Box>{tags}</Box>,
        },
      ]);
    } else if (window.innerWidth > 599) {
      setTabsItems(desktopTabs);
    }
  }, [window.innerWidth, node]);

  return (
    <>
      <Card
        data-testid="node-item-full"
        sx={{ background: theme => (theme.palette.mode === "dark" ? "#303134" : "#F2F4F7") }}
      >
        <CardHeader
          sx={{
            px: { xs: 5, md: 10 },
            pt: { xs: 4, md: 10 },
            pb: 8,
            backgroundColor: theme => (theme.palette.mode === "dark" ? "#242425" : "#EAECF0"),
          }}
          title={<MarkdownRender sx={{ fontSize: "30px" }} text={node.title || ""} />}
        ></CardHeader>
        <CardContent
          sx={{
            marginTop: "20px",
            p: { xs: 5, md: 10 },
            "&:last-child": {
              paddingBottom: { xs: 4, md: 5 },
            },
          }}
        >
          {node.content && (
            <Typography
              variant="body1"
              color="text.secondary"
              component="div"
              sx={{
                color: theme =>
                  theme.palette.mode === "dark" ? theme.palette.common.white : theme.palette.common.black,
                lineHeight: 2,
                fontSize: "19px",
              }}
            >
              <MarkdownRender text={node.content || ""} />
            </Typography>
          )}

          {node.nodeType === "Question" && <QuestionItem choices={node.choices} />}

          {node.nodeImage && (
            <Tooltip title="Click to view image in full-screen!">
              <Box
                style={{ paddingTop }}
                onClick={handleClickImageFullScreen}
                sx={{
                  display: "block",
                  position: "relative",
                  width: "100%",
                  height: "100%",
                  cursor: "pointer",
                  mt: 3,
                }}
              >
                <Image
                  alt="node image"
                  src={node.nodeImage}
                  objectFit="contain"
                  layout="fill"
                  priority
                  onLoad={({ target }) => {
                    const { naturalWidth, naturalHeight } = target as HTMLImageElement;
                    setPaddingTop(`calc(100% / (${naturalWidth} / ${naturalHeight})`);
                  }}
                />
              </Box>
            </Tooltip>
          )}

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexDirection: { xs: "column", sm: "row" },
              flexWrap: "wrap",
              justifyContent: "space-between",
              mt: 5,
            }}
          >
            <Box
              sx={{
                width: { xs: "100%" },
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <NodeTypeIcon nodeType={node.nodeType} />
                {node.changedAt && (
                  <Tooltip title={`Last updated on ${new Date(node.changedAt).toLocaleString()}`}>
                    <Typography sx={{ ml: 1 }} component="span" color="text.secondary" variant="caption">
                      {dayjs(new Date(node.changedAt)).fromNow()}
                    </Typography>
                  </Tooltip>
                )}
              </Box>

              <Stack spacing={{ md: "16px" }} direction={"row"}>
                {(!showShareButtons || window.innerWidth > 1280) && (
                  <FocusedViewNodeVotes
                    correct={node.correct}
                    wrong={node.wrong}
                    corrects={node.corrects}
                    wrongs={node.wrongs}
                  />
                )}
                <Button
                  onClick={() => narrateNode(node.title, node.content)}
                  sx={{
                    background: theme => (theme.palette.mode === "dark" ? "#565757" : "#EAECF0"),
                    width: "40px",
                    height: "40px",
                    minWidth: "40px",
                    borderRadius: "50%",

                    color: theme => (showShareButtons ? theme.palette.common.orange : theme.palette.grey[600]),
                  }}
                >
                  {/* <ReplyIcon sx={{ ml: "10px", transform: "scale(-1,1)" }} /> */}
                  <NextImage
                    src={
                      isSpeaking
                        ? NarrateNodeSpeak
                        : theme.palette.mode === "dark"
                        ? NarrateNodeStopDark
                        : NarrateNodeStopLight
                    }
                    alt="logo 1cademy"
                  />
                </Button>
                <Button
                  onClick={() => setShowShareButtons(!showShareButtons)}
                  sx={{
                    background: theme => (theme.palette.mode === "dark" ? "#565757" : "#EAECF0"),
                    width: "40px",
                    height: "40px",
                    minWidth: "40px",
                    borderRadius: "50%",

                    color: theme => (showShareButtons ? theme.palette.common.orange : theme.palette.grey[600]),
                  }}
                >
                  {/* <ReplyIcon sx={{ ml: "10px", transform: "scale(-1,1)" }} /> */}
                  <NextImage src={theme.palette.mode === "dark" ? ShareIcon : ShareLightIcon} alt="logo 1cademy" />
                </Button>
                {showShareButtons && <ShareButtons url={getNodePageWithDomain(String(node.title), nodeId)} />}
                {editable && (
                  <IconButton onClick={() => router.push({ pathname: `${ROUTES.proposal}/${node.id}` })}>
                    <EditIcon />
                  </IconButton>
                )}
              </Stack>
            </Box>
          </Box>
        </CardContent>
      </Card>
      <Card
        sx={{
          marginTop: "12px",
          paddingBottom: "12px",
          background: theme => (theme.palette.mode === "dark" ? "#303134" : "#F2F4F7"),
        }}
      >
        <CardContent>
          <Tabs variant="fullWidth" value={value} onChange={handleChange} aria-label={"Bookmarks Tabs"}>
            {tabsItems.map((tabItem: any, idx: number) => (
              <Tab
                sx={{
                  fontSize: { xs: "15px", sm: "20px" },
                  fontWeight: "400",
                }}
                key={tabItem.title}
                label={tabItem.title}
                {...a11yProps(idx)}
              />
            ))}
          </Tabs>

          <Box>{tabsItems[value].content}</Box>

          {node.nodeImage && (
            <FullScreenImage
              alt={node.title || ""}
              src={node.nodeImage}
              open={imageFullScreen}
              onClose={() => setImageFullScreen(false)}
            />
          )}
        </CardContent>
      </Card>
    </>
  );
};
