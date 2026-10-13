/**
 * Legacy compatibility bridge for contact-dashboard verification.
 * Delegates to secure environment passkey check without hardcoded fallbacks.
 */

function isValidDashboardPasskey(passkey) {
  if (typeof passkey !== 'string' || !passkey.trim()) {
    return false;
  }

  const expected = process.env.DASHBOARD_PASSKEY || process.env.CONTACT_DASHBOARD_PASSKEY;
  if (!expected || typeof expected !== 'string' || !expected.trim()) {
    return false;
  }

  return passkey.trim() === expected.trim();
}

module.exports = {
  isValidDashboardPasskey,
};
