/**
 * Roles a staff member can hold in a store (requirements, section 3.1).
 * Owner is not here: it is an organization-wide flag on the staff member.
 */
export const STORE_ROLES = ["employee", "supervisor", "cos", "manager", "viewer"] as const; // this is const value

export type StoreRole = (typeof STORE_ROLES)[number]; // this is type

/** Staff are never deleted, only deactivated (BR-10). */
export const STAFF_STATUSES = ["active", "inactive"] as const;

export type StaffStatus = (typeof STAFF_STATUSES)[number]; // this is type
