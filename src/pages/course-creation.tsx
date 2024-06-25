import AddIcon from "@mui/icons-material/Add";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import { LoadingButton } from "@mui/lab";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  keyframes,
  // LinearProgress,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  Slide,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";

import ChipInput from "@/components/ChipInput";
import AppHeaderMemoized from "@/components/Header/AppHeader";
import withAuthUser from "@/components/hoc/withAuthUser";
import ImageSlider from "@/components/ImageSlider";
import MarkdownRender from "@/components/Markdown/MarkdownRender";
import NodeTypeIcon from "@/components/NodeTypeIcon";
import { Post } from "@/lib/mapApi";

const COURSES = [
  {
    tags: ["Psychology", "Psychology @ OpenStax"],
    title: "Introduction to Psychology",
    description:
      "This course provides an in-depth look at the concepts, theories, and research methods in psychology. It covers various topics such as biological bases of behavior, cognition, development, personality, social psychology, and psychological disorders. The course aims to go beyond a comprehensive understanding of the field of psychology and its applications.",
    learners:
      "Undergraduate students with no prior background in psychology. The course is designed for students from various disciplines who are interested in understanding human behavior and mental processes.",
    references: ["Psychology (2nd ed.)"],
    courseObjectives: [
      "Understand the history and scope of psychology as a scientific discipline",
      "Identify and describe the major research methods used in psychology",
      "Explain the biological bases of behavior, including the structure and function of the nervous system",
      "Differentiate between sensation and perception and describe how they influence human experience",
      "Understand the principles of learning and memory and their applications",
      "Describe key cognitive processes such as thinking, problem-solving, and decision-making",
      "Outline the stages of human development and the factors that influence growth and change across the lifespan",
      "Identify major theories of personality and assess their contributions to understanding individual differences",
      "Recognize and describe various psychological disorders and their symptoms",
      "Understand the principles of social psychology, including group behavior, social influence, and interpersonal relationships",
      "Apply psychological principles to real-world situations and various professional fields",
      "Develop critical thinking skills by evaluating psychological research and theories",
      "Engage in discussions and practical activities to enhance understanding and application of psychological concepts",
    ],
    courseSkills: [
      "Understanding of psychological history and scope",
      "Knowledge of psychological research methods",
      "Comprehension of the biological bases of behavior",
      "Ability to differentiate between sensation and perception",
      "Understanding of learning and memory principles",
      "Knowledge of cognitive processes",
      "Insight into human developmental stages",
      "Familiarity with major personality theories",
      "Recognition of psychological disorders and symptoms",
      "Understanding of social psychology principles",
      "Application of psychological principles to real-world situations",
      "Critical evaluation of psychological research and theories",
      "Engagement in psychological discussions and practical activities",
    ],
    syllabus: [
      {
        category: "Foundations of Psychology",
        topics: [
          {
            topic: "History and Scope of Psychology",
            hours: 1,
            difficulty: "Easy",
            description:
              "An overview of the history, major schools of thought, and the scope of psychology as a scientific discipline.",
            skills: ["Understanding of psychological history and scope"],
          },
          {
            topic: "Research Methods in Psychology",
            hours: 1,
            difficulty: "Medium",
            description:
              "Introduction to the major research methods used in psychology, including experimental, correlational, and observational techniques.",
            skills: ["Knowledge of psychological research methods"],
          },
        ],
      },
      {
        category: "Biological Bases of Behavior",
        topics: [
          {
            topic: "Structure and Function of the Nervous System",
            hours: 1,
            difficulty: "Medium",
            description:
              "Understanding the biological bases of behavior, focusing on the structure and function of the nervous system.",
            skills: ["Comprehension of the biological bases of behavior"],
          },
        ],
      },
      {
        category: "Sensation and Perception",
        topics: [
          {
            topic: "Sensation and Perception",
            hours: 1,
            difficulty: "Medium",
            description:
              "Differentiating between sensation and perception and exploring how they influence human experience.",
            skills: ["Ability to differentiate between sensation and perception"],
          },
        ],
      },
      {
        category: "Learning and Memory",
        topics: [
          {
            topic: "Principles of Learning",
            hours: 1,
            difficulty: "Medium",
            description: "Exploring the principles of learning, including classical and operant conditioning.",
            skills: ["Understanding of learning principles"],
          },
          {
            topic: "Memory Processes",
            hours: 1,
            difficulty: "Medium",
            description: "Understanding the processes involved in memory, including encoding, storage, and retrieval.",
            skills: ["Understanding of memory principles"],
          },
        ],
      },
      {
        category: "Cognition",
        topics: [
          {
            topic: "Cognitive Processes",
            hours: 1,
            difficulty: "Medium",
            description: "Examining key cognitive processes such as thinking, problem-solving, and decision-making.",
            skills: ["Knowledge of cognitive processes"],
          },
        ],
      },
      {
        category: "Developmental Psychology",
        topics: [
          {
            topic: "Human Development",
            hours: 1,
            difficulty: "Medium",
            description:
              "Outlining the stages of human development and the factors that influence growth and change across the lifespan.",
            skills: ["Insight into human developmental stages"],
          },
        ],
      },
      {
        category: "Personality",
        topics: [
          {
            topic: "Theories of Personality",
            hours: 1,
            difficulty: "Medium",
            description:
              "Identifying major theories of personality and assessing their contributions to understanding individual differences.",
            skills: ["Familiarity with major personality theories"],
          },
        ],
      },
      {
        category: "Psychological Disorders",
        topics: [
          {
            topic: "Psychological Disorders",
            hours: 1,
            difficulty: "Medium",
            description: "Recognizing and describing various psychological disorders and their symptoms.",
            skills: ["Recognition of psychological disorders and symptoms"],
          },
        ],
      },
      {
        category: "Social Psychology",
        topics: [
          {
            topic: "Principles of Social Psychology",
            hours: 1,
            difficulty: "Medium",
            description:
              "Understanding the principles of social psychology, including group behavior, social influence, and interpersonal relationships.",
            skills: ["Understanding of social psychology principles"],
          },
        ],
      },
      {
        category: "Application and Integration",
        topics: [
          {
            topic: "Applying Psychological Principles",
            hours: 1,
            difficulty: "Medium",
            description: "Applying psychological principles to real-world situations and various professional fields.",
            skills: ["Application of psychological principles to real-world situations"],
          },
          {
            topic: "Critical Evaluation of Psychological Research",
            hours: 1,
            difficulty: "Medium",
            description: "Developing critical thinking skills by evaluating psychological research and theories.",
            skills: ["Critical evaluation of psychological research and theories"],
          },
          {
            topic: "Engagement in Psychological Discussions",
            hours: 1,
            difficulty: "Medium",
            description:
              "Engaging in discussions and practical activities to enhance understanding and application of psychological concepts.",
            skills: ["Engagement in psychological discussions and practical activities"],
          },
        ],
      },
    ],
  },
  {
    tags: ["Microbiology", "Microbiology @ OpenStax"],
    title: "Introduction to Microbiology",
    description:
      "This course provides an overview of microbiology, focusing on the structure, function, and genetics of microorganisms, as well as their roles in health, disease, and the environment. The course includes both theoretical and practical components, designed for undergraduate students with a basic background in biology.",
    learners:
      "Undergraduate students majoring in biology or related fields, with a basic understanding of general biology and chemistry.",
    references: ["OpenStax Microbiology Textbook"],
    syllabus: [
      {
        category: "Foundations of Microbiology",
        topics: [
          { topic: "History of Microbiology", hours: 1, difficulty: "Medium" },
          { topic: "Introduction to Microbial World", hours: 1, difficulty: "Medium" },
          { topic: "Microscopy and Staining Techniques", hours: 1, difficulty: "Medium" },
        ],
      },
      {
        category: "Microbial Structure and Function",
        topics: [
          { topic: "Prokaryotic Cell Structure", hours: 1, difficulty: "Medium" },
          { topic: "Eukaryotic Cell Structure", hours: 1, difficulty: "Medium" },
          { topic: "Microbial Metabolism", hours: 1, difficulty: "Medium" },
        ],
      },
      {
        category: "Microbial Genetics",
        topics: [
          { topic: "DNA Structure and Replication", hours: 1, difficulty: "Medium" },
          { topic: "Gene Expression and Regulation", hours: 1, difficulty: "Medium" },
          { topic: "Genetic Mutations and Transfer", hours: 1, difficulty: "Medium" },
        ],
      },
      {
        category: "Microbial Growth and Control",
        topics: [
          { topic: "Microbial Growth Phases", hours: 1, difficulty: "Medium" },
          { topic: "Factors Affecting Microbial Growth", hours: 1, difficulty: "Medium" },
          { topic: "Methods of Microbial Control", hours: 1, difficulty: "Medium" },
        ],
      },
      {
        category: "Microbial Interactions",
        topics: [
          { topic: "Microbiome and Human Health", hours: 1, difficulty: "Medium" },
          { topic: "Pathogenic Microorganisms", hours: 1, difficulty: "Medium" },
          { topic: "Symbiotic Relationships", hours: 1, difficulty: "Medium" },
        ],
      },
      {
        category: "Applied Microbiology",
        topics: [
          { topic: "Environmental Microbiology", hours: 1, difficulty: "Medium" },
          { topic: "Industrial Microbiology", hours: 1, difficulty: "Medium" },
          { topic: "Microbial Biotechnology", hours: 1, difficulty: "Medium" },
        ],
      },
      {
        category: "Laboratory Techniques",
        topics: [
          { topic: "Aseptic Technique", hours: 1, difficulty: "Medium" },
          { topic: "Culturing Microorganisms", hours: 1, difficulty: "Medium" },
          { topic: "Antibiotic Sensitivity Testing", hours: 1, difficulty: "Medium" },
        ],
      },
    ],
  },
  {
    tags: ["Economy", "Economics"],
    title: "Introduction to Microeconomics",
    description:
      "This course provides an introduction to the principles of microeconomics. Students will learn about the behavior of individuals and firms in making decisions regarding the allocation of scarce resources. Topics include supply and demand, elasticity, consumer behavior, production and costs, market structures, and welfare economics.",
    learners:
      "Undergraduate students in their first or second year, typically majoring in economics, business, or related fields.",
    references: ["CORE Econ - The Economy"],
    syllabus: [
      {
        category: "Basic Concepts",
        topics: [
          { topic: "Introduction to Microeconomics", hours: 1, difficulty: "Medium" },
          { topic: "Scarcity and Choice", hours: 1, difficulty: "Medium" },
          { topic: "Opportunity Cost", hours: 1, difficulty: "Medium" },
        ],
      },
      {
        category: "Supply and Demand",
        topics: [
          { topic: "Market Demand", hours: 1, difficulty: "Medium" },
          { topic: "Market Supply", hours: 1, difficulty: "Medium" },
          { topic: "Equilibrium Price and Quantity", hours: 1, difficulty: "Medium" },
          { topic: "Elasticity of Demand", hours: 1, difficulty: "Medium" },
          { topic: "Elasticity of Supply", hours: 1, difficulty: "Medium" },
        ],
      },
      {
        category: "Consumer Behavior",
        topics: [
          { topic: "Utility and Preferences", hours: 1, difficulty: "Medium" },
          { topic: "Budget Constraints", hours: 1, difficulty: "Medium" },
          { topic: "Consumer Choice", hours: 1, difficulty: "Medium" },
          { topic: "Demand Curve", hours: 1, difficulty: "Medium" },
        ],
      },
      {
        category: "Production and Costs",
        topics: [
          { topic: "Production Functions", hours: 1, difficulty: "Medium" },
          { topic: "Short-Run Costs", hours: 1, difficulty: "Medium" },
          { topic: "Long-Run Costs", hours: 1, difficulty: "Medium" },
        ],
      },
      {
        category: "Market Structures",
        topics: [
          { topic: "Perfect Competition", hours: 1, difficulty: "Medium" },
          { topic: "Monopoly", hours: 1, difficulty: "Medium" },
          { topic: "Monopolistic Competition", hours: 1, difficulty: "Medium" },
          { topic: "Oligopoly", hours: 1, difficulty: "Medium" },
        ],
      },
      {
        category: "Welfare Economics",
        topics: [
          { topic: "Economic Efficiency", hours: 1, difficulty: "Medium" },
          { topic: "Market Failure", hours: 1, difficulty: "Medium" },
          { topic: "Public Goods", hours: 1, difficulty: "Medium" },
          { topic: "Externalities", hours: 1, difficulty: "Medium" },
        ],
      },
    ],
  },
];
const glowGreen = keyframes`
  0% {
    box-shadow: 0 0 5px green, 0 0 10px green, 0 0 20px green, 0 0 30px green;
  }
  50% {
    box-shadow: 0 0 10px green, 0 0 20px green, 0 0 30px green, 0 0 40px green;
  }
  100% {
    box-shadow: 0 0 5px green, 0 0 10px green, 0 0 20px green, 0 0 30px green;
  }
`;
const glowRed = keyframes`
  0% {
    box-shadow: 0 0 5px red, 0 0 10px red, 0 0 20px red, 0 0 30px red;
  }
  50% {
    box-shadow: 0 0 10px red, 0 0 20px red, 0 0 30px red, 0 0 40px red;
  }
  100% {
    box-shadow: 0 0 5px red, 0 0 10px red, 0 0 20px red, 0 0 30px red;
  }
`;

