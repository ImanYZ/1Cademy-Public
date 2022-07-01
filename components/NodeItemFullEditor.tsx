import CloseIcon from '@mui/icons-material/Close';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { LoadingButton } from '@mui/lab'
import { Autocomplete, Box, Button, Card, CardContent, Divider, IconButton, InputLabel, Link, TextField, Tooltip, Typography } from '@mui/material'
import dayjs from 'dayjs'
import relativeTime from "dayjs/plugin/relativeTime";
import { Formik, FormikErrors, FormikHelpers } from 'formik'
import React, { FC, ReactNode, useState } from 'react'

import { getNodePageUrl, isValidHttpUrl } from '../lib/utils';
import { KnowledgeNode, LinkedKnowledgeNode } from '../src/knowledgeTypes'
import { FullReferencesAutocomplete } from './FullReferencesAutocomplete';
import { FullTagAutocomplete } from './FullTagAutocomplete';
import { ImageUploader } from './ImageUploader'
import { LinkedReference } from './LinkedReference';
import MarkdownRender from './Markdown/MarkdownRender'
import { MarkdownHelper } from './MarkdownHelper'
import NodeTypeIcon from './NodeTypeIcon'
import { Searcher } from './Searcher';

dayjs.extend(relativeTime);

interface ProposalFormValues {
  title: string;
  content: string;
  file: any;
  reasons: string;
}

type Props = {
  node: KnowledgeNode;
  contributors?: ReactNode;
  references?: ReactNode;
  tags?: ReactNode;
}

export const NodeItemFullEditor: FC<Props> = ({ node }) => {
  const [fileImage, setFileImage] = useState(null)
  // const [nodeTags, setNodeTags] = useState(node.tags || [])
  const [nodeReferences, setNodeReferences] = useState<LinkedKnowledgeNode[]>(node.references || [])

  // const [tagsSelected, setTagsSelected] = useState<LinkedKnowledgeNode[]>([])

  const initialValues: ProposalFormValues = {
    title: node.title || '',
    content: node.content || '',
    file: { name: '', type: '', size: 0 },
    reasons: ''
  }

  const validate = (values: ProposalFormValues) => {
    let errors: FormikErrors<ProposalFormValues> = {}
    if (!values.title) { errors.title = "required" }
    // if (!values.content) { errors.content = "required" }
    // if (!values.file) { errors.file = "required" }
    if (!values.reasons) { errors.reasons = "required" }

    return errors
  }

  const onSubmit = async (values: ProposalFormValues, { setSubmitting }: FormikHelpers<ProposalFormValues>) => {
    console.log('[submit proposal]', values)

    setSubmitting(true)
  }

  return (
    <Card data-testid="node-item-full">
      <CardContent
        sx={{
          p: { xs: 5, md: 10 },
          "&:last-child": {
            paddingBottom: { xs: 4, md: 10 }
          }
        }}
      >
        <Formik initialValues={initialValues} validate={validate} onSubmit={onSubmit}>
          {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
            <form onSubmit={handleSubmit}>

              <TextField
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
              />

              <Box sx={{ my: "8px" }}>
                <Typography textAlign="right">
                  <Link>Log in</Link> to show your name in the contributors’ list and earn points for your helpful proposals
                </Typography>
                <Box sx={{ pt: "20px", display: "flex", justifyContent: "end", gap: '10px' }}>
                  <Button color='secondary'>Cancel</Button>
                  <LoadingButton type="submit" color="primary" variant="contained" loading={isSubmitting} >
                    Propose changes
                  </LoadingButton>
                </Box>
              </Box>

              <MarkdownHelper />

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

              <Box>
                <Typography component='h2' sx={{ fontSize: '30px', mb: '32px', mt: '10px' }}>
                  <MarkdownRender text={values.title} />
                </Typography>
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
                  <MarkdownRender text={values.content} />
                </Typography>
              </Box>

              <ImageUploader image={fileImage} setImage={setFileImage} defaultImageURI={node.nodeImage || ''} />

              <Box sx={{ display: "flex", alignItems: "center" }}>
                <NodeTypeIcon nodeType={node.nodeType} />
                {node.changedAt && (
                  <Tooltip title={`Last updated on ${new Date(node.changedAt).toLocaleString()}`}>
                    <Typography sx={{ ml: 1 }} component="span" color="text.secondary" variant="caption">
                      {dayjs(new Date(node.changedAt)).fromNow()}
                    </Typography>
                  </Tooltip>
                )}
              </Box>

              <Divider sx={{ my: '32px' }} />

              <FullTagAutocomplete />

              <FullReferencesAutocomplete />

            </form>
          )}
        </Formik>

        {/* {node.nodeType === "Question" && <QuestionItem choices={node.choices} />} */}

      </CardContent>
      {/* {node.nodeImage && (
        <FullScreenImage src={node.nodeImage} open={imageFullScreen} onClose={() => setImageFullScreen(false)} />
      )} */}
    </Card >
  )
}
