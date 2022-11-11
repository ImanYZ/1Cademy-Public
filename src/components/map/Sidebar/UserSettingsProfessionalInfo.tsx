import { Autocomplete, Box, createFilterOptions, TextField } from "@mui/material";
import { collection, doc, getDocs, getFirestore, query, setDoc, Timestamp, updateDoc } from "firebase/firestore";
import React, { HTMLAttributes, useEffect, useState } from "react";
import { Institution, Major, User } from "src/knowledgeTypes";

import OptimizedAvatar from "@/components/OptimizedAvatar";
// import OptimizedAvatar from "@/components/OptimizedAvatar";
import { useAuth } from "@/context/AuthContext";
import { capitalizeFirstLetter } from "@/lib/utils/string.utils";

import { MemoizedInputSave } from "../InputSave";
type UserSettingsProfessionalInfoProps = {
  user: User;
};
export const UserSettingsProfessionalInfo = ({ user }: UserSettingsProfessionalInfoProps) => {
  const db = getFirestore();
  const [{}, { dispatch }] = useAuth();

  const [ocupation, setOcupation] = useState(user.occupation);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [majors, setMajors] = useState<Major[]>([]);
  const [fieldOfInterest, setFieldOfInterest] = useState(user.fieldOfInterest);
  // const [allInstitutions, setAllInstitutions] = useState<Institution[]>([]);

  const updateUserField = async (username: string, attributeName: string, newValue: any) => {
    const userRef = doc(db, "users", username);
    await updateDoc(userRef, { [attributeName]: newValue });
  };

  const upadteUserFieldLog = async (username: string, attributeName: string, newValue: any) => {
    const userFieldLog = `user${capitalizeFirstLetter(attributeName)}Log`;
    // console.log("FIELD LOG: ", userFieldLog);
    const userFieldLogRef = doc(collection(db, userFieldLog));
    await setDoc(userFieldLogRef, {
      uname: username,
      [attributeName]: newValue,
      createdAt: Timestamp.fromDate(new Date()),
    });
  };

  const onSubmitField = async (user: User, attributeName: string, newValue: string) => {
    //try {
    await updateUserField(user.uname, attributeName, newValue);
    await upadteUserFieldLog(user.uname, attributeName, newValue);
    // } catch (error) {
    //   console.log(error);
    // }
  };

  const onChangeField = async (user: User, attributeName: string, newValue: any) => {
    //try {
    await updateUserField(user.uname, attributeName, newValue);
    await upadteUserFieldLog(user.uname, attributeName, newValue);
    // console.log("NEW VALUE: ", newValue);
    dispatch({ type: "setAuthUser", payload: { ...user, [attributeName]: newValue } });
    // } catch (error) {
    //   console.log(error);
    // }
  };

  const getNameFromInstitutionSelected = () => {
    if (!user.deInstit) return null;
    const foundInstitution = institutions.find(cur => cur.name === user.deInstit);
    if (!foundInstitution) return null;
    return foundInstitution;
  };
  const getMajorByName = (deMajor?: string) => {
    if (!deMajor) return null;
    return majors.find(cur => cur.Major === deMajor) || null;
  };

  useEffect(() => {
    setOcupation(user.occupation ?? "");
    setFieldOfInterest(user.fieldOfInterest ?? "");
  }, [user]);

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
      // setAllInstitutions(institutionSorted);
      setInstitutions(institutionSorted);
    };
    retrieveInstitutions();
  }, []);

  useEffect(() => {
    const retrieveMajors = async () => {
      if (majors.length) return;

      const majorsObj = await import("../../../../public/edited_majors.json");
      const majorsList = [...majorsObj.default, { Major: "Prefer not to say", Major_Category: "Prefer not to say" }]
        .sort((l1, l2) => (l1.Major < l2.Major ? -1 : 1))
        .sort((l1, l2) => (l1.Major_Category < l2.Major_Category ? -1 : 1));
      setMajors(majorsList);
    };

    retrieveMajors();
    // TODO: check dependencies to remove eslint-disable-next-line
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // const onChangeInstitution = (value: string) => {
  //   const foundInstitution: Institution[] = allInstitutions.reduce((acu: Institution[], cur) => {
  //     if (acu.length < 10) {
  //       if (cur.name.includes(value)) {
  //         return [...acu, cur];
  //       } else {
  //         return acu;
  //       }
  //     }
  //     return acu;
  //   }, []);
  //   setInstitutions(foundInstitution);
  // };
  return (
    <Box data-testid="user-settings-professional-info">
      <MemoizedInputSave
        identification="occupation"
        initialValue={ocupation} //TODO: important fill empty user field
        onSubmit={(value: string) => onSubmitField(user, "occupation", value)}
        setState={(value: string) => dispatch({ type: "setAuthUser", payload: { ...user, occupation: value } })}
        label="Please specify your occupation."
      />
      <Autocomplete
        id="institution"
        loading={institutions.length === 0}
        filterOptions={createFilterOptions({
          matchFrom: "any",
          limit: 20,
        })}
        value={getNameFromInstitutionSelected()}
        onChange={(_, value) => onChangeField(user, "deInstit", value?.name || null)}
        // onBlur={() => setTouched({ ...touched, institution: true })}
        // onInputChange={(_, value) => {
        //   onChangeInstitution(value);
        // }}
        options={institutions}
        getOptionLabel={option => option.name}
        renderInput={params => (
          <TextField
            {...params}
            label="Institution"
            // error={Boolean(errors.institution) && Boolean(touched.institution)}
            // helperText={touched.institution && errors.institution}
          />
        )}
        renderOption={(props: HTMLAttributes<HTMLLIElement>, option: Institution) => (
          <li {...props} key={option.id}>
            <OptimizedAvatar name={option.name} imageUrl={option.logoURL} contained renderAsAvatar={false} />
            <div style={{ paddingLeft: "10px" }}>{option.name}</div>
          </li>
        )}
        isOptionEqualToValue={(option: Institution, value: Institution) => option.id === value.id}
        fullWidth
        sx={{ mb: "16px" }}
      />
      <Autocomplete
        id="major"
        value={getMajorByName(user.deMajor)}
        onChange={(_, value: Major | null) => onChangeField(user, "deMajor", value?.Major ?? "")}
        // onBlur={() => setTouched({ ...touched, major: true })}
        options={majors}
        getOptionLabel={option => option.Major}
        groupBy={option => option.Major_Category}
        renderInput={params => (
          <TextField
            {...params}
            label="Major"
            // error={Boolean(errors.major) && Boolean(touched.major)}
            // helperText={touched.major && errors.major}
          />
        )}
        fullWidth
        sx={{ mb: "16px" }}
      />
      <MemoizedInputSave
        identification="fieldOfInterest"
        initialValue={fieldOfInterest}
        onSubmit={(value: string) => onSubmitField(user, "fieldOfInterest", value)}
        setState={(value: string) => dispatch({ type: "setAuthUser", payload: { ...user, fieldOfInterest: value } })}
        label="Research field of interest (if any)"
      />
      {/* <TextField
        id="fieldOfInterest"
        name="fieldOfInterest"
        label="Research field of interest (if any)"
        value={user.fieldOfInterest}
        onChange={handleChange}
        onBlur={handleBlur}
        variant="outlined"
        error={Boolean(errors.fieldOfInterest) && Boolean(touched.fieldOfInterest)}
        helperText={touched.fieldOfInterest && errors.fieldOfInterest}
        fullWidth
        sx={{ mb: "16px" }}
      /> */}
    </Box>
  );
};
