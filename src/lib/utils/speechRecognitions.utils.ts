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

export const isValidABCDOptions = (text: string) => {
  const result = Array.from(text).filter(c => "abcd".includes(c));
  return result.length === text.length;
};
