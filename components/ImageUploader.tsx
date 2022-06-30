import CloseIcon from '@mui/icons-material/Close';
import ImageIcon from '@mui/icons-material/Image';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { Box, Button, FormControl, IconButton } from "@mui/material";
import React, { FC, useState } from "react";

type props = {
  image: any,
  setImage: (images: any) => void,
  defaultImageURI?: string
}

export const ImageUploader: FC<props> = ({ image, setImage, defaultImageURI = '' }) => {

  const [imageURI, setImageURI] = useState<string | ArrayBuffer | null>(defaultImageURI)

  const onChangeImage = ((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      let reader = new FileReader();
      reader.onload = (ev) => { ev.target && setImageURI(ev.target.result) }
      reader.readAsDataURL(e.target.files[0]);
      setImage(e.target.files[0])
    }
  })

  const onRemoveImage = () => {
    console.log('on remove image')
    setImageURI('')
  }

  const onResetImage = () => {
    console.log('on reset image')
    setImageURI(image)
  }

  return (
    <FormControl fullWidth sx={{ mt: "16px", mb: "8px" }}>

      <Box sx={{ width: '100%', border: 'dashed', position: 'relative' }}>
        {!imageURI && <label htmlFor="contained-button-file">
          <input
            accept="image/*"
            id="contained-button-file"
            multiple
            type="file"
            hidden={true}
            onChange={onChangeImage} />
          {!imageURI && <Button variant="outlined" component="span" color='secondary'>
            <ImageIcon sx={{ mr: "10px" }} />
            Upload image
          </Button>}
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
            // cursor: 'pointer',
            opacity: '0',
            transition: '0.5s',
            ':hover': {
              opacity: '1'
            }
          }}>
            <Box sx={{ position: 'absolute', top: '0px', right: '0px' }}>
              <IconButton color='light' variant='outlined' sx={{ fontSize: '19px' }} onClick={onResetImage}>
                <RestartAltIcon />
              </IconButton>
              <IconButton color='light' variant='outlined' sx={{ fontSize: '19px' }} onClick={onRemoveImage}>
                <CloseIcon />
              </IconButton>
            </Box>
            <Button color='light' variant='outlined' sx={{ fontSize: '19px' }}>
              Change Image
            </Button>
          </Box>
          <img src={imageURI} style={{ width: '100%' }} />
        </>
        }
      </Box>
    </FormControl >
  )
}
