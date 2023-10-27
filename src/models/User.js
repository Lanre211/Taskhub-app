const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
// Import the mongoose and bcrypt packages.
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Create a new mongoose schema for the user model.
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    // Use a stronger hash algorithm, such as bcryptjs.
    // This will make it more difficult for attackers to crack the passwords.
    // See https://github.com/kezhenxu/bcrypt.js for more information.
    hash: {
      type: String,
      required: true,
    },
  },
  // Add a timestamp field to track when the user was created and updated.
  // This can be useful for debugging and troubleshooting purposes.
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Add a pre-save hook to re-hash the user's password if it has been changed.
userSchema.pre('save', async function (next) {
  try {
    // If the password has been changed, re-hash it.
    if (this.isModified('password')) {
      this.hash = await bcrypt.hash(this.password, 12);
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Add a method to the user model to compare the user's password with the hashed password in the database.
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.hash);
};

// Export the user model.
module.exports = mongoose.model('User', userSchema);