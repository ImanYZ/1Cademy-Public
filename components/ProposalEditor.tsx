import AddIcon from "@mui/icons-material/Add";
import LoadingButton from "@mui/lab/LoadingButton";
import { Box, Button, Collapse, FormControl, Input, InputLabel, Link, TextField, Typography } from "@mui/material";
import { Formik, FormikErrors, FormikHelpers } from "formik";
import React, { useState } from "react";

import { ImageUploader } from "./ImageUploader";
import MarkdownRender from "./Markdown/MarkdownRender";
interface ProposalFormValues {
  title: string;
  content: string;
  file: any;
  reasons: string;
}

export const ProposalEditor = () => {
  const [showHelper, setShowHelper] = useState(false);
  const [fileImage, setFileImage] = useState(null)

  const initialValues: ProposalFormValues = {
    title: '',
    content: '',
    file: { name: '', type: '', size: 0 },
    reasons: ''
  }

  const validate = (values: ProposalFormValues) => {
    let errors: FormikErrors<ProposalFormValues> = {}
    if (!values.title) { errors.title = "required" }
    if (!values.content) { errors.content = "required" }
    if (!values.file) { errors.file = "required" }
    if (!values.reasons) { errors.reasons = "required" }

    return errors
  }

  const onSubmit = async (values: ProposalFormValues, { setSubmitting }: FormikHelpers<ProposalFormValues>) => {
    console.log('[submit proposal]', values)

    setSubmitting(true)
  }

  // const buildImgTag = () => {
  //   let imgTag = null;
  //   if (this.state.imageURI !== null)
  //     imgTag = (<div className="row">
  //       <div className="small-9 small-centered columns">
  //         <img className="thumbnail" src={this.state.imageURI}></img>
  //       </div>
  //     </div>);
  //   return imgTag;
  // }

  // const imgTag = buildImgTag();

  return (
    <Box sx={{ p: "50px", width: "100%" }}>
      <Box
        sx={{
          background: "#EE7E2A12",
          p: "15px"
        }}
      >
        <Box onClick={() => setShowHelper(!showHelper)} sx={{ my: "12px", display: "flex", cursor: "pointer" }}>
          <AddIcon
            sx={{
              transform: `rotate(${showHelper ? "0deg" : "45deg"})`,
              transition: "0.2s"
            }}
          />
          <Typography>Click to see how to format your text</Typography>
        </Box>
        <Collapse in={showHelper} timeout="auto" unmountOnExit>
          <ul style={{ paddingLeft: "20px", margin: "0px", display: "flex", flexDirection: "column", gap: "10px" }}>
            <li>
              <Typography>use ``` to create code fenses</Typography>
              <Box
                sx={{
                  p: "10px",
                  ml: "-20px",
                  lineHeight: "35px",
                  background: theme => theme.palette.common.darkGrayBackground,
                  color: theme => theme.palette.common.white,
                  borderRadius: "5px"
                }}
              >
                <code>```</code>
                <br />
                <code>any programming languages</code>
                <br />
                <code>```</code>
              </Box>
            </li>
            <li>_italic_ and **bold**</li>
            <li>
              <Typography>insert links</Typography>
              <Box
                sx={{
                  p: "10px",
                  ml: "-20px",
                  lineHeight: "35px",
                  background: theme => theme.palette.common.white,
                  color: theme => theme.palette.common.black,
                  borderRadius: "5px"
                }}
              >
                <code>{"<https://example.com>"}</code>
                <br />
                <code>{"[example](https://example.com)"}</code>
                <br />
                <code>{'<a href="https://example.com">example</a>'}</code>
              </Box>
            </li>
            <li>
              <i># Header 1 #</i>
            </li>
            <li>
              <i>## Header 2 ##</i>
            </li>
            <li>
              <i>### Header 3 ###</i>
            </li>
          </ul>
        </Collapse>
      </Box>
      <Formik initialValues={initialValues} validate={validate} onSubmit={onSubmit}>
        {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
          <form onSubmit={handleSubmit}>
            <TextField
              id="title"
              name="title"
              label="Change the title"
              variant="outlined"
              margin="normal"
              value={values.title}
              onChange={handleChange}
              onBlur={handleBlur}
              error={Boolean(errors.title) && Boolean(touched.title)}
              fullWidth
            />

            <TextField
              id="content"
              name="content"
              label="Change the content"
              variant="outlined"
              margin="normal"
              value={values.content}
              onChange={handleChange}
              onBlur={handleBlur}
              error={Boolean(errors.content) && Boolean(touched.content)}
              fullWidth
              multiline
              rows={4}
            />

            <ImageUploader image={fileImage} setImage={setFileImage} />

            {/* <TextField
              id="reasons"
              name="reasons"
              label="Provide reasons for your changes"
              variant="outlined"
              margin="normal"
              placeholder="To expedite your proposal review, please explain why you propose this new version"
              value={values.reasons}
              onChange={handleChange}
              onBlur={handleBlur}
              error={Boolean(errors.reasons) && Boolean(touched.reasons)}
              rows={2}
              multiline
              fullWidth
            /> */}

            <Box>
              <MarkdownRender text={'# title preview' || ""} />
              <Typography
                variant="body1"
                color="text.secondary"
                component="div"
                sx={{
                  color: theme => theme.palette.common.black,
                  lineHeight: 2,
                  fontSize: "1.2rem"
                }}
              >
                <MarkdownRender text={'content preview' || ""} />
              </Typography>
            </Box>

            <Box sx={{ my: "10px" }}>
              <Box sx={{ pt: "20px", display: "flex", justifyContent: "end" }}>
                <Button>Cancel</Button>
                <LoadingButton type="submit" color="primary" variant="contained" loading={isSubmitting}>
                  Propose changes
                </LoadingButton>
              </Box>
              <Box sx={{ pt: "20px" }}>
                <Typography textAlign="right">
                  Want to propose new nodes, modify learn before/after, tags, and references?
                </Typography>
                <Typography textAlign="right">
                  <Link>Apply</Link> to be a 1Cademy member!
                </Typography>
              </Box>
            </Box>
          </form>
        )}
      </Formik>
    </Box>
  );
};
