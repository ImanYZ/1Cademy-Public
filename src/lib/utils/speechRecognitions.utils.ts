import { TVoiceAssistantListenType } from "src/nodeBookTypes";

import { CHOICES_GRAMMER, CONFIRMATION_GRAMMER, NEXT_GRAMMER, NOTEBOOK_GRAMMER } from "./constants";

// var SpeechRecognition: any | null = SpeechRecognition || webkitSpeechRecognition;
const _SpeechRecognition =
  typeof webkitSpeechRecognition !== "undefined"
    ? webkitSpeechRecognition
    : typeof SpeechRecognition !== "undefined"
    ? SpeechRecognition
    : null;

export const getGrammerByType = (grammerType: TVoiceAssistantListenType): string | undefined => {
  if (grammerType === "ANSWERING") {
    return CHOICES_GRAMMER;
  } else if (grammerType === "NEXT_ACTION") {
    return NEXT_GRAMMER;
  } else if (grammerType === "CONFIRM") {
    return CONFIRMATION_GRAMMER;
  } else if (grammerType === "NOTEBOOK_ACTIONS") {
    return NOTEBOOK_GRAMMER;
  }
};

export const newRecognition = (grammerType?: TVoiceAssistantListenType) => {
  try {
    if (!_SpeechRecognition) return null;

    const recognition = new _SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    if (grammerType && webkitSpeechGrammarList) {
      const grammer = getGrammerByType(grammerType);
      if (grammer) {
        const speechRecognitionList = new webkitSpeechGrammarList();
        speechRecognitionList.addFromString(grammer, 1);
        recognition.grammars = speechRecognitionList;
      }
    }

    return recognition;
  } catch (error) {
    return null;
  }
};
