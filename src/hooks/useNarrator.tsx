import { useEffect, useState } from "react";

import { narrateText } from "../utils/helpers";

/**
 * this is a queue narrator, we can sent a sentence array and replace previous
 * we are detecting the index of sentence narrated and if is narrating
 */
export const useNarrator = () => {
  const [sentenceIndex, setSentenceIndex] = useState(-1);
  const [sentencesQueue, setSentencesQueue] = useState<string[]>([]);
  const [isWorking, setIsWorking] = useState(false);

  const addNewSentencesToBeNarrated = (sentences: string[]) => {
    setSentencesQueue(sentences);
    setSentenceIndex(-1);
  };

  useEffect(() => {
    if (sentenceIndex === sentencesQueue.length) return;

    const narrateNextSentences = async () => {
      if (isWorking) return;

      setIsWorking(true);
      const sentence = sentencesQueue[sentenceIndex];
      await narrateText(sentence);
      setIsWorking(false);
      setSentenceIndex(prev => prev + 1);
    };

    narrateNextSentences();
  }, [isWorking, sentenceIndex, sentencesQueue]);

  return { addNewSentencesToBeNarrated, sentenceIndex, isWorking };
};
