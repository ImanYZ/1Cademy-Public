import { TutorialStep } from "../../../nodeBookTypes";

export const getStepsValues = (step: number, max: number) => {
  // steps = [1,...max]
  return {
    currentStepName: step,
    nextStepName: step === max ? 0 : step + 1,
    previousStepName: step === 1 ? 1 : step - 1,
  };
};

export const getBaseStepConfig = (step: number, max: number) => {
  // DON'T CHANGE THIS, THIS WILL OVERRIDE ALL STEPS 🚨

  const tt: TutorialStep = {
    targetId: "",
    title: "",
    description: null,
    anchor: "",
    ...getStepsValues(step, max),
    tooltipSize: "md",
    tooltipPosition: "top",
    isClickable: false,
    outline: "shallow",
    leftOffset: 0,
    topOffset: 0,
  };

  return tt;
};
