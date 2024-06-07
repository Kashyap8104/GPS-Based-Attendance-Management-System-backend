const mongoose = require('mongoose');
const attendanceSchema = new mongoose.Schema({
    username: String,
    location: { type: { type: String }, coordinates: [Number] },
    timestamp: { type: Date, default: Date.now },
    status: { type: String, enum: ['Present', 'Absent']},
  });

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance