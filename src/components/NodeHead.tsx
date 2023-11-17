import Head from "next/head";
import { useEffect, useState } from "react";

import { APP_DOMAIN } from "@/lib/utils/1cademyConfig";
import { escapeBreaksQuotes, getNodePageWithDomain } from "@/lib/utils/utils";

import { KnowledgeNode } from "../knowledgeTypes";

type NodeHeadProps = {
  node: KnowledgeNode;
  keywords: string;
  updatedStr: string;
  createdStr: string;
};

export const NodeHead = ({ node, keywords, updatedStr, createdStr }: NodeHeadProps) => {
  const {
    id,
    title,
    nodeSlug,
    nodeSlugs,
    parents = [],
    references = [],
    content,
    nodeImage,
    nodeType,
    corrects = 0,
    wrongs = 0,
    children = [],
    tags = [],
    changedAt,
  } = node;

  const jsonObj: any = {
    "@context": "https://schema.org/",
    "@type": "MediaObject",
    name: "1Cademy - " + escapeBreaksQuotes(title),
    description: escapeBreaksQuotes(
      content + " Keywords: " + title + " " + keywords + (nodeImage ? " \nImage: " + nodeImage : "")
    ),
    "@id": id,
    url: `${getNodePageWithDomain(nodeSlug || "", id, "slug")}`,
    nodeType: nodeType,
    author: {
      "@type": "Organization",
      name: "1Cademy",
    },
    datePublished: createdStr,
    dateModified: updatedStr,
    publisher: {
      "@type": "Organization",
      name: "1Cademy",
      sameAs: APP_DOMAIN,
      logo: {
        "@type": "ImageObject",
        url: `${APP_DOMAIN}_next/static/media/DarkModeLogo.528aaaa6.svg`,
      },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "" + (corrects - wrongs),
      bestRating: "" + (corrects + wrongs),
      worstRating: "" + -(corrects + wrongs),
      ratingCount: "" + (corrects + wrongs),
    },
  };
  if (nodeImage) {
    jsonObj["image"] = nodeImage;
  }
  jsonObj["prerequisites"] = [];
  for (let parent of parents) {
    jsonObj["prerequisites"].push({
      "@type": "parent",
      link: `${getNodePageWithDomain(parent.nodeSlug || "", parent.node, "slug")}`,
      title: "1Cademy - " + escapeBreaksQuotes(parent.title),
    });
  }
  jsonObj["followUps"] = [];
  for (let child of children) {
    jsonObj["followUps"].push({
      "@type": "child",
      link: `${getNodePageWithDomain(child.nodeSlug || "", child.node, "slug")}`,
      title: "1Cademy - " + escapeBreaksQuotes(child.title),
    });
  }
  jsonObj["tags"] = [];
  for (let tag of tags) {
    jsonObj["tags"].push({
      "@type": "tag",
      link: `${getNodePageWithDomain(tag.nodeSlug || "", tag.node, "slug")}`,
      title: "1Cademy - " + escapeBreaksQuotes(tag.title),
    });
  }
  jsonObj["references"] = [];
  for (let reference of references) {
    jsonObj["references"].push({
      "@type": "reference",
      link: `${getNodePageWithDomain(reference.nodeSlug || "", reference.node, "slug")}`,
      title: "1Cademy - " + escapeBreaksQuotes(reference.title),
      label: reference.label,
    });
  }

  const summary = escapeBreaksQuotes(`
        ${content} Keywords: ${title} ${keywords} ${nodeImage ? "\nImage: " + nodeImage : ""}
      `);

  const [currentUrl, setCurrentUrl] = useState<string>("");
  useEffect(() => {
    if (typeof window === "undefined") return;
    setCurrentUrl(window.location.href);
  }, [setCurrentUrl]);

  const nodeUrl = getNodePageWithDomain(nodeSlug || "", id, "slug");
  const hasAltCanonical = currentUrl && nodeUrl !== currentUrl;
  return (
    <Head>
      {nodeSlugs && nodeSlugs.length > 0 ? (
        nodeSlugs.map((slug: string) => {
          const nodeUrl = getNodePageWithDomain(slug || "", id, "slug");
          return <link rel="canonical" href={`${nodeUrl}`} key="canonical" />;
        })
      ) : (
        <link rel="canonical" href={`${nodeUrl}`} key="canonical" />
      )}

      {hasAltCanonical ? <link rel="canonical" href={`${currentUrl}`} key="canonical-alt" /> : <></>}
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
          __html: JSON.stringify(jsonObj),
        }}
      />
    </Head>
  );
};
