import { Box, Grid, Skeleton, Tooltip } from "@mui/material";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useQuery } from "react-query";

import { FullReferencesAutocomplete } from "../../components/FullReferencesAutocomplete";
import FullScreenImage from "../../components/FullScreenImage";
import { FullTagAutocomplete } from "../../components/FullTagAutocomplete";
import { LinkedNodeEditor } from "../../components/LinkedNodeEditor";
import { NodeItemFullEditor, ProposalFormValues } from "../../components/NodeItemFullEditor";
import { getNodeData } from "../../lib/knowledgeApi";
import { buildReferences, buildTags, mapLinkedKnowledgeNodeToLinkedNodeObject, mapLinkedKnowledgeNodeToLinkedNodeTag, mapReferencesNodeToTagsArrays } from "../../lib/utils";
import { LinkedKnowledgeNode, ProposalInput } from "../../src/knowledgeTypes";
import { PagesNavbar } from "..";

const NodeProposal = () => {
  const router = useRouter();
  const [imageFullScreen, setImageFullScreen] = useState(false);
  const nodeId = router.query.id as string;
  const { data, isLoading } = useQuery(
    ["nodeData", nodeId],
    () => getNodeData(nodeId),
    { enabled: Boolean(nodeId) }
  );

  const handleClickImageFullScreen = () => { setImageFullScreen(true) }
  const [nodeParentsSelected, setNodeParentsSelected] = useState<LinkedKnowledgeNode[]>([])
  const [nodeChildrenSelected, setNodeChildrenSelected] = useState<LinkedKnowledgeNode[]>([])
  const [nodeTagsSelected, setNodeTagsSelected] = useState<LinkedKnowledgeNode[]>([])
  const [nodeReferencesSelected, setNodeReferencesSelected] = useState<LinkedKnowledgeNode[]>([])

  useEffect(() => {
    if (data?.parents) { setNodeParentsSelected(data.parents) }
    if (data?.children) { setNodeChildrenSelected(data.children) }
    if (data?.tags) { setNodeTagsSelected(data.tags) }
    if (data?.references) { setNodeReferencesSelected(data.references) }
  }, [data])



  const onSubmit = async (formValues: ProposalFormValues) => {
    console.log('submit', nodeTagsSelected)
    const data: ProposalInput = {
      children: mapLinkedKnowledgeNodeToLinkedNodeObject(nodeChildrenSelected),
      content: formValues.content,
      node: nodeId,
      parents: mapLinkedKnowledgeNodeToLinkedNodeObject(nodeParentsSelected),
      reason: formValues.reasons,
      ...buildReferences(nodeReferencesSelected),
      ...buildTags(nodeTagsSelected),
      title: formValues.title,
    }

    console.log('data', data)
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
                    image={data.nodeImage ? (
                      <Tooltip title="Click to view image in full-screen!">
                        <Box
                          onClick={handleClickImageFullScreen}
                          sx={{
                            display: "block",
                            width: "100%",
                            cursor: "pointer",
                            mt: 3
                          }}
                        >
                          <img src={data.nodeImage} width="100%" height="100%" loading="lazy" />
                        </Box>
                      </Tooltip>
                    ) : null}
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
        {data?.nodeImage && (
          <FullScreenImage src={data.nodeImage} open={imageFullScreen} onClose={() => setImageFullScreen(false)} />
        )}
      </Box>
    </PagesNavbar>
  );
};

export default NodeProposal;
