const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  // Personal Information
  firstName: {
    type: String,
    required: [true, 'Please add first name']
  },
  lastName: {
    type: String,
    required: [true, 'Please add last name']
  },
  secondName: String,
  dateOfBirth: {
    type: Date,
    required: [true, 'Please add date of birth']
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  },
  passportNumber: {
    type: String,
    required: [true, 'Please add passport number'],
    unique: true,
    match: [/^OA\d{7}$/, 'Passport must start with OA followed by 7 digits']
  },
  phoneNumber: {
    type: String,
    required: [true, 'Please add phone number']
  },
  wechatId: {
    type: String,
    required: [true, 'Please add WeChat ID']
  },
  province: String,
  city: String,
  lastEntryDate: {
    type: Date,
    required: [true, 'Please add last entry date']
  },

  // Academic Information
  university: {
    type: String,
    required: [true, 'Please add university']
  },
  fieldOfStudy: {
    type: String,
    required: [true, 'Please add field of study']
  },
  degreeLevel: {
    type: String,
    enum: ['bachelor', 'master', 'phd', 'language', 'other'],
    required: true
  },
  yearOfAdmission: Number,
  expectedGraduation: {
    type: Date,
    required: [true, 'Please add expected graduation date']
  },
  scholarshipStatus: {
    type: String,
    enum: ['yes', 'no'],
    required: true
  },
  scholarshipType: {
    type: String,
    enum: [
      'Chinese Government Scholarship',
      'Provincial Government Scholarship',
      'Municipality Scholarship',
      'University Scholarship',
      'Enterprise Scholarship',
      'Congolese Government Scholarship',
      'other'
    ],
    required: function() {
      return this.scholarshipStatus === 'yes';
    }
  },
  studentId: String,

  // File Uploads
  passportFile: String,
  visaFile: String,
  admissionFile: String,

  // Account Information
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 8,
    select: false
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
