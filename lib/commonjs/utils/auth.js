"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.extractUserFromResponse = extractUserFromResponse;
exports.isAdminUser = isAdminUser;
/**
 * Extracts admin status from API response data.
 * Checks multiple possible structures for role/roles.
 * Returns true if user is super_admin or tenant_admin.
 */
function isAdminUser(data) {
  var _data$data;
  const user = (data === null || data === void 0 || (_data$data = data.data) === null || _data$data === void 0 ? void 0 : _data$data.user) ?? (data === null || data === void 0 ? void 0 : data.user) ?? data;

  // Check if roles array contains "super_admin" or "tenant_admin"
  if (Array.isArray(user === null || user === void 0 ? void 0 : user.roles)) {
    if (user.roles.includes("super_admin") || user.roles.includes("tenant_admin")) {
      return true;
    }
    // Legacy support for old "admin" role
    if (user.roles.includes("admin")) {
      return true;
    }
  }

  // Check if role is "admin", "super_admin", or "tenant_admin" (string)
  if ((user === null || user === void 0 ? void 0 : user.role) === "admin" || (user === null || user === void 0 ? void 0 : user.role) === "super_admin" || (user === null || user === void 0 ? void 0 : user.role) === "tenant_admin") {
    return true;
  }

  // Check isAdmin boolean flag
  if ((user === null || user === void 0 ? void 0 : user.isAdmin) === true) {
    return true;
  }
  return false;
}

/**
 * Extracts user data from API response and normalizes it
 */
function extractUserFromResponse(data) {
  var _data$data2, _data$data3;
  const user = (data === null || data === void 0 || (_data$data2 = data.data) === null || _data$data2 === void 0 ? void 0 : _data$data2.user) ?? (data === null || data === void 0 ? void 0 : data.user) ?? data;
  const tenant = (user === null || user === void 0 ? void 0 : user.tenant) || (data === null || data === void 0 || (_data$data3 = data.data) === null || _data$data3 === void 0 ? void 0 : _data$data3.tenant) || (data === null || data === void 0 ? void 0 : data.tenant);
  return {
    email: user === null || user === void 0 ? void 0 : user.email,
    firstName: user === null || user === void 0 ? void 0 : user.firstName,
    lastName: user === null || user === void 0 ? void 0 : user.lastName,
    role: user === null || user === void 0 ? void 0 : user.role,
    roles: user === null || user === void 0 ? void 0 : user.roles,
    isAdmin: isAdminUser(data),
    tenantId: (tenant === null || tenant === void 0 ? void 0 : tenant.tenantId) || (user === null || user === void 0 ? void 0 : user.tenantId) || ""
  };
}
//# sourceMappingURL=auth.js.map