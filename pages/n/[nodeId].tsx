import { db } from "lib/admin";
import { generateAlias } from "lib/utils";
import { GetServerSideProps, GetServerSidePropsResult, NextPage } from "next";

const NodePage: NextPage<any> = () => {
  return <div />;
};

export default NodePage;

export const getServerSideProps: GetServerSideProps = async context => {
  const { nodeId } = context.params || {};
  let nodeAlias = "";
  if (nodeId) {
    const nodeDoc = await db.collection("nodes").doc(String(nodeId)).get();
    if (nodeDoc.exists) {
      const nodeData: any = nodeDoc.data();
      nodeAlias = generateAlias(String(nodeData?.title));
    }
  }
  return {
    redirect: {
      permanent: true,
      destination: nodeAlias ? `/node/${nodeAlias}/${nodeId}` : `/404`,
    },
  } as GetServerSidePropsResult<any>;
};
