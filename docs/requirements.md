# TillTrack — Requirements Specification

Version 0.2 · Draft

## 1. Purpose

TillTrack is a multi-tenant web application that helps small and mid-sized retailers reconcile cash and card takings. It records how money moves through a store (till, pickup bag, safe, deposit, bank), compares what was counted with what was expected, and flags any difference for follow-up.

TillTrack does **not** replace the point-of-sale (POS) system. It sits beside it: expected totals come from POS reports, entered manually, scanned from a photo, or imported from CSV.

**Guiding principle for AI features:** AI may help people enter and understand data, but it never creates or changes a money record without a person confirming it, and every number shown to users comes from the database, not from a model.

## 2. Glossary

| Term | Meaning |
|---|---|
| **Organization** | The tenant: one business, which may own several stores. |
| **Staff member** | A real person who works at a store. May or may not have a login. |
| **User account** | Login access for a staff member. |
| **Till** | A cash drawer attached to a register. |
| **Till session** | One till's use for one business day, from opening to final count. |
| **Float** | The fixed starting cash in a till, used to give change. |
| **Change fund** | The total of all till floats, which never leaves the store (e.g. $3,800 = 8 × $400 + 2 × $300). |
| **Till limit** | The maximum total cash allowed in a till before a pickup is required. In the reference store it equals the till's float, so a pickup brings the drawer back down to its float. |
| **Pickup (skim)** | Removing cash above the float from a till into a numbered bag. |
| **Declare** | Entering a pickup bag's amount into the safe record in the cash office. |
| **X report** | A POS report of a till's totals so far, without closing it. Used for mid-day counts. |
| **Z report** | The POS end-of-day report that closes the day's totals. |
| **Expected cash** | Float + cash sales − cash refunds − payouts − pickups, per the POS at the time of the count. |
| **Variance** | Counted − expected. Positive = over, negative = short. |
| **Tolerance** | The variance allowed before a discrepancy is flagged (e.g. ±$20.00). |
| **Ledger** | The append-only record of every money movement between locations. |
| **Safe count** | A physical count of the safe, compared with its recorded balance. |
| **Deposit** | Sealed bag of cash prepared for the bank. |
| **Carrier** | The armoured-car service that takes deposits to the bank. |
| **Bank adjustment** | A difference between the store's deposit amount and the bank's count. |
| **Batch / settlement** | Card transactions grouped and submitted at end of day. Funds arrive later, net of fees. |
| **Dual control** | Two different people must count and verify the same money. |
| **Business day** | The store's trading day in the store's own time zone. |

## 3. Roles and permissions

### 3.1 Roles

Roles are assigned per store. A staff member has one role in each store they work at.

| Role | Typical person | Login |
|---|---|---|
| **Employee** | Cashier | Optional |
| **Supervisor** | Front-end supervisor | Yes |
| **Cash Office Supervisor (COS)** | Cash office staff | Yes |
| **Manager** | Store manager | Yes |
| **Owner** | Business owner (organization-wide) | Yes |
| **Viewer** | Accountant, auditor | Yes |

### 3.2 Permission matrix

| Action | Employee | Supervisor | COS | Manager | Owner | Viewer |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| Be assigned to a till session | ✓ | ✓ | ✓ | ✓ | ✓ | |
| View own till variance history | ✓ | ✓ | ✓ | ✓ | ✓ | |
| Open a till, record a till count | | ✓ | ✓ | ✓ | ✓ | |
| Record a pickup | | ✓ | ✓ | ✓ | ✓ | |
| Declare pickups, count the safe | | | ✓ | ✓ | ✓ | |
| Enter POS and card totals | | | ✓ | ✓ | ✓ | |
| Verify a count (dual control) | | | | ✓ | ✓ | |
| Prepare and track deposits | | | | ✓ | ✓ | |
| Resolve or write off discrepancies | | | | ✓ | ✓ | |
| Close a business day | | | | ✓ | ✓ | |
| Add staff, change roles up to COS | | | | ✓ | ✓ | |
| Add or remove Managers | | | | | ✓ | |
| Manage stores and settings | | | | | ✓ | |
| View reports and history | | | | ✓ | ✓ | ✓ |

### 3.3 Role management rules

| ID | Rule |
|---|---|
| RM-1 | A Manager can promote or demote staff between Employee, Supervisor and COS in their own store. |
| RM-2 | Only an Owner can assign or remove the Manager role. Only an Owner can add another Owner. |
| RM-3 | No one can change their own role. |
| RM-4 | An organization must always have at least one active Owner. |
| RM-5 | Removing a staff member deactivates them. Their records and name stay in all history and reports. |
| RM-6 | Role changes and deactivations take effect on the person's very next request, even if they are already logged in. |
| RM-7 | Every role change records who made it, when, the old role, the new role and an optional reason. |
| RM-8 | A deactivated staff member can be reactivated by someone allowed to assign their role. |

