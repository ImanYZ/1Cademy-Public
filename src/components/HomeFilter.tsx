import { Box } from "@mui/material";
import { SxProps, Theme } from "@mui/system";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

import { useTagsTreeView } from "../hooks/useTagsTreeView";
import { FilterValue } from "../knowledgeTypes";
import ContributorsAutocomplete from "./ContributorsAutocomplete";
import InstitutionsAutocomplete from "./InstitutionsAutocomplete";
import NodeTypesAutocomplete from "./NodeTypesAutocomplete";
import { ReferencesAutocomplete } from "./ReferencesAutocomplete";
import { ChosenTag, MemoizedTagsSearcher } from "./TagsSearcher";

export type HomeFilterRef = {
  scroll: () => void;
};

type HomeFilterProps = {
  sx?: SxProps<Theme>;
  onTagsChange: (newValues: string[]) => void;
  onInstitutionsChange: (newValues: FilterValue[]) => void;
  onContributorsChange: (newValues: FilterValue[]) => void;
  onNodeTypesChange: (newValues: string[]) => void;
  onReferencesChange: (title: string, label: string) => void;
};

const HomeFilter = forwardRef<HomeFilterRef, HomeFilterProps>(
  ({ onTagsChange, onInstitutionsChange, onContributorsChange, onNodeTypesChange, onReferencesChange }, ref) => {
    const { allTags, setAllTags } = useTagsTreeView([]);
    const toScrollRef = useRef<HTMLDivElement | null>(null);

    const [chosenTags, setChosenTags] = useState<ChosenTag[]>([]);

    // useEffect(() => {
    //   const getTagsChecked = () => {
    //     const tagSelected = Object.values(allTags)
    //       .filter(cur => cur.checked)
    //       .map(cur => cur.title);
    //     if (!tagSelected) return;
    //     onTagsChange(tagSelected);
    //   };

    //   getTagsChecked();

    //   // Don't add onTagsChange because get in a infinity loop
    //   // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [allTags]);

    useEffect(() => {
      const tagSelected = chosenTags.map(cur => cur.title);
      onTagsChange(tagSelected);
      //   // Don't add onTagsChange because get in a infinity loop
      //   // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chosenTags]);

    useImperativeHandle(ref, () => ({
      scroll: () => {
        const clientPosition = toScrollRef.current?.getBoundingClientRect();
        const yPosition = clientPosition ? clientPosition.y + clientPosition.height - 40 : 500;
        setTimeout(() => window.scrollBy({ top: yPosition, behavior: "smooth" }), 150);
      },
    }));

    const handleInstitutionsChange = (values: FilterValue[]) => {
      onInstitutionsChange(values);
    };

    const handleContributorsChange = (values: FilterValue[]) => {
      onContributorsChange(values);
    };

    const handleNodeTypesChange = (values: string[]) => {
      onNodeTypesChange(values);
    };

    const handleReferencesChange = (title: string, label: string) => {
      onReferencesChange(title, label);
    };

    return (
      <>
        <Box ref={toScrollRef} display="flex" flexDirection={{ xs: "column", sm: "row" }} mb={"16px"} gap="16px">
          <Box width={{ xs: "100%" }}>
            <MemoizedTagsSearcher
              allTags={allTags}
              setAllTags={setAllTags}
              chosenTags={chosenTags}
              setChosenTags={setChosenTags}
              sx={{ maxHeight: "200px", height: "200px" }}
              multiple
            />
          </Box>
          <Box
            width={{ xs: "100%" }}
            display="grid"
            gridColumn={{ xs: "span 12", sm: "span 6" }}
            gridTemplateColumns="repeat(12, 1fr)"
            gap={2}
            sx={{ mx: { md: "10px" } }}
          >
            <Box gridColumn={{ xs: "span 12" }}>
              <NodeTypesAutocomplete onNodesTypeChange={handleNodeTypesChange} />
            </Box>
            <Box gridColumn={{ xs: "span 12" }}>
              <ContributorsAutocomplete onContributorsChange={handleContributorsChange} />
            </Box>
            <Box gridColumn={{ xs: "span 12" }}>
              <InstitutionsAutocomplete onInstitutionsChange={handleInstitutionsChange} />
            </Box>
          </Box>
        </Box>
        <Box width={"100%"} mb="16px">
          <ReferencesAutocomplete onReferencesChange={handleReferencesChange} />
        </Box>
      </>
    );
  }
);

HomeFilter.displayName = "HomeFilter";

export default HomeFilter;
