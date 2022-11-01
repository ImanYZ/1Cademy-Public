import { ThemeProvider } from "@mui/material";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import dayjs from "dayjs";
import { getAuth } from "firebase/auth";
import { useRouter } from "next/router";
import { GetStaticPaths, GetStaticProps, NextPage } from "next/types";
import { ParsedUrlQuery } from "querystring";
import { useEffect } from "react";

import LinkedNodes from "@/components/LinkedNodes";
import { NodeHead } from "@/components/NodeHead";
import NodeItemContributors from "@/components/NodeItemContributors";
import { NodeItemFull } from "@/components/NodeItemFull";
import NodeItemFullSkeleton from "@/components/NodeItemFullSkeleton";
import PagesNavbar from "@/components/PagesNavbar";
import { ReferencesList } from "@/components/ReferencesList";
import { TagsList } from "@/components/TagsList";
import { getAllNodeParamsForStaticProps, getNodeData } from "@/lib/firestoreServer/nodes";
import { escapeBreaksQuotes } from "@/lib/utils/utils";

import { KnowledgeNode } from "../../../knowledgeTypes";
import { brandingLightTheme } from "../../../lib/theme/brandingTheme";

type Props = {
  node: KnowledgeNode;
  keywords: string;
  updatedStr: string;
  createdStr: string;
};

interface Params extends ParsedUrlQuery {
  id: string;
  title: string;
}
export const getStaticProps: GetStaticProps<Props, Params> = async ({ params }) => {
  const nodeData = await getNodeData(params?.id || "");
  if (!nodeData) {
    return {
      // returns the default 404 page with a status code of 404
      notFound: true,
    };
  }
  let keywords = "";
  for (let tag of nodeData.tags || []) {
    keywords += escapeBreaksQuotes(tag.title) + ", ";
  }

  const updatedStr = nodeData.changedAt ? dayjs(new Date(nodeData.changedAt)).format("YYYY-MM-DD") : "";
  const createdStr = nodeData.createdAt ? dayjs(new Date(nodeData.createdAt)).format("YYYY-MM-DD") : "";

  return {
    props: {
      node: nodeData,
      keywords,
      updatedStr,
      createdStr,
    },
    revalidate: 20,
  };
};

export const getStaticPaths: GetStaticPaths<Params> = async () => {
  const paths = [{ params: { id: "", title: "" } }];
  if (process.env.NODE_ENV === "production") {
    const nodes = await getAllNodeParamsForStaticProps();
    return { paths: nodes, fallback: true };
  }

  return { paths, fallback: true };
};

const NodePage: NextPage<Props> = ({ node, keywords, createdStr, updatedStr }) => {
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();
    const userAuthObj = auth?.currentUser;
    if (userAuthObj !== null && node?.title && node?.id) {
      console.log({ userAuthObj, node });
      router.push({
        pathname: "/dashboard",
        query: { title: node?.title, nodeId: node?.id },
      });
    }
  }, [node, router]);

  if (router.isFallback) {
    return (
      <ThemeProvider theme={brandingLightTheme}>
        <NodeItemFullSkeleton />
      </ThemeProvider>
    );
  }

  const { parents, contributors, references, institutions, tags, children, siblings } = node || {};
  return (
    <ThemeProvider theme={brandingLightTheme}>
      <PagesNavbar title={`1Cademy - ${node.title}`} showSearch={false}>
        <Box data-testid="node-item-container" sx={{ p: { xs: 3, md: 10 } }}>
          <NodeHead node={node} keywords={keywords} createdStr={createdStr} updatedStr={updatedStr} />
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
        </Box>
      </PagesNavbar>
    </ThemeProvider>
  );
};

export default NodePage;
