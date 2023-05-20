import { NodeType } from "src/types";

export const ZINDEX = {
  assistant: 1500,
};
export const NODE_TYPE_OPTIONS: NodeType[] = [
  // NodeType.Advertisement,
  "Code",
  "Concept",
  "Idea",
  // NodeType.News,
  // NodeType.Private,
  // NodeType.Profile,
  "Question",
  "Reference",
  "Relation",
  // NodeType.Sequel,
];

export const GENDER_VALUES = ["Male", "Female", "Not listed (Please specify)", "Prefer not to say"];

export const ETHNICITY_VALUES = [
  "White / Caucasian",
  "Native American",
  "Asian",
  "African-American",
  "Hispanic or Latino",
  "Native Hawaiian or Pacific Islander",
  "Not listed (Please specify)",
  "Prefer not to say",
];

export const FOUND_FROM_VALUES = [
  "Online searching",
  "Word of Mouth",
  "Internship",
  "School",
  "Work",
  "Not listed (Please specify)",
  "Prefer not to say",
];

export const EDUCATION_VALUES = [
  "Doctoral degree (MD, Ph.D., ...)",
  "Current Doctoral student",
  "Master's degree (MS, MA, ME, MBA, MPH, ...)",
  "Current Master's student",
  "Bachelor's degree (BS, BA, BE, ...",
  "Current undergraduate student",
  "Prefer not to say",
];

// export const NODE_WIDTH = 580

export const NO_USER_IMAGE = "https://storage.googleapis.com/onecademy-1.appspot.com/ProfilePictures/no-img.png";

export const NARRATE_WORKER_TERMINATED = "narrate-worker-terminated";

export const QUESTION_OPTIONS = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
];

export const ASSISTANT_POSITIVE_SENTENCES: string[] = [
  "Great job! You nailed it!",
  "That's correct! You're on fire today!",
  "Well done! You really understood the concept!",
  "That's right! You're a star!",
  "Excellent! You're doing amazing!",
];
export const ASSISTANT_NEGATIVE_SENTENCES: string[] = [
  "That's okay. You can learn from your mistakes.",
  "Don't give up. You can do this!",
  "That's not quite right. Let's review the steps together.",
  "No worries. You're getting closer to the right answer.",
  "That's a good try. You just need to practice a bit more.",
];

export const CHOICES_GRAMMER: string = `
#JSGF V1.0;
   
grammar choicesGrammer;
    
public <choice> = a | b | c | d | e | f | g | h | i | j | k | l | repeat question;
`;

export const NEXT_GRAMMER: string = `
#JSGF V1.0;
   
grammar nextGrammer;
    
public <command> = open notebook | next;
`;

export const NOTEBOOK_GRAMMER: string = `
#JSGF V1.0;
   
grammar notebookGrammer;
    
public <command> = continue practicing | up | down | left | right;
`;

export const CONFIRMATION_GRAMMER: string = `
#JSGF V1.0;
   
grammar confirmationGrammer;
    
public <command> = correct | yes;
`;
export const ANSWERING_ERROR = "Please only tell me a, b, c, d, or a combination of them, such as a-b, b-d, or a-c-d.";
export const CONFIRM_ERROR = "Please only tell me yes or correct.";
export const NEXT_ACTION_ERROR = "Please only tell me Next or Open Notebook.";
export const OPEN_PRACTICE_ERROR = "Please only tell me continue practicing.";
