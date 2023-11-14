import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { TreeItem, TreeView } from "@mui/lab";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import React, { useEffect, useState } from "react";

const TreeViewSimplified = ({ mainSpecializations, openMainCategory }: any) => {
  const [expandedNodes, setExpandedNodes] = useState<any>([]);

  useEffect(() => {
    const updatedExpandedNodes = calculateExpandedNodes(mainSpecializations);
    setExpandedNodes(updatedExpandedNodes);
  }, [mainSpecializations]);

  const calculateExpandedNodes = (specializations: any) => {
    const updatedExpandedNodes: any = [];

    Object.keys(specializations).forEach(category => {
      updatedExpandedNodes.push(specializations[category]?.id || category);

      if (Object.keys(specializations[category].specializations).length > 0) {
        const childExpandedNodes = calculateExpandedNodes(specializations[category].specializations);
        updatedExpandedNodes.push(...childExpandedNodes);
      }
    });

    return updatedExpandedNodes;
  };

  return (
    <TreeView
      defaultCollapseIcon={<ExpandMoreIcon />}
      defaultExpandIcon={<ChevronRightIcon />}
      defaultExpanded={expandedNodes}
    >
      {Object.keys(mainSpecializations).map(category => (
        <TreeItem
          key={mainSpecializations[category]?.id || category}
          nodeId={mainSpecializations[category]?.id || category}
          label={
            <Box sx={{ display: "flex", alignItems: "center", height: "30px" }}>
              <Typography
                sx={{
                  fontWeight: mainSpecializations[category].isCategory ? "bold" : "",
                }}
                onClick={() => {
                  if (!mainSpecializations[category].isCategory)
                    openMainCategory(category, mainSpecializations[category]?.path || []);
                }}
              >
                {!mainSpecializations[category].isCategory
                  ? category.split(" ").splice(0, 3).join(" ") + (category.split(" ").length > 3 ? "..." : "")
                  : category}
              </Typography>
            </Box>
          }
        >
          {Object.keys(mainSpecializations[category].specializations).length > 0 && (
            <TreeViewSimplified
              mainSpecializations={mainSpecializations[category].specializations}
              openMainCategory={openMainCategory}
            />
          )}
        </TreeItem>
      ))}
    </TreeView>
  );
};

export default TreeViewSimplified;
