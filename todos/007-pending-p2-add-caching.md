---
status: pending
priority: p2
issue_id: "007"
tags: [code-review, performance, caching]
dependencies: []
---

# Missing Caching on API Routes and Pages

## Problem Statement

API routes and server components fetch data on every request without caching. This causes unnecessary database load and slower response times for content that changes infrequently.

## Findings

**API Routes without caching:**
- `src/app/api/podcast-index/search/route.ts` - No cache headers
- `src/app/api/podcast-index/trending/route.ts` - No cache headers

**Pages without ISR:**
- `src/app/page.tsx` - Home page runs 4 queries per visit
- `src/app/podcast/[podcastId]/page.tsx` - Podcast detail runs 4 queries per visit

**Impact:**
- Every search hits Podcast Index API (rate limit risk)
- Every home page visit runs 4 database queries
- Podcast pages re-fetch data that rarely changes

## Proposed Solutions

### Option A: Add Next.js revalidation (Recommended)
- **Pros:** Simple, built-in to Next.js
- **Cons:** Cache invalidation needs planning
- **Effort:** Small
- **Risk:** Low

```typescript
// In page.tsx files
export const revalidate = 300; // 5 minutes

// In API routes
return NextResponse.json(data, {
  headers: {
    'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
  }
});
```

### Option B: Use React Query/SWR for client-side caching
- **Pros:** Better UX with stale-while-revalidate
- **Cons:** More code changes
- **Effort:** Medium
- **Risk:** Low

## Recommended Action

<!-- To be filled during triage -->

## Technical Details

**Affected Files:**
- `src/app/page.tsx`
- `src/app/podcast/[podcastId]/page.tsx`
- `src/app/api/podcast-index/search/route.ts`
- `src/app/api/podcast-index/trending/route.ts`

**Suggested Cache Times:**
- Trending: 5 minutes
- Podcast details: 1 hour
- Episode details: 1 hour
- Search results: 5 minutes

## Acceptance Criteria

- [ ] Home page uses ISR with 5-minute revalidation
- [ ] Podcast pages use ISR with 1-hour revalidation
- [ ] API routes return appropriate Cache-Control headers
- [ ] Cache can be invalidated on podcast sync

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2024-02-08 | Identified during performance review | Static content should use ISR |
