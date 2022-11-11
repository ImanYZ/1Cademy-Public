import CreateIcon from "@mui/icons-material/Create";
import { LoadingButton } from "@mui/lab";
import { Grid, TextField } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import { Box } from "@mui/system";
import { useFormik } from "formik";
import { FC, useState } from "react";
import React from "react";
import * as yup from "yup";

import InstitutionDropdown from "@/components/InstitutionDropdown";
import { useAuth } from "@/context/AuthContext";
import { Post } from "@/lib/mapApi";
type Props = {};
const validationSchema = yup.object({
  courseCode: yup.string().required("Course is required"),
  semesterName: yup.string().required("Semester is required"),
  programName: yup.string().required("Program is required"),
  departmentName: yup.string().required("Department is required"),
  universityName: yup.string().required("Institution is required"),
});

const NewCourse: FC<Props> = () => {
  const [{ user }] = useAuth();
  const [requestLoader, setRequestLoader] = useState(false);
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
          <form
            onSubmit={formik.handleSubmit}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "25px" }}
          >
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
            <InstitutionDropdown fieldName={"universityName"} formikProps={formik} />
            <LoadingButton
              type="submit"
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
