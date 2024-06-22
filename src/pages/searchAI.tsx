import AddIcon from "@mui/icons-material/Add";
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
  InputLabel,
  // LinearProgress,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";

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
    syllabus: [
      {
        category: "Foundations of Psychology",
        topics: [
          { topic: "History and Approaches to Psychology", hours: 1, difficulty: "Medium" },
          { topic: "Research Methods in Psychology", hours: 1, difficulty: "Medium" },
          { topic: "Ethical Considerations in Psychological Research", hours: 1, difficulty: "Medium" },
        ],
      },
      {
        category: "Biological Bases of Behavior",
        topics: [
          { topic: "Neurons and Neurotransmission", hours: 1, difficulty: "Medium" },
          { topic: "Brain Structures and Functions", hours: 1, difficulty: "Medium" },
          { topic: "Sensation and Perception", hours: 1, difficulty: "Medium" },
        ],
      },
      {
        category: "Cognition",
        topics: [
          { topic: "Learning and Conditioning", hours: 1, difficulty: "Medium" },
          { topic: "Memory Processes", hours: 1, difficulty: "Medium" },
          { topic: "Language and Thought", hours: 1, difficulty: "Medium" },
        ],
      },
      {
        category: "Developmental Psychology",
        topics: [
          { topic: "Prenatal Development and Infancy", hours: 1, difficulty: "Medium" },
          { topic: "Childhood and Adolescence", hours: 1, difficulty: "Medium" },
          { topic: "Adulthood and Aging", hours: 1, difficulty: "Medium" },
        ],
      },
      {
        category: "Personality and Individual Differences",
        topics: [
          { topic: "Major Theories of Personality", hours: 1, difficulty: "Medium" },
          { topic: "Measuring Personality", hours: 1, difficulty: "Medium" },
          { topic: "Psychological Testing", hours: 1, difficulty: "Medium" },
        ],
      },
      {
        category: "Social Psychology",
        topics: [
          { topic: "Attitudes and Persuasion", hours: 1, difficulty: "Medium" },
          { topic: "Group Dynamics and Behavior", hours: 1, difficulty: "Medium" },
          { topic: "Prejudice and Discrimination", hours: 1, difficulty: "Medium" },
        ],
      },
      {
        category: "Psychological Disorders",
        topics: [
          { topic: "Introduction to Psychological Disorders", hours: 1, difficulty: "Medium" },
          { topic: "Anxiety and Mood Disorders", hours: 1, difficulty: "Medium" },
          { topic: "Schizophrenia and Other Psychotic Disorders", hours: 1, difficulty: "Medium" },
          { topic: "Personality Disorders", hours: 1, difficulty: "Medium" },
        ],
      },
      {
        category: "Therapies and Interventions",
        topics: [
          { topic: "Psychodynamic Therapy", hours: 1, difficulty: "Medium" },
          { topic: "Cognitive-Behavioral Therapy", hours: 1, difficulty: "Medium" },
          { topic: "Humanistic and Existential Therapies", hours: 1, difficulty: "Medium" },
          { topic: "Biological Treatments", hours: 1, difficulty: "Medium" },
        ],
      },
      {
        category: "Applications of Psychology",
        topics: [
          { topic: "Psychology in Health and Well-being", hours: 1, difficulty: "Medium" },
          { topic: "Psychology in Education", hours: 1, difficulty: "Medium" },
          { topic: "Psychology in the Workplace", hours: 1, difficulty: "Medium" },
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

const CourseComponent = () => {
  const [courses, setCourses] = useState(COURSES);
  const [displayCourses, setDisplayCourses] = useState(COURSES);

  const [selectedCourse, setSelectedCourse] = useState<any>(0);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  // const [dialogOpenImp, setDialogOpenImp] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [newTopic, setNewTopic] = useState<any>("");
  const [difficulty, setDifficulty] = useState("easy");
  const [hours, setHours] = useState<number>(0);

  const [loading, setLoading] = useState(false);
  const [improvements, setImprovements] = useState<any>([]);
  const [currentChangeIndex, setCurrentChangeIndex] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [loadingNodes, setLoadingNodes] = useState(false);
  // const [nodesPerTopic, setNodesPerTopic] = useState<{ [key: string]: any }>({});
  const [currentImprovement, setCurrentImprovement] = useState<any>({});
  const [expanded, setExpanded] = useState("");
  const [editTopic, setEditTopic] = useState<any>(null);

  // const [topicImages /* , setTopicImages */] = useState<any>({
  //   "History and Approaches to Psychology":
  //     "https://firebasestorage.googleapis.com/v0/b/onecademy-1.appspot.com/o/ProfilePictures%2FgVfvxPaZVDNotP9ngdSvuKmZQxn2%2FSat%2C%2017%20Feb%202024%2018%3A39%3A23%20GMT_430x1300.jpeg?alt=media&token=c3b984b6-3c4e-451d-b891-fedd77b8c2f5",
  // });
  const topicImages: any = {
    "History and Approaches to Psychology":
      "https://firebasestorage.googleapis.com/v0/b/onecademy-1.appspot.com/o/ProfilePictures%2FgVfvxPaZVDNotP9ngdSvuKmZQxn2%2FSat%2C%2017%20Feb%202024%2018%3A39%3A23%20GMT_430x1300.jpeg?alt=media&token=c3b984b6-3c4e-451d-b891-fedd77b8c2f5",
  };
  useEffect(() => {
    if (currentImprovement.type === "topic") {
      setExpanded(currentImprovement.category);
    }
  }, [currentImprovement]);
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
      });
    }

    setCourses(updatedCourses);
    handleCloseDialog();
    setNewTopic("");
    setHours(0);
    setDifficulty("");
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
    let _courses = [...courses];
    let syllabus = _courses[selectedCourse].syllabus;

    if (currentImprovement.type === "topic") {
      if (currentImprovement.action === "add") {
        const categoryIdx = syllabus.findIndex(cat => cat.category === currentImprovement.category);
        if (categoryIdx !== -1) {
          let topics = syllabus[categoryIdx].topics;
          const afterTopicIdx = topics.findIndex(tp => tp.topic === currentImprovement.after);
          topics.splice(afterTopicIdx + 1, 0, currentImprovement.new_topic);
        }
      }

      if (currentImprovement.action === "modify") {
        const categoryIdx = syllabus.findIndex(cat => cat.category === currentImprovement.category);
        if (categoryIdx !== -1) {
          let topics = syllabus[categoryIdx].topics;
          const topicIdx = topics.findIndex(tp => tp.topic === currentImprovement.old_topic);
          if (topicIdx !== -1) {
            topics[topicIdx] = currentImprovement.new_topic;
          }
        }
      }

      if (currentImprovement.action === "divide") {
        const categoryIdx = syllabus.findIndex(cat => cat.category === currentImprovement.category);
        if (categoryIdx !== -1) {
          let topics = syllabus[categoryIdx].topics;
          const topicIdx = topics.findIndex(tp => tp.topic === currentImprovement.old_topic);
          if (topicIdx !== -1) {
            topics.splice(topicIdx, 1, ...currentImprovement.new_topics);
          }
        }
      }

      if (currentImprovement.action === "delete") {
        const categoryIdx = syllabus.findIndex(cat => cat.category === currentImprovement.category);
        if (categoryIdx !== -1) {
          let topics = syllabus[categoryIdx].topics;
          const topicIdx = topics.findIndex(tp => tp.topic === currentImprovement.topic);
          if (topicIdx !== -1) {
            topics.splice(topicIdx, 1);
          }
        }
      }

      if (currentImprovement.action === "move") {
        const currentCategoryIdx = syllabus.findIndex(cat => cat.category === currentImprovement.current_category);
        if (currentCategoryIdx !== -1) {
          let topics = syllabus[currentCategoryIdx].topics;
          const topicIdx = topics.findIndex(tp => tp.topic === currentImprovement.topic);
          if (topicIdx !== -1) {
            const [movedTopic] = topics.splice(topicIdx, 1);
            const newCategoryIdx = syllabus.findIndex(cat => cat.category === currentImprovement.new_category);
            if (newCategoryIdx !== -1) {
              let newTopics = syllabus[newCategoryIdx].topics;
              const newAfterTopicIdx = newTopics.findIndex(tp => tp.topic === currentImprovement.new_after);
              newTopics.splice(newAfterTopicIdx + 1, 0, movedTopic);
            }
          }
        }
      }
    }

    if (currentImprovement.type === "category") {
      if (currentImprovement.action === "add") {
        const afterCategoryIdx = syllabus.findIndex(cat => cat.category === currentImprovement.after);
        syllabus.splice(afterCategoryIdx + 1, 0, {
          category: currentImprovement.new_category,
          topics: currentImprovement.topics,
        });
      }

      if (currentImprovement.action === "modify") {
        const categoryIdx = syllabus.findIndex(cat => cat.category === currentImprovement.old_category);
        if (categoryIdx !== -1) {
          syllabus[categoryIdx].category = currentImprovement.new_category.category;
        }
      }

      if (currentImprovement.action === "delete") {
        const categoryIdx = syllabus.findIndex(cat => cat.category === currentImprovement.category);
        if (categoryIdx !== -1) {
          syllabus.splice(categoryIdx, 1);
        }
      }

      if (currentImprovement.action === "move") {
        const categoryIdx = syllabus.findIndex(cat => cat.category === currentImprovement.category);
        if (categoryIdx !== -1) {
          const [movedCategory] = syllabus.splice(categoryIdx, 1);
          const newAfterCategoryIdx = syllabus.findIndex(cat => cat.category === currentImprovement.new_after);
          syllabus.splice(newAfterCategoryIdx + 1, 0, movedCategory);
        }
      }
    }

    _courses[selectedCourse].syllabus = syllabus;

    setCourses(_courses);
    if (currentChangeIndex + 1 < improvements.length - 1) {
      navigateChange(currentChangeIndex + 1);
    } else {
      setSidebarOpen(false);
      setCurrentImprovement({});
    }
  };

  const navigateChange = (index: any) => {
    setCurrentChangeIndex(index);
    setCurrentImprovement(improvements[index]);
  };
  const handleRejectChange = () => {
    // Skip the current change and move to the next one or close dialog
    if (currentChangeIndex < improvements.length - 1) {
      navigateChange(currentChangeIndex + 1);
    } else {
      setDialogOpen(false);
    }
  };

  /*  */
  const handlePaperClick = async (topic: string) => {
    setSelectedTopic(topic);
    setSidebarOpen(true);
    setLoadingNodes(true);
    // const courseTitle = courses[selectedCourse].title;
    // const courseDescription = courses[selectedCourse].description;
    // const targetLearners = courses[selectedCourse].learners;
    // const syllabus = courses[selectedCourse].syllabus;
    // const tags = courses[selectedCourse].tags;
    // const references = courses[selectedCourse].references;
    //
    // const response: { nodes: any } = await Post("/retrieveNodesForCourse", {
    //   tags,
    //   courseTitle,
    //   courseDescription,
    //   targetLearners,
    //   references,
    //   syllabus,
    // });
    // setLoadingNodes(false);
    // setNodesPerTopic(prev => {
    //   prev[topic] = response.nodes;
    // });
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
    setSelectedTopic(null);
    setCurrentImprovement({});
  };
  const getNewTopics = (currentImprovement: any) => {
    let newTopics = [];
    if (!currentImprovement) {
      return [];
    }
    if (currentImprovement.new_topic) {
      newTopics.push(currentImprovement.new_topic);
    }
    if ((currentImprovement.new_topics || []).length > 0) {
      newTopics = [...newTopics, ...currentImprovement.new_topics];
    }
    return newTopics;
  };

  useEffect(() => {
    const NEW_COURSES = [...courses];
    if (currentImprovement.action === "move" && currentImprovement.type === "topic") {
      const _selectedCourse = NEW_COURSES[selectedCourse];
      const syllabus = _selectedCourse.syllabus;

      const oldCategoryIndex = syllabus.findIndex(s => s.category === currentImprovement.current_category);
      const oldTopicIndex = syllabus[oldCategoryIndex].topics.findIndex(s => s.topic === currentImprovement.topic);
      const oldTopic = syllabus[oldCategoryIndex].topics[oldTopicIndex];

      const categoryIndex = syllabus.findIndex(s => s.category === currentImprovement.new_category);
      const afterIndex = syllabus[categoryIndex].topics.findIndex(s => s.topic === currentImprovement.new_after);
      syllabus[categoryIndex].topics.splice(afterIndex + 1, 0, oldTopic);
    }
    setDisplayCourses(NEW_COURSES);
  }, [currentImprovement]);

  const getCourses = () => {
    if (currentImprovement) {
      return displayCourses;
    } else {
      return courses;
    }
  };

  return (
    <Box
      padding="20px"
      sx={{
        height: "100vh",
        overflow: "auto",
        // background: theme => theme.palette.common.darkGrayBackground,
        display: "flex",
      }}
    >
      <Box sx={{ flex: sidebarOpen ? 0.7 : 1, transition: "flex 0.3s" }}>
        <Select
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
        >
          <MenuItem value="" disabled sx={{ backgroundColor: theme => (theme.palette.mode === "dark" ? "" : "white") }}>
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
          label="Course Description"
          multiline
          fullWidth
          value={courses[selectedCourse].description}
          onChange={handleDescriptionChange}
          margin="normal"
          variant="outlined"
          rows={4}
          sx={{ backgroundColor: theme => (theme.palette.mode === "dark" ? "" : "white") }}
        />
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
        <Box marginTop="20px">
          {getCourses()[selectedCourse].syllabus.map((category, categoryIndex) => (
            <Accordion key={categoryIndex} expanded={expanded === category.category}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`panel${categoryIndex}-content`}
                id={`panel${categoryIndex}-header`}
                onClick={() => {
                  if (expanded === category.category) {
                    setExpanded("");
                  } else {
                    setExpanded(category.category);
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
                    variant="h6"
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
                  {category.topics.map((tc, topicIndex) => (
                    <Grid item xs={12} sm={6} md={4} key={topicIndex}>
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
                          border:
                            currentImprovement.old_topic === tc
                              ? "1px solid red"
                              : selectedTopic === tc.topic
                              ? "1px solid orange"
                              : currentImprovement.action === "move" &&
                                currentImprovement.type === "topic" &&
                                currentImprovement.topic === tc.topic &&
                                currentImprovement.new_category === category.category
                              ? "1px solid green"
                              : (currentImprovement.action === "move" || currentImprovement.action === "delete") &&
                                currentImprovement.type === "topic" &&
                                currentImprovement.topic === tc.topic &&
                                (currentImprovement.current_category === category.category ||
                                  !currentImprovement.current_category)
                              ? "1px solid red"
                              : "",
                          ":hover": {
                            border: "1px solid orange",
                          },
                        }}
                        elevation={10}
                      >
                        <CloseIcon
                          className="close-icon"
                          sx={{
                            // backgroundColor: "grey",
                            color: "black",
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
                        <Box onClick={() => handlePaperClick(tc.topic)}>
                          <Typography
                            variant="h3"
                            sx={{
                              textAlign: "center",
                              color:
                                currentImprovement.old_topic === tc
                                  ? "red"
                                  : selectedTopic === tc.topic
                                  ? "orange"
                                  : currentImprovement.action === "move" &&
                                    currentImprovement.type === "topic" &&
                                    currentImprovement.topic === tc.topic &&
                                    currentImprovement.new_category === category.category
                                  ? "green"
                                  : (currentImprovement.action === "move" || currentImprovement.action === "delete") &&
                                    currentImprovement.type === "topic" &&
                                    currentImprovement.topic === tc.topic &&
                                    (currentImprovement.current_category === category.category ||
                                      !currentImprovement.current_category)
                                  ? "red"
                                  : "",
                            }}
                          >
                            {tc?.topic || ""}
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
                                handleOpenDialog(categoryIndex);
                              }}
                            >
                              Edit
                            </Button>
                          </Box>
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                  {getNewTopics(currentImprovement).length > 0 &&
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

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            marginTop: "20px",
            position: "sticky",
            bottom: 0,
          }}
        >
          <LoadingButton
            variant="contained"
            color="success"
            sx={{ color: "white", zIndex: 9 }}
            onClick={improveCourseStructure}
            loading={loading}
          >
            Improve Course Structure
          </LoadingButton>
        </Box>

        <Dialog open={dialogOpen} onClose={handleCloseDialog} sx={{ zIndex: 9998 }}>
          <DialogTitle>Add a topic</DialogTitle>
          <DialogContent>
            <TextField
              label="New Topic"
              multiline
              fullWidth
              value={newTopic}
              onChange={event => setNewTopic(event.target.value)}
              margin="normal"
              variant="outlined"
              sx={{ width: "500px" }}
            />
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
            // background: theme => theme.palette.common.darkGrayBackground,
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
            <Typography variant="h6">{currentImprovement ? "Improvement" : selectedTopic}</Typography>
            <IconButton onClick={handleSidebarClose}>
              <CloseIcon />
            </IconButton>
          </Box>
          {currentImprovement ? (
            <Box>
              <Paper sx={{ p: "15px", m: "17px" }}>
                <strong style={{ color: "green", marginRight: "5px" }}> Rationale:</strong>{" "}
                {improvements[currentChangeIndex]?.rationale}
              </Paper>
              <Box sx={{ display: "flex" }}>
                <Typography sx={{ mr: "15px", mt: "5px", ml: "5px" }}>
                  {currentChangeIndex + 1}/{improvements.length}
                </Typography>
                {/* {currentChangeIndex > 0 && (
                  <Button
                    sx={{ mr: "15px" }}
                    onClick={() => navigateChange(currentChangeIndex - 1)}
                    color="primary"
                    variant="contained"
                  >
                    Previous
                  </Button>
                )} */}
                <Button sx={{ mr: "15px" }} onClick={handleRejectChange} color="error" variant="contained">
                  Skip Changes
                </Button>
                <Button onClick={handleAcceptChange} color="success" autoFocus variant="contained">
                  Accept Changes
                </Button>
              </Box>
            </Box>
          ) : (
            <Box></Box>
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
            <></>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default CourseComponent;

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
