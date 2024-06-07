const Attendance = require('../../attendace/models/Attendancefinal');

async function fetchAllAttendance() {
  return await Attendance.find();
}

async function fetchUserAttendance(username) {
  return await Attendance.find({ username });
}

module.exports = { fetchAllAttendance, fetchUserAttendance };