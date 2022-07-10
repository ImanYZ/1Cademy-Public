import CloseIcon from '@mui/icons-material/Close';
import ImageIcon from '@mui/icons-material/Image';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { Box, Button, FormControl, IconButton, Tooltip } from "@mui/material";
import React, { FC, useState } from "react";

type props = {
  image: any,
  setImage: (images: any) => void,
  defaultImageURI?: string
}

export const ImageUploader: FC<props> = ({ setImage, defaultImageURI = '' }) => {

  const [imageURI, setImageURI] = useState<string | null>(defaultImageURI)

  const onChangeImage = ((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      let reader = new FileReader();
      reader.onload = (ev) => { ev.target && setImageURI(ev.target.result as string) }
      reader.readAsDataURL(e.target.files[0]);
      setImage(e.target.files[0])
    }
  })

  const onRemoveImage = () => {
    setImageURI('')
  }

  const onResetImage = () => {
    setImageURI(defaultImageURI)
  }

  return (
    <FormControl fullWidth sx={{ mt: "16px", mb: "8px" }}>

      <Box sx={{ width: '100%', position: 'relative' }}>
        {!imageURI && <label htmlFor="contained-button-file">
          <input
            accept="image/*"
            id="contained-button-file"
            multiple
            type="file"
            hidden={true}
            onChange={onChangeImage} />
          <Button variant="outlined" component="span" color='secondary'>
            <ImageIcon sx={{ mr: "10px" }} />
            Upload image
          </Button>
        </label>}

        {imageURI && <>
          <Box sx={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: '#00000080',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: '0',
            transition: '0.5s',
            ':hover': {
              opacity: '1'
            }
          }}>
            <Box sx={{ position: 'absolute', top: '0px', right: '0px' }}>
              <Tooltip title='Restart to default value'>
                <IconButton color='info' sx={{ fontSize: '19px' }} onClick={onResetImage}>
                  <RestartAltIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title='Remove Image'>
                <IconButton color='info' sx={{ fontSize: '19px' }} onClick={onRemoveImage}>
                  <CloseIcon />
                </IconButton>
              </Tooltip>
            </Box>
            <label htmlFor="button-file">
              <input
                accept="image/*"
                id="button-file"
                multiple
                type="file"
                hidden={true}
                onChange={onChangeImage} />
              <Button color='info' variant='outlined' component="span" sx={{ fontSize: '19px' }}>
                Change Image
              </Button>
            </label>
          </Box>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt='Image preview' src={imageURI} style={{ width: '100%' }} />
        </>
        }
      </Box>
    </FormControl >
  )
}
