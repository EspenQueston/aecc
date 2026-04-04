const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const express = require('express');
const User = require('../models/User');

let mongoServer;
let app;

// Build a minimal test app instead of importing the full server
// (avoids double-connect issues with the real db.js)
function createTestApp() {
  const testApp = express();
  testApp.use(express.json({ extended: false }));
  testApp.use('/api/auth', require('../routes/api/auth'));
  testApp.use('/api/users', require('../routes/api/users'));
  return testApp;
}

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  app = createTestApp();
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

afterEach(async () => {
  await User.deleteMany({});
});

describe('Auth API', () => {
  const testUser = {
    personal: {
      firstName: 'Test',
      lastName: 'User',
      dateOfBirth: '1995-01-01',
      gender: 'male',
      passportNumber: 'OA1234567',
      phoneNumber: '12345678901',
      wechatId: '12345678901',
      province: 'Brazzaville',
      city: 'Brazzaville',
      lastEntryDate: '2024-01-01'
    },
    academic: {
      university: 'Tsinghua University',
      fieldOfStudy: 'Computer Science',
      degreeLevel: 'master',
      yearOfAdmission: 2024,
      expectedGraduation: '2026-06-01',
      scholarshipStatus: 'yes',
      scholarshipType: 'Chinese Government Scholarship',
      studentId: 'STU001'
    },
    account: {
      email: 'test@example.com',
      password: 'Test1234!'
    }
  };

  describe('POST /api/users - Register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/users')
        .send(testUser)
        .expect(200);

      expect(res.body).toHaveProperty('token');
    });

    it('should not register with duplicate email', async () => {
      await request(app).post('/api/users').send(testUser);

      const res = await request(app)
        .post('/api/users')
        .send(testUser)
        .expect(400);

      expect(res.body.errors[0].msg).toMatch(/already exists/i);
    });

    it('should require email', async () => {
      const noEmail = JSON.parse(JSON.stringify(testUser));
      noEmail.account.email = '';

      const res = await request(app)
        .post('/api/users')
        .send(noEmail)
        .expect(400);

      expect(res.body.errors).toBeDefined();
    });

    it('should require password of 8+ characters', async () => {
      const shortPwd = JSON.parse(JSON.stringify(testUser));
      shortPwd.account.password = 'short';

      const res = await request(app)
        .post('/api/users')
        .send(shortPwd)
        .expect(400);

      expect(res.body.errors).toBeDefined();
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/users').send(testUser);
    });

    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'Test1234!' })
        .expect(200);

      expect(res.body).toHaveProperty('token');
      expect(res.body.user.email).toBe('test@example.com');
    });

    it('should reject invalid password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'wrongpassword' })
        .expect(400);

      expect(res.body.errors[0].msg).toMatch(/invalid credentials/i);
    });

    it('should reject non-existent user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nonexistent@example.com', password: 'Test1234!' })
        .expect(400);

      expect(res.body.errors[0].msg).toMatch(/invalid credentials/i);
    });
  });

  describe('GET /api/auth - Get user', () => {
    it('should return user data with valid token', async () => {
      const regRes = await request(app).post('/api/users').send(testUser);
      const token = regRes.body.token;

      const res = await request(app)
        .get('/api/auth')
        .set('x-auth-token', token)
        .expect(200);

      expect(res.body.email).toBe('test@example.com');
      expect(res.body).not.toHaveProperty('password');
    });

    it('should reject request without token', async () => {
      const res = await request(app)
        .get('/api/auth')
        .expect(401);

      expect(res.body.msg).toMatch(/no token/i);
    });
  });
});
