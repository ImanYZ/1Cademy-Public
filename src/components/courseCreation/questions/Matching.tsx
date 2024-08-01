import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { Box, Button, Grid, Switch, Typography } from "@mui/material";
import { blue, blueGrey, green, indigo, orange, purple } from "@mui/material/colors";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { QuestionProps } from "src/types";

import { Editor } from "@/components/Editor";
import { CustomButton } from "@/components/map/Buttons/Buttons";
import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";

type EditorOptions = "EDIT" | "PREVIEW";

type Pair = {
  term: string;
  definition: string;
  feedback: { correct: string; incorrect: { [key: string]: string } };
  ref?: string;
};

type MatchingColumnsProps = {
  pairs: Pair[];
};

type MatchingEditProps = {
  option: EditorOptions;
  pairs: Pair[];
  handleTerm: (value: string, prevValue: string, index: number) => void;
  handleDefinition: (value: string, index: number) => void;
  handleCorrectFeedback: (value: string, index: number) => void;
  handleIncorrectFeedback: (value: string, definition: string, index: number) => void;
  handleDeleteItem: (index: number) => void;
};

const colors = [blue[600], green[600], indigo[600], purple[600], orange[600], blueGrey[600]];

const shuffleArray = (array: any) => {
  return array.sort(() => Math.random() - 0.5);
};

