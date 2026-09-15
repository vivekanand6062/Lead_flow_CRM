const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');
const { getLastDevEmail, clearDevEmails } = require('../services/emailService');
const { resetRateLimiter } = require('../middleware/rateLimiter');

const BASE_URL = process.env.API_URL || 'http://localhost:5000/api';

describe('LeadFlow CRM — Password Reset & Session Invalidation Test Suite', () => {
  let adminUser = null;
  let testUser = null;
  let preResetAdminJwt = null;

  before(async () => {
    // Reset rate limiter & dev email queue
    try {
      await fetch(`${BASE_URL}/auth/dev-reset-rate-limit`, { method: 'POST' });
    } catch (e) {}
    resetRateLimiter();
    clearDevEmails();

    // Verify Admin exists
    adminUser = await prisma.user.findUnique({
      where: { email: 'admin@leadflow.com' }
    });
    assert.ok(adminUser, 'Admin user must exist in database');

    // Create a dedicated test user for isolated password reset tests
    const testEmail = 'reset.test.user@leadflow.com';
    await prisma.user.deleteMany({ where: { email: testEmail } });

    testUser = await prisma.user.create({
      data: {
        organizationId: adminUser.organizationId,
        name: 'Reset Test User',
        email: testEmail,
        password: await bcrypt.hash('InitialPass@123', 10),
        role: 'SALES_AGENT',
        department: 'Sales',
        status: 'ACTIVE'
      }
    });
  });

  after(async () => {
    // Cleanup dedicated test user
    if (testUser) {
      await prisma.passwordResetToken.deleteMany({ where: { userId: testUser.id } });
      await prisma.user.deleteMany({ where: { id: testUser.id } });
    }

    // Ensure Admin password is restored to Admin@123 and demo accounts are healthy
    const adminHashed = await bcrypt.hash('Admin@123', 10);
    await prisma.user.update({
      where: { email: 'admin@leadflow.com' },
      data: { password: adminHashed, passwordChangedAt: null }
    });

    resetRateLimiter();
    clearDevEmails();
  });

  // --------------------------------------------------------------------------
  // TEST 1 & TEST 2: Anti-Enumeration & Generic Response
  // --------------------------------------------------------------------------
  test('TEST 1: Registered email -> generic success response', async () => {
    clearDevEmails();
    const res = await fetch(`${BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email })
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.message, 'If an account exists with this email, password reset instructions have been sent.');

    // Verify email simulator captured the token
    const lastEmail = getLastDevEmail();
    assert.ok(lastEmail, 'Email simulator must capture dispatched email');
    assert.equal(lastEmail.to, testUser.email);
    assert.ok(lastEmail.token, 'Simulator must capture raw token');
  });

  test('TEST 2: Unregistered email -> exactly same generic response', async () => {
    const res = await fetch(`${BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nonexistent.user.leadflow@example.com' })
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.message, 'If an account exists with this email, password reset instructions have been sent.');
  });

  // --------------------------------------------------------------------------
  // TEST 3: Valid reset token -> password successfully updated
  // --------------------------------------------------------------------------
  test('TEST 3: Valid reset token -> password successfully updated', async () => {
    // Request reset link for testUser
    clearDevEmails();
    await fetch(`${BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email })
    });

    const devEmail = getLastDevEmail();
    assert.ok(devEmail && devEmail.token, 'Must receive token in simulated email');

    // Submit new password with valid token
    const newPassword = 'NewSecretPass@2026';
    const resetRes = await fetch(`${BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: devEmail.token,
        newPassword
      })
    });

    assert.equal(resetRes.status, 200);
    const resetData = await resetRes.json();
    assert.equal(resetData.success, true);
    assert.ok(resetData.message.includes('Password reset successfully'));

    // Verify database token status is marked used
    const tokenHash = crypto.createHash('sha256').update(devEmail.token).digest('hex');
    const tokenInDb = await prisma.passwordResetToken.findUnique({
      where: { tokenHash }
    });
    assert.ok(tokenInDb, 'Token record must exist in DB');
    assert.ok(tokenInDb.usedAt !== null, 'Token must be marked as used');

    // Verify user password hash was updated
    const updatedUser = await prisma.user.findUnique({
      where: { id: testUser.id }
    });
    const match = await bcrypt.compare(newPassword, updatedUser.password);
    assert.equal(match, true, 'User password in DB must match new password');
  });

  // --------------------------------------------------------------------------
  // TEST 4: Expired token -> rejected
  // --------------------------------------------------------------------------
  test('TEST 4: Expired token -> rejected', async () => {
    const expiredRawToken = crypto.randomBytes(32).toString('hex');
    const expiredTokenHash = crypto.createHash('sha256').update(expiredRawToken).digest('hex');

    // Seed expired token directly in DB
    await prisma.passwordResetToken.create({
      data: {
        userId: testUser.id,
        tokenHash: expiredTokenHash,
        expiresAt: new Date(Date.now() - 60 * 1000) // expired 1 minute ago
      }
    });

    const res = await fetch(`${BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: expiredRawToken,
        newPassword: 'AnotherPassword@123'
      })
    });

    assert.equal(res.status, 400);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.ok(data.message.toLowerCase().includes('expired'));
  });

  // --------------------------------------------------------------------------
  // TEST 5: Already-used token -> rejected
  // --------------------------------------------------------------------------
  test('TEST 5: Already-used token -> rejected', async () => {
    const usedRawToken = crypto.randomBytes(32).toString('hex');
    const usedTokenHash = crypto.createHash('sha256').update(usedRawToken).digest('hex');

    // Seed used token in DB
    await prisma.passwordResetToken.create({
      data: {
        userId: testUser.id,
        tokenHash: usedTokenHash,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        usedAt: new Date()
      }
    });

    const res = await fetch(`${BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: usedRawToken,
        newPassword: 'AnotherPassword@123'
      })
    });

    assert.equal(res.status, 400);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.ok(data.message.toLowerCase().includes('already been used'));
  });

  // --------------------------------------------------------------------------
  // TEST 6: Old password -> login rejected
  // --------------------------------------------------------------------------
  test('TEST 6: Old password -> login rejected', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: 'InitialPass@123' // old password
      })
    });

    assert.equal(res.status, 401);
    const data = await res.json();
    assert.equal(data.success, false);
  });

  // --------------------------------------------------------------------------
  // TEST 7: New password -> login successful
  // --------------------------------------------------------------------------
  test('TEST 7: New password -> login successful', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: 'NewSecretPass@2026' // newly reset password
      })
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.token, 'Must return JWT token');
    assert.equal(data.user.email, testUser.email);
  });

  // --------------------------------------------------------------------------
  // TEST 8: Admin password reset -> Admin remains organization's only Admin
  // --------------------------------------------------------------------------
  test('TEST 8: Admin password reset -> Admin remains the organization only Admin', async () => {
    // 1. Check count of ADMINs in organization before
    const adminsBefore = await prisma.user.count({
      where: { organizationId: adminUser.organizationId, role: 'ADMIN' }
    });
    assert.equal(adminsBefore, 1, 'There must be exactly 1 Admin before reset');

    // 2. Perform forgot password for Admin
    clearDevEmails();
    await fetch(`${BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: adminUser.email })
    });

    const adminEmail = getLastDevEmail();
    assert.ok(adminEmail && adminEmail.token, 'Must receive reset token for Admin');

    // 3. Reset Admin password
    const adminNewPass = 'AdminNewPass@2026';
    const resetRes = await fetch(`${BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: adminEmail.token,
        newPassword: adminNewPass
      })
    });
    assert.equal(resetRes.status, 200);

    // 4. Verify count of ADMINs in organization remains exactly 1
    const adminsAfter = await prisma.user.count({
      where: { organizationId: adminUser.organizationId, role: 'ADMIN' }
    });
    assert.equal(adminsAfter, 1, 'There must remain exactly 1 Admin after reset');

    // 5. Verify the existing Admin has the new password
    const currentAdmin = await prisma.user.findUnique({
      where: { id: adminUser.id }
    });
    assert.equal(currentAdmin.role, 'ADMIN');
    assert.equal(currentAdmin.organizationId, adminUser.organizationId);
    const match = await bcrypt.compare(adminNewPass, currentAdmin.password);
    assert.equal(match, true);

    // Restore Admin password back to Admin@123
    const adminDefaultHash = await bcrypt.hash('Admin@123', 10);
    await prisma.user.update({
      where: { id: adminUser.id },
      data: { password: adminDefaultHash, passwordChangedAt: null }
    });
  });

  // --------------------------------------------------------------------------
  // TEST 9: Rapid repeated requests -> rate limiter returns 429
  // --------------------------------------------------------------------------
  test('TEST 9: Rapid repeated requests -> rate limiter returns 429', async () => {
    try {
      await fetch(`${BASE_URL}/auth/dev-reset-rate-limit`, { method: 'POST' });
    } catch (e) {}
    resetRateLimiter();
    const spamEmail = 'ratelimit.spam@leadflow.com';

    let lastStatus = 200;
    // Attempt 7 consecutive requests (limit is 5)
    for (let i = 0; i < 7; i++) {
      const res = await fetch(`${BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: spamEmail })
      });
      lastStatus = res.status;
    }

    assert.equal(lastStatus, 429, 'Excessive requests must return HTTP 429 Too Many Requests');
    try {
      await fetch(`${BASE_URL}/auth/dev-reset-rate-limit`, { method: 'POST' });
    } catch (e) {}
    resetRateLimiter();
  });

  // --------------------------------------------------------------------------
  // TEST 10: Password reset does not alter entities
  // --------------------------------------------------------------------------
  test('TEST 10: Password reset does not alter user entities, leads, deals, etc.', async () => {
    const userBefore = await prisma.user.findUnique({
      where: { id: testUser.id },
      include: {
        assignedLeads: true,
        assignedDeals: true,
        assignedContacts: true,
        activities: true,
        followUps: true
      }
    });

    // Reset password
    clearDevEmails();
    await fetch(`${BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email })
    });
    const emailData = getLastDevEmail();

    await fetch(`${BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: emailData.token,
        newPassword: 'BrandNewPassword@999'
      })
    });

    const userAfter = await prisma.user.findUnique({
      where: { id: testUser.id },
      include: {
        assignedLeads: true,
        assignedDeals: true,
        assignedContacts: true,
        activities: true,
        followUps: true
      }
    });

    assert.equal(userAfter.id, userBefore.id);
    assert.equal(userAfter.organizationId, userBefore.organizationId);
    assert.equal(userAfter.role, userBefore.role);
    assert.equal(userAfter.department, userBefore.department);
    assert.equal(userAfter.assignedLeads.length, userBefore.assignedLeads.length);
    assert.equal(userAfter.assignedDeals.length, userBefore.assignedDeals.length);
    assert.equal(userAfter.assignedContacts.length, userBefore.assignedContacts.length);
    assert.equal(userAfter.activities.length, userBefore.activities.length);
    assert.equal(userAfter.followUps.length, userBefore.followUps.length);
  });

  // --------------------------------------------------------------------------
  // TEST 11, 12, 13: Demo Accounts continue working
  // --------------------------------------------------------------------------
  test('TEST 11: Demo Admin login still works', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@leadflow.com', password: 'Admin@123' })
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.user.role, 'ADMIN');
  });

  test('TEST 12: Demo Manager login still works', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'rahul@leadflow.com', password: 'Manager@123' })
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.user.role, 'MANAGER');
  });

  test('TEST 13: Demo Sales Agent login still works', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'amit@leadflow.com', password: 'Agent@123' })
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.user.role, 'SALES_AGENT');
  });

  // --------------------------------------------------------------------------
  // TEST 14: Previously issued JWT/session is invalidated after password reset
  // --------------------------------------------------------------------------
  test('TEST 14: Previously issued JWT/session is invalidated after password reset', async () => {
    // 1. Log in to obtain a valid JWT token
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email, password: 'BrandNewPassword@999' })
    });
    assert.equal(loginRes.status, 200);
    const { token: oldToken } = await loginRes.json();

    // 2. Verify that oldToken can access protected route /api/auth/me
    const meBefore = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${oldToken}` }
    });
    assert.equal(meBefore.status, 200);

    // 3. Sleep 1.5 seconds to guarantee distinct JWT `iat` seconds timestamp
    await new Promise(r => setTimeout(r, 1500));

    // 4. Perform password reset
    clearDevEmails();
    await fetch(`${BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email })
    });
    const emailData = getLastDevEmail();

    await fetch(`${BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: emailData.token,
        newPassword: 'SubsequentPassword@2026'
      })
    });

    // 5. Test previously issued token against protected endpoint
    const meAfter = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${oldToken}` }
    });

    assert.equal(meAfter.status, 401, 'Old JWT must be rejected with 401 after password reset');
    const errData = await meAfter.json();
    assert.ok(errData.message.toLowerCase().includes('password was recently reset') || errData.message.toLowerCase().includes('recently'));
  });

  // --------------------------------------------------------------------------
  // TEST 15: New login receives a valid JWT after password reset
  // --------------------------------------------------------------------------
  test('TEST 15: New login receives a valid JWT after password reset', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: 'SubsequentPassword@2026'
      })
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.token, 'Must receive new JWT');

    // Test new token on protected route
    const meRes = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${data.token}` }
    });
    assert.equal(meRes.status, 200, 'New JWT must be accepted');
  });

  // --------------------------------------------------------------------------
  // TEST 16: Missing token -> reset rejected
  // --------------------------------------------------------------------------
  test('TEST 16: Missing token -> reset rejected', async () => {
    const res = await fetch(`${BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: '',
        newPassword: 'SomeValidPassword@123'
      })
    });

    assert.equal(res.status, 400);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.ok(data.message.toLowerCase().includes('missing') || data.message.toLowerCase().includes('invalid'));
  });

  // --------------------------------------------------------------------------
  // TEST 17: Malformed token -> reset rejected
  // --------------------------------------------------------------------------
  test('TEST 17: Malformed token -> reset rejected', async () => {
    const res = await fetch(`${BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: 'this_is_clearly_a_fake_and_malformed_token_that_does_not_exist',
        newPassword: 'SomeValidPassword@123'
      })
    });

    assert.equal(res.status, 400);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.ok(data.message.toLowerCase().includes('invalid') || data.message.toLowerCase().includes('expired'));
  });

  // --------------------------------------------------------------------------
  // TEST 18: Multiple active reset tokens -> previous tokens become invalid
  // --------------------------------------------------------------------------
  test('TEST 18: Multiple active reset tokens -> previous tokens become invalid when newer is requested', async () => {
    // Request first reset token
    clearDevEmails();
    await fetch(`${BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email })
    });
    const firstEmail = getLastDevEmail();
    assert.ok(firstEmail && firstEmail.token);
    const firstToken = firstEmail.token;

    // Request second reset token for same user
    await fetch(`${BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email })
    });
    const secondEmail = getLastDevEmail();
    assert.ok(secondEmail && secondEmail.token);
    const secondToken = secondEmail.token;

    assert.notEqual(firstToken, secondToken, 'New token must differ from old token');

    // Attempt to reset with the FIRST (now invalidated) token
    const firstAttempt = await fetch(`${BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: firstToken,
        newPassword: 'AttemptWithFirstToken@123'
      })
    });

    assert.equal(firstAttempt.status, 400, 'First token must be rejected because it was superseded');

    // Attempt to reset with the SECOND token -> should succeed
    const secondAttempt = await fetch(`${BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: secondToken,
        newPassword: 'SuccessWithSecondToken@123'
      })
    });

    assert.equal(secondAttempt.status, 200, 'Second (latest) token must succeed');
  });
});
