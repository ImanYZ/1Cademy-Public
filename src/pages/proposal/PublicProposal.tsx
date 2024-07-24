import { ThemeProvider } from "@mui/material";
import { Backdrop, Box, CircularProgress, Grid, Link, Skeleton, Tooltip, Typography } from "@mui/material";
import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { useMutation } from "react-query";

import { FullReferencesAutocomplete } from "@/components/FullReferencesAutocomplete";
import FullScreenImage from "@/components/FullScreenImage";
import { FullTagAutocomplete } from "@/components/FullTagAutocomplete";
import { LinkedNodeEditor } from "@/components/LinkedNodeEditor";
import { NodeItemFullEditor, ProposalFormValues } from "@/components/NodeItemFullEditor";
import useConfirmDialog from "@/hooks/useConfirmDialog";
import { buildReferences, buildTags, mapLinkedKnowledgeNodeToLinkedNodeObject } from "@/lib/utils/utils";

import { LinkedKnowledgeNode, ProposalInput } from "../../knowledgeTypes";
import { addProposal } from "../../lib/knowledgeApi";
import { brandingLightTheme } from "../../lib/theme/brandingTheme";
import { PagesNavbar } from "../search";

const PublicProposal = ({
  nodeId,
  setEditNode,
  nodeData,
}: {
  nodeId: string;
  setEditNode: (value: boolean) => void;
  nodeData: any;
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [imageFullScreen, setImageFullScreen] = useState(false);
  const { confirmIt, ConfirmDialog } = useConfirmDialog();

  const handleClickImageFullScreen = () => {
    setImageFullScreen(true);
  };
  const [nodeParentsSelected, setNodeParentsSelected] = useState<LinkedKnowledgeNode[]>([]);
  const [nodeChildrenSelected, setNodeChildrenSelected] = useState<LinkedKnowledgeNode[]>([]);
  const [nodeTagsSelected, setNodeTagsSelected] = useState<LinkedKnowledgeNode[]>([]);
  const [nodeReferencesSelected, setNodeReferencesSelected] = useState<LinkedKnowledgeNode[]>([]);

  const { isLoading: isSavingProposal, mutateAsync } = useMutation(addProposal, { mutationKey: "addProposal" });
  const isLoading = false;

  useEffect(() => {
    if (nodeData?.parents) {
      setNodeParentsSelected(nodeData.parents);
    }
    if (nodeData?.children) {
      setNodeChildrenSelected(nodeData.children);
    }
    if (nodeData?.tags) {
      setNodeTagsSelected(nodeData.tags);
    }
    if (nodeData?.references) {
      setNodeReferencesSelected(nodeData.references);
    }
  }, [nodeData]);

  const onSubmit = async (formValues: ProposalFormValues) => {
    const data: ProposalInput = {
      children: mapLinkedKnowledgeNodeToLinkedNodeObject(nodeChildrenSelected),
      content: formValues.content,
      node: nodeId,
      parents: mapLinkedKnowledgeNodeToLinkedNodeObject(nodeParentsSelected),
      proposal: formValues.reasons,
      ...buildReferences(nodeReferencesSelected),
      ...buildTags(nodeTagsSelected),
      title: formValues.title,
      choices: formValues.questions.length ? formValues.questions : undefined,
      nodeType: formValues.nodeType,
    };
    await mutateAsync({ data, nodeType: formValues.nodeType });
    setEditNode(false);
    enqueueSnackbar(
      <Box sx={{ maxWidth: "428px" }}>
        <Typography fontWeight={700}>'We have received your proposal!'</Typography>
        <Typography>
          Our community members will start reviewing your proposal. Want to be invovled in the review process?
          <Link
            href="https://1cademy.us/home#JoinUsSection"
            target="_blank"
            rel="noreferrer"
            sx={{ fontWeight: 700, color: "white", cursor: "pointer" }}
          >
            {" "}
            Apply{" "}
          </Link>
          to be a 1Cademy Member!
        </Typography>
      </Box>,
      {
        variant: "success",
        anchorOrigin: { horizontal: "left", vertical: "bottom" },
      }
    );
  };

  const cancelChanges = async () => {
    if (await confirmIt("Are you sure you want to discard the changes?", "Cancel Changes", "Keep Changes")) {
      setEditNode(false);
    }
  };

  const getLinkedNodesFallback = () => (
    <Box>
      <Skeleton variant="rectangular" width={"100%"} height={80} />
      <Skeleton variant="rectangular" width={"100%"} height={30} sx={{ my: "20px" }} />
      <Skeleton variant="rectangular" width={"100%"} height={120} />
    </Box>
  );

  const getNodeItemFullEditorFallback = () => (
    <Box>
      <Skeleton variant="rectangular" width={"100%"} height={80} />
      <Skeleton variant="text" width={"100%"} />
      <Skeleton variant="text" width={"100px"} sx={{ ml: "auto" }} />
      <Box display="flex" sx={{ flexDirection: "row-reverse" }}>
        <Skeleton variant="rectangular" width={"200px"} height={36} sx={{ ml: "10px" }} />
        <Skeleton variant="rectangular" width={"200px"} height={36} sx={{ ml: "10px" }} />
      </Box>
      <Skeleton variant="rectangular" width={"100%"} height={40} sx={{ my: "20px" }} />
      <Skeleton variant="rectangular" width={"200px"} height={40} sx={{ my: "20px" }} />
      <Skeleton variant="rectangular" width={"100%"} height={56} />
      <Skeleton variant="rectangular" width={"100%"} height={125} />
      <Skeleton variant="rectangular" width={"100%"} height={300} />
    </Box>
  );

  return (
    <ThemeProvider theme={brandingLightTheme}>
      <PagesNavbar title={`1Cademy - New Proposal`} showSearch={false}>
        <Box data-testid="node-editor-container" sx={{ p: { xs: 3, md: 10 } }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={12} md={3}>
              {isLoading
                ? getLinkedNodesFallback()
                : nodeData?.parents && (
                    <LinkedNodeEditor
                      header="Learn Before"
                      nodesSelected={nodeParentsSelected}
                      setNodesSelected={setNodeParentsSelected}
                    />
                  )}
            </Grid>
            <Grid item xs={12} sm={12} md={6}>
              {isLoading ? (
                getNodeItemFullEditorFallback()
              ) : nodeData ? (
                <NodeItemFullEditor
                  node={nodeData}
                  image={
                    nodeData.nodeImage ? (
                      <Tooltip title="Click to view image in full-screen!">
                        <Box
                          onClick={handleClickImageFullScreen}
                          sx={{
                            display: "block",
                            width: "100%",
                            cursor: "pointer",
                            mt: 3,
                          }}
                        >
                          {/* TODO: Change to next Image */}
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={nodeData.nodeImage}
                            alt={"Preview Image"}
                            width="100%"
                            height="100%"
                            loading="lazy"
                          />
                        </Box>
                      </Tooltip>
                    ) : null
                  }
                  tags={<FullTagAutocomplete tagsSelected={nodeTagsSelected} setTagsSelected={setNodeTagsSelected} />}
                  references={
                    <FullReferencesAutocomplete
                      referencesSelected={nodeReferencesSelected}
                      setReferencesSelected={setNodeReferencesSelected}
                    />
                  }
                  onSubmit={onSubmit}
                  onCancel={cancelChanges}
                />
              ) : null}
            </Grid>
            <Grid item xs={12} sm={12} md={3}>
              {isLoading
                ? getLinkedNodesFallback()
                : nodeData?.children && (
                    <LinkedNodeEditor
                      header="Learn After"
                      nodesSelected={nodeChildrenSelected}
                      setNodesSelected={setNodeChildrenSelected}
                    />
                  )}
            </Grid>
          </Grid>
          {nodeData?.nodeImage && (
            <FullScreenImage
              alt={nodeData.title || ""}
              src={nodeData.nodeImage}
              open={imageFullScreen}
              onClose={() => setImageFullScreen(false)}
            />
          )}

          <Backdrop sx={{ color: "#fff", zIndex: theme => theme.zIndex.drawer + 1 }} open={isSavingProposal}>
            <CircularProgress color="inherit" />
          </Backdrop>
        </Box>
      </PagesNavbar>
      {ConfirmDialog}
    </ThemeProvider>
  );
};

export default PublicProposal;
