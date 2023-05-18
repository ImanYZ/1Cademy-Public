import { Box, Tooltip } from "@mui/material";
import { getFirestore } from "firebase/firestore";
import React, { Dispatch, MutableRefObject, SetStateAction, useEffect, useMemo, useState } from "react";

import usePrevious from "@/hooks/usePrevious";

import { getNode } from "../../client/serveless/nodes.serveless";
import { detectElements } from "../../hooks/detectElements";
import { KnowledgeChoice } from "../../knowledgeTypes";
import { getAnswersLettersOptions } from "../../lib/utils/assistant.utils";
import {
  ANSWERING_ERROR,
  ASSISTANT_IDLE,
  ASSISTANT_NEGATIVE_SENTENCES,
  ASSISTANT_POSITIVE_SENTENCES,
  CONFIRM_ERROR,
  NEXT_ACTION_ERROR,
  QUESTION_OPTIONS,
} from "../../lib/utils/constants";
import { getValidABCDOptions, recognizeInput } from "../../lib/utils/speechRecognitions.utils";
import { getTextSplittedByCharacter } from "../../lib/utils/string.utils";
import { Node, VoiceAssistant, VoiceAssistantType } from "../../nodeBookTypes";
import { narrateLargeTexts } from "../../utils/helpers";
import { nodeToNarration } from "../../utils/node.utils";
import { RiveComponentMemoized } from "../home/components/temporals/RiveComponentExtended";
import { PracticeToolRef } from "../practiceTool/PracticeTool";

const db = getFirestore();

type AssistantReaction = "IDLE" | "LISTENING" | "HAPPY" | "SAD" | /* "SNORING" | */ "TALKING";

type AssistantProps = {
  voiceAssistant: VoiceAssistant;
  setVoiceAssistant: (value: SetStateAction<VoiceAssistant>) => void;
  openNodesOnNotebook: (notebookId: string, nodeIds: string[]) => Promise<void>;
  assistantRef: MutableRefObject<PracticeToolRef | null>;
  setDisplayDashboard: Dispatch<SetStateAction<boolean>>;
  selectedNotebookId: string;
  scrollToNode: (nodeId: string, regardless?: boolean, tries?: number) => void;
  setRootQuery: Dispatch<SetStateAction<string | undefined>>;
  displayNotebook: boolean;
  enabledAssistantRef: {
    current: boolean;
  };
};

