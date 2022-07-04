import { Box, Grid, Skeleton } from "@mui/material";
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

  const getLinkedNodesFallback = () => <Box>
    <Skeleton variant="rectangular" width={'100%'} height={80} />
    <Skeleton variant="rectangular" width={'100%'} height={30} sx={{ my: '20px' }} />
    <Skeleton variant="rectangular" width={'100%'} height={120} />
  </Box>

  const getNodeItemFullEditorFallback = () => <Box>
    <Skeleton variant="rectangular" width={'100%'} height={80} />
    <Skeleton variant="text" width={'100%'} />
    <Skeleton variant="text" width={'100px'} sx={{ ml: 'auto' }} />
    <Box display='flex' sx={{ flexDirection: 'row-reverse' }}>
      <Skeleton variant="rectangular" width={'200px'} height={36} sx={{ ml: '10px' }} />
      <Skeleton variant="rectangular" width={'200px'} height={36} sx={{ ml: '10px' }} />
    </Box>
    <Skeleton variant="rectangular" width={'100%'} height={40} sx={{ my: '20px' }} />
    <Skeleton variant="rectangular" width={'200px'} height={40} sx={{ my: '20px' }} />
    <Skeleton variant="rectangular" width={'100%'} height={56} />
    <Skeleton variant="rectangular" width={'100%'} height={125} />
    <Skeleton variant="rectangular" width={'100%'} height={300} />
  </Box>


  return (
    <PagesNavbar title={`1Cademy - New Proposal`} showSearch={false}>
      <Box data-testid="node-editor-container" sx={{ p: { xs: 3, md: 10 } }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={12} md={3}>
            {
              isLoading
                ? getLinkedNodesFallback()
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
                ? getNodeItemFullEditorFallback()
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
                ? getLinkedNodesFallback()
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
