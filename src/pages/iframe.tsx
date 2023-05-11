import React, { useEffect } from "react";
import { IAssistantEventDetail } from "src/types/IAssistant";

import { getIdToken } from "@/lib/firestoreClient/auth";

export const Iframe = () => {
  useEffect(() => {
    // following event listener will help use sending id token to 1Cademy Assistant
    window.addEventListener("assistant", (e: any) => {
      const detail: IAssistantEventDetail = e.detail || {};
      if (detail.type === "REQUEST_ID_TOKEN") {
        (async () => {
          const idToken = await getIdToken();
          chrome.runtime.sendMessage(process.env.NEXT_PUBLIC_CHROME_EXTENSION_ID, {
            type: "NOTEBOOK_ID_TOKEN",
            token: idToken,
          });
        })();
      }
    });
  }, []);
  return <div></div>;
};

export default Iframe;
