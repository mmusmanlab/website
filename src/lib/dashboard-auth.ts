import { NextRequest } from "next/server";
const { isValidDashboardPasskey } = require("./contact-dashboard");

export function isDashboardAuthorized(request: NextRequest): boolean {
  const cookie = request.cookies.get("mmusman_dash_auth");
  if (cookie?.value === "true") {
    return true;
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    return isValidDashboardPasskey(token);
  }

  const passkeyHeader = request.headers.get("x-dashboard-passkey");
  if (passkeyHeader && isValidDashboardPasskey(passkeyHeader)) {
    return true;
  }

  return false;
}