const CourseComponent = () => {
  const [loadingDescription, setLoadingDescription] = useState(false);
  const [loadingObjectives, setLoadingObjectives] = useState(false);
  const [loadingSkills, setLoadingSkills] = useState(false);
  const [loadingCourseStructure, setLoadingCourseStructure] = useState(false);

  const [courses, setCourses] = useState(COURSES);
  const [displayCourses, setDisplayCourses] = useState(null);

  const [selectedCourse, setSelectedCourse] = useState<any>(0);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  // const [dialogOpenImp, setDialogOpenImp] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [newTopic, setNewTopic] = useState<any>("");
  const [difficulty, setDifficulty] = useState("medium");
  const [hours, setHours] = useState<number>(1);
  const [skills, setSkills] = useState([]);
  const [topicDescription, setTopicDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [improvements, setImprovements] = useState<any>([]);
  const [currentChangeIndex, setCurrentChangeIndex] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<any>(null);
  const [loadingNodes, setLoadingNodes] = useState(false);
  const [nodesPerTopic, setNodesPerTopic] = useState<{ [key: string]: any }>({});
  const [currentImprovement, setCurrentImprovement] = useState<any>({});
  const [expanded, setExpanded] = useState<string[]>([]);
  const [editTopic, setEditTopic] = useState<any>(null);
  const [expandedNode, setExpandedNode] = useState(null);
  const [isChanged, setIsChanged] = useState<string[]>([]);
  const [isRemoved, setIsRemoved] = useState<string[]>([]);
  const [createCourseModel, setCreateCourseModel] = useState(false);

  const [newCourseTitle, setNewCourseTitle] = useState("");
  const [newCourseLearners, setNewCourseLearners] = useState("");
  // const [topicImages /* , setTopicImages */] = useState<any>({
  //   "History and Approaches to Psychology":
  //     "https://firebasestorage.googleapis.com/v0/b/onecademy-1.appspot.com/o/ProfilePictures%2FgVfvxPaZVDNotP9ngdSvuKmZQxn2%2FSat%2C%2017%20Feb%202024%2018%3A39%3A23%20GMT_430x1300.jpeg?alt=media&token=c3b984b6-3c4e-451d-b891-fedd77b8c2f5",
  // });
  const topicImages: any = {
    "History and Approaches to Psychology":
      "https://firebasestorage.googleapis.com/v0/b/onecademy-1.appspot.com/o/ProfilePictures%2FgVfvxPaZVDNotP9ngdSvuKmZQxn2%2FSat%2C%2017%20Feb%202024%2018%3A39%3A23%20GMT_430x1300.jpeg?alt=media&token=c3b984b6-3c4e-451d-b891-fedd77b8c2f5",
  };

  const handleTitleChange = (e: any) => {
    const updatedCourses = [...courses];
    updatedCourses[selectedCourse] = {
      ...updatedCourses[selectedCourse],
      title: e.target.value,
    };
    setCourses(updatedCourses);
  };

  const handleDescriptionChange = (e: any) => {
    const updatedCourses = [...courses];
    updatedCourses[selectedCourse] = {
      ...updatedCourses[selectedCourse],
      description: e.target.value,
    };
    setCourses(updatedCourses);
  };

  const handleLearnersChange = (e: any) => {
    const updatedCourses = [...courses];
    updatedCourses[selectedCourse] = {
      ...updatedCourses[selectedCourse],
      learners: e.target.value,
    };
    setCourses(updatedCourses);
  };
  const handleRemoveTopic = (categoryIndex: number, topicIndex: number) => {
    const updatedCourses = [...courses];
    updatedCourses[selectedCourse].syllabus[categoryIndex].topics.splice(topicIndex, 1);
    setCourses(updatedCourses);
  };
  const handleOpenDialog = (categoryIndex: any) => {
    setSelectedCategory(categoryIndex);
    setDialogOpen(true);
  };
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedCategory(null);
    setEditTopic(null);
  };

  const handleSaveTopic = () => {
    const updatedCourses = [...courses];
    const topics = updatedCourses[selectedCourse].syllabus[selectedCategory].topics;
    if (editTopic) {
      const topicIndex = topics.findIndex(t => t.topic === editTopic.topic);

      if (topicIndex !== -1) {
        topics[topicIndex].topic = newTopic;
        topics[topicIndex].hours = hours;
        topics[topicIndex].difficulty = difficulty;
      }
    } else {
      topics.push({
        topic: newTopic,
        hours,
        difficulty,
        skills,
        description: topicDescription,
      });
    }

    setCourses(updatedCourses);
    handleCloseDialog();
    setNewTopic("");
    setHours(0);
    setDifficulty("");
  };
  interface Topic {
    topic: string;
    hours: number;
    difficulty: string;
  }

  interface Suggestion {
    action: string;
    type: string;
    category?: string | null;
    after?: string;
    new_topic?: Topic;
    old_topic?: string;
    new_topics?: Topic[];
    current_category?: string;
    topic?: string;
    current_after?: string;
    new_category?: string;
    new_after?: string;
    rationale: string;
  }
  const generateSuggestionMessage = (suggestion: Suggestion): string => {
    const {
      action,
      category,
      after,
      new_topic,
      old_topic,
      new_topics,
      current_category,
      topic,
      new_category,
      new_after,
    } = suggestion;

    switch (action) {
      case "add":
        return `Add a new topic called **"${new_topic?.topic}"** after the topic **"${after}"** under the category **"${category}"** with difficulty level **"${new_topic?.difficulty}"** that we estimate would take **${new_topic?.hours}** hour(s).`;
      case "modify":
        return `Modify the topic **"${old_topic}"** under the category **"${category}"** to **"${new_topic?.topic}"** with difficulty level **"${new_topic?.difficulty}"** that we estimate would take ${new_topic?.hours} hour(s).`;
      case "divide":
        const dividedTopics = new_topics
          ?.map(nt => `**"${nt.topic}"** (${nt.hours} hour(s), ${nt.difficulty} difficulty)`)
          .join(" and ");
        return `Divide the topic **"${old_topic}"** under the category **"${category}"** into ${dividedTopics}.`;
      case "move":
        return `Move the topic **"${topic}"** from the category **"${current_category}"** to the category **"${new_category}"** after the topic **"${new_after}"**.`;
      case "delete":
        return `Delete the topic **"${topic}"** under the category **"${category}"**.`;
      default:
        return "Invalid action.";
    }
  };
  const improveCourseStructure = async () => {
    setLoading(true);

    const courseTitle = courses[selectedCourse].title;
    const courseDescription = courses[selectedCourse].description;
    const targetLearners = courses[selectedCourse].learners;
    const syllabus = courses[selectedCourse].syllabus;
    const response: any = await Post("/improveCourseSyllabus", {
      courseTitle,
      courseDescription,
      targetLearners,
      syllabus,
    });

    setImprovements(response.suggestions);
    setSidebarOpen(true);
    if (response.suggestions.length > 0) {
      setCurrentImprovement(response.suggestions[0]);
    }

    setLoading(false);
  };
  const handleAcceptChange = () => {
    let _courses: any = JSON.parse(JSON.stringify(courses));
    let syllabus: any = _courses[selectedCourse].syllabus;
    setDisplayCourses(null);
    const modifiedTopics: string[] = [];
    const removedTopics: string[] = [];
    if (currentImprovement.type === "topic") {
      if (currentImprovement.action === "add") {
        const categoryIdx = syllabus.findIndex((cat: any) => cat.category === currentImprovement.category);
        if (categoryIdx !== -1) {
          let topics = syllabus[categoryIdx].topics;
          const afterTopicIdx = topics.findIndex((tp: any) => tp.topic === currentImprovement.after);
          topics.splice(afterTopicIdx + 1, 0, currentImprovement.new_topic);
        }
        modifiedTopics.push(currentImprovement.new_topic.topic);
      }

      if (currentImprovement.action === "modify") {
        const categoryIdx = syllabus.findIndex((cat: any) => cat.category === currentImprovement.category);
        if (categoryIdx !== -1) {
          let topics = syllabus[categoryIdx].topics;
          const topicIdx = topics.findIndex((tp: any) => tp.topic === currentImprovement.old_topic);
          if (topicIdx !== -1) {
            topics[topicIdx] = currentImprovement.new_topic;
          }
        }
        modifiedTopics.push(currentImprovement.new_topic.topic);
      }

      if (currentImprovement.action === "divide") {
        const categoryIdx = syllabus.findIndex((cat: any) => cat.category === currentImprovement.category);
        if (categoryIdx !== -1) {
          let topics = syllabus[categoryIdx].topics;
          const topicIdx = topics.findIndex((tp: any) => tp.topic === currentImprovement.old_topic);
          if (topicIdx !== -1) {
            topics.splice(topicIdx, 1, ...currentImprovement.new_topics);
          }
        }
        modifiedTopics.push(...currentImprovement.new_topics.map((t: { topic: string }) => t.topic));
        removedTopics.push(currentImprovement.old_topic);
      }

      if (currentImprovement.action === "delete") {
        const categoryIdx = syllabus.findIndex((cat: any) => cat.category === currentImprovement.category);
        if (categoryIdx !== -1) {
          let topics = syllabus[categoryIdx].topics;
          const topicIdx = topics.findIndex((tp: any) => tp.topic === currentImprovement.topic);
          if (topicIdx !== -1) {
            topics.splice(topicIdx, 1);
          }
        }
        removedTopics.push(currentImprovement.topic);
      }

      if (currentImprovement.action === "move") {
        const currentCategoryIdx = syllabus.findIndex(
          (cat: any) => cat.category === currentImprovement.current_category
        );
        if (currentCategoryIdx !== -1) {
          let topics = syllabus[currentCategoryIdx].topics;
          const topicIdx = topics.findIndex((tp: any) => tp.topic === currentImprovement.topic);
          if (topicIdx !== -1) {
            const [movedTopic] = topics.splice(topicIdx, 1);
            const newCategoryIdx = syllabus.findIndex((cat: any) => cat.category === currentImprovement.new_category);
            if (newCategoryIdx !== -1) {
              let newTopics = syllabus[newCategoryIdx].topics;

              const newAfterTopicIdx = newTopics.findIndex((tp: any) => tp.topic === currentImprovement.new_after);
              newTopics.splice(newAfterTopicIdx + 1, 0, movedTopic);
            }
          }
        }
        modifiedTopics.push(currentImprovement.topic);
      }
    }

    if (currentImprovement.type === "category") {
      if (currentImprovement.action === "add") {
        const afterCategoryIdx = syllabus.findIndex((cat: any) => cat.category === currentImprovement.after);
        syllabus.splice(afterCategoryIdx + 1, 0, {
          category: currentImprovement.new_category,
          topics: currentImprovement.topics,
        });
      }

      if (currentImprovement.action === "modify") {
        const categoryIdx = syllabus.findIndex((cat: any) => cat.category === currentImprovement.old_category);
        if (categoryIdx !== -1) {
          syllabus[categoryIdx].category = currentImprovement.new_category.category;
        }
      }

      if (currentImprovement.action === "delete") {
        const categoryIdx = syllabus.findIndex((cat: any) => cat.category === currentImprovement.category);
        if (categoryIdx !== -1) {
          syllabus.splice(categoryIdx, 1);
        }
      }

      if (currentImprovement.action === "move") {
        const categoryIdx = syllabus.findIndex((cat: any) => cat.category === currentImprovement.category);
        if (categoryIdx !== -1) {
          const [movedCategory] = syllabus.splice(categoryIdx, 1);
          const newAfterCategoryIdx = syllabus.findIndex((cat: any) => cat.category === currentImprovement.new_after);
          syllabus.splice(newAfterCategoryIdx + 1, 0, movedCategory);
        }
      }
    }

    _courses[selectedCourse].syllabus = syllabus;
    setIsChanged(modifiedTopics);
    setIsRemoved(removedTopics);
    setTimeout(() => {
      setCourses(_courses);
    }, 1000);
    setCurrentImprovement({});

    setTimeout(() => {
      setImprovements((prev: any) => {
        prev.splice(currentChangeIndex, 1);
        return prev;
      });
      navigateChange(currentChangeIndex + 1);
    }, 3000);
  };

  const navigateChange = (index: any) => {
    if (improvements[index]) {
      setCurrentChangeIndex(index);
      setCurrentImprovement(improvements[index]);
    } else {
      setSidebarOpen(false);
      setCurrentImprovement({});
    }
  };
  const handleRejectChange = () => {
    // Skip the current change and move to the next one or close dialog
    setDisplayCourses(null);
    setImprovements((prev: any) => {
      prev.splice(currentChangeIndex, 1);
      return prev;
    });
    navigateChange(currentChangeIndex);
  };

  /*  */
  const handlePaperClick = async (topic: any) => {
    if (Object.keys(currentImprovement).length > 0) {
      return;
    }
    setSelectedTopic(topic);
    setSidebarOpen(true);
    if (nodesPerTopic[topic.topic]) return;
    setLoadingNodes(true);
    setImprovements([]);
    setCurrentImprovement({});

    const courseTitle = courses[selectedCourse].title;
    const courseDescription = courses[selectedCourse].description;
    const targetLearners = courses[selectedCourse].learners;
    const syllabus = courses[selectedCourse].syllabus;
    const tags = courses[selectedCourse].tags;
    const references = courses[selectedCourse].references;

    const response: { nodes: any } = await Post("/retrieveNodesForCourse", {
      tags,
      courseTitle,
      courseDescription,
      targetLearners,
      references,
      syllabus,
      topic: topic.topic,
    });
    setLoadingNodes(false);

    setNodesPerTopic(prev => {
      prev[topic.topic] = response.nodes;
      return prev;
    });
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
    setSelectedTopic(null);
    setCurrentImprovement({});
    setIsChanged([]);
    setIsRemoved([]);
    setImprovements([]);
  };
  const getNewTopics = (currentImprovement: any) => {
    let newTopics = [];
    if (!currentImprovement) {
      return [];
    }
    if (
      currentImprovement.new_topic &&
      (currentImprovement.action === "add" || currentImprovement.action === "divide")
    ) {
      newTopics.push(currentImprovement.new_topic);
    }
    if ((currentImprovement.new_topics || []).length > 0) {
      newTopics = [...newTopics, ...currentImprovement.new_topics];
    }
    return newTopics;
  };

  useEffect(() => {
    if (currentImprovement.type === "topic") {
      setExpanded([currentImprovement.category]);
    }
    if (currentImprovement.action === "move" && currentImprovement.type === "topic") {
      const NEW_COURSES: any = JSON.parse(JSON.stringify(courses));
      const _selectedCourse = NEW_COURSES[selectedCourse];
      const syllabus: any = _selectedCourse.syllabus;

      const oldCategoryIndex = syllabus.findIndex((s: any) => s.category === currentImprovement.current_category);
      const oldTopicIndex = syllabus[oldCategoryIndex].topics.findIndex(
        (s: any) => s.topic === currentImprovement.topic
      );
      const oldTopic = syllabus[oldCategoryIndex].topics[oldTopicIndex];

      const categoryIndex = syllabus.findIndex((s: any) => s.category === currentImprovement.new_category);
      if (categoryIndex === -1) {
        return;
      }

      const afterIndex = syllabus[categoryIndex].topics.findIndex((s: any) => s.topic === currentImprovement.new_after);
      const alreadyExist = syllabus[categoryIndex].topics.findIndex((s: any) => s.topic === oldTopic.topic);
      if (alreadyExist === -1) {
        syllabus[categoryIndex].topics.splice(afterIndex + 1, 0, { ...oldTopic });
      }
      setExpanded([currentImprovement.current_category, currentImprovement.new_category]);
      setDisplayCourses(NEW_COURSES);
    }
  }, [currentImprovement]);

  const getCourses = () => {
    if (displayCourses !== null) {
      return displayCourses;
    } else {
      return courses;
    }
  };

  const getTopicColor = (category: any, tc: any) => {
    const color =
      currentImprovement.old_topic === tc
        ? "red"
        : selectedTopic === tc.topic
        ? "orange"
        : currentImprovement.action === "move" &&
          currentImprovement.type === "topic" &&
          currentImprovement.topic === tc.topic &&
          currentImprovement.new_category === category.category
        ? "green"
        : (currentImprovement.action === "move" ||
            currentImprovement.action === "delete" ||
            currentImprovement.action === "divide") &&
          currentImprovement.type === "topic" &&
          (currentImprovement.topic === tc.topic || currentImprovement.old_topic === tc.topic) &&
          (currentImprovement.current_category === category.category || !currentImprovement.current_category)
        ? "red"
        : "";
    return color;
  };

  const createCourse = () => {
    setCreateCourseModel(true);
  };
  const handleCloseCourseDialog = () => {
    setCreateCourseModel(false);
    setNewCourseLearners("");
    setNewCourseTitle("");
  };
  const handleSaveCourse = () => {
    setCourses(prev => {
      prev.push({
        title: newCourseTitle,
        learners: newCourseLearners,
        courseObjectives: [],
        courseSkills: [],
        description: "",
        syllabus: [],
        tags: [],
        references: [],
      });
      return prev;
    });
    setSelectedCourse(courses.length - 1);
    handleCloseCourseDialog();
  };

  const generateDescription = async () => {
    setLoadingDescription(true);
    const courseTitle = courses[selectedCourse].title;
    const targetLearners = courses[selectedCourse].learners;
    const response = await Post("/generateCourseDescription", { courseTitle, targetLearners });
    setCourses((prev: any) => {
      prev[selectedCourse].description = response;
      return prev;
    });
    setLoadingDescription(false);
  };
  const generateObjectives = async () => {
    setLoadingObjectives(true);
    const courseTitle = courses[selectedCourse].title;
    const targetLearners = courses[selectedCourse].learners;
    const courseDescription = courses[selectedCourse].description;
    const response = await Post("/generateCourseObjectives", { courseTitle, targetLearners, courseDescription });
    setCourses((prev: any) => {
      prev[selectedCourse].courseObjectives = response;
      return prev;
    });
    setLoadingObjectives(false);
  };
  const generateSkills = async () => {
    setLoadingSkills(true);
    const courseTitle = courses[selectedCourse].title;
    const targetLearners = courses[selectedCourse].learners;
    const courseObjectives = courses[selectedCourse].courseObjectives;
    const courseDescription = courses[selectedCourse].description;

    const response = await Post("/generateCourseSkills", {
      courseTitle,
      targetLearners,
      courseDescription,
      courseObjectives,
    });
    setCourses((prev: any) => {
      prev[selectedCourse].courseSkills = response;
      return prev;
    });
    setLoadingSkills(false);
  };
  const generateCourseStructure = async () => {
    setLoadingCourseStructure(true);
    const courseTitle = courses[selectedCourse].title;
    const targetLearners = courses[selectedCourse].learners;
    const courseObjectives = courses[selectedCourse].courseObjectives;
    const courseDescription = courses[selectedCourse].description;
    const courseSkills = courses[selectedCourse].courseSkills;

    const response = await Post("/generateCourseStructure", {
      courseTitle,
      targetLearners,
      courseObjectives,
      courseDescription,
      courseSkills,
    });
    setCourses((prev: any) => {
      prev[selectedCourse].syllabus = response;
      return prev;
    });
    setLoadingCourseStructure(false);
  };
  return (
    <Box>
      <AppHeaderMemoized
        page="ONE_CADEMY"
        tutorPage={true}
        sections={[]}
        selectedSectionId={""}
        onSwitchSection={() => {}}
        aiCourse={true}
      />
      <Box
        padding="20px"
        sx={{
          height: "95vh",
          overflow: "auto",
          background: theme =>
            theme.palette.mode === "dark"
              ? theme.palette.common.darkGrayBackground
              : theme.palette.common.lightGrayBackground,

          display: "flex",
          mb: "100px",
        }}
      >
        <Box sx={{ flex: sidebarOpen ? 0.7 : 1, transition: "flex 0.3s" }}>
          <Select
            label={"Select Course"}
            value={courses[selectedCourse].title}
            onChange={event => {
              const courseIdx = courses.findIndex(course => course.title === event.target.value);
              if (courseIdx !== -1) {
                setSelectedCourse(courseIdx);
              }
            }}
            displayEmpty
            variant="outlined"
            sx={{ width: "500px", backgroundColor: theme => (theme.palette.mode === "dark" ? "" : "white") }}
            MenuProps={{
              sx: {
                zIndex: "9999",
              },
            }}
            // InputLabelProps={{
            //   sx: {
            //     color: "black",
            //   },
            // }}
          >
            <MenuItem
              value=""
              disabled
              sx={{ backgroundColor: theme => (theme.palette.mode === "dark" ? "" : "white") }}
            >
              Select Course
            </MenuItem>
            {courses.map((course: any) => (
              <MenuItem
                key={course.title}
                value={course.title}
                sx={{ backgroundColor: theme => (theme.palette.mode === "dark" ? "" : "white") }}
              >
                {course.title}
              </MenuItem>
            ))}
          </Select>
          <Box sx={{ display: "flex" }}>
            <TextField
              label="Course Title"
              multiline
              fullWidth
              value={courses[selectedCourse].title}
              onChange={handleTitleChange}
              margin="normal"
              variant="outlined"
              sx={{ backgroundColor: theme => (theme.palette.mode === "dark" ? "" : "white") }}
            />
          </Box>
          <TextField
            label="Target Learners"
            multiline
            fullWidth
            value={courses[selectedCourse].learners}
            onChange={handleLearnersChange}
            margin="normal"
            variant="outlined"
            rows={4}
            sx={{ backgroundColor: theme => (theme.palette.mode === "dark" ? "" : "white") }}
          />
          <TextField
            label="Course Description"
            multiline
            fullWidth
            value={courses[selectedCourse].description}
            onChange={handleDescriptionChange}
            margin="normal"
            variant="outlined"
            rows={4}
            sx={{ backgroundColor: theme => (theme.palette.mode === "dark" ? "" : "white") }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  {!courses[selectedCourse].description && (
                    <LoadingButton
                      onClick={generateDescription}
                      sx={{
                        display: "flex-end",
                      }}
                      loading={loadingDescription}
                    >
                      <AutoFixHighIcon />
                    </LoadingButton>
                  )}
                </InputAdornment>
              ),
            }}
          />
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", py: "15px" }}>
              <Typography sx={{ mt: "5px" }}>Course Objectives:</Typography>
              <InputAdornment position="end">
                {!courses[selectedCourse].courseObjectives?.length && (
                  <LoadingButton
                    onClick={generateObjectives}
                    sx={{
                      display: "flex-end",
                    }}
                    loading={loadingObjectives}
                  >
                    <AutoFixHighIcon />
                  </LoadingButton>
                )}
              </InputAdornment>
            </Box>
            <ChipInput
              tags={courses[selectedCourse].courseObjectives}
              selectedTags={() => {}}
              fullWidth
              variant="outlined"
              placeholder="Add a new course objective..."
            />
          </Box>
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", py: "15px" }}>
              <Typography sx={{ mt: "5px" }}>Course Skills:</Typography>
              <InputAdornment position="end">
                {!courses[selectedCourse].courseSkills?.length && (
                  <LoadingButton
                    onClick={generateSkills}
                    sx={{
                      display: "flex-end",
                    }}
                    loading={loadingSkills}
                  >
                    <AutoFixHighIcon />
                  </LoadingButton>
                )}
              </InputAdornment>
            </Box>

            <ChipInput
              tags={courses[selectedCourse].courseSkills}
              selectedTags={() => {}}
              fullWidth
              variant="outlined"
              placeholder="Add a new course skill..."
            />
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", py: "15px" }}>
            <Typography variant="h2" sx={{ my: "16px" }}>
              Course Structure
            </Typography>
            <InputAdornment position="end">
              {!courses[selectedCourse].syllabus?.length && (
                <LoadingButton
                  onClick={generateCourseStructure}
                  sx={{
                    display: "flex-end",
                  }}
                  loading={loadingCourseStructure}
                >
                  <AutoFixHighIcon />
                </LoadingButton>
              )}
            </InputAdornment>
          </Box>

          <Box marginTop="20px">
            {getCourses()[selectedCourse].syllabus.map((category, categoryIndex) => (
              <Accordion key={categoryIndex} expanded={expanded.includes(category.category)}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls={`panel${categoryIndex}-content`}
                  id={`panel${categoryIndex}-header`}
                  onClick={() => {
                    if (expanded.includes(category.category)) {
                      setExpanded([]);
                    } else {
                      setExpanded([category.category]);
                    }
                  }}
                >
                  {currentImprovement.type === "category" &&
                  currentImprovement.action === "modify" &&
                  currentImprovement.old_category === category.category ? (
                    <Box sx={{ display: "flex", gap: "5px" }}>
                      <Typography variant="h6" sx={{ textDecoration: "line-through" }}>
                        {category.category}
                      </Typography>
                      <Typography variant="h6" sx={{ color: "green" }}>
                        {currentImprovement.new_category.category}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography
                      variant="h4"
                      sx={{
                        color:
                          currentImprovement.type === "topic" && currentImprovement.category === category.category
                            ? "orange"
                            : currentImprovement.type === "topic" &&
                              currentImprovement.current_category === category.category
                            ? "red"
                            : currentImprovement.new_category === category.category
                            ? "green"
                            : "",
                      }}
                    >
                      {category.category}
                    </Typography>
                  )}
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    {category.topics.map((tc: any, topicIndex) => (
                      <Grid item xs={12} sm={6} md={4} key={topicIndex}>
                        <Slide direction="down" timeout={800} in={true}>
                          <Paper
                            sx={{
                              height: "300px",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              // backgroundImage: `url(${topicImages[tc.topic]})`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                              borderRadius: "15px",
                              position: "relative",
                              cursor: "pointer",
                              animation: isRemoved.includes(tc.topic)
                                ? `${glowRed} 1.5s ease-in-out infinite`
                                : isChanged.includes(tc.topic)
                                ? `${glowGreen} 1.5s ease-in-out infinite`
                                : "none",
                              border: `1px solid ${getTopicColor(category, tc)}`,
                              ":hover": {
                                border: "1px solid orange",
                              },
                            }}
                            elevation={10}
                          >
                            {currentImprovement.topic !== tc.topic && currentImprovement.old_topic !== tc.topic && (
                              <CloseIcon
                                className="close-icon"
                                sx={{
                                  // backgroundColor: "grey",
                                  color: theme => (theme.palette.mode === "dark" ? "white" : "black"),
                                  borderRadius: "50%",
                                  ":hover": {
                                    backgroundColor: "black",
                                    color: "white",
                                  },
                                  zIndex: 10,
                                  position: "absolute",
                                  top: "0px",
                                  right: "0px",
                                  padding: "5px",
                                  fontSize: "35px",
                                }}
                                onClick={() => handleRemoveTopic(categoryIndex, topicIndex)}
                              />
                            )}
                            {currentImprovement.action === "move" &&
                              currentImprovement.type === "topic" &&
                              currentImprovement.topic === tc.topic && (
                                <SwapHorizIcon
                                  sx={{
                                    position: "absolute",
                                    top: "0px",
                                    fontSize: "40px",
                                    color: currentImprovement.new_category === category.category ? "green" : "red",
                                  }}
                                />
                              )}
                            <Box onClick={() => handlePaperClick(tc)}>
                              {currentImprovement.action === "modify" && currentImprovement.old_topic === tc.topic ? (
                                <Box>
                                  <Typography
                                    variant="h6"
                                    sx={{
                                      textAlign: "center",
                                      color: "red",
                                      textDecoration: "line-through",
                                    }}
                                  >
                                    {currentImprovement?.old_topic || ""}
                                  </Typography>
                                  <Typography
                                    variant="h6"
                                    sx={{
                                      textAlign: "center",
                                      color: "green",
                                    }}
                                  >
                                    {currentImprovement?.new_topic.topic || ""}
                                  </Typography>
                                </Box>
                              ) : (
                                <Typography
                                  variant="h6"
                                  sx={{
                                    textAlign: "center",
                                    color: getTopicColor(category, tc),
                                    fontWeight: 300,
                                  }}
                                >
                                  {tc?.topic || ""}
                                </Typography>
                              )}

                              <Box
                                sx={{
                                  position: "absolute",
                                  bottom: "0px",
                                  right: "0px",
                                  m: 2,
                                  gap: "5px",
                                }}
                              >
                                <Chip label={tc?.hours + " hours"} color="default" sx={{ mr: "5px" }} />
                                <Chip
                                  label={tc?.difficulty}
                                  color={
                                    tc?.difficulty.toLowerCase() === "easy"
                                      ? "success"
                                      : tc?.difficulty.toLowerCase() === "medium"
                                      ? "warning"
                                      : "error"
                                  }
                                />
                              </Box>
                              <Box
                                sx={{
                                  position: "absolute",
                                  bottom: "0px",
                                  left: "0px",
                                  m: 2,
                                  gap: "5px",
                                }}
                              >
                                <Button
                                  variant="contained"
                                  sx={{ borderRadius: "40px" }}
                                  onClick={e => {
                                    e.stopPropagation();
                                    setEditTopic({
                                      category: category.category,
                                      ...tc,
                                    });
                                    setNewTopic(tc.topic);
                                    setDifficulty(tc.difficulty.toLowerCase());
                                    setHours(tc.hours);
                                    setTopicDescription(tc.description || "");
                                    setSkills(tc.skills || []);
                                    handleOpenDialog(categoryIndex);
                                  }}
                                >
                                  Edit
                                </Button>
                              </Box>
                            </Box>
                          </Paper>
                        </Slide>
                      </Grid>
                    ))}
                    {currentImprovement.category === category.category &&
                      getNewTopics(currentImprovement).length > 0 &&
                      getNewTopics(currentImprovement).map(tc => (
                        <Grid key={tc.topic} item xs={12} sm={6} md={4}>
                          <Paper
                            sx={{
                              height: "300px",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              backgroundImage: `url(${topicImages[tc]})`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                              borderRadius: "15px",
                              position: "relative",
                              cursor: "pointer",
                              border: "2px solid green",
                              ":hover": {
                                border: "1px solid orange",
                              },
                            }}
                            elevation={10}
                          >
                            <Typography variant="h3" sx={{ textAlign: "center", color: "green" }}>
                              {tc.topic}
                            </Typography>
                            <Box
                              sx={{
                                position: "absolute",
                                bottom: "0px",
                                right: "0px",
                                m: 2,
                                gap: "5px",
                              }}
                            >
                              <Chip label={tc?.hours + " hours"} color="default" sx={{ mr: "5px" }} />
                              <Chip
                                label={tc?.difficulty}
                                color={
                                  tc?.difficulty.toLowerCase() === "easy"
                                    ? "success"
                                    : tc?.difficulty.toLowerCase() === "medium"
                                    ? "warning"
                                    : "error"
                                }
                              />
                            </Box>
                          </Paper>
                        </Grid>
                      ))}
                    <Grid item xs={12} sm={6} md={4} key="add-topic">
                      <Paper
                        sx={{
                          height: "300px",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          border: "2px dashed grey",
                          borderRadius: "15px",
                          cursor: "pointer",
                          ":hover": {
                            border: "2px dashed orange",
                          },
                        }}
                        onClick={() => handleOpenDialog(categoryIndex)}
                      >
                        <AddIcon
                          sx={{
                            fontSize: 64,
                            color: "grey",
                            ":hover": {
                              color: "orange",
                            },
                          }}
                        />
                      </Paper>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>

          {Object.keys(improvements[currentChangeIndex] || {}).length <= 0 && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                marginTop: "20px",
                position: "sticky",
                bottom: 24,
                gap: "5px",
              }}
            >
              <LoadingButton
                variant="contained"
                color="success"
                sx={{ color: "white", zIndex: 9, fontSize: "20px" }}
                onClick={improveCourseStructure}
                loading={loading}
              >
                Improve Course Structure
              </LoadingButton>
              <LoadingButton
                variant="contained"
                color="success"
                sx={{ color: "white", zIndex: 9, fontSize: "20px" }}
                onClick={createCourse}
                loading={loading}
              >
                Create New Course
              </LoadingButton>
            </Box>
          )}
          <Dialog open={createCourseModel} onClose={handleCloseCourseDialog} sx={{ zIndex: 9998 }}>
            <DialogTitle>{"Add a Course"}</DialogTitle>
            <DialogContent>
              <TextField
                label={"Course Title"}
                multiline
                fullWidth
                value={newCourseTitle}
                onChange={event => setNewCourseTitle(event.target.value)}
                margin="normal"
                variant="outlined"
                sx={{ width: "500px" }}
              />
              <TextField
                label={"Target Learners"}
                multiline
                fullWidth
                value={newCourseLearners}
                onChange={event => setNewCourseLearners(event.target.value)}
                margin="normal"
                variant="outlined"
                sx={{ width: "500px" }}
                rows={4}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseCourseDialog} color="primary" variant="contained">
                Cancel
              </Button>
              <Button
                onClick={handleSaveCourse}
                color="primary"
                variant="contained"
                disabled={!newCourseTitle.trim() || !newCourseLearners.trim()}
              >
                Add
              </Button>
            </DialogActions>
          </Dialog>
          <Dialog open={dialogOpen} onClose={handleCloseDialog} sx={{ zIndex: 9998 }}>
            <DialogTitle>{editTopic ? "Edit topic" : "Add a topic"}</DialogTitle>
            <DialogContent>
              <TextField
                label={editTopic ? "Edit Title" : "Enter Title"}
                multiline
                fullWidth
                value={newTopic}
                onChange={event => setNewTopic(event.target.value)}
                margin="normal"
                variant="outlined"
                sx={{ width: "500px" }}
              />
              <TextField
                label={editTopic ? "Edit Description" : "Enter Description"}
                multiline
                fullWidth
                value={topicDescription}
                onChange={event => setNewTopic(event.target.value)}
                margin="normal"
                variant="outlined"
                sx={{ width: "500px" }}
              />
              <Box sx={{ display: "column" }}>
                <Typography>Skills:</Typography>
                <ChipInput
                  tags={skills}
                  selectedTags={() => {}}
                  fullWidth
                  variant="outlined"
                  placeholder="Add a new skill..."
                />
              </Box>
              <FormControl fullWidth margin="normal" sx={{ width: "500px" }}>
                <InputLabel id="difficulty-label">Difficulty</InputLabel>
                <Select
                  labelId="difficulty-label"
                  value={difficulty}
                  onChange={event => setDifficulty(event.target.value)}
                  label="Difficulty"
                  MenuProps={{
                    sx: {
                      zIndex: "9999",
                    },
                  }}
                  sx={{ color: difficulty === "easy" ? "#AAFF00" : difficulty === "medium" ? "#ffc071" : "red" }}
                >
                  <MenuItem value="easy" sx={{ color: "#AAFF00" }}>
                    Easy
                  </MenuItem>
                  <MenuItem value="medium" sx={{ color: "#ffc071" }}>
                    Medium
                  </MenuItem>
                  <MenuItem value="hard" sx={{ color: "red" }}>
                    Hard
                  </MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Hours"
                fullWidth
                value={hours}
                onChange={event => setHours(Number(event.target.value))}
                margin="normal"
                variant="outlined"
                sx={{ width: "500px" }}
                type="number"
                inputProps={{ min: 0 }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog} color="primary" variant="contained">
                Cancel
              </Button>
              <Button onClick={handleSaveTopic} color="primary" variant="contained">
                Save
              </Button>
            </DialogActions>
          </Dialog>
        </Box>

        {sidebarOpen && (
          <Paper
            sx={{
              width: "30%",
              height: "100vh",
              backgroundColor: "white",
              boxShadow: 3,
              position: "fixed",
              right: 0,
              top: 0,
              zIndex: 9999,
              display: "flex",
              flexDirection: "column",
              background: theme => (theme.palette.mode === "dark" ? theme.palette.common.darkGrayBackground : ""),
            }}
            elevation={8}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                p: 2,
                borderBottom: "1px solid lightgrey",
              }}
            >
              <Typography variant="h6">
                {Object.keys(improvements[currentChangeIndex] || {}).length > 0
                  ? "AI-Proposed Improvements"
                  : selectedTopic.topic}
              </Typography>
              <IconButton onClick={handleSidebarClose}>
                <CloseIcon />
              </IconButton>
            </Box>
            {selectedTopic && (
              <Box sx={{ mx: "15px" }}>
                <Typography sx={{ mt: "5px", fontWeight: "bold" }}>Description:</Typography>
                <Typography>{selectedTopic.description}</Typography>{" "}
              </Box>
            )}

            {selectedTopic && (
              <Box sx={{ mx: "15px" }}>
                <Typography sx={{ mt: "5px", fontWeight: "bold" }}>Skills:</Typography>
                <ChipInput
                  tags={selectedTopic.skills}
                  selectedTags={() => {}}
                  fullWidth
                  variant="outlined"
                  readOnly={true}
                />
              </Box>
            )}
            {Object.keys(improvements[currentChangeIndex] || {}).length > 0 && (
              <Box>
                <Box sx={{ display: "flex", my: "15px", mx: "5px" }}>
                  <Button
                    variant="contained"
                    sx={{
                      minWidth: "32px",
                      p: 0,
                      m: 0,
                      backgroundColor: "#1973d3",
                      ":hover": { backgroundColor: "#084694" },
                    }}
                    onClick={() => {
                      navigateChange(currentChangeIndex - 1);
                      setDisplayCourses(null);
                    }}
                    disabled={currentChangeIndex === 0 || Object.keys(currentImprovement).length <= 0}
                  >
                    <ArrowBackIosNewIcon />
                  </Button>
                  <Paper sx={{ p: "15px", m: "17px" }}>
                    {Object.keys(improvements[currentChangeIndex] || {}).length > 0 && (
                      <Box sx={{ mb: "15px" }}>
                        <strong style={{ color: "green", marginRight: "5px" }}> Proposal:</strong>{" "}
                        <MarkdownRender
                          text={generateSuggestionMessage(improvements[currentChangeIndex] || {})}
                          sx={{
                            fontSize: "16px",
                            fontWeight: 400,
                            letterSpacing: "inherit",
                          }}
                        />
                      </Box>
                    )}
                    <strong style={{ color: "green", marginRight: "5px" }}> Rationale:</strong>{" "}
                    <Typography> {improvements[currentChangeIndex]?.rationale}</Typography>
                  </Paper>
                  <Button
                    variant="contained"
                    sx={{ minWidth: "32px", p: 0, m: 0, mr: "5px" }}
                    onClick={() => {
                      navigateChange(currentChangeIndex + 1);
                      setDisplayCourses(null);
                    }}
                    disabled={
                      currentChangeIndex === improvements[currentChangeIndex].length - 1 ||
                      Object.keys(currentImprovement).length <= 0
                    }
                  >
                    <ArrowForwardIosIcon />
                  </Button>
                </Box>

                <Box sx={{ display: "flex", gap: "82px", alignItems: "center", alignContent: "center" }}>
                  <Button
                    sx={{ ml: "9px" }}
                    onClick={handleRejectChange}
                    color="error"
                    variant="contained"
                    disabled={Object.keys(currentImprovement).length <= 0}
                  >
                    Delete Proposal
                  </Button>
                  <Typography sx={{ mr: "15px", mt: "5px", ml: "5px" }}>
                    {currentChangeIndex + 1}/{improvements.length}
                  </Typography>
                  <Button
                    onClick={handleAcceptChange}
                    color="success"
                    autoFocus
                    variant="contained"
                    disabled={Object.keys(currentImprovement).length <= 0}
                  >
                    Implement Proposal
                  </Button>
                </Box>
              </Box>
            )}
            {loadingNodes ? (
              <Box>
                <Box>
                  {Array.from(new Array(7)).map((_, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: "flex",
                        justifyContent: "flex-start",

                        px: 2,
                      }}
                    >
                      <Skeleton
                        variant="rectangular"
                        width={500}
                        height={250}
                        sx={{
                          bgcolor: "grey.300",
                          borderRadius: "10px",
                          mt: "19px",
                          ml: "5px",
                        }}
                      />
                    </Box>
                  ))}
                </Box>
              </Box>
            ) : (
              <Box sx={{ gap: "5px", my: "15px", mx: "19px", overflow: "auto" }}>
                {selectedTopic &&
                  (nodesPerTopic[selectedTopic.topic] || []).map((node: any) => (
                    <Box key={node.title} sx={{ mb: "10px" }}>
                      <Accordion
                        id={node.title}
                        expanded={true}
                        sx={{
                          borderRadius: "13px!important",

                          overflow: "hidden",
                          listStyle: "none",
                          transition: "box-shadow 0.3s",

                          border: expandedNode === node.title ? `2px solid orange` : "",
                          p: "0px !important",
                        }}
                      >
                        <AccordionSummary
                          sx={{
                            p: "0px !important",
                            marginBlock: "-13px !important",
                          }}
                        >
                          <Box sx={{ flexDirection: "column", width: "100%" }}>
                            <Box
                              onClick={e => {
                                e.stopPropagation();
                                if (expandedNode === node.title) {
                                  setExpandedNode(null);
                                } else {
                                  setExpandedNode(node.title);
                                }
                              }}
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                m: "15px",
                              }}
                            >
                              <Box
                                sx={{
                                  pr: "25px",
                                  // pb: '15px',
                                  display: "flex",
                                  gap: "15px",
                                }}
                              >
                                <NodeTypeIcon
                                  id={node.title}
                                  nodeType={node.nodeType}
                                  tooltipPlacement={"top"}
                                  fontSize={"medium"}
                                  // disabled={disabled}
                                />
                                <MarkdownRender
                                  text={node?.title}
                                  sx={{
                                    fontSize: "20px",
                                    fontWeight: 400,
                                    letterSpacing: "inherit",
                                  }}
                                />
                              </Box>
                            </Box>
                          </Box>
                        </AccordionSummary>

                        <AccordionDetails sx={{ p: "0px !important" }}>
                          <Box sx={{ p: "17px", pt: 0 }}>
                            <Box
                              sx={{
                                transition: "border 0.3s",
                              }}
                            >
                              <MarkdownRender
                                text={node.content}
                                sx={{
                                  fontSize: "16px",
                                  fontWeight: 400,
                                  letterSpacing: "inherit",
                                }}
                              />
                            </Box>
                            {/* <FlashcardVideo flashcard={concept} /> */}
                            {(node?.nodeImage || []).length > 0 && <ImageSlider images={[node?.nodeImage]} />}
                          </Box>
                        </AccordionDetails>
                      </Accordion>
                    </Box>
                  ))}
              </Box>
            )}
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default withAuthUser({
  shouldRedirectToLogin: true,
  shouldRedirectToHomeIfAuthenticated: false,
})(CourseComponent);
// {
//   action: "add",
//   type: "topic",
//   category: "Therapies and Interventions",
//   after: "Biological Treatments",
//   topic: "Integrative and Holistic Approaches",
//   rationale:
//     "To introduce students to comprehensive treatment approaches that combine multiple therapeutic modalities.",
// },
// {
//   action: "add",
//   type: "topic",
//   category: "Applications of Psychology",
//   after: "Psychology in the Workplace",
//   topic: "Forensic Psychology",
//   rationale: "To cover the application of psychology in legal and criminal justice settings.",
// },
