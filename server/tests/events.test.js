const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const express = require('express');
const User = require('../models/User');
const Event = require('../models/Event');

let mongoServer;
let app;
let adminToken;

function createTestApp() {
  const testApp = express();
  testApp.use(express.json({ extended: false }));
  testApp.use('/api/auth', require('../routes/api/auth'));
  testApp.use('/api/users', require('../routes/api/users'));
  testApp.use('/api/events', require('../routes/api/events'));
  return testApp;
}

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  app = createTestApp();

  // Create an admin user directly
  const user = new User({
    firstName: 'Admin',
    lastName: 'Test',
    dateOfBirth: new Date('1990-01-01'),
    gender: 'male',
    passportNumber: 'OA0000001',
    phoneNumber: '11111111111',
    wechatId: '11111111111',
    province: 'Brazzaville',
    city: 'Brazzaville',
    lastEntryDate: new Date('2024-01-01'),
    university: 'Test University',
    fieldOfStudy: 'Test',
    degreeLevel: 'master',
    yearOfAdmission: 2024,
    expectedGraduation: new Date('2026-06-01'),
    scholarshipStatus: 'no',
    scholarshipType: 'other',
    studentId: 'ADM001',
    email: 'admin@aecc.org',
    password: 'Admin1234!',
    role: 'admin'
  });
  await user.save();

  // Login as admin
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@aecc.org', password: 'Admin1234!' });
  adminToken = loginRes.body.token;
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

afterEach(async () => {
  await Event.deleteMany({});
});

describe('Events API', () => {
  const sampleEvent = {
    title: 'Test Event',
    description: 'A test event description',
    date: new Date(Date.now() + 86400000).toISOString(), // tomorrow
    location: 'Beijing',
    category: 'social'
  };

  describe('POST /api/events - Create Event', () => {
    it('should create an event with admin auth', async () => {
      const res = await request(app)
        .post('/api/events')
        .set('x-auth-token', adminToken)
        .send(sampleEvent)
        .expect(200);

      expect(res.body.title).toBe('Test Event');
    });

    it('should reject unauthenticated event creation', async () => {
      await request(app)
        .post('/api/events')
        .send(sampleEvent)
        .expect(401);
    });
  });

  describe('GET /api/events - Get Events', () => {
    beforeEach(async () => {
      await Event.create([
        { ...sampleEvent, title: 'Event 1' },
        { ...sampleEvent, title: 'Event 2' },
        { ...sampleEvent, title: 'Event 3' }
      ]);
    });

    it('should return all events', async () => {
      const res = await request(app)
        .get('/api/events')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(3);
    });

    it('should support limit query param', async () => {
      const res = await request(app)
        .get('/api/events?limit=2')
        .expect(200);

      expect(res.body.length).toBeLessThanOrEqual(2);
    });
  });

  describe('GET /api/events/:id - Get Single Event', () => {
    it('should return a single event', async () => {
      const event = await Event.create(sampleEvent);

      const res = await request(app)
        .get(`/api/events/${event._id}`)
        .expect(200);

      expect(res.body.title).toBe('Test Event');
    });

    it('should return 404 for non-existent event', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await request(app)
        .get(`/api/events/${fakeId}`)
        .expect(404);
    });
  });

  describe('DELETE /api/events/:id - Delete Event', () => {
    it('should delete an event with admin auth', async () => {
      const event = await Event.create(sampleEvent);

      await request(app)
        .delete(`/api/events/${event._id}`)
        .set('x-auth-token', adminToken)
        .expect(200);

      const found = await Event.findById(event._id);
      expect(found).toBeNull();
    });
  });
});
