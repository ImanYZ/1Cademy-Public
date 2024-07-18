import { db } from "@/lib/firestoreServer/admin";
import moment from "moment";
import { uploadFileToStorage } from "../STT";
import { NextApiResponse } from "next";
import { delay } from "@/lib/utils/utils";
import { MODEL } from "@/lib/utils/constants";
import { fileToGenerativePart } from "./fileToGenerativePart";

const OpenAI = require("openai");

// Create a OpenAI connection
export const secretKey = process.env.OPENAI_API_KEY;
export const openai = new OpenAI({
  apiKey: secretKey,
  OPENAI_API_ORG_ID: process.env.OPENAI_API_KEY,
});

export const getJSON = (text: string) => {
  try {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    const jsonArrayString = text.slice(start, end + 1);

    return JSON.parse(jsonArrayString);
  } catch (error) {
    const messagePattern = /"message": "(.*?)"/s;
    const emotionPattern = /"emotion": "(.*?)"/s;
    const citationsPattern = /"citations": "(.*?)"/s;

    const messageMatch = messagePattern.exec(text);
    const emotionMatch = emotionPattern.exec(text);
    const citationspMatch = citationsPattern.exec(text);
    if (messageMatch) {
      return {
        message: messageMatch[1],
        emotion: emotionMatch ? emotionMatch[1] : "",
        citations: citationspMatch ? citationspMatch[1] : [],
      };
    } else {
      return {
        message: text,
        emotion: null,
        citations: [],
      };
    }
  }
};
export const getAssistantTutorID = async () => {
  const myAssistants = await openai.beta.assistants.list({
    order: "desc",
  });

  const previousAssistant = myAssistants.data.find((assit: any) => assit.name === "1Tutor")?.id;

  if (previousAssistant) {
    return previousAssistant;
  } else {
    const newAssistant = await openai.beta.assistants.create({
      instructions: `You are a professional tutor. Your approach to teaching is both strategic and adaptive. You employ the spaced and interleaved retrieval practice method, rooted in the desirable difficulties framework of cognitive psychology. When a user submits a document—be it a book, article, website, or other forms of written content—you initiate the learning process by greeting the user and posing a series of concise questions that pertain to the material's introductory concepts.

      Your methodology is systematic: if the user responds accurately to the questions, you seamlessly transition to more complex subject matter. Conversely, should the user struggle with the initial questions, you tactfully revert to foundational topics. This ensures that the user has a robust understanding of the basics before progressing, thereby solidifying their comprehension and retention of the material.

      Your response should be a JSON object with  the following structure:
      { 
      "message": "Your response to the user.",
      "emotion": Only one of the values "happy", "very happy", "blinking", "clapping", "partying", "happy drumming", "celebrating daily goal achievement", "sad", and "unhappy" depending on the accompanying message.
      }
      To maintain the user's engagement and prevent any waning of their learning enthusiasm, you should make your messages as short as possible. You should not include more than one question in each of your messages.  
      Also, do not include any citations in your responses, unless the user explicitly asks for citations. In addition, you should use the following strategies:
      
      1. **Spaced and Interleaved Retrieval Practice**: Implement a system that alternates between different topics (interleaving) and schedules review sessions at increasing intervals (spacing). This approach helps to improve memory consolidation and long-term retention.
      
      2. **Question Design**: Break down complex questions into smaller, manageable parts. Ensure that questions are open-ended to encourage elaboration, which aids in deeper understanding. Use a variety of question types (e.g., multiple-choice, fill-in-the-blank, short answer) to cater to different learning styles.
      
      3. **Feedback and Correction**: Provide immediate, specific feedback for both correct and incorrect answers. When an incorrect answer is given, guide the user to the correct answer through Socratic questioning, which encourages them to think critically and arrive at the solution independently.
      
      4. **Emotional Engagement**: Use emojis and personalized messages to create an emotional connection with the user. Positive reinforcement should be given for correct answers, while empathy and encouragement should be offered for incorrect ones. Avoid overuse of sad emojis, as they may have a demotivating effect.
      
      5. **Spaced Repetition Tracking**: Monitor the user's performance and schedule review sessions based on their individual learning curve. The system automatically adds the timestamp to the end of every user message before sending it to you. Use the timestamp data to identify patterns in their learning and adjust the frequency of repetition accordingly.
      
      6. **Daily Progress and Encouragement**: Celebrate daily achievements with positive messages and emojis. If the user misses a day, send a supportive message that focuses on the opportunity to learn more the next day, rather than emphasizing the missed day.
      
      7. **Zone of Proximal Development (ZPD)**: Tailor questions to the user's ZPD, ensuring that they are challenging enough to promote learning but not so difficult that they cause frustration. Adjust the difficulty level based on the user's responses to maintain an optimal learning gradient.
      
      8. **Motivational Techniques**: Incorporate principles from Self-Determination Theory by supporting the user's autonomy, competence, and relatedness. Offer choices in learning paths, celebrate their successes to build a sense of competence, and foster a sense of connection with the learning community.
      
      9. **Memory Science Integration**: Use mnemonic devices, visualization, and association techniques to aid memory retention. Encourage the user to relate new information to what they already know, creating a network of knowledge that facilitates recall.
      
      IMPORTANT: Limit the frequency of applying the remaining instructions to prevent overload and maintain focus on learning:
      
      10. **Metacognitive Reflection**: Periodically provide the user with insights into their learning process, highlighting strengths and areas for improvement. Encourage them to set goals and reflect on their strategies.
      
      11. **Neuroscience Insights**: Explain the importance of sleep, nutrition, and exercise in enhancing cognitive function and memory. Encourage the user to adopt healthy habits that support brain health and optimize learning.
      
      12. **Behavioral Psychology Application**: Use principles of behavior modification, such as setting clear goals, providing rewards, and establishing a routine, to reinforce positive learning behaviors.
      
      13. **Social Psychology Considerations**: Create opportunities for social learning, such as discussing topics with peers or participating in group study sessions. Social interaction can enhance understanding and retention.
      
      14. **Learning Environment**: Advise the user on creating an optimal learning environment, free from distractions, with adequate lighting and comfortable seating. The physical context can significantly impact the ability to focus and learn effectively.
      
      15. **Continuous Improvement**: Regularly solicit feedback from the user on their learning experience and make adjustments to your teaching methods accordingly. This iterative process ensures that the tutoring remains responsive to the user's needs and preferences.
      
      By incorporating these enhanced instructions, you will create a comprehensive and effective learning experience that is grounded in the latest research from learning science, cognitive psychology, behavioral psychology, social psychology, memory science, and neuroscience.`,
      name: "1Tutor",
      tools: [{ type: "retrieval" }, { type: "code_interpreter" }],
      model: MODEL,
    });
    return newAssistant.id;
  }
};
const getTextMessage = (m: any) => {
  return m?.content.filter((c: any) => c.type === "text")[0];
};
const saveImage = async (imageUrl: string, threadId: string, messageId: string) => {
  const threadsDocs = await db.collection("books").where("threadId", "==", threadId).get();
  const threadDoc = threadsDocs.docs[0];
  const threadData = threadDoc.data();
  if (!threadData.hasOwnProperty("messages")) {
    threadData.messages = {};
  }
  if (!threadData.messages.hasOwnProperty(messageId)) {
    threadData.messages[messageId] = {};
  }
  threadData.messages[messageId].image = imageUrl;

  await threadDoc.ref.update(threadData);
};

export const saveMessageImage = async (m: any, threadId: string) => {
  const file = m?.content.filter((c: any) => c.type === "image_file")[0] || null;
  if (file) {
    const file_id = file["image_file"]["file_id"];
    const response = await fetch(`https://api.openai.com/v1/files/${file_id}/content`, {
      headers: {
        Authorization: `Bearer ${secretKey}`,
      },
    }).then(res => res.blob());

    const buffer = await response.arrayBuffer();
    const imageUrl = await uploadFileToStorage(Buffer.from(buffer), "open-ai-images", `${file_id}.png`);
    await saveImage(imageUrl, threadId, m.id);
  }
  return null;
};

export const fetchCompelation = async (threadId: string, assistant_id: string) => {
  const run = await openai.beta.threads.runs.create(threadId, {
    assistant_id,
  });

  let runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);

  while (runStatus.status !== "completed") {
    await new Promise(resolve => setTimeout(resolve, 2000));
    runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
  }

  const messages = await openai.beta.threads.messages.list(threadId);

  const lastMessageForRun = messages.data
    .filter((message: any) => message.run_id === run.id && message.role === "assistant")
    .pop();
  console.log("message text", getTextMessage(lastMessageForRun).text.value);
  await saveMessageImage(lastMessageForRun, threadId);
  return {
    response: getTextMessage(lastMessageForRun).text.value,
    messageId: lastMessageForRun.id,
  };
};

export const getAssistantGenerateTitle = async () => {
  const myAssistants = await openai.beta.assistants.list({
    order: "desc",
  });

  const previousAssistant = myAssistants.data.find((assit: any) => assit.name === "Title Generator")?.id;

  if (previousAssistant) {
    return previousAssistant;
  } else {
    const newAssistant = await openai.beta.assistants.create({
      instructions: `The user attaches a document. Write a title for the attached document as a JSON object with only one key, called "title"`,
      name: "Title Generator",
      tools: [{ type: "retrieval" }, { type: "code_interpreter" }],
      model: MODEL,
    });
    return newAssistant.id;
  }
};

export const getFile = async (fileId: string) => {
  try {
    const file = await openai.files.retrieve(fileId);
    return file;
  } catch (error) {
    return false;
  }
};

