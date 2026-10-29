# TillTrack

**Cash reconciliation for small retailers.** TillTrack tracks every dollar from the till to the bank: till counts, cash pickups, safe counts, deposits and card settlements. It flags discrepancies the moment they happen and produces an end-of-day report that always balances.

> Status: early development. See the [requirements specification](docs/requirements.md).

## Why

In most small and mid-sized stores, cash reconciliation still lives on paper count sheets and spreadsheets. When a till comes up $40 short, nobody can easily answer *where* the money was last accounted for, or *who* handled it.

I worked in a grocery store cash office and saw this first-hand: mid-day till counts, pickups from tills over the limit, evening entry in the cash office, manager verification, and a weekly armoured-car deposit. TillTrack turns that workflow into software.

## Key ideas

- **Every dollar is always in exactly one place.** Money moves between till, pickup bag, safe, deposit bag and bank, and every move is recorded.
- **Nothing is ever edited or deleted.** Corrections are new records, so any till's history can be rebuilt exactly.
- **Two people, not one.** The person who counts cash cannot be the person who verifies it.
- **Each store sees only its own data**, enforced by the database itself (PostgreSQL row-level security), not just application code.
- **Money is integer cents.** No floating-point rounding errors, ever.

## Tech stack (planned)

Next.js · TypeScript · PostgreSQL · Drizzle ORM · Docker · Playwright · GitHub Actions · AWS (ECS Fargate, RDS) · Terraform

## Documentation

- [Requirements specification](docs/requirements.md)
- Architecture and design (coming next)

## License

MIT 