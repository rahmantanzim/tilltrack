CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "organizations_name_length" CHECK (char_length("organizations"."name") BETWEEN 1 AND 200)
);
--> statement-breakpoint
CREATE TABLE "stores" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"org_id" uuid NOT NULL,
	"name" text NOT NULL,
	"timezone" text NOT NULL,
	"currency" char(3) DEFAULT 'CAD' NOT NULL,
	"float_overnight" text DEFAULT 'drawer' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "stores_org_id_name_key" UNIQUE("org_id","name"),
	CONSTRAINT "stores_org_id_id_key" UNIQUE("org_id","id"),
	CONSTRAINT "stores_name_length" CHECK (char_length("stores"."name") BETWEEN 1 AND 100),
	CONSTRAINT "stores_timezone_length" CHECK (char_length("stores"."timezone") BETWEEN 1 AND 64),
	CONSTRAINT "stores_currency_check" CHECK ("stores"."currency" IN ('CAD')),
	CONSTRAINT "stores_float_overnight_check" CHECK ("stores"."float_overnight" IN ('drawer', 'safe'))
);
--> statement-breakpoint
CREATE TABLE "staff_members" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"org_id" uuid NOT NULL,
	"full_name" text NOT NULL,
	"employee_number" text,
	"is_owner" boolean DEFAULT false NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "staff_members_org_id_id_key" UNIQUE("org_id","id"),
	CONSTRAINT "staff_members_org_id_employee_number_key" UNIQUE("org_id","employee_number"),
	CONSTRAINT "staff_members_full_name_length" CHECK (char_length("staff_members"."full_name") BETWEEN 1 AND 200),
	CONSTRAINT "staff_members_employee_number_length" CHECK ("staff_members"."employee_number" IS NULL OR char_length("staff_members"."employee_number") BETWEEN 1 AND 50),
	CONSTRAINT "staff_members_status_check" CHECK ("staff_members"."status" IN ('active', 'inactive')),
	CONSTRAINT "staff_members_version_positive" CHECK ("staff_members"."version" >= 1)
);
--> statement-breakpoint
CREATE TABLE "store_roles" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"org_id" uuid NOT NULL,
	"store_id" uuid NOT NULL,
	"staff_id" uuid NOT NULL,
	"role" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "store_roles_store_id_staff_id_key" UNIQUE("store_id","staff_id"),
	CONSTRAINT "store_roles_role_check" CHECK ("store_roles"."role" IN ('employee', 'supervisor', 'cos', 'manager', 'viewer')),
	CONSTRAINT "store_roles_status_check" CHECK ("store_roles"."status" IN ('active', 'inactive')),
	CONSTRAINT "store_roles_version_positive" CHECK ("store_roles"."version" >= 1)
);
--> statement-breakpoint
ALTER TABLE "stores" ADD CONSTRAINT "stores_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_members" ADD CONSTRAINT "staff_members_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_roles" ADD CONSTRAINT "store_roles_store_fk" FOREIGN KEY ("org_id","store_id") REFERENCES "public"."stores"("org_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_roles" ADD CONSTRAINT "store_roles_staff_fk" FOREIGN KEY ("org_id","staff_id") REFERENCES "public"."staff_members"("org_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "store_roles_org_id_staff_id_idx" ON "store_roles" USING btree ("org_id","staff_id");