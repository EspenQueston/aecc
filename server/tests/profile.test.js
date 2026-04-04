const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const express = require('express');
const User = require('../models/User');
const Profile = require('../models/Profile');

let mongoServer;
let app;
let userToken;
let userId;

function createTestApp() {
  const testApp = express();
  testApp.use(express.json({ extended: false }));
  testApp.use('/api/auth', require('../routes/api/auth'));
  testApp.use('/api/users', require('../routes/api/users'));
  testApp.use('/api/profile', require('../routes/api/profile'));
  return testApp;
}

const testUser = {
  personal: {
    firstName: 'Profile',
    lastName: 'Tester',
    dateOfBirth: '1996-05-15',
    gender: 'female',
    passportNumber: 'OA7654321',
    phoneNumber: '98765432101',
    wechatId: '98765432101',
    province: 'Kinshasa',
    city: 'Kinshasa',
    lastEntryDate: '2024-02-01'
  },
  academic: {
    university: 'Peking University',
    fieldOfStudy: 'Medicine',
    degreeLevel: 'phd',
    yearOfAdmission: 2023,
    expectedGraduation: '2027-06-01',
    scholarshipStatus: 'no',
    scholarshipType: 'other',
    studentId: 'STU002'
  },
  account: {
    email: 'profile@test.com',
    password: 'Profile123!'
  }
};

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  app = createTestApp();

  // Register a user to get a token
  const res = await request(app).post('/api/users').send(testUser);
  userToken = res.body.token;

  const userRes = await request(app)
    .get('/api/auth')
    .set('x-auth-token', userToken);
  userId = userRes.body._id;
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe('Profile API', () => {
  afterEach(async () => {
    await Profile.deleteMany({});
  });

  describe('POST /api/profile - Create/Update Profile', () => {
    it('should create a profile', async () => {
      const res = await request(app)
        .post('/api/profile')
        .set('x-auth-token', userToken)
        .send({
          bio: 'PhD student in Medicine',
          yearOfStudy: '2nd year',
          skills: 'Research, Surgery'
        })
        .expect(200);

      expect(res.body.bio).toBe('PhD student in Medicine');
      expect(res.body.user).toBeDefined();
    });

    it('should update existing profile', async () => {
      await request(app)
        .post('/api/profile')
        .set('x-auth-token', userToken)
        .send({ bio: 'Initial bio' });

      const res = await request(app)
        .post('/api/profile')
        .set('x-auth-token', userToken)
        .send({ bio: 'Updated bio' })
        .expect(200);

      expect(res.body.bio).toBe('Updated bio');
    });

    it('should reject without auth token', async () => {
      await request(app)
        .post('/api/profile')
        .send({ bio: 'No auth' })
        .expect(401);
    });
  });

  describe('GET /api/profile/me - Get current user profile', () => {
    it('should return current user profile', async () => {
      await request(app)
        .post('/api/profile')
        .set('x-auth-token', userToken)
        .send({ bio: 'My profile' });

      const res = await request(app)
        .get('/api/profile/me')
        .set('x-auth-token', userToken)
        .expect(200);

      expect(res.body.bio).toBe('My profile');
    });

    it('should return 404 if no profile', async () => {
      const res = await request(app)
        .get('/api/profile/me')
        .set('x-auth-token', userToken)
        .expect(400);
    });
  });

  describe('GET /api/profile - Get all profiles', () => {
    it('should return paginated profiles', async () => {
      await request(app)
        .post('/api/profile')
        .set('x-auth-token', userToken)
        .send({ bio: 'Public profile' });

      const res = await request(app)
        .get('/api/profile')
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(res.body.pagination).toBeDefined();
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });
});
