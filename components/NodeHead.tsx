import Head from "next/head";
import { APP_DOMAIN } from "src/1cademyConfig";

import { escapeBreaksQuotes, getNodePageWithDomain } from "../lib/utils";
import { KnowledgeNode } from "../src/knowledgeTypes";

type NodeHeadProps = {
  node: KnowledgeNode;
  keywords: string;
  updatedStr: string;
  createdStr: string;
  canonical?: string;
};

export const NodeHead = ({ node, keywords, updatedStr, createdStr, canonical }: NodeHeadProps) => {
  const {
    id,
    title,
    parents = [],
    references = [],
    content,
    nodeImage,
    nodeType,
    corrects = 0,
    wrongs = 0,
    children = [],
    tags = [],
    changedAt
  } = node;

  const jsonObj: any = {
    "@context": "https://schema.org/",
    "@type": "MediaObject",
    name: "1Cademy - " + escapeBreaksQuotes(title),
    description: escapeBreaksQuotes(
      content + " Keywords: " + title + " " + keywords + (nodeImage ? " \nImage: " + nodeImage : "")
    ),
    "@id": id,
    url: `${getNodePageWithDomain(title || "", id)}`,
    nodeType: nodeType,
    author: {
      "@type": "Organization",
      name: "1Cademy"
    },
    datePublished: createdStr,
    dateModified: updatedStr,
    publisher: {
      "@type": "Organization",
      name: "1Cademy",
      sameAs: APP_DOMAIN,
      logo: {
        "@type": "ImageObject",
        url: `${APP_DOMAIN}_next/static/media/DarkModeLogo.528aaaa6.svg`
      }
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "" + (corrects - wrongs),
      bestRating: "" + (corrects + wrongs),
      worstRating: "" + -(corrects + wrongs),
      ratingCount: "" + (corrects + wrongs)
    }
  };
  if (nodeImage) {
    jsonObj["image"] = nodeImage;
  }
  jsonObj["prerequisites"] = [];
  for (let parent of parents) {
    jsonObj["prerequisites"].push({
      "@type": "parent",
      link: `${getNodePageWithDomain(parent.title || "", parent.node)}`,
      title: "1Cademy - " + escapeBreaksQuotes(parent.title)
    });
  }
  jsonObj["followUps"] = [];
  for (let child of children) {
    jsonObj["followUps"].push({
      "@type": "child",
      link: `${getNodePageWithDomain(child.title || "", child.node)}`,
      title: "1Cademy - " + escapeBreaksQuotes(child.title)
    });
  }
  jsonObj["tags"] = [];
  for (let tag of tags) {
    jsonObj["tags"].push({
      "@type": "tag",
      link: `${getNodePageWithDomain(tag.title || "", tag.node)}`,
      title: "1Cademy - " + escapeBreaksQuotes(tag.title)
    });
  }
  jsonObj["references"] = [];
  for (let reference of references) {
    jsonObj["references"].push({
      "@type": "reference",
      link: `${getNodePageWithDomain(reference.title || "", reference.node)}`,
      title: "1Cademy - " + escapeBreaksQuotes(reference.title),
      label: reference.label
    });
  }

  const summary = escapeBreaksQuotes(`
        ${content} Keywords: ${title} ${keywords} ${nodeImage ? "\nImage: " + nodeImage : ""}
      `);

  return (
    <Head>
      <link rel="canonical" href={canonical ? canonical : (`${getNodePageWithDomain(title || "", id)}`)} key="canonical" />
      <meta name="topic" content={`1Cademy - ${escapeBreaksQuotes(title)}`} />
      <meta name="subject" content={`1Cademy - ${escapeBreaksQuotes(title)}`} />
      <meta name="Classification" content={nodeType} />
      <meta name="keywords" content={keywords} />
      <meta name="date" content={updatedStr} />
      <meta name="revised" content={changedAt} />
      <meta name="summary" content={summary} />
      <meta name="description" content={summary} />
      <meta name="abstract" content={content} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonObj)
        }}
      />
    </Head>
  );
};
