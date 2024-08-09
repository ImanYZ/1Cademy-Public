import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Typography } from "@mui/material";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import { SxProps, Theme } from "@mui/system";
import { TreeItem, TreeView } from "@mui/x-tree-view";
import React, { useEffect, useState } from "react";

import HtmlTooltip from "@/components/HtmlTooltip";
import MarkdownRender from "@/components/Markdown/MarkdownRender";

import TypographyUnderlined from "../../TypographyUnderlined";

type PrerequisiteNodeFieldProps = {
  nodeType: string;
  content: string;
  nodeSlug: string;
  node: string;
  label?: string;
  title: string;
  nodes?: PrerequisiteNodeFieldProps[];
};

type PrerequisiteNodeProps = {
  nodes: PrerequisiteNodeFieldProps[];
  sx?: SxProps<Theme>;
  header: string;
};

const PrerequisiteNodes = ({ nodes, sx, header }: PrerequisiteNodeProps) => {
  const [expanded, setExpanded] = useState<string[]>([]);

  useEffect(() => {
    const getAllNodeIds = (nodes: PrerequisiteNodeFieldProps[]) => {
      let ids: string[] = [];
      nodes.forEach(node => {
        ids.push(node.title);
        if (node.nodes) {
          ids = ids.concat(getAllNodeIds(node.nodes));
        }
      });
      return ids;
    };

    const allNodeIds = getAllNodeIds(nodes);
    setExpanded(allNodeIds);
  }, [nodes]);

  const handleToggle = (event: React.SyntheticEvent<Element, Event>, nodeIds: string[]) => {
    setExpanded(nodeIds);
  };
  const renderPrerequisiteNodes = (nodes: PrerequisiteNodeFieldProps[]) => {
    return nodes.map((el, idx) => (
      <React.Fragment key={idx}>
        <TreeItem
          label={
            <HtmlTooltip
              sx={{ zIndex: 9999 }}
              title={
                <Box>
                  <Typography variant="body2" component="div">
                    <MarkdownRender text={el.content || ""} />
                  </Typography>
                </Box>
              }
              placement="left"
            >
              <Typography sx={{ py: 3, position: "relative", right: "35px", pl: "35px" }}>{el.title}</Typography>
            </HtmlTooltip>
          }
          nodeId={`${el.title}`}
          key={`${el.title}-${idx}`}
        >
          {el?.nodes && el?.nodes?.length > 0 && <>{renderPrerequisiteNodes(el.nodes)}</>}
        </TreeItem>
      </React.Fragment>
    ));
  };

  return (
    <Card sx={{ ...sx }}>
      <CardHeader
        sx={{
          backgroundColor: theme =>
            theme.palette.mode === "light" ? theme.palette.common.darkGrayBackground : theme.palette.common.black,
          // color: theme => theme.palette.common.white,
        }}
        title={
          <Box sx={{ textAlign: "center", color: "inherit" }}>
            <TypographyUnderlined
              variant="h6"
              fontWeight="300"
              gutterBottom
              align="center"
              sx={{ color: theme => theme.palette.common.white }}
            >
              {header}
            </TypographyUnderlined>
          </Box>
        }
      ></CardHeader>
      <TreeView
        expanded={expanded}
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
        onNodeToggle={handleToggle}
        sx={{
          "& .Mui-selected": {
            backgroundColor: "transparent!important",
          },
          "& .Mui-selected:hover": {
            backgroundColor: theme =>
              theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.08)!important" : "rgba(0, 0, 0, 0.04)!important",
          },
        }}
      >
        {renderPrerequisiteNodes(nodes)}
      </TreeView>
    </Card>
  );
};

export default PrerequisiteNodes;
