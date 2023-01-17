import { Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import Box from "@mui/material/Box";
import React, { useEffect } from "react";
import { useRive } from "rive-react";

import { gray03 } from "../../pages/assistant";
import valuesItems from "./whyItems";

// const iniStepChecked: any[] = [];

const Values = () => {
  const theme = useTheme();
  // const [stepChecked, setStepChecked] = useState(iniStepChecked);

  const isMobile = useMediaQuery("(max-width:600px)");
  const isTablet = useMediaQuery("(min-width:900px)");

  const { rive, RiveComponent: RiveComponentMeettings } = useRive({
    src: "rive-assistant/meetings.riv",
    artboard: "meetings",
    animations: ["Timeline 1", theme.palette.mode === "dark" ? "dark" : "light"],
    autoplay: true,
  });

  useEffect(() => {
    if (!rive) return;

    rive.play(["Timeline 1", theme.palette.mode === "dark" ? "dark" : "light"]);
  }, [rive, theme.palette.mode]);

  const getGrayColorText = () => (theme.palette.mode === "dark" ? gray03 : theme.palette.common.darkBackground2);

  // const flipCard = (idx: number) => {
  //   const sChecked = [...stepChecked];
  //   sChecked[idx] = !sChecked[idx];
  //   setStepChecked(sChecked);
  // };

  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Stack direction={"column"} spacing={isMobile ? "60px" : "100px"}>
        {valuesItems.map((value, idx) => (
          <Stack
            key={idx}
            direction={isMobile ? "column" : idx % 2 === 0 ? "row" : "row-reverse"}
            spacing={isMobile ? "0px" : "40px"}
            // alignItems={"center"}
            alignItems={"stretch"}
            // alignSelf={"stretch"}
          >
            <Box
              component={"picture"}
              sx={{
                // border: "solid 2px orange",
                minWidth: isTablet ? "500px" : "300px",
                height: "inherit",
                display: "flex",
                alignItems: "center",
                justifyContent: isMobile ? "center" : idx % 2 === 0 ? "flex-start" : "flex-end",
              }}
            >
              {idx === 2 ? (
                <Box sx={{ width: "300px", height: "200px" }}>
                  <RiveComponentMeettings />
                </Box>
              ) : (
                <img
                  alt={value.name}
                  src={theme.palette.mode === "light" ? value.image : value.imageDark}
                  style={{ flex: 1 }}
                />
              )}
            </Box>
            <Box sx={{ p: "10px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <Typography
                gutterBottom
                variant="h3"
                component="h3"
                sx={{ fontSize: "24px", textAlign: isMobile ? "center" : "start" }}
              >
                {value.name}
              </Typography>
              <Typography
                variant="body2"
                sx={{ textAlign: "left", color: getGrayColorText(), fontSize: isMobile ? "16px" : "20px" }}
              >
                {value.body}
              </Typography>
            </Box>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
};

export default Values;

// <Grid container spacing={2.5}>
//   {valuesItems.map((value, idx) => {
//     return (

//       <Grid key={value.name} item xs={12} sm={6} md={4}>
//         <Card>
//           <CardActionArea onClick={() => flipCard(idx)}>
//             <Box
//               sx={{
//                 display: "flex",
//                 justify: "center",
//                 alignItems: "center",
//                 height: "250px",
//                 p: "16px",
//               }}
//             >
//               {idx === 2 ? (
//                 <RiveComponentMeettings />
//               ) : (
//                 <CardMedia
//                   component="img"
//                   width="100%"
//                   image={theme.palette.mode === "light" ? value.image : value.imageDark}
//                   alt={value.name}
//                 />
//               )}
//             </Box>
//             <CardContent
//               sx={{
//                 "&": {
//                   padding: "16px",
//                 },
//               }}
//             >
//               <Typography
//                 gutterBottom
//                 variant="h5"
//                 component="div"
//                 sx={{ fontSize: "20px", textAlign: "center" }}
//               >
//                 {value.name}
//               </Typography>
//               <Collapse in={stepChecked[idx]} timeout={1000} sx={{ textAlign: "center" }}>
//                 Learn more ...
//               </Collapse>
//               <Collapse in={!stepChecked[idx]} timeout={1000}>
//                 <Typography
//                   variant="body2"
//                   sx={{ textAlign: "left", color: getGrayColorText(), fontSize: "14px" }}
//                 >
//                   {value.body}
//                 </Typography>
//               </Collapse>
//             </CardContent>
//           </CardActionArea>
//         </Card>
//       </Grid>
//     );
//   })}
// </Grid>
