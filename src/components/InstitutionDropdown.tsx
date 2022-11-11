import { Autocomplete, createFilterOptions, TextField } from "@mui/material";
import { collection, getDocs, getFirestore, query } from "firebase/firestore";
import { HTMLAttributes, useEffect, useState } from "react";
import { Institution } from "src/knowledgeTypes";

import OptimizedAvatar from "./OptimizedAvatar";

type InstitutionDropdown = {
  formikProps?: any;
  fieldName?: any;
  user?: any;
  onChangeField?: any;
};

const InstitutionDropdown = ({ formikProps, fieldName, user, onChangeField }: InstitutionDropdown) => {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  useEffect(() => {
    const retrieveInstitutions = async () => {
      const db = getFirestore();
      const institutionsRef = collection(db, "institutions");
      const q = query(institutionsRef);

      const querySnapshot = await getDocs(q);
      let institutions: Institution[] = [];
      querySnapshot.forEach(doc => {
        institutions.push({ id: doc.id, ...doc.data() } as Institution);
      });

      const institutionSorted = institutions
        .sort((l1, l2) => (l1.name < l2.name ? -1 : 1))
        .sort((l1, l2) => (l1.country < l2.country ? -1 : 1));
      setInstitutions(institutionSorted);
    };
    retrieveInstitutions();
  }, []);

  const getNameFromInstitutionSelected = () => {
    let institution: any = "";
    if (user) {
      if (!user.deInstit) return null;
      institution = user.deInstit;
    } else {
      if (!formikProps.values.institution && !formikProps.values[fieldName]) return null;
      institution = formikProps.values.institution ?? formikProps.values[fieldName];
    }
    const foundInstitution = institutions.find(cur => cur.name === institution);
    if (!foundInstitution) return null;
    return foundInstitution;
  };

  return (
    <Autocomplete
      id="institution"
      loading={institutions.length === 0}
      filterOptions={createFilterOptions({
        matchFrom: "any",
        limit: 20,
      })}
      value={getNameFromInstitutionSelected()}
      onChange={(_, value) => {
        if (formikProps) {
          formikProps.setFieldValue(fieldName ?? "institution", value?.name || null);
        } else {
          onChangeField(user, fieldName, value?.name || null);
        }
      }}
      onBlur={() => {
        if (formikProps) {
          formikProps.setTouched({ ...formikProps.touched, institution: true });
        }
      }}
      options={institutions}
      getOptionLabel={option => option.name}
      renderInput={params => (
        <TextField
          {...params}
          label="Institution"
          error={formikProps && Boolean(formikProps.errors.institution) && Boolean(formikProps.touched.institution)}
          helperText={formikProps && formikProps.touched.institution && formikProps.errors.institution}
        />
      )}
      renderOption={(props: HTMLAttributes<HTMLLIElement>, option: Institution) => (
        <li {...props} key={option.id}>
          <OptimizedAvatar name={option.name} imageUrl={option.logoURL} contained renderAsAvatar={false} />
          <div style={{ paddingLeft: "7px" }}>{option.name}</div>
        </li>
      )}
      isOptionEqualToValue={(option: Institution, value: Institution) => option.id === value.id}
      fullWidth
      sx={{ mb: "16px" }}
    />
  );
};

export default InstitutionDropdown;