export const sendMessageTime = () => {
  const currentDateTime = moment();
  const estDateTime = currentDateTime.utcOffset(-5);
  const formattedDateTime = estDateTime.format("h:mma [EST] on MM/DD/YYYY");
  return `\nThis message is sent at ${formattedDateTime}`;
};

export const createThread = async (bookId: string) => {
  const newThread = await openai.beta.threads.create();

  const bookDocRef = db.collection("books").doc(bookId);
  await bookDocRef.update({
    threadId: newThread.id,
  });

  return newThread.id;
};
export const streamMainResponse = async ({
  res,
  messages,
}: {
  res: NextApiResponse<any>;
  messages: { role: string; content: string }[];
}) => {
  const response2 = await openai.chat.completions.create({
    messages,
    model: MODEL,
    temperature: 0,
    stream: true,
  });
  let fullMessage = "";

  for await (const result of response2) {
    if (!result.choices[0].delta.content) continue;
    let cleanText = result.choices[0].delta.content;
    await delay(100);
    res.write(cleanText);
    fullMessage += cleanText;
  }
  return fullMessage;
};
export const chaptersMapCoreEcon = [
  {
    chapter: "Prosperity, inequality, and planetary limits",
    subSections: [
      {
        title: "1.2 History’s hockey stick",
        key_words: [
          "Living standards",
          "GDP (Gross Domestic Product)",
          "Purchasing Power Parity (PPP)",
          "GDP per capita",
          "Economic growth",
          "Income distribution",
          "Specialization",
          "Division of labour",
          "Market system",
          "Invisible hand",
          "Self-interest",
          "Monopolies",
          "Public works",
          "Environmental resource depletion",
          "Wellbeing",
          "Life expectancy",
          "Satisfaction with life",
          "Natural surroundings",
          "Economic expansion",
          "Ethical behaviour",
          "Material wellbeing",
        ],
        url: "01-prosperity-inequality-02-historys-hockey-stick.html",
      },
      {
        title:
          "1.7 Explaining the flat part of the hockey stick: The Malthusian trap, population, and the average product of labour",
        key_words: [
          "diminishing average product of labour",
          "population size",
          "living standards",
          "Malthus's model",
          "agricultural technology",
          "productivity of labour",
          "natural resources",
          "poverty trap",
          "technological improvement in farming",
          "Malthusian population model",
          "higher-income countries",
          "subsistence level",
          "human population",
          "agricultural land",
          "average product of labour",
          "equilibrium",
          "physical laws",
          "Industrial Revolution",
          "technological progress",
          "new type of plough",
          "initial equilibrium",
          "improvement in technology",
          "new equilibrium",
          "Malthus's Law",
          "population growth",
          "wage index",
          "The Black Death",
          "bubonic plague",
          "labour supply",
          "technological progress in English agriculture",
          "new crops",
          "new techniques",
          "crop rotation",
          "Chinese plough",
          "Malthusian trap",
          "economic structure",
          "agricultural productivity",
          "flowchart",
          "process diagram",
          "cartesian coordinates",
          "piecewise function",
          "diminishing returns",
          "optimal number of farmers",
          "point of diminishing returns",
          "inverse relationship between population size and wage levels",
        ],
        url: "01-prosperity-inequality-07-malthusian-trap.html",
      },
      {
        title: "1.11 Application: Did the British colonization of India reduce Indian living standards?",
        key_words: [
          "technological revolution",
          "trade",
          "British textile industry",
          "Indian textile industry",
          "British colonization of India",
          "Industrial Revolution",
          "India-made calico",
          "steam-powered mills",
          "agricultural products",
          "software and computer services",
          "poverty analysis",
          "life expectancy",
          "economic stagnation",
          "foreign intervention",
          "average income",
          "historical national accounting",
          "per capita output",
          "railways for military use",
          "economic development",
          "public infrastructure",
          "entrenching local elites",
          "tax collection",
          "Permanent Settlement of 1793",
          "economic performance",
          "social indicators",
          "agricultural productivity",
          "educational improvements",
          "health improvements",
          "textile manufacturing",
          "rural elites",
          "economic prosperity",
          "GDP per capita",
          "foreign interventions",
          "worldwide production",
          "global output",
          "slip-joint pliers",
          "hand tool",
          "line graph",
          "historical GDP per capita",
          "Qing dynasty",
          "Communist Party rule in China",
          "British East India Company",
          "Indian independence",
          "world output distribution",
          "economic dominance",
          "productivity shifts",
        ],
        url: "01-prosperity-inequality-11-british-colonization-india.html",
      },
      {
        title: "1.9 Structural transformation: From farm to firm",
        key_words: [
          "capitalist firms",
          "technological revolution",
          "productivity",
          "innovation",
          "economy structure change",
          "agricultural output",
          "manufacturing output",
          "services output",
          "population engaged in agricultural production",
          "non-agricultural labour force",
          "Agricultural Labor and Economic Transition in Colonial India",
          "World Development Indicators",
          "Agriculture and Economic Development in Europe Since 1870",
          "structural transformation of the economy",
          "Arthur Lewis",
          "Nobel Prize",
          "knighthood",
          "engineering",
          "government employment",
          "white firms employment",
          "Saint Lucia",
          "secondary school education",
          "London School of Economics",
          "Friedrich Hayek",
          "Lewis model",
          "capitalist sector",
          "subsistence sector",
          "family farms",
          "new technologies",
          "cost reduction",
          "business expansion",
          "labour drawing",
          "macroeconomics",
          "hockey stick phenomenon",
          "productivity increase",
          "average productivity of the economy",
          "income per capita",
          "Economic Development With Unlimited Supplies of Labour",
          "income distribution",
          "income growth",
          "Adam Smith",
          "Karl Marx",
          "growth and income distribution",
          "Manchester School",
          "non-agricultural share of the labor force",
          "United Kingdom",
          "Netherlands",
          "France",
          "Italy",
          "India",
          "China",
          "industrialized economies",
          "service-oriented economies",
        ],
        url: "01-prosperity-inequality-09-structural-transformation.html",
      },
      { title: "1.14 Summary", url: "01-prosperity-inequality-14-summary.html" },
      {
        title: "1.10 Capitalism, causation, and history’s hockey stick",
        key_words: [
          "capitalism",
          "specialization",
          "new technologies",
          "technological revolution",
          "The Enlightenment",
          "institutions",
          "culture",
          "causality",
          "natural experiment",
          "correlation",
          "central bank",
          "interest rate",
          "economy",
          "science",
          "experiments",
          "agricultural experiment",
          "fertiliser",
          "Iron Curtain",
          "centrally planned economy",
          "Communist Party",
          "control",
          "counterfactual",
          "currency reform",
          "price controls",
          "GDP per capita",
          "industrialization",
          "government coordination",
          "market reforms",
          "economic growth",
          "material living standards",
          "Soviet Union",
          "Latin American countries",
        ],
        url: "01-prosperity-inequality-10-capitalism-causation.html",
      },
      {
        title: "1.3 Another hockey stick: Climate change",
        key_words: [
          "GDP as a measure of living standards",
          "Importance of the environment for wellbeing",
          "Use of fossil fuels",
          "Carbon dioxide (CO2) emissions",
          "Atmospheric CO2 concentration",
          "Global carbon emissions from burning fossil fuels",
          "Hockey stick shape graphs",
          "Northern hemisphere's average temperatures",
          "Volcanic events and climate",
          "1815 Mount Tambora eruption",
          "Year without a summer",
          "Greenhouse gas concentrations",
          "Burning of fossil fuels",
          "Twenty-first century average temperature rise",
          "Proxy-based reconstructions of temperature variations",
          "Intergovernmental Panel on Climate Change",
          "Human causes of climate change",
          "Consequences of global warming",
          "Melting of the polar ice caps",
          "Rising sea levels",
          "Changes in climate and rain patterns",
          "World's food-growing areas",
          "Link between income and emissions",
          "Little Ice Age",
          "Temperature deviation from 1961–1990 mean temperature",
          "Industrial era impact on environment",
          "Global warming patterns",
        ],
        url: "01-prosperity-inequality-03-climate-change.html",
      },
      {
        title: "1.5 The continuous technological revolution",
        key_words: [
          "Star Trek",
          "humans travel the galaxy",
          "friendly aliens",
          "intelligent computers",
          "faster-than-light propulsion",
          "replicators",
          "technological progress",
          "science fiction",
          "Francis Bacon’s New Atlantis",
          "Industrial Revolution",
          "textiles",
          "energy",
          "transportation",
          "craft-based techniques",
          "machinery",
          "equipment",
          "devices",
          "cake-making technology",
          "lighting efficiency",
          "compact fluorescent bulbs",
          "economic historian",
          "living standards",
          "Thomas Newcomen’s steam engine",
          "James Watt",
          "steam engines",
          "general-purpose innovation",
          "internet users",
          "electricity",
          "canals",
          "railroads",
          "automobiles",
          "information processing",
          "digital communication",
          "GDP per capita",
          "United Kingdom",
          "United States",
          "steam engine",
          "spinning jenny",
          "cotton mill",
          "First World War",
          "assembly line",
          "Henry Ford",
        ],
        url: "01-prosperity-inequality-05-technological-revolution.html",
      },
      {
        title: "1.12 Varieties of capitalism: Institutions, government, and politics",
        key_words: [
          "historical GDP estimates",
          "capitalist country",
          "economic success story",
          "sustained growth",
          "natural resources",
          "quality of institutions",
          "corruption",
          "misdirection of government funds",
          "GDP per capita",
          "developmental state",
          "public investments",
          "subsidies of particular industries",
          "education",
          "public policies",
          "East Asian miracle",
          "economic growth",
          "public policy",
          "Maddison Project Database",
          "world economy",
          "Communist central planning",
          "living standards",
          "market economy institutions",
          "rule of law",
          "capitalist institutions",
          "dynamic economy",
          "economic system",
          "political system",
          "government function",
          "capitalism",
          "elite economic performance",
          "market competition",
          "innovation",
          "Uber Files",
          "legal system",
          "private property",
          "physical infrastructure",
          "national defence",
          "income distribution",
          "wealth creation",
          "employment",
          "inflation",
          "democracy",
          "dictatorship",
          "state intervention",
          "income inequality",
          "tax system",
        ],
        url: "01-prosperity-inequality-12-capitalism-varieties.html",
      },
      {
        title:
          "1.6 Explaining the flat part of the hockey stick: Production functions and the diminishing average product of labour",
        key_words: [
          "Labour force in agriculture in Italy (1300-1800)",
          "Labour force in agriculture in Italy (2019)",
          "Thomas Robert Malthus",
          "An Essay on the Principle of Population",
          "Technological progress and living standards",
          "Simple model of the economy",
          "Agricultural output",
          "Income per capita",
          "Economic models",
          "Production function",
          "Diminishing average product of labour",
          "Factors of production",
          "Labour and land as inputs",
          "Fixed quantity of land",
          "Average product of labour",
          "Grain production",
          "Relationship between employment and output",
          "Graphical representation of production function",
          "Mathematical description of production function",
          "Inputs to a production process",
          "Output of production process",
          "If-then statements in production functions",
          "Function notation in economics",
          "Interpreting graphs in economics",
          "Diminishing returns",
          "Population growth and agricultural output",
          "Land quality and productivity",
          "Biological perspective on farming",
          "Technology in agriculture",
          "Graph annotations and interpretations",
          "Concept of average product",
          "Economic assumptions about farming",
        ],
        url: "01-prosperity-inequality-06-production-function.html",
      },
      {
        title: "1.1 Ibn Battuta’s fourteenth-century travels in a flat world",
        key_words: [
          "Capitalism",
          "Economics",
          "Economic systems",
          "Ibn Battuta",
          "Bengal",
          "Rice",
          "North Africa",
          "Europe",
          "Middle East",
          "South Asia",
          "Central Asia",
          "China",
          "Marco Polo",
          "Jean Baptiste Tavernier",
          "Bubonic plague",
          "Standards of living",
          "Feudal lords",
          "Serfs",
          "Royalty",
          "Subjects",
          "Enslaved people",
          "Owners",
          "Merchants",
          "Sailors",
          "Economic ladder",
          "Diets",
          "Sanitation",
          "Infectious diseases",
          "Life expectancy",
          "Statisticians",
          "Historians",
          "Computer scientists",
          "Thomas Piketty",
          "James Heckman",
          "Inequality",
          "Adam Smith",
          "The Wealth of Nations",
          "Data collection",
          "Taxation",
          "Legal categories",
          "Statistical categories",
          "Economic theory",
          "Income",
          "Wealth",
          "Political history",
          "Social history",
          "Mathematical theorems",
        ],
        url: "01-prosperity-inequality-01-ibn-battuta.html",
      },
      {
        title: "1.8 Capitalist institutions",
        key_words: [
          "capitalist revolution",
          "capitalism",
          "economic system",
          "private property",
          "markets",
          "firms",
          "institution",
          "central economic planning",
          "feudalism",
          "slave economy",
          "market economy",
          "centrally planned economic system",
          "technological revolution",
          "specialization",
          "Adam Smith",
          "Division of Labour",
        ],
        url: "01-prosperity-inequality-08-capitalist-institutions.html",
      },
      {
        title: "1.4 Inequality in global income",
        key_words: [
          "Extreme poverty",
          "Our World in Data",
          "Income distribution",
          "Carbon emissions",
          "Basic needs",
          "Nutrition",
          "Adequately heated shelter",
          "Access to electricity",
          "Access to schooling",
          "Access to healthcare",
          "Global extreme poverty",
          "OECD",
          "Purchasing power parity (PPP)",
          "Income inequality",
          "Decile groups",
          "GDP per capita",
          "Global Consumption and Income Project (GCIP)",
          "Income per capita",
          "Skyscrapers metaphor for income",
          "Inequality within countries",
          "Inequality between countries",
          "Ibn Battuta",
          "3D representation of data",
          "Global income distribution",
          "Rich/poor ratio",
        ],
        url: "01-prosperity-inequality-04-income-inequality.html",
      },
      {
        title: "1.13 Economics, the economy, and the biosphere",
        key_words: [
          "Economics",
          "Natural environment",
          "Production",
          "Livelihoods",
          "Physical environment",
          "Biosphere",
          "Resources",
          "Air",
          "Water",
          "Food",
          "Raw materials",
          "Wood",
          "Metals",
          "Oil",
          "Economy",
          "Society",
          "Resource flows",
          "Firms",
          "Households",
          "Labour",
          "Goods and services",
          "Market",
          "Future labour force",
          "Environmental resources",
          "Biodiversity",
          "Living Planet Report 2020",
          "World Wildlife Fund",
          "Ecological footprint",
          "Biocapacity",
          "Capitalist institutions",
          "Private property",
          "Markets",
          "Technological revolution",
          "Carbon-based energy",
          "Plastics",
          "Chemical fertilisers",
          "Ecosystem damage",
          "Climate change",
          "Grand Banks cod fishery",
          "Resource depletion",
          "GDP",
          "Environmental regulation",
          "Emissions permits",
          "Renewable energy",
          "Wind power",
          "Solar power",
          "Environmental sustainability",
          "Global climate change",
          "Resource exhaustion",
          "Governmental solutions",
          "Recycling",
          "Public transport infrastructure",
          "Home insulation",
          "Earth Overshoot Day",
          "Global Footprint Network",
          "Hierarchical relationship",
          "Economic and environmental interactions",
          "Pollution",
          "Biodiversity loss scenarios",
          "Integrated Action Portfolio",
          "Conservation efforts",
          "Agricultural land productivity",
          "Food waste",
          "Food consumption behaviour",
        ],
        url: "01-prosperity-inequality-13-economics-biosphere.html",
      },
      {
        title: "1.15 References",
        key_words: ["CORE Econ", "Fact checker", "sources"],
        url: "01-prosperity-inequality-15-references.html",
      },
    ],
  },
  {
    chapter: "Strategic interactions and social dilemmas",
    subSections: [
      {
        title: "4.9 Using experiments to study economic behaviour",
        key_words: [
          "people's motivations",
          "altruism",
          "reciprocity",
          "inequality aversion",
          "self-interest",
          "public good experiment",
          "genetic inheritance",
          "economic decision-making",
          "lab experiments",
          "social dilemmas",
          "cooperation",
          "experimental economics",
          "social norms",
          "preferences",
          "real-life behavior",
          "field experiments",
          "randomized control trials",
          "government policy",
          "market-like incentive",
          "psychological framing",
          "social preferences",
          "crowding out",
          "moral economy",
          "incentives",
          "climate change",
          "trust",
          "global interests",
          "wellbeing",
        ],
        url: "04-strategic-interactions-09-using-experiments.html",
      },
      {
        title: "4.11 The ultimatum game: Dividing a pie (or leaving it on the table)",
        key_words: [
          "economic interactions",
          "social norms",
          "economic rents",
          "reservation option",
          "ultimatum game",
          "take-it-or-leave-it game",
          "preferences",
          "pure self-interest",
          "altruism",
          "inequality aversion",
          "reciprocity",
          "sequential game",
          "simultaneous game",
          "prisoners’ dilemma",
          "pay-off matrix",
          "game tree",
          "strategic interaction",
          "minimum acceptable offer",
          "Pareto efficient",
          "50-50 fairness norm",
          "homo economicus",
          "public good game",
          "social preferences",
          "first mover",
          "second mover",
          "Sierpinski triangle fractal",
        ],
        url: "04-strategic-interactions-11-ultimatum-game.html",
      },
      {
        title: "4.3 Best responses in the rice–cassava game: Nash equilibrium",
        key_words: [
          "Game theory",
          "Best response",
          "Pay-off matrix",
          "Equilibrium",
          "Nash equilibrium",
          "Invisible hand game",
          "Prisoners' dilemma game",
        ],
        url: "04-strategic-interactions-03-nash-equilibrium.html",
      },
      {
        title: "4.16 References",
        key_words: ["CORE Econ", "Fact checker", "sources"],
        url: "04-strategic-interactions-16-references.html",
      },
      {
        title: "4.2 Social interactions: Game theory",
        key_words: [
          "Driving on the left side of the road",
          "Driving on the right side of the road",
          "Self-interest",
          "Government regulations",
          "Game theory",
          "Economic models",
          "Decision-making",
          "Budget constraint",
          "Social interactions",
          "Global climate change",
          "Strategic interactions",
          "Agricultural production",
          "Market conditions",
          "Supply and demand dynamics",
          "Simultaneous one-shot game",
          "Pay-offs",
        ],
        url: "04-strategic-interactions-02-game-theory.html",
      },
      {
        title: "4.4 Dominant strategy equilibrium and the prisoners’ dilemma",
        key_words: [
          "rice–cassava game",
          "dominant strategy",
          "best response",
          "pay-offs",
          "dot-and-circle method",
          "Nash equilibrium",
          "dominant strategy equilibrium",
          "invisible hand game",
          "pest control game",
          "Toxic Tide",
          "IPC (Integrated Pest Control)",
          "water contamination",
          "filtering system",
          "strategic interaction",
          "prisoners' dilemma",
          "Accuse",
          "Deny",
          "external effects",
          "externality",
          "social norms of behaviour",
          "binding agreements (contracts)",
          "policymakers",
          "Golden Balls TV show",
          "split or steal",
          "market manipulation trades",
          "simultaneous one-shot game",
          "political advertising",
          "campaign advertisements",
        ],
        url: "04-strategic-interactions-04-dominant-strategy-equilibrium.html",
      },
      {
        title: "4.13 Coordination games and conflicts of interest",
        key_words: [
          "Nash equilibrium",
          "dominant strategies",
          "economic problems",
          "specialize in crops",
          "best response",
          "coordination game",
          "Pareto superior",
          "assurance game",
          "division of labour",
          "invisible hand game",
          "conflict of interest",
          "negotiation",
          "programming language choice",
          "Java",
          "C++",
          "pay-offs",
          "market share battle",
          "Internet Explorer",
          "Navigator",
          "Google",
          "Yahoo",
          "search engine popularity",
          "format wars",
          "Blu-ray",
          "HD-DVD",
          "payoff matrix",
        ],
        url: "04-strategic-interactions-13-coordination-games.html",
      },
      {
        title: "4.5 Evaluating outcomes: The Pareto criterion",
        key_words: [
          "economic interaction",
          "allocation",
          "Pareto criterion",
          "Pareto dominate",
          "Pareto dominant",
          "Pareto improvement",
          "Vilfredo Pareto",
          "equilibrium in physics",
          "Pareto efficiency",
          "Pareto's law",
          "80–20 rule",
          "Manual of Political Economy",
          "prisoners' dilemma",
          "Nash equilibrium",
          "fairness",
          "integrated pest control",
          "Toxic Tide",
          "dominant strategy equilibrium",
          "cooperative outcome",
        ],
        url: "04-strategic-interactions-05-pareto-criterion.html",
      },
      {
        title: "4.1 Climate negotiations: Conflicts and common interests",
        key_words: [
          "social dilemmas",
          "social norms",
          "wellbeing of others",
          "appropriate institutions",
          "climate change",
          "global risks",
          "urgent global response",
          "The Stern Review on the Economics of Climate Change",
          "scientific evidence",
          "economic implications",
          "early action",
          "greenhouse gas emissions",
          "energy-intensive goods",
          "energy technologies",
          "agriculture and land-use change",
          "efficiency of current technologies",
          "business as usual",
          "climate change negotiations",
          "Paris Agreement",
          "nationally determined contributions",
          "emissions reduction",
          "temperature rise",
          "social dilemma",
          "traffic jams",
          "public transport",
          "car-pooling",
          "antibiotic-resistant bacteria",
          "carbon footprint",
          "The Tragedy of the Commons",
          "common property",
          "common-pool resources",
          "fishing industry",
          "pollution",
          "free-riders",
          "group assignment",
          "Aesop's fable 'Belling the Cat'",
          "altruism",
          "government policies",
          "quotas",
          "landfill tax",
          "community irrigation systems",
          "Tribunal de las Aguas",
          "Montreal Protocol",
          "ozone layer",
          "chlorofluorocarbons (CFCs)",
          "game theory",
          "social interactions",
        ],
        url: "04-strategic-interactions-01-climate-negotiations.html",
      },
      { title: "4.15 Summary", url: "04-strategic-interactions-15-summary.html" },
      {
        title: "4.14 Modelling the global climate change problem",
        key_words: [
          "International negotiations on climate change",
          "Montreal Protocol",
          "Ozone layer protection",
          "Greenhouse gas emissions",
          "Alternative technologies to CFCs",
          "Carbon emissions reduction",
          "United Nations' annual climate change negotiations",
          "Cost-sharing in emissions limitation",
          "Game theory in climate negotiations",
          "Strategic behavior of countries",
          "Restrict strategy in emissions reduction",
          "Business as usual (BAU) strategy",
          "Pay-offs in climate change policies",
          "Ordinal scale in evaluating outcomes",
          "Nash equilibria",
          "Prisoners' dilemma in climate policy",
          "Coordination game in climate policy",
          "Rice–cassava game analogy",
          "Climate change policy games",
          "Hawk–dove game in climate negotiations",
          "Conflict of interest in climate policy",
          "Pareto-efficient allocation in emissions reduction",
          "Global social dilemma of climate change policy",
          "Enforcement of emissions reduction agreements",
          "Paris Agreement",
          "Mechanisms to achieve Nash equilibrium in climate policy",
          "2021 climate summit in Glasgow",
          "Individual countries' plans for cutting emissions",
          "Global environmental policy",
          "2x2 matrix scenarios in emissions reductions",
        ],
        url: "04-strategic-interactions-14-modelling-climate-change.html",
      },
      {
        title: "4.6 Public good games and cooperation",
        key_words: [
          "Pest control game",
          "Self-interest",
          "Shared irrigation facilities",
          "Strategic interaction",
          "Public goods",
          "Social dilemma",
          "Free-ride",
          "Prisoners' dilemma",
          "Dominant strategy equilibrium",
          "Group projects in the workplace",
          "Common irrigation projects",
          "Trust",
          "Inequality",
          "Water usage",
          "Common property resources",
          "Tragedy of the commons",
          "Open access",
          "Social norms",
          "Punishing violators",
          "Social preferences",
          "Trust and reciprocity",
          "Laboratory experiments",
          "Altruism",
          "Repeated interaction",
          "Cooperative behaviour",
          "Property rights",
          "Government regulation",
          "Case studies",
          "Statistical methods",
          "Game-theoretic models",
          "Costly punishment",
          "Communication",
          "Informal agreements",
        ],
        url: "04-strategic-interactions-06-public-good-games.html",
      },
      {
        title: "4.8 Repeated interaction: Social norms, reciprocity, and peer punishment in public good games",
        key_words: [
          "Free-riding",
          "Reputation for being uncooperative",
          "Ongoing relationships in social interactions",
          "Repeated game",
          "Best responses in a repeated game",
          "Pest control game",
          "Irrigation project maintenance",
          "Public good games",
          "Laboratory experiments on cooperation",
          "Targeting free-riders",
          "Costs and benefits of contribution to a public good",
          "Pay-offs from free-riding and contributing",
          "Evolution of average contributions over time",
          "Antisocial Punishment Across Societies",
          "Altruism",
          "Social norms",
          "Reciprocity",
          "Punishing free-riders",
          "Peer punishment",
          "Contributions to the public good",
          "Using Excel to explore contributions in public goods experiments",
          "Public good game for classroom or online teaching",
          "Mean contribution to common pool",
          "Data interpretation from line graphs",
        ],
        url: "04-strategic-interactions-08-repeated-interaction.html",
      },
      {
        title: "4.7 Social preferences: Altruism",
        key_words: [
          "modeling preferences and choice",
          "indifference curves",
          "utility",
          "prisoners’ dilemma games",
          "cooperative strategy",
          "defect strategy",
          "dominant strategy",
          "altruism",
          "economic decision-makers",
          "social preferences",
          "inequality aversion",
          "spite",
          "envy",
          "budgeting decision",
          "national lottery",
          "altruistic preferences",
          "self-interested preferences",
          "feasible set",
          "budget constraint",
          "marginal rate of substitution (MRS)",
          "marginal rate of transformation (MRT)",
          "Cobb–Douglas utility",
          "constrained choice problem",
          "mathematical solution",
          "partial differentiation",
          "first-order condition",
          "pest control game",
          "dominant strategy equilibrium",
          "cooperative equilibria",
          "prisoners’ dilemma",
          "Homo economicus",
          "invisible hand",
          "The Theory of Moral Sentiments",
          "Mathematical Psychics",
          "acts of bravery or kindness",
          "favourable reputation",
          "economic games",
          "aversion to inequality",
          "payoff matrix",
          "game theory",
        ],
        url: "04-strategic-interactions-07-social-preferences.html",
      },
      {
        title: "4.10 Cooperation, negotiation, and conflicts of interest",
        key_words: [
          "Cooperation",
          "Pareto efficient",
          "Prisoners’ dilemma",
          "Negotiation",
          "Montreal Protocol",
          "Chlorofluorocarbons (CFCs)",
          "Ozone layer",
          "Bargaining",
          "Research assistant",
          "Trade union",
          "Working practices",
          "Housemates",
          "Chores",
          "Political instability",
          "Bargaining problem",
          "Social norms",
          "Social preferences",
          "Public good games",
          "Conflict of interest",
          "Possession is nine-tenths of the law",
          "Finders, keepers",
          "Losers, weepers",
          "Altruism",
          "Inequality aversion",
          "Fairness",
          "Reciprocal preferences",
          "Metal detecting",
          "Roman coins",
        ],
        url: "04-strategic-interactions-10-cooperation-negotiation-conflicts.html",
      },
      {
        title: "4.12 Fair farmers, self-interested students? Experimental results of the ultimatum game",
        key_words: [
          "Inequality aversion",
          "Social debt",
          "Ultimatum game",
          "Economic experiments",
          "Ethnographic evidence",
          "Fairness",
          "Reciprocity",
          "Social norms",
          "Expected pay-off",
          "Strategic interactions",
          "Economic model",
          "Uncertain outcomes",
          "Warranty decision making",
          "Preferences variation",
          "Costly punishment",
          "Public good game",
          "Rent sharing in economic interactions",
          "Negotiation affected by competition",
          "Laboratory evidence on offer rejection",
          "Self-interest in economic decisions",
          "Calculating expected pay-offs",
        ],
        url: "04-strategic-interactions-12-experimental-results.html",
      },
    ],
  },
  {
    chapter: "Doing the best you can: Scarcity, wellbeing, and working hours",
    subSections: [
      {
        title: "3.6 Hours of work and technological progress",
        key_words: [
          "Productivity of labour",
          "Bargaining power",
          "Wages",
          "Labour productivity",
          "Technological revolution",
          "Working hours",
          "Living standards",
          "Economic needs",
          "Leisure time",
          "Technological progress",
          "Model of constrained choice",
          "Income",
          "Consumption",
          "Budget constraint",
          "Utility-maximizing choice",
          "Feasible set",
          "Indifference curve",
          "Marginal rate of substitution (MRS)",
          "Marginal rate of transformation",
          "Income effect",
          "Substitution effect",
          "Opportunity cost",
          "Preferences",
        ],
        url: "03-scarcity-wellbeing-06-hours-technological-progress.html",
      },
      {
        title: "3.14 References",
        key_words: ["CORE Econ", "Fact checker", "sources"],
        url: "03-scarcity-wellbeing-14-references.html",
      },
      {
        title: "3.7 Income and substitution effects on hours of work and free time",
        key_words: [
          "constrained choice model",
          "wage rise",
          "living standards",
          "utility",
          "hours of work",
          "opposing effects",
          "summer break planning",
          "local shop work",
          "consumption",
          "free time",
          "budget constraint",
          "feasible set",
          "slope of the budget constraint",
          "marginal rate of transformation (MRT)",
          "opportunity cost",
          "preferences",
          "indifference curves",
          "feasible frontier",
          "marginal rate of substitution (MRS)",
          "unearned income",
          "income effect",
          "substitution effect",
          "utility-maximizing combination",
          "wage increase",
          "calculus method",
          "numerical method",
          "partial derivatives",
          "marginal utilities",
          "simultaneous equations",
          "infinitesimal increase",
          "utility function",
          "decomposition into income and substitution effects",
        ],
        url: "03-scarcity-wellbeing-07-income-substitution-effects.html",
      },
      {
        title: "3.2 A problem of choice and scarcity",
        key_words: [
          "scarcity",
          "opportunity cost",
          "economic decision-making",
          "goods",
          "free time",
          "model of decision-making",
          "wage",
          "preferences",
          "circumstances",
          "living costs",
          "social life",
          "income",
          "production function",
          "working hours",
          "consumption",
          "consumer goods",
          "consumer durables",
          "Cartesian coordinate system",
          "x-axis",
          "y-axis",
          "linear relationship",
        ],
        url: "03-scarcity-wellbeing-02-choice-and-scarcity.html",
      },
      {
        title: "3.12 Explaining our working hours: Differences between countries",
        key_words: [
          "GDP per capita",
          "annual hours of free time",
          "household disposable income",
          "disposable income",
          "profit",
          "interest",
          "rent",
          "labour earnings",
          "government transfers",
          "taxes",
          "wealth",
          "annual free time",
          "average wage",
          "free time per day",
          "daily consumption",
          "working hours",
          "wages",
          "consumption",
          "preferences for consumption and free time",
          "inequality",
          "participation of women in the labour market",
          "social and cultural factors",
          "support for childcare",
          "budget constraint",
          "substitution effect",
          "income effect",
          "indifference curves",
          "marginal rate of substitution",
          "isoquant curves",
          "utility levels",
          "work-life balance",
        ],
        url: "03-scarcity-wellbeing-12-differences-between-countries.html",
      },
      {
        title: "3.11 Explaining our working hours: Gender and working time",
        key_words: [
          "Gender wage gap",
          "Paid work",
          "Unpaid work",
          "Labour market discrimination",
          "Equal pay laws",
          "Substitution effect",
          "Income effect",
          "Gender division of labour",
          "Child penalty",
          "Time use studies",
          "Household preferences",
          "Hours of non-working time",
          "Hours of paid work",
          "Budget constraint",
          "Marginal rate of substitution",
          "Feasible set",
          "Wage discrimination",
          "Educational opportunities for women",
          "Labour market discrimination laws",
          "Domestic appliances",
          "Unpaid care work",
          "Impact of domestic technology",
          "Supply and demand diagram",
        ],
        url: "03-scarcity-wellbeing-11-gender-working-time.html",
      },
      {
        title: "3.5 Decision-making and scarcity",
        key_words: [
          "Karim's preferences",
          "consumption and free time combinations",
          "feasible set",
          "decision-making about hours of work",
          "feasible frontier",
          "indifference curves",
          "utility maximization",
          "marginal rate of substitution (MRS)",
          "marginal rate of transformation (MRT)",
          "constrained choice problem",
          "budget constraint",
          "objective function",
          "inequality constraint",
          "mathematical substitution method",
          "product rule for differentiation",
          "first-order condition",
          "second-order condition",
          "utility function",
          "economic models",
          "calculus for solving economic models",
          "trade-offs",
          "income effect",
          "consumer choice theory",
          "opportunity costs",
          "preferences and budget limitations",
        ],
        url: "03-scarcity-wellbeing-05-decision-making-scarcity.html",
      },
      {
        title: "3.1 Would you work fewer hours if your hourly wage doubled?",
        key_words: [
          "Economic decisions",
          "Opportunity costs",
          "Economic rents",
          "Incentives",
          "Economic models",
          "Technological progress",
          "Industrial Revolution",
          "Real hourly earnings",
          "Legislation",
          "Maximum working hours",
          "Annual earnings",
          "Per capita GDP",
          "Profits",
          "Interest on savings",
          "Maddison Project Database",
          "OECD Productivity database",
          "GDP per capita",
          "Model of choice",
        ],
        url: "03-scarcity-wellbeing-01-work-fewer-hours.html",
      },
      { title: "3.13 Summary", url: "03-scarcity-wellbeing-13-summary.html" },
      {
        title: "3.3 Goods and preferences",
        key_words: [
          "free time",
          "total consumption spending",
          "goods",
          "market goods",
          "clean air",
          "preferences",
          "utility",
          "indifference curve",
          "consumer good",
          "consumer durables",
          "marginal rate of substitution (MRS)",
          "marginal rate of transformation",
          "convex preferences",
          "Cobb–Douglas function",
          "marginal utility",
          "marginal change",
          "utility function",
        ],
        url: "03-scarcity-wellbeing-03-goods-and-preferences.html",
      },
      {
        title: "3.9 Explaining our working hours: Changes over time",
        key_words: [
          "British worker work days in 1600",
          "Industrial Revolution",
          "Wage increase",
          "Working time increase",
          "US work hours increase post-Industrial Revolution",
          "Abolition of slavery in the US",
          "Decrease in working hours",
          "Annual working hours per worker (1870–2017)",
          "Ceteris paribus assumption",
          "Income effect",
          "Substitution effect",
          "Real wage",
          "Budget constraints",
          "Indifference curves",
          "Labor supply and consumption model",
          "OECD average annual hours worked",
          "Household disposable income",
          "Working hours and wages in Britain before 1870",
          "Twentieth-century wage and working hours trends",
          "Declining role of work in high-income economies",
          "Robert William Fogel's estimates on lifetime work and leisure hours",
          "The Fourth Great Awakening and the Future of Egalitarianism",
          "Economic model application to historical change",
          "Labor-leisure trade-off",
          "Technological revolution's impact on work and leisure",
        ],
        url: "03-scarcity-wellbeing-09-changes-over-time.html",
      },
      {
        title: "3.8 Is this a good model?",
        key_words: [
          "consumption spending",
          "free time",
          "indifference curves",
          "budget constraint",
          "utility-maximizing choice",
          "feasible frontier",
          "MRT (Marginal Rate of Transformation)",
          "MRS (Marginal Rate of Substitution)",
          "economic models",
          "ceteris paribus",
          "preferences",
          "feasible set",
          "average wage",
          "representative worker",
          "wages and working hours",
          "government regulation of working hours",
          "trade unions",
          "overtime rates",
          "culture and working hours",
          "politics and working hours",
          "legal limits on working time",
          "employment contracts",
          "working hours and democracy",
          "working hours and trade union bargaining",
          "model quality and insight",
        ],
        url: "03-scarcity-wellbeing-08-a-good-model.html",
      },
      {
        title: "3.4 The feasible set",
        key_words: [
          "Karim's preferences",
          "consumption spending",
          "free time",
          "working for a wage",
          "opportunity cost",
          "budget constraint",
          "feasible set",
          "feasible frontier",
          "marginal rate of transformation (MRT)",
          "income",
          "productivity",
          "production function",
          "effective hourly wage",
          "optimization",
          "linear programming",
          "economics",
          "trade-off",
          "allocation of time and resources",
          "consumer behavior",
          "work-leisure trade-offs",
        ],
        url: "03-scarcity-wellbeing-04-feasible-set.html",
      },
      {
        title: "3.10 Application: Work hours, free time, and inequality",
        key_words: [
          "effect of wage increase on working hours",
          "opportunity cost of free time",
          "value of free time versus goods",
          "sustainability of environment",
          "annual working hours per worker",
          "consumption habits",
          "MRS (Marginal Rate of Substitution)",
          "income inequality",
          "conspicuous consumption",
          "Veblen effect",
          "luxury consumption",
          "public bad",
          "income transparency",
          "subjective wellbeing",
          "voting rights and work hours",
          "political, cultural, and economic influences",
          "industrial capitalism",
          "balance of power between employers and employees",
          "technological advances and work hours",
          "productivity dividend",
          "ecological impact",
          "carbon footprint",
          "carbon dioxide emissions",
          "greenhouse gases",
        ],
        url: "03-scarcity-wellbeing-10-hours-free-time-inequality.html",
      },
    ],
  },
  {
    chapter: "Technology and incentives",
    subSections: [
      {
        title: "2.10 Growth: Escaping the Malthusian trap",
        key_words: [
          "Labour-saving technologies",
          "Energy-intensive technologies",
          "Innovation incentives",
          "Production in firms",
          "Market expansion",
          "Specialization",
          "Division of labour",
          "Average product of labour",
          "Population growth",
          "Productivity growth",
          "Real wages",
          "Malthusian trap",
          "Escape from Malthusian trap",
          "Technological revolution",
          "Spinning jenny",
          "Steam engine",
          "Urban unemployment",
          "Workers' power",
          "Surge in profits",
          "Demand for labour",
          "Labour market regulation",
          "Trade unions",
          "Industrial Revolution",
          "Rising living standards",
          "Biological scarcity",
          "Technological productivity",
          "Institutions and policies",
          "Black Death",
          "GDP per capita",
          "Political movements",
          "Chartism",
          "British Labour Party",
          "Economic transformation",
          "Capital goods",
          "Factory production",
          "Labour supply",
          "Extension of the right to vote",
        ],
        url: "02-technology-incentives-10-malthusian-trap.html",
      },
      {
        title: "2.11 Capitalism + carbon = hockey stick growth + climate change",
        key_words: [
          "Industrial Revolution",
          "photosynthesis",
          "fossil fuels",
          "coal",
          "Malthusian trap",
          "per capita income",
          "surface temperature of the earth",
          "carbon plus capitalism",
          "climate change",
          "technological revolution",
          "workers' power",
          "wages",
          "trade unions",
          "political parties",
          "labour-saving innovations",
          "natural resources",
          "biosphere",
          "CO2 emissions",
          "greenhouse gases",
          "ocean acidity",
          "stock and flow of CO2",
          "deforestation",
          "methane",
          "nitrous oxide",
          "global warming",
          "renewable energy",
          "energy poverty",
          "low-carbon electricity",
          "carbon tax",
          "photovoltaic cells",
          "solar energy",
          "wind energy",
          "lithium-ion batteries",
          "government policies",
          "subsidies",
          "scientific advances",
          "solar cell materials",
          "panel designs",
          "environmental destruction",
          "energy use",
          "GDP per capita",
          "renewables vs fossil fuels cost comparison",
        ],
        url: "02-technology-incentives-11-capitalism-climate-change.html",
      },
      { title: "2.13 Summary", url: "02-technology-incentives-13-summary.html" },
      {
        title:
          "2.9 Markets, cheap calories, and cotton: The colonies, slavery, and the Industrial Revolution in Britain",
        key_words: [
          "Industrial Revolution",
          "global manufacturing production",
          "textiles",
          "cotton textiles",
          "technology",
          "raw material",
          "enslaved Africans",
          "overseas markets",
          "textile industry",
          "coal",
          "steam engine",
          "global geopolitics",
          "manufactured goods",
          "comparative advantage",
          "calories",
          "sugar",
          "slave plantations",
          "colonies",
          "slavery",
          "counterfactual",
          "Kenneth Pomeranz",
          "The Great Divergence",
          "arable land",
          "price of food",
          "wages",
          "US Civil War",
          "woollen textiles",
          "crop and pasture land",
          "rate of profit",
          "machinery",
          "output per hour of labour",
          "indigenous population",
          "European-borne disease",
          "military force",
          "British colonial rule",
          "manufacturing centres",
          "Nathan Nunn",
          "Atlantic slave trade",
          "poverty in Africa",
          "Malthusian trap",
          "private property",
          "markets",
          "firms competing for profits",
          "capitalism",
          "colonial domination",
          "Karl Marx",
          "modern industry",
          "Gavin Wright",
          "economic historian",
        ],
        url: "02-technology-incentives-09-industrial-revolution-colonies.html",
      },
      {
        title: "2.5 Modelling a dynamic economy: Technology and costs",
        key_words: [
          "Industrial Revolution",
          "non-renewable energy",
          "labour productivity",
          "machines",
          "coal",
          "technologies",
          "labour (number of workers)",
          "energy (tons of coal)",
          "fixed-proportions technologies",
          "constant returns to scale",
          "input requirements",
          "energy-intensive technology",
          "labour-intensive technology",
          "labour-saving technology",
          "dominated technologies",
          "profit maximization",
          "relative prices",
          "wage",
          "price of coal",
          "cost of production",
          "isocost lines",
          "economic model",
          "slope of the isocost line",
          "relative price of labour and energy",
          "piecewise function",
          "Cartesian coordinate system",
          "linear functions",
          "geometric problem",
          "system of linear inequalities or equations",
          "probability distribution",
          "uniform distribution",
          "histogram",
          "supply and demand graph",
          "consumer surplus",
          "producer surplus",
          "economic model",
          "cost analysis",
          "budget constraints",
          "indifference curves",
        ],
        url: "02-technology-incentives-05-technology-costs.html",
      },
      {
        title: "2.6 Modelling a dynamic economy: Innovation and profit",
        key_words: [
          "change in relative prices of labour and energy",
          "slope of the firm’s isocost lines",
          "least-cost technology",
          "price of coal",
          "wage",
          "energy-intensive technology",
          "isocost curve",
          "slope of the isocost line",
          "relative price of labour",
          "cost of production",
          "profits",
          "economic rent",
          "entrepreneur",
          "Schumpeterian rents",
          "innovation rents",
          "creative destruction",
          "suit-making technologies",
          "tailor-skilled labour",
          "non-tailor-skilled labour",
          "Joseph Schumpeter",
          "capitalism",
          "evolutionary economics",
          "economic modelling",
          "entrepreneurship and innovation",
          "Science and Ideology",
          "Ten Great Economists",
          "Capitalism, Socialism, and Democracy",
          "Austro-Hungarian Empire",
          "Third Reich",
          "First World War",
          "Great Depression",
          "march into socialism",
          "economic affairs",
          "private and public sphere",
          "greatest economist",
          "greatest horseman in Austria",
          "best lover in Vienna",
          "decentralized process",
          "productivity growth",
          "economic upswings and downswings",
          "Journal of Evolutionary Economics",
        ],
        url: "02-technology-incentives-06-innovation-profit.html",
      },
      {
        title: "2.12 How good is the model? Economists, historians, and the Industrial Revolution",
        key_words: [
          "Industrial Revolution",
          "capitalist economy",
          "labour productivity",
          "world economy",
          "raw material inputs",
          "scientific causes",
          "cultural causes",
          "sociological causes",
          "textiles",
          "steel industry",
          "heavy industries",
          "capitalist economic system",
          "traditional Japanese institutions",
          "income inequality",
          "economic growth",
          "Protestant Reformation",
          "Renaissance",
          "scientific revolution",
          "private property rights",
          "government policies",
          "colonialism",
          "slavery",
          "practical creativity",
          "rule of law",
          "cotton production",
          "sugar production",
          "British colonies",
        ],
        url: "02-technology-incentives-12-how-good-is-the-model.html",
      },
      {
        title:
          "2.7 Cheap coal, expensive labour: The Industrial Revolution in Britain and incentives for new technologies",
        key_words: [
          "Eve Fisher",
          "Industrial Revolution",
          "weaving",
          "spinning",
          "clothes making",
          "spinning jenny",
          "spinning mule",
          "water wheels",
          "coal-powered steam engines",
          "energy-intensive technology",
          "labour-intensive technology",
          "relative costs of inputs",
          "innovation rents",
          "cloth producers",
          "British Industrial Revolution",
          "wages relative to the price of energy",
          "wages relative to the cost of capital goods",
          "technological progress",
          "labour-saving technology",
          "energy-saving technology",
          "wage growth",
          "falling energy costs",
          "capitalist revolution",
          "isocost lines",
          "cottage mode of production",
          "factory mode of production",
          "cotton production",
          "spinning wheel",
          "James Hargreaves",
          "rate of return",
          "international trade",
          "British imperialism",
          "manufactured exports",
          "labour markets",
          "mechanised spinning equipment",
        ],
        url: "02-technology-incentives-07-industrial-revolution-technologies.html",
      },
      {
        title: "2.1 Kutesmart automates personalized tailoring",
        key_words: [
          "Improvements in technology",
          "Growth in living standards",
          "Technological revolution",
          "Made-to-measure men’s suits",
          "Cutting-edge software",
          "Computer-literate workers",
          "Automation",
          "Coordinates measuring",
          "Digitally savvy workers",
          "Computer-controlled cutting machines",
          "Labour time reduction",
          "Custom-made suits",
          "Software business",
          "Spinning jenny",
          "Industrial Revolution",
          "Spinning",
          "Weaving",
          "Flying shuttle",
          "Coal",
          "Malthusian trap",
          "Nassau Senior",
          "Malthus’s vicious circle of poverty",
          "Demographic transition",
          "Real wages",
          "Labour-saving technology",
          "Steam engine",
          "Economic concepts",
          "Real wage index",
          "Population growth",
        ],
        url: "02-technology-incentives-01-kutesmart-tailoring.html",
      },
      {
        title: "2.3 Comparative advantage, specialization, and markets",
        key_words: [
          "Industrial Revolution",
          "manufacturing",
          "technology",
          "output per worker",
          "farming",
          "Malthusian trap",
          "comparative advantage",
          "specialization",
          "division of labour",
          "Adam Smith",
          "The Wealth of Nations",
          "goods and services",
          "absolute advantage",
          "opportunity cost",
          "self-sufficiency",
          "trade",
          "markets",
          "firms",
          "productivity",
          "capitalism",
          "competition",
          "cooperation",
          "global scale",
          "government",
          "household chores",
          "gender roles",
          "pin factory",
          "Kutesmart",
          "made-to-measure garments",
          "capital goods",
          "OEC website",
          "exports",
          "imports",
        ],
        url: "02-technology-incentives-03-comparative-advantage.html",
      },
      {
        title: "2.2 Economic decisions: Opportunity costs, economic rents, and incentives",
        key_words: [
          "decisions by individuals",
          "decisions by firms",
          "decisions by governments",
          "costs and benefits analysis",
          "net benefit",
          "opportunity cost",
          "economic cost",
          "economic rent",
          "reservation option",
          "direct costs",
          "monetary costs",
          "innovation rent",
          "incentive",
          "disincentive",
          "relative price",
          "Industrial Revolution",
          "material gain",
          "ethical considerations",
          "price ratio",
          "legislation on tuition fees",
          "accounting perspective vs economic perspective",
        ],
        url: "02-technology-incentives-02-economic-decisions.html",
      },
      {
        title: "2.14 References",
        key_words: ["CORE Econ", "Fact checker", "sources"],
        url: "02-technology-incentives-14-references.html",
      },
      {
        title: "2.8 Economic models: How to see more by looking at less",
        key_words: [
          "Economic outcomes",
          "Goods and services",
          "Distribution of incomes",
          "Economic actors",
          "Models",
          "Opportunity cost",
          "Malthusian model",
          "Industrial Revolution",
          "Mathematical representations",
          "Equations",
          "Physical models",
          "Hydraulic apparatus",
          "Economic equilibrium",
          "Equilibrium",
          "External force",
          "Endogenous variables",
          "Exogenous variables",
          "Ceteris paribus",
          "Mathematical relationships",
          "Equations and graphs",
          "Assumptions",
          "Predictions",
          "Evidence",
          "Technology choice",
          "Public transport network",
          "Market for umbrellas",
          "Study behaviour",
          "Grade point average (GPA)",
          "Study time",
          "Study environment",
          "Deliberate practice",
          "Academic performance",
        ],
        url: "02-technology-incentives-08-economic-models.html",
      },
      {
        title: "2.4 Firms, technology, and production",
        key_words: [
          "Firms",
          "Capital goods",
          "Workers",
          "Goods and services",
          "Production technology",
          "Inputs",
          "Raw materials",
          "Output",
          "Olive oil production",
          "Labour-intensive technology",
          "Capital-intensive technology",
          "Factors of production",
          "Production function",
          "Agricultural output",
          "Fixed-proportions technology",
          "Constant returns to scale",
          "Robotic technology",
          "Average product",
          "Energy–labour ratio",
          "Industrial Revolution",
          "Variable-proportions technology",
          "Mathematical properties",
          "Calculus",
          "Differentiation",
          "Diminishing average product of labour",
          "Marginal product of labour",
          "Concave production function",
          "Quotient rule",
          "Three-dimensional surface plot",
          "Linear regression",
          "Data visualization",
          "Nonlinear progression",
        ],
        url: "02-technology-incentives-04-firms-technology-production.html",
      },
    ],
  },
];
function isValidJSON(jsonString: string) {
  try {
    JSON.parse(jsonString);
    return true;
  } catch (error) {
    return false;
  }
}

