---
status: pending
priority: p3
issue_id: "009"
tags: [code-review, quality, maintainability]
dependencies: []
---

# Code Duplication Across Files

## Problem Statement

Several patterns are duplicated across the codebase, increasing maintenance burden and risk of inconsistent fixes.

## Findings

**1. CSRF validation helper duplicated:**
- `src/app/api/wallet/boost/route.ts:5-17`
- `src/app/api/podcast-index/sync/route.ts:27-39`

**2. Supabase query patterns duplicated:**
- Podcast select with relations appears 4 times in `src/lib/data/podcasts.ts`
- Same pattern in page components

**3. Duration formatting functions:**
- `src/lib/format.ts:1-14` - `formatDurationFromSeconds`
- `src/lib/html-audio.ts:605-612` - `formatDuration`
- Essentially the same function

**4. DB type definitions duplicated:**
- `src/app/podcast/[podcastId]/page.tsx:24-75` - Inline interfaces
- `src/app/podcast/[podcastId]/episode/[episodeId]/page.tsx` - Similar interfaces
- Should use types from `src/lib/supabase/types.ts`

**5. Unused hook:**
- `src/hooks/use-auth-sync.ts` - Appears to be unused, auth sync is in `auth-provider.tsx`

## Proposed Solutions

### Option A: Extract shared utilities (Recommended)
- **Pros:** DRY, single source of truth
- **Cons:** Refactoring effort
- **Effort:** Medium
- **Risk:** Low

```typescript
// src/lib/api/middleware.ts
export function validateOrigin(request: NextRequest): boolean { ... }
export function rateLimit(key: string, limit: number): Promise<boolean> { ... }

// src/lib/supabase/queries.ts
export const PODCAST_WITH_RELATIONS = `
  *,
  podcast_funding (url, message),
  value_configs (id, type, method, value_recipients (name, type, address, split))
`;
```

### Option B: Delete unused code
- `src/hooks/use-auth-sync.ts` - Delete if unused

## Recommended Action

<!-- To be filled during triage -->

## Technical Details

**Files to create:**
- `src/lib/api/middleware.ts` - Shared API utilities
- `src/lib/supabase/queries.ts` - Reusable query fragments

**Files to update:**
- `src/app/api/wallet/boost/route.ts`
- `src/app/api/podcast-index/sync/route.ts`
- `src/lib/data/podcasts.ts`
- Various page components

**Files to delete:**
- `src/hooks/use-auth-sync.ts` (if confirmed unused)

## Acceptance Criteria

- [ ] CSRF helper extracted to shared module
- [ ] Query patterns use shared constants
- [ ] Unused code removed
- [ ] No duplicate duration formatters
- [ ] All tests pass

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2024-02-08 | Identified during code quality review | Regular deduplication prevents drift |
