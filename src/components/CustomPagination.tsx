import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { Button } from "@mui/material";
import { styled } from "@mui/material/styles";
import usePagination from "@mui/material/usePagination";
import React from "react";

interface CustomPaginationProps {
  count: number;
  page: number;
  onChange: (event: React.ChangeEvent<unknown>, value: number) => void;
}

export const CustomPagination = ({ count, page, onChange }: CustomPaginationProps) => {
  const { items } = usePagination({ count, page, onChange });

  return (
    <nav data-testid="pagination">
      <List>
        {items.map(({ page, type, selected, ...item }, index) => {
          let children = null;

          if (type === "start-ellipsis" || type === "end-ellipsis") {
            children = "…";
          } else if (type === "page") {
            children = (
              <Button
                aria-label={`page ${page}`}
                sx={{
                  minWidth: "40px",
                  height: "40px",
                  borderRadius: "40px",
                  fontWeight: "400",
                  color: theme => theme.palette.common.black,
                  background: selected ? theme => theme.palette.grey[200] : undefined,
                }}
                {...item}
              >
                {page ? page.toLocaleString() : ""}
              </Button>
            );
          } else if (type === "previous") {
            children = (
              <Button
                type="button"
                sx={{
                  color: theme => theme.palette.common.black,
                  fontWeight: "400",
                }}
                {...item}
              >
                <ChevronLeftIcon fontSize="small" /> Prev
              </Button>
            );
          } else if (type === "next") {
            children = (
              <Button
                type="button"
                sx={{
                  color: theme => theme.palette.common.black,
                  fontWeight: "400",
                }}
                {...item}
              >
                Next <ChevronRightIcon fontSize="small" />
              </Button>
            );
          } else {
            children = (
              <Button type="button" {...item}>
                {type}
              </Button>
            );
          }

          return <li key={index}>{children}</li>;
        })}
      </List>
    </nav>
  );
};

const List = styled("ul")({
  listStyle: "none",
  padding: 0,
  margin: 0,
  display: "flex",
  alignItems: "center",
});
