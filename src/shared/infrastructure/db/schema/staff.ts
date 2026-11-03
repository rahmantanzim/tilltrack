import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  foreignKey,
  index,
  integer,
  pgTable,
  text,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import {
  STAFF_STATUSES,
  STORE_ROLES,
  type StaffStatus,
  type StoreRole,
} from "../../../../modules/staff/domain/store-role.ts";
import { createdAt, oneOf, primaryId } from "./columns.ts";
import { organizations, stores } from "./organizations.ts";

/** A real person who works for the organization. May or may not have a login. */
export const staffMembers = pgTable(
  "staff_members",
  {
    id: primaryId(),
    orgId: uuid()
      .notNull()
      .references(() => organizations.id, { onDelete: "restrict" }),
    fullName: text().notNull(),
    employeeNumber: text(),
    isOwner: boolean().notNull().default(false),
    status: text().$type<StaffStatus>().notNull().default("active"),
    /** Optimistic locking: every update must match and then increase this number. */
    version: integer().notNull().default(1),
    createdAt: createdAt(),
  },
  (t) => [
    unique("staff_members_org_id_id_key").on(t.orgId, t.id),
    unique("staff_members_org_id_employee_number_key").on(t.orgId, t.employeeNumber),
    check("staff_members_full_name_length", sql`char_length(${t.fullName}) BETWEEN 1 AND 200`),
    check(
      "staff_members_employee_number_length",
      sql`${t.employeeNumber} IS NULL OR char_length(${t.employeeNumber}) BETWEEN 1 AND 50`,
    ),
    check("staff_members_status_check", oneOf(t.status, STAFF_STATUSES)),
    check("staff_members_version_positive", sql`${t.version} >= 1`),
  ],
);

/** The role a staff member holds in one store. One role per store (requirements 3.1). */
export const storeRoles = pgTable(
  "store_roles",
  {
    id: primaryId(),
    orgId: uuid().notNull(),
    storeId: uuid().notNull(),
    staffId: uuid().notNull(),
    role: text().$type<StoreRole>().notNull(),
    status: text().$type<StaffStatus>().notNull().default("active"),
    version: integer().notNull().default(1),
    createdAt: createdAt(),
  },
  (t) => [
    // Composite keys: the store and the staff member must both belong to this row's org.
    foreignKey({
      name: "store_roles_store_fk",
      columns: [t.orgId, t.storeId],
      foreignColumns: [stores.orgId, stores.id],
    }).onDelete("restrict"),
    foreignKey({
      name: "store_roles_staff_fk",
      columns: [t.orgId, t.staffId],
      foreignColumns: [staffMembers.orgId, staffMembers.id],
    }).onDelete("restrict"),
    unique("store_roles_store_id_staff_id_key").on(t.storeId, t.staffId),
    // Supports "which stores does this person work at?" and the staff foreign key.
    index("store_roles_org_id_staff_id_idx").on(t.orgId, t.staffId),
    check("store_roles_role_check", oneOf(t.role, STORE_ROLES)),
    check("store_roles_status_check", oneOf(t.status, STAFF_STATUSES)),
    check("store_roles_version_positive", sql`${t.version} >= 1`),
  ],
);
