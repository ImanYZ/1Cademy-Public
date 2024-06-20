import DeleteIcon from "@mui/icons-material/Delete";
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
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
  TextField,
  Typography,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import dayjs, { Dayjs } from "dayjs";
import {
  collection,
  doc,
  Firestore,
  getDocs,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  setDoc,
  Timestamp,
  Unsubscribe,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import moment from "moment";
import Image from "next/image";
import { useEffect, useState } from "react";
import { roundNum } from "src/utils/common.utils";

import { useAuth } from "@/context/AuthContext";
import useConfirmDialog from "@/hooks/useConfirmDialog";
import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";
import { getAvatarName } from "@/lib/utils/Map.utils";
import { newId } from "@/lib/utils/newFirestoreId";

import StudentDetailHoursTracking from "./StudentDetail";

const DEFAULT_PROFILE_URL = "https://storage.googleapis.com/onecademy-1.appspot.com/ProfilePictures/no-img.png";
interface HoursData {
  day: string; // Assuming the day is stored as a string in the format "MM-DD-YYYY"
  semesterId: string;
  uname: string;
  totalMinutes: number;
  paid: boolean;
  meetings: any[]; // Array to store meeting attendance for each Monday in the period
  shortMeetings: any[];
}

// interface Semesters {
//   [semesterId: string]: {
//     students: Student[];
//   };
// }

// interface Student {
//   uname: string;
//   totalMinutes: number;
//   paid: boolean;
//   meetings: any[];
//   shortMeetings: any[];
//   imageUrl: string;
//   fName: string;
//   lName: string;
//   semesterId: string;
//   semesterName: string;
// }

// interface Period {
//   start: moment.Moment;
//   end: moment.Moment;
//   label: string;
//   index: number;
// }
interface Meeting {
  sTimestamp: Timestamp;
  eTimestamp: Timestamp;
  meetingId: string;
  duration: number;
  day: string;
  previousDuration: number;
}

const TrackingHours = () => {
  const db = getFirestore();
  const { confirmIt, ConfirmDialog } = useConfirmDialog();
  const [semesters, setSemesters] = useState<any>({});
  const [selectedSemester, setSelectedSemester] = useState<string>("");
  const [selectedPeriod, setSelectedPeriod] = useState<number>(0); // Default to the first period
  const [{ user }] = useAuth();
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [selectedDatePeriod, setSelectedDatePeriod] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [selectedStudentForMeeting, setSelectedStudentForMeeting] = useState<any>({});
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [activityDate, setActivityDate] = useState<Dayjs | null>(dayjs());
  const [startTime, setStartTime] = useState<any>(null);
  const [endTime, setEndTime] = useState<any>(null);
  const [studentHours, setStudentsHours] = useState<any>({});

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
          _students.push({ ...student, semesterId: semesterDoc.id, semesterName: semesterData.title, meetings: [] });
        }
        semesterData.students = _students;
      }
    }
    setSemesters(semestersMap);
  };

  // function parseDate(dateStr: string): Date {
  //   const [day, month, year] = dateStr.split("-").map(Number);
  //   return new Date(year, month - 1, day);
  // }

  // function checkDateInRange(_start: string, _end: string, day: string): boolean {
  //   const start = parseDate(_start);
  //   const end = parseDate(_end);
  //   const _day = parseDate(day);

  //   return _day >= start && _day <= end;
  // }

  const getUserHoursSnapshot = (db: Firestore, callback: (changes: any) => void): Unsubscribe => {
    let q = query(collection(db, "trackHours"), orderBy("createdAt", "desc"));

    const killSnapshot = onSnapshot(q, snapshot => {
      const docChanges = snapshot.docChanges();
      const actionTrackDocuments: any = docChanges.map(change => {
        const document = change.doc.data() as any;
        return { type: change.type, data: { id: change.doc.id, ...document }, doc: change.doc };
      });
      callback(actionTrackDocuments);
    });
    return killSnapshot;
  };

  useEffect(() => {
    const onSynchronize = (changes: any) => {
      setStudentsHours((prev: any) =>
        changes.reduce((prev: { [versionId: string]: any }, change: any) => {
          const docType = change.type;
          const curData = {
            ...change.data,
            createdAt: change.data.createdAt.toDate(),
            comments: [],
          } as any & { id: string };
          const shortMeetings = curData?.shortMeetings || [];
          const meetings = curData.meetings || [];
          let time = curData.totalMinutes;

          if (docType === "added" || docType === "modified") {
            if (!prev.hasOwnProperty(curData.uname)) {
              prev[curData.uname] = {
                trackedHoursPerDay: {
                  [curData.day]: { time, shortMeetings, meetings, paid: !!curData.paid },
                },
                trackHoursPerPeriod: {
                  "06/10/2024 - 06/23/2024": {
                    time,
                    shortMeetings,
                    meetings,
                    paid: !!curData.paid,
                  },
                },
              };
            } else {
              prev[curData.uname] = {
                trackedHoursPerDay: {
                  ...(prev[curData.uname]?.trackedHoursPerDay || {}),
                  [curData.day]: {
                    time,
                    shortMeetings,
                    meetings,
                    paid: !!curData.paid,
                  },
                },
              };
              let previousPeriodTime = 0;
              let _meetings: any = [];
              let _shortMeetings: any = [];
              let _paid = true;
              const trackedDay = prev[curData.uname].trackedHoursPerDay;
              for (let day in trackedDay) {
                previousPeriodTime = previousPeriodTime + trackedDay[day].time;
                _meetings = [...(trackedDay[day].meetings || []), ..._meetings];
                _shortMeetings = [...(trackedDay[day].shortMeetings || []), ..._shortMeetings];
                _paid = !!trackedDay[day].paid;
              }
              prev[curData.uname].trackHoursPerPeriod = {
                "06/10/2024 - 06/23/2024": {
                  time: previousPeriodTime,
                  meetings: _meetings,
                  shortMeetings: _shortMeetings,
                  paid: _paid,
                },
              };
            }
          }

          if (docType === "removed" && prev.hasOwnProperty(curData.id)) {
            delete prev[curData.uname][curData.day];
          }
          return prev;
        }, prev)
      );
    };
    const killSnapshot = getUserHoursSnapshot(db, onSynchronize);
    return () => killSnapshot();
  }, [db]);

  const updatedSemesters = (
    semesters: any,
    studentHours: any,
    selectedDatePeriod: any,
    selectedPeriod: any,
    periods: any
  ) => {
    const updatedSemesters = { ...semesters };
    for (const semesterId in updatedSemesters) {
      const students = updatedSemesters[semesterId]?.students;
      if (students) {
        for (const student of students) {
          const selectedDay = selectedDatePeriod ? selectedDatePeriod.start.format("DD-MM-YYYY") : null;
          let hours = (studentHours[student.uname].trackedHoursPerDay[selectedDay]?.time || 0) / 60;
          let meetings = studentHours[student.uname].trackedHoursPerDay[selectedDay]?.meetings || [];
          let shortMeetings = studentHours[student.uname].trackedHoursPerDay[selectedDay]?.shortMeetings || [];
          let paid = !!studentHours[student.uname].trackedHoursPerDay[selectedDay]?.paid;
          if (selectedPeriod !== -1) {
            const period = periods[selectedPeriod].label;
            hours = studentHours[student.uname].trackHoursPerPeriod[period].time / 60;
            meetings = studentHours[student.uname].trackHoursPerPeriod[period].meetings || [];
            shortMeetings = studentHours[student.uname].trackHoursPerPeriod[period].shortMeetings || [];
            paid = !!studentHours[student.uname].trackHoursPerPeriod[period]?.paid;
          }
          student.hours = hours;
          student.meetings = meetings;
          student.shortMeetings = shortMeetings;
          student.paid = paid;
        }
      }
    }
    setSemesters(updatedSemesters);
  };

  useEffect(() => {
    if (Object.keys(semesters).length > 0) {
      setTimeout(() => {
        updatedSemesters(semesters, studentHours, selectedDatePeriod, selectedPeriod, periods);
      }, 500);
    }
  }, [semesters, selectedPeriod, selectedDatePeriod]);

  const formatTime = (timestamp: Timestamp, hour12 = true): string => {
    const date = timestamp.toDate();
    const formattedDate = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (!hour12) {
      return formattedDate.replace(/\s*(AM|PM)/, "");
    }
    return formattedDate;
  };

  const handleDeleteShortMeeting = async (student: any, meeting: Meeting) => {
    try {
      if (
        await confirmIt(
          <Box>
            <Typography variant="h6">Delete 1:1 Meeting</Typography>
            Are you sure you want to delete this meeting with{" "}
            <strong style={{ color: "orange" }}>
              {student.fName} {student.lName}{" "}
            </strong>
            at <strong style={{ color: "orange" }}>{meeting.day}</strong> from{" "}
            <strong style={{ color: "orange" }}>{formatTime(meeting.sTimestamp)} </strong>to{" "}
            <strong style={{ color: "orange" }}>{formatTime(meeting.eTimestamp, false)}</strong>?
          </Box>,
          "Yes",
          "Cancel"
        )
      ) {
        const trackingQuery = query(
          collection(db, "trackHours"),
          where("uname", "==", student.uname),
          where("day", "==", meeting.day)
        );

        const trackingDocs = await getDocs(trackingQuery);
        if (trackingDocs.docs.length > 0) {
          const trackingDoc = trackingDocs.docs[0];
          const hoursData = trackingDoc.data() as HoursData;

          const _meeting: any = hoursData.shortMeetings.find((m: any) => m.meetingId === meeting.meetingId);
          const totalMinutes = hoursData.totalMinutes - _meeting.duration + (_meeting.previousDuration || 0);
          const meetings = hoursData.shortMeetings.filter((m: any) => m.meetingId !== meeting.meetingId);
          await updateDoc(trackingDoc.ref, { shortMeetings: meetings, totalMinutes });
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!user) return;
    loadListOfStudents();
  }, [db, user]);

  const handleSemesterChange = (event: any) => {
    setSelectedSemester(event.target.value);
  };

  const togglePaidStatus = async (uname: string, semesterId: string) => {
    const batch = writeBatch(db);
    const docQuery = query(
      collection(db, "trackHours"),
      where("uname", "==", uname),
      where("semesterId", "==", semesterId)
    );
    const hoursDocs = await getDocs(docQuery);

    hoursDocs.forEach(doc => {
      batch.update(doc.ref, { paid: !doc.data().paid });
    });
    await batch.commit();
  };

  const toggleMeetingStatus = async (uname: string, semesterId: string, meeting: any) => {
    const students = semesters[semesterId].students;
    const studentIdx = students.findIndex((s: any) => s.uname === uname);

    if (studentIdx !== -1 && meeting.day) {
      const docQuery = query(
        collection(db, "trackHours"),
        where("uname", "==", uname),
        where("semesterId", "==", semesterId),
        where("day", "==", meeting.day)
      );
      const hoursDocs = await getDocs(docQuery);

      await runTransaction(db, async (transaction: any) => {
        for (const doc of hoursDocs.docs) {
          const docRef = doc.ref;
          const docData = (await transaction.get(docRef)).data();
          const currentMeetings = docData?.meetings || [];

          if (currentMeetings.length > 0) {
            currentMeetings[0].attended = !currentMeetings[0].attended;
            let totalMinutes: number = docData?.totalMinutes || 0;

            if (currentMeetings[0].attended) {
              totalMinutes += 60;
            } else {
              totalMinutes -= 60;
            }

            transaction.update(docRef, { meetings: currentMeetings, totalMinutes });
          }
        }
      });
    }
  };
  const getOverlappedDuration = (trackedMinutes: Timestamp[], sTimestamp: Timestamp, eTimestamp: Timestamp): number => {
    let trackedTimeInRange = 0;

    const startTime = new Date(sTimestamp.seconds * 1000 + sTimestamp.nanoseconds / 1000000);
    const endTime = new Date(eTimestamp.seconds * 1000 + eTimestamp.nanoseconds / 1000000);

    trackedMinutes.sort(
      (a, b) => a.seconds * 1000 + a.nanoseconds / 1000000 - (b.seconds * 1000 + b.nanoseconds / 1000000)
    );

    let previousTrackedTime: Date | null = null;

    trackedMinutes.forEach(timestamp => {
      const trackTime = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);

      if (trackTime >= startTime && trackTime <= endTime) {
        if (previousTrackedTime) {
          const diffInMillis = trackTime.getTime() - previousTrackedTime.getTime();
          const diffInMinutes = diffInMillis / (1000 * 60);

          if (diffInMinutes < 5) {
            trackedTimeInRange += diffInMinutes;
          } else {
            trackedTimeInRange += 1;
          }
        } else {
          trackedTimeInRange += 1;
        }
        previousTrackedTime = trackTime;
      }
    });

    return trackedTimeInRange;
  };

  const renderTable = () => {
    let studentsList: any = [];

    if (selectedSemester && semesters[selectedSemester]) {
      studentsList = semesters[selectedSemester].students;
    } else {
      Object.values(semesters).forEach((semester: any) => {
        studentsList = studentsList.concat(semester.students);
      });
    }

    if (!adminView && Object.keys(semesters).length <= 0) return null;

    const handleOpenDialog = (student: any) => {
      setSelectedStudentForMeeting(student);
      setDialogOpen(true);
    };

    const handleCloseDialog = () => {
      setDialogOpen(false);
      setSelectedStudent(null);
    };
    const getActivityTimeStamps = (aDate: Dayjs, sTime: Dayjs, eTime: Dayjs) => {
      const year = aDate.year();
      const month = aDate.month();
      const date = aDate.date();
      const formattedDay = aDate.format("DD-MM-YYYY");

      const startHours = sTime.hour();
      const startMinutes = sTime.minute();
      const endHours = eTime.hour();
      const endMinutes = eTime.minute();

      const stTime = new Date(year, month, date, startHours, startMinutes);
      const etTime = new Date(year, month, date, endHours, endMinutes);

      const sTimestamp = Timestamp.fromDate(stTime);
      const eTimestamp = Timestamp.fromDate(etTime);

      return { sTimestamp, eTimestamp, formattedDay };
    };

    const handleSaveShortMeeting = async () => {
      try {
        if (!activityDate) {
          return;
        }
        if (!startTime || !endTime) {
          await confirmIt(`The start and end of the meeting time is required.`, "OK", "");
          return;
        }
        const { sTimestamp, eTimestamp, formattedDay } = getActivityTimeStamps(activityDate, startTime, endTime);
        const trackingQuery = query(
          collection(db, "trackHours"),
          where("uname", "==", selectedStudentForMeeting.uname),
          where("day", "==", formattedDay)
        );

        const trackingDocs = await getDocs(trackingQuery);
        const duration = endTime.diff(startTime, "minutes");

        if (duration < 0 || isNaN(duration)) {
          await confirmIt(`The start time cannot be after the end time. Please select another time`, "OK", "");
          return;
        }
        if (duration === 0) {
          await confirmIt(
            `The duration of the meeting must be greater than 0 minutes. Please select another time`,
            "OK",
            ""
          );
          return;
        }
        const meetingId = newId(db);
        if (trackingDocs.docs.length > 0) {
          const trackingData = trackingDocs.docs[0].data();
          const shortMeetings: Meeting[] = trackingData.shortMeetings || [];

          const overlappingMeeting = shortMeetings.find(
            meeting => sTimestamp < meeting.eTimestamp && eTimestamp > meeting.sTimestamp
          );

          if (overlappingMeeting) {
            await confirmIt(
              <Box>
                The time you've selected overlaps with another meeting starting at{" "}
                <strong style={{ color: "orange" }}>{formatTime(overlappingMeeting.sTimestamp)}</strong> and ending at{" "}
                <strong style={{ color: "orange" }}>{formatTime(overlappingMeeting.eTimestamp)}</strong>. Please select
                another time.
              </Box>,
              "OK",
              ""
            );
            return;
          }
          const overlappedDuration = getOverlappedDuration(trackingData.trackedMinutes, sTimestamp, eTimestamp);
          shortMeetings.push({
            sTimestamp,
            eTimestamp,
            duration,
            meetingId,
            day: formattedDay,
            previousDuration: overlappedDuration,
          });
          const docRef = trackingDocs.docs[0].ref;
          await updateDoc(docRef, {
            shortMeetings,
            totalMinutes: trackingData.totalMinutes + Math.max(0, duration) - overlappedDuration,
          });
        } else {
          const newDocumentRef = doc(collection(db, "trackHours"));
          const newDocument = {
            day: formattedDay,
            totalMinutes: Math.max(0, duration),
            trackedMinutes: [],
            uname: selectedStudentForMeeting.uname,
            lName: selectedStudentForMeeting.lName,
            imageUrl: selectedStudentForMeeting.imageUrl,
            email: selectedStudentForMeeting.email,
            chooseUname: false,
            fName: selectedStudentForMeeting.fName,
            semesterId: selectedStudentForMeeting.semesterId,
            semesterName: selectedStudentForMeeting.semesterName,
            lastActionTime: new Date(),
            createdAt: new Date(),
            shortMeetings: [
              {
                sTimestamp,
                eTimestamp,
                duration,
                meetingId,
                day: formattedDay,
              },
            ],
          };
          setDoc(newDocumentRef, newDocument);
        }
        setDialogOpen(false);
        setSelectedStudent(null);
      } catch (error) {
        console.error("Error saving meeting:", error);
      }
    };

    return (
      <TableContainer component={Paper} sx={{ overflow: "auto", height: "100vh", width: "auto", pb: "156px" }}>
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
              <TableCell>Intern</TableCell>
              <TableCell>Hours Tracked</TableCell>
              {Object.keys(semesters).length > 2 && <TableCell>Course</TableCell>}
              <TableCell>Meetings</TableCell>
              {((user?.claims?.leading as any) || []).length > 0 && <TableCell>1:1 Meetings</TableCell>}
              <TableCell>Paid</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {studentsList.map((student: any) => {
              return (
                <TableRow key={student.uname} style={{ textDecoration: "none", cursor: "pointer" }}>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: "15px" }}>
                      <Box
                        id={`${student.uname}-picture`}
                        sx={{ "& img": { borderRadius: "50%" }, borderRadius: "8px" }}
                      >
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
                      <Link
                        onClick={() => {
                          setSelectedStudent(student.uname);
                        }}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {student.fName} {student.lName}
                      </Link>
                    </Box>
                  </TableCell>
                  <TableCell>{roundNum(student?.hours || 0)}</TableCell>
                  {Object.keys(semesters).length > 2 && <TableCell>{student.semesterName}</TableCell>}
                  <TableCell>
                    {(student.meetings || []).map((meeting: any, meetingIdx: number) => (
                      <Box
                        key={`${student.uname}-meeting-${meetingIdx}`}
                        sx={{ display: "flex", alignItems: "center" }}
                      >
                        <Typography>{meeting.day}</Typography>
                        <Checkbox
                          checked={meeting.attended}
                          onChange={() => {
                            toggleMeetingStatus(student.uname, student.semesterId, meeting);
                          }}
                          sx={{
                            color: adminView ? "green" : "primary.main",
                            "&.Mui-disabled": {
                              color: meeting.attended ? "green" : "gray",
                            },
                            "& .MuiSvgIcon-root": {
                              color: adminView ? (meeting.attended ? "green" : "gray") : "primary.main",
                            },
                          }}
                          disabled={!((user?.claims?.leading as any) || []).includes(student.semesterId)}
                        />
                      </Box>
                    ))}
                  </TableCell>
                  {
                    <TableCell>
                      {(student.shortMeetings || []).map((meeting: Meeting, meetingIdx: number) => {
                        return (
                          <Box
                            key={`${student.uname}-meeting-${meetingIdx}`}
                            sx={{ display: "flex", alignItems: "center", gap: "5px" }}
                          >
                            <Typography /* sx={{ fontSize: "10px" }} */>
                              - <strong>{meeting.day}</strong>: {formatTime(meeting.sTimestamp, false)} -{" "}
                              {formatTime(meeting.eTimestamp)}
                            </Typography>
                            {((user?.claims?.leading as any) || []).includes(student.semesterId) && (
                              <DeleteIcon
                                sx={{ ":hover": { cursor: "pointer", color: "orange" } }}
                                onClick={() => handleDeleteShortMeeting(student, meeting)}
                              />
                            )}
                          </Box>
                        );
                      })}
                      {((user?.claims?.leading as any) || []).includes(student.semesterId) && (
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleOpenDialog(student)}
                          sx={{ mt: "15px" }}
                        >
                          Add 1:1 Meeting
                        </Button>
                      )}
                    </TableCell>
                  }
                  <TableCell>
                    <Checkbox
                      checked={student.paid}
                      onChange={() => togglePaidStatus(student.uname, student.semesterId)}
                      disabled={!adminView || roundNum(student.hours) === 0}
                      sx={{
                        color: !adminView || roundNum(student.hours) === 0 ? "green" : "primary.main",
                        "&.Mui-disabled": {
                          color: student.paid ? "green" : "gray",
                        },
                        "& .MuiSvgIcon-root": {
                          color:
                            !adminView || roundNum(student.hours) === 0
                              ? student.paid
                                ? "green"
                                : "gray"
                              : "primary.main",
                        },
                      }}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <Dialog open={dialogOpen} onClose={handleCloseDialog} sx={{ zIndex: 9998 }}>
          <DialogTitle>Add 1:1 Meeting</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Enter the details of the 1:1 meeting with{" "}
              <strong style={{ color: "orange" }}>
                {selectedStudentForMeeting.fName} {selectedStudentForMeeting.lName}
              </strong>
              :
            </DialogContentText>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Box sx={{ display: "flex", mt: "25px", gap: "12px" }}>
                <Box className="ActivityDateTimePicker">
                  <DatePicker
                    label="Meeting Date"
                    value={activityDate}
                    onChange={newValue => {
                      setActivityDate(newValue);
                    }}
                    renderInput={params => <TextField {...params} />}
                    PopperProps={{
                      sx: {
                        zIndex: "9999",
                      },
                    }}
                  />
                </Box>
                <Box className="ActivityDateTimePicker">
                  <TimePicker
                    className="ActivityDateTimePicker"
                    label="Start Time"
                    value={startTime}
                    onChange={newValue => {
                      setStartTime(newValue);
                    }}
                    renderInput={params => <TextField {...params} />}
                    PopperProps={{
                      sx: {
                        zIndex: "9999",
                      },
                    }}
                  />
                </Box>
                <Box className="ActivityDateTimePicker">
                  <TimePicker
                    className="ActivityDateTimePicker"
                    label="End Time"
                    value={endTime}
                    onChange={newValue => {
                      setEndTime(newValue);
                    }}
                    renderInput={params => <TextField {...params} />}
                    PopperProps={{
                      sx: {
                        zIndex: "9999",
                      },
                    }}
                  />
                </Box>
              </Box>
            </LocalizationProvider>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="primary">
              Cancel
            </Button>
            <Button onClick={handleSaveShortMeeting} color="primary">
              Add
            </Button>
          </DialogActions>
        </Dialog>
      </TableContainer>
    );
  };

  return (
    <Box>
      {selectedStudent ? (
        <StudentDetailHoursTracking uname={selectedStudent} setSelectedStudent={setSelectedStudent} />
      ) : (
        <Box
          sx={{
            background: theme =>
              theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG900 : DESIGN_SYSTEM_COLORS.gray100,
            height: "100vh",
            width: "100%",
          }}
        >
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
        </Box>
      )}
      {ConfirmDialog}
    </Box>
  );
};

export default TrackingHours;
