import { getAuth, User } from "firebase/auth";
import React, { useEffect } from "react";

import { getIdToken } from "@/lib/firestoreClient/auth";
import { getAssistantExtensionId } from "@/lib/utils/assistant.utils";
import { devLog } from "@/lib/utils/develop.util";

export const Iframe = () => {
  useEffect(() => {
    const connection = chrome.runtime.connect(getAssistantExtensionId() || "", { name: "iframeConnection" });

    connection.onMessage.addListener(message => {
      if (message.type === "REQUEST_ID_TOKEN") {
        (async () => {
          const idToken = await getIdToken();
          devLog("SCROLL_TO_NODE", { idToken });
          connection.postMessage({
            type: "NOTEBOOK_ID_TOKEN",
            token: idToken,
          });
        })();
      } else if (message.type === "EXTENSION_ID") {
        localStorage.setItem("ASSISTANT_EXTENSION_ID", message.extensionId);
      }
    });

    const auth = getAuth();
    const authUnsubscribe = auth.onAuthStateChanged((user: User | null) => {
      if (user) {
        connection.postMessage({ type: "REQUEST_ID_TOKEN" });
      }
    });

    return () => {
      authUnsubscribe();
      connection.disconnect();
    };
  }, []);

  return <div>iframe</div>;
};

export default Iframe;
