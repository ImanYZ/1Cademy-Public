import { ListItemIcon } from "@mui/material";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import { SxProps, Theme } from "@mui/system";
import React from "react";

import { getNodePageUrl } from "@/lib/utils/utils";

import { LinkedKnowledgeNode } from "../knowledgeTypes";
import LinkedNodeItem from "./LinkedNodeItem";
import NodeTypeIcon from "./NodeTypeIcon";
import TypographyUnderlined from "./TypographyUnderlined";

type LinkedNodesProps = {
  data: LinkedKnowledgeNode[];
  header: string;
  sx?: SxProps<Theme>;
};

const LinkedNodes = ({ data, header, sx }: LinkedNodesProps) => {
  const renderLinkedNodes = () => {
    return data.map((el, idx, src) => (
      <React.Fragment key={idx}>
        <LinkedNodeItem
          title={el.title || ""}
          linkSrc={getNodePageUrl(el.title || "", el.node)}
          nodeType={el.nodeType}
          nodeImageUrl={el.nodeImage}
          nodeContent={el.content}
          label={el.label || ""}
          sx={{ p: "20px" }}
          secondaryActions={
            <ListItemIcon>
              <NodeTypeIcon tooltipPlacement="bottom" nodeType={el.nodeType} sx={{ marginLeft: "auto" }} />
            </ListItemIcon>
          }
        />
        {idx < src.length - 1 && <Divider component="li" />}
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
      <List sx={{ p: "0px" }}>{renderLinkedNodes()}</List>
    </Card>
  );
};

export default LinkedNodes;
