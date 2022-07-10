import Masonry from "@mui/lab/Masonry";
import { Skeleton } from "@mui/material";
import Box from "@mui/material/Box";
import { SxProps, Theme } from "@mui/system";

import { randomIntFromInterval } from "../lib/utils";
import { SimpleNode } from "../src/knowledgeTypes";
import { CustomPagination } from "./CustomPagination";
import { NodeItem } from "./NodeItem";

type MasonryNodesProps = {
  nodes: SimpleNode[];
  page: number;
  totalPages?: number;
  sx?: SxProps<Theme>;
  onChangePage: (page: number) => void;
  isLoading?: boolean;
};

export const MasonryNodes = ({ nodes, sx, page, totalPages, onChangePage, isLoading }: MasonryNodesProps) => {
  const handleChangePage = (event: React.ChangeEvent<unknown>, value: number) => {
    onChangePage(value);
  };

  if (!isLoading && nodes.length === 0) {
    return <Box sx={{ textAlign: "center", mt: 3, ...sx }}>No data found</Box>;
  }

  const renderLoadingSkeletons = () => {
    const elements = [];
    for (let i = 0; i < 10; i++) {
      const height = randomIntFromInterval(250, 700);
      elements.push(<Skeleton data-testid="node-item-skeleton" key={i} height={height} />);
    }
    return elements;
  };

  return (
    <Box sx={{ ...sx }}>
      <Masonry sx={{ my: 4, mx: { md: "0px" } }} columns={{ xm: 1, md: 2 }} spacing={4} defaultHeight={450}>
        {isLoading && renderLoadingSkeletons()}
        {!isLoading && nodes.map((el: any) => <NodeItem key={el.id} node={el} />)}
      </Masonry>
      {totalPages && totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <CustomPagination count={totalPages} page={page} onChange={handleChangePage} />
        </Box>
      )}
    </Box>
  );
};
