import { QUESTION_OPTIONS } from "./constants";

export const getAnswersLettersOptions = (selectedAnswer: string, optionsNumber: number) => {
  const possibleOptions = QUESTION_OPTIONS.slice(0, optionsNumber);
  const submitOptions: boolean[] = Array.from(possibleOptions).map(cur => Boolean(selectedAnswer.includes(cur)));
  return submitOptions;
};
