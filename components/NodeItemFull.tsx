import ReplyIcon from "@mui/icons-material/Reply";
import { Button } from "@mui/material";
import { CardContent } from "@mui/material";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import Divider from "@mui/material/Divider";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import { FC, ReactNode, useState } from "react";

import { KnowledgeNode } from "../src/knowledgeTypes";
import FullScreenImage from "./FullScreenImage";
import MarkdownRender from "./Markdown/MarkdownRender";
import NodeTypeIcon from "./NodeTypeIcon";
import NodeVotes from "./NodeVotes";
import QuestionItem from "./QuestionItem";
import { ShareButtons } from "./ShareButtons";

dayjs.extend(relativeTime);

type Props = {
  node: KnowledgeNode;
  contributors?: ReactNode;
  references?: ReactNode;
  tags?: ReactNode;
};

export const NodeItemFull: FC<Props> = ({ node, contributors, references, tags }) => {
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
        title={<MarkdownRender fontSize="30px" text={node.title || ""} />}
      ></CardHeader>
      <CardContent
        sx={{
          p: { xs: 5, md: 10 },
          "&:last-child": {
            paddingBottom: { xs: 4, md: 10 }
          }
        }}
      >
        {node.content && (
          <Typography
            variant="body1"
            color="text.secondary"
            component="div"
            sx={{
              color: theme => theme.palette.common.black,
              lineHeight: 2,
              fontSize: "19px"
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
                mt: 3
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
            mt: 5
          }}
        >
          <Box
            sx={{
              width: { xs: "100%", sm: "auto" },
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
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

            <Box sx={{ display: "flex" }}>
              <Button
                onClick={() => setShowShareButtons(!showShareButtons)}
                sx={{
                  minWidth: "20px",
                  justifyContent: "start",
                  color: theme => (showShareButtons ? theme.palette.common.orange : theme.palette.grey[600])
                }}
              >
                <ReplyIcon sx={{ ml: "10px", transform: "scale(-1,1)" }} />
                {!showShareButtons && <Typography py="2px">Share</Typography>}
              </Button>
              {showShareButtons && <ShareButtons />}
            </Box>
          </Box>
          <Box
            sx={{
              width: "100%",
              pt: { xs: "20px", sm: "0px" },
              display: "flex",
              flex: 1,
              justifyContent: "flex-end",
              alignItems: { xs: "end", sm: "center" }
            }}
          >
            <NodeVotes corrects={node.corrects} wrongs={node.wrongs} />
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
