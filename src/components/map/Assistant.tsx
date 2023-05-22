import { Box, Tooltip } from "@mui/material";
import { getFirestore } from "firebase/firestore";
import React, {
  Dispatch,
  MutableRefObject,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { getNode } from "../../client/serveless/nodes.serveless";
import { detectElements } from "../../hooks/detectElements";
import { SimpleQuestionNode } from "../../instructorsTypes";
import { KnowledgeChoice } from "../../knowledgeTypes";
import { getAnswersLettersOptions } from "../../lib/utils/assistant.utils";
import {
  ANSWERING_ERROR,
  ASSISTANT_NEGATIVE_SENTENCES,
  ASSISTANT_POSITIVE_SENTENCES,
  CONFIRM_ERROR,
  NEXT_ACTION_ERROR,
  OPEN_PRACTICE_ERROR,
  QUESTION_OPTIONS,
} from "../../lib/utils/constants";
import { getValidABCDOptions, newRecognition, recognizeInput2 } from "../../lib/utils/speechRecognitions.utils";
import { getTextSplittedByCharacter } from "../../lib/utils/string.utils";
import { Node, VoiceAssistant, VoiceAssistantType } from "../../nodeBookTypes";
import { narrateLargeTexts } from "../../utils/helpers";
import { nodeToNarration } from "../../utils/node.utils";
import { RiveComponentMemoized } from "../home/components/temporals/RiveComponentExtended";
import { PracticeToolRef } from "../practiceTool/PracticeTool";

const db = getFirestore();

type AssistantReaction = "IDLE" | "LISTENING" | "HAPPY" | "SAD" | /* "SNORING" | */ "TALKING";

type SelectedAnswer = { choice: KnowledgeChoice; option: string };
type AssistantProps = {
  voiceAssistant: VoiceAssistant | null;
  setVoiceAssistant: (value: SetStateAction<VoiceAssistant | null>) => void;
  openNodesOnNotebook: (notebookId: string, nodeIds: string[]) => Promise<void>;
  assistantRef: MutableRefObject<PracticeToolRef | null>;
  setDisplayDashboard: Dispatch<SetStateAction<boolean>>;
  selectedNotebookId: string;
  scrollToNode: (nodeId: string, regardless?: boolean, tries?: number) => void;
  setRootQuery: Dispatch<SetStateAction<string | undefined>>;
  displayNotebook: boolean;
  startPractice: boolean;
};

export const Assistant = ({
  setVoiceAssistant,
  voiceAssistant,
  openNodesOnNotebook,
  assistantRef,
  setDisplayDashboard,
  selectedNotebookId,
  scrollToNode,
  setRootQuery,
  displayNotebook,
  startPractice,
}: AssistantProps) => {
  /**
   * Assistant narrate after that listen
   * there is only 1 narrate and 1 listener
   * the narration is a promise and should be aborted when stop assistant
   */

  const previousVoiceAssistant = useRef<VoiceAssistant | null>(voiceAssistant);
  const [assistantState, setAssistantState] = useState<"IDLE" | "LISTEN" | "NARRATE">("IDLE");
  const [forceAssistantReaction, setForceAssistantReaction] = useState<AssistantReaction | "">("");

  const askingRef = useRef<boolean>(false);
  const speechRef = useRef<SpeechRecognition | null>(newRecognition());
  const abortNarratorPromise = useRef<(() => void) | null>(null);
  const originState = useRef("");

  const assistantReactionMemo: AssistantReaction = useMemo(() => {
    if (forceAssistantReaction) return forceAssistantReaction;
    if (assistantState === "LISTEN") return "LISTENING";
    if (assistantState === "NARRATE" && ![CORRECT_ANSWER_REACTION, WRONG_ANSWER_REACTION].includes(originState.current))
      return "TALKING";
    if (assistantState === "NARRATE" && originState.current === CORRECT_ANSWER_REACTION) return "HAPPY";
    if (assistantState === "NARRATE" && originState.current === WRONG_ANSWER_REACTION) return "SAD";
    return "IDLE";
  }, [assistantState, forceAssistantReaction]);

  const getNoMatchPreviousMessage = (listenType: VoiceAssistantType) => {
    let message = "Sorry, I didn't get your choices.";
    if (listenType === "CONFIRM") message += CONFIRM_ERROR;
    if (listenType === "ANSWERING") message += ANSWERING_ERROR;
    if (listenType === "NEXT_ACTION") message += NEXT_ACTION_ERROR;
    if (listenType === "NOTEBOOK_ACTIONS") message += OPEN_PRACTICE_ERROR;
    return message;
  };

  const getTranscriptProcessed = (transcript: string, listenType: VoiceAssistantType) => {
    // here process the transcript to correct most possible transcript value
    let possibleTranscript: string | null = null;
    if (listenType === "ANSWERING") possibleTranscript = getValidABCDOptions(transcript); // if is answering and is valid, we use directly

    const transcriptProcessed =
      possibleTranscript ??
      MapSentences[transcript] ??
      transcript
        .split(" ")
        .map(cur => (cur.length === 1 ? cur : MapWords[cur] ?? ""))
        .filter(cur => cur.length === 1)
        .join("");
    return transcriptProcessed;
  };

  const getMessageFromQuestionNode = (questionNode: SimpleQuestionNode) => {
    const choiceMessage = questionNode.choices
      .map(cur => cur.choice.replace(/^a\./, "ae.").replace(".", ","))
      .join(". ");
    return `${questionNode.title}. ${choiceMessage}`;
  };

  const stopAssistant = useCallback(async (narrateStop: boolean) => {
    console.log("stopAssistant");
    // narrate stop only when assistant is stopped by user (by voice or button)
    window.speechSynthesis.cancel();
    if (abortNarratorPromise.current) {
      console.log("will abort");
      abortNarratorPromise.current();
    }
    if (narrateStop) {
      const { narratorPromise, abortPromise } = narrateLargeTexts("Assistant stopped");
      abortNarratorPromise.current = abortPromise;
      await narratorPromise();
      abortPromise();
    }
    askingRef.current = false;
    setAssistantState("IDLE");
    if (speechRef.current) speechRef.current?.abort();
  }, []);

  const askQuestion = useCallback(
    async ({ questionNode, tagId }: VoiceAssistant) => {
      if (!speechRef.current)
        return console.warn("Speech recognition doesn't exist on this browser, install last version of Chrome browser");

      let message = getMessageFromQuestionNode(questionNode);
      let preMessage = ""; // used add a previous message for example , "sorry I don't understand"
      let preTranscriptProcessed = "";
      let listenType: VoiceAssistantType = "ANSWERING";
      askingRef.current = true;
      originState.current = "narrate-question";
      while (askingRef.current) {
        console.log("👉 1. narrate", { message, preMessage, preTranscriptProcessed, origin, listenType });

        setAssistantState("NARRATE");
        if (listenType === "ANSWERING" && originState.current === "narrate-question") {
          if (!assistantRef.current) return console.log("cant execute operations with assistantRef");

          const { narratorPromise, abortPromise } = narrateLargeTexts(questionNode.title);
          abortNarratorPromise.current = abortPromise;
          const res = await narratorPromise();
          if (!res) break;
          // await narrateLargeTexts( voiceAssistant.questionNode.title);
          let stopNarration = false;
          for (let i = 0; i < questionNode.choices.length; i++) {
            // if (assistantRef.current) return assistantRef.current.onSelectedQuestionAnswer(-1);
            const choice = questionNode.choices[i];
            assistantRef.current.onSelectedQuestionAnswer(i);
            // await narrateLargeTexts(choice.choice);
            const { narratorPromise, abortPromise } = narrateLargeTexts(choice.choice);
            abortNarratorPromise.current = abortPromise;
            const res = await narratorPromise();
            if (!res) {
              stopNarration = true;
              break;
            }
          }

          if (stopNarration) break;
          assistantRef.current.onSelectedQuestionAnswer(-1);
        } else {
          const textToNarrate = `${preMessage} ${message}`;
          const { narratorPromise, abortPromise } = narrateLargeTexts(textToNarrate);
          abortNarratorPromise.current = abortPromise;
          const res = await narratorPromise();
          if (!res) break;
        }
        if (!askingRef.current) break; // should finish without make nothing

        console.log("👉 2. listen", { message, preMessage, preTranscriptProcessed, origin, listenType });

        setAssistantState("LISTEN");
        const recognitionResult = await recognizeInput2(speechRef.current);
        speechRef.current.stop(); // stop after get text

        if (!recognitionResult) {
          console.error(
            "This browser doesn't support speech recognition, install last version of chrome browser please"
          );
          askingRef.current = false;
          continue;
        }

        if (recognitionResult.error) {
          if (recognitionResult.error === "aborted") break;
          console.log("onerror:", recognitionResult.error);
          originState.current = "onerror";
          preMessage = getNoMatchPreviousMessage(listenType);
          message = "";
          console.log("onerror", { origin: originState.current, preMessage, message });
          continue;
        }

        if (recognitionResult.nomatch) {
          console.log("onnomatch");
          originState.current = "nomatch";
          preMessage = getNoMatchPreviousMessage(listenType);
          // message = listenType === "NEXT_ACTION" ? "" : message;
          message = "";
          continue;
        }

        const transcript = recognitionResult.transcript.toLowerCase();
        console.log("----> result", { transcript, listenType });
        // action

        if (transcript === "repeat question") {
          message = getMessageFromQuestionNode(questionNode);
          listenType = "ANSWERING";
          preMessage = "";
          originState.current = "narrate-question";
          continue;
        }

        if (transcript === "stop") {
          setVoiceAssistant(null);
          stopAssistant(true);
          break;
        }

        const transcriptProcessed = getTranscriptProcessed(transcript, listenType);
        console.log("----> transcriptProcessed", { transcriptProcessed });
        if (!transcriptProcessed && listenType !== "CONFIRM") {
          // on CONFIRM, we will manage in different way
          originState.current = "nomatch";
          preMessage = getNoMatchPreviousMessage(listenType);
          message = "";
          continue;
        }

        if (listenType === "ANSWERING") {
          console.log("ANSWERING");
          if (!assistantRef.current) break; // CHECK if we need to stop

          const submitOptions = getAnswersLettersOptions(transcriptProcessed, questionNode.choices.length);
          assistantRef.current.onSelectAnswers(submitOptions);
          const { message: newMessage, answerIsValid } = getMessageFromUserAnswering(
            transcriptProcessed,
            questionNode.choices.length
          );
          preMessage = "";
          preTranscriptProcessed = answerIsValid ? transcriptProcessed : "";
          listenType = answerIsValid ? "CONFIRM" : "ANSWERING";
          message = newMessage;
          console.log("ANSWERING", { answerIsValid, message, listenType });
          continue;
        }

        if (listenType === "CONFIRM") {
          console.log("CONFIRM");
          if (["y"].includes(transcriptProcessed)) {
            const submitOptions = getAnswersLettersOptions(preTranscriptProcessed, questionNode.choices.length);
            assistantRef.current?.onSubmitAnswer(submitOptions);
            const { message: messageFromConfirm, isCorrect } = getMessageFromUserConfirm(
              preTranscriptProcessed,
              questionNode.choices,
              submitOptions
            );
            message = messageFromConfirm;
            preMessage = "";
            listenType = "NEXT_ACTION";
            originState.current = isCorrect ? CORRECT_ANSWER_REACTION : WRONG_ANSWER_REACTION;
            console.log("CONFIRM", { message, submitOptions });
          } else {
            console.log("confirm-error");
            preMessage = ANSWERING_ERROR;
            message = "";
            originState.current = "confirm-error";
            listenType = "ANSWERING";
            console.log("CONFIRM:confirm-error", { message });
          }
          continue;
        }

        if (listenType === "NEXT_ACTION") {
          if (transcriptProcessed === NEXT_ACTION) {
            console.log("NEXT_ACTION:next action");
            assistantRef.current?.nextQuestion();
            askingRef.current = false;
            continue;
          }
          if (transcriptProcessed === OPEN_NOTEBOOK) {
            console.log("NEXT_ACTION:open notebook");
            const parents = questionNode.parents;
            setDisplayDashboard(false);
            openNodesOnNotebook(selectedNotebookId, parents);
            await detectElements({ ids: parents });
            let stopLoop = false;
            for (let i = 0; i < parents.length; i++) {
              setForceAssistantReaction("TALKING");
              const parent = parents[i];
              const node: Node | null = await getNode(db, parent);
              if (!node) continue;

              const message = nodeToNarration(node);
              scrollToNode(parent);
              const { narratorPromise, abortPromise } = narrateLargeTexts(message);
              abortNarratorPromise.current = abortPromise;
              const res = await narratorPromise();
              if (!res) {
                // return
                stopLoop = true;
                break;
              }
              if (!askingRef.current) break; // should finish without make nothing
            }
            if (stopLoop) break;
            setForceAssistantReaction("");
            preMessage = "";
            message = "";
            listenType = "NOTEBOOK_ACTIONS";
            continue;
          }
          console.log("NEXT_ACTION:No action");
          preMessage = `Sorry, I didn't get your choices. ${NEXT_ACTION_ERROR}`;
          message = "";
          originState.current = "next-action-error";
        }

        if (listenType === "NOTEBOOK_ACTIONS") {
          if (transcriptProcessed === OPEN_PRACTICE) {
            console.log("continue practicing", { transcriptProcessed });
            setRootQuery(tagId);
            setDisplayDashboard(true);
            break;
          }
          preMessage = `Sorry, I didn't get your choices. ${OPEN_PRACTICE_ERROR}`;
          message = "";
          listenType = "NOTEBOOK_ACTIONS";
        }
      }
      setAssistantState("IDLE");
    },
    [
      assistantRef,
      openNodesOnNotebook,
      scrollToNode,
      selectedNotebookId,
      setDisplayDashboard,
      setRootQuery,
      setVoiceAssistant,
      stopAssistant,
    ]
  );

  useEffect(() => {
    const run = async () => {
      console.log("askQuestion", { voiceAssistant });
      if (previousVoiceAssistant.current === voiceAssistant) return;

      previousVoiceAssistant.current = voiceAssistant;
      await stopAssistant(!voiceAssistant); // if voiceAssistant change: cancel all
      if (!voiceAssistant) return;

      askQuestion(voiceAssistant);
    };
    run();
  }, [askQuestion, stopAssistant, voiceAssistant]);

  console.log("->", { displayNotebook, voiceAssistant, startPractice, assistantReactionMemo });

  if (!voiceAssistant && !startPractice) return null;
  console.log("->", 1);

  return (
    <Tooltip
      title={
        displayNotebook
          ? 'To go back to practice, say "Continue practicing" or say "Stop" to stop the voice interactions.'
          : ""
      }
      placement="top"
      open={true}
    >
      <Box sx={{ width: "80px", height: "80px" }}>
        {assistantReactionMemo === "TALKING" && (
          <RiveComponentMemoized
            src={TALKING_ANIMATION}
            artboard="New Artboard"
            animations="Timeline 1"
            autoplay={true}
          />
        )}

        {assistantReactionMemo === "HAPPY" && (
          <RiveComponentMemoized
            src={HAPPY_ANIMATION}
            artboard="New Artboard"
            animations="Timeline 1"
            autoplay={true}
          />
        )}

        {assistantReactionMemo === "SAD" && (
          <RiveComponentMemoized src={SAD_ANIMATION} artboard="New Artboard" animations="Timeline 1" autoplay={true} />
        )}

        {assistantReactionMemo === "LISTENING" && (
          <RiveComponentMemoized
            src={LISTENING_ANIMATION}
            artboard="New Artboard"
            animations="Timeline 1"
            autoplay={true}
          />
        )}

        {assistantReactionMemo === "IDLE" && (
          <RiveComponentMemoized src={IDLE_ANIMATION} artboard="New Artboard" animations="Timeline 1" autoplay={true} />
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

const NEXT_ACTION = "*";
const OPEN_NOTEBOOK = ".";
const REPEAT_QUESTION = "?";
const OPEN_PRACTICE = "#";

const CORRECT_ANSWER_REACTION = "correct-answer";
const WRONG_ANSWER_REACTION = "wrong-answer";

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
  the: "d",
  guess: "d",
  he: "e",
  yes: "y",
  yet: "y",
  yep: "y",
  correct: "y",
  "repeat question": REPEAT_QUESTION,
  next: NEXT_ACTION,
  nikes: NEXT_ACTION,
  "open notebook": OPEN_NOTEBOOK,
  "continue practicing": OPEN_PRACTICE,
};

const getMessageFromUserAnswering = (
  transcriptProcessed: string,
  questionsAmount: number
): { answerIsValid: boolean; message: string } => {
  const possibleOptions = QUESTION_OPTIONS.slice(0, questionsAmount);
  console.log({ possibleOptions, transcriptProcessed });
  const answerIsValid = Array.from(transcriptProcessed).reduce(
    (acu, cur) => acu && possibleOptions.includes(cur),
    true
  );

  if (!answerIsValid) return { answerIsValid: false, message: ANSWERING_ERROR };

  const message = `Did you choose option ${getTextSplittedByCharacter(transcriptProcessed, "-")
    .split("-")
    .map(char => (char === "a" ? "ae" : char))
    .join("-")}.`;

  return { answerIsValid: true, message };
};

type CorrectOptionProcessed = { choice: KnowledgeChoice; option: string };

const getMessageFromUserConfirm = (
  selectedAnswer: string,
  choices: KnowledgeChoice[],
  submitOptions: boolean[]
): { message: string; isCorrect: boolean } => {
  const correctOptionsProcessed: CorrectOptionProcessed[] = choices
    .reduce((acu: CorrectOptionProcessed[], cur, idx) => [...acu, { choice: cur, option: QUESTION_OPTIONS[idx] }], [])
    .filter(cur => cur.choice.correct);
  const isCorrect = choices.reduce((acu, cur, idx) => acu && submitOptions[idx] === cur.correct, true);
  const selectedAnswerData: SelectedAnswer[] = choices.reduce((acu: SelectedAnswer[], cur, idx) => {
    const answer: SelectedAnswer | null = selectedAnswer.includes(QUESTION_OPTIONS[idx])
      ? { choice: cur, option: QUESTION_OPTIONS[idx] }
      : null;
    return answer ? [...acu, answer] : acu;
  }, []);

  const feedbackForAnswers = selectedAnswerData
    .map(cur => `You selected option ${cur.option}: ${cur.choice.feedback}`)
    .join(". ");
  const possibleAssistantMessages = isCorrect ? ASSISTANT_POSITIVE_SENTENCES : ASSISTANT_NEGATIVE_SENTENCES;
  const randomMessageIndex = Math.floor(Math.random() * possibleAssistantMessages.length);
  const assistantMessageBasedOnResultOfAnswer = possibleAssistantMessages[randomMessageIndex];

  const feedbackToWrongChoice = !isCorrect
    ? `The correct choice${correctOptionsProcessed.length > 1 ? "s are" : " is"} ${correctOptionsProcessed
        .map(c => `${c.option}: ${c.choice.feedback}`)
        .join(" ")}`
    : "";
  const message = `${assistantMessageBasedOnResultOfAnswer} ${feedbackForAnswers} ${feedbackToWrongChoice}` ?? "";
  return { message, isCorrect };
};