const MatchingColumns = ({ pairs }: MatchingColumnsProps) => {
  const [selectedItemsA, setSelectedItemsA] = useState<{ [key: string]: Pair }>({});
  const [selectedItemsB, setSelectedItemsB] = useState<{ [key: string]: Pair }>({});
  const [itemAs, setItemAs] = useState<Pair[]>([]);
  const [itemBs, setItemBs] = useState<Pair[]>([]);
  const [selectedColors, setSelectedColors] = useState<any>([]);
  const [colorIndex, setColorIndex] = useState<number>(0);
  const [selectedItemARef, setSelectedItemARef] = useState<string | null>(null);
  const [resultView, setResultView] = useState<boolean>(false);

  useEffect(() => {
    const shuffledItemAs = shuffleArray([...pairs]);
    const shuffledItemBs = shuffleArray([...pairs]);
    setItemAs(shuffledItemAs);
    setItemBs(shuffledItemBs);
  }, []);

  const handleSelect = (type: any, value: Pair) => {
    if (type === "itemA") {
      if (selectedItemsA[value?.term]) {
        const newSelectedAItems = { ...selectedItemsA };
        delete newSelectedAItems[value?.term];
        setSelectedItemsA(newSelectedAItems);
        const newSelectedBItems = { ...selectedItemsB };
        const resultKey = Object.keys(newSelectedBItems).find(key => newSelectedBItems[key].ref === value.term);
        if (resultKey !== undefined) {
          delete newSelectedBItems[resultKey];
          setSelectedItemsB(newSelectedBItems);
          const findIndexOfItem = Object.keys(selectedItemsA)?.indexOf(value.term);
          selectedColors.splice(findIndexOfItem, 1);
          setSelectedColors([...selectedColors]);
        }
      } else {
        const color = colors[colorIndex % colors.length];
        setSelectedItemsA({ ...selectedItemsA, [value.term]: value });
        setSelectedColors([...selectedColors, color]);
        setColorIndex(prevIndex => prevIndex + 1);
        setSelectedItemARef(value.term);
      }
    } else if (type === "itemB") {
      if (selectedItemsB[value.term]) {
        delete selectedItemsB[value?.term];
        setSelectedItemsB({ ...selectedItemsB });

        const newSelectedAItems = { ...selectedItemsA };
        const findIndexOfItem = Object.keys(newSelectedAItems)?.indexOf(value?.ref || "");
        delete newSelectedAItems[value?.ref || ""];
        setSelectedItemsA(newSelectedAItems);
        selectedColors.splice(findIndexOfItem, 1);
        setSelectedColors([...selectedColors]);
      } else {
        setSelectedItemsB({ ...selectedItemsB, [value?.term]: { ...value, ref: selectedItemARef } as Pair });
        setSelectedItemARef(null);
      }
    }
  };
  const highlightWords = (text: string) => {
    const words = text.split(/(correct|Correct|incorrect|Incorrect)/);
    return words.map((word, index) => {
      if (word.toLowerCase() === "correct") {
        return (
          <span key={index} style={{ color: DESIGN_SYSTEM_COLORS.success600 }}>
            {word}
          </span>
        );
      } else if (word.toLowerCase() === "incorrect") {
        return (
          <span key={index} style={{ color: DESIGN_SYSTEM_COLORS.notebookRed2 }}>
            {word}
          </span>
        );
      } else {
        return <span key={index}>{word}</span>;
      }
    });
  };

  return (
    <Box>
      {!resultView && (
        <>
          <Typography variant="h4" gutterBottom>
            Match the following pairs:
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography
                sx={{
                  p: 2,
                  mb: 2,
                  textAlign: "center",
                  color: "white",
                  background: theme =>
                    theme.palette.mode === "dark"
                      ? DESIGN_SYSTEM_COLORS.notebookG600
                      : DESIGN_SYSTEM_COLORS.notebookG600,
                }}
              >
                Terms
              </Typography>
              {Object.keys(selectedItemsA).map((itemA: string, idx: number) => (
                <>
                  <Button
                    key={itemA}
                    variant="contained"
                    onClick={() => handleSelect("itemA", selectedItemsA[itemA])}
                    fullWidth
                    sx={{
                      mb: 2,
                      textAlign: "start",
                      bgcolor: selectedColors[idx],
                      color: DESIGN_SYSTEM_COLORS.baseWhite,
                    }}
                  >
                    {selectedItemsA[itemA].term}
                  </Button>
                </>
              ))}
              {itemAs
                .filter(itemA => !selectedItemsA[itemA?.term])
                .map((itemA: Pair) => (
                  <Button
                    key={itemA.term}
                    variant={selectedItemsA[itemA.term] ? "contained" : "outlined"}
                    onClick={() => handleSelect("itemA", itemA)}
                    fullWidth
                    sx={{
                      mb: 2,
                      textAlign: "start",
                      color: theme =>
                        theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.baseWhite : DESIGN_SYSTEM_COLORS.gray900,
                    }}
                    disabled={(Object.keys(selectedItemsA).length + Object.keys(selectedItemsB).length) % 2 !== 0}
                  >
                    {itemA.term}
                  </Button>
                ))}
            </Grid>
            <Grid item xs={6}>
              <Typography
                sx={{
                  p: 2,
                  mb: 2,
                  textAlign: "center",
                  color: "white",
                  background: theme =>
                    theme.palette.mode === "dark"
                      ? DESIGN_SYSTEM_COLORS.notebookG600
                      : DESIGN_SYSTEM_COLORS.notebookG600,
                }}
              >
                Definitions
              </Typography>
              {Object.keys(selectedItemsB).map((itemB: string, idx: number) => (
                <Button
                  key={itemB}
                  variant="contained"
                  onClick={() => handleSelect("itemB", selectedItemsB[itemB])}
                  fullWidth
                  sx={{
                    mb: 2,
                    textAlign: "start",
                    bgcolor: selectedColors[idx],
                    color: DESIGN_SYSTEM_COLORS.baseWhite,
                  }}
                >
                  {selectedItemsB[itemB].definition}
                </Button>
              ))}
              {itemBs
                .filter(itemB => !selectedItemsB[itemB?.term])
                .map((itemB: Pair) => (
                  <Button
                    key={itemB.term}
                    variant={selectedItemsB[itemB.term] ? "contained" : "outlined"}
                    onClick={() => handleSelect("itemB", itemB)}
                    fullWidth
                    sx={{
                      mb: 2,
                      textAlign: "start",
                      color: theme =>
                        theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.baseWhite : DESIGN_SYSTEM_COLORS.gray900,
                    }}
                    disabled={(Object.keys(selectedItemsA).length + Object.keys(selectedItemsB).length) % 2 === 0}
                  >
                    {itemB.definition}
                  </Button>
                ))}
            </Grid>
          </Grid>
        </>
      )}

      {resultView && (
        <Grid container mt={3}>
          <Grid>
            {Object.keys(selectedItemsB).map((itemB: string, idx: number) => (
              <Box
                key={selectedItemsA[selectedItemsB[itemB].ref || ""]?.term || idx}
                sx={{
                  background: theme =>
                    theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG600 : DESIGN_SYSTEM_COLORS.gray100,
                  p: 3,
                  mb: 3,
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                  <Box
                    sx={{
                      p: 2,
                      mb: 2,
                      display: "flex",
                      alignItems: "center",
                      bgcolor: selectedColors[idx],
                      color: "white",
                      width: "48%",
                      fontWeight: "bold",
                    }}
                  >
                    {selectedItemsA[selectedItemsB[itemB].ref || ""].term}
                  </Box>
                  <Box
                    sx={{
                      p: 2,
                      mb: 2,
                      display: "flex",
                      alignItems: "center",
                      bgcolor: selectedColors[idx],
                      color: "white",
                      width: "48%",
                      fontWeight: "bold",
                    }}
                  >
                    {selectedItemsA[itemB].definition}
                  </Box>
                </Box>

                {selectedItemsB[itemB]?.term === selectedItemsB[itemB].ref ? (
                  <Typography variant="subtitle1">
                    {highlightWords(selectedItemsA[selectedItemsB[itemB].ref || ""].feedback.correct)}
                  </Typography>
                ) : (
                  <Typography variant="subtitle1">
                    {highlightWords(selectedItemsB[itemB].feedback.incorrect[selectedItemsB[itemB].ref || ""])}
                  </Typography>
                )}
              </Box>
            ))}
          </Grid>
        </Grid>
      )}

      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => (resultView ? setResultView(false) : setResultView(true))}
          sx={{ mt: 4 }}
        >
          {resultView ? "Back" : "Submit"}
        </Button>
      </Box>
    </Box>
  );
};

const MatchingEdit = ({
  option,
  pairs,
  handleTerm,
  handleDefinition,
  handleCorrectFeedback,
  handleIncorrectFeedback,
  handleDeleteItem,
}: MatchingEditProps) => {
  return (
    <Box sx={{ p: 3 }}>
      {pairs.map((pair: Pair, index: number) => {
        return (
          <Box
            key={index}
            sx={{
              display: "flex",
              mb: 3,
              p: 2,
              background: theme =>
                theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG600 : DESIGN_SYSTEM_COLORS.gray100,
              ...(option === "PREVIEW" && {
                gap: "5px",
              }),
            }}
          >
            <Box sx={{ display: "flex", flexDirection: "column", gap: "15px", width: "100%" }}>
              <Editor
                label="Definiition"
                value={pair?.definition}
                setValue={value => handleDefinition(value, index)}
                readOnly={option === "PREVIEW"}
                showEditPreviewSection={false}
                editOption={option}
              />
              <Editor
                label="Correct Term"
                value={pair?.term}
                setValue={value => handleTerm(value, pair?.term, index)}
                readOnly={option === "PREVIEW"}
                showEditPreviewSection={false}
                editOption={option}
              />
              <Editor
                label="Correct Feedback"
                value={pair?.feedback.correct}
                setValue={value => handleCorrectFeedback(value, index)}
                readOnly={option === "PREVIEW"}
                showEditPreviewSection={false}
                editOption={option}
              />
              <Typography my={2}>Incorrect Feedbacks:</Typography>
              {Object.keys(pair?.feedback.incorrect).map((feedback, idx: number) => {
                return (
                  <Editor
                    key={idx}
                    label={feedback}
                    value={pair?.feedback.incorrect[feedback]}
                    setValue={value => handleIncorrectFeedback(value, feedback, index)}
                    readOnly={option === "PREVIEW"}
                    showEditPreviewSection={false}
                    editOption={option}
                  />
                );
              })}
              <CustomButton variant="outlined" type="button" color="error" onClick={() => handleDeleteItem(index)}>
                Delete Item
                <DeleteIcon sx={{ ml: 1 }} />
              </CustomButton>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

const Matching = ({ idx, question, nodeId, sx, handleQuestion }: QuestionProps) => {
  const [questionS, setQuestionS] = useState<any>(question);
  const [option, setOption] = useState<EditorOptions>("EDIT");
  const saveTimeoutRef = useRef<any>(null);

  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      handleQuestion(questionS, idx, nodeId);
    }, 1000);
  }, [questionS]);

  const handleQuestionText = (value: string) => {
    setQuestionS({ ...questionS, question_text: value });
  };

  const handleTerm = (value: string, prevValue: string, index: number) => {
    const pairs = [...questionS.pairs];
    pairs[index].term = value;
    for (let i = 0; i < pairs.length; i++) {
      if (i === index) continue;
      pairs[i].feedback.incorrect[value] = pairs[i].feedback.incorrect[prevValue];
      delete pairs[i].feedback.incorrect[prevValue];
    }
    setQuestionS({ ...questionS, pairs });
  };

  const handleDefinition = (value: string, index: number) => {
    const pairs = [...questionS.pairs];
    pairs[index].definition = value;
    setQuestionS({ ...questionS, pairs });
  };

  const handleCorrectFeedback = (value: string, index: number) => {
    const pairs = [...questionS.pairs];
    pairs[index].feedback.correct = value;
    setQuestionS({ ...questionS, pairs });
  };

  const handleIncorrectFeedback = (value: string, definition: string, index: number) => {
    const pairs = [...questionS.pairs];
    pairs[index].feedback.incorrect[definition] = value;

    setQuestionS({ ...questionS, pairs });
  };

  const handleAddItem = () => {
    const incorrectFeedbacks: any = {};
    const pairs = [...questionS.pairs];
    const term = `Term ${pairs.length + 1}`;
    const definition = `Definition ${pairs.length + 1}`;
    questionS.pairs.forEach((pair: any, idx: number) => {
      incorrectFeedbacks[pair?.term] = `Incorrect Feedback # ${idx + 1}`;
    });
    for (let i = 0; i < pairs.length; i++) {
      pairs[i].feedback.incorrect[term] = ``;
    }
    setQuestionS({
      ...questionS,
      pairs: [
        ...pairs,
        {
          term,
          definition,
          feedback: {
            correct: "",
            incorrect: incorrectFeedbacks,
          },
        },
      ],
    });
  };

  const handleDeleteItem = (index: number) => {
    const pairs = [...questionS.pairs];
    for (let i = 0; i < pairs.length; i++) {
      delete pairs[i].feedback.incorrect[pairs[index].term];
    }
    pairs.splice(index, 1);
    setQuestionS({ ...questionS, pairs });
  };

  const onChangeOption = useCallback(
    (newOption: boolean) => {
      setOption(newOption ? "PREVIEW" : "EDIT");
    },
    [setOption]
  );

  return (
    <Box sx={{ ...sx }}>
      <Box>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", gap: "5px", alignItems: "center" }}>
            <Typography mb={4} variant="h3" fontWeight={"bold"}>
              Question {(idx || 0) + 1}
            </Typography>
            <Typography mb={4} sx={{ fontSize: "13px" }}>
              (Matching):
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              position: "relative",
              top: "-8px",
              borderRadius: "10px",
            }}
          >
            <Typography
              onClick={() => setOption("PREVIEW")}
              sx={{ cursor: "pointer", fontSize: "14px", fontWeight: 490, color: "inherit" }}
            >
              Preview
            </Typography>
            <Switch checked={option === "EDIT"} onClick={() => onChangeOption(option === "EDIT")} size="small" />
            <Typography
              onClick={() => setOption("EDIT")}
              sx={{ cursor: "pointer", fontSize: "14px", fontWeight: 490, color: "inherit" }}
            >
              Edit
            </Typography>
          </Box>
        </Box>

        <Editor
          label="Question Stem"
          value={questionS?.question_text}
          setValue={handleQuestionText}
          readOnly={option === "PREVIEW"}
          sxPreview={{ fontSize: "25px", fontWeight: 300 }}
          showEditPreviewSection={false}
          editOption={option}
        />
      </Box>
      {option === "EDIT" && (
        <MatchingEdit
          option={option}
          pairs={questionS?.pairs.map((pair: Pair, index: number) => {
            return { ...pair, index };
          })}
          handleTerm={handleTerm}
          handleDefinition={handleDefinition}
          handleCorrectFeedback={handleCorrectFeedback}
          handleIncorrectFeedback={handleIncorrectFeedback}
          handleDeleteItem={handleDeleteItem}
        />
      )}

      {option === "PREVIEW" && (
        <MatchingColumns
          pairs={questionS?.pairs.map((pair: Pair, index: number) => {
            return { ...pair, index };
          })}
        />
      )}
      {option === "EDIT" && (
        <Box mt={1} sx={{ display: "flex", justifyContent: "center" }}>
          <CustomButton variant="contained" type="button" color="secondary" onClick={() => handleAddItem()}>
            Add Item <AddIcon />
          </CustomButton>
        </Box>
      )}
    </Box>
  );
};

export default React.memo(Matching);
