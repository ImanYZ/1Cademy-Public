import { Box } from "@mui/material";
import { SxProps, Theme } from "@mui/system";
import React, { forwardRef, useImperativeHandle, useRef } from "react";

import TagsAutocomplete from "../components/TagsAutocomplete";
import { FilterValue } from "../src/knowledgeTypes";
import ContributorsAutocomplete from "./ContributorsAutocomplete";
import InstitutionsAutocomplete from "./InstitutionsAutocomplete";
import NodeTypesAutocomplete from "./NodeTypesAutocomplete";
import { ReferencesAutocomplete } from "./ReferencesAutocomplete";

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
    const toScrollRef = useRef<HTMLDivElement | null>(null);

    useImperativeHandle(ref, () => ({
      scroll: () => {
        const clientPosition = toScrollRef.current?.getBoundingClientRect();
        const yPosition = clientPosition ? clientPosition.y + clientPosition.height - 40 : 500;
        setTimeout(() => window.scrollBy({ top: yPosition, behavior: "smooth" }), 150);
      }
    }));

    const handleTagsChange = (values: string[]) => {
      onTagsChange(values);
    };

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
      <Box
        ref={toScrollRef}
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gap={2}
        sx={{ mx: { md: "10px" }, mb: 8 }}
      >
        <Box gridColumn={{ xs: "span 12", sm: "span 6", lg: "span 3" }}>
          <TagsAutocomplete onTagsChange={handleTagsChange} />
        </Box>
        <Box gridColumn={{ xs: "span 12", sm: "span 6", lg: "span 3" }}>
          <NodeTypesAutocomplete onNodesTypeChange={handleNodeTypesChange} />
        </Box>
        <Box gridColumn={{ xs: "span 12", sm: "span 6", lg: "span 3" }}>
          <ContributorsAutocomplete onContributorsChange={handleContributorsChange} />
        </Box>
        <Box gridColumn={{ xs: "span 12", sm: "span 6", lg: "span 3" }}>
          <InstitutionsAutocomplete onInstitutionsChange={handleInstitutionsChange} />
        </Box>
        <Box gridColumn={{ xs: "span 12" }}>
          <ReferencesAutocomplete onReferencesChange={handleReferencesChange} />
        </Box>
      </Box>
    );
  }
);

HomeFilter.displayName = "HomeFilter";

export default HomeFilter;
