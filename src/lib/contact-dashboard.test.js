const test = require('node:test');
const assert = require('node:assert/strict');
const { isValidDashboardPasskey } = require('./contact-dashboard.js');

test('accepts the configured dashboard passkey and rejects others', () => {
  const origDash = process.env.DASHBOARD_PASSKEY;
  const origContact = process.env.CONTACT_DASHBOARD_PASSKEY;

  delete process.env.DASHBOARD_PASSKEY;
  process.env.CONTACT_DASHBOARD_PASSKEY = 'TestPasskey@123';

  assert.equal(isValidDashboardPasskey('TestPasskey@123'), true);
  assert.equal(isValidDashboardPasskey('wrong-passkey'), false);
  assert.equal(isValidDashboardPasskey('  TestPasskey@123  '), true);

  // Test DASHBOARD_PASSKEY priority
  process.env.DASHBOARD_PASSKEY = 'PrimaryPasskey@456';
  assert.equal(isValidDashboardPasskey('PrimaryPasskey@456'), true);
  assert.equal(isValidDashboardPasskey('TestPasskey@123'), false);

  // Restore
  if (origDash !== undefined) process.env.DASHBOARD_PASSKEY = origDash;
  else delete process.env.DASHBOARD_PASSKEY;
  if (origContact !== undefined) process.env.CONTACT_DASHBOARD_PASSKEY = origContact;
  else delete process.env.CONTACT_DASHBOARD_PASSKEY;
});

test('fails closed when no passkey is configured', () => {
  const origDash = process.env.DASHBOARD_PASSKEY;
  const origContact = process.env.CONTACT_DASHBOARD_PASSKEY;

  delete process.env.DASHBOARD_PASSKEY;
  delete process.env.CONTACT_DASHBOARD_PASSKEY;

  assert.equal(isValidDashboardPasskey('Noor@4321'), false);
  assert.equal(isValidDashboardPasskey(''), false);
  assert.equal(isValidDashboardPasskey(null), false);

  if (origDash !== undefined) process.env.DASHBOARD_PASSKEY = origDash;
  if (origContact !== undefined) process.env.CONTACT_DASHBOARD_PASSKEY = origContact;
});
