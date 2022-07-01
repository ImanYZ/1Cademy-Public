import { Box, Container, Divider, Grid, Paper, Stack, useMediaQuery } from "@mui/material";
import { useRouter } from "next/router";
import React from "react";
import { useQuery } from "react-query";

import { LinkedNodeEditor } from "../../components/LinkedNodeEditor";
import { NodeItemFullEditor } from "../../components/NodeItemFullEditor";
import { getNodeData } from "../../lib/knowledgeApi";
import { PagesNavbar } from "..";

const NodeProposal = () => {
  const router = useRouter();

  const nodeId = router.query.id as string;

  const { data, isLoading } = useQuery(["nodeData", nodeId], () => getNodeData(nodeId),
    { enabled: Boolean(nodeId) }
  );

  console.log('data', data)

  return (
    <PagesNavbar title={`1Cademy - New Proposal`} showSearch={false}>
      {isLoading && <h1>Loading ...</h1>}
      <Box data-testid="node-editor-container" sx={{ p: { xs: 3, md: 10 } }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={12} md={3}>
            {
              isLoading
                ? <h3>Loading parents ...</h3>
                : data?.parents && <LinkedNodeEditor initialNodes={data.parents} header="Learn Before" />
            }
          </Grid>
          <Grid item xs={12} sm={12} md={6}>
            {
              isLoading
                ? <h3>Loading node ...</h3>
                : data ? <NodeItemFullEditor node={data} /> : null
            }
          </Grid>
          <Grid item xs={12} sm={12} md={3}>
            {
              isLoading
                ? <h3>Loading children ...</h3>
                : data?.children && <LinkedNodeEditor initialNodes={data.children} header="Learn After" />
            }
          </Grid>
        </Grid>
      </Box>
    </PagesNavbar>
  );
};

export default NodeProposal;
