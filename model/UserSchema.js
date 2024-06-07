



const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  macAddress: {
    type: String,
    required: true,
    unique: true // Assuming each user should have a unique MAC address
  }
});
const User = mongoose.model('User', userSchema);

module.exports = User;