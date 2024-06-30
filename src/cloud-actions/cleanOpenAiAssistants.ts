import moment from "moment";
const OpenAI = require("openai");

exports.cleanOpenAiAssistants = async () => {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      organization: process.env.OPENAI_API_ORG_ID,
    });
    const response = await openai.beta.assistants.list({
      order: "desc",
    });
    const assistants = response.data;
    for (let assistant of assistants) {
      const differenceInDays = moment().diff(moment.unix(assistant.created_at), "days");
      if (differenceInDays > 2) {
        await openai.beta.assistants.del(assistant.id);
      }
    }
    const files = await openai.files.list();

    for await (const file of files) {
      const differenceInDays = moment().diff(moment.unix(file.created_at), "days");
      if (differenceInDays > 2) {
        await openai.files.del(file.id);
      }
    }
  } catch (error) {
    console.log("cleanOpenAiAssistants", error);
  }
};
