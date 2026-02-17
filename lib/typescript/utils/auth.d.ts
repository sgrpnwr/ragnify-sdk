/**
 * Extracts admin status from API response data.
 * Checks multiple possible structures for role/roles.
 * Returns true if user is super_admin or tenant_admin.
 */
export declare function isAdminUser(data: any): boolean;
/**
 * Extracts user data from API response and normalizes it
 */
export declare function extractUserFromResponse(data: any): {
    email: any;
    firstName: any;
    lastName: any;
    role: any;
    roles: any;
    isAdmin: boolean;
    tenantId: any;
};
//# sourceMappingURL=auth.d.ts.map