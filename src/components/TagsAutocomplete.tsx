import CloseIcon from "@mui/icons-material/Close";
import Autocomplete from "@mui/material/Autocomplete";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import { useRouter } from "next/router";
import { FC, useEffect, useState } from "react";
import { useQuery } from "react-query";
import { useDebounce } from "use-debounce";

import { getTagsAutocomplete } from "@/lib/knowledgeApi";
import { getQueryParameter } from "@/lib/utils/utils";

type Props = {
  onTagsChange: (newValues: string[]) => void;
};

const TagsAutocomplete: FC<Props> = ({ onTagsChange }) => {
  const router = useRouter();
  const [value, setValue] = useState<string[]>([]);
  const [text, setText] = useState("");
  const [searchText] = useDebounce(text, 250);
  const { data, isLoading } = useQuery(["tags", searchText], () => getTagsAutocomplete(searchText));
  const [hasBeenCleared, setHasBeenCleared] = useState(false);

  const handleQueryChange = (event: React.SyntheticEvent<Element, Event>, query: string) => {
    if (event && query.trim().length > 0) {
      setText(query);
    }
  };

  const handleChange = (_: React.SyntheticEvent, newValue: string[]) => {
    if (newValue.length === 0) {
      setHasBeenCleared(true);
    }
    setValue(newValue);
    onTagsChange(newValue);
  };

  useEffect(() => {
    const tags = (getQueryParameter(router.query.tags) || "").split(",").filter(el => el !== "");
    if (value.length === 0 && tags.length > 0 && !hasBeenCleared) {
      setValue(tags);
    }
  }, [hasBeenCleared, router.query.tags, value.length]);

  return (
    <Autocomplete
      multiple
      value={value}
      options={data?.results || []}
      onInputChange={handleQueryChange}
      onChange={handleChange}
      noOptionsText={"Search tags"}
      renderOption={(props, option) => (
        <li data-testid="tag-option" {...props}>
          {option}
        </li>
      )}
      loading={isLoading}
      renderTags={(value: readonly string[], getTagProps) =>
        value.map((option: string, index: number) => (
          <Chip variant="outlined" label={option} deleteIcon={<CloseIcon />} {...getTagProps({ index })} key={index} />
        ))
      }
      renderInput={params => <TextField {...params} variant="outlined" label="Tags" />}
    />
  );
};
export default TagsAutocomplete;
