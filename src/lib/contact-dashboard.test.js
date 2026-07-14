const test = require('node:test');
const assert = require('node:assert/strict');
const { isValidDashboardPasskey } = require('./contact-dashboard.js');

test('accepts the configured dashboard passkey and rejects others', () => {
  process.env.CONTACT_DASHBOARD_PASSKEY = 'Noor@4321';

  assert.equal(isValidDashboardPasskey('Noor@4321'), true);
  assert.equal(isValidDashboardPasskey('wrong-passkey'), false);
  assert.equal(isValidDashboardPasskey('  Noor@4321  '), true);
});
