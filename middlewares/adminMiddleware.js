
const jwt = require('jsonwebtoken');

function authenticateAdmin(req, res, next) {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: 'Authorization token is required' });
  }
  try {
    const decoded = jwt.verify(token, 'secretKey');
    req.adminId = decoded.adminId;
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: 'Invalid token' });
  }
}

module.exports = {
  authenticateAdmin,
};