export const Assistant = ({
  voiceAssistant,
  setVoiceAssistant,
  openNodesOnNotebook,
  assistantRef,
  setDisplayDashboard,
  selectedNotebookId,
  scrollToNode,
  setRootQuery,
  displayNotebook,
  enabledAssistantRef,
}: AssistantProps) => {
  /**
   * Assistant narrate after that listen
   */

  const previousVoiceAssistant = usePrevious(voiceAssistant);
  const [forceAssistantReaction, setForceAssistantReaction] = useState<AssistantReaction | "">("");

  const assistantReaction: AssistantReaction = useMemo(() => {
    if (forceAssistantReaction) return forceAssistantReaction;
    if (voiceAssistant.state === "LISTEN") return "LISTENING";
    if (
      voiceAssistant.state === "NARRATE" &&
      ![CORRECT_ANSWER_REACTION, WRONG_ANSWER_REACTION].includes(voiceAssistant.date)
    )
      return "TALKING";
    if (voiceAssistant.state === "NARRATE" && voiceAssistant.date === CORRECT_ANSWER_REACTION) return "HAPPY";
    if (voiceAssistant.state === "NARRATE" && voiceAssistant.date === WRONG_ANSWER_REACTION) return "SAD";
    return "IDLE";
  }, [forceAssistantReaction, voiceAssistant.date, voiceAssistant.state]);

  // 0. assistant idle, assistant doesn't nothing

  // 1. assistant will narrate
  useEffect(() => {
    const narrate = async () => {
      if (previousVoiceAssistant?.state !== "IDLE" && voiceAssistant?.state === "IDLE" && voiceAssistant) {
        window.speechSynthesis.cancel();
        const message = "Assistant stopped";
        await narrateLargeTexts(message);
      }

      if (voiceAssistant?.state !== "NARRATE") return;

      console.log("👉 1. assistant:narrate", { message: voiceAssistant.message });

      if (voiceAssistant.date === "from-error") {
        const message = "Sorry, I cannot detect speech, lets try again.";
        await narrateLargeTexts(message);
        if (!enabledAssistantRef.current) return;
        setVoiceAssistant({ ...voiceAssistant, state: "LISTEN", date: "" });
        return;
      }
      console.log("Confirmation Started");
      await narrateLargeTexts(voiceAssistant.message);
      console.log("Confirmation Problem");
      if (!enabledAssistantRef.current) return;
      setVoiceAssistant({ ...voiceAssistant, state: "LISTEN" });
    };
    narrate();
    // prevVoiceAssistant, don't add this on dependencies, this is a ref
  }, [setVoiceAssistant, voiceAssistant]);

  // 2. assistant will listen
  // TODO: create use recognition and if for some readon is not detected answer create other recognition after some seconds to try again
  useEffect(() => {
    const listen = async () => {
      if (voiceAssistant?.state !== "LISTEN") return;

      console.log("👉 2. assistant:listen", { voiceAssistant });
      const recognitionResult = await recognizeInput(voiceAssistant.listenType as VoiceAssistantType);
      if (!recognitionResult) {
        console.error("This browser doesn't support speech recognition, install last version of chrome browser please");
        return;
      }

      if (recognitionResult.error) {
        console.log("onerror", recognitionResult.error);
        if (!enabledAssistantRef.current) return;
        setVoiceAssistant({
          ...voiceAssistant,
          date: "from-error",
          message: voiceAssistant.listenType === "NEXT_ACTION" ? "" : voiceAssistant.message,
          state: "NARRATE",
        });
        return;
      }

      if (recognitionResult.nomatch) {
        console.log("onnomatch");
        let message = "Sorry, I didn't get your choices.";
        if (voiceAssistant.listenType === "CONFIRM") message += CONFIRM_ERROR;
        if (voiceAssistant.listenType === "ANSWERING") message += ANSWERING_ERROR;
        if (voiceAssistant.listenType === "NEXT_ACTION") message += NEXT_ACTION_ERROR;

        await narrateLargeTexts(message);
        if (!enabledAssistantRef.current) return;
        setVoiceAssistant({
          ...voiceAssistant,
          date: new Date().toISOString(),
          message: voiceAssistant.listenType === "NEXT_ACTION" ? "" : voiceAssistant.message,
          state: "NARRATE",
        });
        return;
      }

      const transcript = recognitionResult.transcript.toLowerCase();
      console.log("----> result", { transcript });

      // ------------------------------------
      // here call directly important commands

      if ("repeat question" === transcript) {
        if (!enabledAssistantRef.current) return;
        setVoiceAssistant({
          ...voiceAssistant,
          listenType: "ANSWERING",
          selectedAnswer: "",
          state: "NARRATE",
        });
        return;
      }
      if ("stop" === transcript) {
        const message = "Assistant stopped";
        await narrateLargeTexts(message);
        enabledAssistantRef.current = false;
        setVoiceAssistant(ASSISTANT_IDLE);
        return;
      }
      // INFO: pause and resume is not possible because will work like
      //       and infinity loop waiting on silence until user tell resume
      //       that need to executed into useEffect so render will be called in every iteration

      // ------------------------------------
      // here process the transcript to correct most possible transcript value
      let possibleTranscript: string | null = null;
      if (voiceAssistant.listenType === "ANSWERING") possibleTranscript = getValidABCDOptions(transcript); // if is answering and is valid, we use directly

      const transcriptProcessed =
        possibleTranscript ??
        MapSentences[transcript] ??
        transcript
          .split(" ")
          .map(cur => (cur.length === 1 ? cur : MapWords[cur] ?? ""))
          .filter(cur => cur.length === 1)
          .join("");
      console.log("--->", { transcriptProcessed });

      // no valid answers will ask again the same question
      if (!transcriptProcessed && voiceAssistant.listenType !== "CONFIRM") {
        console.log("No transcription", voiceAssistant.listenType);
        let message = "Sorry, I didn't get your choices.";
        if (voiceAssistant.listenType === "ANSWERING") message += ANSWERING_ERROR;
        if (voiceAssistant.listenType === "NEXT_ACTION") message += NEXT_ACTION_ERROR;

        await narrateLargeTexts(message);
        if (!enabledAssistantRef.current) return;
        setVoiceAssistant({ ...voiceAssistant, date: "from-empty transcript", message, state: "NARRATE" });
        return;
      }

      // actions according the flow
      if (voiceAssistant.listenType === "ANSWERING") {
        if (!assistantRef.current) return;
        // transcriptProcessed:"bc"
        // possibleOptions: "abcd"
        const possibleOptions = QUESTION_OPTIONS.slice(0, voiceAssistant.answers.length);
        const answerIsValid = Array.from(transcriptProcessed).reduce(
          (acu, cur) => acu && possibleOptions.includes(cur),
          true
        );
        console.log("assistantActions:ANSWERING", { possibleOptions, transcriptProcessed, answerIsValid });
        if (!answerIsValid) {
          const message = ANSWERING_ERROR;
          setVoiceAssistant({
            ...voiceAssistant,
            listenType: "ANSWERING",
            message,
            selectedAnswer: "",
            state: "NARRATE",
          });
          return;
        }

        // const message =`You have selected a, b and c. Is this correct?`

        const submitOptions = getAnswersLettersOptions(transcriptProcessed, voiceAssistant.answers.length);
        assistantRef.current.onSelectAnswers(submitOptions);
        const message = `Did you choose option ${getTextSplittedByCharacter(transcriptProcessed, "-")
          .split("-")
          .map(char => (char === "a" ? "ae" : char))
          .join("-")}.`;
        if (!enabledAssistantRef.current) return;
        setVoiceAssistant({
          ...voiceAssistant,
          listenType: "CONFIRM",
          message,
          selectedAnswer: transcriptProcessed,
          state: "NARRATE",
        });
        return;
      }
      if (voiceAssistant.listenType === "CONFIRM") {
        console.log("assistantActions:CONFIRM");
        if (["y"].includes(transcriptProcessed)) {
          const submitOptions = getAnswersLettersOptions(voiceAssistant.selectedAnswer, voiceAssistant.answers.length);
          const correctOptionsProcessed: { choice: KnowledgeChoice; option: string }[] = voiceAssistant.answers
            .reduce(
              (acu: { choice: KnowledgeChoice; option: string }[], cur, idx) => [
                ...acu,
                { choice: cur, option: QUESTION_OPTIONS[idx] },
              ],
              []
            )
            .filter(cur => cur.choice.correct);

          const isCorrect = voiceAssistant.answers.reduce(
            (acu, cur, idx) => acu && submitOptions[idx] === cur.correct,
            true
          );
          const selectedAnswer: { choice: KnowledgeChoice; option: string }[] = voiceAssistant.answers.reduce(
            (acu: { choice: KnowledgeChoice; option: string }[], cur, idx) => {
              const answer = voiceAssistant.selectedAnswer.includes(QUESTION_OPTIONS[idx])
                ? { choice: cur, option: QUESTION_OPTIONS[idx] }
                : null;
              return answer ? [...acu, answer] : acu;
            },
            []
          );
          console.log({ selectedAnswer });
          const feedbackForAnswers = selectedAnswer
            .map(cur => `You selected option ${cur.option}: ${cur.choice.feedback}`)
            .join(". ");
          const possibleAssistantMessages = isCorrect ? ASSISTANT_POSITIVE_SENTENCES : ASSISTANT_NEGATIVE_SENTENCES;
          const randomMessageIndex = Math.floor(Math.random() * possibleAssistantMessages.length);
          const assistantMessageBasedOnResultOfAnswer = possibleAssistantMessages[randomMessageIndex];
          assistantRef.current?.onSubmitAnswer(submitOptions);

          const feedbackToWrongChoice = !isCorrect
            ? `The correct choice${correctOptionsProcessed.length > 1 ? "s are" : " is"} ${correctOptionsProcessed
                .map(c => `${c.option}: ${c.choice.feedback}`)
                .join(" ")}`
            : "";
          setVoiceAssistant({
            ...voiceAssistant,
            listenType: "NEXT_ACTION",
            message: `${assistantMessageBasedOnResultOfAnswer} ${feedbackForAnswers} ${feedbackToWrongChoice}` ?? "",
            answers: [],
            selectedAnswer: "",
            date: isCorrect ? CORRECT_ANSWER_REACTION : WRONG_ANSWER_REACTION,
            state: "NARRATE",
          });
        } else {
          const message = ANSWERING_ERROR;
          setVoiceAssistant({
            ...voiceAssistant,
            listenType: "ANSWERING",
            message,
            state: "NARRATE",
          });
        }
        return;
      }

      if (voiceAssistant.listenType === "NEXT_ACTION") {
        console.log("assistantActions:NEXT_ACTION");
        if (transcriptProcessed === NEXT_ACTION) {
          if (!assistantRef.current) return;
          assistantRef.current.nextQuestion();
          return;
        }
        if (transcriptProcessed === OPEN_NOTEBOOK) {
          if (!assistantRef.current) return;
          console.log("ACTION:Open Notebook");
          const parents = assistantRef.current.getQuestionParents();
          setDisplayDashboard(false);
          openNodesOnNotebook(selectedNotebookId, parents);
          await detectElements({ ids: parents });
          for (let i = 0; i < parents.length; i++) {
            setForceAssistantReaction("TALKING");
            const parent = parents[i];
            const node: Node | null = await getNode(db, parent);
            if (!node) return;

            const message = nodeToNarration(node);
            scrollToNode(parent);
            await narrateLargeTexts(message);
          }
          setForceAssistantReaction("");
          // TODO: wait for next action
          console.log("execute NOTEBOOK_ACTIONS ");
          setVoiceAssistant({
            ...voiceAssistant,
            answers: [],
            date: "",
            listenType: "NOTEBOOK_ACTIONS",
            message: "",
            selectedAnswer: "",
            state: "NARRATE",
          });
          return;
        }
        // No valid action was selected, try again
        let message = `Sorry, I didn't get your choices. ${NEXT_ACTION_ERROR}`;
        await narrateLargeTexts(message);
        console.log("NEXT_ACTION");
        if (!enabledAssistantRef.current) return;
        setVoiceAssistant({ ...voiceAssistant, date: new Date().toISOString(), message: "", state: "NARRATE" });
        return;
      }

      if (voiceAssistant.listenType === "NOTEBOOK_ACTIONS") {
        setRootQuery(voiceAssistant.tagId);
        setDisplayDashboard(true);
      }
    };

    listen();
  }, [
    assistantRef,
    openNodesOnNotebook,
    scrollToNode,
    selectedNotebookId,
    setDisplayDashboard,
    setRootQuery,
    setVoiceAssistant,
    voiceAssistant,
  ]);

  console.log("render");

  if (displayNotebook && voiceAssistant.state === "IDLE") return null;
  if (voiceAssistant.state === "IDLE")
    return (
      <Box sx={{ width: "80px", height: "80px" }}>
        {<RiveComponentMemoized src={IDLE_ANIMATION} artboard="New Artboard" animations="Timeline 1" autoplay={true} />}
      </Box>
    );

  return (
    <Tooltip
      title={displayNotebook ? 'To go back to practice, say "Continue practicing."' : ""}
      placement="top"
      open={true}
    >
      <Box sx={{ width: "80px", height: "80px" }}>
        {assistantReaction === "TALKING" && (
          <RiveComponentMemoized
            src={TALKING_ANIMATION}
            artboard="New Artboard"
            animations="Timeline 1"
            autoplay={true}
          />
        )}

        {assistantReaction === "HAPPY" && (
          <RiveComponentMemoized
            src={HAPPY_ANIMATION}
            artboard="New Artboard"
            animations="Timeline 1"
            autoplay={true}
          />
        )}

        {assistantReaction === "SAD" && (
          <RiveComponentMemoized src={SAD_ANIMATION} artboard="New Artboard" animations="Timeline 1" autoplay={true} />
        )}

        {assistantReaction === "LISTENING" && (
          <RiveComponentMemoized
            src={LISTENING_ANIMATION}
            artboard="New Artboard"
            animations="Timeline 1"
            autoplay={true}
          />
        )}
      </Box>
    </Tooltip>
  );
};

