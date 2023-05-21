import { VoiceAssistantType } from "src/nodeBookTypes";

import { CHOICES_GRAMMER, CONFIRMATION_GRAMMER, NEXT_GRAMMER, NOTEBOOK_GRAMMER } from "./constants";

// var SpeechRecognition: any | null = SpeechRecognition || webkitSpeechRecognition;
const _SpeechRecognition =
  typeof webkitSpeechRecognition !== "undefined"
    ? webkitSpeechRecognition
    : typeof SpeechRecognition !== "undefined"
    ? SpeechRecognition
    : null;

export const getGrammerByType = (grammerType: VoiceAssistantType): string | undefined => {
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

export const newRecognition = (grammerType?: VoiceAssistantType) => {
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

export const getValidABCDOptions = (text: string): string | null => {
  const resultSimple = Array.from(text).filter(c => "abcd".includes(c));
  const isCorrect = resultSimple.length === text.length;

  if (isCorrect) return text;

  const resultMapping = Array.from(text)
    .map(forceCharacterToOptions)
    .filter(c => "abcd".includes(c));
  const isCorrectMapping = resultMapping.length === text.length;
  return isCorrectMapping ? resultMapping.join("") : null;
};

const forceCharacterToOptions = (character: string) => {
  if (character === "v") return "b";
  if (character === "s") return "c";
  return character;
};

export const recognizeInput = async (
  listenType: VoiceAssistantType
): Promise<
  | {
      transcript: string;
      error: string;
      nomatch: boolean;
    }
  | undefined
> => {
  const recognition = newRecognition(listenType);
  if (!recognition) return;

  return new Promise(resolve => {
    const recogniseResponse = {
      transcript: "",
      error: "",
      nomatch: false,
    };
    recognition.start();

    recognition.onresult = (event: any) => {
      recogniseResponse.transcript = event.results?.[0]?.[0]?.transcript || "";
    };

    recognition.onerror = (event: any) => {
      recogniseResponse.error = event.error;
    };

    recognition.onnomatch = () => {
      recogniseResponse.nomatch = true;
    };

    recognition.onend = () => {
      resolve(recogniseResponse);
    };
  });
};

export const recognizeInput2 = async (
  recognition: SpeechRecognition
): Promise<{ transcript: string; error: string; nomatch: boolean } | undefined> => {
  // const recognition = newRecognition(listenType);
  // if (!recognition) return;

  return new Promise(resolve => {
    const recogniseResponse = {
      transcript: "",
      error: "",
      nomatch: false,
    };
    recognition.abort();
    recognition.stop();
    // recognition.
    recognition.start();

    recognition.onresult = (event: any) => {
      recogniseResponse.transcript = event.results?.[0]?.[0]?.transcript || "";
    };

    recognition.onerror = (event: any) => {
      recogniseResponse.error = event.error;
    };

    recognition.onnomatch = () => {
      recogniseResponse.nomatch = true;
    };

    recognition.onend = () => {
      resolve(recogniseResponse);
    };
  });
};
