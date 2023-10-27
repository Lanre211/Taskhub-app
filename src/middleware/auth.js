const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Import the User model

const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization'); // Get the token from the Authorization header

  // Check if a token is provided
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  // Split the token into the bearer token type and the actual token
  const [bearer, tokenValue] = token.split(' ');

  // Check if the token is of the correct type
  if (bearer !== 'Bearer') {
    return res.status(401).json({ error: 'Invalid token. Token must be of the Bearer type.' });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(tokenValue, process.env.SECRET_KEY);

    // Find the user associated with the token
    const user = await User.findById(decoded.userId);

    // Check if the user exists
    if (!user) {
      return res.status(401).json({ error: 'Invalid token. User not found.' });
    }

    // Set the authenticated user in the request for further processing
    req.user = user;
    next(); // Continue to the next middleware or route handler
  } catch (error) {
    // Handle token verification errors
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired.' });
    } else {
      return res.status(401).json({ error: 'Invalid token.' });
    }
  }
};

module.exports = authMiddleware;
