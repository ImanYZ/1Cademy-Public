import { getAuth, User } from "firebase/auth";
import React, { useEffect } from "react";
import { IAssistantEventDetail } from "src/types/IAssistant";

import { getIdToken } from "@/lib/firestoreClient/auth";
import { getAssistantExtensionId } from "@/lib/utils/assistant.utils";

export const Iframe = () => {
  useEffect(() => {
    // following event listener will help use sending id token to 1Cademy Assistant
    const listener = (e: any) => {
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
    };
    window.addEventListener("assistant", listener);

    const auth = getAuth();
    const authUnsubscribe = auth.onAuthStateChanged((user: User | null) => {
      if (user && chrome?.runtime?.sendMessage) {
        chrome.runtime.sendMessage("REQUEST_ID_TOKEN");
      }
    });

    return () => {
      authUnsubscribe();
      window.removeEventListener("assistant", listener);
    };
  }, []);
  return <div></div>;
};

export default Iframe;
