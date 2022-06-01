import Masonry from "@mui/lab/Masonry";
import Box from "@mui/material/Box";
import Pagination from "@mui/material/Pagination";
import { SxProps, Theme } from "@mui/system";

import { KnowledgeNode } from "../src/knowledgeTypes";
import { NodeItem } from "./NodeItem";

type Props = {
  nodes: KnowledgeNode[];
  page: number;
  totalPages: number;
  sx?: SxProps<Theme>;
  onChangePage: (page: number) => void;
};

export const TrendingNodes = ({ nodes, sx, page, totalPages, onChangePage }: Props) => {
  const handleChangePage = (event: React.ChangeEvent<unknown>, value: number) => {
    onChangePage(value);
  };

  if (nodes.length === 0) {
    return <Box sx={{ textAlign: "center", mt: 3, ...sx }}>No data found</Box>;
  }

  return (
    <Box sx={{ ...sx }}>
      <Masonry sx={{ my: "20px" }} columns={{ xm: 1, md: 2 }} spacing={2} defaultHeight={450}>
        {nodes.map(el => (
          <NodeItem key={el.id} node={el} />
        ))}
      </Masonry>
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Pagination count={totalPages} page={page} onChange={handleChangePage} />
      </Box>
    </Box>
  );
};
