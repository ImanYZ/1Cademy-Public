import { Box, Container, Divider, Grid, Paper, Stack, useMediaQuery } from "@mui/material";
import { useRouter } from "next/router";
import React from "react";

import { LinkedNodeEditor } from "../../components/LinkedNodeEditor";
import { ProposalEditor } from "../../components/ProposalEditor";
import { ProposalPreview } from "../../components/ProposalPreview";
import { KnowledgeNode, NodeType } from "../../src/knowledgeTypes";
import { PagesNavbar } from "..";

const NodeProposal = () => {
  const hasMinMediumDeviceWidth = useMediaQuery('(min-width:900px)');
  const router = useRouter();

  const { id } = router.query;


  const editNode: KnowledgeNode = {
    parents: [{
      title: 'some parent node',
      nodeType: NodeType.Question,
      node: 'node string',
    }],
    nodeType: NodeType.News,
    id: 'sdf',
    aFullname: '',
    aImgUrl: '',
    admin: '',
  }

  const { parents, contributors, references, institutions, tags, children, siblings } = editNode || {};
  console.log("router", id);

  return (
    <PagesNavbar title={`1Cademy - New Proposal`} showSearch={false}>
      {/* <Container sx={{ mt: 15, mb: 10 }}>
        <Paper>
          <Stack
            direction={{ xs: "column", md: "row" }}
            divider={<Divider orientation={hasMinMediumDeviceWidth ? 'vertical' : 'horizontal'} flexItem />}
          >
            <ProposalEditor />
          </Stack>
        </Paper>
      </Container> */}
      <Box data-testid="node-editor-container" sx={{ p: { xs: 3, md: 10 } }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={12} md={3}>
            {parents && parents?.length > 0 && <LinkedNodeEditor initialNodes={parents || []} header="Learn Before" />}
          </Grid>
          <Grid item xs={12} sm={12} md={6}>
            {/* <NodeItemFull
            node={node}
            contributors={
              <NodeItemContributors contributors={contributors || []} institutions={institutions || []} />
            }
            references={<ReferencesList references={references || []} sx={{ mt: 3 }} />}
            tags={<TagsList tags={tags || []} sx={{ mt: 3 }} />}
          />
          {siblings && siblings.length > 0 && (
            <LinkedNodes sx={{ mt: 3 }} data={siblings} header="Related"></LinkedNodes>
          )} */}
          </Grid>
          <Grid item xs={12} sm={12} md={3}>
            {children && children?.length > 0 && <LinkedNodeEditor initialNodes={children || []} header="Learn After" />}
          </Grid>
        </Grid>
      </Box>
    </PagesNavbar>
  );
};

export default NodeProposal;
