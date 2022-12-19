import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import React from "react";

import Typography from "./Typography";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const WhoWeAre = (props: any) => {
  return (
    <Container
      id="WhoWeAreSection"
      component="section"
      sx={{
        pt: 7,
        pb: 10,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        bgcolor: "secondary.light",
      }}
    >
      <Typography variant="h4" marked="center" sx={{ mb: 7 }}>
        Who Is Behind 1Cademy?
      </Typography>
      <Grid container spacing={2.5}>
        <Grid item xs={12} sm={6} md={4}>
          <Paper>
            <Typography variant="h5" component="div" sx={{ pt: "19px", pb: "19px", borderBottom: "1px solid #AAAAAA" }}>
              Recently Published Papers
            </Typography>
            <List sx={{ width: "100%" }}>
              <ListItemButton component="a" target="_blank" href="https://dl.acm.org/doi/abs/10.1145/3446871.3469760">
                <ListItemText
                  primary="ACM ICER 2021"
                  secondary={
                    <Typography variant="body2" color="text.secondary">
                      YeckehZaare, I., Fox, E., Grot, G., Chen, S., Walkosak, C., Kwon, K., ... &amp; Silverstein, N.
                      (2021, August). Incentivized Spacing and Gender in Computer Science Education. In{" "}
                      <Box component="span" sx={{ fontStyle: "italic" }}>
                        Proceedings of the 17th ACM Conference on International Computing Education Research
                      </Box>{" "}
                      (pp. 18-28).
                    </Typography>
                  }
                />
              </ListItemButton>
              <ListItemButton component="a" target="_blank" href="https://dl.acm.org/doi/abs/10.1145/3313831.3376882">
                <ListItemText
                  primary="ACM CHI 2020"
                  secondary={
                    <Typography variant="body2" color="text.secondary">
                      Yeckehzaare, I., Barghi, T., &amp; Resnick, P. (2020, April). QMaps: Engaging Students in
                      Voluntary Question Generation and Linking. In{" "}
                      <Box component="span" sx={{ fontStyle: "italic" }}>
                        Proceedings of the 2020 CHI Conference on Human Factors in Computing Systems
                      </Box>{" "}
                      (pp. 1-14).
                    </Typography>
                  }
                />
              </ListItemButton>
              <ListItemButton component="a" target="_blank" href="https://dl.acm.org/doi/abs/10.1145/3291279.3339411">
                <ListItemText
                  primary="ACM ICER 2019"
                  secondary={
                    <Typography variant="body2" color="text.secondary">
                      YeckehZaare, I., Resnick, P., &amp; Ericson, B. (2019, July). A spaced, interleaved retrieval
                      practice tool that is motivating and effective. In{" "}
                      <Box component="span" sx={{ fontStyle: "italic" }}>
                        Proceedings of the 2019 ACM Conference on International Computing Education Research
                      </Box>{" "}
                      (pp. 71-79).
                    </Typography>
                  }
                />
              </ListItemButton>
              <ListItemButton component="a" target="_blank" href="https://dl.acm.org/doi/abs/10.1145/3287324.3287417">
                <ListItemText
                  primary="ACM SIGCSE 2019"
                  secondary={
                    <Typography variant="body2" color="text.secondary">
                      YeckehZaare, I., &amp; Resnick, P. (2019, February). Speed and Studying: Gendered Pathways to
                      Success. In{" "}
                      <Box component="span" sx={{ fontStyle: "italic" }}>
                        Proceedings of the 50th ACM Technical Symposium on Computer Science Education
                      </Box>{" "}
                      (pp. 693-698).
                    </Typography>
                  }
                />
              </ListItemButton>
              <ListItemButton
                component="a"
                target="_blank"
                href="https://www.researchgate.net/profile/Iman-Yeckehzaare/publication/341966650_Runestone_Interactive_Ebooks_A_Research_Platform_for_On-line_Computer_Science_Learning/links/5edb704945851529453ca208/Runestone-Interactive-Ebooks-A-Research-Platform-for-On-line-Computer-Science-Learning.pdf"
              >
                <ListItemText
                  primary="SPLICE 2019"
                  secondary={
                    <Typography variant="body2" color="text.secondary">
                      Ericson, B. J., YeckehZaare, I., &amp; Guzdial, M. J. (2019). Runestone Interactive Ebooks: A
                      Research Platform for On-line Computer Science Learning. In{" "}
                      <Box component="span" sx={{ fontStyle: "italic" }}>
                        Proceedings of SPLICE 2019 workshop Computing Science Education Infrastructure: From Tools to
                        Data at 15th ACM International Computing Education Research Conference, Aug 11, 2019, Toronto,
                        Canada.
                      </Box>
                    </Typography>
                  }
                />
              </ListItemButton>
            </List>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Paper>
            <Typography variant="h5" component="div" sx={{ pt: "19px", pb: "19px", borderBottom: "1px solid #AAAAAA" }}>
              2022 Published Papers
            </Typography>
            <List sx={{ width: "100%" }}>
              <ListItemButton component="a">
                <ListItemText
                  primary="ACM SIGCSE 2023"
                  secondary={
                    <Typography variant="body2" color="text.secondary">
                      YeckehZaare, I., Chen, S., & Barghi, T. (2023). Reducing Procrastination Without Sacrificing
                      Students' Autonomy Through Optional Weekly Presentations of Student-Generated Content. In{" "}
                      <br></br>
                      <Box component="span" sx={{ fontStyle: "italic" }}>
                        Proceedings of the 54th ACM Technical Symposium on Computer Science Education (SIGCSE 2023),
                        March 15--18, 2023, Toronto, Canada. ACM.
                      </Box>
                    </Typography>
                  }
                />
              </ListItemButton>
              <ListItemButton component="a" target="_blank" href="https://dl.acm.org/doi/abs/10.1145/3478431.3499408">
                <ListItemText
                  primary="ACM SIGCSE 2022"
                  secondary={
                    <Typography variant="body2" color="text.secondary">
                      YeckehZaare, I., Grot, G., &amp; Aronoff, C. (2022). Retrieval-based Teaching Incentivizes Spacing
                      and Improves Grades in Computer Science Education. In{" "}
                      <Box component="span" sx={{ fontStyle: "italic" }}>
                        Proceedings of the 53rd ACM Technical Symposium on Computer Science Education V. 1 (SIGCSE
                        2022), March 3--5, 2022, Providence, RI, USA. ACM.
                      </Box>
                    </Typography>
                  }
                />
              </ListItemButton>
              <ListItemButton component="a" target="_blank" href="https://dl.acm.org/doi/abs/10.1145/3478431.3499313">
                <ListItemText
                  primary="ACM SIGCSE 2022"
                  secondary={
                    <Typography variant="body2" color="text.secondary">
                      YeckehZaare, I., Grot, G., Dimovski, I., Pollock, K., &amp; Fox, E. (2022). Another Victim of
                      COVID-19: Computer Science Education. In{" "}
                      <Box component="span" sx={{ fontStyle: "italic" }}>
                        Proceedings of the 53rd ACM Technical Symposium on Computer Science Education V. 1 (SIGCSE
                        2022), March 3--5, 2022, Providence, RI, USA. ACM.
                      </Box>
                    </Typography>
                  }
                />
              </ListItemButton>
              <ListItemButton component="a" target="_blank" href="https://dl.acm.org/doi/abs/10.1145/3506860.3506907">
                <ListItemText
                  primary="Accepted by ACM LAK 2022"
                  secondary={
                    <Typography variant="body2" color="text.secondary">
                      YeckehZaare, I., Mulligan, V., Ramstad, G. V., &amp; Resnick, P. (2022). Semester-level Spacing
                      but Not Procrastination Affected Student Exam Performance. In{" "}
                      <Box component="span" sx={{ fontStyle: "italic" }}>
                        Proceedings of the 12th International Conference on Learning Analytics and Knowledge
                        (LAK&#8216;22) online, March 21-25, 2022. ACM.
                      </Box>
                    </Typography>
                  }
                />
              </ListItemButton>
            </List>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Paper>
            <List sx={{ width: "100%", bgcolor: "background.paper" }}>
              <ListItemButton
                alignItems="flex-start"
                component="a"
                target="_blank"
                href="https://www.si.umich.edu/people/paul-resnick"
              >
                <ListItemAvatar>
                  <Avatar
                    alt="Paul Resnick Picture"
                    src="/static/Paul_Resnick.jpg"
                    sx={{ width: 100, height: 130, mr: 2.5 }}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary="1Cademy Advisor"
                  secondary={
                    <React.Fragment>
                      <Typography sx={{ display: "inline" }} component="span" variant="body2" color="text.primary">
                        Paul Resnick
                      </Typography>
                      {
                        " — Michael D. Cohen Collegiate Professor of Information, Associate Dean for Research and Faculty Affairs and Professor of Information, University of Michigan, School of Information"
                      }
                    </React.Fragment>
                  }
                />
              </ListItemButton>
              <Divider variant="inset" component="li" />
              <ListItemButton
                alignItems="flex-start"
                component="a"
                target="_blank"
                href="https://www.si.umich.edu/people/iman-yeckehzaare"
              >
                <ListItemAvatar>
                  <Avatar
                    alt="Iman YeckehZaare Picture"
                    src="/static/Iman_YeckehZaare.jpg"
                    sx={{ width: 100, height: 130, mr: 2.5 }}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary="1Cademy Architect"
                  secondary={
                    <React.Fragment>
                      <Typography sx={{ display: "inline" }} component="span" variant="body2" color="text.primary">
                        Iman YeckehZaare
                      </Typography>
                      {
                        " — Ph.D. Candidate, Awarded as the Best Graduate Student Instructor of the Year 2018-2019 at the University of Michigan, School of Information"
                      }
                    </React.Fragment>
                  }
                />
              </ListItemButton>
              <Divider variant="inset" component="li" />
              <ListItemButton alignItems="flex-start" component="a" target="_blank" href="https://www.honor.education/">
                <ListItemAvatar>
                  <Avatar
                    alt="Honor Education"
                    src={"/Honor_Education_Logo.jpeg"}
                    sx={{ width: 100, height: 100, mr: 2.5 }}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary="Supported by Honor Education"
                  secondary={
                    <React.Fragment>
                      <Typography sx={{ display: "inline" }} component="span" variant="body2" color="text.primary">
                        Honor Education
                      </Typography>
                    </React.Fragment>
                  }
                />
              </ListItemButton>
              <Divider variant="inset" component="li" />
              <ListItemButton alignItems="flex-start" component="a" target="_blank" href="https://www.si.umich.edu/">
                <ListItemAvatar>
                  <Avatar
                    alt="University of Michigan School of Information Logo"
                    src={"/umsi-logo-vert-u.png"}
                    sx={{ width: 100, height: 100, mr: 2.5 }}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary="Supported by University of Michigan"
                  secondary={
                    <React.Fragment>
                      <Typography sx={{ display: "inline" }} component="span" variant="body2" color="text.primary">
                        School of Information
                      </Typography>
                    </React.Fragment>
                  }
                />
              </ListItemButton>
              <Divider variant="inset" component="li" />
              <ListItemButton
                alignItems="flex-start"
                component="a"
                target="_blank"
                href="https://cloud.google.com/edu/researchers"
              >
                <ListItemAvatar>
                  <Avatar alt="Google Cloud Logo" src={"/GoogleCloud.svg"} sx={{ width: 100, height: 100, mr: 2.5 }} />
                </ListItemAvatar>
                <ListItemText
                  primary="Supported by Google"
                  secondary={
                    <React.Fragment>
                      <Typography sx={{ display: "inline" }} component="span" variant="body2" color="text.primary">
                        Google Cloud
                      </Typography>
                      {" — awarded research credits to host 1Cademy on GCP services, under award number 205607640."}
                    </React.Fragment>
                  }
                />
              </ListItemButton>
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default WhoWeAre;
