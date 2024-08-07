import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Typography } from "@mui/material";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import { SxProps, Theme } from "@mui/system";
import { TreeItem, TreeView } from "@mui/x-tree-view";
import React from "react";

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
  const renderPrerequisiteNodes = (nodes: PrerequisiteNodeFieldProps[]) => {
    return nodes.map((el, idx) => (
      <React.Fragment key={idx}>
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
          <TreeItem
            sx={{ "& .MuiTreeItem-content": { py: 3 } }}
            label={el.title}
            nodeId={`${el.title}-${idx}`}
            key={`${el.title}-${idx}`}
          >
            {el?.nodes && el?.nodes?.length > 0 && <>{renderPrerequisiteNodes(el.nodes)}</>}
          </TreeItem>
        </HtmlTooltip>
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
      <TreeView defaultCollapseIcon={<ExpandMoreIcon />} defaultExpandIcon={<ChevronRightIcon />}>
        {renderPrerequisiteNodes(nodes)}
      </TreeView>
    </Card>
  );
};

export default PrerequisiteNodes;
