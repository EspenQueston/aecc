const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const multer = require('multer');
const path = require('path');
const { registerUser, verifyEmail, resendVerification, adminCreateUser, getUsers, getUserById, updateUser, deleteUser } = require('../../controllers/userController');
const adminAuth = require('../../middleware/adminAuth');

// Configure file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads/'));
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
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
    check('personal.phoneNumber', 'Please enter a valid phone number').isLength({ min: 7 }),
    check('personal.wechatId', 'Please enter a valid WeChat ID').isLength({ min: 3 }),
    check('personal.province', 'Please select a province').not().isEmpty(),
    check('personal.city', 'Please select a city').not().isEmpty(),
    check('personal.lastEntryDate', 'Please enter a valid last entry date').isDate(),
    check('academic.university', 'Please enter a valid university').not().isEmpty(),
    check('academic.fieldOfStudy', 'Please enter a valid field of study').not().isEmpty(),
    check('academic.degreeLevel', 'Please select a degree level').not().isEmpty(),
    check('academic.expectedGraduation', 'Please enter a valid expected graduation date').isDate(),
    check('academic.scholarshipStatus', 'Please select a scholarship status').not().isEmpty()
  ],
  registerUser
);

// @route    GET api/users/verify-email/:token
// @desc     Verify email address
// @access   Public
router.get('/verify-email/:token', verifyEmail);

// @route    POST api/users/resend-verification
// @desc     Resend verification email
// @access   Public
router.post('/resend-verification', resendVerification);

// @route    POST api/users/admin-create
// @desc     Admin create user (simplified)
// @access   Private/Admin
router.post('/admin-create', adminAuth, adminCreateUser);

// @route    GET api/users
// @desc     Get all users (admin)
// @access   Private/Admin
router.get('/', adminAuth, getUsers);

// @route    GET api/users/:id
// @desc     Get user by ID (admin)
// @access   Private/Admin
router.get('/:id', adminAuth, getUserById);

// @route    PUT api/users/:id
// @desc     Update user (admin)
// @access   Private/Admin
router.put('/:id', adminAuth, updateUser);

// @route    DELETE api/users/:id
// @desc     Delete user (admin)
// @access   Private/Admin
router.delete('/:id', adminAuth, deleteUser);

module.exports = router;
