import { INarrateWorkerMessage } from "src/types/IAssistant";

onmessage = e => {
  const { messages } = e.data as INarrateWorkerMessage;

  const message = messages.shift();
  if (message) {
    postMessage({
      message,
      messages,
    } as INarrateWorkerMessage);
  }
};
