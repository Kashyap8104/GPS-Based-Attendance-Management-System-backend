
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const adminRoutes = require('./router/adminRoutes.js');
const userRoutes = require('./router/user_router');
const bcrypt = require('bcrypt');
mongoose.connect('mongodb://localhost:27017/gps_attendance_system', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


const app = express();
app.use(express.json());
app.use(cors());

app.use('/user',userRoutes);
app.use('/admin', adminRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
