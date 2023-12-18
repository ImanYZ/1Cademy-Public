import EmojiPicker from "emoji-picker-react";
import React from "react";

const EmojiPickerComponent = ({ ...rest }) => {
  return <EmojiPicker {...rest} />;
};

export default React.memo(EmojiPickerComponent);
