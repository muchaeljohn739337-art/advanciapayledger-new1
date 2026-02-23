// ── Mocks (must be declared before any imports) ──────────────────────────────

jest.mock('../lib/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock('../services/emailService', () => ({
  emailService: {
    sendWelcomeEmail: jest.fn().mockResolvedValue(true),
    sendPasswordResetEmail: jest.fn().mockResolvedValue(true),
  },
}));

jest.mock('../services/adminNotification.service', () => ({
  adminNotificationService: {
    notifyNewRegistration: jest.fn().mockResolvedValue(undefined),
  },
}));

// ── Imports ───────────────────────────────────────────────────────────────────

import request from 'supertest';
import express from 'express';
import authRouter from '../routes/auth';
import prisma from '../lib/prisma';
import { hashPassword } from '../utils/password';

const prismaMock = prisma as jest.Mocked<typeof prisma>;

// ── App fixture ───────────────────────────────────────────────────────────────

const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);

// ── Helpers ───────────────────────────────────────────────────────────────────

const VALID_PASSWORD = 'StrongPass123!';
const VALID_EMAIL = 'test@example.com';

const makeActiveUser = async (overrides: Record<string, any> = {}) => ({
  id: 'user_1',
  email: VALID_EMAIL,
  password: await hashPassword(VALID_PASSWORD),
  firstName: 'John',
  lastName: 'Doe',
  role: 'USER',
  status: 'ACTIVE',
  emailVerified: true,
  twoFactorEnabled: false,
  lastLoginAt: null,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

// ── POST /register ────────────────────────────────────────────────────────────

describe('POST /api/auth/register', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 400 when required fields are missing', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: VALID_EMAIL });
    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid email format', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'not-an-email',
      password: VALID_PASSWORD,
      firstName: 'John',
      lastName: 'Doe',
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/invalid email/i);
  });

  it('returns 400 for weak password', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: VALID_EMAIL,
      password: 'weak',
      firstName: 'John',
      lastName: 'Doe',
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/password/i);
  });

  it('returns 409 when user already exists', async () => {
    (prismaMock.user.findUnique as jest.Mock).mockResolvedValueOnce({
      id: 'existing',
      email: VALID_EMAIL,
    });

    const res = await request(app).post('/api/auth/register').send({
      email: VALID_EMAIL,
      password: VALID_PASSWORD,
      firstName: 'John',
      lastName: 'Doe',
    });
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/already exists/i);
  });

  it('returns 201 and creates user successfully', async () => {
    (prismaMock.user.findUnique as jest.Mock).mockResolvedValueOnce(null);
    (prismaMock.user.create as jest.Mock).mockResolvedValueOnce({
      id: 'new_user',
      email: VALID_EMAIL,
      firstName: 'John',
      lastName: 'Doe',
      role: 'USER',
      status: 'PENDING_APPROVAL',
      emailVerified: false,
      password: 'hashed',
      emailVerificationToken: 'token_abc',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const res = await request(app).post('/api/auth/register').send({
      email: VALID_EMAIL,
      password: VALID_PASSWORD,
      firstName: 'John',
      lastName: 'Doe',
    });

    expect(res.status).toBe(201);
    expect(res.body.requiresApproval).toBe(true);
    // Password must not be returned
    expect(res.body.user.password).toBeUndefined();
  });
});

// ── POST /login ───────────────────────────────────────────────────────────────

