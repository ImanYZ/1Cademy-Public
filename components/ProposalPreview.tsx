import { Grid } from "@mui/material";
import React, { FC } from "react";

import { KnowledgeNode } from "../src/knowledgeTypes";
import LinkedNodes from "./LinkedNodes";
import NodeItemContributors from "./NodeItemContributors";
import { NodeItemFull } from "./NodeItemFull";
import { ReferencesList } from "./ReferencesList";
import { TagsList } from "./TagsList";

type props = {
  node: KnowledgeNode
}

export const ProposalPreview: FC<props> = ({ node }) => {

  const { parents, contributors, references, institutions, tags, children, siblings } = node || {};

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={12} md={3}>
        {parents && parents?.length > 0 && <LinkedNodes data={parents || []} header="Learn Before" />}
      </Grid>
      <Grid item xs={12} sm={12} md={6}>
        <NodeItemFull
          node={node}
          contributors={
            <NodeItemContributors contributors={contributors || []} institutions={institutions || []} />
          }
          references={<ReferencesList references={references || []} sx={{ mt: 3 }} />}
          tags={<TagsList tags={tags || []} sx={{ mt: 3 }} />}
        />
        {siblings && siblings.length > 0 && (
          <LinkedNodes sx={{ mt: 3 }} data={siblings} header="Related"></LinkedNodes>
        )}
      </Grid>
      <Grid item xs={12} sm={12} md={3}>
        {children && children?.length > 0 && <LinkedNodes data={children || []} header="Learn After" />}
      </Grid>
    </Grid>
  );
};
