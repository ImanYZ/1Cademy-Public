import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { Avatar, CardActionArea, Collapse, Grid, IconButton } from "@mui/material";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Chip from "@mui/material/Chip";
import Link from "@mui/material/Link";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import NextLink from "next/link";
import { useState } from "react";

import { getInstitutionsByName } from "@/lib/firestoreClient/institutions";
import ROUTES from "@/lib/utils/routes";
import { getNodePageUrl } from "@/lib/utils/utils";

import { SimpleNode } from "../knowledgeTypes";
import MarkdownRender from "./Markdown/MarkdownRender";
import NodeTypeIcon from "./NodeTypeIcon";
import NodeVotes from "./NodeVotes";
import OptimizedAvatar from "./OptimizedAvatar";
import QuestionItem from "./QuestionItem";

dayjs.extend(relativeTime);

type InstitutionData = {
  id: string;
  name: string;
  logoURL: string;
};

type NodeItemProps = {
  node: SimpleNode;
};

export const NodeItem = ({ node }: NodeItemProps) => {
  const [expanded, setExpanded] = useState(false);
  const [institutionsData, setInstitutionsData] = useState<InstitutionData[]>([]);
  const [paddingTop, setPaddingTop] = useState("0");

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const handleGetInstitutionsData = async () => {
    const names: string[] = node.institutions.map(cur => cur.name);
    if (institutionsData.length) return;

    const institutions = await getInstitutionsByName(names);
    setInstitutionsData(institutions);
  };

  const getInstitutionData = (): InstitutionData[] => {
    if (institutionsData.length) {
      return institutionsData;
    }
    if (node.institutions) {
      return node.institutions.map(cur => ({ name: cur.name, logoURL: "", id: "" }));
    }
    return [];
  };

  const ExpandMore = ({ expand }: { expand: boolean }) => {
    return (
      <IconButton
        onClick={handleExpandClick}
        aria-expanded={expanded}
        aria-label="show more"
        sx={{
          transform: !expand ? "rotate(0deg)" : "rotate(180deg)",
        }}
      >
        <Tooltip title={expand ? "Hide the tags and contributors." : "Show the tags and contributors."}>
          <ArrowDropDownIcon />
        </Tooltip>
      </IconButton>
    );
  };

  return (
    <Card data-testid="node-item" sx={{ width: "100%", ":hover": { boxShadow: "2px 2px 15px rgba(0, 0, 0, 0.2)" } }}>
      <NextLink passHref href={getNodePageUrl(node.title || "", node.id)}>
        <Link underline="none" color="inherit">
          <CardActionArea sx={{ pt: { xs: 4, lg: 6 }, px: { xs: 5, lg: 10 }, pb: 2 }}>
            <CardHeader sx={{ p: 0, pb: 5 }} title={<MarkdownRender text={node.title || ""} />}></CardHeader>

            <CardContent sx={{ p: 0, height: "100%" }}>
              <Typography variant="body1" fontSize="0.9rem" component="div">
                <MarkdownRender text={node.content || ""} />
              </Typography>

              {node.nodeType === "Question" && <QuestionItem choices={node.choices} />}

              {node.nodeImage && (
                <Box
                  style={{ paddingTop }}
                  sx={{
                    position: "relative",
                  }}
                >
                  <Image
                    src={node.nodeImage}
                    alt={node.title}
                    layout="fill"
                    objectFit="contain"
                    priority
                    onLoad={({ target }) => {
                      const { naturalWidth, naturalHeight } = target as HTMLImageElement;
                      setPaddingTop(`calc(100% / (${naturalWidth} / ${naturalHeight})`);
                    }}
                    quality={50}
                  />
                </Box>
              )}
            </CardContent>
          </CardActionArea>
        </Link>
      </NextLink>

      <CardActions sx={{ px: 10, pb: 5, pt: 4 }}>
        <Box sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              flex: 1,
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box sx={{ display: "flex", flex: 1, justifyContent: "space-between" }}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <NodeTypeIcon nodeType={node.nodeType} />
                {node.changedAt && (
                  <Tooltip title={`Last updated on ${new Date(node.changedAt).toLocaleString()}`}>
                    <Typography sx={{ ml: 3 }} component="span" color="text.secondary" variant="caption">
                      {dayjs(new Date(node.changedAt)).fromNow()}
                    </Typography>
                  </Tooltip>
                )}
              </Box>
              <NodeVotes corrects={node.corrects} wrongs={node.wrongs} />
            </Box>
            <ExpandMore expand={expanded} />
          </Box>
          <Collapse sx={{ mt: 5 }} in={expanded} timeout="auto" onEnter={handleGetInstitutionsData} unmountOnExit>
            <Box pb={1}>
              {node.tags &&
                node.tags.map((tag, idx) => (
                  <Chip key={idx} label={tag} sx={{ marginRight: "10px", marginBottom: "8px" }} />
                ))}
            </Box>
            <Grid container spacing={2} columns={2} py={1}>
              <Grid item xs={1}>
                <Box sx={{ display: "flex", flexWrap: "wrap", px: "10px" }}>
                  {node.contributors &&
                    node.contributors.map((contributor, idx) => (
                      <NextLink key={idx} passHref href={`${ROUTES.home}?contributors=${contributor.username}`}>
                        <Tooltip title={`${contributor.fullName} contributed to the evolution of this node.`}>
                          <Avatar
                            component={Link}
                            sx={{
                              marginLeft: "-10px",
                              color: theme => theme.palette.common.gray,
                              width: 50,
                              height: 50,
                              borderColor: "red",
                              border: "solid 2px",
                            }}
                          >
                            <Image
                              alt={contributor.fullName}
                              src={contributor.imageUrl}
                              width={50}
                              height={50}
                              objectFit="cover"
                              quality={40}
                            />
                          </Avatar>
                        </Tooltip>
                      </NextLink>
                    ))}
                </Box>
              </Grid>
              <Grid item xs={1}>
                <Box sx={{ display: "flex", flexWrap: "wrap", px: "10px" }}>
                  {getInstitutionData().map((institution, idx) => (
                    <Box key={idx} sx={{ display: "inline-block" }}>
                      <Tooltip
                        title={`Students/researchers at ${institution.name} contributed to the evolution of this node.`}
                      >
                        <Box sx={{ marginLeft: "-10px" }}>
                          {institution.id ? (
                            <Link href={`${ROUTES.home}?institutions=${institution.id}`}>
                              <OptimizedAvatar
                                name={institution.name}
                                imageUrl={institution?.logoURL}
                                contained={true}
                              />
                            </Link>
                          ) : (
                            <OptimizedAvatar name={institution.name} imageUrl={institution?.logoURL} contained={true} />
                          )}
                        </Box>
                      </Tooltip>
                    </Box>
                  ))}
                </Box>
              </Grid>
            </Grid>
          </Collapse>
        </Box>
      </CardActions>
    </Card>
  );
};
