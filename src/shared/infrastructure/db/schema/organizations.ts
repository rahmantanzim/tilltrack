import { sql } from "drizzle-orm";
import { char, check, pgTable, text, unique, uuid } from "drizzle-orm/pg-core";
import {
  DEFAULT_CURRENCY,
  DEFAULT_FLOAT_OVERNIGHT,
  FLOAT_OVERNIGHT_OPTIONS,
  SUPPORTED_CURRENCIES,
  type Currency,
  type FloatOvernight,
} from "../../../../modules/organizations/domain/store-settings.ts";
import { createdAt, oneOf, primaryId } from "./columns.ts";

/** The tenant: one business, which may own several stores. */
export const organizations = pgTable(
  "organizations",
  {
    id: primaryId(),
    name: text().notNull(),
    createdAt: createdAt(),
  },
  (t) => [check("organizations_name_length", sql`char_length(${t.name}) BETWEEN 1 AND 200`)],
);

export const stores = pgTable(
  "stores",
  {
    id: primaryId(),
    orgId: uuid()
      .notNull()
      .references(() => organizations.id, { onDelete: "restrict" }),
    name: text().notNull(),
    /** IANA time zone, e.g. "America/St_Johns". Business days follow it (BR-8). */
    timezone: text().notNull(),
    currency: char({ length: 3 }).$type<Currency>().notNull().default(DEFAULT_CURRENCY),
    floatOvernight: text().$type<FloatOvernight>().notNull().default(DEFAULT_FLOAT_OVERNIGHT),
    createdAt: createdAt(),
  },
  (t) => [
    unique("stores_org_id_name_key").on(t.orgId, t.name),
    // Lets child tables point at (org_id, id) together, so a row can never
    // reference a store from a different organization.
    unique("stores_org_id_id_key").on(t.orgId, t.id),
    check("stores_name_length", sql`char_length(${t.name}) BETWEEN 1 AND 100`),
    check("stores_timezone_length", sql`char_length(${t.timezone}) BETWEEN 1 AND 64`),
    check("stores_currency_check", oneOf(t.currency, SUPPORTED_CURRENCIES)),
    check("stores_float_overnight_check", oneOf(t.floatOvernight, FLOAT_OVERNIGHT_OPTIONS)),
  ],
);
