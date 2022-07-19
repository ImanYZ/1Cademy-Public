import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { TreeItem, TreeView } from "@mui/lab";
import {
  Autocomplete,
  AutocompleteChangeDetails,
  AutocompleteChangeReason,
  AutocompleteRenderOptionState,
  Checkbox,
  FormControlLabel,
  TextField
} from "@mui/material";
import { Box, SxProps, Theme } from "@mui/system";
import React, { useCallback } from "react";

export type TagTreeView = {
  nodeId: string;
  checked: boolean;
  title: string;
  children: string[];
  tags: string[];
  tagIds: string[];
};
export type AllTagsTreeView = { [string: string]: TagTreeView };

type TagsExploratorySearcherProps = {
  // chosenTags: string[];
  // setChosenTags: (newChosenTags: string[]) => void;
  allTags: AllTagsTreeView;
  setAllTags: React.Dispatch<React.SetStateAction<AllTagsTreeView>>;
  multiple?: boolean;
  sx?: SxProps<Theme>;
};

/**
 * Show a autocomplete and a tree view to search tags
 * it can be configurable to select one or multiple tags
 */
export const TagsExploratorySearcher = ({
  allTags,
  setAllTags,
  multiple = false,
  sx
}: TagsExploratorySearcherProps) => {
  const setAutocompleteInput = useCallback((params: any) => <TextField label="Search for Tags" {...params} />, []);

  const setAutocompleteOptions = useCallback(
    (props: React.HTMLAttributes<HTMLLIElement>, option: TagTreeView, { selected }: AutocompleteRenderOptionState) => {
      return (
        <li {...props} key={option.nodeId}>
          <Checkbox checked={selected} name={option.nodeId} key={`checkbox-${option.nodeId}`} />
          {option.title}
        </li>
      );
    },
    []
  );

  /**
   * change allTags in autocomplete
   * that use multiple variable to validate checked state
   *
   * - selectOption: mark as checked the selected option
   * - removeOption: remove checked from selected option
   * - clear: remove all checked
   */
  const setAutocomplete = useCallback(
    (
      event: React.SyntheticEvent<Element, Event>,
      value: TagTreeView[],
      reason: AutocompleteChangeReason,
      details?: AutocompleteChangeDetails<TagTreeView> | undefined
    ) => {
      if (reason === "selectOption") {
        const targetTag = details?.option.nodeId;
        if (!targetTag) return;

        setAllTags(oldAllTags => {
          const newAllTags: AllTagsTreeView = {
            ...oldAllTags,
            [targetTag]: { ...oldAllTags[targetTag], checked: true }
          };
          if (!multiple) {
            // if not multiple, set all checked to false except the targetTag
            for (let aTag in newAllTags) {
              if (aTag !== targetTag && newAllTags[aTag].checked) {
                newAllTags[aTag] = { ...newAllTags[aTag], checked: false };
              }
            }
          }
          // [TODO]: set newAllTags or the targetTag to chosenTags
          return newAllTags;
        });
      }

      if (reason === "removeOption") {
        const targetTag = details?.option.nodeId;
        if (!targetTag) return;

        setAllTags(oldAllTags => {
          return { ...oldAllTags, [targetTag]: { ...oldAllTags[targetTag], checked: false } };
        });
        // [TODO]: set newAllTags to chosenTags
      }

      if (reason === "clear") {
        setAllTags(oldAllTags => {
          const clearedTags = { ...oldAllTags };
          for (let tNodeId in clearedTags) {
            clearedTags[tNodeId] = { ...clearedTags[tNodeId], checked: false };
          }
          return clearedTags;
        });
        // [TODO]: set [] to chosenTags
      }
    },
    [multiple, setAllTags]
  );

  /**
   * set values of checked
   *
   */
  const setCheckboxes = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setAllTags(oldAllTags => {
        const newAllTags = {
          ...oldAllTags,
          [event.target.name]: { ...oldAllTags[event.target.name], checked: event.target.checked }
        };
        if (!multiple) {
          for (let aTag in newAllTags) {
            if (aTag !== event.target.name && newAllTags[aTag].checked) {
              newAllTags[aTag] = { ...newAllTags[aTag], checked: false };
            }
          }
        }
        return newAllTags;
      });
      // [TODO]: set [] to chosenTags
    },
    [multiple, setAllTags]
  );

  const tagsTreeView = useCallback(
    (tag: TagTreeView) => {
      return (
        <TreeItem
          key={"TagId" + tag.nodeId}
          nodeId={"TagId" + tag.nodeId}
          label={
            <FormControlLabel
              value={tag.nodeId}
              control={<Checkbox checked={tag.checked} onChange={setCheckboxes} name={tag.nodeId} />}
              label={tag.title}
            />
          }
        >
          {tag.children ? tag.children.map(nodeId => tagsTreeView(allTags[nodeId])) : null}
        </TreeItem>
      );
    },
    [allTags, setCheckboxes]
  );

  return (
    <>
      <Autocomplete
        multiple
        disableCloseOnSelect
        id="autocompleteTagSearch"
        value={Object.values(allTags).filter((tag: any) => tag.checked)}
        onChange={setAutocomplete}
        ChipProps={{ className: "chip", variant: "outlined" }}
        ListboxProps={{ id: "autocompleteList" }}
        options={Object.values(allTags)}
        getOptionLabel={(tag: TagTreeView) => tag.title}
        renderOption={setAutocompleteOptions}
        renderTags={() => ""}
        renderInput={setAutocompleteInput}
        fullWidth
      />
      <Box id="FilterTagsTreeView" sx={{ overflowY: "auto", ...sx }}>
        <TreeView
          id="TreeViewRoot"
          defaultCollapseIcon={<ExpandMoreIcon sx={{ color: theme => theme.palette.common.white }} />}
          defaultExpandIcon={<ChevronRightIcon sx={{ color: theme => theme.palette.common.white }} />}
          multiSelect
        >
          {Object.keys(allTags).map((nodeId: string) => {
            return allTags[nodeId].tags.length === 0 && tagsTreeView(allTags[nodeId]);
          })}
        </TreeView>
      </Box>
    </>
  );
};