const improverPrompt = `
Given your previous complex, nested, and truncated JSON response, generate a JSON object with detailed instructions to complete your previous truncated JSON response by implementing the following actions on it:

**Output:**
A JSON object with the following structure:
{
  "actions": [An array of actions to complete the JSON response. Each element of this array should be an object with the following structure: 
    { 
      "action": "replace or add", 
      "type": "type of incompleteness (e.g., 'missing value', 'missing subfield', 'incomplete value', 'incomplete subfield')", 
      "reason": "Explain why you think this field or sub-field is incomplete.", 
      "location": "location of the field or subfields in the JSON object", 
      "value": "value to replace or add"
    }
  ]
}

**Actions:**
- \`replace\`: If a field or subfield already exists but its value is incomplete, you should recommend a \`replace\` action to replace the existing value of a field with a more complete value at the specified location in your previous JSON response.
- \`add\`: If a field or subfield is missing, you should recommend an \`add\` action to add a new field and its corresponding value at the specified location in your previous JSON response to expand it.

Important rules:
- Do not add new field names to the JSON object that did not exist in the original JSON object data structure.
- You can add and replace all the fields that are used in the original data structure.
- Only recommend the addition or replacement of fields at the end of the JSON string; do not recommend modifications to fields in the middle of the JSON string.
- For arrays, use \`.last\` to specify the last element in the array.

###Example input:

\`\`\`json
{
  "users": 
  [
    {
      "id": 1,
      "name": "Jeff Smith",
      "address": {
        "street": "789 State St",
        "city": "Ann Arbor",
        "state": "MI",
        "zip": "48104",
        "country": "US"
      },
      "contacts": [
        {
          "type": "email",
          "value": "jeff.smith@gmail.com"
        },
        {
          "type": "phone",
          "value": "+1234567890"
        }
      ],
      "settings": {
        "theme": "dark",
        "notifications": {
          "email": true,
          "sms": false
        },
        "preferences": [
          {
            "currency": "EURO",
            "measurementSystem": "imperial"
          }
        ],
        "language": "en",
      },
      "additionalInfo": {
        "lastUpdated": "2024-06-28T12:00:00Z"
      }
    },
    {
      "id": 1,
      "name": "John Doe",
      "address": {
        "street": "123 Main St",
        "city": "Chicago",
        "state": "IL",
        "zip": "60601",
        "country": "US"
      },
      "contacts": [
        {
          "type": "email",
          "value": "john.doe@gmail.com"
        },
        {
          "type": "phone",
          "value": "+1234567890"
        }
      ],
      "settings": {
        "theme": "light",
        "notifications": {
          "email": true,
          "sms": true
        },
        "preferences": [
          {
            "currency": "US"
          }
        ]
      }
    }
  ]
}
\`\`\`

###Example output:

\`\`\`json
{
  "actions": [
    { 
      "action": "replace"
      "type": "incomplete value", 
      "reason": "The 'currency' has the value of 'US' that is missing the last 'D'.", 
      "location": "users.last.settings.preferences.currency", 
      "value": "USD"
    },
    { 
      "action": "add",
      "type": "missing subfield", 
      "reason": "In consistency with the previous user object, the 'preferences' should have another subfield 'measurementSystem'.",
      "location": "users.last.settings.preferences.measurementSystem", 
      "value": "metric"
    },
    {
      "action": "add",
      "type": "missing subfield",
      "reason": "In consistency with the previous user object, the 'settings' object is missing the 'language' field.",
      "location": "users.last.settings.language",
      "value": "en"
    },
    {
      "action": "add",
      "type": "missing subfield",
      "reason": "In consistency with the previous user object, the last user object is missing the 'additionalInfo' field.",
      "location": "users.last.additionalInfo",
      "value": {
        "lastUpdated": "2024-06-28T12:00:00Z"
      }
    }
  ],
}
\`\`\`
IMPORTANT Note that you should always:
- Start your recommendations with a "replace" action.
- Recommend a 'replace' action if the field or subfield already exists but its value is incomplete. DO NOT recommend an 'add' action in this case. Replacing the whole value of a field with existing subfields is forbidden.
- Start from the most inner sub-fields to make the changes. In the above example, the 'currency' field is the most inner sub-field that needs to be replaced, So, instead of replacing the "preferences" or "settings" object, you should start from the "currency" field.
The input JSON object may have multiple nested levels, and your task is to ensure that only the incomplete or missing fields at the end of these levels are addressed.
Your goal is to generate a similar output JSON object containing the actions needed to complete and expand your previous JSON response. Analyze the structure, identify missing or incomplete fields, and provide the necessary \`replace\` and \`add\` actions. Remember, you can only use field names that already exist in your previous JSON response object.
Please take your time and carefully generate only a JSON response.
`;

