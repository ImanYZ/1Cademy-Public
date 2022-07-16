import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { TreeItem, TreeView } from "@mui/lab";
import {
  Autocomplete,
  AutocompleteChangeReason,
  Checkbox,
  FormControlLabel,
  FormGroup,
  TextField
} from "@mui/material";
import { Box } from "@mui/system";
import React, { useCallback } from "react";

// import { useTagsTreeView } from '../hooks/useTagsTreeView';

type Tag = {
  nodeId: string; //
  checked: boolean; //
  title: string; //
  children: string[]; //
  // tags: any[],
  // it has tagIds:string[]
  tagIds: string[];
};
type AllTags = { [string: string]: Tag };

type TagsExploratorySearcherProps = {
  allTags: AllTags;
  setAllTags: (newAllTags: any) => void;
  chosenTags?: string[];
};

export const TagsExploratorySearcher = ({ allTags, setAllTags, chosenTags = [] }: TagsExploratorySearcherProps) => {
  // useTagsTreeView()
  // const [allTags, setAllTags] = useRecoilState(allTagsState);

  // const allTags: AllTags = useMemo(() => {
  //   const tag1: Tag = {
  //     nodeId: 'tag1',//
  //     checked: false,
  //     title: 'title tag1',//
  //     children: ['tag3'],// obj
  //     tags: []
  //   }
  //   const tag2: Tag = {
  //     nodeId: 'tag2',
  //     checked: false,
  //     title: 'title tag2',
  //     children: [],
  //     tags: []
  //   }

  //   const tag3: Tag = {
  //     nodeId: 'tag3',
  //     checked: true,
  //     title: 'title tag3',
  //     children: [],
  //     tags: []
  //   }
  //   const newAllTags: AllTags = {
  //     tag1,
  //     tag2,
  //     tag3
  //   }

  //   return newAllTags
  // }, [])

  // const [onlyOneOrCommunityPicking, setOnlyOneOrCommunityPicking] = useState(false);

  /**
   * mark tags as checked by choosen tags
   */
  // useEffect(() => {
  //   setAllTags((oldAllTags) => {
  //     const newAllTags = { ...oldAllTags };
  //     for (let chosenTag of props.chosenTags) {
  //       newAllTags[chosenTag] = { ...newAllTags[chosenTag], checked: true };
  //     }
  //     return newAllTags;
  //   });
  // }, []);

  /**
   *
   */
  // useEffect(() => {
  //   setOnlyOneOrCommunityPicking(props.onlyOne || props.communityMembership);
  // }, [props.onlyOne, props.communityMembership]);

  // const setAutocompleteOptions = useCallback(
  //   (tag: any, { selected }: { selected: boolean }) => (
  //     <FormControlLabel
  //       value={tag.nodeId}
  //       control={<Checkbox checked={selected} name={tag.nodeId} />}
  //       label={tag.title}
  //     />
  //   ),
  //   []
  // );

  const setAutocompleteOptions = useCallback((props: any, option: any, { selected }: any) => {
    return (
      <li {...props} key={option.nodeId}>
        {/* <FormControlLabel
            // value={option.nodeId}
            control={<Checkbox checked={selected} name={option.nodeId} />}
            label={option.title}
            sx={{ px: '10px' }}
          /> */}
        <Checkbox checked={selected} name={option.nodeId} />
        {option.title}
      </li>
    );
  }, []);

  const setAutocompleteInput = useCallback(
    (params: any) => (
      // <ValidatedInput label="Search for Tags" identification="autocompleteTags" {...params} />
      // <Input {...params} />
      <TextField label="Search for Tags" {...params} />
    ),
    []
  );

  // /**
  //  * if select:
  //  * - select-option: mark as checked
  //  * - remove-option: remove checked
  //  * - clear: remove all check
  //  */
  // const setAutocomplete = useCallback(
  //   // (_: any, value: any[], reason: string) => {
  //   (
  //     event: React.SyntheticEvent<Element, Event>,
  //     value: Tag[],
  //     reason: AutocompleteChangeReason,
  //     details?: AutocompleteChangeDetails<Tag> | undefined
  //   ) => {
  //     console.log('[setAutocomplete]:', event, value, reason, details)
  //     let targetTag = "";
  //     if (reason === "select-option") {
  //       if (chosenTags.length === 0 && !onlyOneOrCommunityPicking) {
  //         props.setOnlyTags(true);
  //       }
  //       targetTag = value.filter((tag) => !chosenTags.includes(tag.nodeId))[0]["nodeId"];
  //       setAllTags((oldAllTags) => {
  //         const newAllTags = {
  //           ...oldAllTags,
  //           [targetTag]: { ...oldAllTags[targetTag], checked: true },
  //         };
  //         if (onlyOneOrCommunityPicking) {
  //           for (let aTag in newAllTags) {
  //             if (aTag !== targetTag && newAllTags[aTag].checked) {
  //               newAllTags[aTag] = { ...newAllTags[aTag], checked: false };
  //             }
  //           }
  //         }
  //         return newAllTags;
  //       });
  //       if (onlyOneOrCommunityPicking) {
  //         props.setChosenTags([targetTag]);
  //       } else {
  //         props.setChosenTags(value.map((tag) => tag.nodeId));
  //       }
  //     } /*else if (reason === "remove-option") {
  //       if (props.chosenTags.length === 1 && !onlyOneOrCommunityPicking) {
  //         props.setOnlyTags(false);
  //       }
  //       targetTag = props.chosenTags.filter(
  //         (nodeId) => !value.map((tag) => tag.nodeId).includes(nodeId)
  //       )[0];
  //       setAllTags((oldAllTags) => {
  //         return { ...oldAllTags, [targetTag]: { ...oldAllTags[targetTag], checked: false } };
  //       });
  //       if (onlyOneOrCommunityPicking) {
  //         props.setChosenTags([]);
  //       } else {
  //         props.setChosenTags(value.map((tag) => tag.nodeId));
  //       }
  //     } else if (reason === "clear") {
  //       setAllTags((oldAllTags) => {
  //         const clearedTags = { ...oldAllTags };
  //         for (let tNodeId in clearedTags) {
  //           clearedTags[tNodeId] = { ...clearedTags[tNodeId], checked: false };
  //         }
  //         return clearedTags;
  //       });
  //       props.setChosenTags([]);
  //       if (!onlyOneOrCommunityPicking) {
  //         props.setOnlyTags(false);
  //       }
  //     }*/
  //   },
  //   // [onlyOneOrCommunityPicking, props.chosenTags, props.setChosenTags, props.setOnlyTags]
  //   []
  // );

  /**
   * if select:
   * - select-option: mark as checked
   * - remove-option: remove checked
   * - clear: remove all check
   */
  const setAutocomplete = useCallback(
    // (_: any, value: any[], reason: string) => {
    (
      event: React.SyntheticEvent<Element, Event>,
      value: Tag[],
      reason: AutocompleteChangeReason,
      details?: AutocompleteChangeDetails<Tag> | undefined
    ) => {
      console.log("[setAutocomplete]:", event, value, reason, details);
      let targetTag = "";
      if (reason === "selectOption") {
        // if (chosenTags.length === 0 && !onlyOneOrCommunityPicking) {
        //   props.setOnlyTags(true);
        // }
        targetTag = value.filter(tag => !chosenTags.includes(tag.nodeId))[0]["nodeId"];
        setAllTags((oldAllTags: any) => {
          const newAllTags = {
            ...oldAllTags,
            [targetTag]: { ...oldAllTags[targetTag], checked: true }
          };
          // if (onlyOneOrCommunityPicking) {
          //   for (let aTag in newAllTags) {
          //     if (aTag !== targetTag && newAllTags[aTag].checked) {
          //       newAllTags[aTag] = { ...newAllTags[aTag], checked: false };
          //     }
          //   }
          // }
          return newAllTags;
        });
        // if (onlyOneOrCommunityPicking) {
        //   props.setChosenTags([targetTag]);
        // } else {
        //   props.setChosenTags(value.map((tag) => tag.nodeId));
        // }
      } /*else if (reason === "remove-option") {
        if (props.chosenTags.length === 1 && !onlyOneOrCommunityPicking) {
          props.setOnlyTags(false);
        }
        targetTag = props.chosenTags.filter(
          (nodeId) => !value.map((tag) => tag.nodeId).includes(nodeId)
        )[0];
        setAllTags((oldAllTags) => {
          return { ...oldAllTags, [targetTag]: { ...oldAllTags[targetTag], checked: false } };
        });
        if (onlyOneOrCommunityPicking) {
          props.setChosenTags([]);
        } else {
          props.setChosenTags(value.map((tag) => tag.nodeId));
        }
      } else if (reason === "clear") {
        setAllTags((oldAllTags) => {
          const clearedTags = { ...oldAllTags };
          for (let tNodeId in clearedTags) {
            clearedTags[tNodeId] = { ...clearedTags[tNodeId], checked: false };
          }
          return clearedTags;
        });
        props.setChosenTags([]);
        if (!onlyOneOrCommunityPicking) {
          props.setOnlyTags(false);
        }
      }*/
    },
    // [onlyOneOrCommunityPicking, props.chosenTags, props.setChosenTags, props.setOnlyTags]
    []
  );

  const tagsTreeView = useCallback(
    (tag: Tag) => {
      // console.log('tag', tag)
      //   {
      //     "title": "Neurodegenerative Diseases",
      //     "checked": false,
      //     "nodeId": "S5ScstjhpnwKSxhfpI0b",
      //     "tagIds": [
      //         "gppQDE0BkpFQDyLNCCsH",
      //         "cL4SEN5ksxmKkgT0jQrF"
      //     ],
      //     "children": []
      // }
      return (
        <TreeItem
          key={"TagId" + tag.nodeId}
          nodeId={"TagId" + tag.nodeId}
          label={
            <FormControlLabel
              value={tag.nodeId}
              control={
                <Checkbox checked={tag.checked} onChange={() => console.log("setCheckboxes")} name={tag.nodeId} />
              }
              label={tag.title}
            />
          }
        >
          {tag.children ? tag.children.map(nodeId => tagsTreeView(allTags[nodeId])) : null}
        </TreeItem>
      );
    },
    [allTags]
  );

  return (
    <Box id="FilterTagsSelector" className="input-field col s12 Tooltip" sx={{ overflowY: "auto", maxHeight: "800px" }}>
      <Autocomplete
        multiple
        disableCloseOnSelect
        id="autocompleteTagSearch"
        value={Object.values(allTags).filter((tag: any) => tag.checked)}
        // onChange={setAutocomplete}
        onChange={setAutocomplete}
        ChipProps={{ className: "chip", variant: "outlined" }}
        ListboxProps={{ id: "autocompleteList" }}
        options={Object.values(allTags)}
        getOptionLabel={(tag: any) => tag.title}
        renderOption={setAutocompleteOptions}
        renderTags={() => ""}
        renderInput={setAutocompleteInput}
      />
      <div id="FilterTagsTreeView">
        <FormGroup
        // value={props.chosenTags}
        // onChange={props.setChosenTagsClick}
        // multiple
        >
          <TreeView
            id="TreeViewRoot"
            defaultCollapseIcon={<ExpandMoreIcon />}
            defaultExpandIcon={<ChevronRightIcon />}
            multiSelect
          >
            {Object.keys(allTags).map((nodeId: string) => {
              return allTags[nodeId].tagIds.length === 0 && tagsTreeView(allTags[nodeId]);
            })}
          </TreeView>
        </FormGroup>
      </div>
      {/* {props.communityMembership && (
        <div id="ChosenCommunity">
          You're going to be a member of:{" "}
          <span id="ChosenCommunityName">{props.communityMembership}</span>
        </div>
      )} */}
    </Box>
  );
};
