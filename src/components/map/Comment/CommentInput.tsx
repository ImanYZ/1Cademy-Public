import CloseIcon from "@mui/icons-material/Close";
import CollectionsIcon from "@mui/icons-material/Collections";
import MicIcon from "@mui/icons-material/Mic";
import SettingsVoiceIcon from "@mui/icons-material/SettingsVoice";
import { Box, Button, IconButton, SxProps, Theme, Tooltip, useTheme } from "@mui/material";
import React from "react";
import { Mention, MentionsInput } from "react-mentions";

import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";

import { MentionUser } from "./MentionUser";

type CommentInputProps = {
  fileInputRef: any;
  isUploading: any;
  percentageUploaded: any;
  uploadImageClicked: any;
  onUploadImage: any;
  type: string;
  value: string;
  message?: any;
  setAction: any;
  onSubmit: any;
  onClose?: any;
  isLoading: boolean;
  isEditing?: boolean;
  imageUrls?: string[];
  setImageUrls?: any;
  sx?: SxProps<Theme>;
  isAuthenticated: boolean;
  startListening: any;
  stopListening: any;
  isRecording: boolean;
  recordingType: string | null;
  users: any;
};
const CommentInput = ({
  fileInputRef,
  isUploading,
  percentageUploaded,
  uploadImageClicked,
  onUploadImage,
  type,
  value,
  setAction,
  onSubmit,
  onClose,
  isLoading,
  isEditing,
  imageUrls,
  setImageUrls,
  sx,
  isAuthenticated,
  startListening,
  stopListening,
  isRecording,
  recordingType,
  users,
}: CommentInputProps) => {
  const theme = useTheme();
  if (!isAuthenticated) return <></>;
  return (
    <Box
      sx={{
        mt: "10px",
        border: theme =>
          `solid 1px ${
            theme.palette.mode === "light" ? DESIGN_SYSTEM_COLORS.gray300 : DESIGN_SYSTEM_COLORS.notebookG500
          }`,
        borderRadius: "10px",
        backgroundColor: theme =>
          theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG700 : DESIGN_SYSTEM_COLORS.gray100,
        ...sx,
      }}
    >
      <MentionsInput
        id="comment-mention"
        className="comment-input"
        placeholder="Type your comment here..."
        style={{
          control: {
            fontSize: 16,
            padding: "10px",
            boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.1)",
            border: "none",
            overFlow: "hidden",
          },
          input: {
            fontSize: 16,
            border: "none",
            outline: "none",
            width: "100%",
            color: theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.orange100 : DESIGN_SYSTEM_COLORS.notebookG900,
            padding: "15px",
            overFlow: "auto",
            fontFamily: "system-ui",
          },
          suggestions: {
            list: {
              background:
                theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG700 : DESIGN_SYSTEM_COLORS.gray100,

              padding: "2px",
              fontSize: 16,
              position: "absolute",
              top: "-120px",
              left: "-16px",
              maxHeight: "150px",
              overflowY: "auto",
            },
          },
        }}
        value={value}
        singleLine={false}
        onChange={e => setAction(e.target.value)}
        onKeyDown={e => {
          if (e.key === "Enter" && e.shiftKey) {
            e.preventDefault();
            setAction(value + "\n");
          } else if (e.key === "Enter" || e.keyCode === 13) {
            e.preventDefault();
            if (value) {
              onSubmit();
            }
          }
        }}
      >
        <Mention
          trigger="@"
          data={users}
          displayTransform={(id, display) => {
            return `@${display}`;
          }}
          renderSuggestion={(suggestion: any) => <MentionUser user={suggestion} />}
        />
      </MentionsInput>

      {/* <InputBase
          id="message-chat"
          multiline={true}
          value={value}
          onChange={(e) => setAction(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.shiftKey) {
              e.preventDefault()
              setAction(value + '\n')
            } else if (e.key === 'Enter' || e.keyCode === 13) {
              e.preventDefault()
              if (value) {
                onSubmit()
              }
            }
          }}
          fullWidth
          placeholder="Type your comment here..."
          autoComplete={'off'}
          sx={{
            p: '10px 14px',
            fontSize: '14px',
            backgroundColor:
              mode === 'dark'
                ? DESIGN_SYSTEM_COLORS.notebookG700
                : DESIGN_SYSTEM_COLORS.gray100,
            color:
              mode === 'dark'
                ? DESIGN_SYSTEM_COLORS.baseWhite
                : DESIGN_SYSTEM_COLORS.notebookMainBlack,
            '::placeholder': {
              color: DESIGN_SYSTEM_COLORS.gray500,
            },
            borderRadius: '15px',
          }}
          inputProps={{
            style: {
              maxHeight: '60px',
              overflow: 'auto',
            },
          }}
        /> */}
      <Box sx={{ display: "flex" }}>
        {(imageUrls || []).map(imageUrl => (
          <Box
            key={imageUrl}
            sx={{
              display: "flex",
              p: 1,
              position: "relative",
              "&:hover .close-icon": {
                opacity: 1,
              },
            }}
          >
            <Tooltip title={"Remove Image"} placement="top">
              <CloseIcon
                className="close-icon"
                sx={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  zIndex: 1,
                  cursor: "pointer",
                  borderRadius: "50%",
                  opacity: 0,
                  transition: "opacity 0.3s",
                  backgroundColor: "grey",
                  color: "white",
                  height: "20px",
                  width: "20px",
                }}
                onClick={() => setImageUrls((prev: string[]) => prev.filter(image => image !== imageUrl))}
              />
            </Tooltip>

            <img width={"90px"} height={"90px"} style={{ borderRadius: "8px" }} src={imageUrl} alt="" />
          </Box>
        ))}
      </Box>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            width: "100%",
            p: "0px 8px 8px 8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {isRecording && recordingType == type ? (
              <SettingsVoiceIcon
                sx={{
                  fontSize: "30px",
                  color: DESIGN_SYSTEM_COLORS.orange500,
                  border: null,
                  cursor: "pointer",
                }}
                onClick={stopListening}
              />
            ) : (
              <MicIcon
                sx={{
                  color: theme =>
                    theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.gray50 : DESIGN_SYSTEM_COLORS.gray500,
                  cursor: "pointer",
                }}
                onClick={() => startListening(type)}
              />
            )}

            <input type="file" ref={fileInputRef} onChange={(e: any) => onUploadImage(e, type)} hidden />

            {!isEditing && (
              <Box sx={{ display: "flex", alignItems: "center" }}>
                {isUploading ? (
                  <span
                    style={{
                      width: "37px",
                      fontSize: "11px",
                      textAlign: "center",
                    }}
                  >
                    {percentageUploaded + "%"}
                  </span>
                ) : (
                  <Tooltip title={"Upload Image"}>
                    <IconButton onClick={uploadImageClicked}>
                      <CollectionsIcon
                        sx={{
                          color: theme =>
                            theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG200 : undefined,
                        }}
                      />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            )}
          </Box>
          <Box sx={{ display: "flex", gap: "10px" }}>
            {onClose && (
              <Button
                onClick={() => {
                  onClose();
                }}
                variant="contained"
                color="error"
                disabled={isLoading || !value}
                sx={{
                  minWidth: "0px",
                  width: "36px",
                  height: "36px",
                  p: "10px",
                  borderRadius: "8px",
                }}
              >
                <CloseIcon sx={{ fontSize: "15px", color: "white" }} />
              </Button>
            )}
            <Button
              onClick={() => {
                onSubmit();
                setImageUrls([]);
                setAction("");
              }}
              variant="contained"
              disabled={isLoading || (!value && !imageUrls?.length)}
              sx={{
                minWidth: "0px",
                mr: "10px",
                width: "36px",
                height: "36px",
                p: "10px",
                borderRadius: "8px",
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                stroke={!value && !imageUrls?.length ? DESIGN_SYSTEM_COLORS.notebookG200 : "white"}
              >
                <path
                  d="M7.74976 10.2501L16.4998 1.50014M7.85608 10.5235L10.0462 16.1552C10.2391 16.6513 10.3356 16.8994 10.4746 16.9718C10.5951 17.0346 10.7386 17.0347 10.8592 16.972C10.9983 16.8998 11.095 16.6518 11.2886 16.1559L16.7805 2.08281C16.9552 1.63516 17.0426 1.41133 16.9948 1.26831C16.9533 1.1441 16.8558 1.04663 16.7316 1.00514C16.5886 0.957356 16.3647 1.0447 15.9171 1.21939L1.84398 6.71134C1.34808 6.90486 1.10013 7.00163 1.02788 7.14071C0.965237 7.26129 0.965322 7.40483 1.0281 7.52533C1.10052 7.66433 1.34859 7.7608 1.84471 7.95373L7.47638 10.1438C7.57708 10.183 7.62744 10.2026 7.66984 10.2328C7.70742 10.2596 7.74028 10.2925 7.76709 10.3301C7.79734 10.3725 7.81692 10.4228 7.85608 10.5235Z"
                  stroke="inherit"
                  strokeWidth="1.66667"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default CommentInput;
