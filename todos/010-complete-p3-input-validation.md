---
status: complete
priority: p3
issue_id: "010"
tags: [code-review, security, validation]
dependencies: []
---

# Missing Input Validation on API Parameters

## Problem Statement

Several API routes accept parameters without proper validation, which could cause errors or unexpected behavior.

## Findings

**1. UUID parameters not validated:**
- `src/app/api/podcasts/[id]/subscribe/route.ts:8` - podcastId
- `src/app/api/episodes/[id]/progress/route.ts:8` - episodeId

**2. Trending endpoint parameters:**
- `src/app/api/podcast-index/trending/route.ts:5-8`
```typescript
const max = parseInt(searchParams.get("max") || "20", 10);
const lang = searchParams.get("lang") || "en";
```
- `max` could be NaN or negative
- `lang` passed directly to external API

**3. Progress value unbounded:**
- `src/app/api/episodes/[id]/progress/route.ts:20`
- No upper bound on progress value

**4. Boost message length:**
- `src/app/api/wallet/boost/route.ts:77`
- No length limit on message field

## Proposed Solutions

### Option A: Add validation helpers (Recommended)
- **Pros:** Consistent validation, better error messages
- **Cons:** Some code changes
- **Effort:** Small
- **Risk:** Low

```typescript
// src/lib/validation.ts
export function isValidUUID(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

export function validateRange(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, isNaN(value) ? min : value));
}

// Usage in routes
if (!isValidUUID(episodeId)) {
  return NextResponse.json({ error: "Invalid episode ID" }, { status: 400 });
}
```

### Option B: Use Zod for schema validation
- **Pros:** Type-safe, comprehensive
- **Cons:** New dependency
- **Effort:** Medium
- **Risk:** Low

## Recommended Action

<!-- To be filled during triage -->

## Technical Details

**Affected Files:**
- `src/app/api/podcasts/[id]/subscribe/route.ts`
- `src/app/api/episodes/[id]/progress/route.ts`
- `src/app/api/podcast-index/trending/route.ts`
- `src/app/api/wallet/boost/route.ts`

## Acceptance Criteria

- [ ] All ID parameters validated as UUIDs
- [ ] Numeric parameters have sensible bounds
- [ ] String parameters have length limits
- [ ] Invalid input returns 400 with helpful message

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2024-02-08 | Identified during code review | Defense in depth - validate even if DB will reject |
| 2026-02-08 | Added UUID validation to `subscribe/route.ts` POST and DELETE | Validate IDs before DB query |
| 2026-02-08 | Added UUID validation to `progress/route.ts` GET and PUT | Consistent validation across routes |
| 2026-02-08 | Added message length limit (500 chars) to `wallet/boost/route.ts` | Prevent oversized payloads |
