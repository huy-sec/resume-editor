# Changelog

Versioning scheme:
- **Major (X.0.0)** — large new feature area or architectural change
- **Minor (x.Y.0)** — meaningful new feature or significant improvement
- **Patch (x.y.Z)** — bug fix, small tweak, or copy change

---

## [1.4.0] — 2026-04-01
### Reports tab with analytics charts
**Scale: Minor** — new full page with charts, no schema changes

- Added `/reports` page to the sidebar nav
- Installed `recharts` for client-side chart rendering
- KPI row: total applications, interview rate, offer rate, avg human score, avg keyword score
- Application volume over time — line chart (applications / interviews / offers per month)
- Approach effectiveness — two side-by-side bar charts: volume by approach and interview rate % by approach
- Human score vs interview rate — grouped bar chart bucketed in 20-point bands
- Keyword coverage vs interview rate — grouped bar chart bucketed in 25-point bands
- Resume quality radar — pentagon chart of Human Score / Keyword Coverage / Interview Rate / Offer Rate / Consistency
- Top 10 companies applied to — horizontal bar chart with interview overlay
- All charts show empty-state prompts when data is insufficient
- Data computed server-side from existing `TailoredResume` records (no new schema needed)

---

## [1.3.1] — 2026-04-01
### Fix Prisma client not regenerated after migration
**Scale: Patch** — runtime fix, no code change

- Ran `prisma generate` after the `applicationStatus` migration; dashboard status buttons now save correctly

---

## [1.3.0] — 2026-04-01
### Dashboard outcome tracking + insights
**Scale: Minor** — new feature area with schema migration

- Added `applicationStatus` field to `TailoredResume` (migration: `20260401161948_add_application_status`)
- Dashboard cards now have **Interview / Offer / Rejected** toggle buttons that save instantly
- Active status renders as a color-coded badge on the card (blue/green/red)
- Added stats row: total applications, interview rate, offer rate, avg human score
- Added "What's working" insight panel showing best-performing approach and human score delta between successful vs all resumes (visible once 2+ resumes exist with at least one outcome marked)
- New API route: `PATCH /api/resumes/[id]/status`
- Keyword coverage score now shown alongside human score on each card

---

## [1.2.1] — 2026-04-01
### Retry logic for Anthropic API overload errors
**Scale: Patch** — reliability fix, no UI change

- `callClaude` now retries up to 4 times on 529/503/502 errors
- Exponential backoff: 1s → 2s → 4s → 8s between attempts
- Surfaces error to user only after all retries are exhausted

---

## [1.2.0] — 2026-04-01
### Resume field filtering + single-line contact header
**Scale: Minor** — new filtering logic in export + prompt changes

- Resume PDF contact line is now capped to a single line (nowrap + ellipsis)
- GitHub link is hidden from the contact line for non-cybersecurity roles
- Cybersecurity certifications (Security+, CEH, CISSP, eJPT, OSCP, CISM, etc.) are excluded from the PDF when the job role is not in security
- Cybersecurity-specific education entries are also filtered for non-security roles
- Safety-net keyword filter in `buildResumeHTML` catches any certs/edu Claude missed
- Claude prompts updated to instruct field-specific filtering and emit `includeGithub` flag in JSON output
- Both `buildTailorPrompt` and `buildTailorPromptWithApproach` updated: bullets must contain a JD keyword or directly demonstrate a required skill, or be cut

---

## [1.1.1] — 2026-04-01
### PDF export timeout fix
**Scale: Patch** — bug fix

- Replaced `waitUntil: "networkidle0"` with `waitUntil: "domcontentloaded"` in all Puppeteer `setContent` calls
- Added explicit 60s timeout to prevent 30s navigation timeout errors on PDF generation
- Root cause: `networkidle0` waits for zero open network connections, hanging indefinitely if any resource failed to load

---

## [1.1.0] — 2026-04-01
### Import append instead of overwrite
**Scale: Minor** — data integrity fix with deduplication logic

- `app/api/import/route.ts` previously called `deleteMany` before inserting parsed data, wiping all existing profile entries
- Removed all `deleteMany` calls; import now appends only
- Deduplication rules:
  - Experiences: skip if same `company` + `title` already exists (case-insensitive)
  - Skills: skip if same `name` already exists
  - Educations: skip if same `school` + `degree` already exists
  - Projects: skip if same `name` already exists
  - Certifications: skip if same `name` already exists
- Personal info fields (name, email, phone, etc.) are only filled in if the existing field is empty — existing data is never overwritten
- `sortOrder` for new experiences/projects continues from the highest existing value

---

## [1.0.0] — 2026-03-31
### Initial release
**Scale: Major** — full application built from scratch

Core features shipped:
- Email/password authentication via NextAuth v5
- Profile management: personal info, experience, education, skills, projects, certifications
- AI text import to populate profile (parses resumes, LinkedIn exports, etc.)
- Personality & Voice profiling: MBTI, work style, Q&A, career motivators, personal brand
- Job description analysis with AI approach recommendation (5 approaches)
- Resume tailoring pipeline: keyword coverage, approach-aware prompt, humanization scoring
- Cover letter generation matched to candidate voice
- Inline review stage with keyword coverage visualization and rebuild-with-instructions
- PDF export via Puppeteer: auto-scales font to fit 2 pages, cover letter + resume merge
- Filename convention: `FirstLast-Company-Role-Date-Type.pdf`
- Dashboard with humanization scores per tailored resume
- SQLite database via Prisma 7 + `@prisma/adapter-better-sqlite3`
