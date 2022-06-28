import CloseIcon from "@mui/icons-material/Close";
import Autocomplete from "@mui/material/Autocomplete";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import { useRouter } from "next/router";
import { FC, useEffect, useState } from "react";
import { useQuery } from "react-query";
import { useDebounce } from "use-debounce";

import { getInstitutionsAutocomplete, getSelectedInstitutions } from "../lib/knowledgeApi";
import { getQueryParameter } from "../lib/utils";
import { FilterValue } from "../src/knowledgeTypes";
import OptimizedAvatar from "./OptimizedAvatar";

type Props = {
  onInstitutionsChange: (newValues: FilterValue[]) => void;
};

const InstitutionsAutocomplete: FC<Props> = ({ onInstitutionsChange }) => {
  const router = useRouter();
  const [hasBeenCleared, setHasBeenCleared] = useState(false);
  const [value, setValue] = useState<FilterValue[]>([]);
  const [text, setText] = useState("");
  const [searchText] = useDebounce(text, 250);
  const { isLoading, data } = useQuery(["institutions", searchText], () => getInstitutionsAutocomplete(searchText));

  const handleQueryChange = (event: React.SyntheticEvent<Element, Event>, query: string) => {
    if (event && query.trim().length > 0) {
      setText(query);
    }
  };

  const handleChange = (_: React.SyntheticEvent, newValue: FilterValue[]) => {
    if (newValue.length === 0) {
      setHasBeenCleared(true);
    }
    setValue(newValue);
    onInstitutionsChange(newValue);
  };

  useEffect(() => {
    const parameterInstitutions = getQueryParameter(router.query.institutions) || "";
    const fetchSelectedInstitutions = async () => {
      try {
        const response = await getSelectedInstitutions(parameterInstitutions);
        setValue(response);
      } catch {
        setValue([]);
      }
    };
    const institutions = parameterInstitutions.split(",").filter(el => el !== "");

    if (value.length === 0 && institutions.length > 0 && !hasBeenCleared) {
      fetchSelectedInstitutions();
    }
  }, [hasBeenCleared, router.query.institutions, value.length]);

  return (
    <Autocomplete
      multiple
      options={data?.results || []}
      value={value}
      loading={isLoading}
      onInputChange={handleQueryChange}
      noOptionsText={"Search institutions"}
      isOptionEqualToValue={(option, value) => {
        return option.id === value.id;
      }}
      renderOption={(props, option) => {
        const newProps = { ...props, key: option.id };
        return (
          <li {...newProps}>
            {option.imageUrl ? (
              <OptimizedAvatar name={option.name} imageUrl={option.imageUrl} contained renderAsAvatar={false} />
            ) : undefined}
            {option.name}
          </li>
        );
      }}
      getOptionLabel={option => option.name}
      onChange={handleChange}
      renderTags={(value: readonly FilterValue[], getTagProps) =>
        value.map((option, index: number) => (
          <Chip
            avatar={
              option.imageUrl ? (
                <OptimizedAvatar name={option.name} imageUrl={option.imageUrl} contained renderAsAvatar={false} />
              ) : undefined
            }
            variant="outlined"
            label={option.name}
            deleteIcon={<CloseIcon />}
            {...getTagProps({ index })}
            sx={{ pl: "5px" }}
            key={index}
          />
        ))
      }
      renderInput={params => <TextField {...params} variant="outlined" label="Institutions" />}
    />
  );
};
export default InstitutionsAutocomplete;
