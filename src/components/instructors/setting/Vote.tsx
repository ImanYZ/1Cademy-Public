import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import StarIcon from "@mui/icons-material/Star";
import { Divider, FilledInput, Grid, Paper, Typography, useTheme } from "@mui/material";
import { Box } from "@mui/system";
import { FC } from "react";
import React from "react";

import { IOSSwitch } from "@/components/IOSSwitcher";
import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";
type Props = {
  inputsHandler: any;
  semester: any;
  switchHandler: any;
};
const Vote: FC<Props> = ({ semester, inputsHandler, switchHandler }) => {
  const {
    palette: { mode },
  } = useTheme();
  return (
    <Paper
      sx={{
        display: "flex",
        flexDirection: {
          xs: "column",
          md: "row",
        },
        backgroundColor: mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookMainBlack : DESIGN_SYSTEM_COLORS.gray50,
      }}
      elevation={2}
    >
      <Grid item xs={12} md={6}>
        <Box className="remove-arrow-buttons" sx={{ padding: "30px 40px" }}>
          <Box sx={{ marginTop: "10px" }}>
            <Typography variant="h3">Votes</Typography>
            <Typography
              variant="h4"
              mt={5}
              sx={{
                fontSize: "20px",
                fontWeight: 500,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              Casting Votes
              <IOSSwitch
                inputProps={{ "aria-label": "controlled" }}
                checked={semester.isCastingVotesRequired}
                color="primary"
                name="isCastingVotesRequired"
                onChange={switchHandler}
              />
            </Typography>
            <Box mt={5}>
              <Typography sx={{ color: "#A5A5A5", fontSize: "0.8rem!important" }} variant="h5">
                * Note that students do not see the instructor(s)' votes on any proposals
              </Typography>
            </Box>
            <Divider sx={{ my: "16px" }} />
            <Box
              sx={{
                ...(!semester.isCastingVotesRequired && {
                  pointerEvents: "none",
                  opacity: "0.4",
                }),
              }}
            >
              <Box sx={{ display: "flex", flexWrap: "wrap", alignContent: "center", alignItems: "baseline" }}>
                <Typography
                  mt={3}
                  variant="h4"
                  sx={{
                    fontSize: "16px",
                  }}
                >
                  Each student will earn&nbsp;
                  <FilledInput
                    type="number"
                    value={semester.votes.pointIncrementOnAgreement}
                    onChange={event => inputsHandler(event, "votes", "pointIncrementOnAgreement")}
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
                  &nbsp; by casting votes on others' proposals, which is in agreement with the instructors(s)' vote on
                  the same proposal.
                </Typography>
              </Box>
              <Box sx={{ display: "flex", flexWrap: "wrap", alignContent: "center", alignItems: "baseline" }}>
                <Typography
                  mt={3}
                  variant="h4"
                  sx={{
                    fontSize: "16px",
                  }}
                >
                  Each student will lose&nbsp;
                  <FilledInput
                    type="number"
                    value={semester.votes.pointDecrementOnAgreement}
                    onChange={event => inputsHandler(event, "votes", "pointDecrementOnAgreement")}
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
                  &nbsp; by casting votes on others' proposals, which is in disagreement with the instructors(s)' vote
                  on the same proposal.
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Grid>
      <Grid item xs={12} md={6}>
        <Box className="remove-arrow-buttons" sx={{ padding: "40px 40px" }}>
          <Box sx={{ marginTop: "10px" }}>
            <Typography
              variant="h4"
              sx={{
                fontSize: "20px",
                fontWeight: 500,
                marginTop: {
                  xs: "20px",
                  md: "60px",
                },
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              Getting Votes
              <IOSSwitch
                inputProps={{ "aria-label": "controlled" }}
                checked={semester.isGettingVotesRequired}
                color="primary"
                name="isGettingVotesRequired"
                onChange={switchHandler}
              />
            </Typography>
            <Divider sx={{ my: "16px" }} />
            <Box
              sx={{
                ...(!semester.isGettingVotesRequired && {
                  pointerEvents: "none",
                  opacity: "0.4",
                }),
              }}
            >
              <Box sx={{ display: "flex", flexWrap: "wrap", alignContent: "center", alignItems: "baseline" }}>
                <Typography
                  mt={3}
                  variant="h4"
                  sx={{
                    fontSize: "16px",
                  }}
                >
                  For every
                  <CheckIcon
                    sx={{
                      color: "green",
                      marginTop: "auto",
                      marginRight: "5px",
                      marginBottom: "-5px",
                      marginLeft: "5px",
                    }}
                    fontSize="small"
                  />
                  a student gets from their classmates/instructor(s) on their proposals, they will earn&nbsp;
                  <FilledInput
                    type="number"
                    value={semester.votes.onReceiveVote}
                    onChange={event => inputsHandler(event, "votes", "onReceiveVote")}
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
                  &nbsp;{semester.votes.onReceiveVote > 1 ? "points/vote" : "point/vote"}.
                </Typography>
              </Box>
              <Box>
                <Typography
                  mt={3}
                  variant="h4"
                  sx={{
                    fontSize: "16px",
                  }}
                >
                  For every
                  <ClearIcon
                    sx={{
                      color: "red",

                      marginTop: "auto",
                      marginRight: "5px",
                      marginBottom: "-5px",
                      marginLeft: "5px",
                    }}
                    fontSize="small"
                  />
                  a student gets from their classmates/instructor(s) on their proposals, they will lose&nbsp;
                  <FilledInput
                    type="number"
                    value={semester.votes.onReceiveDownVote}
                    onChange={event => inputsHandler(event, "votes", "onReceiveDownVote")}
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
                  &nbsp;{semester.votes.onReceiveDownVote > 1 ? "points/vote" : "point/vote"}.
                </Typography>
              </Box>
              <Box>
                <Typography
                  mt={3}
                  variant="h4"
                  sx={{
                    fontSize: "16px",
                  }}
                >
                  For every
                  <StarIcon
                    sx={{
                      color: "#FFE820",
                      marginTop: "auto",
                      marginRight: "5px",
                      marginBottom: "-5px",
                      marginLeft: "5px",
                    }}
                    fontSize="small"
                  />
                  a student gets from their instructor(s) on their proposals, they will earn&nbsp;
                  <FilledInput
                    type="number"
                    value={semester.votes.onReceiveStar}
                    onChange={event => inputsHandler(event, "votes", "onReceiveStar")}
                    // endAdornment={
                    //   <Box style={{ marginBottom: "-18px" }}>
                    //     <InputAdornment position="end">
                    //       {semester.votes.onReceiveStar > 1 ? "points/vote" : "point/vote"}
                    //     </InputAdornment>
                    //   </Box>
                    // }
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
                  &nbsp;{semester.votes.onReceiveStar > 1 ? "points/vote" : "point/vote"}.
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Grid>
    </Paper>
  );
};

export default Vote;
