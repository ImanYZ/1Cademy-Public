import { Box, Tooltip } from "@mui/material";
import { getFirestore } from "firebase/firestore";
import React, { Dispatch, MutableRefObject, SetStateAction, useEffect, useRef } from "react";

import { getNode } from "../../client/serveless/nodes.serveless";
import { detectElements } from "../../hooks/detectElements";
import { KnowledgeChoice } from "../../knowledgeTypes";
import { getAnswersLettersOptions } from "../../lib/utils/assistant.utils";
import {
  ANSWERING_ERROR,
  ASSISTANT_NEGATIVE_SENTENCES,
  ASSISTANT_POSITIVE_SENTENCES,
  CONFIRM_ERROR,
  NEXT_ACTION_ERROR,
  QUESTION_OPTIONS,
} from "../../lib/utils/constants";
import { getValidABCDOptions, newRecognition } from "../../lib/utils/speechRecognitions.utils";
import { getTextSplittedByCharacter } from "../../lib/utils/string.utils";
import { Node, VoiceAssistant, VoiceAssistantType } from "../../nodeBookTypes";
import { narrateLargeTexts } from "../../utils/helpers";
import { nodeToNarration } from "../../utils/node.utils";
import { RiveComponentMemoized } from "../home/components/temporals/RiveComponentExtended";
import { PracticeToolRef } from "../practiceTool/PracticeTool";

const db = getFirestore();