## 4. Functional requirements

Priority: **M** = must have (MVP), **S** = should have, **C** = could have (later).

### 4.1 Organizations, stores and accounts

| ID | Requirement | Pri |
|---|---|---|
| FR-1 | An owner can sign up and create an organization. | M |
| FR-2 | An owner can create stores, each with a name, time zone and currency (CAD). | M |
| FR-3 | Each store has configurable tills (name and type, e.g. "Cash 1", "Smoke Shop", "Pharmacy"), each with its own float and till limit, plus a store-wide variance tolerance. The change fund is calculated as the sum of all floats. | M |
| FR-4 | Settings changes apply to future records only. Past records keep the settings in force at the time. | M |
| FR-5 | A user can only see stores they belong to and data from those stores. | M |
| FR-6 | Managers and owners can invite a staff member to create a login by email. Invitations expire after 7 days. | M |
| FR-7 | Users can reset a forgotten password by email. | M |

### 4.2 Staff and roles

| ID | Requirement | Pri |
|---|---|---|
| FR-8 | Managers and owners can add staff members with a name, employee number and role. A login is optional. | M |
| FR-9 | Managers and owners can change roles and deactivate or reactivate staff, following rules RM-1 to RM-8. | M |
| FR-10 | Each staff member has a profile showing their role history and till sessions. | S |

### 4.3 Tills and counts

| ID | Requirement | Pri |
|---|---|---|
| FR-11 | A Supervisor or above can open a till session for a business day with its starting float. | M |
| FR-12 | One or more cashiers can be assigned to a till session, with start and end times, so variances can be traced to who worked the till. | M |
| FR-13 | A Supervisor or above can record a till count (mid-day or final), entered by denomination ($100 down to 5¢) or as a total. | M |
| FR-14 | For each count, the counter enters the POS X report figures for that till at that moment. The system calculates expected cash and the variance. | M |
| FR-15 | A variance outside tolerance automatically creates a discrepancy. | M |
| FR-16 | At end of day, the final count closes the till session. Cash above the float goes to the safe as a final pickup, and the float is recorded as staying in the drawer or moving to the safe overnight. | M |
| FR-17 | The system shows which tills are above their limit and suggests the pickup amount (cash above float). | S |

### 4.4 Pickups and the cash office

| ID | Requirement | Pri |
|---|---|---|
| FR-18 | A Supervisor or above can record a pickup: till, bag number, amount, time, person. | M |
| FR-19 | Bag numbers are unique per store. Reusing an open bag number is rejected. | M |
| FR-20 | Until declared, a pickup is shown as "in transit" and still belongs to its till. | M |
| FR-21 | A COS can declare a pickup into the safe, entering the counted amount. A mismatch creates a discrepancy. | M |
| FR-22 | A Manager must verify a declared pickup. The verifier must be a different person from the counter. | M |
| FR-23 | A business day cannot be closed while pickups remain undeclared. | M |

### 4.5 Money ledger

| ID | Requirement | Pri |
|---|---|---|
| FR-24 | Every movement of cash is recorded in the ledger as an amount moving from one location to another (e.g. till → pickup in transit → safe). | M |
| FR-25 | The current balance of any location is calculated from the ledger. | M |
| FR-26 | Corrections are recorded as new reversing entries that reference the original, never as edits. | M |

### 4.6 Safe

| ID | Requirement | Pri |
|---|---|---|
| FR-27 | The system shows the safe balance, split into float money and money awaiting deposit. | M |
| FR-28 | A COS can record a safe count. A difference from the recorded balance creates a discrepancy. | M |
| FR-29 | A COS can record cash moved from the safe to a till (e.g. extra change). | S |

### 4.7 Deposits

| ID | Requirement | Pri |
|---|---|---|
| FR-30 | A Manager can prepare a deposit from money awaiting deposit: bag number, amount, business days covered. | M |
| FR-31 | A Manager can record the carrier handover: date, time, carrier name, receipt number. | M |
| FR-32 | A Manager can record the bank's confirmed amount. A difference creates a bank-adjustment discrepancy. | M |
| FR-33 | Deposit status moves in one direction: prepared → handed to carrier → confirmed by bank. | M |

### 4.8 Card reconciliation