describe('POST /api/auth/login', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 400 when credentials are missing', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.status).toBe(400);
  });

  it('returns 401 when user does not exist', async () => {
    (prismaMock.user.findUnique as jest.Mock).mockResolvedValueOnce(null);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: VALID_EMAIL, password: VALID_PASSWORD });
    expect(res.status).toBe(401);
  });

  it('returns 403 when account is PENDING_APPROVAL', async () => {
    const user = await makeActiveUser({ status: 'PENDING_APPROVAL' });
    (prismaMock.user.findUnique as jest.Mock).mockResolvedValueOnce(user);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: VALID_EMAIL, password: VALID_PASSWORD });
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('PENDING_APPROVAL');
  });

  it('returns 403 when email is not verified', async () => {
    const user = await makeActiveUser({ emailVerified: false });
    (prismaMock.user.findUnique as jest.Mock).mockResolvedValueOnce(user);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: VALID_EMAIL, password: VALID_PASSWORD });
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('EMAIL_NOT_VERIFIED');
  });

  it('returns 401 on wrong password', async () => {
    const user = await makeActiveUser();
    (prismaMock.user.findUnique as jest.Mock).mockResolvedValueOnce(user);
    (prismaMock.user.update as jest.Mock).mockResolvedValue(user);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: VALID_EMAIL, password: 'WrongPassword1!' });
    expect(res.status).toBe(401);
  });

  it('returns 200 with tokens on successful login', async () => {
    const user = await makeActiveUser();
    (prismaMock.user.findUnique as jest.Mock).mockResolvedValueOnce(user);
    (prismaMock.user.update as jest.Mock).mockResolvedValue(user);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: VALID_EMAIL, password: VALID_PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
    expect(res.body.user.password).toBeUndefined();
  });
});

// ── GET /verify-email/:token ──────────────────────────────────────────────────

describe('GET /api/auth/verify-email/:token', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 404 for invalid token', async () => {
    (prismaMock.user.findFirst as jest.Mock).mockResolvedValueOnce(null);
    const res = await request(app).get('/api/auth/verify-email/bad_token');
    expect(res.status).toBe(404);
  });

  it('returns 200 and alreadyVerified=true when already verified', async () => {
    (prismaMock.user.findFirst as jest.Mock).mockResolvedValueOnce({
      id: 'u1',
      emailVerified: true,
    });
    const res = await request(app).get('/api/auth/verify-email/some_token');
    expect(res.status).toBe(200);
    expect(res.body.alreadyVerified).toBe(true);
  });

  it('successfully verifies email and clears token', async () => {
    (prismaMock.user.findFirst as jest.Mock).mockResolvedValueOnce({
      id: 'u1',
      emailVerified: false,
    });
    (prismaMock.user.update as jest.Mock).mockResolvedValueOnce({
      id: 'u1',
      emailVerified: true,
      emailVerificationToken: null,
    });

    const res = await request(app).get('/api/auth/verify-email/valid_token');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    expect(prismaMock.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          emailVerified: true,
          emailVerificationToken: null,
        }),
      })
    );
  });
});

// ── POST /reset-password-request ─────────────────────────────────────────────

describe('POST /api/auth/reset-password-request', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 400 when email is missing', async () => {
    const res = await request(app)
      .post('/api/auth/reset-password-request')
      .send({});
    expect(res.status).toBe(400);
  });

  it('always returns success message (no user disclosure)', async () => {
    (prismaMock.user.findUnique as jest.Mock).mockResolvedValueOnce(null);
    const res = await request(app)
      .post('/api/auth/reset-password-request')
      .send({ email: 'noone@example.com' });
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/reset link/i);
  });

  it('sends reset email for ACTIVE users', async () => {
    const user = await makeActiveUser();
    (prismaMock.user.findUnique as jest.Mock).mockResolvedValueOnce(user);

    const { emailService } = require('../services/emailService');
    const res = await request(app)
      .post('/api/auth/reset-password-request')
      .send({ email: VALID_EMAIL });

    expect(res.status).toBe(200);
    // Email is sent asynchronously after res.json() — give it a tick
    await new Promise((r) => setTimeout(r, 50));
    expect(emailService.sendPasswordResetEmail).toHaveBeenCalledWith(
      VALID_EMAIL,
      expect.any(String)
    );
  });
});

// ── POST /logout ──────────────────────────────────────────────────────────────

describe('POST /api/auth/logout', () => {
  it('returns 401 without a token', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.status).toBe(401);
  });

  it('blacklists the token and returns success', async () => {
    // First login to get a real token
    const user = await makeActiveUser();
    (prismaMock.user.findUnique as jest.Mock).mockResolvedValueOnce(user);
    (prismaMock.user.update as jest.Mock).mockResolvedValue(user);

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: VALID_EMAIL, password: VALID_PASSWORD });
    const { accessToken } = loginRes.body;

    const logoutRes = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(logoutRes.status).toBe(200);

    // Using the same token again should be rejected
    const againRes = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(againRes.status).toBe(401);
  });
});
