import {
  Avatar,
  Box,
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
import TextField from "@mui/material/TextField";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { Dayjs } from "dayjs";
import { collection, getDocs, getFirestore, query, where, writeBatch } from "firebase/firestore";
import moment from "moment";
import Image from "next/image";
import { useEffect, useState } from "react";
import { roundNum } from "src/utils/common.utils";

import { useAuth } from "@/context/AuthContext";
import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";
import { getAvatarName } from "@/lib/utils/Map.utils";

const DEFAULT_PROFILE_URL = "https://storage.googleapis.com/onecademy-1.appspot.com/ProfilePictures/no-img.png";
interface HoursData {
  day: string; // Assuming the day is stored as a string in the format "MM-DD-YYYY"
  semesterId: string;
  uname: string;
  totalMinutes: number;
  paid: boolean;
}

interface Semesters {
  [semesterId: string]: {
    students: Student[];
  };
}

interface Student {
  uname: string;
  totalMinutes: number;
  paid: boolean;
}

interface Period {
  start: moment.Moment;
  end: moment.Moment;
  label: string;
  index: number;
}
const TrackingHours = () => {
  const db = getFirestore();
  const [semesters, setSemesters] = useState<any>({});
  const [trackedStudents, setTrackedStudents] = useState<any>({});
  const [selectedSemester, setSelectedSemester] = useState<string>("");
  const [selectedPeriod, setSelectedPeriod] = useState<number>(0); // Default to the first period
  const [{ user }] = useAuth();
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [selectedDatePeriod, setSelectedDatePeriod] = useState<any>(null);
  const adminView = !!user?.claims?.tracking;

  const handleDateChange = (date: Dayjs | null) => {
    setSelectedDate(date);
    setSelectedPeriod(-1);
    if (date) {
      const period = {
        start: date.startOf("day"),
        end: date.endOf("day"),
        label: date.format("MM/DD/YYYY"),
        index: -1, // Special index for single-day period
      };
      setSelectedDatePeriod(period);
    } else {
      setSelectedDatePeriod(null);
    }
  };

  const generateTwoWeekPeriods = (startDate: any) => {
    let periods = [];
    let currentDate = moment(startDate);
    let now = moment();
    let index = 0;

    while (currentDate.isBefore(now)) {
      const periodStart = currentDate;
      const periodEnd = moment(periodStart).add(13, "days");
      periods.push({
        start: periodStart,
        end: periodEnd,
        label: `${periodStart.format("MM/DD/YYYY")} - ${periodEnd.format("MM/DD/YYYY")}`,
        index: index,
      });
      currentDate = moment(periodStart).add(14, "days");
      index++;
    }

    return periods;
  };

  const periods = generateTwoWeekPeriods("2024-06-10");

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
  function parseDate(dateStr: string): Date {
    const [day, month, year] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
  }
  function checkDateInRange(_start: string, _end: string, day: string): boolean {
    const start = parseDate(_start);
    const end = parseDate(_end);
    const _day = parseDate(day);

    return _day >= start && _day <= end;
  }
  const loadTrackingData = async (
    semesters: Semesters,
    selectedPeriod: number,
    selectedDatePeriod?: Period,
    periods?: Period[]
  ) => {
    let hoursQuery: any = collection(db, "trackHours");

    // if (selectedDatePeriod && selectedPeriod !== -1) {
    //   hoursQuery = query(hoursQuery, where("day", "==", selectedDatePeriod.start.format("DD-MM-YYYY")));
    // }
    const hoursTrackedDocs = await getDocs(hoursQuery);

    const updatedSemesters = { ...semesters };
    for (const semesterId in updatedSemesters) {
      const students = updatedSemesters[semesterId]?.students;
      if (students) {
        for (const student of students) {
          student.totalMinutes = 0;
        }
      }
    }

    for (let hoursTrackDoc of hoursTrackedDocs.docs) {
      const hoursData = hoursTrackDoc.data() as HoursData;
      if (!updatedSemesters[hoursData.semesterId]) continue;
      const students = updatedSemesters[hoursData.semesterId]?.students;

      if (!students.length) continue;
      const studentIdx = students.findIndex((s: Student) => s.uname === hoursData.uname);
      if (studentIdx !== -1) {
        const period = (selectedPeriod !== -1 && periods ? periods[selectedPeriod] : undefined) || selectedDatePeriod;

        let visible = true;

        if (period) {
          const { start, end } = period;
          const hoursDate = hoursData.day;
          const _end: string = end.format("DD-MM-YYYY");
          const _start: string = start.format("DD-MM-YYYY");

          visible = checkDateInRange(_start, _end, hoursDate);
        }

        if (visible) {
          students[studentIdx].totalMinutes = (students[studentIdx].totalMinutes || 0) + hoursData.totalMinutes;
          students[studentIdx].paid = hoursData.paid || false;
        }
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
      setTimeout(() => {
        loadTrackingData(semesters, selectedPeriod, selectedDatePeriod, periods);
      }, 500);
    }
  }, [semesters, selectedPeriod, selectedDatePeriod]);

  const handleSemesterChange = (event: any) => {
    setSelectedSemester(event.target.value);
  };

  const togglePaidStatus = async (uname: string, semesterId: string) => {
    const batch = writeBatch(db);
    const students = trackedStudents[semesterId].students;
    const studentIdx = students.findIndex((s: any) => s.uname === uname);
    if (studentIdx !== -1) {
      const student = students[studentIdx];

      const docQuery = query(
        collection(db, "trackHours"),
        where("uname", "==", uname),
        where("semesterId", "==", semesterId)
      );
      const hoursDocs = await getDocs(docQuery);

      hoursDocs.forEach(doc => {
        batch.update(doc.ref, { paid: !student.paid });
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
      <TableContainer component={Paper} sx={{ overflow: "auto", height: "100vh" }}>
        <Table>
          <TableHead
            sx={{
              position: "sticky",
              top: 0,
              background: theme =>
                theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG900 : DESIGN_SYSTEM_COLORS.gray100,
              zIndex: 1,
            }}
          >
            <TableRow>
              <TableCell>Student Name</TableCell>
              <TableCell>Hours Tracked</TableCell>
              <TableCell>Course</TableCell>
              <TableCell>Paid</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {studentsList.map((student: any) => (
              <TableRow key={student.uname} style={{ textDecoration: "none", cursor: "pointer" }}>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: "15px" }}>
                    {/* <Avatar src={student.imageUrl} alt={student.uname} sx={{ mr: 2 }} /> */}
                    <Box id={`${student.uname}-picture`} sx={{ "& img": { borderRadius: "50%" }, borderRadius: "8px" }}>
                      {student.imageUrl && student.imageUrl !== "" && student.imageUrl !== DEFAULT_PROFILE_URL ? (
                        <Image
                          src={student.imageUrl || ""}
                          alt={`${student.fName} ${student.lName}`}
                          width={50}
                          height={50}
                          objectFit="cover"
                          objectPosition="center center"
                        />
                      ) : (
                        <Avatar
                          sx={{
                            width: "50px",
                            height: "50px",
                            color: "white",
                            fontSize: "24px",
                            fontWeight: "600",
                            background: "linear-gradient(143.7deg, #FDC830 15.15%, #F37335 83.11%);",
                          }}
                        >
                          {getAvatarName(student.fName, student.lName)}
                        </Avatar>
                      )}
                    </Box>
                    <Link href={`/tracking/${student.uname}`} target="_blank" rel="noreferrer">
                      {student.fName} {student.lName}
                    </Link>
                  </Box>
                </TableCell>
                <TableCell>{roundNum((student.totalMinutes || 0) / 60)}</TableCell>
                <TableCell>{student.semesterName}</TableCell>

                <TableCell>
                  <Checkbox
                    checked={student.paid}
                    onChange={() => togglePaidStatus(student.uname, student.semesterId)}
                    disabled={!adminView || roundNum((student.totalMinutes || 0) / 60) === 0}
                    sx={{
                      color: !adminView || roundNum((student.totalMinutes || 0) / 60) === 0 ? "green" : "primary.main", // Set color based on disabled state
                      "&.Mui-disabled": {
                        color: student.paid ? "green" : "gray", // Custom disabled color
                      },
                      "& .MuiSvgIcon-root": {
                        color:
                          !adminView || roundNum((student.totalMinutes || 0) / 60) === 0
                            ? student.paid
                              ? "green"
                              : "gray"
                            : "primary.main", // Icon color based on disabled state
                      },
                    }}
                  />
                </TableCell>
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
        <Box sx={{ display: "flex", gap: "13px", py: "9px" }}>
          {Object.keys(semesters).length > 2 && (
            <Select
              value={selectedSemester}
              onChange={handleSemesterChange}
              displayEmpty
              variant="outlined"
              sx={{ width: "500px" }}
              MenuProps={{
                sx: {
                  zIndex: "9999",
                },
              }}
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
          )}
          <Select
            value={selectedPeriod}
            onChange={(event: any) => {
              setSelectedPeriod(event.target.value);
              setSelectedDate(null);
            }}
            displayEmpty
            variant="outlined"
            MenuProps={{
              sx: {
                zIndex: "9999",
              },
            }}
          >
            {periods.map(period => (
              <MenuItem key={period.index} value={period.index}>
                {period.label}
              </MenuItem>
            ))}
          </Select>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="--/--/--"
              value={selectedDate}
              onChange={handleDateChange}
              renderInput={params => <TextField {...params} />}
              PopperProps={{
                sx: {
                  zIndex: "9999",
                },
              }}
            />
          </LocalizationProvider>
        </Box>

        {renderTable()}
      </Container>
    </Box>
  );
};

export default TrackingHours;
