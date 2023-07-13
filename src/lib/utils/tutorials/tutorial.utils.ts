import { TutorialStep } from "../../../nodeBookTypes";

export const getStepsValues = (step: number, max: number) => {
  // steps = [1,...max]
  return {
    currentStepName: step,
    nextStepName: step === max ? 0 : step + 1,
    previousStepName: step === 1 ? 1 : step - 1,
  };
};

export const getBaseStepConfig = (step: number, max: number): TutorialStep => {
  // DON'T CHANGE THIS, THIS WILL OVERRIDE ALL STEPS 🚨

  return {
    // targetId: "",
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
};

export const getTutorialTargetIdFromCurrentStep = (
  currentStep: TutorialStep | null,
  dynamicTargetId: string | null
) => {
  if (!currentStep) return undefined;
  // if (currentStep?.anchor) {
  if (!currentStep?.childTargetId) return undefined;
  return dynamicTargetId ? `${dynamicTargetId}-${currentStep.childTargetId}` : currentStep.childTargetId;
  // }
  //  // if (currentStep?.targetId) return `${currentStep.targetId}-${currentStep?.childTargetId}`;
  // if (dynamicTargetId) return `${dynamicTargetId}-${currentStep?.childTargetId}`;
  // if (!dynamicTargetId) return undefined;
  // return currentStep?.childTargetId ? `${dynamicTargetId}-${currentStep?.childTargetId}` : dynamicTargetId;
};

export const removeStyleFromTarget = (targetId: string) => {
  if (!targetId) return;
  const element = document.getElementById(targetId);
  if (element) {
    element.classList.remove("tutorial-target");
    element.classList.remove("tutorial-target-shallow");
    element.classList.remove("tutorial-target-outside");
    element.classList.remove("tutorial-target-inside");
    element.classList.remove("tutorial-target-pulse");
  }
};