| ID | Requirement | Pri |
|---|---|---|
| FR-34 | A COS can enter the POS card totals for the day by card type (debit, Visa, Mastercard, Amex, other). | M |
| FR-35 | A COS can enter the card terminal batch totals by card type. A mismatch creates a discrepancy. | M |
| FR-36 | A Manager can record the bank settlement amount and fees. The system checks that settlement + fees = batch total. | S |
| FR-37 | Card and POS totals can be imported from CSV. | C |

### 4.9 Discrepancies

| ID | Requirement | Pri |
|---|---|---|
| FR-38 | Every discrepancy records its source (till, pickup, safe, deposit, card), amount, the cashiers involved if any, and who found it. | M |
| FR-39 | Status moves open → explained → resolved or written off. Every change requires a note. | M |
| FR-40 | Only a Manager or Owner can resolve or write off a discrepancy. | M |
| FR-41 | Managers are notified by email when a discrepancy exceeds a set amount. | S |

### 4.10 End of day and reports

| ID | Requirement | Pri |
|---|---|---|
| FR-42 | A Manager can close a business day once all till sessions are closed and all pickups declared. | M |
| FR-43 | A closed day is locked. Later corrections are new adjustment entries. | M |
| FR-44 | The end-of-day report shows sales by tender, variance per till and per cashier, pickups, safe movements and open discrepancies. Its totals always balance. | M |
| FR-45 | Reports can be printed and exported to CSV. | S |
| FR-46 | A dashboard shows today's status: tills open, pickups pending, open discrepancies. | S |
| FR-47 | An owner can view a summary across all their stores. | S |

### 4.11 History and audit

| ID | Requirement | Pri |
|---|---|---|
| FR-48 | Every change to any record writes an append-only history entry: who, what, when, old value, new value. | M |
| FR-49 | A user can view the full history of any till session, pickup, deposit, discrepancy or staff member. | M |
| FR-50 | The system can show the balance of any location at any past point in time. | S |

### 4.12 Insights and AI assistance

| ID | Requirement | Pri |
|---|---|---|
| FR-51 | The system flags unusual variance patterns using simple statistics, e.g. a cashier short on several days in a short period, or a variance far outside their normal range. | S |
| FR-52 | A COS can photograph a Z report or card batch slip. The system extracts the totals into the entry form for the COS to check and confirm. Nothing is saved without confirmation. | C |
| FR-53 | At day close, the system generates a short written summary for managers from the calculated report figures. Every number in the summary is checked against the data before it is shown. | C |
| FR-54 | A Manager can ask questions about their store's data in plain English. The assistant answers only by calling a fixed set of safe, read-only queries that respect the user's permissions. | C |

### 4.13 Demo

| ID | Requirement | Pri |
|---|---|---|
| FR-55 | A public demo organization, seeded with several weeks of realistic data based on the reference store, can be explored without signing up. It resets daily. | S |

## 5. Business rules

