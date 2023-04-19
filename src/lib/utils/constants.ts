// import { NodeType } from "../../knowledgeTypes";

import { NodeType } from "src/types";

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
