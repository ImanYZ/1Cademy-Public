import { Box, Grid } from "@mui/material";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useQuery } from "react-query";

import { FullReferencesAutocomplete } from "../../components/FullReferencesAutocomplete";
import { FullTagAutocomplete } from "../../components/FullTagAutocomplete";
import { ImageUploader } from "../../components/ImageUploader";
import { LinkedNodeEditor } from "../../components/LinkedNodeEditor";
import { NodeItemFullEditor, ProposalFormValues } from "../../components/NodeItemFullEditor";
import { getNodeData } from "../../lib/knowledgeApi";
import { LinkedKnowledgeNode } from "../../src/knowledgeTypes";
import { PagesNavbar } from "..";

const NodeProposal = () => {
  const router = useRouter();
  const nodeId = router.query.id as string;
  const { data, isLoading } = useQuery(
    ["nodeData", nodeId],
    () => getNodeData(nodeId),
    { enabled: Boolean(nodeId) }
  );

  const [nodeParentsSelected, setNodeParentsSelected] = useState<LinkedKnowledgeNode[]>([])
  const [nodeChildrenSelected, setNodeChildrenSelected] = useState<LinkedKnowledgeNode[]>([])
  const [nodeTagsSelected, setNodeTagsSelected] = useState<LinkedKnowledgeNode[]>([])
  const [nodeReferencesSelected, setNodeReferencesSelected] = useState<LinkedKnowledgeNode[]>([])
  const [fileImage, setFileImage] = useState(null)

  useEffect(() => {
    if (data?.parents) { setNodeParentsSelected(data.parents) }
    if (data?.children) { setNodeChildrenSelected(data.children) }
    if (data?.tags) { setNodeTagsSelected(data.tags) }
    if (data?.references) { setNodeReferencesSelected(data.references) }
  }, [data])

  const onSubmit = async (formValues: ProposalFormValues) => {
    console.log('on submit from edit page', {
      nodeParentsSelected,
      nodeChildrenSelected,
      nodeTagsSelected,
      nodeReferencesSelected,
      formValues,
      fileImage
    })
  }

  return (
    <PagesNavbar title={`1Cademy - New Proposal`} showSearch={false}>
      {isLoading && <h1>Loading ...</h1>}
      <Box data-testid="node-editor-container" sx={{ p: { xs: 3, md: 10 } }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={12} md={3}>
            {
              isLoading
                ? <h3>Loading parents ...</h3>
                : data?.parents && <LinkedNodeEditor
                  header="Learn Before"
                  nodesSelected={nodeParentsSelected}
                  setNodesSelected={setNodeParentsSelected}
                />
            }
          </Grid>
          <Grid item xs={12} sm={12} md={6}>
            {
              isLoading
                ? <h3>Loading node ...</h3>
                : data
                  ? <NodeItemFullEditor
                    node={data}
                    imageUploader={(
                      <ImageUploader
                        image={fileImage}
                        setImage={setFileImage}
                        defaultImageURI={data?.nodeImage || ''}
                      />)
                    }
                    tags={(
                      <FullTagAutocomplete
                        tagsSelected={nodeTagsSelected}
                        setTagsSelected={setNodeTagsSelected}
                      />)
                    }
                    references={(
                      <FullReferencesAutocomplete
                        referencesSelected={nodeReferencesSelected}
                        setReferencesSelected={setNodeReferencesSelected}
                      />)
                    }
                    onSubmit={onSubmit}
                  />
                  : null
            }
          </Grid>
          <Grid item xs={12} sm={12} md={3}>
            {
              isLoading
                ? <h3>Loading children ...</h3>
                : data?.children && <LinkedNodeEditor
                  header="Learn After"
                  nodesSelected={nodeChildrenSelected}
                  setNodesSelected={setNodeChildrenSelected}
                />
            }
          </Grid>
        </Grid>
      </Box>
    </PagesNavbar>
  );
};

export default NodeProposal;