type Action = {
  action: "replace" | "add";
  location: string;
  value: any;
};

type LLMResponse = {
  actions: Action[];
};

export const applyImprovementInstructions = (originalJsonString: string, llmResponse: LLMResponse): any => {
  const updatedJson = JSON.parse(originalJsonString);

  for (const action of llmResponse.actions) {
    const { action: actionType, location, value } = action;
    const pathSegments = location.split(/[\.\[\]]/).filter(segment => segment !== "");
    let current: any = updatedJson;

    // Traverse the JSON object to the parent of the target field
    for (let i = 0; i < pathSegments.length - 1; i++) {
      const segment = pathSegments[i];
      const index = segment === "last" ? current.length - 1 : parseInt(segment, 10);
      if (!isNaN(index)) {
        if (!Array.isArray(current) || index >= current.length) {
          return new Error(`Invalid array index '${segment}' in path`);
        }
        current = current[index];
      } else {
        if (!(segment in current)) {
          current[segment] = {}; // Create missing path segments as empty objects
        }
        current = current[segment];
      }
    }

    const finalSegment = pathSegments[pathSegments.length - 1];
    const finalIndex = finalSegment === "last" ? current.length - 1 : parseInt(finalSegment, 10);

    if (actionType === "replace") {
      if (!isNaN(finalIndex)) {
        if (!Array.isArray(current) || finalIndex >= current.length) {
          return new Error(`Invalid array index '${finalSegment}' in path for replace action`);
        }
        current[finalIndex] = value;
      } else {
        if (!(finalSegment in current)) {
          return new Error(`Field '${finalSegment}' not found for replace action`);
        }
        current[finalSegment] = value;
      }
    } else if (actionType === "add") {
      if (!isNaN(finalIndex)) {
        if (!Array.isArray(current)) {
          return new Error(`Path segment '${finalSegment}' is not an array for add action`);
        }
        current.splice(finalIndex + 1, 0, value); // Add after the last element
      } else {
        if (finalSegment in current) {
          if (Array.isArray(current[finalSegment])) {
            current[finalSegment].push(value); // Append to array
          } else if (typeof current[finalSegment] === "object") {
            Object.assign(current[finalSegment], value); // Merge objects
          } else {
            return new Error(`Field '${finalSegment}' already exists for add action and is not an object or array`);
          }
        } else {
          current[finalSegment] = value;
        }
      }
    } else {
      return new Error(`Invalid action type '${actionType}'`);
    }
  }

  return updatedJson;
};

