// var SpeechRecognition: any | null = SpeechRecognition || webkitSpeechRecognition;
const _SpeechRecognition =
  typeof webkitSpeechRecognition !== "undefined"
    ? webkitSpeechRecognition
    : typeof SpeechRecognition !== "undefined"
    ? SpeechRecognition
    : null;

export const newRecognition = () => {
  try {
    if (!_SpeechRecognition) return null;

    const recognition = new _SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
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
