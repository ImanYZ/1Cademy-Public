import { splitSentenceIntoChunks } from "./string.utils";

export const getChunkSentences = (text: string, maxCharacters = 99) => {
  return text
    .split(".")
    .reduce((a: string[], c) => (c.length <= maxCharacters ? [...a, c] : [...a, ...splitSentenceIntoChunks(c)]), []);
};
