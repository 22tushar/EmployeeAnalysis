const fs = require('fs');
const readline = require('readline');

// Constants for time thresholds
const MIN_CONSECUTIVE_WORK_DAYS = 7;
const MIN_TIME_BETWEEN_SHIFTS = 1; // in hours
const MAX_SHIFT_HOURS = 14;

// Helper function to calculate the time difference between two timestamps
function calculateTimeDifference(startTime, endTime) {
  const start = new Date(startTime);
  const end = new Date(endTime);
  return (end - start) / 3600000; // Convert to hours
}

const inputFile = 'employee_data.txt'; // Replace with your file path

const rl = readline.createInterface({
  input: fs.createReadStream(inputFile),
  crlfDelay: Infinity,
});

let currentEmployee = '';
let consecutiveDays = 0;
let employeeShifts = [];

rl.on('line', (line) => {
  if (line.trim()) {
    const [positionID, positionStatus, startTime, endTime, timecardHours, payCycleStart, payCycleEnd, employeeName, fileNumber] = line.split('\t');

    if (currentEmployee !== employeeName) {
      currentEmployee = employeeName;
      consecutiveDays = 1;
      employeeShifts = [];
    } else {
      consecutiveDays++;
    }

    if (employeeShifts.length > 0) {
      const timeBetweenShifts = calculateTimeDifference(employeeShifts[employeeShifts.length - 1][1], startTime);
      if (timeBetweenShifts > MIN_TIME_BETWEEN_SHIFTS && timeBetweenShifts < 10) {
        console.log(`${employeeName} has less than 10 hours between shifts on ${startTime}`);
      }
    }

    if (consecutiveDays === MIN_CONSECUTIVE_WORK_DAYS) {
      console.log(`${employeeName} has worked for 7 consecutive days.`);
    }

    const shiftHours = parseFloat(timecardHours.replace(':', '.'));
    if (shiftHours > MAX_SHIFT_HOURS) {
      console.log(`${employeeName} worked for more than 14 hours on ${startTime}`);
    }

    employeeShifts.push([startTime, endTime]);
  }
});
