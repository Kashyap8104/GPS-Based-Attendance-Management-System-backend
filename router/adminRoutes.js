




const express = require('express');
const Admin = require('../model/AdminSchema'); // Import Admin model
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../model/UserSchema');

const attendanceSchema = new mongoose.Schema({
    username: String,
    location: { type: { type: String }, coordinates: [Number] },
    timestamp: { type: Date, default: Date.now },
    status: { type: String, enum: ['Present', 'Absent'], default: 'Present' },
});
  
// Register the attendance schema as a model
// const Attendance = mongoose.model('Attendance', attendanceSchema);

// Admin registration
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
  
    try {
      // Hash the password with 10 rounds of salt
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Save the hashed password and username in the database
      const newAdmin = new Admin({
        username,
        password: hashedPassword,
      });
      await newAdmin.save();
  
      res.status(201).json({ message: 'Admin registered successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error saving admin' });
    }
});

// Admin login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
  
    try {
      // Find admin by username
      const admin = await Admin.findOne({ username });
  
      // Check if admin exists and validate password
      if (!admin) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }
  
      // Validate password
      const isPasswordValid = await bcrypt.compare(password, admin.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }
  
      // Generate JWT token
      const token = jwt.sign({ id: admin.id, username: admin.username }, 'secret', { expiresIn: '1h' });
  
      res.json({ token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error during login' });
    }
});

// Mark attendance for admin
router.post('/mark-attendance', async (req, res) => {
    const { username, latitude, longitude, status } = req.body;
    console.log(status)
      try {
        // Dynamically generate the collection name based on the username
        const attendanceCollectionName = `${username}_attendances`;
    
        // Define Attendance Model for the specific user
        const Attendance = mongoose.model(attendanceCollectionName, attendanceSchema);
    
        // Save attendance entry to the database
        const newAttendance = new Attendance({
          username,
          location: { type: 'Point', coordinates: [latitude, longitude] },
          status,
        });
    
        await newAttendance.save();
        res.json({ message: 'Attendance marked successfully' });
      } catch (error) {
        console.error('Mark attendance error:', error);
        res.status(500).json({ message: 'Error marking attendance' });
      }
    
});

// Fetch attendance records for admin
// Fetch attendance records for admin
router.get('/attendance/:username', async (req, res) => {
  const { username } = req.params;

  try {
    // Dynamically generate the collection name based on the username
    const attendanceCollectionName = `${username}_attendance`;

    // Define Attendance Model for the specific user
    const Attendance = mongoose.model(attendanceCollectionName, attendanceSchema);

    // Fetch attendance records for the specified user
    const attendanceRecords = await Attendance.find({ username });
    res.json({ attendanceRecords });
  } catch (error) {
    console.error('Fetch attendance records error:', error);
    res.status(500).json({ message: 'Error fetching attendance records' });
  }
});



  router.get('/all-user-attendance', async (req, res) => {
    try {
      // Fetch all users from the User collection
      const allUsers = await User.find({});
  
      // Map through each user to retrieve their attendance records
      const userAttendance = await Promise.all(
        allUsers.map(async (user) => {
          try {
            // Construct the name of the attendance collection for the user
            const attendanceCollectionName = `${user.username}_attendances`;
  
            // Check if the attendance collection exists
            const collections = await mongoose.connection.db.listCollections().toArray();
            const collectionExists = collections.some((collection) => collection.name === attendanceCollectionName);
  
            if (collectionExists) {
              // If the attendance collection exists, fetch attendance records
              const AttendanceModel = mongoose.model(attendanceCollectionName, attendanceSchema); // Define model dynamically
              const attendanceRecords = await AttendanceModel.find({});
  
              return {
                username: user.username,
                attendanceRecords: attendanceRecords
              };
            } else {
              // If the attendance collection doesn't exist, return empty attendance records
              return {
                username: user.username,
                attendanceRecords: []
              };
            }
          } catch (error) {
            console.error(`Error fetching attendance for user ${user.username}:`, error);
            // If an error occurs, return empty attendance records
            return {
              username: user.username,
              attendanceRecords: []
            };
          }
        })
      );
  
      res.json({ userAttendance });
    } catch (error) {
      console.error('Fetch all user attendance error:', error);
      res.status(500).json({ message: 'Error fetching all user attendance' });
    }
  });
  
  
      
module.exports = router;
