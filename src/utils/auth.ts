/**
 * Extracts admin status from API response data.
 * Checks multiple possible structures for role/roles.
 * Returns true if user is super_admin or tenant_admin.
 */
export function isAdminUser(data: any): boolean {
  const user = data?.data?.user ?? data?.user ?? data;

  // Check if roles array contains "super_admin" or "tenant_admin"
  if (Array.isArray(user?.roles)) {
    if (
      user.roles.includes("super_admin") ||
      user.roles.includes("tenant_admin")
    ) {
      return true;
    }
    // Legacy support for old "admin" role
    if (user.roles.includes("admin")) {
      return true;
    }
  }

  // Check if role is "admin", "super_admin", or "tenant_admin" (string)
  if (
    user?.role === "admin" ||
    user?.role === "super_admin" ||
    user?.role === "tenant_admin"
  ) {
    return true;
  }

  // Check isAdmin boolean flag
  if (user?.isAdmin === true) {
    return true;
  }

  return false;
}

/**
 * Extracts user data from API response and normalizes it
 */
export function extractUserFromResponse(data: any) {
  const user = data?.data?.user ?? data?.user ?? data;
  const tenant = user?.tenant || data?.data?.tenant || data?.tenant;

  return {
    email: user?.email,
    firstName: user?.firstName,
    lastName: user?.lastName,
    role: user?.role,
    roles: user?.roles,
    isAdmin: isAdminUser(data),
    tenantId: tenant?.tenantId || user?.tenantId || "",
  };
}
