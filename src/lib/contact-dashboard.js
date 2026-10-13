function isValidDashboardPasskey(passkey) {
  if (typeof passkey !== 'string') {
    return false;
  }

  const expected = process.env.DASHBOARD_PASSKEY || process.env.CONTACT_DASHBOARD_PASSKEY || 'Noor@4321';
  return passkey.trim() === expected.trim();
}

module.exports = {
  isValidDashboardPasskey,
};
