import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import { SxProps, Theme } from "@mui/system";
import React from "react";

import { getNodePageUrl } from "../lib/utils";
import { LinkedKnowledgeNode } from "../src/knowledgeTypes";
import LinkedNodeItem from "./LinkedNodeItem";
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
        />
        {idx < src.length - 1 && <Divider />}
      </React.Fragment>
    ));
  };

  return (
    <Card sx={{ ...sx }}>
      <CardHeader
        sx={{
          backgroundColor: theme => theme.palette.common.darkGrayBackground,
          color: theme => theme.palette.common.white
        }}
        title={
          <Box sx={{ textAlign: "center" }}>
            <TypographyUnderlined variant="h6" fontWeight="300" gutterBottom align="center">
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
