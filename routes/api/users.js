const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const config = require('config');
const multer = require('multer');
const path = require('path');

// Configure file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './uploads/')
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ storage });

// @route    POST api/users
// @desc     Register user
// @access   Public
router.post(
  '/',
  upload.fields([
    { name: 'passportFile', maxCount: 1 },
    { name: 'visaFile', maxCount: 1 },
    { name: 'admissionFile', maxCount: 1 }
  ]),
  [
    check('personal.firstName', 'First name is required').not().isEmpty(),
    check('personal.lastName', 'Last name is required').not().isEmpty(),
    check('account.email', 'Please include a valid email').isEmail(),
    check('account.password', 'Please enter a password with 8 or more characters').isLength({ min: 8 }),
    check('personal.dateOfBirth', 'Please enter a valid date of birth').isDate(),
    check('personal.gender', 'Please select a gender').isIn(['male', 'female', 'other']),
    check('personal.passportNumber', 'Please enter a valid passport number').matches(/^OA\d{7}$/),
    check('personal.phoneNumber', 'Please enter a valid phone number').matches(/^\d{11}$/),
    check('personal.wechatId', 'Please enter a valid WeChat ID').matches(/^\d{11}$/),
    check('personal.province', 'Please select a province').not().isEmpty(),
    check('personal.city', 'Please select a city').not().isEmpty(),
    check('personal.lastEntryDate', 'Please enter a valid last entry date').isDate(),
    check('academic.university', 'Please enter a valid university').not().isEmpty(),
    check('academic.fieldOfStudy', 'Please enter a valid field of study').not().isEmpty(),
    check('academic.degreeLevel', 'Please select a degree level').not().isEmpty(),
    check('academic.yearOfAdmission', 'Please enter a valid year of admission').isNumeric(),
    check('academic.expectedGraduation', 'Please enter a valid expected graduation date').isDate(),
    check('academic.scholarshipStatus', 'Please select a scholarship status').not().isEmpty(),
    check('academic.scholarshipType', 'Please select a scholarship type').not().isEmpty(),
    check('academic.studentId', 'Please enter a valid student ID').not().isEmpty()
  ],
  async (req, res) => {
    console.log('Received form data:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { personal, academic, account } = req.body;

    try {
      // Check if user exists
      let user = await User.findOne({ 
        $or: [
          { email: account.email },
          { passportNumber: personal.passportNumber }
        ]
      });

      if (user) {
        return res.status(400).json({
          errors: [{ msg: 'User already exists with this email or passport number' }]
        });
      }

      // Create new user
      user = new User({
        ...personal,
        ...academic,
        email: account.email,
        password: account.password,
        passportFile: req.files?.passportFile?.[0]?.path,
        visaFile: req.files?.visaFile?.[0]?.path,
        admissionFile: req.files?.admissionFile?.[0]?.path
      });

      await user.save();

      // Return jsonwebtoken
      const payload = {
        user: {
          id: user.id,
          role: user.role
        }
      };

      jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: '5 days' },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;