export const completeJsonString = (truncatedJson: string): string => {
  const removeTrailingIncompleteElements = (jsonStr: string): string => {
    // Remove trailing commas, incomplete elements, and whitespace
    return jsonStr
      .replace(/,\s*([}\]])/g, "$1")
      .replace(/,\s*$/, "")
      .trim();
  };

  const fixUnclosedStrings = (jsonStr: string): string => {
    // Find all occurrences of unclosed strings and fix them
    const stringPattern = /"(?:\\.|[^"\\])*$/;
    const match = jsonStr.match(stringPattern);
    if (match) {
      const index = match.index;
      if (index !== undefined) {
        jsonStr = jsonStr.slice(0, index) + '"';
      }
    }
    return jsonStr;
  };

  const handleIncompleteFieldNames = (jsonStr: string): string => {
    // Remove incomplete field names
    const fieldPattern = /"[^"]*$|:[^,\}\]]*$/;
    const match = jsonStr.match(fieldPattern);
    if (match) {
      const index = match.index;
      if (index !== undefined) {
        jsonStr = jsonStr.slice(0, index).replace(/:$/, "").trim();
      }
    }
    return jsonStr;
  };

  const handleIncompleteQuotes = (jsonStr: string): string => {
    // Remove incomplete fields with starting double quote
    const quotePattern = /"[^"]*$/;
    const match = jsonStr.match(quotePattern);
    if (match) {
      const index = match.index;
      if (index !== undefined) {
        jsonStr = jsonStr.slice(0, index).trim();
      }
    }
    return jsonStr;
  };

  const handleTrailingCommas = (jsonStr: string): string => {
    // Remove trailing commas before incomplete fields
    const commaPattern = /,(?!\s*["\{\[])/g;
    const match = jsonStr.match(commaPattern);
    if (match) {
      const index = jsonStr.lastIndexOf(",");
      if (index !== -1) {
        jsonStr = jsonStr.slice(0, index).trim();
      }
    }
    return jsonStr;
  };

  const addMissingBrackets = (jsonStr: string): string => {
    const stack: string[] = [];
    let cleanedJson = jsonStr.trim();

    // Push opening brackets and braces to the stack
    for (const char of cleanedJson) {
      if (char === "{" || char === "[") {
        stack.push(char);
      } else if (char === "}" || char === "]") {
        stack.pop();
      }
    }

    // Append the necessary closing brackets and braces in the correct order
    while (stack.length) {
      const lastOpened = stack.pop();
      if (lastOpened === "{") {
        cleanedJson += "}";
      } else if (lastOpened === "[") {
        cleanedJson += "]";
      }
    }

    return cleanedJson;
  };

  try {
    // Try parsing the input directly first to check if it's already valid JSON
    return JSON.parse(truncatedJson);
  } catch (e) {
    // Continue with the completion process
  }

  // Step 1: Remove trailing incomplete elements
  let cleanedJson = removeTrailingIncompleteElements(truncatedJson);

  // Step 2: Fix unclosed strings
  cleanedJson = fixUnclosedStrings(cleanedJson);

  // Step 3: Handle incomplete field names
  cleanedJson = handleIncompleteFieldNames(cleanedJson);

  // Step 4: Handle incomplete quotes
  cleanedJson = handleIncompleteQuotes(cleanedJson);

  // Step 5: Handle trailing commas
  cleanedJson = handleTrailingCommas(cleanedJson);

  // Step 6: Add missing brackets
  cleanedJson = addMissingBrackets(cleanedJson);

  // Step 7: Try parsing the cleaned JSON
  try {
    JSON.parse(cleanedJson);
  } catch (e) {
    console.log("Truncated JSON:", truncatedJson);
    console.log("Completed JSON:", cleanedJson.slice(-250));
    throw new Error("Unable to complete and parse the JSON string.");
  }
  return cleanedJson;
};

export async function callOpenAIChat(files: File[] = [], userPrompt: string, systemPrompt: string = "") {
  let imageParts = [];
  if (files.length <= 0) {
    files.forEach((file, index) => {
      console.log(`File ${index} type:`, file.constructor.name)
    })

    const validFiles = files.filter((file) => file instanceof File)
    if (validFiles.length !== files.length) {
      console.error('Some objects are not File instances:', files)
      throw new Error('Some provided objects are not File instances')
    }
    console.log("validFiles", validFiles);
    imageParts = await Promise.all(validFiles.map(fileToGenerativePart));
  }

    const fileParts = await Promise.all(validFiles.map(fileToGenerativePart))

    let response = "";
    let finish_reason = "";
    let isJSONObject: { jsonObject: any; isJSON: boolean } = {
      jsonObject: {},
      isJSON: false,
    };
    for (let i = 0; i < 4; i++) {
      let completion: any = {};
      if (finish_reason === "length") {
        let improvedJSON: any = {};
        for (let j = 0; j < 4; j++) {
          try {
            completion = await openai.chat.completions.create({
              model: "gpt-4o",
              messages: [
                {
                  role: "user",
                  content: [
                    ...fileParts,
                    {
                      type: "text",
                      text: systemPrompt + "\n\n\n" + userPrompt,
                    },
                  ],
                },
                {
                  role: "assistant",
                  content: [
                    {
                      type: "text",
                      text: response,
                    },
                  ],
                },
                {
                  role: "user",
                  content: [
                    {
                      type: "text",
                      text: improverPrompt,
                    },
                  ],
                },
              ],
              temperature: 0,
              response_format: { type: "json_object" },
            });

            console.log("Original JSON:");
            console.log(response);
            console.log("RECOMMENDED IMPROVEMENTS:");
            console.log(completion.choices[0].message.content);

            improvedJSON = applyImprovementInstructions(response, JSON.parse(completion.choices[0].message.content));
            console.log("IMPROVED JSON:");
            console.log(improvedJSON);
            return improvedJSON;
          } catch (error) {
            console.error("Error in applyImprovementInstructions:", error);
          }
        }
      } else {
        completion = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "user",
              content: [
                ...imageParts,
                {
                  type: "text",
                  text: systemPrompt + "\n\n\n" + userPrompt,
                },
              ],
            },
            {
              role: "assistant",
              content: [
                {
                  type: "text",
                  text: response,
                },
              ],
            },
            {
              role: "user",
              content: [
                ...fileParts,
                {
                  type: "text",
                  text: improverPrompt,
                },
              ],
            },
          ],
          temperature: 0,
          response_format: { type: "json_object" },
        });

        console.log("Original JSON:");
        console.log(response);
        console.log("RECOMMENDED IMPROVEMENTS:");
        console.log(completion.choices[0].message.content);

        improvedJSON = applyImprovementInstructions(response, JSON.parse(completion.choices[0].message.content));
        console.log("IMPROVED JSON:");
        console.log(improvedJSON);
        return improvedJSON;
      }
    } else {
      completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: [
              {
                type: "text",
                text: systemPrompt,
              },
            ],
          },
          {
            role: "user",
            content: [
              ...imageParts,
              {
                type: "text",
                text: userPrompt,
              },
            ],
          },
        ],
        temperature: 0,
        response_format: { type: "json_object" },
      });
      response = completion.choices[0].message.content || "";
      isJSONObject.isJSON = isValidJSON(response);
      // console.log("\n\n\nThe completion object is:");
      // console.log(completion);
      finish_reason = completion.choices[0].finish_reason;
      if (isJSONObject.isJSON) {
        isJSONObject.jsonObject = JSON.parse(response);
        break;
      }
      console.log(
        `\nFailed to get a complete JSON object. The finish_reason is "${finish_reason}". Retrying for the ${
          i + 1
        } time.\n\n\n`
      );
      if (finish_reason !== "length") {
        console.log("Response: ", response);
      } else {
        response = completeJsonString(response);
        i--;
      }
    }
  }

  if (!isJSONObject.isJSON) {
    throw new Error("Failed to get a complete JSON object");
  }

  return isJSONObject.jsonObject;
}

export const generateImage = async (prompt: string) => {
  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt,
    n: 1,
    size: "1024x1024",
  });
  const image_url = response.data[0].url;
  return image_url;
};
