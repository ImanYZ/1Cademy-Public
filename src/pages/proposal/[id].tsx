import { ThemeProvider } from "@mui/material";
import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogTitle,
  Grid,
  Link,
  Skeleton,
  Tooltip,
  Typography,
} from "@mui/material";
import { useRouter } from "next/router";
import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "react-query";

import { FullReferencesAutocomplete } from "@/components/FullReferencesAutocomplete";
import FullScreenImage from "@/components/FullScreenImage";
import { FullTagAutocomplete } from "@/components/FullTagAutocomplete";
import { LinkedNodeEditor } from "@/components/LinkedNodeEditor";
import { NodeItemFullEditor, ProposalFormValues } from "@/components/NodeItemFullEditor";
import {
  buildReferences,
  buildTags,
  getNodePageUrl,
  mapLinkedKnowledgeNodeToLinkedNodeObject,
} from "@/lib/utils/utils";

import { LinkedKnowledgeNode, ProposalInput } from "../../knowledgeTypes";
import { addProposal, getNodeData } from "../../lib/knowledgeApi";
import { brandingLightTheme } from "../../lib/theme/brandingTheme";
import { PagesNavbar } from "../search";

const NodeProposal = () => {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const [imageFullScreen, setImageFullScreen] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const nodeId = router.query.id as string;
  const { data, isLoading } = useQuery(["nodeData", nodeId], () => getNodeData(nodeId), { enabled: Boolean(nodeId) });

  const handleClickImageFullScreen = () => {
    setImageFullScreen(true);
  };
  const [nodeParentsSelected, setNodeParentsSelected] = useState<LinkedKnowledgeNode[]>([]);
  const [nodeChildrenSelected, setNodeChildrenSelected] = useState<LinkedKnowledgeNode[]>([]);
  const [nodeTagsSelected, setNodeTagsSelected] = useState<LinkedKnowledgeNode[]>([]);
  const [nodeReferencesSelected, setNodeReferencesSelected] = useState<LinkedKnowledgeNode[]>([]);

  const { isLoading: isSavingProposal, mutateAsync } = useMutation(addProposal, { mutationKey: "addProposal" });

  useEffect(() => {
    if (data?.parents) {
      setNodeParentsSelected(data.parents);
    }
    if (data?.children) {
      setNodeChildrenSelected(data.children);
    }
    if (data?.tags) {
      setNodeTagsSelected(data.tags);
    }
    if (data?.references) {
      setNodeReferencesSelected(data.references);
    }
  }, [data]);

  const onSubmit = async (formValues: ProposalFormValues) => {
    const data: ProposalInput = {
      children: mapLinkedKnowledgeNodeToLinkedNodeObject(nodeChildrenSelected),
      content: formValues.content,
      node: nodeId,
      parents: mapLinkedKnowledgeNodeToLinkedNodeObject(nodeParentsSelected),
      summary: formValues.reasons,
      ...buildReferences(nodeReferencesSelected),
      ...buildTags(nodeTagsSelected),
      title: formValues.title,
      choices: formValues.questions.length ? formValues.questions : undefined,
    };
    await mutateAsync({ data, nodeType: formValues.nodeType });
    router.push({ pathname: getNodePageUrl(data?.title || "", nodeId) });
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
                : data?.parents && (
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
              ) : data ? (
                <NodeItemFullEditor
                  node={data}
                  image={
                    data.nodeImage ? (
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
                          <img src={data.nodeImage} alt={"Preview Image"} width="100%" height="100%" loading="lazy" />
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
                  onCancel={() => setShowConfirmation(true)}
                />
              ) : null}
            </Grid>
            <Grid item xs={12} sm={12} md={3}>
              {isLoading
                ? getLinkedNodesFallback()
                : data?.children && (
                    <LinkedNodeEditor
                      header="Learn After"
                      nodesSelected={nodeChildrenSelected}
                      setNodesSelected={setNodeChildrenSelected}
                    />
                  )}
            </Grid>
          </Grid>
          {data?.nodeImage && (
            <FullScreenImage
              alt={data.title || ""}
              src={data.nodeImage}
              open={imageFullScreen}
              onClose={() => setImageFullScreen(false)}
            />
          )}

          <Backdrop sx={{ color: "#fff", zIndex: theme => theme.zIndex.drawer + 1 }} open={isSavingProposal}>
            <CircularProgress color="inherit" />
          </Backdrop>

          <Dialog open={showConfirmation} onClose={() => setShowConfirmation(false)} sx={{ width: "444px", m: "auto" }}>
            <DialogTitle id="alert-dialog-title">{"Are you sure you want to discard the changes?"}</DialogTitle>

            <DialogActions>
              <Button variant="contained" onClick={() => setShowConfirmation(false)}>
                Cancel
              </Button>
              <Button onClick={() => router.push({ pathname: getNodePageUrl(data?.title || "", nodeId) })} autoFocus>
                Yes, I'm sure
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </PagesNavbar>
    </ThemeProvider>
  );
};

export default NodeProposal;
