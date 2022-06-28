import {
  Autocomplete,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField
} from "@mui/material";
import { Box } from "@mui/system";
import { useRouter } from "next/router";
import React, { SyntheticEvent, useEffect, useState } from "react";
import { useQuery } from "react-query";
import { useDebounce } from "use-debounce";

import { getReferencesAutocomplete } from "../lib/knowledgeApi";
import { getQueryParameter, isValidHttpUrl } from "../lib/utils";
import { FilterProcessedReferences } from "../src/knowledgeTypes";

type ReferencesAutocompleteProps = {
  onReferencesChange: (title: string, label: string) => void;
};

export const ReferencesAutocomplete = ({ onReferencesChange }: ReferencesAutocompleteProps) => {
  const router = useRouter();
  const [text, setText] = useState("");
  const [searchText] = useDebounce(text, 250);
  const { isLoading, data } = useQuery(["references", searchText], () => getReferencesAutocomplete(searchText));

  const [referenceSelected, setReferenceSelected] = useState<{ title: string; label: string }>({
    title: "",
    label: ""
  });

  const getReferenceData = (reference: string): FilterProcessedReferences | null => {
    if (!data || !data.results) return null;
    return data.results.find(cur => cur.title === reference) || null;
  };

  const getReferencesOptions = (): string[] => {
    if (!data || !data.results) return [];
    return data.results.map(cur => cur.title);
  };

  const getLabelsByReference = (reference: string): string[] => {
    const referenceFound = getReferenceData(reference);
    if (!referenceFound) return [];

    const labels = referenceFound.data.map(cur => cur.label).filter(cur => cur);
    return [referenceIsWeb(reference) ? "All Sections" : "All Pages", ...labels];
  };

  const referenceIsWeb = (reference: string): boolean => {
    const referenceFound = getReferenceData(reference);
    if (!referenceFound) return false;
    return isValidHttpUrl(referenceFound.data[0]?.label);
  };

  const handleInputChange = (event: React.SyntheticEvent<Element, Event>, query: string) => {
    const queryProcessed = query.trim();
    setText(queryProcessed);
  };

  const handleChange = (event: SyntheticEvent<Element, Event>, newTitle: string | null) => {
    setReferenceSelected({ title: newTitle || "", label: "" });
    onReferencesChange(newTitle || "", "");
  };

  const handleChangeLabel = (event: SelectChangeEvent) => {
    const newLabel = event.target.value;
    setReferenceSelected(referenceSelected => ({ ...referenceSelected, label: newLabel }));

    onReferencesChange(referenceSelected?.title || "", event.target.value);
  };

  useEffect(() => {
    const reference = getQueryParameter(router.query.reference) || "";
    const label = getQueryParameter(router.query.label) || "";

    const newReference = { title: reference, label };
    setReferenceSelected(newReference);
  }, [router.query.label, router.query.reference]);

  const referenceAdornment = () => (
    <InputAdornment position="start">
      <Box
        sx={{
          p: "7px 10px",
          fontSize: "14px",
          lineHeight: "17px",
          fontWeight: "400",
          color: "black",
          background: theme => theme.palette.grey[200],
          borderRadius: "20px"
        }}
      >
        Book/Paper
      </Box>
    </InputAdornment>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <Autocomplete
        options={getReferencesOptions()}
        value={referenceSelected.title || null}
        loading={isLoading}
        noOptionsText={"Search references"}
        onInputChange={handleInputChange}
        onChange={handleChange}
        renderInput={params => (
          <TextField
            {...params}
            variant="outlined"
            label="References"
            InputProps={{
              ...params.InputProps,
              startAdornment: referenceSelected.title ? (
                <>
                  {referenceAdornment()}
                  {params.InputProps.startAdornment}
                </>
              ) : undefined
            }}
          />
        )}
        sx={{ flexGrow: 1 }}
      />
      {referenceSelected.title && (
        <FormControl sx={{ width: { xs: "40%", md: "30%" } }}>
          <InputLabel id="demo-simple-select-label">
            {referenceIsWeb(referenceSelected.title) ? "Sections" : "Pages"}
          </InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={referenceSelected.label}
            label={referenceIsWeb(referenceSelected.title) ? "Sections" : "Pages"}
            onChange={handleChangeLabel}
            sx={{ background: theme => theme.palette.grey[200] }}
          >
            {getLabelsByReference(referenceSelected.title).map((label, idx) => (
              <MenuItem key={idx} value={label}>
                {label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
    </Box>
  );
};
