import { ListItemText } from "@mui/material";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import List from "@mui/material/List";
import { SxProps, Theme } from "@mui/system";
import React from "react";

import TypographyUnderlined from "../../TypographyUnderlined";

type PrerequisiteNodeProps = {
  topics: string[];
  sx?: SxProps<Theme>;
  header: string;
};

const Topics = ({ topics, sx, header }: PrerequisiteNodeProps) => {
  const renderTopics = (topics: string[]) => {
    return topics.map((el, idx) => (
      <React.Fragment key={idx}>
        <ListItemText sx={{ p: "20px" }}>{el}</ListItemText>
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
      <List sx={{ p: "0px" }}>{renderTopics(topics)}</List>
    </Card>
  );
};

export default Topics;
