import React, { useEffect } from "react";
import { IAssistantEventDetail } from "src/types/IAssistant";

import { getIdToken } from "@/lib/firestoreClient/auth";
import { getAssistantExtensionId } from "@/lib/utils/assistant.utils";

export const Iframe = () => {
  useEffect(() => {
    // following event listener will help use sending id token to 1Cademy Assistant
    window.addEventListener("assistant", (e: any) => {
      const detail: IAssistantEventDetail = e.detail || {};
      if (detail.type === "REQUEST_ID_TOKEN") {
        (async () => {
          const idToken = await getIdToken();
          chrome.runtime.sendMessage(getAssistantExtensionId(), {
            type: "NOTEBOOK_ID_TOKEN",
            token: idToken,
          });
        })();
      } else if (detail.type === "EXTENSION_ID") {
        localStorage.setItem("ASSISTANT_EXTENSION_ID", detail.extensionId);
      }
    });
  }, []);
  return <div></div>;
};

export default Iframe;
