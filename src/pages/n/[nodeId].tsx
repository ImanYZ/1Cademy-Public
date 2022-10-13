import { GetServerSideProps, GetServerSidePropsResult, NextPage } from "next";
import { INode } from "src/types/INode";

import { db } from "@/lib/firestoreServer/admin";
import { generateAlias } from "@/lib/utils/utils";

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
      const nodeData: INode = nodeDoc.data() as INode;
      nodeAlias = generateAlias(nodeData.title);
    }
  }
  return {
    redirect: {
      permanent: true,
      destination: nodeAlias ? `/node/${nodeAlias}/${nodeId}` : `/404`,
    },
  } as GetServerSidePropsResult<any>;
};
