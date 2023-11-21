import { Box } from "@mui/material";
import React, { useEffect } from "react";
import { useRive, useStateMachineInput } from "rive-react";
const STATE_MACHINE_NAME = "State Machine 1";
const SAD_TRIGGER = "trigger-sad";
const HAPPY_TRIGGER = "trigger-happy";
const DANCE_TRIGGER = "trigger-dance";
const ANGRY_TRIGGER = "trigger-angry";
const NOCKING_1_TRIGGER = "triger-nocking1";
const NOCKING_2_TRIGGER = "trigger-nocking2";
const COMPLAINING_ANGRILY_TRIGGER = "trigger-complaining_angrily";
// const TRIGGER_THINKS = "trigger-thinks";
const TRIGGER_COMPLANING = "trigger-complaning";

// const STATE = "state";

export const Animations = ({ emotion }: { emotion: string }) => {
  const { rive, RiveComponent: RiveComponentTouch } = useRive({
    src: "rive-voice-assistant/assistant-state-machine.riv",
    stateMachines: STATE_MACHINE_NAME,
    artboard: "New Artboard",
    autoplay: true,
  });
  const sadTrigger: any = useStateMachineInput(rive, STATE_MACHINE_NAME, SAD_TRIGGER);
  const happyTrigger = useStateMachineInput(rive, STATE_MACHINE_NAME, HAPPY_TRIGGER);
  const danceTrigger = useStateMachineInput(rive, STATE_MACHINE_NAME, DANCE_TRIGGER);
  const angryTrigger = useStateMachineInput(rive, STATE_MACHINE_NAME, ANGRY_TRIGGER);
  const nocking1Trigger = useStateMachineInput(rive, STATE_MACHINE_NAME, NOCKING_1_TRIGGER);
  const nocking2Trigger = useStateMachineInput(rive, STATE_MACHINE_NAME, NOCKING_2_TRIGGER);
  const complainingAngrilyTrigger = useStateMachineInput(rive, STATE_MACHINE_NAME, COMPLAINING_ANGRILY_TRIGGER);
  //   const stateInput = useStateMachineInput(rive, STATE_MACHINE_NAME, STATE);
  //   const thinkTriger = useStateMachineInput(rive, STATE_MACHINE_NAME, TRIGGER_THINKS);
  const handOverHead = useStateMachineInput(rive, STATE_MACHINE_NAME, TRIGGER_COMPLANING);

  useEffect(() => {
    if (emotion === "sad" && complainingAngrilyTrigger) {
      setInterval(() => {
        complainingAngrilyTrigger.fire();
      }, 1000);
    }
  }, [complainingAngrilyTrigger, emotion]);

  useEffect(() => {
    if (emotion === "unhappy" && angryTrigger) {
      setInterval(() => {
        angryTrigger.fire();
      }, 1000);
    }
  }, [angryTrigger, emotion]);

  useEffect(() => {
    if (emotion === "partying" && danceTrigger) {
      setInterval(() => {
        danceTrigger.fire();
      }, 1000);
    }
  }, [danceTrigger, emotion]);

  useEffect(() => {
    if (emotion === "clapping" && happyTrigger) {
      setInterval(() => {
        happyTrigger.fire();
      }, 1000);
    }
  }, [happyTrigger, emotion]);

  useEffect(() => {
    if (emotion === "Knock Knock" && nocking2Trigger) {
      setInterval(() => {
        nocking2Trigger.fire();
      }, 1000);
    }
  }, [nocking2Trigger, emotion]);

  useEffect(() => {
    if (emotion === "crying" && sadTrigger) {
      setInterval(() => {
        sadTrigger.fire();
      }, 1000);
    }
  }, [sadTrigger, emotion]);

  useEffect(() => {
    if (emotion === "handOverHead" && handOverHead) {
      setInterval(() => {
        handOverHead.fire();
      }, 1000);
    }
  }, [handOverHead, emotion]);

  /* ========= */
  useEffect(() => {
    if (emotion === "wating" && nocking1Trigger) {
      setInterval(() => {
        nocking1Trigger.fire();
      }, 1000);
    }
  }, [nocking1Trigger, emotion]);

  return (
    <Box
      onClick={() => {}}
      sx={{
        width: "80px",
        height: "80px",
        cursor: true ? "pointer" : undefined,
      }}
    >
      <RiveComponentTouch />
    </Box>
  );
};

export default Animations;
