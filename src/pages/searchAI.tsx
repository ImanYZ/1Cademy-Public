import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { LoadingButton } from "@mui/lab";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";

import { Post } from "@/lib/mapApi";

const COURSES = [
  {
    title: "Introduction to Psychology",
    description:
      "This course provides an in-depth look at the concepts, theories, and research methods in psychology. It covers various topics such as biological bases of behavior, cognition, development, personality, social psychology, and psychological disorders. The course aims to go beyound a comprehensive understanding of the field of psychology and its applications.",
    learners:
      "Undergraduate students with no prior background in psychology. The course is designed for students from various disciplines who are interested in understanding human behavior and mental processes.",
    references: ["Psychology (2nd ed.)"],
    syllabus: [
      {
        category: "Foundations of Psychology",
        topics: [
          "History and Approaches to Psychology",
          "Research Methods in Psychology",
          "Ethical Considerations in Psychological Research",
        ],
      },
      {
        category: "Biological Bases of Behavior",
        topics: ["Neurons and Neurotransmission", "Brain Structures and Functions", "Sensation and Perception"],
      },
      {
        category: "Cognition",
        topics: ["Learning and Conditioning", "Memory Processes", "Language and Thought"],
      },
      {
        category: "Developmental Psychology",
        topics: ["Prenatal Development and Infancy", "Childhood and Adolescence", "Adulthood and Aging"],
      },
      {
        category: "Personality and Individual Differences",
        topics: ["Major Theories of Personality", "Measuring Personality", "Psychological Testing"],
      },
      {
        category: "Social Psychology",
        topics: ["Attitudes and Persuasion", "Group Dynamics and Behavior", "Prejudice and Discrimination"],
      },
      {
        category: "Psychological Disorders",
        topics: [
          "Introduction to Psychological Disorders",
          "Anxiety and Mood Disorders",
          "Schizophrenia and Other Psychotic Disorders",
          "Personality Disorders",
        ],
      },
      {
        category: "Therapies and Interventions",
        topics: [
          "Psychodynamic Therapy",
          "Cognitive-Behavioral Therapy",
          "Humanistic and Existential Therapies",
          "Biological Treatments",
        ],
      },
      {
        category: "Applications of Psychology",
        topics: ["Psychology in Health and Well-being", "Psychology in Education", "Psychology in the Workplace"],
      },
    ],
  },
  {
    title: "Introduction to Microbiology",
    description:
      "This course provides an overview of microbiology, focusing on the structure, function, and genetics of microorganisms, as well as their roles in health, disease, and the environment. The course includes both theoretical and practical components, designed for undergraduate students with a basic background in biology.",
    learners:
      "Undergraduate students majoring in biology or related fields, with a basic understanding of general biology and chemistry.",
    references: ["OpenStax Microbiology Textbook"],
    syllabus: [
      {
        category: "Foundations of Microbiology",
        topics: ["History of Microbiology", "Introduction to Microbial World", "Microscopy and Staining Techniques"],
      },
      {
        category: "Microbial Structure and Function",
        topics: ["Prokaryotic Cell Structure", "Eukaryotic Cell Structure", "Microbial Metabolism"],
      },
      {
        category: "Microbial Genetics",
        topics: ["DNA Structure and Replication", "Gene Expression and Regulation", "Genetic Mutations and Transfer"],
      },
      {
        category: "Microbial Growth and Control",
        topics: ["Microbial Growth Phases", "Factors Affecting Microbial Growth", "Methods of Microbial Control"],
      },
      {
        category: "Microbial Interactions",
        topics: ["Microbiome and Human Health", "Pathogenic Microorganisms", "Symbiotic Relationships"],
      },
      {
        category: "Applied Microbiology",
        topics: ["Environmental Microbiology", "Industrial Microbiology", "Microbial Biotechnology"],
      },
      {
        category: "Laboratory Techniques",
        topics: ["Aseptic Technique", "Culturing Microorganisms", "Antibiotic Sensitivity Testing"],
      },
    ],
  },
  {
    title: "Introduction to Microeconomics",
    description:
      "This course provides an introduction to the principles of microeconomics. Students will learn about the behavior of individuals and firms in making decisions regarding the allocation of scarce resources. Topics include supply and demand, elasticity, consumer behavior, production and costs, market structures, and welfare economics.",
    learners:
      "Undergraduate students in their first or second year, typically majoring in economics, business, or related fields.",
    references: ["CORE Econ - The Economy"],
    syllabus: [
      {
        category: "Basic Concepts",
        topics: ["Introduction to Microeconomics", "Scarcity and Choice", "Opportunity Cost"],
      },
      {
        category: "Supply and Demand",
        topics: [
          "Market Demand",
          "Market Supply",
          "Equilibrium Price and Quantity",
          "Elasticity of Demand",
          "Elasticity of Supply",
        ],
      },
      {
        category: "Consumer Behavior",
        topics: ["Utility and Preferences", "Budget Constraints", "Consumer Choice", "Demand Curve"],
      },
      {
        category: "Production and Costs",
        topics: ["Production Functions", "Short-Run Costs", "Long-Run Costs"],
      },
      {
        category: "Market Structures",
        topics: ["Perfect Competition", "Monopoly", "Monopolistic Competition", "Oligopoly"],
      },
      {
        category: "Welfare Economics",
        topics: ["Economic Efficiency", "Market Failure", "Public Goods", "Externalities"],
      },
    ],
  },
];
const CourseComponent = () => {
  const [courses, setCourses] = useState(COURSES);
  const [selectedCourse, setSelectedCourse] = useState<any>(0);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [dialogOpenImp, setDialogOpenImp] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [newTopic, setNewTopic] = useState<any>("");
  const [loading, setLoading] = useState(false);
  const [improvements, setImprovements] = useState<any>([]);
  const [currentChangeIndex, setCurrentChangeIndex] = useState(0);

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
  const handleOpenDialog = (topic: any) => {
    setSelectedCategory(topic);
    setDialogOpen(true);
  };
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedCategory(null);
  };
  const handleCloseDialogImv = () => {
    setDialogOpenImp(false);
  };

  const handleSaveTopic = () => {
    const updatedCourses = [...courses];
    updatedCourses[selectedCourse].syllabus[selectedCategory].topics.push(newTopic);
    setCourses(updatedCourses);
    handleCloseDialog();
    setNewTopic("");
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
    setDialogOpenImp(true);
    setLoading(false);
  };
  const handleAcceptChange = () => {
    let _courses = [...courses];
    let _syllabus = _courses[selectedCourse].syllabus;
    const selectedCategory = _syllabus.findIndex(
      (solubles: any) => solubles.category === improvements[currentChangeIndex].category
    );

    let _topics = _syllabus[selectedCategory].topics;
    if (improvements[currentChangeIndex].topic) {
      if (_topics.includes(improvements[currentChangeIndex].topic)) {
        _topics.push(improvements[currentChangeIndex].topic);
      }
    }
    if (improvements[currentChangeIndex].old_topic) {
      _topics = _topics.filter((topic: any) => topic !== improvements[currentChangeIndex].old_topic);
    }
    if (improvements[currentChangeIndex].new_topic) {
      _topics.push(improvements[currentChangeIndex].new_topic);
    }
    if (improvements[currentChangeIndex].new_topic) {
      _topics.push(improvements[currentChangeIndex].new_topic);
    }
    if ((improvements[currentChangeIndex].new_topics || []).length > 0) {
      _topics.push(...improvements[currentChangeIndex].new_topics);
    }

    setCourses(_courses);
    if (currentChangeIndex < improvements.length - 1) {
      setCurrentChangeIndex(currentChangeIndex + 1);
    } else {
      setDialogOpen(false);
    }
  };
  const navigateChange = (index: any) => {
    setCurrentChangeIndex(index);
  };
  const handleRejectChange = () => {
    // Skip the current change and move to the next one or close dialog
    if (currentChangeIndex < improvements.length - 1) {
      setCurrentChangeIndex(currentChangeIndex + 1);
    } else {
      setDialogOpen(false);
    }
  };

  return (
    <Box padding="20px" sx={{ height: "100vh", overflow: "auto" }}>
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
        sx={{ width: "500px" }}
        MenuProps={{
          sx: {
            zIndex: "9999",
          },
        }}
      >
        <MenuItem value="" disabled>
          Select Course
        </MenuItem>
        {courses.map((course: any) => (
          <MenuItem key={course.title} value={course.title}>
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
        />
        {/* {false ? (
          <LoadingButton
            onClick={() => {}}
            sx={{
              display: "flex-end",
              borderRadius: "50%",
            }}
            loading={true}
          />
        ) : (
          <AutoFixHighIcon sx={{ color: "orange", ":hover": { cursor: "pointer", color: "white" }, m: "25px" }} />
        )} */}
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
      />
      <Box marginTop="20px">
        {courses[selectedCourse].syllabus.map((category, categoryIndex) => (
          <Accordion key={categoryIndex}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`panel${categoryIndex}-content`}
              id={`panel${categoryIndex}-header`}
            >
              <Typography variant="h6">{category.category}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                {category.topics.map((topic, topicIndex) => (
                  <Grid item xs={12} sm={6} md={4} key={topicIndex}>
                    <Paper
                      sx={{
                        height: "300px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundImage: `url(${topicImages[topic]})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        borderRadius: "15px",
                        position: "relative",
                      }}
                      elevation={10}
                    >
                      <CloseIcon
                        className="close-icon"
                        sx={{
                          backgroundColor: "grey",
                          color: "black",
                          borderRadius: "50%",
                          cursor: "pointer",
                          ":hover": {
                            backgroundColor: "black",
                            color: "white",
                          },
                          zIndex: 10,
                          position: "absolute",
                          top: "0px",
                          right: "0px",
                          padding: "5px",
                        }}
                        onClick={() => handleRemoveTopic(categoryIndex, topicIndex)}
                      />
                      <Typography variant="h3" sx={{ textAlign: "center", color: "white" }}>
                        {topic}
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
        <DialogTitle>Add a Topic</DialogTitle>
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
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSaveTopic} color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={dialogOpenImp} onClose={handleCloseDialogImv} sx={{ zIndex: 9998 }}>
        <DialogTitle>
          Change: {improvements[currentChangeIndex]?.action} {improvements[currentChangeIndex]?.type}
          <Box sx={{ display: "flex" }}>
            <Typography>Category: </Typography>
            {improvements[currentChangeIndex]?.category && (
              <Typography sx={{ ml: "5px" }}>{improvements[currentChangeIndex].category}</Typography>
            )}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ gap: "15px" }}>
            {/* Additional fields to display details of the change */}
            {improvements[currentChangeIndex]?.topic && (
              <Typography>
                <strong style={{ color: "green", marginRight: "5px" }}>Added Topic:</strong>{" "}
                {improvements[currentChangeIndex].topic}
              </Typography>
            )}
            {improvements[currentChangeIndex]?.old_topic && (
              <Typography>
                {" "}
                <strong style={{ color: "green", marginRight: "5px" }}>Old Topic:</strong>{" "}
                {improvements[currentChangeIndex].old_topic}
              </Typography>
            )}
            {improvements[currentChangeIndex]?.new_topic && (
              <Typography>
                <strong style={{ color: "green", marginRight: "5px" }}>New Topic:</strong>{" "}
                {improvements[currentChangeIndex].new_topic}
              </Typography>
            )}
            {(improvements[currentChangeIndex]?.new_topics || []).length > 0 &&
              improvements[currentChangeIndex]?.new_topics.map((topic: string) => (
                <Typography key={topic}>
                  <strong style={{ color: "green", marginRight: "5px" }}>New Topic:</strong> {topic}
                </Typography>
              ))}
            <Typography variant="body1">
              <strong style={{ color: "green", marginRight: "5px" }}> Rationale:</strong>{" "}
              {/* Display details of the current change */}
              {improvements[currentChangeIndex]?.rationale}
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions>
          <Typography sx={{ mr: "55px" }}>
            {currentChangeIndex + 1}/{improvements.length}
          </Typography>
          {currentChangeIndex > 0 && (
            <Button onClick={() => navigateChange(currentChangeIndex - 1)} color="primary">
              Previous
            </Button>
          )}
          <Button onClick={handleRejectChange} color="primary">
            Skip
          </Button>
          <Button onClick={handleAcceptChange} color="primary" autoFocus>
            Accept
          </Button>
        </DialogActions>
      </Dialog>
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
