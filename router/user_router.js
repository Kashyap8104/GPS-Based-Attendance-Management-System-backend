


const express = require('express');
const User = require('../model/UserSchema');
const mongoose = require('mongoose');
// const attendanceSchema = require('../model/AttendanceSchema');
// 
var address = require('address');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();

const attendanceSchema = new mongoose.Schema({
    username: String,
    location: { type: { type: String }, coordinates: [Number] },
    timestamp: { type: Date, default: Date.now },
    status: { type: String, enum: ['Present', 'Absent'], default: 'Absent' },
  });
  
//   Register the attendance schema as a model
  const Attendance = mongoose.model('Attendance', attendanceSchema);

router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const macAddress = await new Promise((resolve, reject) => {
    address.mac(function (err, address) {
      if (err) reject(err);
      else resolve(address);
    });
  });
  try {
    // Hash the password with 10 rounds of salt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save the hashed password and username in your database
    const newUser = new User({
      username,
      password: hashedPassword,
      macAddress,
    });
    await newUser.save();

    // Dynamically create a new collection for the user's attendance records
    // const attendanceCollectionNames = `${username}_attendance`; // Use a consistent naming convention
    // await mongoose.connection.createCollection(attendanceCollectionName);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error saving user' });
  }
});



  // Login User
  router.post('/login', async (req, res) => {
    const { username, password } = req.body;
  
    try {
      // Find user by username
      const user = await User.findOne({ username });
  
      // Check if user exists and validate password
      if (!user) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }
  
      // Validate password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }
  
      // Generate JWT token
      const token = jwt.sign({ id: user.id, username: user.username }, 'secret', { expiresIn: '1h' });
  
      res.json({ token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error during login' });
    }
  });
  
  

  router.post('/mark-attendance', async (req, res) => {
    try {
      const { username, latitude, longitude, status} = req.body; // Ensure these are correctly sent from the frontend
  
      // Attempt to get the MAC address of the device making the request
      const macAddress = await new Promise((resolve, reject) => {
        address.mac(function (err, address) {
          if (err) reject(err);
          else resolve(address);
        });
      });
  
      // Fetch user from the database based on username
      const user = await User.findOne({ username });
  
      // Check if the user exists and if the MAC address matches
      if (user && user.macAddress === macAddress) {
        // If the MAC addresses match, mark attendance as` "Present"
        const attendanceCollectionName =   `${username}_attendance`;
      const Attendance = mongoose.model(attendanceCollectionName, attendanceSchema);
        const newAttendance = new Attendance({
          username,
          location: { type: 'Point', coordinates: [latitude, longitude] },
          status
        });
  
        await newAttendance.save();
        res.json({ message: 'Attendance marked successfully' });
      } else {
        // If the MAC addresses do not match or the user does not exist, mark attendance as "Absent"
        const newAttendance = new Attendance({
          username,
          location: { type: 'Point', coordinates: [latitude, longitude] },
          status
        });
  
        await newAttendance.save();
        return res.status(200).send('Attendance marked as Absent due to MAC address mismatch or user not found');
      }
    } catch (error) {
      console.error('Mark attendance error:', error);
      return res.status(500).send('Error marking attendance');
    }
  });
  




  // Fetch Attendance Records for a User
  router.get('/attendance/:username', async (req, res) => {
      const { username } = req.params;
    
      try {
        // Dynamically generate the collection name based on the username
        const attendanceCollectionName = `${username}_attendance`;
    
        // Define Attendance Model for the specific user
        const Attendance = mongoose.model(attendanceCollectionName, attendanceSchema);
    
        // Fetch attendance records from the dynamic collection
        const attendanceRecords = await Attendance.find();
        res.json({ attendanceRecords });
      } catch (error) {
        console.error('Fetch attendance records error:', error);
        res.status(500).json({ message: 'Error fetching attendance records' });
      }
    });

    module.exports = router;