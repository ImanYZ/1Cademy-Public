import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { Box, IconButton, Tooltip } from "@mui/material";
import React, { useState } from "react";

type props = {
  images: string[];
  removeImage?: any;
  editMode?: boolean;
};
const ImageSlider = ({ images, removeImage, editMode = false }: props) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const previousImage = () => {
    setCurrentIndex((prevIndex: number) => (prevIndex - 1 < 0 ? images.length - 1 : prevIndex - 1));
  };

  const nextImage = () => {
    setCurrentIndex(prevIndex => (prevIndex + 1 >= images.length ? 0 : prevIndex + 1));
  };

  const removeImageHandler = () => {
    removeImage(currentIndex);
    previousImage();
  };

  if (images.length === 0) return <></>;

  return (
    <Box display="flex" flexDirection="column" alignItems="center" sx={{ mt: "10px" }}>
      <Box borderRadius="10px" padding="2px">
        <img className="responsive-img" src={images[currentIndex]} alt={`Image ${currentIndex}`} width={"100%"} />
      </Box>

      <Box sx={{ display: "flex", alignItems: "center" }}>
        {images.length > 1 && (
          <Box sx={{ display: "flex" }}>
            <IconButton onClick={previousImage}>
              <ChevronLeft />
            </IconButton>
            <IconButton onClick={nextImage}>
              <ChevronRight />
            </IconButton>
          </Box>
        )}
        {editMode && (
          <Tooltip title={`Remove Image`}>
            <IconButton onClick={removeImageHandler}>
              <DeleteForeverIcon sx={{ color: "gray" }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Box>
  );
};

export default ImageSlider;
