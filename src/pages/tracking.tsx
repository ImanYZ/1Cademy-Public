import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Container,
  Link,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { collection, getDocs, getFirestore, query, where, writeBatch } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { roundNum } from "src/utils/common.utils";

import { useAuth } from "@/context/AuthContext";
import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";

const Tracking = () => {
  const db = getFirestore();
  const [semesters, setSemesters] = useState<any>({});
  const [trackedStudents, setTrackedStudents] = useState<any>({});
  const [selectedSemester, setSelectedSemester] = useState<string>("");
  const [{ user }] = useAuth();
  const adminView = !!user?.claims?.tracking;

  const loadListOfStudents = async () => {
    const semestersMap: { [key: string]: any } = {};
    const leading: any = user?.claims?.leading || [];
    if (!(leading || []).length && !adminView) return;
    const semestersQuery = adminView
      ? query(collection(db, "semesters"), where("trackingHours", "==", true))
      : query(collection(db, "semesters"), where("trackingHours", "==", true), where("__name__", "in", leading));
    const semestersDocs = await getDocs(semestersQuery);
    for (let semesterDoc of semestersDocs.docs) {
      const semesterData = semesterDoc.data();

      if (semesterData.students.length > 0) {
        semestersMap[semesterDoc.id] = semesterData;
        let _students = [];
        for (let student of semesterData.students) {
          _students.push({ ...student, semesterId: semesterDoc.id, semesterName: semesterData.title });
        }
        semesterData.students = _students;
      }
    }
    setSemesters(semestersMap);
  };

  const loadTrackingData = async (semesters: any) => {
    const hoursTrackedDocs = await getDocs(collection(db, "trackHours"));
    const updatedSemesters = { ...semesters };
    for (let hoursTrackDoc of hoursTrackedDocs.docs) {
      const hoursData = hoursTrackDoc.data();
      const students = updatedSemesters[hoursData.semesterId].students;
      const studentIdx = students.findIndex((s: any) => s.uname === hoursData.uname);
      if (studentIdx !== -1) {
        students[studentIdx].totalMinutes = (students[studentIdx].totalMinutes || 0) + hoursData.totalMinutes;
        students[studentIdx].paid = hoursData.paid || false; // Ensure the paid field is set
      }
    }
    setTrackedStudents(updatedSemesters);
  };

  useEffect(() => {
    if (!user) return;
    loadListOfStudents();
  }, [db, user]);

  useEffect(() => {
    if (Object.keys(semesters).length > 0) {
      loadTrackingData(semesters);
    }
  }, [semesters]);

  const handleSemesterChange = (event: any) => {
    setSelectedSemester(event.target.value);
  };

  const togglePaidStatus = async (uname: string, semesterId: string) => {
    const batch = writeBatch(db);
    const students = trackedStudents[semesterId].students;
    const studentIdx = students.findIndex((s: any) => s.uname === uname);
    if (studentIdx !== -1) {
      const student = students[studentIdx];

      // Correct query using namespaces
      const docQuery = query(
        collection(db, "trackHours"),
        where("uname", "==", uname),
        where("semesterId", "==", semesterId)
      );
      const hoursDocs = await getDocs(docQuery);

      hoursDocs.forEach(doc => {
        batch.update(doc.ref, { paid: !student.ppaid });
      });

      student.paid = !student.paid;
      setTrackedStudents({ ...trackedStudents });
      await batch.commit();
    }
  };

  const renderTable = () => {
    let studentsList: any = [];
    if (selectedSemester && trackedStudents[selectedSemester]) {
      studentsList = trackedStudents[selectedSemester].students;
    } else {
      Object.values(trackedStudents).forEach((semester: any) => {
        studentsList = studentsList.concat(semester.students);
      });
    }
    if (!adminView && Object.keys(semesters).length <= 0) return;
    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Student Name</TableCell>
              <TableCell>Hours Tracked</TableCell>
              <TableCell>Course</TableCell>
              {adminView && <TableCell>Paid</TableCell>}
              {adminView && <TableCell>Action</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {studentsList.map((student: any) => (
              <TableRow key={student.uname} style={{ textDecoration: "none", cursor: "pointer" }}>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Avatar src={student.imageUrl} alt={student.uname} sx={{ mr: 2 }} />
                    <Link href={`/tracking/${student.uname}`} target="_blank" rel="noreferrer">
                      {student.fName} {student.lName}
                    </Link>
                  </Box>
                </TableCell>
                <TableCell>{roundNum((student.totalMinutes || 0) / 60)}</TableCell>
                <TableCell>{student.semesterName}</TableCell>
                {adminView && (
                  <TableCell>
                    <Checkbox
                      checked={student.paid}
                      onChange={() => togglePaidStatus(student.uname, student.semesterId)}
                      disabled={roundNum((student.totalMinutes || 0) / 60) === 0}
                    />
                  </TableCell>
                )}
                {adminView && (
                  <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => togglePaidStatus(student.uname, student.semesterId)}
                      disabled={roundNum((student.totalMinutes || 0) / 60) === 0}
                    >
                      Mark as {student.paid ? "Unpaid" : "Paid"}
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Box
      sx={{
        background: theme =>
          theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG900 : DESIGN_SYSTEM_COLORS.gray100,
        height: "100vh",
      }}
    >
      <Container>
        <Select
          sx={{ my: "9px" }}
          value={selectedSemester}
          onChange={handleSemesterChange}
          displayEmpty
          fullWidth
          variant="outlined"
        >
          <MenuItem value="" disabled>
            Select Course
          </MenuItem>
          <MenuItem value="">All Courses</MenuItem>
          {Object.keys(semesters).map(semesterId => (
            <MenuItem key={semesterId} value={semesterId}>
              {semesters[semesterId].title}
            </MenuItem>
          ))}
        </Select>
        {renderTable()}
      </Container>
    </Box>
  );
};

export default Tracking;