const IDLE_ANIMATION = "/rive-voice-assistant/idle.riv";
const LISTENING_ANIMATION = "/rive-voice-assistant/listening.riv";
const HAPPY_ANIMATION = "/rive-voice-assistant/happy.riv";
const SAD_ANIMATION = "/rive-voice-assistant/sad.riv";
// const SNORING_ANIMATION = "/rive-voice-assistant/snoring.riv";
const TALKING_ANIMATION = "/rive-voice-assistant/talking.riv";

const CORRECT_ANSWER_REACTION = "correct-answer";
const WRONG_ANSWER_REACTION = "wrong-answer";

const NEXT_ACTION = "*";
const OPEN_NOTEBOOK = ".";
const REPEAT_QUESTION = "?";
const OPEN_PRACTICE = "#";

const MapSentences: { [key: string]: string } = {
  "repeat question": REPEAT_QUESTION,
  "open notebook": OPEN_NOTEBOOK,
  "continue practicing": OPEN_PRACTICE,
  "yes yes": "y",
  "correct correct": "y",
};
const MapWords: { [key: string]: string } = {
  hey: "a",
  be: "b",
  ve: "b",
  me: "b",
  ce: "c",
  see: "c",
  se: "c",
  de: "d",
  dee: "d",
  guess: "d",
  he: "e",
  yes: "y",
  correct: "y",
  "repeat question": REPEAT_QUESTION,
  next: NEXT_ACTION,
  nikes: NEXT_ACTION,
  "open notebook": OPEN_NOTEBOOK,
  "continue practicing": OPEN_PRACTICE,
};
