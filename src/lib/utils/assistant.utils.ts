import { NUMBER_POSSIBLE_OPTIONS } from "./constants";

export const getAnswersLettersOptions = (selectedAnswer: string, optionsNumber: number) => {
  const selectedAnswers = selectedAnswer.split(" ");
  const possibleOptions = Object.keys(NUMBER_POSSIBLE_OPTIONS).slice(0, optionsNumber);
  const submitOptions: boolean[] = Array.from(possibleOptions).map(cur => Boolean(selectedAnswers.includes(cur)));
  return submitOptions;
};

export const getAssistantExtensionId = () => {
  return localStorage.getItem("ASSISTANT_EXTENSION_ID") || process.env.NEXT_PUBLIC_CHROME_EXTENSION_ID;
};
