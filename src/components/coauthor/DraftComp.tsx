import { AutoFixHigh as AutoFixHighIcon } from "@mui/icons-material";
import LoadingButton from "@mui/lab/LoadingButton";
import { useTheme } from "@mui/material";
import Box from "@mui/material/Box";
import TextareaAutosize from "@mui/material/TextareaAutosize";
import React, { useEffect,useState } from "react";

import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";

import { sendMessageToChatGPT } from "../../services/openai";

interface Props {
  theme: any;
  articleTypePath: string[];
  recommendedSteps: string[];
  allContent: string;
  findScrollAndSelect: (text: string) => Promise<void> | Promise<HTMLElement>;
  quillRef: any;
  sideBarWidth: number;
  selection: any;
}

const DraftComp: React.FC<Props> = ({
  articleTypePath,
  recommendedSteps,
  allContent,
  quillRef,
  sideBarWidth,
  selection,
}) => {
  const theme = useTheme();
  const [selectedText, setSelectedText] = useState("");
  const [cursorLocation, setCursorLocation] = useState<number | null>(null);
  const [instructions, setInstructions] = useState("");
  const [isloading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    detectingSelectionAndPointer();
  }, [selection]);

  useEffect(() => {
    const handleSelection = () => {
      detectingSelectionAndPointer();
    };
    document.addEventListener("mouseup", handleSelection);
    return () => {
      document.removeEventListener("mouseup", handleSelection);
    };
  }, [selection]);

  const detectingSelectionAndPointer = () => {
    const quillEditor = quillRef.current.getEditor();
    if (quillEditor) {
      if (selection) {
        const bounds = quillEditor.getBounds(selection.index);
        const selectedText = quillEditor.getText(selection.index, selection.length);
        if (selectedText?.trim()) {
          setSelectedText(selectedText);
          setCursorLocation(null);
        } else {
          setSelectedText("");
          setCursorLocation(bounds.left);
        }
      }
    }
  };

  const generateStepByStepGuidance = async () => {
    setIsLoading(true);
    const chatGPTMessages = [
      {
        role: "system",
        content: `You are our co-author on the following  ${articleTypePath.slice(2).reverse().join(" of ")}:
'''
${allContent}
'''
We're currently trying to do the following:
'''
${JSON.stringify(recommendedSteps)}
'''
${instructions}
You should always generate only a JSON response with the following structure:
{
"reasoning": "Your reasoning for this draft",
"draft": "Your draft should go here."
}
`,
      },
    ];
    const jsObject = await sendMessageToChatGPT(chatGPTMessages);
    if (jsObject.draft?.trim()) {
      const quillEditor = quillRef.current?.getEditor();
      if (quillEditor) {
        if (selection) {
          const selectedText = quillEditor.getText(selection.index, selection.length);
          if (selectedText?.trim()) {
            quillEditor.deleteText(selection.index, selection.length);
            quillEditor.insertText(selection.index, jsObject.draft, {
              background: "red",
            });
          } else {
            quillEditor.insertText(selection.index, " " + jsObject.draft, {
              background: "red",
              color: "white",
            });
          }
        }
      }
    }
    setIsLoading(false);
    return jsObject;
  };

  return (
    <Box
      sx={{
        width: "100%",
        mb: "10px",
      }}
    >
      {selectedText || cursorLocation ? (
        <>
          <Box>
            {`Explain what you'd like me to draft ${
              selectedText ? "instead of the selected text" : cursorLocation ? "at your cursor location" : ""
            }:`}
          </Box>
          <Box sx={{ display: "block", width: "100%", mt: "10px" }}>
            <TextareaAutosize
              aria-label="Explain what you'd like me to draft."
              minRows={4}
              placeholder="Explain here."
              style={{
                width: sideBarWidth - 55 + "px",
                marginTop: "10px",
                fontSize: 16,
                border: "none",
                outline: "none",
                padding: "15px",
                fontFamily: "system-ui",
                background:
                  theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG600 : DESIGN_SYSTEM_COLORS.gray200,
                color: theme.palette.mode === "dark" ? "white" : "black",
              }}
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
            />
          </Box>
          <Box
            sx={{
              display: "block",
              width: "100%",
              textAlign: "center",
              mt: "10px",
            }}
          >
            <LoadingButton
              onClick={generateStepByStepGuidance}
              sx={{
                backgroundColor: "success.dark",
                color: "white",
                "&:hover": {
                  backgroundColor: "success.main",
                },
              }}
              loading={isloading}
            >
              <AutoFixHighIcon sx={{ marginRight: "7px" }} />
              Generate the Draft
            </LoadingButton>
          </Box>
        </>
      ) : (
        <Box>
          Click at the location where you'd like me to draft, or select a piece of text that you'd like me to re-draft.
        </Box>
      )}
    </Box>
  );
};

export default DraftComp;