| ID | Rule |
|---|---|
| BR-1 | All money is stored as integer cents. Floating-point numbers are never used for money. |
| BR-2 | Canada has no penny, so a counted cash amount must be a multiple of 5¢. Card amounts are exact to the cent. |
| BR-3 | Every dollar of cash is always in exactly one location: till, pickup in transit, safe (float or awaiting deposit), deposit in transit, or bank. |
| BR-4 | The change fund total stays constant unless an Owner changes a till's float. |
| BR-5 | The person who counts cash cannot verify the same count. |
| BR-6 | Ledger entries and history entries are append-only: never updated or deleted. |
| BR-7 | Workflow records (e.g. a discrepancy's status) may change, but every change is versioned and written to history. |
| BR-8 | Business days follow the store's local time zone. Timestamps are stored in UTC. |
| BR-9 | A closed business day cannot be changed, only adjusted with new entries. |
| BR-10 | Staff are never deleted, only deactivated. |

## 6. Acceptance criteria (examples)

**AC-1: Variance flag**
Given Cash 1 has a $400.00 float and the X report shows $612.35 in cash sales and no pickups,
when a Supervisor counts $990.00,
then expected cash is $1,012.35, the variance is −$22.35, and a discrepancy is created because it is outside ±$20.00.

**AC-2: Dual control**
Given a COS declared pickup bag 1042,
when the same COS tries to verify it,
then the action is rejected with a clear message, and a Manager can verify it instead.

**AC-3: Tenant isolation**
Given a user belongs only to Store A,
when any request tries to read Store B's data, including by changing an ID in the URL,
then no Store B data is returned, even if the application code forgot a filter.

**AC-4: Concurrent edit**
Given two Managers open the same discrepancy,
when both save a change,
then the first save succeeds and the second is rejected and shown the latest version.

**AC-5: Role removed mid-session**
Given a COS is logged in,
when a Manager demotes them to Employee,
then their next action that needs COS permission is rejected.

**AC-6: Double submit**
Given a Supervisor taps "Save pickup" twice quickly,
then exactly one pickup is recorded.

**AC-7: Balanced report**
Given any closed business day,
then opening balances + movements in − movements out = closing balances for every location, and this is checked by automated tests.

## 7. Non-functional requirements

| ID | Category | Requirement |
|---|---|---|
| NFR-1 | Security | Tenant isolation is enforced by PostgreSQL row-level security, with automated tests proving one store cannot read another's data. |
| NFR-2 | Security | Passwords are hashed. Sessions expire. All traffic uses HTTPS. Login attempts are rate-limited. |
| NFR-3 | Security | Permissions are checked on the server for every action, using the user's current role. |
| NFR-4 | Correctness | Reports always balance (AC-7). |
| NFR-5 | Concurrency | Updatable records use optimistic locking with a version number (AC-4). |
| NFR-6 | Auditability | The database account the app uses has no permission to update or delete ledger or history rows. |
| NFR-7 | Reliability | Saving a record is safe to retry: a repeated request does not create a duplicate (AC-6). |
| NFR-8 | Reliability | Daily database backups. Versioned, repeatable migrations. |
| NFR-9 | Operations | A health-check endpoint, structured logs, and error tracking. |
| NFR-10 | Quality | Unit and integration tests on every pull request. End-to-end tests (Playwright) cover a full business day. |
| NFR-11 | Delivery | Every merge to `main` deploys automatically. Infrastructure is defined in Terraform. |
| NFR-12 | Privacy | Collects only the personal data needed (names, employee numbers, emails) and follows Canadian privacy law (PIPEDA). |
| NFR-13 | AI safety | AI features are optional and can be switched off per organization. They receive only the data needed for the task, never write records directly, and degrade gracefully if the AI service is unavailable. |
| NFR-14 | Usability | Works on a tablet in the cash office. Number entry is fast, with keyboard support. |
| NFR-15 | Accessibility | Meets WCAG 2.1 AA basics: labels, contrast, keyboard navigation. |
| NFR-16 | Performance | Common pages load in under 1 second for a store with a year of data. |

## 8. Out of scope (for now)

- Live integration with a POS system or payment processor.
- Inventory, payroll or full accounting.
- Coin counting machines and smart safes.
- Gift cards, coupons and cheques as separate tenders.
- Offline mode and native mobile apps.
- Currencies other than CAD.

## 9. Main workflow (a typical day)

1. Morning: a Supervisor opens each till session with its float and assigns cashiers.
2. Mid-day: a Supervisor or COS counts tills against the X report. Variances outside tolerance are flagged.
3. During the day: tills above their limit get pickups (bag number, amount).
4. Evening: the COS declares each pickup into the safe. A Manager verifies.
5. End of day: final till counts and pickups, then the COS enters Z report and card batch totals and counts the safe.
6. The Manager reviews discrepancies and closes the day. The end-of-day report is generated.
7. Weekly: the Manager prepares the deposit, hands it to the carrier, then records the bank's confirmed amount.

## 10. Reference store

The demo data and tests are based on a real grocery store setup:

| Setting | Value |
|---|---|
| Tills | Cash 1–8 ($400 float each), Smoke Shop ($300), Pharmacy ($300) |
| Change fund | $3,800 (sum of all floats) |
| Till limit | Equal to each till's float. Cash above the float is picked up. |
| Variance tolerance | ±$20.00 |
| POS totals entered by | Cash Office Supervisor |
| Deposit schedule | Weekly carrier pickup (Wednesday morning) |

## 11. Decisions log

| # | Question | Decision |
|---|---|---|
| D-1 | Is the till limit measured above the float or as total cash? | Total cash in the drawer. |
| D-2 | Is the change fund separate from the floats? | No. It is the total of all till floats. |
| D-3 | Who enters POS expected totals? | The Cash Office Supervisor. |
| D-4 | What variance tolerance applies? | ±$20.00, configurable per store. |
| D-5 | Must every staff member have a login? | No. Cashiers can exist as staff without logins, so variances can still be traced to them. |
| D-6 | Can AI write money records? | No. AI only suggests; a person confirms. |
| D-7 | Are records ever edited? | Ledger and history: never. Workflow records: yes, versioned, with every change logged. |