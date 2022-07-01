import CloseIcon from '@mui/icons-material/Close';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { LoadingButton } from '@mui/lab'
import { Autocomplete, Box, Button, Card, CardContent, Divider, FormControl, IconButton, InputLabel, Link, TextField, Tooltip, Typography } from '@mui/material'
import dayjs from 'dayjs'
import relativeTime from "dayjs/plugin/relativeTime";
import { Formik, FormikErrors, FormikHelpers } from 'formik'
import React, { FC, ReactNode, useState } from 'react'
import { useQuery } from 'react-query';

import { getTagsAutocomplete } from '../lib/knowledgeApi';
import { getNodePageUrl, getReferenceTitle, isValidHttpUrl } from '../lib/utils';
import { KnowledgeNode, LinkedKnowledgeNode } from '../src/knowledgeTypes'
import { ImageUploader } from './ImageUploader'
import { LinkedReference } from './LinkedReference';
import { LinkedTag } from './LinkedTag';
import MarkdownRender from './Markdown/MarkdownRender'
import { MarkdownHelper } from './MarkdownHelper'
import NodeTypeIcon from './NodeTypeIcon'
import QuestionItem from './QuestionItem'
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

export const NodeItemFullEditor: FC<Props> = ({ node, contributors, references, tags }) => {
  const [fileImage, setFileImage] = useState(null)
  const [nodeTags, setNodeTags] = useState(node.tags || [])
  const [nodeReferences, setNodeReferences] = useState<LinkedKnowledgeNode[]>(node.references || [])
  const [searchText, setSearchText] = useState('')
  const { data, isLoading } = useQuery(["tags", searchText], () => getTagsAutocomplete(searchText));

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

  const getReferenceContent = (el: LinkedKnowledgeNode) => {
    return isValidHttpUrl(el.label)
      ? `${el.title}:  ${el.label}`
      : el.title || ""
  }

  const onRemoveTag = (nodeTag: string) => {
    setNodeTags(currentTags => currentTags.filter(cur => cur.node !== nodeTag))
  }

  const onRemoveReferences = (referenceNode: string) => {
    setNodeReferences(currentReferences => currentReferences.filter(cur => cur.node !== referenceNode))
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

              <Box sx={{ mb: '32px' }}>
                {/* tags */}
                <InputLabel htmlFor="tag-searcher" sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: '16px',
                  color: theme => theme.palette.grey[600]
                }}>
                  <LocalOfferIcon fontSize='small' sx={{
                    mr: '10px',
                    color: theme => theme.palette.grey[400]
                  }} />Tags
                </InputLabel>
                <Autocomplete
                  id="tag-searcher"
                  freeSolo
                  fullWidth
                  options={data?.results || []}
                  renderInput={(params) => <Searcher
                    ref={params.InputProps.ref}
                    inputBaseProps={params.inputProps}
                  />}
                  onChange={(e, v) => console.log('tag', e, v)}
                  sx={{ mb: '16px' }}
                />
                {
                  nodeTags.map((cur, idx) =>
                    <LinkedTag
                      node={cur.node}
                      key={idx}
                      nodeImageUrl={cur.nodeImage}
                      nodeContent={cur.content}
                      title={getReferenceTitle(cur)}
                      linkSrc={getNodePageUrl(cur.title || "", cur.node)}
                      openInNewTab
                      onDelete={(node: string) => onRemoveTag(node)}
                    />
                  )
                }
              </Box>

              <Box>
                {/* references */}
                <InputLabel htmlFor="references-searcher" sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: '16px',
                  color: theme => theme.palette.grey[600]
                }}>
                  <MenuBookIcon fontSize='small' sx={{
                    mr: '10px',
                    color: theme => theme.palette.grey[400]
                  }} />References
                </InputLabel>
                <Autocomplete
                  id="references-searcher"
                  freeSolo
                  fullWidth
                  onChange={(e, v) => console.log('references', e, v)}
                  options={['r1', 'r2', 'r3']}
                  renderInput={(params) => <Searcher
                    ref={params.InputProps.ref}
                    inputBaseProps={params.inputProps}
                  />}
                  sx={{ mb: '16px' }}
                />
                {nodeReferences.map((reference, idx) =>
                  <React.Fragment key={idx}>
                    {idx === 0 && <Divider />}
                    <LinkedReference
                      title={reference.title || ""}
                      linkSrc={getNodePageUrl(reference.title || "", reference.node)}
                      nodeType={reference.nodeType}
                      nodeImageUrl={reference.nodeImage}
                      nodeContent={getReferenceContent(reference)}
                      showListItemIcon={false}
                      label={reference.label || ""}
                      sx={{ p: "20px 16px" }}
                      openInNewTab
                      secondaryActionSx={{ mr: "34px" }}
                      secondaryAction={<IconButton
                        sx={{ alignItems: 'center', justifyContent: 'flex-end' }}
                        onClick={() => onRemoveReferences(reference.node)}
                      >
                        <CloseIcon />
                      </IconButton>}
                    />
                    <Divider />
                  </React.Fragment>
                )}
              </Box>
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
