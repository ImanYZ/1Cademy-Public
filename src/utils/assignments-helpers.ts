// import { ChatCompletionRequestMessage } from "openai";
import { sendGPTPrompt } from "./assistant-helpers";

export const generateQuestionNode = async (
  nodeTitle: string,
  nodeContent: string,
  context: any[]
): Promise<{
  Stem: string;
  Choices: {
    choice: string;
    correct: boolean;
    feedback: string;
  }[];
}> => {
  let prompt: string = `Please compose a multiple-choice question based on the provided text block enclosed in triple quotes. The output should be formatted as a JSON object and consist of the following components:\n`;
  prompt += `- "Stem": This field will contain the central question.\n`;
  prompt += `- "Choices": This will be an array of potential answers. Each answer is an individual object, featuring:\n`;
  prompt += `- "choice": The text of the choice, starting with a lowercase letter followed by a period, like "a.", "b.",  "c." ...\n`;
  prompt += `- "correct": This field should state either "true" if the choice is the right answer, or "false"  if it isn't it should be boolean.\n`;
  prompt += `- "feedback": An explanation describing why the given choice is either correct or incorrect.\n`;
  prompt += `Remember to follow JSON syntax rules to ensure proper formatting and shuffle correct choice(s).\n`;

  prompt += `'''\n`;
  prompt += `"${nodeTitle}":\n`;
  prompt += `"${nodeContent}"\n`;
  prompt += `'''\n`;

  context.push({
    content: prompt,
    role: "user",
  });

  const gptResponse = await sendGPTPrompt(context);

  const response: string = gptResponse || "";
  if (gptResponse) {
    context.push({
      content: gptResponse!,
      role: "assistant",
    });
  }
  try {
    const startBracket = response.indexOf("{");
    if (startBracket === -1) {
      throw new Error(`JSON not found`);
    }
    let endBracket = response.indexOf("}");
    while (response.indexOf("}", endBracket + 1) !== -1) {
      endBracket = response.indexOf("}", endBracket + 1);
    }
    if (endBracket === -1) {
      throw new Error(`JSON not found`);
    }
    return JSON.parse(response.substring(startBracket, endBracket + 1));
  } catch (err) {
    return await generateQuestionNode(nodeTitle, nodeContent, context);
  }
};
