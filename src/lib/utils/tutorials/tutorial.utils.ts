import { NodeTutorialState } from "../../../nodeBookTypes";

export const getStepsValues = (step: number, max: number) => {
  // steps = [1,...max]
  return {
    currentStepName: step,
    nextStepName: step === max ? 0 : step + 1,
    previosStepName: step === 1 ? 1 : step - 1,
  };
};

export const getBaseStepConfig = (step: number, max: number) => {
  // DON'T CHANGE THIS, THIS WILL OVERRIDE ALL STEPS 🚨

  const tt: NodeTutorialState = {
    localSnapshot: [],
    targetId: "",
    title: "",
    description: null,
    // Description can be added in markdown in this way
    // <MarkdownRender text={"This node defines a node in\n\n\n```js\nconsole.log('sd')\n```\n1Cademy!"} />
    disabledElements: [],
    enableChildElements: [],
    anchor: "",
    ...getStepsValues(step, max),
    tooltipPosition: "top",
    // stepLenght: STEPS_LENGHT,
    isClickeable: false,
    targetDefaultProperties: undefined,
  };

  return tt;
};