type AssistantProps = {
  voiceAssistant: VoiceAssistant | null;
  setVoiceAssistant: (value: SetStateAction<VoiceAssistant | null>) => void;
  openNodesOnNotebook: (notebookId: string, nodeIds: string[]) => Promise<void>;
  assistantRef: MutableRefObject<PracticeToolRef | null>;
  setDisplayDashboard: Dispatch<SetStateAction<boolean>>;
  selectedNotebookId: string;
  scrollToNode: (nodeId: string, regardless?: boolean, tries?: number) => void;
  setRootQuery: Dispatch<SetStateAction<string | undefined>>;
  displayDashboard: boolean;
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
  displayDashboard,
}: AssistantProps) => {
  /**
   * Assistant narrate after that listen
   */

  const previousVoiceAssistant = useRef<VoiceAssistant | null>(null);

  // 1. assistant will narrate
  useEffect(() => {
    const narrate = async () => {
      if (previousVoiceAssistant.current && !voiceAssistant) {
        window.speechSynthesis.cancel();
        const message = "Assistant stopped";
        await narrateLargeTexts(message);
      }
      previousVoiceAssistant.current = voiceAssistant;

      if (voiceAssistant?.state !== "NARRATE") return;

      console.log("👉 1. assistant:narrate", { message: voiceAssistant.message });
      if (voiceAssistant.date === "from-error") {
        const message = "Sorry, I cannot detect speech, lets try again.";
        await narrateLargeTexts(message);
        setVoiceAssistant({ ...voiceAssistant, state: "LISTEN", date: "" });
        return;
      }
      await narrateLargeTexts(voiceAssistant.message);
      setVoiceAssistant({ ...voiceAssistant, state: "LISTEN" });
    };
    narrate();
    // prevVoiceAssistant, don't add this on dependencies, this is a ref
  }, [setVoiceAssistant, voiceAssistant]);

  // 2. assistant will listen
  // TODO: create use recognition and if for some readon is not detected answer create other recognition after some seconds to try again
  useEffect(() => {
    const listen = async () => {
      previousVoiceAssistant.current = voiceAssistant;
      if (voiceAssistant?.state !== "LISTEN") return;

      const recognition = newRecognition(voiceAssistant.listenType as VoiceAssistantType);
      if (!recognition) return console.error("This browser does't support speech recognition");

      console.log("👉 2. assistant:listen", { voiceAssistant });

      if (!voiceAssistant.listenType) return;
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
      console.log("assistant:recognition:start");
      recognition.start();
      recognition.onresult = async (event: any) => {
        const transcript: string = event.results?.[0]?.[0]?.transcript || "";
        console.log("----> result", { transcript });

        // ------------------------------------
        // here call directly important commands

        if ("repeat question" === transcript.toLowerCase()) {
          setVoiceAssistant({
            ...voiceAssistant,
            listenType: "ANSWERING",
            selectedAnswer: "",
            state: "NARRATE",
          });
          return;
        }
        if ("stop" === transcript.toLowerCase()) {
          const message = "Assistant stopped";
          await narrateLargeTexts(message);
          setVoiceAssistant(null);
          return;
        }
        // INFO: pause and resume is not possible because will work like
        //       and infinity loop waiting on silence until user tell resume
        //       that need to executed into useEffect so render will be called in every iteration

        // ------------------------------------
        // here process the transcript to correct most possible transcript value
        let possibleTranscript: string | null = null;
        if (voiceAssistant.listenType === "ANSWERING")
          possibleTranscript = getValidABCDOptions(transcript.toLowerCase()); // if is answering and is valid, we use directly

        const transcriptProcessed =
          possibleTranscript ??
          MapSentences[transcript.toLowerCase()] ??
          transcript
            .toLowerCase()
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
          const message = `You have selected ${getTextSplittedByCharacter(transcriptProcessed, "-")}. Is this correct?`;
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
            const submitOptions = getAnswersLettersOptions(
              voiceAssistant.selectedAnswer,
              voiceAssistant.answers.length
            );
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
                  .map(c => c.option)
                  .join(" ")}`
              : "";
            setVoiceAssistant({
              ...voiceAssistant,
              listenType: "NEXT_ACTION",
              message: `${assistantMessageBasedOnResultOfAnswer} ${feedbackForAnswers} ${feedbackToWrongChoice}` ?? "",
              answers: [],
              selectedAnswer: "",
              date: "",
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
              const parent = parents[i];
              const node: Node | null = await getNode(db, parent);
              if (!node) return;

              const message = nodeToNarration(node);
              scrollToNode(parent);
              await narrateLargeTexts(message);
            }
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
          setVoiceAssistant({ ...voiceAssistant, date: new Date().toISOString(), message: "", state: "NARRATE" });
          return;
        }

        if (voiceAssistant.listenType === "NOTEBOOK_ACTIONS") {
          setRootQuery(voiceAssistant.tagId);
          setDisplayDashboard(true);
        }
      };

      recognition.onnomatch = async () => {
        console.log("onnomatch");
        let message = "Sorry, I didn't get your choices.";
        if (voiceAssistant.listenType === "CONFIRM") {
          message += CONFIRM_ERROR;
        }
        if (voiceAssistant.listenType === "ANSWERING") {
          message += ANSWERING_ERROR;
        }
        if (voiceAssistant.listenType === "NEXT_ACTION") {
          message += NEXT_ACTION_ERROR;
        }

        await narrateLargeTexts(message);
        setVoiceAssistant({
          ...voiceAssistant,
          date: new Date().toISOString(),
          message: voiceAssistant.listenType === "NEXT_ACTION" ? "" : voiceAssistant.message,
          state: "NARRATE",
        });
      };

      recognition.onend = async () => {
        console.log("onend");
      };

      recognition.onerror = async function (event: any) {
        console.log("xonerror", event.error);
        setVoiceAssistant({
          ...voiceAssistant,
          date: "from-error",
          message: voiceAssistant.listenType === "NEXT_ACTION" ? "" : voiceAssistant.message,
          state: "NARRATE",
        });
      };
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

  if (!voiceAssistant) return null;

  console.log("render");
  return (
    <Tooltip
      title={displayDashboard ? "" : 'To go back to practice, say "Continue practicing."'}
      placement="top"
      open={true}
    >
      <Box sx={{ width: "80px", height: "80px" }}>
        {voiceAssistant.state === "NARRATE" && (
          <RiveComponentMemoized
            src={TALKING_ANIMATION}
            artboard="New Artboard"
            animations="Timeline 1"
            autoplay={true}
          />
        )}
        {voiceAssistant.state === "LISTEN" && (
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

// const IDLE_ANIMATION = "/rive-voice-assistant/idle.riv";
const LISTENING_ANIMATION = "/rive-voice-assistant/listening.riv";
// const HAPPY_ANIMATION = "/rive-voice-assistant/happy.riv";
// const SAD_ANIMATION = "/rive-voice-assistant/sad.riv";
// const SNORING_ANIMATION = "/rive-voice-assistant/snoring.riv";
const TALKING_ANIMATION = "/rive-voice-assistant/talking.riv";
