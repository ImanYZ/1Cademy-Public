import CheckIcon from "@mui/icons-material/Check";
import {
  Box,
  ClickAwayListener,
  Divider,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  addDoc,
  collection,
  collectionGroup,
  doc,
  getDocs,
  getFirestore,
  query,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import NextImage from "next/image";
import React, { Dispatch, SetStateAction, useCallback, useState } from "react";

import { UserDocument } from "../../../../knowledgeTypes";
import { Delete } from "../../../../lib/mapApi";
import { NO_USER_IMAGE } from "../../../../lib/utils/constants";
import { Notebook, NotebookDocument } from "../../../../types";

const db = getFirestore();

type NotebookMenuProps = {
  editableNotebook: Notebook;
  setEditableNotebook: Dispatch<SetStateAction<Notebook | null>>;
  openUserInfo: () => void;
  user: UserDocument;
  notebooks: Notebook[];
  setIsCreatingNotebook: (newValue: boolean) => void;
  openNodesOnNotebook: (notebook: Notebook, nodeIds: string[]) => Promise<void>;
  setNotebooks: Dispatch<SetStateAction<Notebook[]>>;
  onChangeNotebook: (newNotebook: Notebook) => void;
};

export const NotebookMenu = ({
  editableNotebook,
  setEditableNotebook,
  openUserInfo,
  user,
  notebooks,
  setIsCreatingNotebook,
  openNodesOnNotebook,
  setNotebooks,
  onChangeNotebook,
}: NotebookMenuProps) => {
  const [notebookTitleIsEditable, setNotebookTitleEditable] = useState(false);

  const onUpdateNotebookTitle = useCallback(async () => {
    try {
      if (!editableNotebook) return;
      const notebookRef = doc(db, "notebooks", editableNotebook.id);
      await updateDoc(notebookRef, { title: editableNotebook.title });
      setEditableNotebook(null);
      setNotebookTitleEditable(false);
    } catch (err) {}
  }, [editableNotebook, setEditableNotebook]);

  const onDuplicateNotebook = useCallback(async () => {
    try {
      if (!editableNotebook) return;
      setIsCreatingNotebook(true);

      const sameDuplications = notebooks.filter(cur => cur.duplicatedFrom === editableNotebook.id);
      const copyNotebook: NotebookDocument = {
        owner: editableNotebook.owner,
        ownerImgUrl: editableNotebook.ownerImgUrl ?? NO_USER_IMAGE,
        ownerChooseUname: Boolean(user.chooseUname),
        ownerFullName: user.fName ?? "",
        title: `${editableNotebook.title} (${sameDuplications.length + 2})`,
        duplicatedFrom: editableNotebook.id,
        isPublic: editableNotebook.isPublic,
        users: [user.uname],
        usersInfo: {
          [user.uname]: {
            chooseUname: Boolean(user.chooseUname),
            fullname: user.fName ?? "",
            imageUrl: user.imageUrl ?? NO_USER_IMAGE,
            role: "owner",
          },
        },
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date()),
        defaultTagId: user.tagId ?? "",
        defaultTagName: user.tag ?? "",
        type: editableNotebook.type ?? "default",
      };
      const notebooksRef = collection(db, "notebooks");
      const docRef = await addDoc(notebooksRef, copyNotebook);
      setEditableNotebook({ ...copyNotebook, id: docRef.id });
      // onChangeNotebook(docRef.id);
      const q = query(
        collectionGroup(db, "userNodes"),
        where("user", "==", editableNotebook.owner),
        where("notebooks", "array-contains", editableNotebook.id),
        where("deleted", "==", false)
      );
      const userNodesDocs = await getDocs(q);
      const nodeIds: string[] = [];
      userNodesDocs.forEach(doc => nodeIds.push(doc.data().node));
      // console.log({ nodeIds });
      const newNotebook: Notebook = { ...copyNotebook, id: docRef.id };
      await openNodesOnNotebook(newNotebook, nodeIds);
      // if (titleInputRef.current) titleInputRef.current.focus();
    } catch (error) {
      console.error("Cant duplicate a notebook", error);
    } finally {
      setIsCreatingNotebook(false);
    }
  }, [
    editableNotebook,
    notebooks,
    openNodesOnNotebook,
    setEditableNotebook,
    setIsCreatingNotebook,
    user.chooseUname,
    user.fName,
    user.imageUrl,
    user.tag,
    user.tagId,
    user.uname,
  ]);

  const onCopyNotebookUrl = useCallback(() => {
    if (!editableNotebook) return;
    const url = `${window.location.origin}/notebooks/${encodeURIComponent(editableNotebook.title)}/${
      editableNotebook.id
    }`;
    navigator.clipboard.writeText(url);
    setEditableNotebook(null);
    setNotebookTitleEditable(false);
  }, [editableNotebook, setEditableNotebook]);

  const onDeleteNotebook = useCallback(async () => {
    try {
      if (!editableNotebook) return;

      if (!window.confirm("Are you sure to delete notebook")) return;
      setNotebooks(prevNotebooks => {
        const newNotebooks = prevNotebooks.filter(cur => cur.id !== editableNotebook.id);
        onChangeNotebook(newNotebooks[0] ?? null);
        return newNotebooks;
      });
      setEditableNotebook(null);
      setNotebookTitleEditable(false);
      await Delete("/notebooks/delete", { notebookId: editableNotebook.id });
      // onChangeNotebook("");
      console.log("deleted complete");
    } catch (error) {
      console.error("Cant remove notebook", error);
    } finally {
      setIsCreatingNotebook(false);
    }
  }, [editableNotebook, onChangeNotebook, setEditableNotebook, setIsCreatingNotebook, setNotebooks]);

  const onOpenUserInfo = () => {
    openUserInfo();
    setNotebookTitleEditable(false);
  };

  return (
    <ClickAwayListener onClickAway={onUpdateNotebookTitle}>
      <Box
        sx={{
          width: "263px",
          position: "absolute",
          top: "50%",
          transform: "translateY(-50%)",
          left: "255px",
          zIndex: 10000,
          backgroundColor: theme =>
            theme.palette.mode === "dark" ? theme.palette.common.notebookMainBlack : theme.palette.common.gray50,
        }}
      >
        <Stack direction={"row"} alignItems="center" justifyContent={"space-between"} sx={{ p: "14px 12px" }}>
          {notebookTitleIsEditable ? (
            <TextField
              // ref={titleInputRef}
              id="notebook-title"
              label=""
              variant="outlined"
              onKeyDown={e => {
                if (e.code === "Enter" || e.keyCode === 13) {
                  onUpdateNotebookTitle();
                  e.stopPropagation();
                }
              }}
              value={editableNotebook.title}
              onChange={e => setEditableNotebook(prev => (prev ? { ...prev, title: e.target.value } : null))}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => onUpdateNotebookTitle()} sx={{ p: "4px" }}>
                      <CheckIcon />
                    </IconButton>
                  </InputAdornment>
                ),
                sx: { p: "10px 14px", fontSize: "12px" },
              }}
              inputProps={{ sx: {} }}
              sx={{
                "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: theme =>
                    theme.palette.mode === "dark" ? theme.palette.common.primary600 : theme.palette.common.primary600,
                  boxShadow: theme =>
                    theme.palette.mode === "dark"
                      ? "0px 1px 2px rgba(16, 24, 40, 0.05), 0px 0px 0px 4px #62544B"
                      : "0px 1px 2px rgba(16, 24, 40, 0.05), 0px 0px 0px 4px #ECCFBD",
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderWidth: "0px",
                },
              }}
              multiline
              fullWidth
            />
          ) : (
            <Typography sx={{ fontSize: "14px" }}>{editableNotebook.title}</Typography>
          )}
          <Box
            onClick={onOpenUserInfo}
            sx={{
              ml: "20px",
              minWidth: "36px",
              width: "36px",
              height: "36px",
              position: "relative",
              borderRadius: "30px",
              cursor: "pointer",
              // border: "solid 2px",
            }}
          >
            <NextImage
              src={editableNotebook.ownerImgUrl ?? NO_USER_IMAGE}
              alt={"owner image"}
              width="36px"
              height="36px"
              quality={40}
              objectFit="cover"
              style={{ borderRadius: "30px" }}
            />
          </Box>
        </Stack>
        <Divider />
        <List sx={{ p: "0px", "& .MuiTypography-body1": { fontSize: "12px" } }}>
          {/* TODO: remove type undefined on validation, Ameer will update with default */}
          {(!editableNotebook.type || editableNotebook.type === "default") && (
            <ListItem disablePadding>
              <ListItemButton onClick={() => setNotebookTitleEditable(true)} sx={{ p: "12px 14px" }}>
                <ListItemText primary="Rename" />
              </ListItemButton>
            </ListItem>
          )}
          <ListItem disablePadding>
            <ListItemButton onClick={onDuplicateNotebook} sx={{ p: "12px 14px" }}>
              <ListItemText primary="Duplicate" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={onCopyNotebookUrl} sx={{ p: "12px 14px" }}>
              <ListItemText primary="Copy link to page" />
            </ListItemButton>
          </ListItem>
          {editableNotebook.owner === user.uname && editableNotebook.type !== "course" && notebooks.length > 1 && (
            <ListItem disablePadding>
              <ListItemButton onClick={onDeleteNotebook} sx={{ p: "12px 14px" }}>
                <ListItemText primary="Delete" />
              </ListItemButton>
            </ListItem>
          )}
        </List>
      </Box>
    </ClickAwayListener>
  );
};
