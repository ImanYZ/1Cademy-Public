import CreateIcon from "@mui/icons-material/Create";
import { LoadingButton } from "@mui/lab";
import { Autocomplete, createFilterOptions, Grid, TextField } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import { Box } from "@mui/system";
import { useFormik } from "formik";
import { FC, HTMLAttributes, useState } from "react";
import React from "react";
import { Institution } from "src/knowledgeTypes";
import * as yup from "yup";

import OptimizedAvatar from "@/components/OptimizedAvatar";
import { useAuth } from "@/context/AuthContext";
import { Post } from "@/lib/mapApi";
type Props = {
  institutions: any;
};
const validationSchema = yup.object({
  courseCode: yup.string().required("Course is required"),
  semesterName: yup.string().required("Semester is required"),
  programName: yup.string().required("Program is required"),
  departmentName: yup.string().required("Department is required"),
  universityName: yup.string().required("Institution is required"),
});

const NewCourse: FC<Props> = ({ institutions }) => {
  const [{ user }] = useAuth();
  const [requestLoader, setRequestLoader] = useState(false);
  const getNameFromInstitutionSelected = () => {
    let instituteName: any = "";
    if (formik.values.universityName) {
      instituteName = formik.values.universityName;
    } else {
      if (!user?.deInstit) return null;
      instituteName = user?.deInstit;
    }
    if (!user?.deInstit) return null;
    const foundInstitution = institutions.find((cur: any) => cur.name === instituteName);
    if (!foundInstitution) return null;
    return foundInstitution;
  };

  const formik = useFormik({
    initialValues: {
      courseCode: "",
      semesterName: "",
      programName: "",
      departmentName: "",
      universityName: user?.deInstit,
    },
    validationSchema: validationSchema,
    onSubmit: async values => {
      setRequestLoader(true);
      await Post("/instructor/course/create", values);
      setRequestLoader(false);
    },
  });
  return (
    <Box sx={{ marginTop: "50px", padding: "0 10px" }}>
      <Grid container sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Grid item xs={12} md={4}>
          <form style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "25px" }}>
            <TextField
              placeholder="i.e. SI691"
              fullWidth
              id="courseCode"
              name="courseCode"
              label="Course"
              value={formik.values.courseCode}
              onChange={formik.handleChange}
              error={formik.touched.courseCode && Boolean(formik.errors.courseCode)}
              helperText={formik.touched.courseCode && formik.errors.courseCode}
            />

            <TextField
              placeholder="i.e. Fall 2020"
              fullWidth
              id="semesterName"
              name="semesterName"
              label="Semester"
              value={formik.values.semesterName}
              onChange={formik.handleChange}
              error={formik.touched.semesterName && Boolean(formik.errors.semesterName)}
              helperText={formik.touched.semesterName && formik.errors.semesterName}
            />

            <TextField
              placeholder="i.e. MSI"
              fullWidth
              id="programName"
              name="programName"
              label="Program"
              value={formik.values.programName}
              onChange={formik.handleChange}
              error={formik.touched.programName && Boolean(formik.errors.programName)}
              helperText={formik.touched.programName && formik.errors.programName}
            />

            <TextField
              placeholder="i.e. Information Science"
              fullWidth
              id="departmentName"
              name="departmentName"
              label="Department"
              value={formik.values.departmentName}
              onChange={formik.handleChange}
              error={formik.touched.departmentName && Boolean(formik.errors.departmentName)}
              helperText={formik.touched.departmentName && formik.errors.departmentName}
            />

            <Autocomplete
              loading={institutions.length === 0}
              filterOptions={createFilterOptions({
                matchFrom: "any",
                limit: 20,
              })}
              id="institution"
              value={getNameFromInstitutionSelected()}
              onChange={(e, value) => formik.setFieldValue("universityName", value?.name || "")}
              options={institutions}
              getOptionLabel={option => option.name}
              renderInput={params => (
                <TextField
                  {...params}
                  error={formik.touched.universityName && Boolean(formik.errors.universityName)}
                  helperText={formik.touched.universityName && formik.errors.universityName}
                  label="Institution"
                />
              )}
              renderOption={(props: HTMLAttributes<HTMLLIElement>, option: Institution) => (
                <li {...props} key={option.id}>
                  <OptimizedAvatar name={option.name} imageUrl={option.logoURL} contained renderAsAvatar={false} />
                  <div style={{ paddingLeft: "10px" }}>{option.name}</div>
                </li>
              )}
              fullWidth
              sx={{ mb: "16px" }}
            />
            <LoadingButton
              type="submit"
              onClick={formik.handleSubmit}
              loading={requestLoader}
              endIcon={<CreateIcon />}
              loadingPosition="end"
              variant="contained"
              loadingIndicator={
                <CircularProgress
                  sx={{ color: theme => (theme.palette.mode === "dark" ? theme.palette.common.white : "#555") }}
                />
              }
              sx={{
                color: theme => theme.palette.common.white,
                fontWeight: "bold",
                padding: "15px 80px",
                marginTop: "20px",
                fontSize: "15px",
              }}
            >
              Create
            </LoadingButton>
          </form>
        </Grid>
      </Grid>
    </Box>
  );
};

export default NewCourse;
