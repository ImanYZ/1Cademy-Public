import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import RefreshIcon from "@mui/icons-material/Refresh";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import React, { useEffect,useState } from "react";

import { sendMessageToChatGPT } from "../../services/openai";
import ImproveItemComp from "./ImproveItemComp";

interface Improvement {
  id?: string;
  reasoning: string;
  action: string;
  sentence: string;
  new_sentence: string;
}

interface Props {
  theme: any;
  articleTypePath: string[];
  recommendedSteps: string[];
  selectedArticle: any;
  allContent: string;
  findScrollAndSelect: (text: string) => Promise<void> | Promise<HTMLElement>;
  issues: string[];
}

const ImproveComp: React.FC<Props> = ({
  theme,
  articleTypePath,
  recommendedSteps,
  selectedArticle,
  allContent,
  findScrollAndSelect,
  issues
}) => {
  const db = getFirestore();
  const [suggestionsModifications, setSuggestionsModifications] = useState<Improvement[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [waitingResponse, setWaitingResponse] = useState<boolean>(false);

  useEffect(() => {
    if (!selectedArticle?.id) return;
    const unsubscribe = onSnapshot(
      query(collection(db, "improvements"), where("articleId", "==", selectedArticle.id)),
      snapshot => {
        let improvementsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as any),
        }));
        improvementsData = improvementsData.filter(improvement => !improvement.deleted);
        setSuggestionsModifications(improvementsData);
      }
    );
    return () => unsubscribe();
  }, [selectedArticle]);

  const excludeCurrentModification = (id: string) => {
    updateDoc(doc(db, "improvements", id), {
      deleted: true,
      updatedAt: new Date(),
    });
  };

  //   const [promptFirstSentence, setPromptFirstSentence] = useState<string>(
  //     'The following is the content of our scientific research paper:'
  //   )
  //   const [promptBody, setPromptBody] =
  //     useState<string>(`Help us significantly improve this paper. Note that the flow and brevity and very important in scientific papers. For this purpose, generate a JSON response with the structure {'response': [array]}.
  //   The [array] should include objects, each being about only one of the sentences from our paper and have the following structure:
  //   {
  //   "reasoning": "Your reasoning for this improvement",
  //   "action": Can take one of the values of 'delete', 'add', or 'modify',
  //   "sentence": "If the action you suggest us is to delete a sentence, specify the 'sentence' that you want us to delete. If the action is to modify a sentence, it should take the exact sentence that you'd like to help us improve. If the action is to add a sentence, you should specify the previous sentence that we should add your suggested new sentence after this.",
  //   "new_sentence": "If the action you suggest us is to delete a sentence, this field should be ''. If the action is modify a sentence, it should take the new sentence that you'd like us to write instead of the original sentence. If the action is add a sentence, it should take the new sentence."
  //   }
  //   If the [array] is [], it means that you don't have any suggestions for us.`)

  useEffect(() => {
    if (suggestionsModifications.length > 0 && suggestionsModifications[currentIdx]?.sentence) {
      const findAndScrollTo = async () => {
        const matchedEl = await findScrollAndSelect(suggestionsModifications[currentIdx]?.sentence);
        if (!matchedEl) {
          excludeCurrentModification(suggestionsModifications[currentIdx].id || "");
        }
      };
      findAndScrollTo();
    }
  }, [suggestionsModifications, currentIdx]);

  const deleteDocuments = async () => {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, "improvements"), where("articleId", "==", selectedArticle.id))
      );

      querySnapshot.forEach(async doc => {
        await deleteDoc(doc.ref);
      });
    } catch (error) {
      console.error("Error deleting documents: ", error);
    }
  };

  const createImprovement = async (data: Improvement) => {
    await addDoc(collection(db, "improvements"), {
      ...data,
      articleId: selectedArticle.id,
      createdAt: new Date(),
    });
  };

  const submitRequest = async () => {
    setWaitingResponse(true);
    await deleteDocuments();
    setSuggestionsModifications([]);
    const chatGPTMessages = [
      {
        role: "user",
        content: `The following is the content of our ${articleTypePath.slice(2).reverse().join(" of ")}:
'''
${allContent}
'''
We're currently at the following stage:
'''
${JSON.stringify(recommendedSteps)}
'''
We're currently working on the following issues:
'''
${issues.map((issue: string) => "- " + issue).join("\n")}
'''          
Help us significantly improve this ${articleTypePath
  .slice(2)
  .reverse()
  .join(
    " of "
  )}. Note that the flow and brevity are very important.
For this purpose, generate a JSON response with the structure {'response': [array]}. 
The [array] should include objects, each being about only one of the sentences from our paper and have the following structure:
{
   "reasoning": "Your reasoning for this improvement",
   "action": Can take one of the values of 'delete', 'add', or 'modify',
   "sentence": "If the action you suggest us is to delete a sentence, specify the 'sentence' that you want us to delete. If the action is to modify a sentence, it should take the exact sentence that you'd like to help us improve. If the action is to add a sentence, you should specify the previous sentence that we should add your suggested new sentence after this.",
   "new_sentence": "If the action you suggest us is to delete a sentence, this field should be ''. If the action is modify a sentence, it should take the new sentence that you'd like us to write instead of the original sentence. If the action is add a sentence, it should take the new sentence."
}
If the [array] is [], it means that you don't have any suggestions for us.`,
      },
    ];
    const responseMessage = await sendMessageToChatGPT(chatGPTMessages);
    const arrayResponse = responseMessage.response;
    //setSuggestionsModifications(arrayResponse);
    for (const response of arrayResponse) {
      await createImprovement(response);
    }
    setWaitingResponse(false);
  };

  const previousSuggestion = () => {
    setCurrentIdx(prev => Math.max(0, prev - 1));
  };

  const nextSuggestion = () => {
    setCurrentIdx(prev => Math.min(suggestionsModifications.length - 1, prev + 1));
  };

  //   const savePrompt = async () => {
  //     const user = auth.currentUser
  //     if (user && user.uid) {
  //       const userDoc = await getDoc(doc(db, 'users', user.uid))
  //       if (userDoc.exists()) {
  //         await updateDoc(userDoc.ref, { promptFirstSentence, promptBody })
  //       }
  //     }
  //   }

  return (
    <>
      <Box
        sx={{
          width: "100%",
          mb: "10px",
        }}
      >
        <Button
          onClick={submitRequest}
          sx={{
            width: "100%",
            backgroundColor: "success.dark",
            color: "white",
            "&:hover": {
              backgroundColor: "success.main",
            },
          }}
          disabled={waitingResponse}
        >
          <RefreshIcon sx={{ marginRight: "7px" }} />
          Generate Recommendations
        </Button>
      </Box>
      {waitingResponse ? (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress color="secondary" />
        </Box>
      ) : suggestionsModifications.length > 0 && suggestionsModifications[currentIdx]?.sentence ? (
        <>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "8px",
              backgroundColor: "rgba(0, 0, 0, 0.1)",
              color: theme.palette.mode === "dark" ? "white" : "black",
              borderRadius: "7px",
              marginLeft: "8px",
            }}
          >
            Recommendations:
          </Box>
          <ImproveItemComp
            improvement={suggestionsModifications[currentIdx]}
            theme={theme}
            findScrollAndSelect={findScrollAndSelect}
            excludeCurrentModification={excludeCurrentModification}
          />
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "8px",
              backgroundColor: "rgba(0, 0, 0, 0.1)",
              color: theme.palette.mode === "dark" ? "white" : "black",
              borderRadius: "7px",
              marginLeft: "8px",
            }}
          >
            {currentIdx + 1}/{suggestionsModifications.length}
          </Box>
          <Box
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
              mb: "10px",
            }}
          >
            <Button
              variant="contained"
              onClick={previousSuggestion}
              disabled={currentIdx === 0}
              sx={{
                backgroundColor: "info.main",
                color: "white",
                "&:hover": {
                  backgroundColor: "info.light",
                },
                flex: 1,
              }}
            >
              <ArrowBackIcon sx={{ marginRight: "7px" }} />
              Previous
            </Button>
            <Button
              variant="contained"
              onClick={nextSuggestion}
              disabled={currentIdx === suggestionsModifications.length - 1}
              sx={{
                backgroundColor: "info.main",
                color: "white",
                "&:hover": {
                  backgroundColor: "info.light",
                },
                ml: "5px",
                flex: 1,
              }}
            >
              Next
              <ArrowForwardIcon sx={{ marginLeft: "7px" }} />
            </Button>
          </Box>
          {/* <TextareaAutosize
            value={promptBody}
            onChange={(e) => setPromptBody(e.target.value)}
            minRows={3}
            maxRows={10}
            style={{
              width: '100%',
              padding: '7px',
              borderRadius: '7px',
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
              color: theme.palette.mode === 'dark' ? 'white' : 'black',
              marginTop: '10px',
            }}
          />
          <TextareaAutosize
            value={promptFirstSentence}
            onChange={(e) => setPromptFirstSentence(e.target.value)}
            minRows={3}
            maxRows={10}
            style={{
              width: '100%',
              padding: '7px',
              borderRadius: '7px',
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
              color: theme.palette.mode === 'dark' ? 'white' : 'black',
              marginTop: '10px',
            }}
          />
          <Button
            variant="contained"
            onClick={savePrompt}
            sx={{
              backgroundColor: 'primary.main',
              color: 'white',
              '&:hover': {
                backgroundColor: 'primary.dark',
              },
              mt: '10px',
            }}
          >
            Save Prompt
          </Button> */}
          {/* <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px',
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
              color: theme.palette.mode === 'dark' ? 'white' : 'black',
              borderRadius: '7px',
              marginLeft: '8px',
            }}
          >
            <span role="img" aria-label="undo">
              ⬅️
            </span>
            Undo: Ctrl + Z (Windows) / ⌘ + Z (Mac)
            <span role="img" aria-label="redo">
              ➡️
            </span>
            Redo: Ctrl + Y (Windows) / ⌘ + Shift + Z (Mac)
          </Box> */}
        </>
      ) : (
        <></>
      )}
    </>
  );
};

export default ImproveComp;
