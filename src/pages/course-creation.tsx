import AddIcon from "@mui/icons-material/Add";
import AltRouteIcon from "@mui/icons-material/AltRoute";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import CloseIcon from "@mui/icons-material/Close";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import { LoadingButton, Masonry } from "@mui/lab";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
  CardHeader,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  keyframes,
  LinearProgress,
  // LinearProgress,
  MenuItem,
  Paper,
  Select,
  Slide,
  TextField,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import {
  collection,
  deleteField,
  doc,
  getFirestore,
  onSnapshot,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { KnowledgeNode } from "src/knowledgeTypes";
import { QuestionProps } from "src/types";
import { INode } from "src/types/INode";

import ChipInput from "@/components/ChipInput";
import Essay from "@/components/courseCreation/questions/Essay";
import MultipleChoices from "@/components/courseCreation/questions/MultipleChoices";
import ShortAnswer from "@/components/courseCreation/questions/ShortAnswer";
import TrueFalse from "@/components/courseCreation/questions/TrueFalse";
import AppHeaderMemoized from "@/components/Header/AppHeader";
import withAuthUser from "@/components/hoc/withAuthUser";
import ImageSlider from "@/components/ImageSlider";
import LinkedNodes from "@/components/LinkedNodes";
import { CustomButton } from "@/components/map/Buttons/Buttons";
import MarkdownRender from "@/components/Markdown/MarkdownRender";
import NodeItemContributors from "@/components/NodeItemContributors";
import { NodeItemFull } from "@/components/NodeItemFull";
import { NodeItemFullEditor, ProposalFormValues } from "@/components/NodeItemFullEditor";
import NodeTypeIcon from "@/components/NodeTypeIcon";
import TypographyUnderlined from "@/components/TypographyUnderlined";
import { useAuth } from "@/context/AuthContext";
import useConfirmDialog from "@/hooks/useConfirmDialog";
import { getNodeDataForCourse } from "@/lib/knowledgeApi";
import { Post } from "@/lib/mapApi";
import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";
import { newId } from "@/lib/utils/newFirestoreId";
import { delay, escapeBreaksQuotes } from "@/lib/utils/utils";

const glowGreen = keyframes`
  0% {
    box-shadow: 0 0 5px #26C281, 0 0 10px #26C281, 0 0 20px #26C281, 0 0 30px #26C281;
  }
  50% {
    box-shadow: 0 0 10px #26C281, 0 0 20px #26C281, 0 0 30px #26C281, 0 0 40px #26C281;
  }
  100% {
    box-shadow: 0 0 5px #26C281, 0 0 10px #26C281, 0 0 20px #26C281, 0 0 30px #26C281;
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

// interface  {
//   title: string;
//   hours: number;
//   difficulty: string;
// }

// interface Suggestion {
//   action: string;
//   type: string;
//   category?: string | null;
//   after?: string;
//   new_topic?: Topic;
//   old_topic?: string;
//   new_topics?: Topic[];
//   current_category?: string;
//   topic?: string;
//   current_after?: string;
//   new_category?: string;
//   new_after?: string;
//   rationale: string;
// }
const books = [
  {
    id: "OpenStax Psychology (2nd ed.) Textbook",
    tags: ["Psychology", "Psychology @ OpenStax"],
    references: ["OpenStax Psychology (2nd ed.) Textbook"],
  },
  {
    id: "OpenStax Microbiology Textbook",
    tags: ["Microbiology @ OpenStax", "Microbiology"],
    references: ["OpenStax Microbiology Textbook"],
  },
  {
    id: "CORE Econ - The Economy",
    tags: ["Economy", "Economics"],
    references: ["CORE Econ - The Economy"],
  },
];

type QuestionComponentsType = {
  [key: string]: React.ComponentType<QuestionProps>;
};

type DifficultyType = {
  [key: string]: { label: string; color: string };
};

const questionComponents: QuestionComponentsType = {
  "Multiple Choice": MultipleChoices,
  "True/False": TrueFalse,
  "Short Answer": ShortAnswer,
  Essay: Essay,
};

const difficulties: DifficultyType = {
  easy: { label: "Easy", color: DESIGN_SYSTEM_COLORS.success400 },
  medium: { label: "Medium", color: DESIGN_SYSTEM_COLORS.yellow500 },
  hard: { label: "Hard", color: DESIGN_SYSTEM_COLORS.notebookRed2 },
};
const CourseComponent = () => {
  const db = getFirestore();
  const [{ user }] = useAuth();
  const dragItem = useRef<any>(null);
  const dragOverItem = useRef<any>(null);
  const containerRef = useRef<any>(null);

  const dragTopicItem = useRef<any>(null);
  const dragOverTopicItem = useRef<any>(null);
  const [dragOverItemPointer, setDragOverItemPointer] = useState<any>(null);
  const [dragOverTopicPointer, setDragOverTopicPointer] = useState<any>(null);
  // const containerTopicRef = useRef<any>(null);

  const [editMode, setEditMode] = useState(false);
  const [loadingPrompt, setLoadingPrompt] = useState(false);
  const [glowCategoryGreenIndex, setGlowCategoryGreenIndex] = useState(-1);
  const [glowCategoryRedIndex, setGlowCategoryRedIndex] = useState(-1);
  const [loadingDescription, setLoadingDescription] = useState(false);
  const [loadingPrerequisiteKnowledge, setLoadingPrerequisiteKnowledge] = useState(false);

  const [loadingObjectives, setLoadingObjectives] = useState(false);
  // const [loadingSkills, setLoadingSkills] = useState(false);
  const [loadingCourseStructure, setLoadingCourseStructure] = useState(false);
  const [slideIn, setSlideIn] = useState(true);
  const [courses, setCourses] = useState<any>([]);
  const [displayCourses, setDisplayCourses] = useState(null);

  const [selectedCourse, setSelectedCourse] = useState<any>(0);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  // const [dialogOpenImp, setDialogOpenImp] = useState<boolean>(false);
  const [selectedOpenCategory, setSelectedOpenCategory] = useState<any>(null);
  const [newTopic, setNewTopic] = useState<any>("");
  const [difficulty, setDifficulty] = useState("medium");
  const [hours, setHours] = useState<number>(0);
  // const [skills, setSkills] = useState([]);
  const [topicDescription, setTopicDescription] = useState("");

  const [loadingImage, setLoadingImage] = useState(false);

  const [loading, setLoading] = useState(false);
  const [improvements, setImprovements] = useState<any>([]);
  const [currentChangeIndex, setCurrentChangeIndex] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [currentImprovement, setCurrentImprovement] = useState<any>({});
  const [expanded, setExpanded] = useState<string[]>([]);
  const [editTopic, setEditTopic] = useState<any>(null);
  const [expandedNode, setExpandedNode] = useState<KnowledgeNode | null>(null);
  const [isChanged, setIsChanged] = useState<string[]>([]);
  const [isRemoved, setIsRemoved] = useState<string[]>([]);
  const [creatingCourseStep, setCreatingCourseStep] = useState<number>(0);
  const [editCategory, setEditCategory] = useState<any>(null);
  const [newCategoryTitle, setNewCategoryTitle] = useState<string>("");
  const [expandedTopics, setExpandedTopics] = useState<any>([]);
  const { confirmIt, ConfirmDialog } = useConfirmDialog();
  const [loadingNodes, setLoadingNodes] = useState<string[]>([]);
  const [nodePublicView, setNodePublicView] = useState<any>(null);
  const [nodePublicViewLoader, setNodePublicViewLoader] = useState<boolean>(false);
  const [questionsLoader, setQuestionsLoader] = useState<boolean>(false);
  const [prerequisitesLoader, setPrerequisitesLoader] = useState<string | null>(null);

  useEffect(() => {
    if (nodePublicView) {
    }
  }, [nodePublicView]);

  useEffect(() => {
    if (!user?.uname) return;
    const notebooksRef = collection(db, "coursesAI");
    const q = query(notebooksRef, where("deleted", "==", false), where("uname", "==", user.uname));

    const killSnapshot = onSnapshot(q, snapshot => {
      const docChanges = snapshot.docChanges();

      setCourses((prevCourses: any) =>
        docChanges.reduce(
          (prev: (any & { id: string })[], change: any) => {
            const docType = change.type;
            const curData = { id: change.doc.id, ...change.doc.data() };

            const prevIdx = prev.findIndex((m: any & { id: string }) => m.id === curData.id);
            if (docType === "added") {
              if (prevIdx === -1) {
                prev.push({ ...curData });
              } else {
                prev[prevIdx] = { ...curData };
              }
            }
            if (docType === "modified" && prevIdx !== -1) {
              prev[prevIdx] = { ...curData };
            }

            if (docType === "removed" && prevIdx !== -1) {
              prev.splice(prevIdx, 1);
            }
            return prev;
          },
          [...prevCourses]
        )
      );
    });

    return () => {
      killSnapshot();
    };
  }, [db, user]);

  const updateCourses = async (course: any, deleteNodes = false, deleteImprovements = false) => {
    if (!course.id || course.new) return;

    const courseRef = doc(db, "coursesAI", course.id);
    const updateData: any = { ...course, updateAt: new Date() };

    if (deleteNodes) {
      updateData.nodes = deleteField();
    }

    if (deleteImprovements) {
      updateData.suggestions = deleteField();
    }

    await updateDoc(courseRef, updateData);
  };

  const onCreateCourse = async (newCourse: any) => {
    if (!user) return;
    const courseRef = doc(collection(db, "coursesAI"), newCourse.id);
    await setDoc(courseRef, {
      ...newCourse,
      deleted: false,
      updateAt: new Date(),
      createdAt: new Date(),
      new: false,
      uname: user.uname,
    });
  };

  const handleTitleChange = (e: any) => {
    const updatedCourses = [...courses];
    updatedCourses[selectedCourse] = {
      ...updatedCourses[selectedCourse],
      title: e.target.value,
    };
    setCourses(updatedCourses);
    updateCourses(updatedCourses[selectedCourse]);
  };
  const handleHoursChange = (e: any) => {
    const updatedCourses: any = [...courses];
    updatedCourses[selectedCourse] = {
      ...updatedCourses[selectedCourse],
      hours: Number(e.target.value),
    };
    setCourses(updatedCourses);
    updateCourses(updatedCourses[selectedCourse]);
  };

  const handleDescriptionChange = (e: any) => {
    const updatedCourses = [...courses];
    updatedCourses[selectedCourse] = {
      ...updatedCourses[selectedCourse],
      description: e.target.value,
    };
    setCourses(updatedCourses);
    // setTimeout(() => {
    updateCourses(updatedCourses[selectedCourse]);
    // }, 1000);
  };
  const handlePrerequisiteChange = (e: any) => {
    const updatedCourses = [...courses];
    updatedCourses[selectedCourse] = {
      ...updatedCourses[selectedCourse],
      prerequisiteKnowledge: e.target.value,
    };
    setCourses(updatedCourses);
    updateCourses(updatedCourses[selectedCourse]);
  };

  const handleLearnersChange = (e: any) => {
    const updatedCourses = [...courses];
    updatedCourses[selectedCourse] = {
      ...updatedCourses[selectedCourse],
      learners: e.target.value,
    };
    setCourses(updatedCourses);
    updateCourses(updatedCourses[selectedCourse]);
  };
  const handleRemoveTopic = async (selectedOpenCategory: any) => {
    const confirmation = await confirmIt(
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          gap: "10px",
        }}
      >
        <DeleteForeverIcon />
        <Typography sx={{ fontWeight: "bold" }}>Do you want to delete this topic?</Typography>
      </Box>,
      "Delete Topic",
      "Keep Topic"
    );
    if (confirmation) {
      const updatedCourses = [...courses];
      updatedCourses[selectedCourse].syllabus[selectedOpenCategory.categoryIndex].topics.splice(
        selectedOpenCategory.topicIndex,
        1
      );
      setCourses(updatedCourses);
      updateCourses(updatedCourses[selectedCourse]);
      setSidebarOpen(false);
    }
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
    const topics: any = updatedCourses[selectedCourse].syllabus[selectedCategory].topics;
    if (editTopic) {
      const topicIndex = topics.findIndex((t: any) => t.topic === editTopic.topic);

      if (topicIndex !== -1) {
        topics[topicIndex].topic = newTopic;
        topics[topicIndex].hours = hours;
        topics[topicIndex].difficulty = difficulty;
        // topics[topicIndex].skills = skills;
      }
    } else {
      topics.push({
        topic: newTopic,
        hours,
        difficulty,
        // skills,
        description: topicDescription,
      });
    }

    setCourses(updatedCourses);
    updateCourses(updatedCourses[selectedCourse]);
    handleCloseDialog();
    setNewTopic("");
    setHours(0);
    setDifficulty("");
  };

  const generateSuggestionMessage = (suggestion: any): string => {
    const {
      action,
      category,
      after,
      new_topic,
      old_topic,
      new_topics,
      current_category,
      topic,
      title,
      new_category,
      new_after,
    } = suggestion;

    if (suggestion.type === "topic") {
      switch (action) {
        case "add":
          return `**<span style="color: green;">Add a new topic</span>** called **"${
            new_topic?.title
          }"** after the topic **"${after}"** under the category **"${category}"** with difficulty level **"${
            new_topic?.difficulty
          }"** that we estimate would take **${new_topic?.hours}** hour${(new_topic?.hours || 0) > 1 ? "s" : ""}.`;
        case "modify":
          return `**<span style="color: orange;">Modify the topic</span>** **"${old_topic}"** under the category **"${category}"** to **"${
            new_topic?.title
          }"** with difficulty level **"${new_topic?.difficulty}"** that we estimate would take ${
            new_topic?.hours
          } hour${(new_topic?.hours || 0) > 1 ? "s" : ""}.`;
        case "divide":
          const dividedTopics = new_topics
            ?.map(
              (nt: any) =>
                `**"${nt.title}"** (${nt.hours} hour${(nt?.hours || 0) > 1 ? "s" : ""}, ${nt.difficulty} difficulty)`
            )
            .join(" and ");
          return `**<span style="color: orange;">Divide the topic</span>** **"${old_topic}"** under the category **"${category}"** into ${dividedTopics}.`;
        case "move":
          return `**<span style="color: orange;">Move the topic</span>** **"${title}"** from the category **"${current_category}"** to the category **"${new_category}"** after the topic **"${new_after}"**.`;
        case "delete":
          return `**<span style="color: red;">Delete the topic</span>** **"${title}"** under the category **"${category}"**.`;
        default:
          return "Invalid action.";
      }
    } else if (suggestion.type === "category") {
      const { new_category, after } = suggestion;
      switch (action) {
        case "add":
          return `**<span style="color: green;">Add a new Category</span>** called **"${new_category?.title}"** after the category **"${after}"**.`;
        case "modify":
          return `**<span style="color: orange;">Modify the topic</span>** **"${old_topic}"** under the category **"${category}"** to **"${
            new_topic?.title
          }"** with difficulty level **"${new_topic?.difficulty}"** that we estimate would take ${
            new_topic?.hours
          } hour${(new_topic?.hours || 0) > 1 ? "s" : ""}.`;
        case "divide":
          const dividedTopics = new_topics
            ?.map(
              (nt: any) =>
                `**"${nt.title}"** (${nt.hours} hour${(nt?.hours || 0) > 1 ? "s" : ""}, ${nt.difficulty} difficulty)`
            )
            .join(" and ");
          return `**<span style="color: orange;">Divide the topic</span>** **"${old_topic}"** under the category **"${category}"** into ${dividedTopics}.`;
        case "move":
          return `**<span style="color: orange;">Move the topic</span>** **"${topic}"** from the category **"${current_category}"** to the category **"${new_category}"** after the topic **"${new_after}"**.`;
        case "delete":
          return `**<span style="color: red;">Delete the category</span>** **"${topic}"** under the category **"${category}"**.`;
        default:
          return "Invalid action.";
      }
    }
    return "Invalid action.";
  };
  const improveCourseStructure = async () => {
    try {
      setLoading(true);
      const courseTitle = courses[selectedCourse].title;
      const courseDescription = courses[selectedCourse].description;
      const targetLearners = courses[selectedCourse].learners;
      const syllabus = courses[selectedCourse].syllabus;
      const prerequisiteKnowledge = courses[selectedCourse].prerequisiteKnowledge;
      const suggestions = courses[selectedCourse].suggestions;
      let response: any = { suggestions };
      if (!suggestions) {
        response = await Post("/improveCourseSyllabus", {
          courseTitle,
          courseDescription,
          targetLearners,
          syllabus,
          prerequisiteKnowledge,
          courseId: courses[selectedCourse].id,
        });
      }

      setImprovements(response.suggestions);
      setSidebarOpen(true);
      if (response.suggestions.length > 0) {
        setCurrentImprovement(response.suggestions[0]);
        setSelectedOpenCategory(null);
        setSelectedTopic(null);
      }

      setLoading(false);
    } catch (error) {
      setLoading(false);
      await confirmIt("There is a error with the request, please try again.", "Ok", "");
      console.error(error);
    }
  };
  const handleAcceptChange = async () => {
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
          const afterTopicIdx = topics.findIndex((tp: any) => tp.title === currentImprovement.after);
          topics.splice(afterTopicIdx + 1, 0, currentImprovement.new_topic);
        }
        modifiedTopics.push(currentImprovement.new_topic.title);
      }

      if (currentImprovement.action === "modify") {
        const categoryIdx = syllabus.findIndex((cat: any) => cat.category === currentImprovement.category);
        if (categoryIdx !== -1) {
          let topics = syllabus[categoryIdx].topics;
          const topicIdx = topics.findIndex((tp: any) => tp.title === currentImprovement.old_topic);
          if (topicIdx !== -1) {
            topics[topicIdx] = currentImprovement.new_topic;
          }
        }
        modifiedTopics.push(currentImprovement.new_topic.title);
      }

      if (currentImprovement.action === "divide") {
        const categoryIndex = syllabus.findIndex((s: any) => s.title === currentImprovement.category);
        const oldTopicIdx = syllabus[categoryIndex].topics.findIndex(
          (t: any) => t.title === currentImprovement.old_topic
        );
        syllabus[categoryIndex].color = "modify";
        syllabus[categoryIndex].topics.splice(oldTopicIdx, 1);
        const new_topics_copy = currentImprovement.new_topics.slice();
        new_topics_copy.forEach((element: any) => {
          delete element.color;
          delete element.action;
        });
        syllabus[categoryIndex].topics = [...syllabus[categoryIndex].topics, ...new_topics_copy];

        removedTopics.push(currentImprovement.old_topic);
        modifiedTopics.push(...currentImprovement.new_topics.map((t: { title: string }) => t.title));
      }

      if (currentImprovement.action === "delete") {
        const categoryIdx = syllabus.findIndex((cat: any) => cat.title === currentImprovement.category);
        if (categoryIdx !== -1) {
          let topics = syllabus[categoryIdx].topics;
          const topicIdx = topics.findIndex((tp: any) => tp.title === currentImprovement.topic);
          if (topicIdx !== -1) {
            topics.splice(topicIdx, 1);
          }
        }
        removedTopics.push(currentImprovement.title);
      }

      if (currentImprovement.action === "move") {
        const currentCategoryIdx = syllabus.findIndex(
          (cat: any) => cat.category === currentImprovement.current_category
        );
        if (currentCategoryIdx !== -1) {
          let topics = syllabus[currentCategoryIdx].topics;
          const topicIdx = topics.findIndex((tp: any) => tp.title === currentImprovement.topic);
          if (topicIdx !== -1) {
            const [movedTopic] = topics.splice(topicIdx, 1);
            const newCategoryIdx = syllabus.findIndex((cat: any) => cat.title === currentImprovement.new_category);
            if (newCategoryIdx !== -1) {
              let newTopics = syllabus[newCategoryIdx].topics;

              const newAfterTopicIdx = newTopics.findIndex((tp: any) => tp.title === currentImprovement.new_after);
              newTopics.splice(newAfterTopicIdx + 1, 0, movedTopic);
            }
          }
        }
        modifiedTopics.push(currentImprovement.title);
      }
    }

    if (currentImprovement.type === "category") {
      if (currentImprovement.action === "add") {
        const afterCategoryIdx = syllabus.findIndex((cat: any) => cat.title === currentImprovement.after);
        syllabus.splice(afterCategoryIdx + 1, 0, currentImprovement.new_category);
      }

      // if (currentImprovement.action === "modify") {
      //   const categoryIdx = syllabus.findIndex((cat: any) => cat.title === currentImprovement.old_category);
      //   if (categoryIdx !== -1) {
      //     syllabus[categoryIdx].category = currentImprovement.new_category.category;
      //   }
      // }

      // if (currentImprovement.action === "delete") {
      //   const categoryIdx = syllabus.findIndex((cat: any) => cat.category === currentImprovement.category);
      //   if (categoryIdx !== -1) {
      //     syllabus.splice(categoryIdx, 1);
      //   }
      // }

      // if (currentImprovement.action === "move") {
      //   const categoryIdx = syllabus.findIndex((cat: any) => cat.category === currentImprovement.category);
      //   if (categoryIdx !== -1) {
      //     const [movedCategory] = syllabus.splice(categoryIdx, 1);
      //     const newAfterCategoryIdx = syllabus.findIndex((cat: any) => cat.category === currentImprovement.new_after);
      //     syllabus.splice(newAfterCategoryIdx + 1, 0, movedCategory);
      //   }
      // }
    }

    _courses[selectedCourse].syllabus = syllabus;

    setIsRemoved(removedTopics);
    if (removedTopics.length > 0) {
      await delay(1000);
    }
    setIsChanged(modifiedTopics);
    setTimeout(() => {
      setCourses(_courses);
      setDisplayCourses(_courses);
    }, 1000);
    setCurrentImprovement({});

    setTimeout(() => {
      updateCourses(_courses[selectedCourse], false, true);
      setImprovements((prev: any) => {
        prev.splice(currentChangeIndex, 1);
        return prev;
      });
      setIsChanged([]);
      setIsRemoved([]);
      navigateChange(currentChangeIndex);
    }, 3000);
  };

  const navigateChange = (index: any) => {
    let newIndex = index;
    if (index >= improvements.length && improvements.length > 0) {
      newIndex = 0;
    }

    if (newIndex !== -1) {
      TriggerSlideAnimation();
      setTimeout(() => {
        setCurrentChangeIndex(newIndex);
        setCurrentImprovement(improvements[newIndex]);
      }, 1000);
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
  const retrieveNodesForTopic = async (topic: string) => {
    try {
      if (Object.keys(currentImprovement || {}).length > 0 || loadingNodes.includes(topic)) {
        return;
      }

      setImprovements([]);
      setCurrentImprovement({});

      const courseTitle = courses[selectedCourse].title;
      const courseDescription = courses[selectedCourse].description;
      const targetLearners = courses[selectedCourse].learners;
      const syllabus = courses[selectedCourse].syllabus;
      const tags = courses[selectedCourse].tags;
      const references = courses[selectedCourse].references;

      setLoadingNodes((prev: string[]) => {
        return [...prev, topic];
      });
      await Post("/retrieveNodesForTopic", {
        courseId: courses[selectedCourse].id,
        tags,
        courseTitle,
        courseDescription,
        targetLearners,
        references,
        syllabus,
        topic,
      });
      setLoadingNodes((prev: string[]) => {
        return [...prev.filter(t => t !== topic)];
      });
    } catch (error) {
      setLoadingNodes((prev: string[]) => {
        return [...prev.filter(t => t !== topic)];
      });
      await confirmIt("There is a error with the request for retrieving nodes, please try again.", "Ok", "");
      console.error(error);
    }
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
    setSelectedTopic(null);
    setCurrentImprovement({});
    setIsChanged([]);
    setIsRemoved([]);
    setImprovements([]);
  };

  const scrollToCategory = (category: string) => {
    const categoryElement = document.getElementById(category);
    if (categoryElement) {
      categoryElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };
  useEffect(() => {
    if (currentImprovement.type === "topic") {
      setExpanded([currentImprovement.category]);
      scrollToCategory(currentImprovement.category);
    }
    const NEW_COURSES: any = JSON.parse(JSON.stringify(courses));
    const _selectedCourse = NEW_COURSES[selectedCourse];
    if (!_selectedCourse) return;
    const syllabus: any = _selectedCourse.syllabus;
    if (currentImprovement.type === "topic") {
      if (currentImprovement.action === "move") {
        const oldCategoryIndex = syllabus.findIndex((s: any) => s.title === currentImprovement.current_category);
        const oldTopicIndex = syllabus[oldCategoryIndex].topics.findIndex(
          (s: any) => s.title === currentImprovement.title
        );
        const oldTopic = syllabus[oldCategoryIndex].topics[oldTopicIndex];
        syllabus[oldCategoryIndex].color = "change";

        const newCategoryIndex = syllabus.findIndex((s: any) => s.title === currentImprovement.new_category);
        if (newCategoryIndex === -1) {
          return;
        }
        syllabus[newCategoryIndex].color = "change";
        const afterIndex = syllabus[newCategoryIndex].topics.findIndex(
          (s: any) => s.title === currentImprovement.new_after
        );

        const alreadyExist = syllabus[newCategoryIndex].topics.findIndex((s: any) => s.title === oldTopic.title);
        if (alreadyExist === -1) {
          oldTopic.color = "delete";
          oldTopic.action = "move";
          syllabus[newCategoryIndex].topics.splice(afterIndex + 1, 0, { ...oldTopic, color: "add" });
        }
        setExpanded([currentImprovement.current_category, currentImprovement.new_category]);
        scrollToCategory(currentImprovement.current_category);
      } else if (currentImprovement.action === "delete") {
        const oldCategoryIndex = syllabus.findIndex((s: any) => s.title === currentImprovement.category);
        const oldTopicIndex = syllabus[oldCategoryIndex].topics.findIndex(
          (s: any) => s.title === currentImprovement.title
        );

        syllabus[oldCategoryIndex].topics[oldTopicIndex].color = "delete";
        setExpanded([currentImprovement.category]);
        scrollToCategory(currentImprovement.category);
      } else if (currentImprovement.action === "divide") {
        const categoryIndex = syllabus.findIndex((s: any) => s.title === currentImprovement.category);
        const oldTopicIdx = syllabus[categoryIndex].topics.findIndex(
          (t: any) => t.title === currentImprovement.old_topic
        );
        syllabus[categoryIndex].topics[oldTopicIdx].color = "delete";
        syllabus[categoryIndex].topics[oldTopicIdx].action = "divide";
        const new_topics_copy = currentImprovement.new_topics.slice();
        new_topics_copy.forEach((t: any) => (t.color = "add"));
        syllabus[categoryIndex].topics = [...syllabus[categoryIndex].topics, ...new_topics_copy];
      } else if (currentImprovement.action === "add") {
        const categoryIndex = syllabus.findIndex((s: any) => s.title === currentImprovement.category);
        const afterIndex = syllabus[categoryIndex].topics.findIndex((t: any) => t.title === currentImprovement.after);

        const newTopic = currentImprovement.new_topic;
        syllabus[categoryIndex].topics.splice(afterIndex + 1, 0, { ...newTopic, color: "add" });
      }
    }
    if (currentImprovement.action === "add" && currentImprovement.type === "category") {
      const addAfterIdx = syllabus.findIndex((c: any) => c.title === currentImprovement.after);
      syllabus.splice(addAfterIdx + 1, 0, { ...currentImprovement.new_category, color: "add" });
    }
    setDisplayCourses(NEW_COURSES);
  }, [currentImprovement]);

  const getCourses = () => {
    if (displayCourses !== null) {
      return displayCourses;
    } else {
      return courses;
    }
  };

  const getColor = (action: "delete" | "add" | "change") => {
    switch (action) {
      case "delete":
        return "red";
      case "add":
        return "green";
      case "change":
        return "orange";
      default:
        return "";
    }
  };

  const createCourse = async () => {
    setCourses((prev: any) => {
      const _prev = [...prev];
      _prev.push({
        id: newId(db),
        title: "",
        prerequisiteKnowledge: "",
        learners: "",
        hours: 0,
        courseObjectives: [],
        courseSkills: [],
        description: "",
        syllabus: [],
        tags: [],
        references: [],
        new: true,
      });
      return _prev;
    });
    setSidebarOpen(false);
    setTimeout(() => {
      setSelectedCourse(courses.length);
    }, 1000);
    setCreatingCourseStep(0);
  };

  const deleteCourse = async () => {
    if (
      courses[selectedCourse].id &&
      (await confirmIt(`Do you want to delete this course?`, "Delete Course", "Keep Course"))
    ) {
      const courseRef = doc(db, "coursesAI", courses[selectedCourse].id);
      updateDoc(courseRef, { deleted: true });
      setSelectedCourse(0);
      setSidebarOpen(false);
      setCurrentImprovement({});
    }
  };
  const cancelCreatingCourse = () => {
    setCourses((prev: any) => {
      prev = prev.filter((p: any) => !p.new);
      return prev;
    });
    setSelectedCourse(0);
  };

  const generatePrerequisiteKnowledge = async () => {
    setLoadingPrerequisiteKnowledge(true);
    const courseTitle = courses[selectedCourse].title;
    const targetLearners = courses[selectedCourse].learners;
    const hours = courses[selectedCourse].hours;
    const response = await Post("/generateCoursePrerequisites", { courseTitle, targetLearners, hours });
    setCourses((prev: any) => {
      prev[selectedCourse].prerequisiteKnowledge = response;
      if (!prev[selectedCourse].new) {
        updateCourses(prev[selectedCourse]);
      }
      return prev;
    });
    setLoadingPrerequisiteKnowledge(false);
  };
  const generateDescription = async () => {
    setLoadingDescription(true);
    const courseTitle = courses[selectedCourse].title;
    const targetLearners = courses[selectedCourse].learners;
    const hours = courses[selectedCourse].hours;
    const response = await Post("/generateCourseDescription", { courseTitle, targetLearners, hours });
    setCourses((prev: any) => {
      prev[selectedCourse].description = response;
      if (!prev[selectedCourse].new) {
        updateCourses(prev[selectedCourse]);
      }
      return prev;
    });
    setLoadingDescription(false);
  };
  const generateObjectives = async () => {
    setLoadingObjectives(true);
    const courseTitle = courses[selectedCourse].title;
    const targetLearners = courses[selectedCourse].learners;
    const courseDescription = courses[selectedCourse].description;
    const hours = courses[selectedCourse].hours;
    const response = await Post("/generateCourseObjectives", { courseTitle, targetLearners, courseDescription, hours });
    setCourses((prev: any) => {
      prev[selectedCourse].courseObjectives = response;
      updateCourses(prev[selectedCourse]);
      return prev;
    });

    setLoadingObjectives(false);
  };
  const generateSkills = async () => {
    // setLoadingSkills(true);
    const courseTitle = courses[selectedCourse].title;
    const targetLearners = courses[selectedCourse].learners;
    const courseObjectives = courses[selectedCourse].courseObjectives;
    const courseDescription = courses[selectedCourse].description;
    const hours = courses[selectedCourse].hours;

    const response = await Post("/generateCourseSkills", {
      courseTitle,
      targetLearners,
      courseDescription,
      courseObjectives,
      hours,
    });
    setCourses((prev: any) => {
      prev[selectedCourse].courseSkills = response;
      if (prev[selectedCourse].new) {
        onCreateCourse(prev[selectedCourse]);
      } else {
        updateCourses(prev[selectedCourse]);
      }
      return prev;
    });
    // setLoadingSkills(false);
  };
  const generateCourseStructure = async () => {
    setLoadingCourseStructure(true);
    await generateSkills();

    const courseTitle = courses[selectedCourse].title;
    const targetLearners = courses[selectedCourse].learners;
    const courseObjectives = courses[selectedCourse].courseObjectives;
    const courseDescription = courses[selectedCourse].description;
    const courseSkills = courses[selectedCourse].courseSkills;
    const hours = courses[selectedCourse].hours;
    const prerequisiteKnowledge = courses[selectedCourse].prerequisiteKnowledge;

    const tags = courses[selectedCourse].tags;
    const references = courses[selectedCourse].references;

    const response: any = await Post("/generateCourseSyllabus", {
      courseId: courses[selectedCourse].id,
      courseTitle,
      targetLearners,
      courseObjectives,
      prerequisiteKnowledge,
      courseDescription,
      courseSkills,
      hours,
      tags,
      references,
    });

    if (response.length > 0) {
      setTimeout(() => {
        scrollToCategory(response.at(-1).category);
      }, 1000);
    }

    setLoadingCourseStructure(false);
  };

  const deleteCategory = async (c: any) => {
    if (
      await confirmIt(
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            gap: "10px",
          }}
        >
          <DeleteForeverIcon />
          <Typography sx={{ fontWeight: "bold" }}>Do you want to delete this category?</Typography>
        </Box>,
        "Delete Category",
        "Keep Category"
      )
    ) {
      const _courses = [...courses];
      const course = _courses[selectedCourse];
      const categoryIdx = course.syllabus.findIndex((s: any) => s.category === c.category);
      setGlowCategoryRedIndex(categoryIdx);
      setTimeout(() => {
        course.syllabus = course.syllabus.filter((s: any) => s.category !== c.category);
        setGlowCategoryRedIndex(-1);
        setCourses(_courses);
        updateCourses(_courses[selectedCourse]);
      }, 900);
    }
  };

  const handleEditCategory = () => {
    const _courses = [...courses];
    const course = _courses[selectedCourse];
    let glowIdx = -1;
    if (editCategory === "new") {
      course.syllabus.unshift({
        category: newCategoryTitle,
        topics: [],
      });
      glowIdx = 0;
    } else {
      const categoryIdx: any = course.syllabus.findIndex((s: any) => s.category === editCategory.category);
      if (categoryIdx !== -1) {
        course.syllabus[categoryIdx].category = newCategoryTitle;
        glowIdx = categoryIdx;
      }
    }
    setGlowCategoryGreenIndex(glowIdx);
    setTimeout(() => {
      setGlowCategoryGreenIndex(-1);
    }, 1000);

    setCourses(_courses);
    updateCourses(_courses[selectedCourse]);
    setEditCategory(null);
    setNewCategoryTitle("");
  };

  // const setNewSkills = (newTags: string[]) => {
  //   const _courses: any = [...courses];
  //   _courses[selectedCourse].courseSkills = newTags;
  //   setCourses(_courses);
  //   updateCourses(_courses[selectedCourse]);
  // };
  const setNewCourseObjectives = (newTags: string[]) => {
    const _courses: any = [...courses];
    _courses[selectedCourse].courseObjectives = newTags;
    setCourses(_courses);
    updateCourses(_courses[selectedCourse]);
  };

  const handleDragOver = (e: any) => {
    e.preventDefault();

    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const mouseY = e.clientY;

    const distanceFromTop = mouseY - containerRect.top;
    const distanceFromBottom = containerRect.bottom - mouseY;

    const scrollSpeed = 15;

    const scrollThreshold = 100;

    const scrollAreaHeight = 100;

    if (distanceFromTop < scrollAreaHeight) {
      const scrollAmount = scrollSpeed * (1 - distanceFromTop / scrollAreaHeight);

      container.scrollTop -= scrollAmount;
    } else if (distanceFromTop < scrollThreshold) {
      container.scrollTop -= scrollSpeed;
    } else if (distanceFromBottom < scrollThreshold) {
      container.scrollTop += scrollSpeed;
    }
  };
  const handleSorting = () => {
    const _courses = [...courses];
    const dragItemContent = _courses[selectedCourse].syllabus[dragItem.current];
    setGlowCategoryGreenIndex(dragOverItem.current);
    _courses[selectedCourse].syllabus.splice(dragItem.current, 1);
    _courses[selectedCourse].syllabus.splice(dragOverItem.current, 0, dragItemContent);
    setCourses(_courses);
    updateCourses(_courses[selectedCourse]);
    setTimeout(() => {
      setDragOverItemPointer(null);
      setDragOverTopicPointer(null);
      setGlowCategoryGreenIndex(-1);
    }, 700);
  };

  const handleSortingForItems = () => {
    const _courses = [...courses];
    const fromTopic = _courses[selectedCourse].syllabus[dragItem.current].topics[dragTopicItem.current];
    if (dragItem.current === dragOverItem.current) {
      const toTopic = _courses[selectedCourse].syllabus[dragItem.current].topics[dragOverTopicItem.current];
      _courses[selectedCourse].syllabus[dragItem.current].topics[dragTopicItem.current] = toTopic;
      _courses[selectedCourse].syllabus[dragItem.current].topics[dragOverTopicItem.current] = fromTopic;
      const modifiedTopic =
        _courses[selectedCourse].syllabus[dragItem.current].topics[dragOverTopicItem.current]?.title;
      setIsChanged([...isChanged, modifiedTopic]);
    } else {
      _courses[selectedCourse].syllabus[dragItem.current].topics.splice(dragTopicItem.current, 1);
      _courses[selectedCourse].syllabus[dragOverItem.current].topics.push(fromTopic);
      setGlowCategoryGreenIndex(dragOverItem.current);
    }
    setCourses(_courses);
    updateCourses(_courses[selectedCourse]);
    setTimeout(() => {
      setIsChanged([]);
      setDragOverItemPointer(null);
      setDragOverTopicPointer(null);
      setGlowCategoryGreenIndex(-1);
    }, 700);
  };
  const TriggerSlideAnimation = () => {
    setSlideIn(false);
    const timeoutId = setTimeout(() => {
      setSlideIn(true);
    }, 500);

    return () => clearTimeout(timeoutId);
  };
  const getStepTitle = () => {
    if (creatingCourseStep === 0) {
      return "Edit Course Title";
    } else if (creatingCourseStep === 1) {
      return "Edit Number of Hour-long Class Sessions";
    } else if (creatingCourseStep === 2) {
      return "Select Book";
    } else if (creatingCourseStep === 3) {
      return "Edit Target Learners";
    } else if (creatingCourseStep === 4) {
      return "Edit Prerequisite Knowledge";
    } else if (creatingCourseStep === 5) {
      return "Edit Course Description";
    } else if (creatingCourseStep === 6) {
      return "Edit Course Objectives";
    } else if (creatingCourseStep === 7) {
      return "Edit Course Skills";
    } else if (creatingCourseStep === 8) {
      return "Edit Course Structure";
    }
  };
  const nextStep = () => {
    if (creatingCourseStep === 3) {
      generatePrerequisiteKnowledge();
    }
    if (creatingCourseStep === 4) {
      generateDescription();
    }
    if (creatingCourseStep === 5) {
      generateObjectives();
    }
    // if (creatingCourseStep === 5) {
    //   generateSkills();
    // }
    if (creatingCourseStep === 6) {
      generateCourseStructure();
    }
    setCreatingCourseStep(prev => prev + 1);
  };
  const nextButtonDisabled = (course: any) => {
    if (creatingCourseStep === 0) {
      return !course.title.trim();
    }
    if (creatingCourseStep === 1) {
      return course.hours === 0;
    }
    if (creatingCourseStep === 2) {
      return (course?.tags || []).length <= 0;
    }
    if (creatingCourseStep === 3) {
      return !course.learners.trim();
    }
    if (creatingCourseStep === 4) {
      return !course.prerequisiteKnowledge.trim();
    }
    if (creatingCourseStep === 5) {
      return !course.description.trim();
    }
    if (creatingCourseStep === 6) {
      return course.courseObjectives.length <= 0;
    }
    // if (creatingCourseStep === 7) {
    //   return course.courseSkills.length <= 0;
    // }

    return false;
  };
  const handleRemoveNode = async (topic: string, node: string) => {
    if (
      await confirmIt(
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            gap: "10px",
          }}
        >
          <DeleteForeverIcon />
          <Typography sx={{ fontWeight: "bold" }}>Do you want to delete this node under the topic?</Typography>
        </Box>,
        "Delete Node",
        "Keep Node"
      )
    ) {
      const course = courses[selectedCourse];
      if (!course.nodes[topic]) {
        return;
      }
      const newNodes = course.nodes[topic].filter((n: any) => n.node !== node);
      course.nodes[topic] = newNodes;
      updateCourses(course);
      setSidebarOpen(false);
      setNodePublicView(null);
      setExpandedNode(null);
    }
  };

  const generateImageForTopic = async () => {
    try {
      if (selectedTopic) {
        setLoadingImage(true);
        const { imageUrl } = (await Post("/generateCourseImage", {
          title: selectedTopic.title,
          content: selectedTopic.description,
          courseTitle: courses[selectedCourse].title,
          courseDescription: courses[selectedCourse].description,
          targetLearners: courses[selectedCourse].learners,
          syllabus: courses[selectedCourse].syllabus,
          prerequisiteKnowledge: selectedTopic.prerequisiteKnowledge,
          sessions: courses[selectedCourse].hours,
          objectives: selectedTopic.objectives,
        })) as { imageUrl: string };

        if (imageUrl) {
          const updatedCourses = [...courses];
          updatedCourses[selectedCourse].syllabus[selectedTopic.categoryIndex].topics[selectedTopic.topicIndex] = {
            ...updatedCourses[selectedCourse].syllabus[selectedTopic.categoryIndex].topics[selectedTopic.topicIndex],
            imageUrl: imageUrl,
          };
          setSelectedTopic({
            categoryIndex: selectedTopic.categoryIndex,
            topicIndex: selectedTopic.topicIndex,
            ...updatedCourses[selectedCourse].syllabus[selectedTopic.categoryIndex].topics[selectedTopic.topicIndex],
          });
          setCourses(updatedCourses);
          updateCourses(updatedCourses[selectedCourse]);
        }
        setLoadingImage(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const generateImageForCategory = async () => {
    if (selectedOpenCategory) {
      setLoadingImage(true);
      const { imageUrl } = (await Post("/generateCourseImage", {
        title: selectedOpenCategory.title,
        content: selectedOpenCategory.description,
        courseTitle: courses[selectedCourse].title,
        courseDescription: courses[selectedCourse].description,
        targetLearners: courses[selectedCourse].learners,
        syllabus: courses[selectedCourse].syllabus,
        prerequisiteKnowledge: selectedOpenCategory.prerequisiteKnowledge,
        sessions: courses[selectedCourse].hours,
        objectives: selectedOpenCategory.objectives,
      })) as { imageUrl: string };
      const updatedCourses = [...courses];
      updatedCourses[selectedCourse].syllabus[selectedOpenCategory.categoryIndex] = {
        ...updatedCourses[selectedCourse].syllabus[selectedOpenCategory.categoryIndex],
        imageUrl: imageUrl,
      };
      setSelectedOpenCategory({
        categoryIndex: selectedOpenCategory.categoryIndex,
        ...updatedCourses[selectedCourse].syllabus[selectedOpenCategory.categoryIndex],
      });
      setCourses(updatedCourses);
      updateCourses(updatedCourses[selectedCourse]);
      setLoadingImage(false);
    }
  };
  const generateMorePromptsForTopic = async () => {
    try {
      setLoadingPrompt(true);
      const courseTitle = courses[selectedCourse].title;
      const targetLearners = courses[selectedCourse].targetLearners;
      const hours = selectedTopic.hours;
      const prerequisiteKnowledge = selectedTopic.prerequisiteKnowledge;
      const courseDescription = courses[selectedCourse].description;
      const courseObjectives = courses[selectedCourse].objectives;
      const courseSkills = courses[selectedCourse].skills;
      const syllabus = courses[selectedCourse].syllabus;
      const topic = selectedTopic.title;

      const { prompts } = (await Post("/generateMorePromptsForTopic", {
        courseTitle,
        targetLearners,
        hours,
        prerequisiteKnowledge,
        courseDescription,
        courseObjectives,
        courseSkills,
        syllabus,
        topic,
      })) as { prompts: any };
      const updatedCourses = [...courses];
      const currentTopic =
        updatedCourses[selectedCourse].syllabus[selectedTopic.categoryIndex].topics[selectedTopic.topicIndex];
      currentTopic.prompts = [...currentTopic.prompts, ...prompts];

      setCourses(updatedCourses);
      setSelectedTopic({
        categoryIndex: selectedTopic.categoryIndex,
        topicIndex: selectedTopic.topicIndex,
        ...currentTopic,
      });
      updateCourses({
        id: updatedCourses[selectedCourse].id,
        syllabus: updatedCourses[selectedCourse].syllabus,
      });
      setLoadingPrompt(false);
    } catch (error) {
      setLoadingPrompt(false);
      console.error(error);
    }
  };

  const retrieveNodeData = useCallback(
    async (node: INode, topicTitle: string, idx: number) => {
      if (node && selectedTopic) {
        let keywords = "";
        for (let tag of node.tags || []) {
          keywords += escapeBreaksQuotes(tag) + ", ";
        }

        const updatedStr =
          node.changedAt && node.changedAt instanceof Timestamp
            ? dayjs(new Date(node.changedAt.toDate())).format("YYYY-MM-DD")
            : "";
        const createdStr =
          node.createdAt && node.createdAt instanceof Timestamp
            ? dayjs(new Date(node.createdAt.toDate())).format("YYYY-MM-DD")
            : "";

        const course = courses[selectedCourse];
        setNodePublicView({ ...node, topic: topicTitle });
        if (!node?.updatedStr) {
          setNodePublicViewLoader(true);
          const nodeResponse = await getNodeDataForCourse(node?.node || "");
          const updatedData = {
            ...node,
            createdStr,
            updatedStr,
            keywords,
            children: nodeResponse.children,
            parents: nodeResponse.parents,
            contributors: nodeResponse.contributors,
            institutions: nodeResponse.institutions,
          };
          course.nodes[topicTitle][idx] = updatedData;
          setNodePublicView({ ...updatedData, topic: topicTitle });
          updateCourses(course);
          setNodePublicViewLoader(false);
        }
      }
    },
    [courses, selectedCourse, updateCourses]
  );

  const retrieveNodeQuestions = useCallback(
    async (nodeId: string) => {
      try {
        setQuestionsLoader(true);
        const updatedCourses = [...courses];
        const prevQuestions = updatedCourses[selectedCourse]?.questions?.[nodeId] ?? [];
        const courseId = courses[selectedCourse].id;
        await Post("/retrieveGenerateQuestions", {
          courseId,
          courseTitle: courses[selectedCourse].title,
          courseDescription: courses[selectedCourse].description,
          targetLearners: courses[selectedCourse].learners,
          nodeId,
          previousQuestions: prevQuestions,
        });
        setQuestionsLoader(false);
      } catch (error) {
        setQuestionsLoader(false);
        await confirmIt("There is a error with the request for retrieving questions, please try again.", "Ok", "");
        console.error(error);
      }
    },
    [setNodePublicViewLoader, setNodePublicView, setNodePublicViewLoader, expandedNode, courses, selectedCourse]
  );

  const retrievePrerequisites = useCallback(
    async (nodeId: string, topic: string, type: "parents" | "children") => {
      try {
        setPrerequisitesLoader(type);
        const courseId = courses[selectedCourse].id;
        const result: any = await Post("/retrieveNodePrerequesites", {
          nodeId,
          type,
          topic,
          courseId,
        });
        setNodePublicView({ ...nodePublicView, [type]: [...nodePublicView[type], ...(result?.nodes || [])] });

        setPrerequisitesLoader(null);
      } catch (error) {
        setPrerequisitesLoader(null);
        await confirmIt("There is a error with the request for retrieving questions, please try again.", "Ok", "");
        console.error(error);
      }
    },
    [setNodePublicViewLoader, setNodePublicView, setNodePublicViewLoader, expandedNode, courses, selectedCourse]
  );

  const handleQuestion = useCallback(
    (question: any, idx: number, nodeId: number) => {
      const updatedCourses = [...courses];
      if (updatedCourses[selectedCourse]?.questions?.[nodeId]) {
        updatedCourses[selectedCourse].questions[nodeId][idx] = question;
        setCourses(updatedCourses);
        updateCourses(updatedCourses[selectedCourse]);
      }
    },
    [courses, selectedCourse, setCourses]
  );
  const saveChanges = async (values: ProposalFormValues) => {
    try {
      setNodePublicViewLoader(true);

      const course = courses[selectedCourse];

      const nodes = { ...course.nodes };
      const nodeIdx = nodes[selectedTopic?.title].findIndex((n: { node: string }) => n.node === nodePublicView.node);
      let nodeData = nodes[nodeIdx];
      nodeData = {
        ...nodeData,
        ...values,
      };
      course.nodes[selectedTopic?.title][nodeIdx] = nodeData;
      setNodePublicView(course.nodes[selectedTopic?.title][nodeIdx]);
      updateCourses(course);
      setNodePublicViewLoader(false);
      setEditMode(false);
    } catch (error) {
      console.error(error);
    }
  };

  if (courses.length <= 0) {
    return (
      <Box
        sx={{
          height: "100vh",
          width: sidebarOpen ? "70%" : "100%",
          flex: sidebarOpen ? 0.7 : 1,
          transition: "flex 0.3s",
          overflow: "auto",
          background: theme =>
            theme.palette.mode === "dark"
              ? theme.palette.common.darkGrayBackground
              : theme.palette.common.lightGrayBackground,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <LoadingButton
          variant="contained"
          color="success"
          sx={{ color: "white", zIndex: 9, fontSize: "15px", ml: "15px" }}
          onClick={createCourse}
          loading={loading}
        >
          Create New Course
        </LoadingButton>
      </Box>
    );
  }
  return (
    <Box
      sx={{
        height: "100vh",
        width: sidebarOpen ? "70%" : "100%",
        flex: sidebarOpen ? 0.7 : 1,
        transition: "flex 0.3s",
        overflow: "auto",
        background: theme =>
          theme.palette.mode === "dark"
            ? theme.palette.common.darkGrayBackground
            : theme.palette.common.lightGrayBackground,
        "&::-webkit-scrollbar": {
          width: "12px",
        },
        "&::-webkit-scrollbar-track": {
          background: theme => (theme.palette.mode === "dark" ? "#28282a" : "white"),
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "#888",
          borderRadius: "10px",
          border: theme => (theme.palette.mode === "dark" ? "3px solid #28282a" : "3px solid white"),
        },
        "&::-webkit-scrollbar-thumb:hover": {
          background: DESIGN_SYSTEM_COLORS.orange400,
        },
      }}
    >
      <AppHeaderMemoized
        page="ONE_CADEMY"
        tutorPage={true}
        sections={[]}
        selectedSectionId={""}
        onSwitchSection={() => {}}
        aiCourse={true}
      />
      {courses[selectedCourse].new && creatingCourseStep <= 6 && (
        <LoadingButton
          variant="contained"
          color="error"
          sx={{
            color: "white",
            zIndex: 9,
            fontSize: "15px",
            mt: "45px",
            position: "absolute",
            right: 4,
            mr: "6px",
            height: "34px",
          }}
          onClick={cancelCreatingCourse}
          loading={loading}
        >
          Close
        </LoadingButton>
      )}
      <Box
        padding="20px"
        sx={{
          background: theme =>
            theme.palette.mode === "dark"
              ? theme.palette.common.darkGrayBackground
              : theme.palette.common.lightGrayBackground,
          "&::-webkit-scrollbar-track": {
            background: theme => (theme.palette.mode === "dark" ? "#28282a" : "#f1f1f1"),
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#888",
            borderRadius: "10px",
            border: theme => (theme.palette.mode === "dark" ? "3px solid #28282a" : "3px solid #f1f1f1"),
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: "#555",
          },
        }}
      >
        <Box>
          {!courses[selectedCourse]?.new && (
            <TextField
              value={courses[selectedCourse].title}
              onChange={event => {
                const courseIdx = courses.findIndex((course: any) => course.title === event.target.value);
                if (courseIdx !== -1) {
                  setSelectedCourse(courseIdx);
                  setImprovements([]);
                  setSidebarOpen(false);
                }
              }}
              select
              label="Select Course"
              sx={{ minWidth: "200px" }}
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
            </TextField>
          )}
          {!courses[selectedCourse].new && (
            <LoadingButton
              variant="contained"
              color="error"
              sx={{ color: "white", zIndex: 9, fontSize: "15px", ml: "15px" }}
              onClick={deleteCourse}
              loading={loading}
            >
              Delete Course
            </LoadingButton>
          )}

          {!courses[selectedCourse].new && (
            <LoadingButton
              variant="contained"
              color="success"
              sx={{ color: "white", zIndex: 9, fontSize: "15px", ml: "15px" }}
              onClick={createCourse}
              loading={loading}
            >
              Create New Course
            </LoadingButton>
          )}

          <Box sx={{ display: "flex", gap: "15px" }}>
            {(!courses[selectedCourse].new || creatingCourseStep >= 0) && (
              <TextField
                label="Course Title"
                multiline
                value={courses[selectedCourse].title}
                onChange={handleTitleChange}
                margin="normal"
                variant="outlined"
                sx={{ backgroundColor: theme => (theme.palette.mode === "dark" ? "" : "white"), width: "500px" }}
                InputLabelProps={{
                  style: { color: "grey" },
                }}
              />
            )}
            {(!courses[selectedCourse].new || creatingCourseStep >= 1) && (
              <TextField
                label="Number of Hour-long Class Sessions"
                fullWidth
                value={courses[selectedCourse].hours || ""}
                onChange={handleHoursChange}
                margin="normal"
                variant="outlined"
                sx={{ width: "500px" }}
                type="number"
                inputProps={{ min: 0 }}
                InputLabelProps={{
                  style: { color: "grey" },
                }}
              />
            )}
            {(!courses[selectedCourse].new || creatingCourseStep >= 2) && (
              <TextField
                value={courses[selectedCourse]?.references[0] || ""}
                select
                label="Select Book"
                sx={{ mt: "15px", minWidth: "200px" }}
                onChange={event => {
                  const updatedCourses: any = [...courses];
                  const bookIdx = books.findIndex(b => b.id === event.target.value);
                  updatedCourses[selectedCourse] = {
                    ...updatedCourses[selectedCourse],
                    tags: books[bookIdx].tags,
                    references: books[bookIdx].references,
                  };
                  setCourses(updatedCourses);
                  updateCourses(updatedCourses[selectedCourse]);
                }}
              >
                <MenuItem
                  value=""
                  disabled
                  sx={{ backgroundColor: theme => (theme.palette.mode === "dark" ? "" : "white") }}
                >
                  Select Book
                </MenuItem>
                {books.map((book: any) => (
                  <MenuItem
                    key={book.id}
                    value={book.id}
                    sx={{ backgroundColor: theme => (theme.palette.mode === "dark" ? "" : "white") }}
                  >
                    {book.id}
                  </MenuItem>
                ))}
              </TextField>
            )}
          </Box>

          {(!courses[selectedCourse].new || creatingCourseStep >= 3) && (
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
              InputLabelProps={{
                style: { color: "grey" },
              }}
            />
          )}
          {(!courses[selectedCourse].new || creatingCourseStep >= 4) &&
            (loadingPrerequisiteKnowledge ? (
              <LinearProgress />
            ) : (
              <TextField
                label="Prerequisite Knowledge"
                multiline
                fullWidth
                value={courses[selectedCourse].prerequisiteKnowledge}
                onChange={handlePrerequisiteChange}
                margin="normal"
                variant="outlined"
                minRows={4}
                sx={{ backgroundColor: theme => (theme.palette.mode === "dark" ? "" : "white") }}
                InputLabelProps={{
                  style: { color: "grey" },
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <LoadingButton
                        onClick={generatePrerequisiteKnowledge}
                        sx={{
                          display: "flex-end",
                        }}
                        loading={loadingDescription}
                      >
                        <AutoFixHighIcon />
                      </LoadingButton>
                    </InputAdornment>
                  ),
                }}
              />
            ))}
          {(!courses[selectedCourse].new || creatingCourseStep >= 5) &&
            (loadingDescription ? (
              <LinearProgress />
            ) : (
              <TextField
                label="Course Description"
                multiline
                fullWidth
                value={courses[selectedCourse].description}
                onChange={handleDescriptionChange}
                margin="normal"
                variant="outlined"
                minRows={4}
                sx={{ backgroundColor: theme => (theme.palette.mode === "dark" ? "" : "white") }}
                InputLabelProps={{
                  style: {
                    color: "gray",
                  },
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <LoadingButton
                        onClick={generateDescription}
                        sx={{
                          display: "flex-end",
                        }}
                        loading={loadingDescription}
                      >
                        <AutoFixHighIcon />
                      </LoadingButton>
                    </InputAdornment>
                  ),
                }}
              />
            ))}

          {(!courses[selectedCourse].new || creatingCourseStep >= 6) &&
            (loadingObjectives ? (
              <LinearProgress />
            ) : (
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", py: "15px" }}>
                  <Typography sx={{ mt: "5px" }}>Course Objectives:</Typography>
                  <InputAdornment position="end">
                    <LoadingButton
                      onClick={generateObjectives}
                      sx={{
                        display: "flex-end",
                      }}
                      loading={loadingObjectives}
                    >
                      <AutoFixHighIcon />
                    </LoadingButton>
                  </InputAdornment>
                </Box>
                <ChipInput
                  tags={courses[selectedCourse].courseObjectives || []}
                  selectedTags={() => {}}
                  setTags={setNewCourseObjectives}
                  fullWidth
                  variant="outlined"
                  placeholder="Add a new course objective..."
                />
              </Box>
            ))}

          {/* {(!courses[selectedCourse].new || creatingCourseStep >= 6) &&
            (loadingSkills ? (
              <LinearProgress />
            ) : (
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", py: "15px" }}>
                  <Typography sx={{ mt: "5px" }}>Course Skills:</Typography>
                  <InputAdornment position="end">
                    <LoadingButton
                      onClick={generateSkills}
                      sx={{
                        display: "flex-end",
                      }}
                      loading={loadingSkills}
                    >
                      <AutoFixHighIcon />
                    </LoadingButton>
                  </InputAdornment>
                </Box>
                <ChipInput
                  tags={courses[selectedCourse].courseSkills || []}
                  selectedTags={() => {}}
                  setTags={setNewSkills}
                  fullWidth
                  variant="outlined"
                  placeholder="Add a new course skill..."
                />
              </Box>
            ))} */}

          {creatingCourseStep >= 7 &&
            (loadingCourseStructure ? (
              <LinearProgress />
            ) : (
              <Box sx={{ display: "flex", alignItems: "center", py: "15px", mt: "26px" }}>
                <Typography variant="h2">Course Structure:</Typography>
                <Button sx={{ ml: "19px" }} onClick={() => setEditCategory("new")}>
                  Add Category
                </Button>
                <InputAdornment position="end">
                  <LoadingButton
                    onClick={generateCourseStructure}
                    sx={{
                      display: "flex-end",
                    }}
                    loading={loadingCourseStructure}
                  >
                    <AutoFixHighIcon />
                  </LoadingButton>
                </InputAdornment>
              </Box>
            ))}

          <Box ref={containerRef} marginTop="20px">
            {(getCourses()[selectedCourse].syllabus || []).map((category: any, categoryIndex: any) => (
              <Accordion id={category.title} key={category.title} expanded={expanded.includes(category.title)}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls={`panel${categoryIndex}-content`}
                  id={`panel${categoryIndex}-header`}
                  onClick={e => {
                    e.stopPropagation();
                    if (expanded.includes(category.title)) {
                      setExpanded([]);
                      setSelectedOpenCategory(null);
                      if (!Object.keys(currentImprovement || {}).length) {
                        setSidebarOpen(false);
                      }
                    } else {
                      setExpanded([category.title]);
                      setSelectedTopic(null);
                      if (!Object.keys(currentImprovement || {}).length) {
                        setSelectedOpenCategory({ categoryIndex, ...category });
                        setSidebarOpen(true);
                      }
                    }
                    setExpandedNode(null);
                  }}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderLeft:
                      dragOverItemPointer === categoryIndex
                        ? `solid 4px ${DESIGN_SYSTEM_COLORS.success400}`
                        : undefined,
                    animation:
                      categoryIndex === glowCategoryGreenIndex
                        ? `${glowGreen} 1.5s ease-in-out infinite`
                        : categoryIndex === glowCategoryRedIndex
                        ? `${glowRed} 1.5s ease-in-out infinite`
                        : "",
                    color: getColor(category.color),
                  }}
                  draggable
                  onDragStart={() => {
                    dragItem.current = categoryIndex;
                  }}
                  onDragEnter={() => {
                    dragOverItem.current = categoryIndex;
                    setDragOverItemPointer(categoryIndex);
                    //dragOverTopicItem.current = categoryIndex;
                  }}
                  onDragOver={handleDragOver}
                  onDragEnd={handleSorting}
                >
                  <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
                    <DragIndicatorIcon />
                    {currentImprovement.type === "category" &&
                    currentImprovement.action === "modify" &&
                    currentImprovement.old_category === category.title ? (
                      <Box sx={{ display: "flex", gap: "5px", width: "100%", justifyContent: "space-between" }}>
                        <Box sx={{ display: "flex", gap: "5px" }}>
                          <Typography variant="h6" sx={{ textDecoration: "line-through" }}>
                            {category.title}
                          </Typography>
                          <Typography variant="h6" sx={{ color: "green" }}>
                            {currentImprovement.new_category.title}
                          </Typography>
                        </Box>
                      </Box>
                    ) : (
                      <Box sx={{ display: "flex", width: "100%", alignItems: "center" }}>
                        <Typography
                          variant="h4"
                          sx={{
                            color: getColor(category.color),
                          }}
                        >
                          {category.title}
                        </Typography>
                        {expanded.includes(category.title) && Object.keys(currentImprovement).length <= 0 && (
                          <Box sx={{ ml: "14px" }}>
                            <Button
                              onClick={e => {
                                e.stopPropagation();
                                handleOpenDialog(categoryIndex);
                              }}
                            >
                              Add topic
                            </Button>
                          </Box>
                        )}
                      </Box>
                    )}
                    {!category.hasOwnProperty("topics") && !getCourses()[selectedCourse].done && (
                      <LinearProgress sx={{ width: "100%" }} />
                    )}
                  </Box>
                </AccordionSummary>
                {expanded.includes(category.title) && (
                  <AccordionDetails>
                    {!category.hasOwnProperty("topics") && !getCourses()[selectedCourse].done ? (
                      <LinearProgress />
                    ) : (
                      <Grid container spacing={2}>
                        {[...(category.topics || [])].map((tc: any, topicIndex: any) => (
                          <Grid item xs={12} key={topicIndex} sx={{ borderRadius: "25px" }}>
                            <Accordion
                              expanded={expandedTopics.includes(tc.title)}
                              onChange={(e, isExpanded) => {
                                let newExpanded = [];
                                if (isExpanded) {
                                  newExpanded = [...expandedTopics, tc.title];
                                  if (Object.keys(currentImprovement || {}).length <= 0) {
                                    setSidebarOpen(true);
                                    setSelectedTopic({ categoryIndex, topicIndex, ...tc });
                                  }
                                } else {
                                  if (Object.keys(currentImprovement || {}).length <= 0) {
                                    setSidebarOpen(false);
                                  }
                                  newExpanded = expandedTopics.filter((topic: string) => topic !== tc.title);
                                }

                                setSelectedOpenCategory(null);
                                setExpandedTopics(newExpanded);
                                setExpandedNode(null);
                              }}
                              sx={{
                                backgroundColor: theme => (theme.palette.mode === "dark" ? "#161515" : "white"),
                                borderRadius: "25px",
                              }}
                            >
                              <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls={`panel${categoryIndex}-${topicIndex}-content`}
                                id={`panel${categoryIndex}-${topicIndex}-header`}
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  borderRadius: "25px",
                                  borderLeft:
                                    dragOverTopicPointer === topicIndex
                                      ? `solid 4px ${DESIGN_SYSTEM_COLORS.success400}`
                                      : undefined,
                                  animation: isRemoved.includes(tc.title)
                                    ? `${glowRed} 1.5s ease-in-out infinite`
                                    : isChanged.includes(tc.title)
                                    ? `${glowGreen} 1.5s ease-in-out infinite`
                                    : "",
                                  // border: `1px solid ${getTopicColor(category, tc)}`,
                                }}
                                draggable
                                onDragStart={() => {
                                  dragItem.current = categoryIndex;
                                  dragTopicItem.current = topicIndex;
                                }}
                                onDragEnter={() => {
                                  dragOverTopicItem.current = topicIndex;
                                  dragOverItem.current = categoryIndex;
                                  setDragOverTopicPointer(topicIndex);
                                  setDragOverItemPointer(categoryIndex);
                                }}
                                onDragOver={() => {
                                  // console.log("onDragOver");
                                }}
                                onDragEnd={handleSortingForItems}
                              >
                                {" "}
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    width: "100%",
                                  }}
                                >
                                  <Box sx={{ display: "flex", alignItems: "center" }}>
                                    <DragIndicatorIcon sx={{ color: getColor(tc.color) }} />
                                    <Typography
                                      variant="h6"
                                      sx={{
                                        textAlign: "center",
                                        color: getColor(tc.color),
                                        fontWeight: 300,
                                      }}
                                    >
                                      {tc?.title || ""}
                                    </Typography>
                                    {tc.action === "move" && <SwapHorizIcon sx={{ color: getColor(tc.color) }} />}
                                    {tc.action === "divide" && <AltRouteIcon sx={{ color: getColor(tc.color) }} />}
                                    {tc.color === "add" && <AddIcon sx={{ color: getColor(tc.color) }} />}
                                  </Box>
                                  <Box sx={{ display: "flex", gap: "15px", mr: 2 }}>
                                    <Typography>
                                      Hours:{" "}
                                      <Typography display={"inline"} color={DESIGN_SYSTEM_COLORS.orange300}>
                                        {tc?.hours || 0}
                                      </Typography>
                                    </Typography>
                                    <Typography>
                                      Difficulty:{" "}
                                      <Typography display={"inline"} color={difficulties[tc?.difficulty || ""]?.color}>
                                        {difficulties[tc?.difficulty || ""]?.label}
                                      </Typography>
                                    </Typography>
                                  </Box>
                                </Box>
                              </AccordionSummary>
                              <AccordionDetails>
                                {/* {loadingNodes && <LinearProgress />} */}
                                <Masonry columns={{ xs: 1, md: 2, lg: 3 }} spacing={2}>
                                  {((courses[selectedCourse].nodes || {})[tc.title] || []).map(
                                    (n: any, idx: number) => (
                                      <Box key={n.node} sx={{ mb: "10px" }}>
                                        <Accordion
                                          id={n.node}
                                          expanded={true}
                                          sx={{
                                            borderRadius: "13px!important",

                                            overflow: "hidden",
                                            listStyle: "none",
                                            transition: "box-shadow 0.3s",

                                            backgroundColor: theme =>
                                              theme.palette.mode === "dark" ? "#1f1f1f" : "white",
                                            border:
                                              expandedNode && expandedNode.node === n.node ? `2px solid orange` : "",
                                            p: "0px !important",
                                            cursor: "pointer",
                                          }}
                                          onClick={e => {
                                            e.stopPropagation();
                                            if (expandedNode === n.node) {
                                              setExpandedNode(null);
                                            } else {
                                              setSidebarOpen(true);
                                              setExpandedNode(n);
                                              retrieveNodeData(n, tc.title, idx);
                                              setSelectedTopic(tc);
                                            }
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
                                                sx={{
                                                  display: "flex",
                                                  alignItems: "center",
                                                  m: "15px 15px 0px 15px",
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
                                                    id={n.title}
                                                    nodeType={n.nodeType}
                                                    tooltipPlacement={"top"}
                                                    fontSize={"medium"}
                                                    // disabled={disabled}
                                                  />
                                                  <MarkdownRender
                                                    text={n?.title}
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

                                          <AccordionDetails /* sx={{ p: "0px !important" }} */>
                                            <Box sx={{ p: "15px", pt: 0 }}>
                                              <Box
                                                sx={{
                                                  transition: "border 0.3s",
                                                }}
                                              >
                                                <MarkdownRender
                                                  text={n.content}
                                                  sx={{
                                                    fontSize: "16px",
                                                    fontWeight: 400,
                                                    letterSpacing: "inherit",
                                                  }}
                                                />
                                              </Box>
                                              {/* <FlashcardVideo flashcard={concept} /> */}
                                              {(n?.nodeImage || []).length > 0 && (
                                                <Box sx={{ mt: "15px" }}>
                                                  <ImageSlider images={[n?.nodeImage]} />
                                                </Box>
                                              )}
                                            </Box>
                                          </AccordionDetails>
                                        </Accordion>
                                      </Box>
                                    )
                                  )}
                                </Masonry>
                                {Object.keys(currentImprovement || {}).length <= 0 && (
                                  <Box mt={2} sx={{ display: "flex", justifyContent: "center" }}>
                                    <CustomButton
                                      variant="contained"
                                      type="button"
                                      color="secondary"
                                      onClick={() => {
                                        retrieveNodesForTopic(tc.title);
                                      }}
                                    >
                                      {loadingNodes.includes(tc.title)
                                        ? "Retrieving Concept Cards"
                                        : "Retrieve More Concept Cards"}
                                      {loadingNodes.includes(tc.title) ? (
                                        <CircularProgress sx={{ ml: 1 }} size={20} />
                                      ) : (
                                        <AutoFixHighIcon sx={{ ml: 1 }} />
                                      )}
                                    </CustomButton>
                                  </Box>
                                )}
                              </AccordionDetails>
                            </Accordion>
                          </Grid>
                        ))}
                      </Grid>
                    )}
                  </AccordionDetails>
                )}
              </Accordion>
            ))}
          </Box>

          {(courses[selectedCourse].syllabus || []).length > 0 && courses[selectedCourse].done && (
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
            </Box>
          )}
          {courses[selectedCourse].new && creatingCourseStep <= 6 && (
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
              <Box sx={{ display: "flex", alignItems: "center", gap: "5px", fontWeight: "bold" }}>
                {!loadingCourseStructure &&
                  !loadingDescription &&
                  !loadingObjectives &&
                  !loadingPrerequisiteKnowledge && <Typography>{getStepTitle()} OR </Typography>}
                <LoadingButton
                  variant="contained"
                  color="success"
                  sx={{ color: "white", zIndex: 9, fontSize: "15px" }}
                  onClick={nextStep}
                  loading={loading}
                  disabled={nextButtonDisabled(courses[selectedCourse])}
                >
                  Continue
                </LoadingButton>
              </Box>
            </Box>
          )}
          <Dialog
            open={!!editCategory}
            onClose={() => {
              setEditCategory(null);
              setNewCategoryTitle("");
            }}
            sx={{ zIndex: 9998 }}
          >
            <DialogTitle>{`${editCategory === "new" ? "Add" : "Edit"} Category`}</DialogTitle>
            <DialogContent>
              <TextField
                label={"Category Title"}
                multiline
                fullWidth
                value={newCategoryTitle}
                onChange={event => setNewCategoryTitle(event.target.value)}
                margin="normal"
                variant="outlined"
                sx={{ width: "500px" }}
              />
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => {
                  setEditCategory(null);
                }}
                color="primary"
                variant="contained"
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditCategory}
                color="primary"
                variant="contained"
                disabled={!newCategoryTitle.trim()}
              >
                Save
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
                InputLabelProps={{
                  style: { color: "grey" },
                }}
              />
              <TextField
                label={editTopic ? "Edit Description" : "Enter Description"}
                multiline
                fullWidth
                value={topicDescription}
                onChange={event => setTopicDescription(event.target.value)}
                margin="normal"
                variant="outlined"
                sx={{ width: "500px" }}
                InputLabelProps={{
                  style: { color: "grey" },
                }}
              />
              {/* <Box sx={{ display: "column" }}>
                <Typography>Skills:</Typography>
                <ChipInput
                  tags={skills || []}
                  setTags={setSkills}
                  selectedTags={() => {}}
                  fullWidth
                  variant="outlined"
                  placeholder="Type a new skill and click enter ↵ to add it..."
                />
              </Box> */}
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
                >
                  <MenuItem value="easy" sx={{ color: difficulties["easy"].color }}>
                    Easy
                  </MenuItem>
                  <MenuItem value="medium" sx={{ color: difficulties["medium"].color }}>
                    Medium
                  </MenuItem>
                  <MenuItem value="hard" sx={{ color: difficulties["hard"].color }}>
                    Hard
                  </MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Hours"
                fullWidth
                value={hours || ""}
                onChange={event => setHours(Number(event.target.value))}
                margin="normal"
                variant="outlined"
                sx={{ width: "500px" }}
                type="number"
                inputProps={{ min: 0 }}
                InputLabelProps={{
                  style: { color: "grey" },
                }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog} color="primary" variant="contained">
                Cancel
              </Button>
              <Button onClick={handleSaveTopic} color="primary" variant="contained">
                {editTopic ? "Save" : "Add"}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
      {sidebarOpen && (
        <Paper
          sx={{
            height: "100vh",
            backgroundColor: "white",
            boxShadow: 3,
            position: "fixed",
            borderTopLeftRadius: "25px",
            right: 0,
            top: 0,
            zIndex: 9999,

            background: theme => (theme.palette.mode === "dark" ? theme.palette.common.darkBackground : ""),
            width: sidebarOpen ? "30%" : "0%",
            transition: "width 0.3s",
            overflowX: "hidden",
            p: 3,
            transform: sidebarOpen ? "translateX(0)" : "translateX(30%)",
            "&::-webkit-scrollbar": {
              width: "12px",
            },
            "&::-webkit-scrollbar-track": {
              background: theme => (theme.palette.mode === "dark" ? "#28282a" : "white"),
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#888",
              borderRadius: "10px",
              border: theme => (theme.palette.mode === "dark" ? "3px solid #28282a" : "3px solid white"),
            },
            "&::-webkit-scrollbar-thumb:hover": {
              background: DESIGN_SYSTEM_COLORS.orange400,
            },
          }}
          elevation={8}
        >
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <IconButton onClick={handleSidebarClose}>
              <CloseIcon />
            </IconButton>
          </Box>
          {expandedNode ? (
            <Box>
              {nodePublicView && (
                <Box data-testid="node-item-container" sx={{ p: { xs: 1 } }}>
                  {editMode && (
                    <NodeItemFullEditor
                      node={nodePublicView}
                      image={
                        nodePublicView.nodeImage ? (
                          <Box
                            sx={{
                              display: "block",
                              width: "100%",
                              cursor: "pointer",
                              mt: 3,
                            }}
                          >
                            {/* TODO: Change to next Image */}
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={nodePublicView.nodeImage}
                              alt={"Preview Image"}
                              width="100%"
                              height="100%"
                              loading="lazy"
                            />
                          </Box>
                        ) : null
                      }
                      tags={null}
                      references={null}
                      onSubmit={saveChanges}
                      onCancel={() => {
                        setEditMode(false);
                      }}
                      publicView={false}
                    />
                  )}
                  {!editMode && (
                    <Grid item xs={12} sm={12}>
                      <NodeItemFull
                        nodeId={nodePublicView?.node}
                        node={nodePublicView}
                        setEditMode={setEditMode}
                        deleteNode={() => handleRemoveNode(selectedTopic.title, expandedNode?.node || "")}
                      />
                      {nodePublicView?.siblings && nodePublicView?.siblings.length > 0 && (
                        <LinkedNodes sx={{ mt: 3 }} data={nodePublicView?.siblings} header="Related"></LinkedNodes>
                      )}
                    </Grid>
                  )}

                  <Grid item xs={12} sm={12}>
                    <Card sx={{ mt: 3, p: 2 }}>
                      <CardHeader
                        sx={{
                          backgroundColor: theme =>
                            theme.palette.mode === "light"
                              ? theme.palette.common.darkGrayBackground
                              : theme.palette.common.black,
                        }}
                        title={
                          <Box sx={{ textAlign: "center", color: "inherit" }}>
                            <TypographyUnderlined
                              variant="h6"
                              fontWeight="300"
                              gutterBottom
                              align="center"
                              sx={{ color: theme => theme.palette.common.white }}
                            >
                              Knowledge Checks
                            </TypographyUnderlined>
                          </Box>
                        }
                      ></CardHeader>
                      {(courses[selectedCourse]?.questions?.[nodePublicView?.node] || []).map(
                        (question: any, idx: number) => {
                          const QuestionComponent = questionComponents[question?.question_type];
                          return QuestionComponent ? (
                            <QuestionComponent
                              key={idx}
                              idx={idx}
                              nodeId={nodePublicView?.id}
                              question={question}
                              handleQuestion={handleQuestion}
                              sx={{
                                backgroundColor: theme => (theme.palette.mode === "dark" ? "#1f1f1f" : "white"),
                                mt: 2,
                                p: "12px",
                              }}
                            />
                          ) : null;
                        }
                      )}
                      <Box mt={2} sx={{ display: "flex", justifyContent: "center" }}>
                        <CustomButton
                          variant="contained"
                          type="button"
                          color="secondary"
                          onClick={() => {
                            retrieveNodeQuestions(nodePublicView.node);
                          }}
                        >
                          Generate Question
                          {questionsLoader ? (
                            <CircularProgress sx={{ ml: 1 }} size={20} />
                          ) : (
                            <AutoFixHighIcon sx={{ ml: 1 }} />
                          )}
                        </CustomButton>
                      </Box>
                    </Card>
                  </Grid>

                  {/* <Grid item xs={12} sm={12}>
                    <Card sx={{ mt: 3, p: 2 }}>
                      <CardHeader
                        sx={{
                          backgroundColor: theme =>
                            theme.palette.mode === "light"
                              ? theme.palette.common.darkGrayBackground
                              : theme.palette.common.black,
                        }}
                        title={
                          <Box sx={{ textAlign: "center", color: "inherit" }}>
                            <TypographyUnderlined
                              variant="h6"
                              fontWeight="300"
                              gutterBottom
                              align="center"
                              sx={{ color: theme => theme.palette.common.white }}
                            >
                              Topics
                            </TypographyUnderlined>
                          </Box>
                        }
                      ></CardHeader>
                    </Card>
                  </Grid> */}
                  {nodePublicViewLoader ? (
                    <Box sx={{ my: 2, width: "100%", display: "flex", justifyContent: "center" }}>
                      <CircularProgress size={40} />
                    </Box>
                  ) : (
                    <>
                      <Grid item xs={12} sm={12}>
                        <Card sx={{ mt: 3, p: 2 }}>
                          <CardHeader
                            sx={{
                              backgroundColor: theme =>
                                theme.palette.mode === "light"
                                  ? theme.palette.common.darkGrayBackground
                                  : theme.palette.common.black,
                            }}
                            title={
                              <Box sx={{ textAlign: "center", color: "inherit" }}>
                                <TypographyUnderlined
                                  variant="h6"
                                  fontWeight="300"
                                  gutterBottom
                                  align="center"
                                  sx={{ color: theme => theme.palette.common.white }}
                                >
                                  Contributors
                                </TypographyUnderlined>
                              </Box>
                            }
                          ></CardHeader>
                          <NodeItemContributors
                            contributors={nodePublicView?.contributors || []}
                            institutions={nodePublicView?.institutions || []}
                            sx={{ my: 4 }}
                          />
                        </Card>
                      </Grid>
                      <Grid item xs={12} sm={12}>
                        {nodePublicView?.parents && nodePublicView?.parents?.length > 0 && (
                          <>
                            <LinkedNodes data={nodePublicView?.parents || []} header="What to Learn Before" />
                            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                              <CustomButton
                                variant="contained"
                                type="button"
                                color="secondary"
                                onClick={() => {
                                  retrievePrerequisites(nodePublicView.node, nodePublicView?.topic, "parents");
                                }}
                                disabled={prerequisitesLoader === "parents"}
                              >
                                Auto-generate parents
                                {prerequisitesLoader === "parents" ? (
                                  <CircularProgress sx={{ ml: 1 }} size={20} />
                                ) : (
                                  <AutoFixHighIcon sx={{ ml: 1 }} />
                                )}
                              </CustomButton>
                            </Box>
                          </>
                        )}
                      </Grid>
                      <Grid item xs={12} sm={12}>
                        {nodePublicView?.children && nodePublicView?.children?.length > 0 && (
                          <>
                            <LinkedNodes data={nodePublicView?.children || []} header="What to Learn After" />
                            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                              <CustomButton
                                variant="contained"
                                type="button"
                                color="secondary"
                                onClick={() => {
                                  retrievePrerequisites(nodePublicView.node, nodePublicView?.topic, "children");
                                }}
                                disabled={prerequisitesLoader === "children"}
                              >
                                Auto-generate children
                                {prerequisitesLoader === "children" ? (
                                  <CircularProgress sx={{ ml: 1 }} size={20} />
                                ) : (
                                  <AutoFixHighIcon sx={{ ml: 1 }} />
                                )}
                              </CustomButton>
                            </Box>
                          </>
                        )}
                      </Grid>
                    </>
                  )}
                </Box>
              )}
            </Box>
          ) : (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "center",
                }}
              >
                <Typography variant="h6">
                  {Object.keys(improvements[currentChangeIndex] || {}).length > 0
                    ? "AI-Proposed Improvements"
                    : selectedTopic?.title || selectedOpenCategory?.title || ""}
                </Typography>

                {(selectedOpenCategory?.title || selectedTopic) && (
                  <Button
                    onClick={() => {
                      if (selectedOpenCategory?.title) {
                        deleteCategory(selectedOpenCategory);
                      } else if (selectedTopic) {
                        handleRemoveTopic(selectedTopic);
                      }
                    }}
                    sx={{
                      m: 1,
                    }}
                    variant="contained"
                  >
                    Delete
                  </Button>
                )}
              </Box>
              <Divider
                sx={{
                  borderColor: "lightgrey",
                  my: "15px",
                }}
              />
              {selectedOpenCategory && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                  <TextField
                    label="Category Title"
                    multiline
                    value={selectedOpenCategory.title}
                    onChange={e => {
                      const updatedCourses = [...courses];
                      updatedCourses[selectedCourse].syllabus[selectedOpenCategory.categoryIndex] = {
                        ...updatedCourses[selectedCourse].syllabus[selectedOpenCategory.categoryIndex],
                        title: e.target.value,
                      };
                      setSelectedOpenCategory({
                        categoryIndex: selectedOpenCategory.categoryIndex,
                        ...updatedCourses[selectedCourse].syllabus[selectedOpenCategory.categoryIndex],
                      });
                      setCourses(updatedCourses);
                      updateCourses(updatedCourses[selectedCourse]);
                    }}
                    margin="normal"
                    variant="outlined"
                    sx={{
                      backgroundColor: theme => (theme.palette.mode === "dark" ? "" : "white"),
                      width: "100%",
                      mt: "10px",
                      mb: "0px",
                    }}
                    InputLabelProps={{
                      sx: {
                        color: "grey",
                      },
                    }}
                  />
                  <TextField
                    label="Description"
                    multiline
                    value={selectedOpenCategory?.description || ""}
                    onChange={e => {
                      const updatedCourses = [...courses];
                      updatedCourses[selectedCourse].syllabus[selectedOpenCategory.categoryIndex] = {
                        ...updatedCourses[selectedCourse].syllabus[selectedOpenCategory.categoryIndex],
                        description: e.target.value,
                      };
                      setSelectedOpenCategory({
                        categoryIndex: selectedOpenCategory.categoryIndex,
                        ...updatedCourses[selectedCourse].syllabus[selectedOpenCategory.categoryIndex],
                      });
                      setCourses(updatedCourses);

                      updateCourses({
                        id: updatedCourses[selectedCourse].id,
                        syllabus: updatedCourses[selectedCourse].syllabus,
                      });
                    }}
                    margin="normal"
                    variant="outlined"
                    sx={{
                      backgroundColor: theme => (theme.palette.mode === "dark" ? "" : "white"),
                      width: "100%",
                      mt: "10px",
                      mb: "0px",
                    }}
                    InputLabelProps={{
                      style: { color: "grey" },
                    }}
                  />
                  <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <Typography sx={{ fontSize: "19px" }}>Category Image:</Typography>
                    {loadingImage ? (
                      <LinearProgress sx={{ width: "40px" }} />
                    ) : (
                      <AutoFixHighIcon
                        sx={{
                          // backgroundColor: "grey",
                          // color: theme => (theme.palette.mode === "dark" ? "white" : "black"),
                          color: "orange",
                          borderRadius: "50%",
                          ":hover": {
                            backgroundColor: "black",
                            display: "block",
                          },
                          zIndex: 10,
                          padding: "5px",
                          cursor: "pointer",
                          fontSize: "30px",
                          height: "100%",
                        }}
                        onClick={generateImageForCategory}
                      />
                    )}
                  </Box>
                  {selectedOpenCategory.imageUrl && <ImageSlider images={[selectedOpenCategory.imageUrl]} />}

                  <Typography sx={{ fontWeight: "bold" }}>Objectives:</Typography>
                  <ChipInput
                    tags={selectedOpenCategory?.objectives || []}
                    selectedTags={() => {}}
                    setTags={(newTags: string[]) => {
                      const updatedCourses = [...courses];
                      updatedCourses[selectedCourse].syllabus[selectedOpenCategory.categoryIndex] = {
                        ...updatedCourses[selectedCourse].syllabus[selectedOpenCategory.categoryIndex],
                        objectives: newTags,
                      };
                      setSelectedOpenCategory({
                        categoryIndex: selectedOpenCategory.categoryIndex,
                        ...updatedCourses[selectedCourse].syllabus[selectedOpenCategory.categoryIndex],
                      });
                      setCourses(updatedCourses);
                      updateCourses({
                        id: updatedCourses[selectedCourse].id,
                        syllabus: updatedCourses[selectedCourse].syllabus,
                      });
                    }}
                    fullWidth
                    variant="outlined"
                    readOnly={false}
                    placeholder="Type a new skill and click enter ↵ to add it..."
                  />
                  {/* <Typography sx={{ mt: "5px", fontWeight: "bold", mb: "3px" }}>Skills:</Typography>
              <ChipInput
                tags={selectedOpenCategory?.skills || []}
                selectedTags={() => {}}
                setTags={(newTags: string[]) => {
                  const updatedCourses = [...courses];
                  updatedCourses[selectedCourse].syllabus[selectedOpenCategory.categoryIndex] = {
                    ...updatedCourses[selectedCourse].syllabus[selectedOpenCategory.categoryIndex],
                    skills: newTags,
                  };
                  setSelectedOpenCategory({
                    categoryIndex: selectedOpenCategory.categoryIndex,
                    ...updatedCourses[selectedCourse].syllabus[selectedOpenCategory.categoryIndex],
                  });
                  setCourses(updatedCourses);
                  updateCourses({
                    id: updatedCourses[selectedCourse].id,
                    syllabus: updatedCourses[selectedCourse].syllabus,
                  });
                }}
                fullWidth
                variant="outlined"
                readOnly={false}
                placeholder="Type a new skill and click enter ↵ to add it..."
              /> */}
                  <Typography sx={{ fontWeight: "bold" }}>Prerequisite knowledge:</Typography>
                  <ChipInput
                    tags={selectedOpenCategory?.prerequisiteKnowledge || []}
                    selectedTags={() => {}}
                    setTags={(newTags: string[]) => {
                      const updatedCourses = [...courses];
                      updatedCourses[selectedCourse].syllabus[selectedOpenCategory.categoryIndex] = {
                        ...updatedCourses[selectedCourse].syllabus[selectedOpenCategory.categoryIndex],
                        prerequisiteKnowledge: newTags,
                      };
                      setCourses(updatedCourses);
                      setSelectedOpenCategory({
                        categoryIndex: selectedOpenCategory.categoryIndex,
                        ...updatedCourses[selectedCourse].syllabus[selectedOpenCategory.categoryIndex],
                      });
                      updateCourses({
                        id: updatedCourses[selectedCourse].id,
                        syllabus: updatedCourses[selectedCourse].syllabus,
                      });
                    }}
                    fullWidth
                    variant="outlined"
                    readOnly={false}
                    placeholder="Type a new prerequisite knowledge and click enter ↵ to add it..."
                  />
                  {/* <Typography sx={{ mt: "5px", fontWeight: "bold" }}>Prompts:</Typography>
              {(selectedOpenCategory?.prompts || []).map((prompt: any, index: number) => (
                <Box key={index}>
                  <Box sx={{ marginTop: 4 }}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Typography gutterBottom>Prompt {index + 1}:</Typography>
                      <Button
                        onClick={() => {
                          const updatedCourses = [...courses];
                          const currentTopic =
                            updatedCourses[selectedCourse].syllabus[selectedOpenCategory.categoryIndex];
                          currentTopic.prompts.splice(index, 1);

                          setCourses(updatedCourses);
                          setSelectedOpenCategory({
                            categoryIndex: selectedOpenCategory.categoryIndex,
                            ...updatedCourses[selectedCourse].syllabus[selectedOpenCategory.categoryIndex],
                          });
                          updateCourses({
                            id: updatedCourses[selectedCourse].id,
                            syllabus: updatedCourses[selectedCourse].syllabus,
                          });
                        }}
                        sx={{ pb: "5px" }}
                      >
                        Delete
                      </Button>
                    </Box>
                    <Select
                      labelId="type-label"
                      value={prompt.type}
                      onChange={e => {
                        const updatedCourses = [...courses];
                        const currentCat = updatedCourses[selectedCourse].syllabus[selectedOpenCategory.categoryIndex];
                        currentCat.prompts[index].type = e.target.value;
                        if (e.target.value !== "Poll") {
                          delete currentCat.prompts[index].choices;
                        }
                        setCourses(updatedCourses);
                        setSelectedOpenCategory({
                          categoryIndex: selectedOpenCategory.categoryIndex,
                          ...updatedCourses[selectedCourse].syllabus[selectedOpenCategory.categoryIndex],
                        });
                        updateCourses({
                          id: updatedCourses[selectedCourse].id,
                          syllabus: updatedCourses[selectedCourse].syllabus,
                        });
                      }}
                      label="type"
                      MenuProps={{
                        sx: {
                          zIndex: "9999",
                        },
                      }}
                      sx={{ mb: 2 }}
                    >
                      <MenuItem value="Poll">Poll</MenuItem>
                      <MenuItem value="Open-Ended">Open-Ended</MenuItem>
                    </Select>
                    <TextField
                      fullWidth
                      multiline
                      label="Text Prompt"
                      variant="outlined"
                      value={prompt.text}
                      onChange={e => {
                        const updatedCourses = [...courses];
                        const currentCat = updatedCourses[selectedCourse].syllabus[selectedOpenCategory.categoryIndex];
                        currentCat.prompts[index].text = e.target.value;

                        setCourses(updatedCourses);
                        setSelectedOpenCategory({
                          categoryIndex: selectedOpenCategory.categoryIndex,
                          ...updatedCourses[selectedCourse].syllabus[selectedOpenCategory.categoryIndex],
                        });
                        updateCourses({
                          id: updatedCourses[selectedCourse].id,
                          syllabus: updatedCourses[selectedCourse].syllabus,
                        });
                      }}
                      sx={{ mb: 2 }}
                      InputLabelProps={{
                        style: {
                          color: "gray",
                        },
                      }}
                    />
                    <TextField
                      label="Purpose"
                      multiline
                      fullWidth
                      value={prompt.purpose}
                      onChange={e => {
                        const updatedCourses = [...courses];
                        const currentCat = updatedCourses[selectedCourse].syllabus[selectedOpenCategory.categoryIndex];
                        currentCat.prompts[index].purpose = e.target.value;

                        setCourses(updatedCourses);
                        setSelectedOpenCategory({
                          categoryIndex: selectedOpenCategory.categoryIndex,
                          ...updatedCourses[selectedCourse].syllabus[selectedOpenCategory.categoryIndex],
                        });
                        updateCourses({
                          id: updatedCourses[selectedCourse].id,
                          syllabus: updatedCourses[selectedCourse].syllabus,
                        });
                      }}
                      margin="normal"
                      variant="outlined"
                      minRows={2}
                      sx={{ backgroundColor: theme => (theme.palette.mode === "dark" ? "" : "white") }}
                      InputLabelProps={{
                        style: {
                          color: "gray",
                        },
                      }}
                    />
                    <Typography gutterBottom>Choices:</Typography>
                    {prompt.type === "Poll" && (
                      <ChipInput
                        tags={prompt.choices}
                        selectedTags={() => {}}
                        setTags={(newTags: string[]) => {
                          const updatedCourses = [...courses];
                          const currentCat =
                            updatedCourses[selectedCourse].syllabus[selectedOpenCategory.categoryIndex];
                          currentCat.prompts[index].choices = newTags;

                          setCourses(updatedCourses);
                          setSelectedOpenCategory({
                            categoryIndex: selectedOpenCategory.categoryIndex,
                            ...updatedCourses[selectedCourse].syllabus[selectedOpenCategory.categoryIndex],
                          });
                          updateCourses({
                            id: updatedCourses[selectedCourse].id,
                            syllabus: updatedCourses[selectedCourse].syllabus,
                          });
                        }}
                        fullWidth
                        variant="outlined"
                        readOnly={false}
                        placeholder="Type a new choice and click enter ↵ to add it..."
                      />
                    )}
                  </Box>
                </Box>
              ))} */}
                  {/* <Button
                onClick={() => {
                  const updatedCourses = [...courses];
                  const currentCat = updatedCourses[selectedCourse].syllabus[selectedOpenCategory.categoryIndex];
                  currentCat.prompts.push({
                    type: "Poll",
                    text: "",
                    purpose: "",
                  });
                  if (!currentCat.prompts) {
                    currentCat.prompts = [];
                  }
                  setCourses(updatedCourses);
                  setSelectedOpenCategory({
                    categoryIndex: selectedOpenCategory.categoryIndex,
                    ...updatedCourses[selectedCourse].syllabus[selectedOpenCategory.categoryIndex],
                  });
                  updateCourses({
                    id: updatedCourses[selectedCourse].id,
                    syllabus: updatedCourses[selectedCourse].syllabus,
                  });
                }}
              >
                Add prompt
              </Button> */}
                </Box>
              )}
              {selectedTopic && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                  <TextField
                    label="Topic Description"
                    multiline
                    fullWidth
                    value={selectedTopic.description}
                    onChange={e => {
                      const updatedCourses = [...courses];
                      updatedCourses[selectedCourse].syllabus[selectedTopic.categoryIndex].topics[
                        selectedTopic.topicIndex
                      ] = {
                        ...updatedCourses[selectedCourse].syllabus[selectedTopic.categoryIndex].topics[
                          selectedTopic.topicIndex
                        ],
                        description: e.target.value,
                      };
                      setSelectedTopic({
                        categoryIndex: selectedTopic.categoryIndex,
                        topicIndex: selectedTopic.topicIndex,
                        ...updatedCourses[selectedCourse].syllabus[selectedTopic.categoryIndex].topics[
                          selectedTopic.topicIndex
                        ],
                      });
                      setCourses(updatedCourses);
                      updateCourses(updatedCourses[selectedCourse]);
                    }}
                    margin="normal"
                    variant="outlined"
                    minRows={4}
                    sx={{
                      backgroundColor: theme => (theme.palette.mode === "dark" ? "" : "white"),
                      mt: "10px",
                      mb: "0px",
                    }}
                    InputLabelProps={{
                      style: {
                        color: "gray",
                      },
                    }}
                  />

                  <Box sx={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <Typography sx={{ fontSize: "19px" }}>Topic Image:</Typography>

                    {loadingImage ? (
                      <LinearProgress sx={{ width: "40px" }} />
                    ) : (
                      <AutoFixHighIcon
                        sx={{
                          // backgroundColor: "grey",
                          // color: theme => (theme.palette.mode === "dark" ? "white" : "black"),
                          color: "orange",
                          borderRadius: "50%",

                          ":hover": {
                            backgroundColor: "black",

                            display: "block",
                          },

                          zIndex: 10,

                          padding: "5px",
                          cursor: "pointer",
                          fontSize: "30px",
                        }}
                        onClick={generateImageForTopic}
                      />
                    )}
                  </Box>
                  {selectedTopic.imageUrl && <ImageSlider images={[selectedTopic.imageUrl]} />}
                  <FormControl fullWidth margin="normal" sx={{ mt: "8px" }}>
                    <InputLabel id="difficulty-label">Difficulty</InputLabel>
                    <Select
                      labelId="difficulty-label"
                      value={selectedTopic.difficulty.toLowerCase()}
                      onChange={e => {
                        const updatedCourses = [...courses];
                        updatedCourses[selectedCourse].syllabus[selectedTopic.categoryIndex].topics[
                          selectedTopic.topicIndex
                        ] = {
                          ...updatedCourses[selectedCourse].syllabus[selectedTopic.categoryIndex].topics[
                            selectedTopic.topicIndex
                          ],
                          difficulty: e.target.value,
                        };
                        setSelectedTopic({
                          categoryIndex: selectedTopic.categoryIndex,
                          topicIndex: selectedTopic.topicIndex,
                          ...updatedCourses[selectedCourse].syllabus[selectedTopic.categoryIndex].topics[
                            selectedTopic.topicIndex
                          ],
                        });
                        setCourses(updatedCourses);
                        updateCourses(updatedCourses[selectedCourse]);
                      }}
                      label="Difficulty"
                      MenuProps={{
                        sx: {
                          zIndex: "9999",
                        },
                      }}
                      sx={{ color: difficulty === "easy" ? "#AAFF00" : difficulty === "medium" ? "#ffc071" : "red" }}
                    >
                      <MenuItem value="easy" sx={{ color: difficulties["easy"].color }}>
                        Easy
                      </MenuItem>
                      <MenuItem value="medium" sx={{ color: difficulties["medium"].color }}>
                        Medium
                      </MenuItem>
                      <MenuItem value="hard" sx={{ color: difficulties["hard"].color }}>
                        Hard
                      </MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    label="Hours"
                    fullWidth
                    value={selectedTopic.hours || ""}
                    onChange={e => {
                      const updatedCourses = [...courses];
                      updatedCourses[selectedCourse].syllabus[selectedTopic.categoryIndex].topics[
                        selectedTopic.topicIndex
                      ] = {
                        ...updatedCourses[selectedCourse].syllabus[selectedTopic.categoryIndex].topics[
                          selectedTopic.topicIndex
                        ],
                        hours: e.target.value,
                      };
                      setSelectedTopic({
                        categoryIndex: selectedTopic.categoryIndex,
                        topicIndex: selectedTopic.topicIndex,
                        ...updatedCourses[selectedCourse].syllabus[selectedTopic.categoryIndex].topics[
                          selectedTopic.topicIndex
                        ],
                      });
                      setCourses(updatedCourses);
                      updateCourses(updatedCourses[selectedCourse]);
                    }}
                    margin="normal"
                    variant="outlined"
                    type="number"
                    sx={{ mt: "8px", mb: "0px" }}
                    inputProps={{ min: 0 }}
                  />
                  <Typography sx={{ fontWeight: "bold" }}>Objectives:</Typography>
                  <ChipInput
                    tags={selectedTopic.objectives}
                    selectedTags={() => {}}
                    setTags={(newTags: string[]) => {
                      const updatedCourses = [...courses];
                      updatedCourses[selectedCourse].syllabus[selectedTopic.categoryIndex].topics[
                        selectedTopic.topicIndex
                      ] = {
                        ...updatedCourses[selectedCourse].syllabus[selectedTopic.categoryIndex].topics[
                          selectedTopic.topicIndex
                        ],
                        objectives: newTags,
                      };
                      setCourses(updatedCourses);
                      setSelectedTopic({
                        categoryIndex: selectedTopic.categoryIndex,
                        topicIndex: selectedTopic.topicIndex,
                        ...updatedCourses[selectedCourse].syllabus[selectedTopic.categoryIndex].topics[
                          selectedTopic.topicIndex
                        ],
                      });
                      updateCourses({
                        id: updatedCourses[selectedCourse].id,
                        syllabus: updatedCourses[selectedCourse].syllabus,
                      });
                    }}
                    fullWidth
                    variant="outlined"
                    readOnly={false}
                    placeholder="Type a new skill and click enter ↵ to add it..."
                  />
                  <Typography sx={{ fontWeight: "bold" }}>Prerequisite Knowledge:</Typography>
                  <ChipInput
                    tags={selectedTopic.prerequisiteKnowledge}
                    selectedTags={() => {}}
                    setTags={(newTags: string[]) => {
                      const updatedCourses = [...courses];
                      updatedCourses[selectedCourse].syllabus[selectedTopic.categoryIndex].topics[
                        selectedTopic.topicIndex
                      ] = {
                        ...updatedCourses[selectedCourse].syllabus[selectedTopic.categoryIndex].topics[
                          selectedTopic.topicIndex
                        ],
                        prerequisiteKnowledge: newTags,
                      };
                      setCourses(updatedCourses);
                      setSelectedTopic({
                        categoryIndex: selectedTopic.categoryIndex,
                        topicIndex: selectedTopic.topicIndex,
                        ...updatedCourses[selectedCourse].syllabus[selectedTopic.categoryIndex].topics[
                          selectedTopic.topicIndex
                        ],
                      });
                      updateCourses({
                        id: updatedCourses[selectedCourse].id,
                        syllabus: updatedCourses[selectedCourse].syllabus,
                      });
                    }}
                    fullWidth
                    variant="outlined"
                    readOnly={false}
                    placeholder="Type a new skill and click enter ↵ to add it..."
                  />
                  <Typography sx={{ fontWeight: "bold" }}>Prompts:</Typography>
                  {(selectedTopic?.prompts || []).map((prompt: any, index: number) => (
                    <Box key={index}>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "15px",
                          background: theme =>
                            theme.palette.mode === "dark"
                              ? DESIGN_SYSTEM_COLORS.notebookG600
                              : DESIGN_SYSTEM_COLORS.gray100,
                          p: 2,
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Typography gutterBottom>Prompt {index + 1}:</Typography>
                          <Button
                            onClick={() => {
                              const updatedCourses = [...courses];
                              const currentTopic =
                                updatedCourses[selectedCourse].syllabus[selectedTopic.categoryIndex].topics[
                                  selectedTopic.topicIndex
                                ];
                              currentTopic.prompts.splice(index, 1);

                              setCourses(updatedCourses);
                              setSelectedTopic({
                                categoryIndex: selectedTopic.categoryIndex,
                                topicIndex: selectedTopic.topicIndex,
                                ...currentTopic,
                              });
                              updateCourses({
                                id: updatedCourses[selectedCourse].id,
                                syllabus: updatedCourses[selectedCourse].syllabus,
                              });
                            }}
                            sx={{ pb: "5px" }}
                          >
                            Delete
                          </Button>
                        </Box>
                        <Select
                          labelId="type-label"
                          value={prompt.type}
                          onChange={e => {
                            const updatedCourses = [...courses];
                            const currentTopic =
                              updatedCourses[selectedCourse].syllabus[selectedTopic.categoryIndex].topics[
                                selectedTopic.topicIndex
                              ];
                            currentTopic.prompts[index].type = e.target.value;
                            if (e.target.value !== "Poll") {
                              delete currentTopic.prompts[index].choices;
                            }
                            setCourses(updatedCourses);
                            setSelectedTopic({
                              categoryIndex: selectedTopic.categoryIndex,
                              topicIndex: selectedTopic.topicIndex,
                              ...currentTopic,
                            });
                            updateCourses({
                              id: updatedCourses[selectedCourse].id,
                              syllabus: updatedCourses[selectedCourse].syllabus,
                            });
                          }}
                          label="type"
                          MenuProps={{
                            sx: {
                              zIndex: "9999",
                            },
                          }}
                          sx={{ mb: 2 }}
                        >
                          <MenuItem value="Poll">Poll</MenuItem>
                          <MenuItem value="Open-Ended">Open-Ended</MenuItem>
                        </Select>
                        <TextField
                          fullWidth
                          label="Text Prompt"
                          variant="outlined"
                          value={prompt.text}
                          onChange={e => {
                            const updatedCourses = [...courses];
                            const currentTopic =
                              updatedCourses[selectedCourse].syllabus[selectedTopic.categoryIndex].topics[
                                selectedTopic.topicIndex
                              ];
                            currentTopic.prompts[index].text = e.target.value;

                            setCourses(updatedCourses);
                            setSelectedTopic({
                              categoryIndex: selectedTopic.categoryIndex,
                              topicIndex: selectedTopic.topicIndex,
                              ...currentTopic,
                            });
                            updateCourses({
                              id: updatedCourses[selectedCourse].id,
                              syllabus: updatedCourses[selectedCourse].syllabus,
                            });
                          }}
                          sx={{ mb: 2 }}
                          multiline
                          minRows={2}
                        />
                        <TextField
                          fullWidth
                          label="Purpose"
                          variant="outlined"
                          value={prompt.purpose}
                          onChange={e => {
                            const updatedCourses = [...courses];
                            const currentTopic =
                              updatedCourses[selectedCourse].syllabus[selectedTopic.categoryIndex].topics[
                                selectedTopic.topicIndex
                              ];
                            currentTopic.prompts[index].purpose = e.target.value;

                            setCourses(updatedCourses);
                            setSelectedTopic({
                              categoryIndex: selectedTopic.categoryIndex,
                              topicIndex: selectedTopic.topicIndex,
                              ...currentTopic,
                            });
                            updateCourses({
                              id: updatedCourses[selectedCourse].id,
                              syllabus: updatedCourses[selectedCourse].syllabus,
                            });
                          }}
                          sx={{ mb: 2 }}
                          multiline
                          minRows={2}
                        />
                        <Typography gutterBottom>Choices:</Typography>
                        {prompt.type === "Poll" && (
                          <ChipInput
                            tags={prompt.choices}
                            selectedTags={() => {}}
                            setTags={(newTags: string[]) => {
                              const updatedCourses = [...courses];
                              const currentTopic =
                                updatedCourses[selectedCourse].syllabus[selectedTopic.categoryIndex].topics[
                                  selectedTopic.topicIndex
                                ];
                              currentTopic.prompts[index].choices = newTags;

                              setCourses(updatedCourses);
                              setSelectedTopic({
                                categoryIndex: selectedTopic.categoryIndex,
                                topicIndex: selectedTopic.topicIndex,
                                ...currentTopic,
                              });
                              updateCourses({
                                id: updatedCourses[selectedCourse].id,
                                syllabus: updatedCourses[selectedCourse].syllabus,
                              });
                            }}
                            fullWidth
                            variant="outlined"
                            readOnly={false}
                            placeholder="Type a new choice and click enter ↵ to add it..."
                          />
                        )}
                      </Box>
                    </Box>
                  ))}
                  <Box sx={{ display: "flex", justifyContent: "space-evenly", flexWrap: "wrap", gap: "10px" }}>
                    <CustomButton
                      variant="contained"
                      type="button"
                      color="secondary"
                      onClick={() => {
                        const updatedCourses = [...courses];
                        const currentTopic =
                          updatedCourses[selectedCourse].syllabus[selectedTopic.categoryIndex].topics[
                            selectedTopic.topicIndex
                          ];
                        if (!currentTopic.prompts) {
                          currentTopic.prompts = [];
                        }
                        currentTopic.prompts.push({
                          type: "Poll",
                          text: "",
                          purpose: "",
                        });

                        setCourses(updatedCourses);
                        setSelectedTopic({
                          categoryIndex: selectedTopic.categoryIndex,
                          topicIndex: selectedTopic.topicIndex,
                          ...currentTopic,
                        });
                        updateCourses({
                          id: updatedCourses[selectedCourse].id,
                          syllabus: updatedCourses[selectedCourse].syllabus,
                        });
                      }}
                      sx={{ width: "210px" }}
                    >
                      Add prompt
                    </CustomButton>

                    <CustomButton
                      variant="contained"
                      type="button"
                      color="secondary"
                      onClick={generateMorePromptsForTopic}
                      disabled={loadingPrompt}
                    >
                      {loadingPrompt ? "Auto-generating Prompts" : "Auto-generate Prompts"}
                      {loadingPrompt ? (
                        <CircularProgress sx={{ ml: 1 }} size={20} />
                      ) : (
                        <AutoFixHighIcon sx={{ ml: 1 }} />
                      )}
                    </CustomButton>
                  </Box>
                </Box>
              )}

              {/* {selectedTopic && (
            <Box sx={{ mx: "15px" }}>
              <Typography sx={{ mt: "5px", fontWeight: "bold" }}>Skills:</Typography>
              <ChipInput
                tags={selectedTopic.skills}
                selectedTags={() => {}}
                setTags={(newTags: string[]) => {
                  const updatedCourses = [...courses];
                  updatedCourses[selectedCourse].syllabus[selectedTopic.categoryIndex] = {
                    ...updatedCourses[selectedCourse].syllabus[selectedTopic.categoryIndex],
                    prerequisiteKnowledge: newTags,
                  };
                  setCourses(updatedCourses);
                  setSelectedTopic({
                    categoryIndex: selectedTopic.categoryIndex,
                    topicIndex: selectedTopic.topicIndex,
                    ...updatedCourses[selectedCourse].syllabus[selectedTopic.categoryIndex].topics[
                      selectedTopic.topicIndex
                    ],
                  });
                  updateCourses({
                    id: updatedCourses[selectedCourse].id,
                    syllabus: updatedCourses[selectedCourse].syllabus,
                  });
                }}
                fullWidth
                variant="outlined"
                readOnly={false}
                placeholder="Type a new skill and click enter ↵ to add it..."
              />
            </Box>
          )} */}
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
                        setDisplayCourses(null);

                        navigateChange(currentChangeIndex - 1);
                      }}
                      disabled={currentChangeIndex === 0 || Object.keys(currentImprovement || {}).length <= 0}
                    >
                      <ArrowBackIosNewIcon />
                    </Button>
                    <Slide direction="left" timeout={800} in={slideIn}>
                      <Paper sx={{ p: "15px", m: "17px" }}>
                        {Object.keys(improvements[currentChangeIndex] || {}).length > 0 && (
                          <Box sx={{ mb: "15px" }}>
                            <strong style={{ fontWeight: "bold", marginRight: "5px" }}> Proposal:</strong>{" "}
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
                        <strong style={{ fontWeight: "bold", marginRight: "5px" }}> Rationale:</strong>{" "}
                        <Typography> {improvements[currentChangeIndex]?.rationale}</Typography>
                        <Typography sx={{ mr: "15px", mt: "5px", ml: "5px", fontWeight: "bold" }}>
                          {currentChangeIndex + 1}/{improvements.length}
                        </Typography>
                      </Paper>
                    </Slide>
                    <Button
                      variant="contained"
                      sx={{ minWidth: "32px", p: 0, m: 0, mr: "5px" }}
                      onClick={() => {
                        TriggerSlideAnimation();
                        setDisplayCourses(null);
                        navigateChange(currentChangeIndex + 1);
                      }}
                      disabled={
                        currentChangeIndex === improvements[currentChangeIndex].length - 1 ||
                        Object.keys(currentImprovement || {}).length <= 0
                      }
                    >
                      <ArrowForwardIosIcon />
                    </Button>
                  </Box>

                  <Box sx={{ display: "flex", gap: "20px", alignItems: "center" }}>
                    <Button
                      sx={{ ml: "9px" }}
                      onClick={handleRejectChange}
                      color="error"
                      variant="contained"
                      disabled={Object.keys(currentImprovement).length <= 0}
                    >
                      Delete Proposal
                    </Button>

                    <Button
                      onClick={handleAcceptChange}
                      color="success"
                      autoFocus
                      variant="contained"
                      disabled={Object.keys(currentImprovement).length <= 0}
                      sx={{ ml: "auto", mr: "11px" }}
                    >
                      Implement Proposal
                    </Button>
                  </Box>
                </Box>
              )}
              {/* {currentImprovement?.new_topic &&
            Object.keys(currentImprovement.new_topic).map((key: string) => (
              <Box key={key}>
                <Typography>{key}:</Typography>
                <Typography>{currentImprovement.new_topic.key}</Typography>
              </Box>
            ))} */}
            </Box>
          )}
        </Paper>
      )}
      {ConfirmDialog}
    </Box>
  );
};

export default withAuthUser({
  shouldRedirectToLogin: true,
  shouldRedirectToHomeIfAuthenticated: false,
})(CourseComponent);
