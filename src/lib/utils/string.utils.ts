export function capitalizeFirstLetter(str: string): string {
  const capitalized = str.charAt(0).toUpperCase() + str.slice(1);
  return capitalized;
}
export const capitalizeString = (str: string): string => {
  return str
    .split(" ")
    .map(cur => capitalizeFirstLetter(cur))
    .join(" ");
};
export const addSuffixToUrlGMT = (url: string, suffix: string) => {
  let urlArr = url.split("GMT");
  return urlArr[0] + "GMT" + suffix + urlArr[1];
};

export const ellipsisString = (text: string, length: number) => {
  return text.length > length ? `${text.slice(0, length)}...` : text;
};

export const getTextSplittedByCharacter = (text: string, character: string): string => {
  return Array.from(text).join(character);
};

export function splitSentenceIntoChunks(sentence: string, maxCharacters = 100): string[] {
  const words: string[] = sentence.split(" ");
  const chunks: string[] = [];
  let currentChunk: string = "";

  for (const word of words) {
    if (currentChunk.length + word.length <= maxCharacters) {
      currentChunk += (currentChunk.length > 0 ? " " : "") + word;
    } else {
      chunks.push(currentChunk);
      currentChunk = word;
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }

  return chunks;
}
