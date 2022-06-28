import CloseIcon from "@mui/icons-material/Close";
import Autocomplete from "@mui/material/Autocomplete";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import { useRouter } from "next/router";
import { FC, useEffect, useState } from "react";
import { useQuery } from "react-query";
import { useDebounce } from "use-debounce";

import { getContributorsAutocomplete, getSelectedContributors } from "../lib/knowledgeApi";
import { getQueryParameter } from "../lib/utils";
import { FilterValue } from "../src/knowledgeTypes";

type Props = {
  onContributorsChange: (newValues: FilterValue[]) => void;
};

const ContributorsAutocomplete: FC<Props> = ({ onContributorsChange }) => {
  const router = useRouter();
  const [hasBeenCleared, setHasBeenCleared] = useState(false);
  const [value, setValue] = useState<FilterValue[]>([]);
  const [text, setText] = useState("");
  const [searchText] = useDebounce(text, 250);
  const { isLoading, data } = useQuery(["contributors", searchText], () => getContributorsAutocomplete(searchText));

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
    onContributorsChange(newValue);
  };

  useEffect(() => {
    const parameterContributors = getQueryParameter(router.query.contributors) || "";
    const fetchSelectedContributors = async () => {
      try {
        const response = await getSelectedContributors(parameterContributors);
        setValue(response);
      } catch {
        setValue([]);
      }
    };
    const contributors = parameterContributors.split(",").filter(el => el !== "");

    if (value.length === 0 && contributors.length > 0 && !hasBeenCleared) {
      fetchSelectedContributors();
    }
  }, [hasBeenCleared, router.query.contributors, value.length]);

  return (
    <Autocomplete
      multiple
      options={data?.results || []}
      value={value}
      loading={isLoading}
      noOptionsText={"Search contributors"}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      onInputChange={handleQueryChange}
      renderOption={(props, option) => {
        const newProps = { ...props, key: option.id };
        return (
          <li {...newProps}>
            {option.imageUrl ? (
              <Avatar sizes="small" alt={option.name} src={option.imageUrl} sx={{ mr: 1 }} />
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
            avatar={option.imageUrl ? <Avatar alt={option.name} src={option.imageUrl} /> : undefined}
            variant="outlined"
            label={option.name}
            deleteIcon={<CloseIcon />}
            {...getTagProps({ index })}
            key={index}
          />
        ))
      }
      renderInput={params => <TextField {...params} variant="outlined" label="Contributors" />}
    />
  );
};
export default ContributorsAutocomplete;
