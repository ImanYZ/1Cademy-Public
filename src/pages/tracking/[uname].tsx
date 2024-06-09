import ArrowBackIcon from "@mui/icons-material/ArrowBack";
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
  Typography,
} from "@mui/material";
import { collection, doc, getDoc, getFirestore, onSnapshot, query, where, writeBatch } from "firebase/firestore";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { roundNum } from "src/utils/common.utils";

import { useAuth } from "@/context/AuthContext";
import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";

const StudentDetail = () => {
  const router = useRouter();
  const { uname }: any = router.query;
  const db = getFirestore();
  const [trackingData, setTrackingData] = useState<any[]>([]);
  const [currentStudent, setCurrentStudent] = useState<any>({});
  const [selectedGranularity, setSelectedGranularity] = useState<string>("Month"); // Default to Month
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [availableDays, setAvailableDays] = useState<string[]>([]);
  const [availableWeeks, setAvailableWeeks] = useState<any>([]);
  const [{ user }] = useAuth();
  const adminView = !!user?.claims?.tracking;

  const loadUser = async (uname: string) => {
    const userDoc = await getDoc(doc(collection(db, "users"), uname));
    const userData: any = userDoc.data();
    if (userData) {
      const user = {
        imageUrl: userData.imageUrl,
        fullName: userData.fName + " " + userData.lName,
      };
      setCurrentStudent(user);
    }
  };

  useEffect(() => {
    if (!uname) return;
    const leading: any = user?.claims?.leading || [];

    const queryTrack = query(collection(db, "trackHours"), where("uname", "==", uname));
    const unsubscribe = onSnapshot(queryTrack, snapshot => {
      const data: any = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (!data.length) return;
      if (uname !== user?.uname && !adminView && !leading.includes(data.semesterId)) return;
      setTrackingData(data);

      // Extract available months, days, and weeks from the data
      const monthsSet = new Set<string>();
      const daysSet = new Set<string>();
      const weeksSet = new Set<number>();
      let weekStartDate = new Date(data[0].day); // Assuming data is sorted, get the start date of the first entry
      weekStartDate.setDate(weekStartDate.getDate() - weekStartDate.getDay() + 1); // Adjust to the previous Monday

      data.forEach((entry: any) => {
        // Convert date string to Date object
        const date = new Date(entry.day);
        // Get month name
        const monthName = date.toLocaleDateString("en-US", { month: "long" });
        monthsSet.add(monthName);
        // Get formatted date
        const formattedDate = date.toLocaleDateString("en-US");
        daysSet.add(formattedDate);
        // Calculate week number based on the first tracking date
        const weekNumber = getWeekNumberFromStart(weekStartDate, date);
        weeksSet.add(weekNumber);
      });
      setAvailableMonths(Array.from(monthsSet));
      setAvailableDays(Array.from(daysSet));
      setAvailableWeeks(Array.from(weeksSet));
    });

    loadUser(uname);

    // Clean up listener on unmount
    return () => unsubscribe();
  }, [uname, user]);

  // Function to calculate week number from the first tracking date
  function getWeekNumberFromStart(startDate: Date, currentDate: Date): number {
    const millisecondsInDay = 86400000; // 1000 * 60 * 60 * 24
    return Math.floor((currentDate.getTime() - startDate.getTime()) / (7 * millisecondsInDay)) + 1;
  }

  // Function to filter data based on selected granularity
  const filterData = () => {
    switch (selectedGranularity) {
      case "Month":
        return availableMonths;
      case "Day":
        return availableDays;
      case "Week":
        return availableWeeks;
      default:
        return [];
    }
  };

  // Function to get hours tracked for the selected granularity
  const getHoursTracked = (granularity: string) => {
    const filteredData = trackingData.filter(entry => {
      const date = new Date(entry.day);
      switch (selectedGranularity) {
        case "Month":
          return date.toLocaleDateString("en-US", { month: "long" }) === granularity;
        case "Day":
          return date.toLocaleDateString("en-US") === granularity;
        case "Week":
          return getWeekNumberFromStart(new Date(trackingData[0].day), date) === parseInt(granularity);
        default:
          return false;
      }
    });
    return filteredData.reduce((total, entry) => total + entry.totalMinutes / 60, 0);
  };

  // Function to check if an entry is paid
  const isPaid = (granularity: string) => {
    return trackingData.some(entry => {
      const date = new Date(entry.day);
      switch (selectedGranularity) {
        case "Month":
          return date.toLocaleDateString("en-US", { month: "long" }) === granularity && entry.paid;
        case "Day":
          return date.toLocaleDateString("en-US") === granularity && entry.paid;
        case "Week":
          return getWeekNumberFromStart(new Date(trackingData[0].day), date) === parseInt(granularity) && entry.paid;
        default:
          return false;
      }
    });
  };

  // Function to toggle paid status
  const togglePaidStatus = async (granularity: string) => {
    const batch = writeBatch(db);

    trackingData.forEach(entry => {
      const date = new Date(entry.day);
      let shouldUpdate = false;
      switch (selectedGranularity) {
        case "Month":
          shouldUpdate = date.toLocaleDateString("en-US", { month: "long" }) === granularity;
          break;
        case "Day":
          shouldUpdate = date.toLocaleDateString("en-US") === granularity;
          break;
        case "Week":
          shouldUpdate = getWeekNumberFromStart(new Date(trackingData[0].day), date) === parseInt(granularity);
          break;
        default:
          break;
      }

      if (shouldUpdate) {
        const docRef = doc(db, "trackHours", entry.id);
        batch.update(docRef, { paid: !entry.paid });
      }
    });

    await batch.commit();
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
        <Box sx={{ display: "flex", gap: "15px", pt: "15px" }}>
          {adminView && (
            <Link href="/tracking">
              <Button variant="contained" color="primary" sx={{ mt: "15px" }}>
                <ArrowBackIcon />
              </Button>
            </Link>
          )}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Avatar src={currentStudent.imageUrl} alt={currentStudent.fullName} />
            <Typography variant="h4" gutterBottom sx={{ ml: "5px" }}>
              {currentStudent.fullName}
            </Typography>
          </Box>
          <Box sx={{ marginBottom: 2, ml: "auto" }}>
            <Select
              value={selectedGranularity}
              onChange={event => setSelectedGranularity(event.target.value)}
              variant="outlined"
              sx={{ marginRight: 2 }}
            >
              <MenuItem value="Month">Per Month</MenuItem>
              <MenuItem value="Week">Per Week</MenuItem>
              <MenuItem value="Day">Per Day</MenuItem>
            </Select>
          </Box>
        </Box>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{selectedGranularity}</TableCell>
                <TableCell>Hours Tracked</TableCell>
                {adminView && <TableCell>Paid</TableCell>}
                {adminView && <TableCell>Action</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {filterData().map((entry: any, index: number) => (
                <TableRow key={index}>
                  <TableCell>
                    {/* {selectedGranularity === "Week" ? "Week " : ""} */}
                    {entry}
                  </TableCell>
                  <TableCell>{roundNum(getHoursTracked(entry))}</TableCell>
                  {adminView && (
                    <TableCell>
                      <Checkbox checked={isPaid(entry)} onChange={() => togglePaidStatus(entry)} />
                    </TableCell>
                  )}
                  {adminView && (
                    <TableCell>
                      <Button variant="contained" color="primary" onClick={() => togglePaidStatus(entry)}>
                        Mark as {isPaid(entry) ? "Unpaid" : "Paid"}
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </Box>
  );
};

export default StudentDetail;
