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
  TextField,
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

export type ChosenTag = { id: string; title: string };

export type AllTagsTreeView = { [string: string]: TagTreeView };

type TagsExploratorySearcherProps = {
  allTags: AllTagsTreeView;
  setAllTags: React.Dispatch<React.SetStateAction<AllTagsTreeView>>;
  chosenTags: ChosenTag[];
  setChosenTags: (newChosenTags: ChosenTag[]) => void;
  multiple?: boolean;
  sx?: SxProps<Theme>;
};

/**
 * Show a autocomplete and a tree view to search tags
 * it can be configurable to select one or multiple tags
 */
const TagsSearcher = ({
  allTags,
  setAllTags,
  chosenTags,
  setChosenTags,
  multiple = false,
  sx,
}: TagsExploratorySearcherProps) => {
  // const [chosenTags, setChosenTags] = useState<{ id: string; title: string }[]>([]);
  const setAutocompleteInput = useCallback((params: any) => <TextField label="Search for Tags" {...params} />, []);

  const setAutocompleteOptions = useCallback(
    (props: React.HTMLAttributes<HTMLLIElement>, option: TagTreeView, { selected }: AutocompleteRenderOptionState) => {
      return (
        <li {...props} key={option.nodeId}>
          <FormControlLabel control={<Checkbox checked={selected} name={option.nodeId} />} label={option.title} />
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
        const targetTag = details?.option;
        if (!targetTag) return;

        setAllTags(oldAllTags => {
          const newAllTags: AllTagsTreeView = {
            ...oldAllTags,
            [targetTag.nodeId]: { ...oldAllTags[targetTag.nodeId], checked: true },
          };
          if (!multiple) {
            // if not multiple, set all checked to false except the targetTag
            for (let aTag in newAllTags) {
              if (aTag !== targetTag.nodeId && newAllTags[aTag].checked) {
                newAllTags[aTag] = { ...newAllTags[aTag], checked: false };
              }
            }
          }
          // [TODO]: set newAllTags or the targetTag to chosenTags
          if (multiple) {
            setChosenTags(value.map(cur => ({ id: cur.nodeId, title: cur.title })));
          } else {
            setChosenTags([{ id: targetTag.nodeId, title: targetTag.title }]);
          }
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
        if (multiple) {
          setChosenTags(value.map(cur => ({ id: cur.nodeId, title: cur.title })));
        } else {
          setChosenTags([]);
        }
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
        setChosenTags([]);
      }
    },
    [multiple, setAllTags, setChosenTags]
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
          [event.target.name]: { ...oldAllTags[event.target.name], checked: event.target.checked },
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

      const tagId = event.target.name;
      const tagTitle = allTags[tagId].title;
      // [TODO]: set [] to chosenTags
      if (event.target.checked) {
        if (multiple) {
          setChosenTags([...chosenTags, { id: tagId, title: tagTitle }]);
        } else {
          setChosenTags([{ id: tagId, title: tagTitle }]);
        }
      } else {
        if (multiple) {
          setChosenTags(chosenTags.filter(({ id }) => id != tagId));
        } else {
          setChosenTags([]);
        }
      }

      // if (event.target.checked) {
      //   if (props.chosenTags.length === 0 && !onlyOneOrCommunityPicking) {
      //     props.setOnlyTags(true);
      //   }
      //   if (onlyOneOrCommunityPicking) {
      //     props.setChosenTags([event.target.name]);
      //   } else {
      //     props.setChosenTags([...props.chosenTags, event.target.name]);
      //   }
      // } else {
      //   if (props.chosenTags.length === 1 && !onlyOneOrCommunityPicking) {
      //     props.setOnlyTags(false);
      //   }
      //   if (onlyOneOrCommunityPicking) {
      //     props.setChosenTags([]);
      //   } else {
      //     props.setChosenTags(props.chosenTags.filter(nodeId => nodeId != event.target.name));
      //   }
      // }
    },
    [allTags, chosenTags, multiple, setAllTags, setChosenTags]
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
          sx={{
            color: theme => (theme.palette.mode === "light" ? theme.palette.common.black : theme.palette.common.white),
          }}
        >
          {tag.children ? tag.children.map(nodeId => tagsTreeView(allTags[nodeId])) : null}
        </TreeItem>
      );
    },
    [allTags, setCheckboxes]
  );

  return (
    <Box data-testid="tree-view">
      <Autocomplete
        multiple
        disableCloseOnSelect
        id="autocompleteTagSearch"
        value={Object.values(allTags).filter((tag: any) => tag.checked)}
        onChange={setAutocomplete}
        ChipProps={{ className: "chip", variant: "outlined" }}
        ListboxProps={{ id: "autocompleteList", className: "modelInSearchTags" }}
        options={Object.values(allTags)}
        getOptionLabel={(tag: TagTreeView) => tag.title}
        renderOption={setAutocompleteOptions}
        renderTags={() => ""}
        renderInput={setAutocompleteInput}
        fullWidth
        sx={{ marginTop: "5px", marginBottom: "5px" }}
      />
      <Box id="FilterTagsTreeView">
        <TreeView
          id="TreeViewRoot"
          defaultCollapseIcon={<ExpandMoreIcon />}
          defaultExpandIcon={<ChevronRightIcon />}
          multiSelect
          sx={{
            overflowY: "auto",
            borderColor: theme =>
              theme.palette.mode === "light" ? "rgba(0, 0, 0, 0.23)" : "rgba(255, 255, 255, 0.23)",
            borderWidth: "1px",
            borderStyle: "solid",
            borderRadius: theme => `${theme.shape.borderRadius}px`,
            borderTopWidth: "0px",
            ...sx,
          }}
        >
          {Object.keys(allTags).map((nodeId: string) => {
            return allTags[nodeId].tags.length === 0 && tagsTreeView(allTags[nodeId]);
          })}
        </TreeView>
      </Box>
    </Box>
  );
};

const TagExploratorySearcherPropsAreEqual = (
  prevProps: TagsExploratorySearcherProps,
  nextProps: TagsExploratorySearcherProps
) => {
  return prevProps.allTags === nextProps.allTags && prevProps.chosenTags === nextProps.chosenTags;
};

export const MemoizedTagsSearcher = React.memo(TagsSearcher, TagExploratorySearcherPropsAreEqual);
