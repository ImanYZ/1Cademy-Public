import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import React, { Dispatch, SetStateAction,useState } from "react";
import { User } from "src/knowledgeTypes";

import { calculateCosineSimilarity,tokenizeAndCount } from "../../utils/cosineSimilarity";
import ChatBoxComp from "./ChatBox/ChatBoxComp";
import DraftComp from "./DraftComp";
import GradeComp from "./GenerateInstructionsComp";
import GuideStepComp from "./GuideStepComp";
import ImproveComp from "./ImproveComp";
import IssuesComp from "./IssuesComp";

interface Props {
  theme: any;
  articleContent: string;
  articleDOM: HTMLElement[];
  sideBarWidth: number;
  email: string;
  page: string;
  openSettings: boolean;
  articleTypePath: string[];
  setArticleTypePath: Dispatch<SetStateAction<string[]>>;
  selectedArticle: any;
  quillRef: any;
  selection: any;
  user: User | null;
}

const SideBar: React.FC<Props> = ({
  theme,
  articleContent,
  articleDOM,
  sideBarWidth,
  openSettings,
  articleTypePath,
  selectedArticle,
  quillRef,
  selection,
  user,
}) => {
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const [recommendedSteps, setRecommendedSteps] = useState<string[]>([]);
  const [selectedStep, setSelectedStep] = useState<string | null>(null);

  const findScrollAndSelect = async (text: string) => {
    let matchingElement: any = null;
    let maxSimilarity = -Infinity;
    if (text) {
      const vec1 = tokenizeAndCount(text);
      for (let i = 0; i < articleDOM.length; i++) {
        const currentDiv = articleDOM[i];
        if (currentDiv?.textContent) {
          currentDiv.style.backgroundColor = "";
          const vec2 = tokenizeAndCount(currentDiv.textContent);
          const similarity = calculateCosineSimilarity(vec1, vec2);
          if (similarity > maxSimilarity) {
            maxSimilarity = similarity;
            matchingElement = currentDiv;
          }
        }
      }
    }
    if (matchingElement) {
      matchingElement.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      matchingElement.style.backgroundColor = "#573800";
      return matchingElement;
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  return (
    <>
      <Box
        id="co-auth-main"
        sx={{
          margin: "10px 2px 10px 0px",
          height: "98%",
          overflowY: "auto",
        }}
      >
        {/* {email && openSettings && <SettingsComp theme={theme} />} */}
        {!openSettings && (
          <Box
            sx={{
              height: "100%",
              margin: "10px",
            }}
          >
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1-content" id="panel1-header">
                Stages
              </AccordionSummary>
              <AccordionDetails>
                <Box id="guide-steps">
                  {articleContent.trim() && (
                    <>
                      {articleTypePath.length > 0 && (
                        <GuideStepComp
                          allContent={articleContent}
                          articleTypePath={articleTypePath}
                          recommendedSteps={recommendedSteps}
                          setRecommendedSteps={setRecommendedSteps}
                          setSelectedStep={setSelectedStep}
                        />
                      )}
                    </>
                  )}
                </Box>
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1-content" id="panel1-header">
                Issues
              </AccordionSummary>
              <AccordionDetails>
                {articleContent.trim() && (selectedStep || recommendedSteps) && (
                  <>
                    {articleTypePath.length > 0 && (
                      <IssuesComp
                        allContent={articleContent}
                        articleTypePath={articleTypePath}
                        recommendedSteps={recommendedSteps}
                        selectedStep={selectedStep}
                      />
                    )}
                  </>
                )}
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1-content" id="panel1-header">
                Collabrations
              </AccordionSummary>
              <AccordionDetails>
                <Box>
                  <>
                    {/* <Box id="guide-steps">
                  {articleContent.trim() && (
                    <>
                      {articleTypePath.length > 0 && (
                        <>
                          <GuideStepComp
                            allContent={articleContent}
                            articleTypePath={articleTypePath}
                            recommendedSteps={recommendedSteps}
                            setRecommendedSteps={setRecommendedSteps}
                          />
                          <Divider variant="fullWidth" sx={{ my: "10px" }} />
                        </>
                      )}
                    </>
                  )}
                </Box> */}
                    <Tabs
                      variant="fullWidth"
                      value={selectedTab}
                      onChange={handleTabChange}
                      aria-label="1CoAuthor Tabs"
                      style={{ marginBottom: "19px" }}
                    >
                      <Tab label="Brainstorm" value={0} />
                      <Tab label="Draft" value={1} />
                      <Tab label="Improve" value={2} />
                      {/* <Tab label="Grade" value={3} /> */}
                    </Tabs>
                    {selectedTab === 0 ? (
                      <ChatBoxComp
                        theme={theme}
                        allContent={articleContent}
                        selectedArticle={selectedArticle}
                        articleTypePath={articleTypePath}
                        recommendedSteps={recommendedSteps}
                        sideBarWidth={sideBarWidth}
                        findScrollAndSelect={findScrollAndSelect}
                        user={user}
                      />
                    ) : selectedTab === 1 ? (
                      <DraftComp
                        theme={theme}
                        articleTypePath={articleTypePath}
                        recommendedSteps={recommendedSteps}
                        allContent={articleContent}
                        findScrollAndSelect={findScrollAndSelect}
                        quillRef={quillRef}
                        sideBarWidth={sideBarWidth}
                        selection={selection}
                      />
                    ) : selectedTab === 2 ? (
                      <ImproveComp
                        theme={theme}
                        articleTypePath={articleTypePath}
                        recommendedSteps={recommendedSteps}
                        selectedArticle={selectedArticle}
                        allContent={articleContent}
                        findScrollAndSelect={findScrollAndSelect}
                      />
                    ) : (
                      selectedTab === 3 && <GradeComp />
                    )}
                  </>
                </Box>
              </AccordionDetails>
            </Accordion>
          </Box>
        )}
      </Box>
    </>
  );
};

export default SideBar;
