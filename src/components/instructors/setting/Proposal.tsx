import { Divider, FilledInput, Paper, Typography, useTheme } from "@mui/material";
import { Box } from "@mui/system";
import { FC } from "react";
import React from "react";

import { IOSSwitch } from "@/components/IOSSwitcher";
import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";
type Props = {
  semester: any;
  switchHandler: any;
  inputsHandler: any;
  errorState: any;
};
const Proposal: FC<Props> = ({ semester, inputsHandler, switchHandler, errorState }) => {
  const layoutTheme = useTheme();
  const {
    palette: { mode },
  } = layoutTheme;
  return (
    <Paper
      className="remove-arrow-buttons unselect-date-placeholder"
      elevation={2}
      sx={{
        padding: "40px 40px",
        backgroundColor: mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookMainBlack : DESIGN_SYSTEM_COLORS.gray50,
      }}
    >
      <Typography variant="h3">Course Contributions</Typography>
      <Box>
        <Typography mt={3} variant="h4">
          This class will start &nbsp;
          <FilledInput
            className={layoutTheme.palette.mode === "dark" ? "light-calender" : "dark-calender"}
            type="date"
            value={semester.startDate}
            id="filled-adornment-weight"
            onChange={event => inputsHandler(event, "chapters", "startDate")}
            aria-describedby="filled-weight-helper-text"
            inputProps={{
              "aria-label": "days",
            }}
            sx={{
              paddingBottom: "10px",
              height: "40px",
              width: "150px",
              borderBottom: "orange",
              color: theme =>
                semester.startDate != "" ? (theme.palette.mode === "dark" ? "white" : "black") : "transparent",
            }}
            error={errorState.startDate}
          />
          &nbsp; and will end on{" "}
          <FilledInput
            className={layoutTheme.palette.mode === "dark" ? "light-calender" : "dark-calender"}
            type="date"
            value={semester.endDate}
            id="filled-adornment-weight"
            onChange={event => inputsHandler(event, "chapters", "endDate")}
            aria-describedby="filled-weight-helper-text"
            inputProps={{
              "aria-label": "days",
            }}
            sx={{
              paddingBottom: "10px",
              height: "40px",
              width: "150px",
              borderBottom: "orange",
              color: theme =>
                semester.endDate != "" ? (theme.palette.mode === "dark" ? "white" : "black") : "transparent",
            }}
            error={errorState.endDate}
          />
          .
        </Typography>
        <Typography
          mt={3}
          color="error"
          sx={{ display: errorState.startDate || errorState.endDate ? "block" : "none" }}
        >
          * {errorState.errorText}
        </Typography>
      </Box>
      <Box sx={{ marginTop: "50px" }}>
        <Typography variant="h3" sx={{ display: "flex", justifyContent: "space-between" }}>
          Proposals
          <IOSSwitch
            inputProps={{ "aria-label": "controlled" }}
            checked={semester.isProposalRequired}
            color="primary"
            name="isProposalRequired"
            onChange={switchHandler}
          />
        </Typography>
        <Divider sx={{ my: "16px" }} />
        <Box
          sx={{
            ...(!semester.isProposalRequired && {
              pointerEvents: "none",
              opacity: "0.4",
            }),
          }}
        >
          <Typography mt={3} variant="h4" sx={{ lineHeight: "2.5" }}>
            From&nbsp;
            <FilledInput
              className={layoutTheme.palette.mode === "dark" ? "light-calender" : "dark-calender"}
              type="date"
              value={semester.nodeProposals.startDate}
              id="filled-adornment-weight"
              onChange={event => inputsHandler(event, "nodeProposals", "startDate")}
              aria-describedby="filled-weight-helper-text"
              inputProps={{
                "aria-label": "days",
              }}
              sx={{
                paddingBottom: "10px",
                height: "40px",
                width: "150px",
                borderBottom: "orange",
                color: theme =>
                  semester.nodeProposals.startDate != ""
                    ? theme.palette.mode === "dark"
                      ? "white"
                      : "black"
                    : "transparent",
              }}
              error={errorState.nodeProposalStartDate}
            />
            &nbsp; to &nbsp;
            <FilledInput
              type="date"
              className={layoutTheme.palette.mode === "dark" ? "light-calender" : "dark-calender"}
              value={semester.nodeProposals.endDate}
              id="filled-adornment-weight"
              onChange={event => inputsHandler(event, "nodeProposals", "endDate")}
              aria-describedby="filled-weight-helper-text"
              inputProps={{
                "aria-label": "days",
              }}
              sx={{
                paddingBottom: "10px",
                height: "40px",
                width: "150px",
                borderBottom: "orange",
                color: theme =>
                  semester.nodeProposals.endDate != ""
                    ? theme.palette.mode === "dark"
                      ? "white"
                      : "black"
                    : "transparent",
              }}
              error={errorState.nodeProposalEndDate}
            />
            &nbsp;each student can get&nbsp;
            <FilledInput
              type="number"
              value={semester.nodeProposals.numPoints}
              onChange={event => inputsHandler(event, "nodeProposals", "numPoints")}
              aria-describedby="filled-weight-helper-text"
              inputProps={{
                "aria-label": "days",
                min: 1,
              }}
              sx={{
                paddingBottom: "10px",
                height: "40px",
                width: "70px",
                borderBottom: "orange",
              }}
            />
            &nbsp;{semester.nodeProposals.numPoints > 1 ? "points" : "point"} by submitting &nbsp;
            <FilledInput
              type="number"
              value={semester.nodeProposals.numProposalPerDay}
              id="filled-adornment-weight"
              onChange={event => inputsHandler(event, "nodeProposals", "numProposalPerDay")}
              aria-describedby="filled-weight-helper-text"
              inputProps={{
                "aria-label": "days",
                min: 1,
              }}
              sx={{
                paddingBottom: "10px",
                height: "40px",
                width: "70px",
                borderBottom: "orange",
              }}
            />
            &nbsp;{semester.nodeProposals.numProposalPerDay > 1 ? "proposals/day" : "proposal/day"}.
          </Typography>
          <Typography
            mt={3}
            color="error"
            sx={{
              display:
                errorState.nodeProposalDay || errorState.nodeProposalStartDate || errorState.nodeProposalEndDate
                  ? "block"
                  : "none",
            }}
          >
            * {errorState.errorText}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ marginTop: "50px" }}>
        <Typography variant="h3" sx={{ display: "flex", justifyContent: "space-between" }}>
          Question Proposals
          <IOSSwitch
            inputProps={{ "aria-label": "controlled" }}
            checked={semester.isQuestionProposalRequired}
            color="primary"
            name="isQuestionProposalRequired"
            onChange={switchHandler}
          />
        </Typography>
        <Divider sx={{ my: "16px" }} />
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            alignContent: "center",
            alignItems: "baseline",
            ...(!semester.isQuestionProposalRequired && {
              pointerEvents: "none",
              opacity: "0.4",
            }),
          }}
        >
          <Typography mt={3} variant="h4" sx={{ lineHeight: "2.5" }}>
            From&nbsp;
            <FilledInput
              type="date"
              className={layoutTheme.palette.mode === "dark" ? "light-calender" : "dark-calender"}
              value={semester.questionProposals.startDate}
              id="filled-adornment-weight"
              onChange={event => inputsHandler(event, "questionProposals", "startDate")}
              aria-describedby="filled-weight-helper-text"
              inputProps={{
                "aria-label": "days",
              }}
              sx={{
                paddingBottom: "10px",
                height: "40px",
                width: "150px",
                borderBottom: "orange",
                color: theme =>
                  semester.questionProposals.startDate != ""
                    ? theme.palette.mode === "dark"
                      ? "white"
                      : "black"
                    : "transparent",
              }}
              error={errorState.questionProposalStartDate}
            />
            &nbsp; to &nbsp;
            <FilledInput
              type="date"
              className={layoutTheme.palette.mode === "dark" ? "light-calender" : "dark-calender"}
              value={semester.questionProposals.endDate}
              id="filled-adornment-weight"
              onChange={event => inputsHandler(event, "questionProposals", "endDate")}
              aria-describedby="filled-weight-helper-text"
              inputProps={{
                "aria-label": "days",
              }}
              sx={{
                paddingBottom: "10px",
                height: "40px",
                width: "150px",
                borderBottom: "orange",
                color: theme =>
                  semester.questionProposals.endDate != ""
                    ? theme.palette.mode === "dark"
                      ? "white"
                      : "black"
                    : "transparent",
              }}
              error={errorState.questionProposalEndDate}
            />
            &nbsp;each student can get&nbsp;
            <FilledInput
              type="number"
              value={semester.questionProposals.numPoints}
              onChange={event => inputsHandler(event, "questionProposals", "numPoints")}
              aria-describedby="filled-weight-helper-text"
              inputProps={{
                "aria-label": "days",
                min: 1,
              }}
              sx={{
                paddingBottom: "10px",
                height: "40px",
                width: "70px",
                borderBottom: "orange",
              }}
            />
            &nbsp;{semester.questionProposals.numPoints > 1 ? "points" : "point"} by submitting &nbsp;
            <FilledInput
              type="number"
              value={semester.questionProposals.numQuestionsPerDay}
              id="filled-adornment-weight"
              onChange={event => inputsHandler(event, "questionProposals", "numQuestionsPerDay")}
              aria-describedby="filled-weight-helper-text"
              inputProps={{
                "aria-label": "days",
                min: 1,
              }}
              sx={{
                paddingBottom: "10px",
                height: "40px",
                width: "70px",
                borderBottom: "orange",
              }}
            />
            &nbsp;{semester.questionProposals.numQuestionsPerDay > 1 ? "questions/day" : "question/day"}.
          </Typography>
          <Typography
            mt={3}
            color="error"
            sx={{
              display:
                errorState.questionProposalDay ||
                errorState.questionProposalStartDate ||
                errorState.questionProposalEndDate
                  ? "block"
                  : "none",
            }}
          >
            * {errorState.errorText}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ marginTop: "50px" }}>
        <Typography variant="h3" sx={{ display: "flex", justifyContent: "space-between" }}>
          Daily Practice
          <IOSSwitch
            inputProps={{ "aria-label": "controlled" }}
            checked={semester.isDailyPracticeRequired}
            color="primary"
            name="isDailyPracticeRequired"
            onChange={switchHandler}
          />
        </Typography>
        <Divider sx={{ my: "16px" }} />
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            alignContent: "center",
            alignItems: "baseline",
            ...(!semester.isDailyPracticeRequired && {
              pointerEvents: "none",
              opacity: "0.4",
            }),
          }}
        >
          <Typography mt={3} variant="h4" sx={{ lineHeight: "2.5" }}>
            From&nbsp;
            <FilledInput
              type="date"
              className={layoutTheme.palette.mode === "dark" ? "light-calender" : "dark-calender"}
              value={semester.dailyPractice.startDate}
              id="filled-adornment-weight"
              onChange={event => inputsHandler(event, "dailyPractice", "startDate")}
              aria-describedby="filled-weight-helper-text"
              inputProps={{
                "aria-label": "days",
              }}
              sx={{
                paddingBottom: "10px",
                height: "40px",
                width: "150px",
                borderBottom: "orange",
                color: theme =>
                  semester.dailyPractice.startDate != ""
                    ? theme.palette.mode === "dark"
                      ? "white"
                      : "black"
                    : "transparent",
              }}
              error={errorState.dailyPracticeStartDate}
            />
            &nbsp; to &nbsp;
            <FilledInput
              type="date"
              className={layoutTheme.palette.mode === "dark" ? "light-calender" : "dark-calender"}
              value={semester.dailyPractice.endDate}
              id="filled-adornment-weight"
              onChange={event => inputsHandler(event, "dailyPractice", "endDate")}
              aria-describedby="filled-weight-helper-text"
              inputProps={{
                "aria-label": "days",
              }}
              sx={{
                paddingBottom: "10px",
                height: "40px",
                width: "150px",
                borderBottom: "orange",
                color: theme =>
                  semester.dailyPractice.endDate != ""
                    ? theme.palette.mode === "dark"
                      ? "white"
                      : "black"
                    : "transparent",
              }}
              error={errorState.dailyPracticeEndDate}
            />
            &nbsp;each student can practice and get&nbsp;
            <FilledInput
              type="number"
              value={semester.dailyPractice.numPoints}
              onChange={event => inputsHandler(event, "dailyPractice", "numPoints")}
              aria-describedby="filled-weight-helper-text"
              inputProps={{
                "aria-label": "days",
                min: 1,
              }}
              sx={{
                paddingBottom: "10px",
                height: "40px",
                width: "70px",
                borderBottom: "orange",
              }}
            />
            &nbsp;{semester.dailyPractice.numPoints > 1 ? "points" : "point"} by answering &nbsp;
            <FilledInput
              type="number"
              value={semester.dailyPractice.numQuestionsPerDay}
              id="filled-adornment-weight"
              onChange={event => inputsHandler(event, "dailyPractice", "numQuestionsPerDay")}
              aria-describedby="filled-weight-helper-text"
              inputProps={{
                "aria-label": "days",
                min: 1,
              }}
              sx={{
                paddingBottom: "10px",
                height: "40px",
                width: "70px",
                borderBottom: "orange",
              }}
            />
            &nbsp;{semester.dailyPractice.numQuestionsPerDay > 1 ? "questions/day" : "question/day"}.
          </Typography>
          <Typography
            mt={3}
            color="error"
            sx={{
              display:
                errorState.dailyPracticeDay || errorState.dailyPracticeStartDate || errorState.dailyPracticeEndDate
                  ? "block"
                  : "none",
            }}
          >
            * {errorState.errorText}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default Proposal;
