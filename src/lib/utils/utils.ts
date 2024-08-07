import dayjs from "dayjs";
import { Timestamp } from "firebase/firestore";
import { UserNodeFirestore } from "src/nodeBookTypes";
import { URL as ServerSideURL } from "url";

import { ONECADEMY_DOMAIN } from "@/lib/utils/1cademyConfig";
import ROUTES from "@/lib/utils/routes";

import {
  LinkedKnowledgeNode,
  LinkedNodeObject,
  LinkedNodeTag,
  ReferencesArray,
  SortTypeWindowOption,
  TagsArray,
  TimeWindowOption,
} from "../../knowledgeTypes";
import { Post } from "../mapApi";

export const isValidHttpUrl = (possibleUrl?: string) => {
  let url;
  if (!possibleUrl) {
    return false;
  }

  try {
    url = new ServerSideURL(possibleUrl);
  } catch (_) {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "https:";
};

export const isValidHttpUrlOnFrontend = (possibleUrl?: string) => {
  let url;
  if (!possibleUrl) {
    return false;
  }

  try {
    url = new URL(possibleUrl);
  } catch (_) {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "https:";
};

export const escapeBreaksQuotes = (text?: string) => {
  if (!text) {
    return "";
  }
  return text.replace(/(?:\r\n|\r|\n)/g, "<br>").replace(/['"]/g, "");
};

export const encodeTitle = (title?: string) => {
  return encodeURI(escapeBreaksQuotes(title)).replace(/[&\/\?\\]/g, "");
};

export function generateAlias(name?: string) {
  const alias = String(name)
    .toLowerCase()
    .replace(/[^a-z- ]/g, "")
    .trim()
    .replace(/ /g, "-")
    .replace(/[-]+/g, "-")
    .replace(/^-/, "")
    .replace(/-$/, "")
    .split("-")
    .splice(0, 20)
    .join("-");
  if (!alias.length) return "-";
  return alias;
}

export const getQueryParameter = (val: string | string[] | undefined) => {
  if (Array.isArray(val)) {
    return val[0];
  } else {
    return val;
  }
};

export const getQueryParameterAsNumber = (val: string | string[] | undefined): number | undefined => {
  const res = getQueryParameter(val);
  if (res === undefined || Number.isNaN(parseInt(res)) || !Number.isFinite(parseInt(res))) {
    return undefined;
  }

  return parseInt(res);
};

export const getQueryParameterAsBoolean = (val: string | string[] | undefined): boolean => {
  const res = getQueryParameter(val);
  if (res === undefined || val === "false") {
    return false;
  }

  return true;
};

export const SortedByTimeOptions: TimeWindowOption[] = [
  TimeWindowOption.AnyTime,
  TimeWindowOption.ThisWeek,
  TimeWindowOption.ThisMonth,
  TimeWindowOption.ThisYear,
];

export const getNodePageURLTitle = (title: string | undefined, id: string, type?: string) => {
  const resTitleSlug = type === "slug" ? title || "" : generateAlias(title || "");
  if (resTitleSlug.length === 0) {
    return id;
  }
  if (resTitleSlug.length > 100) {
    return resTitleSlug.substring(0, 100);
  }
  return resTitleSlug;
};

export const getNodePageUrl = (title: string, id: string, label: string = "", type?: string) => {
  return label || `/${ROUTES.node}/${getNodePageURLTitle(title, id, type)}/${id}`;
};

export const getNodePageWithDomain = (title: string, id: string, type?: string) => {
  const _ONECADEMY_DOMAIN =
    ONECADEMY_DOMAIN[ONECADEMY_DOMAIN.length - 1] === "/"
      ? ONECADEMY_DOMAIN.substring(0, ONECADEMY_DOMAIN.length - 1)
      : ONECADEMY_DOMAIN;
  let NODE_URL = getNodePageUrl(title, id, type);
  if (NODE_URL[0] === "/") {
    NODE_URL = NODE_URL.substring(1, NODE_URL.length);
  }
  return `${_ONECADEMY_DOMAIN}/${NODE_URL}`;
};

export const homePageSortByDefaults = {
  upvotes: true,
  mostRecent: false,
  timeWindow: SortedByTimeOptions[0],
  perPage: 10,
};

export const getDefaultSortedByType = (filtersSelected: { mostRecent: boolean; upvotes: boolean }) => {
  if (filtersSelected.mostRecent) return SortTypeWindowOption.MOST_RECENT;
  if (filtersSelected.upvotes) return SortTypeWindowOption.UPVOTES_DOWNVOTES;
  return SortTypeWindowOption.NONE;
};

export const buildSortBy = (upvotes: boolean, mostRecent: boolean) => {
  if (upvotes) {
    return "mostHelpful:desc";
  }
  if (mostRecent) {
    return "changedAtMillis:desc";
  }
  return "";
};

export const buildFilterBy = (
  timeWindow: TimeWindowOption,
  tags: string,
  institutions: string,
  contributors: string,
  nodeTypes: string,
  reference: string,
  label: string
) => {
  const filters: string[] = [];
  let updatedAt: number;
  if (timeWindow === TimeWindowOption.ThisWeek) {
    updatedAt = dayjs().subtract(1, "week").valueOf();
  } else if (timeWindow === TimeWindowOption.ThisMonth) {
    updatedAt = dayjs().subtract(1, "month").valueOf();
  } else if (timeWindow === TimeWindowOption.ThisYear) {
    updatedAt = dayjs().subtract(1, "year").valueOf();
  } else {
    updatedAt = dayjs().subtract(10, "year").valueOf();
  }

  filters.push(`changedAtMillis:>${updatedAt}`);

  if (tags.length > 0) filters.push(`tags: [${tags}]`);
  if (institutions.length > 0) filters.push(`institNames: [${institutions}]`);
  if (contributors.length > 0) filters.push(`contributorsNames: [${contributors}]`);
  if (nodeTypes.length > 0) filters.push(`nodeType: [${nodeTypes}]`);
  if (reference) filters.push(`titlesReferences: ${reference}`);
  if (label && label !== "All Sections" && label !== "All Pages") filters.push(`labelsReferences: ${label}`);

  return filters.join("&& ");
};

export function randomIntFromInterval(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export const loadHomeSearchBackground = () => `
<svg width="1200" height="479" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <rect width="1200" height="479" fill="#28282A" />
  <rect id="r" width="1200" height="479" fill="url(#g)" />
</svg>`;

export const toBase64 = (str: string) =>
  typeof window === "undefined" ? Buffer.from(str).toString("base64") : window.btoa(str);

export const getReferenceTitle = (el: LinkedKnowledgeNode) => {
  if (isValidHttpUrl(el.label)) return `${el.title}:  ${el.label}`;
  return el.title || "";
};

export const mapLinkedKnowledgeNodeToReferencesArrays = (nodeReferences: LinkedKnowledgeNode[]): ReferencesArray => {
  return nodeReferences.reduce(
    (acu: ReferencesArray, cur) => {
      return {
        referenceIds: [...acu.referenceIds, cur.node],
        referenceLabels: [...acu.referenceLabels, cur.label || ""],
        references: [...acu.references, cur.title || ""],
      };
    },
    { referenceIds: [], referenceLabels: [], references: [] }
  );
};

export const mapLinkedKnowledgeNodeToLinkedNodeObject = (nodeReferences: LinkedKnowledgeNode[]): LinkedNodeObject[] => {
  return nodeReferences.map(cur => {
    return {
      node: cur.node,
      title: cur.title || "",
      label: cur.label || "",
    };
  });
};

export const mapReferencesNodeToTagsArrays = (nodeReferences: LinkedKnowledgeNode[]): TagsArray => {
  return nodeReferences.reduce(
    (acu: TagsArray, cur) => {
      return {
        tagIds: [...acu.tagIds, cur.node],
        tags: [...acu.tags, cur.title || ""],
      };
    },
    { tagIds: [], tags: [] }
  );
};

export const mapLinkedKnowledgeNodeToLinkedNodeTag = (nodeTags: LinkedKnowledgeNode[]): LinkedNodeTag[] => {
  return nodeTags.map(cur => {
    return {
      node: cur.node,
      title: cur.title || "",
    };
  });
};

export const buildReferences = (references: LinkedKnowledgeNode[]) => {
  const env = process.env.NODE_ENV;
  if (env === "development") {
    return mapLinkedKnowledgeNodeToReferencesArrays(references);
  }
  return { references: mapLinkedKnowledgeNodeToLinkedNodeObject(references) };
};

export const buildTags = (tags: LinkedKnowledgeNode[]) => {
  const env = process.env.NODE_ENV;
  if (env === "development") {
    return mapReferencesNodeToTagsArrays(tags);
  }
  return { tags: mapLinkedKnowledgeNodeToLinkedNodeTag(tags) };
};

export const isEmpty = (val: string) => {
  if (!val) return true;
  if (typeof val === "string" && val.trim() === "") return true;
  return false;
};

export const isEmail = (email: string) => {
  const regEx =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (email.match(regEx)) return true;
  else return false;
};

export const ToUpperCaseEveryWord = (text: string) => {
  return text
    .split(" ")
    .map(cur => cur.charAt(0).toLocaleUpperCase() + cur.slice(1))
    .join(" ");
};

export const validURL = (myURL: string) => {
  const pattern = new RegExp(
    "^(https?:\\/\\/)?" + // protocol
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // ip (v4) address
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + //port
      "(\\?[;&amp;a-z\\d%_.~+=-]*)?" + // query string
      "(\\#[-a-z\\d_]*)?$",
    "i"
  );
  return pattern.test(myURL);
};

export const validPNG = (myURL: string) => {
  const pattern1 = new RegExp(".+\\.png$");
  const pattern2 = new RegExp(".+\\.PNG$");
  return pattern1.test(myURL) || pattern2.test(myURL);
};

export const delay = async (time: number) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};

export const imageLoaded = async (imageUrl: any) => {
  return new Promise(resolve => {
    fetch(imageUrl).then(res => {
      if (res.status === 200) {
        resolve(true);
      } else {
        resolve(imageLoaded(imageUrl));
      }
    });
  });
};

export const findDiff = (str1: String, str2: String) => {
  let diff = "";
  let stringForSplit = str2;
  let stringForDiff = str1;
  if (str1.length > str2.length) {
    stringForSplit = str1;
    stringForDiff = str2;
  }
  stringForSplit.split("").forEach(function (val: any, i: any) {
    if (val != stringForDiff.charAt(i)) diff += val;
  });
  return diff;
};

export const getVideoDataByUrl = (videoUrl: string, startTime?: number, endTime?: number) => {
  let videoId = "";
  let videoType = "";
  let url: string = "";

  if (videoUrl && videoUrl.match(/(youtu\.be|youtube\.com)/)) {
    const results = videoUrl.match(/(youtu\.be\/|youtube\.com\/)(?:watch\?v=)?([^?&\n]+)/);
    if (results) {
      videoId = results[2];
      videoType = "youtube";
      url = `https://www.youtube.com/embed/${videoId}?rel=0${
        typeof startTime !== "undefined" &&
        typeof endTime !== "undefined" &&
        !isNaN(startTime) &&
        !isNaN(endTime) &&
        startTime < endTime
          ? "&start=" + startTime + "&end=" + endTime
          : ""
      }`;
    }
  } /* else if (videoUrl && videoUrl.match(/vimeo\.com/)) {
    const results = videoUrl.match(/(vimeo\.com\/|player\.vimeo\.com\/video\/)([^?&\n]+)/);
    if (results) {
      videoId = results[2];
      videoType = "vimeo";
      url = `https://player.vimeo.com/video/${videoId}`;
    }
  } */

  return {
    url: url,
    video_id: videoId,
    video_type: videoType,
  };
};

export const gtmEvent = (eventName: string, eventData: any): void => {
  const _window: any = typeof window === "undefined" ? {} : window;
  const { dataLayer } = _window;
  if (dataLayer) {
    dataLayer.push({
      ...eventData,
      event: eventName,
    });
  }
};

export const momentDateToSeconds = (moment: any) => {
  return 60 * 60 * moment.hours() + 60 * moment.minutes() + moment.seconds();
};

export const containsHTMLTags = (inputString: string) => {
  const htmlTagsRegex = /<\/?[\w\s="/.'-]+>/;
  return htmlTagsRegex.test(inputString);
};

type GenerateUserNodeInput = {
  nodeId: string;
  uname: string;
  notebookId: string;
  isMock?: boolean;
};
export const generateUserNode = ({
  nodeId,
  uname,
  notebookId,
  isMock = false,
}: GenerateUserNodeInput): UserNodeFirestore => ({
  changed: true,
  correct: false,
  createdAt: Timestamp.fromDate(new Date()),
  updatedAt: Timestamp.fromDate(new Date()),
  deleted: false,
  isStudied: false,
  bookmarked: false,
  node: nodeId,
  user: uname,
  wrong: false,
  notebooks: [notebookId],
  expands: [true],
  ...(isMock && { isMock: true }),
});

export const arraysAreEqual = (arr1: string[], arr2: string[]) => {
  if (arr1.length !== arr2.length) {
    return false;
  }

  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }
  return true;
};

export const sendMessageToChatGPT = async (messages: { role: string; content: string }[]) => {
  const result: any = await Post("/openAI/request", {
    messages,
    model: "gpt-4o",
    response_format: { type: "json_object" },
  });
  if (result?.response) {
    try {
      return JSON.parse(result?.response);
    } catch (err: any) {
      console.error(err.message);
      return [];
    }
  } else {
    return [];
  }
};
