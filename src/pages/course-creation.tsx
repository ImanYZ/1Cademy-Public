import AddIcon from "@mui/icons-material/Add";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import CloseIcon from "@mui/icons-material/Close";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
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
  LinearProgress,
  // LinearProgress,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  Slide,
  TextField,
  Typography,
} from "@mui/material";
import { collection, doc, getFirestore, onSnapshot, query, setDoc, updateDoc, where } from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";

import ChipInput from "@/components/ChipInput";
import AppHeaderMemoized from "@/components/Header/AppHeader";
import withAuthUser from "@/components/hoc/withAuthUser";
import ImageSlider from "@/components/ImageSlider";
import MarkdownRender from "@/components/Markdown/MarkdownRender";
import NodeTypeIcon from "@/components/NodeTypeIcon";
import useConfirmDialog from "@/hooks/useConfirmDialog";
import { Post } from "@/lib/mapApi";

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
  const db = getFirestore();

  const dragItem = useRef<any>(null);
  const dragOverItem = useRef<any>(null);
  const containerRef = useRef<any>(null);
  const [glowCategoryGreenIndex, setGlowCategoryGreenIndex] = useState(-1);
  const [glowCategoryRedIndex, setGlowCategoryRedIndex] = useState(-1);
  const [loadingDescription, setLoadingDescription] = useState(false);
  const [loadingObjectives, setLoadingObjectives] = useState(false);
  const [loadingSkills, setLoadingSkills] = useState(false);
  const [loadingCourseStructure, setLoadingCourseStructure] = useState(false);
  const [slideIn, setSlideIn] = useState(true);
  const [courses, setCourses] = useState<any>([]);
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

  const [editCategory, setEditCategory] = useState<any>(null);
  const [newCategoryTitle, setNewCategoryTitle] = useState<string>("");

  const { confirmIt, ConfirmDialog } = useConfirmDialog();
  // const [topicImages /* , setTopicImages */] = useState<any>({
  //   "History and Approaches to Psychology":
  //     "https://firebasestorage.googleapis.com/v0/b/onecademy-1.appspot.com/o/ProfilePictures%2FgVfvxPaZVDNotP9ngdSvuKmZQxn2%2FSat%2C%2017%20Feb%202024%2018%3A39%3A23%20GMT_430x1300.jpeg?alt=media&token=c3b984b6-3c4e-451d-b891-fedd77b8c2f5",
  // });
  const topicImages: any = {
    "History and Approaches to Psychology":
      "https://firebasestorage.googleapis.com/v0/b/onecademy-1.appspot.com/o/ProfilePictures%2FgVfvxPaZVDNotP9ngdSvuKmZQxn2%2FSat%2C%2017%20Feb%202024%2018%3A39%3A23%20GMT_430x1300.jpeg?alt=media&token=c3b984b6-3c4e-451d-b891-fedd77b8c2f5",
  };

  useEffect(() => {
    const notebooksRef = collection(db, "coursesAI");
    const q = query(notebooksRef, where("deleted", "==", false));

    const killSnapshot = onSnapshot(q, snapshot => {
      const docChanges = snapshot.docChanges();

      setCourses((prevCourses: any) =>
        docChanges.reduce(
          (prev: (any & { id: string })[], change: any) => {
            const docType = change.type;
            const curData = { id: change.doc.id, ...change.doc.data() };

            const prevIdx = prev.findIndex((m: any & { id: string }) => m.id === curData.id);
            if (docType === "added" && prevIdx === -1 && !curData.conversation) {
              prev.push({ ...curData });
            }
            if (docType === "modified" && prevIdx !== -1 && !curData.conversation) {
              prev[prevIdx] = { ...curData };
            }

            if (docType === "removed" && prevIdx !== -1) {
              prev.splice(prevIdx);
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
  }, [db]);

  const updateCourses = (course: any) => {
    if (!course.id) return;
    const courseRef = doc(db, "coursesAI", course.id);
    updateDoc(courseRef, { ...course, updateAt: new Date(), createdAt: new Date() });
  };
  const onCreateCourse = async (newCourse: any) => {
    const courseRef = doc(collection(db, "coursesAI"));
    await setDoc(courseRef, { ...newCourse, deleted: false, updateAt: new Date(), createdAt: new Date() });
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

  const handleLearnersChange = (e: any) => {
    const updatedCourses = [...courses];
    updatedCourses[selectedCourse] = {
      ...updatedCourses[selectedCourse],
      learners: e.target.value,
    };
    setCourses(updatedCourses);
    updateCourses(updatedCourses[selectedCourse]);
  };
  const handleRemoveTopic = (categoryIndex: number, topicIndex: number) => {
    const updatedCourses = [...courses];
    updatedCourses[selectedCourse].syllabus[categoryIndex].topics.splice(topicIndex, 1);
    setCourses(updatedCourses);
    updateCourses(updatedCourses[selectedCourse]);
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
        topics[topicIndex].skills = skills;
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
    updateCourses(updatedCourses[selectedCourse]);
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
        return `**<span style="color: green;">Add a new topic</span>** called **"${
          new_topic?.topic
        }"** after the topic **"${after}"** under the category **"${category}"** with difficulty level **"${
          new_topic?.difficulty
        }"** that we estimate would take **${new_topic?.hours}** hour${(new_topic?.hours || 0) > 1 ? "s" : ""}.`;
      case "modify":
        return `**<span style="color: orange;">Modify the topic</span>** **"${old_topic}"** under the category **"${category}"** to **"${
          new_topic?.topic
        }"** with difficulty level **"${new_topic?.difficulty}"** that we estimate would take ${new_topic?.hours} hour${
          (new_topic?.hours || 0) > 1 ? "s" : ""
        }.`;
      case "divide":
        const dividedTopics = new_topics
          ?.map(
            nt => `**"${nt.topic}"** (${nt.hours} hour${(nt?.hours || 0) > 1 ? "s" : ""}, ${nt.difficulty} difficulty)`
          )
          .join(" and ");
        return `**<span style="color: orange;">Divide the topic</span>** **"${old_topic}"** under the category **"${category}"** into ${dividedTopics}.`;
      case "move":
        return `**<span style="color: orange;">Move the topic</span>** **"${topic}"** from the category **"${current_category}"** to the category **"${new_category}"** after the topic **"${new_after}"**.`;
      case "delete":
        return `**<span style="color: orange;">Move the topic</span>** **"${topic}"** under the category **"${category}"**.`;
      default:
        return "Invalid action.";
    }
  };
  const improveCourseStructure = async () => {
    setLoading(true);
    setLoadingNodes(false);
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
      navigateChange(currentChangeIndex);
    }, 3000);
  };

  const navigateChange = (index: any) => {
    if (improvements[index]) {
      TriggerSlideAnimation();
      setTimeout(() => {
        setCurrentChangeIndex(index);
        setCurrentImprovement(improvements[index]);
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
      scrollToCategory(currentImprovement.current_category);
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
  const handleSaveCourse = async () => {
    await onCreateCourse({
      title: newCourseTitle,
      learners: newCourseLearners,
      hours: 0,
      courseObjectives: [],
      courseSkills: [],
      description: "",
      syllabus: [],
      tags: [],
      references: [],
    });
    handleCloseCourseDialog();
    setTimeout(() => {
      setSelectedCourse(courses.length);
    }, 500);
  };

  const generateDescription = async () => {
    setLoadingDescription(true);
    const courseTitle = courses[selectedCourse].title;
    const targetLearners = courses[selectedCourse].learners;
    const hours = courses[selectedCourse].hours;
    const response = await Post("/generateCourseDescription", { courseTitle, targetLearners, hours });
    setCourses((prev: any) => {
      prev[selectedCourse].description = response;
      updateCourses(prev[selectedCourse]);
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
    setLoadingSkills(true);
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
      updateCourses(prev[selectedCourse]);
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
    const hours = courses[selectedCourse].hours;

    const response: any = await Post("/generateCourseStructure", {
      courseTitle,
      targetLearners,
      courseObjectives,
      courseDescription,
      courseSkills,
      hours,
    });
    setCourses((prev: any) => {
      prev[selectedCourse].syllabus = response;
      updateCourses(prev[selectedCourse]);
      return prev;
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

  const setNewSkills = (newTags: string[]) => {
    const _courses: any = [...courses];
    _courses[selectedCourse].courseSkills = newTags;
    setCourses(_courses);
    updateCourses(_courses[selectedCourse]);
  };
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

  if (courses.length <= 0) {
    return <LinearProgress />;
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

      <Box padding="20px">
        <Box>
          <TextField
            value={courses[selectedCourse].title}
            onChange={event => {
              const courseIdx = courses.findIndex((course: any) => course.title === event.target.value);
              if (courseIdx !== -1) {
                setSelectedCourse(courseIdx);
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
          <LoadingButton
            variant="contained"
            color="success"
            sx={{ color: "white", zIndex: 9, fontSize: "15px", ml: "15px" }}
            onClick={createCourse}
            loading={loading}
          >
            Create New Course
          </LoadingButton>
          <Box sx={{ display: "flex", gap: "15px" }}>
            <TextField
              label="Course Title"
              multiline
              value={courses[selectedCourse].title}
              onChange={handleTitleChange}
              margin="normal"
              variant="outlined"
              sx={{ backgroundColor: theme => (theme.palette.mode === "dark" ? "" : "white"), width: "500px" }}
            />
            <TextField
              label="Number of Hour-long Class Sessions"
              fullWidth
              value={courses[selectedCourse].hours || 0}
              onChange={handleHoursChange}
              margin="normal"
              variant="outlined"
              sx={{ width: "500px" }}
              type="number"
              inputProps={{ min: 0 }}
            />

            <TextField
              value={courses[selectedCourse].references[0]}
              select // tell TextField to render select
              label="Select Book"
              sx={{ mt: "15px", minWidth: "200px" }}
            >
              <MenuItem
                value=""
                disabled
                sx={{ backgroundColor: theme => (theme.palette.mode === "dark" ? "" : "white") }}
              >
                Select Book
              </MenuItem>
              {courses[selectedCourse].references.map((book: any) => (
                <MenuItem
                  key={book}
                  value={book}
                  sx={{ backgroundColor: theme => (theme.palette.mode === "dark" ? "" : "white") }}
                >
                  {book}
                </MenuItem>
              ))}
            </TextField>
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
            InputLabelProps={{
              style: {
                color: "gray",
              },
            }}
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

          {(courses[selectedCourse].description.trim() || courses[selectedCourse].courseObjectives?.length > 0) && (
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
                tags={courses[selectedCourse].courseObjectives || []}
                selectedTags={() => {}}
                setTags={setNewCourseObjectives}
                fullWidth
                variant="outlined"
                placeholder="Add a new course objective..."
              />
            </Box>
          )}

          {(courses[selectedCourse].courseObjectives?.length > 0 ||
            courses[selectedCourse].courseSkills?.length > 0) && (
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
                tags={courses[selectedCourse].courseSkills || []}
                selectedTags={() => {}}
                setTags={setNewSkills}
                fullWidth
                variant="outlined"
                placeholder="Add a new course skill..."
              />
            </Box>
          )}

          {(courses[selectedCourse].syllabus?.length > 0 || courses[selectedCourse].courseSkills?.length > 0) && (
            <Box sx={{ display: "flex", alignItems: "center", py: "15px", mt: "26px" }}>
              <Typography variant="h2">Course Structure:</Typography>
              <Button sx={{ ml: "19px" }} onClick={() => setEditCategory("new")}>
                Add Category
              </Button>
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
          )}

          <Box ref={containerRef} marginTop="20px">
            {getCourses()[selectedCourse].syllabus.map((category: any, categoryIndex: any) => (
              <Accordion
                id={category.category}
                key={category.category}
                expanded={expanded.includes(category.category)}
                draggable
                onDragStart={() => {
                  dragItem.current = categoryIndex;
                }}
                onDragEnter={() => {
                  dragOverItem.current = categoryIndex;
                }}
                onDragOver={handleDragOver}
                onDragEnd={handleSorting}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls={`panel${categoryIndex}-content`}
                  id={`panel${categoryIndex}-header`}
                  onClick={e => {
                    e.stopPropagation();
                    if (expanded.includes(category.category)) {
                      setExpanded([]);
                    } else {
                      setExpanded([category.category]);
                    }
                  }}
                  sx={{
                    animation:
                      categoryIndex === glowCategoryGreenIndex
                        ? `${glowGreen} 1.5s ease-in-out infinite`
                        : categoryIndex === glowCategoryRedIndex
                        ? `${glowRed} 1.5s ease-in-out infinite`
                        : "",
                  }}
                >
                  <DragIndicatorIcon />
                  {currentImprovement.type === "category" &&
                  currentImprovement.action === "modify" &&
                  currentImprovement.old_category === category.category ? (
                    <Box sx={{ display: "flex", gap: "5px", width: "100%", justifyContent: "space-between" }}>
                      <Box sx={{ display: "flex", gap: "5px" }}>
                        <Typography variant="h6" sx={{ textDecoration: "line-through" }}>
                          {category.category}
                        </Typography>
                        <Typography variant="h6" sx={{ color: "green" }}>
                          {currentImprovement.new_category.category}
                        </Typography>
                      </Box>
                    </Box>
                  ) : (
                    <Box sx={{ display: "flex", width: "100%", justifyContent: "space-between" }}>
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
                      <Box>
                        <Button
                          onClick={e => {
                            e.stopPropagation();
                            deleteCategory(category);
                          }}
                        >
                          Delete
                        </Button>
                        <Button
                          onClick={e => {
                            e.stopPropagation();
                            setEditCategory(category);
                            setNewCategoryTitle(category.category);
                          }}
                        >
                          Edit
                        </Button>
                      </Box>
                    </Box>
                  )}
                </AccordionSummary>

                {expanded.includes(category.category) && (
                  <AccordionDetails>
                    {
                      <Grid container spacing={2}>
                        {category.topics.map((tc: any, topicIndex: any) => (
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
                                onClick={e => {
                                  e.stopPropagation();
                                  handlePaperClick(tc);
                                }}
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
                                <Box>
                                  {currentImprovement.action === "modify" &&
                                  currentImprovement.old_topic === tc.topic ? (
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
                    }
                  </AccordionDetails>
                )}
              </Accordion>
            ))}
          </Box>

          {courses[selectedCourse].syllabus.length > 0 && (
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
          <Dialog open={createCourseModel} onClose={handleCloseCourseDialog} sx={{ zIndex: 9998 }}>
            <DialogTitle>{"Create a Course"}</DialogTitle>
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
              />{" "}
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
                Create
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
                onChange={event => setTopicDescription(event.target.value)}
                margin="normal"
                variant="outlined"
                sx={{ width: "500px" }}
              />
              <Box sx={{ display: "column" }}>
                <Typography>Skills:</Typography>
                <ChipInput
                  tags={skills || []}
                  setTags={setSkills}
                  selectedTags={() => {}}
                  fullWidth
                  variant="outlined"
                  placeholder="Type a new skill and click enter ↵ to add it..."
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
            display: "flex",
            flexDirection: "column",
            background: theme => (theme.palette.mode === "dark" ? theme.palette.common.darkBackground : ""),
            width: sidebarOpen ? "30%" : "0%",
            transition: "width 0.3s",
            overflow: "hidden",
            transform: sidebarOpen ? "translateX(0)" : "translateX(30%)",
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
                    setDisplayCourses(null);

                    navigateChange(currentChangeIndex - 1);
                  }}
                  disabled={currentChangeIndex === 0 || Object.keys(currentImprovement).length <= 0}
                >
                  <ArrowBackIosNewIcon />
                </Button>
                <Slide direction="down" timeout={800} in={slideIn}>
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
                    Object.keys(currentImprovement).length <= 0
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
              <Typography sx={{ fontWeight: "bold" }}> Related 1Cademy Nodes:</Typography>
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
      {ConfirmDialog}
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
