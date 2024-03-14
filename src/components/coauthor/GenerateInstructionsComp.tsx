import React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { AutoFixHigh as AutoFixHighIcon } from "@mui/icons-material";
import { doc, getDoc, getFirestore, setDoc, updateDoc } from "firebase/firestore";
import { sendMessageToChatGPT } from "../../services/openai";
import { articleTypes } from "../../data/articleTypes";

interface AcademicArticleCategory {
  [key: string]: AcademicArticleCategory | string[];
}

const generateStepByStepGuidance = async (docDescriptivePath: string) => {
  const chatGPTMessages = [
    {
      role: "user",
      content: `I need to write a ${docDescriptivePath}.
Generate a very detailed hierarchical step-by-step JSON object, in which each step is a micro-task that I should do before continuing with the child steps in the hierarchy.
This step-by-step hierarchy should guide me to write a great ${docDescriptivePath}. Each step, in addition to its name, should have a detailed description field.
The hierarchy should be as detailed as possible. The more detailed the hierarchy, the better. The hierarchy should be in JSON format.
The hierarchy should be in the following format:
{ "name": "${docDescriptivePath}", "description": "Description of ${docDescriptivePath}", "steps": [{ "name": "Step 1 name", "description": "Description of step 1", "steps": [{ "name": "Step 1.1 name", "description": "Description of step 1.1", "steps": [...] }, ...] }, { "name": "Step 2 name", "description": "Description of step 2", "steps": [{ "name": "Step 2.1 name", "description": "Description of step 2.1", "steps": [...] }, ...] }, ...] }`,
    },
  ];
  const jsObject = await sendMessageToChatGPT(chatGPTMessages);
  return jsObject;
};

const removeAccomplishedFromSteps = (steps: any) => {
  return steps.map((step: any) => {
    const { ...rest } = step;
    if (rest.steps && rest.steps.length > 0) {
      rest.steps = removeAccomplishedFromSteps(rest.steps);
    }
    return rest;
  });
};

const generateDocumentsForCategories = async (
  node: AcademicArticleCategory | string[],
  path: string[] = []
): Promise<void> => {
  const db = getFirestore();
  if (Array.isArray(node)) {
    for (const item of node) {
      const pathItems = [...path, item];
      let docPath = pathItems.join("/");
      if (pathItems.length % 2 === 0) {
        const lastIndex = docPath.lastIndexOf("/");
        // Replace the last "/" with "-"
        docPath = docPath.substring(0, lastIndex) + "-" + docPath.substring(lastIndex + 1);
      }
      const docRef = doc(db, "instructions", docPath);
      const theDoc = await getDoc(docRef);
      const docDescriptivePath = [...path, item].slice(2).reverse().join(" of ");
      if (!theDoc.exists()) {
        const stepByStepGuidance = await generateStepByStepGuidance(docDescriptivePath);
        await setDoc(docRef, stepByStepGuidance);
      } else {
        const theData = theDoc.data();
        if (theData.hasOwnProperty("accomplished")) {
          const updatedData = { ...theData };
          delete updatedData.accomplished;
          updatedData.steps = removeAccomplishedFromSteps(updatedData.steps);
          await updateDoc(docRef, updatedData);
        }
        if (!theData.hasOwnProperty("steps") || theData.steps.length < 4) {
          const stepByStepGuidance = await generateStepByStepGuidance(docDescriptivePath);
          await updateDoc(docRef, stepByStepGuidance);
        }
      }
    }
  } else {
    for (const [key, value] of Object.entries(node)) {
      await generateDocumentsForCategories(value, [...path, key]);
    }
  }
};

const GenerateInstructionsComp: React.FC = () => {
  return (
    <Box
      sx={{
        width: "100%",
        mb: "10px",
      }}
    >
      <Button
        onClick={() => {
          generateDocumentsForCategories(articleTypes)
            .then(() => {})
            .catch(error => console.error("Error creating documents:", error));
        }}
        sx={{
          backgroundColor: "error.main",
          color: "white",
          "&:hover": {
            backgroundColor: "error.light",
          },
          mt: "10px",
        }}
      >
        <AutoFixHighIcon sx={{ marginRight: "7px" }} />
        Generate Instructions
      </Button>
    </Box>
  );
};

export default GenerateInstructionsComp;
