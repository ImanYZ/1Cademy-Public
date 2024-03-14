export const tokenizeAndCount = (text: string): Record<string, number> => {
  const wordCounts: Record<string, number> = {};
  const words = text.toLowerCase().match(/\b(\w+)\b/g);
  if (words) {
    words.forEach(word => {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    });
  }
  return wordCounts;
};

export const calculateCosineSimilarity = (vec1: object, vec2: object): number => {
  const intersection = Object.keys(vec1).filter(value => Object.keys(vec2).includes(value));

  const dotProduct = intersection.reduce(
    (sum, key) => sum + vec1[key as keyof typeof vec1] * vec2[key as keyof typeof vec2],
    0
  );

  const magnitude1 = Math.sqrt(Object.values(vec1).reduce((sum, val) => sum + val * val, 0));
  const magnitude2 = Math.sqrt(Object.values(vec2).reduce((sum, val) => sum + val * val, 0));

  if (magnitude1 && magnitude2) {
    return dotProduct / (magnitude1 * magnitude2);
  } else {
    return 0;
  }
};
