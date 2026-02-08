---
status: complete
priority: p2
issue_id: "008"
tags: [code-review, security, performance]
dependencies: []
---

# Missing and Ineffective Rate Limiting

## Problem Statement

1. The search and trending API endpoints have no rate limiting
2. The sync endpoint's rate limiting uses in-memory storage which doesn't work across serverless instances

## Findings

**Missing rate limiting:**
- `src/app/api/podcast-index/search/route.ts` - No rate limiting
- `src/app/api/podcast-index/trending/route.ts` - No rate limiting
- `src/app/api/wallet/boost/route.ts` - No rate limiting (financial endpoint!)

**Ineffective rate limiting:**
- `src/app/api/podcast-index/sync/route.ts:5-6`
```typescript
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
```
This Map is instance-local and resets on cold starts.

## Proposed Solutions

### Option A: Use Upstash Redis rate limiting (Recommended)
- **Pros:** Works across instances, managed service
- **Cons:** External dependency, small cost
- **Effort:** Medium
- **Risk:** Low

```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 m"),
});

export async function POST(request: NextRequest) {
  const ip = request.ip ?? "anonymous";
  const { success } = await ratelimit.limit(ip);
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  // ...
}
```

### Option B: Use Supabase for rate limit storage
- **Pros:** No new dependencies
- **Cons:** Adds database load
- **Effort:** Medium
- **Risk:** Low

### Option C: Use Vercel Edge Config
- **Pros:** Fast, edge-native
- **Cons:** Vercel-specific
- **Effort:** Small
- **Risk:** Low

## Recommended Action

<!-- To be filled during triage -->

## Technical Details

**Affected Files:**
- `src/app/api/podcast-index/search/route.ts`
- `src/app/api/podcast-index/trending/route.ts`
- `src/app/api/podcast-index/sync/route.ts`
- `src/app/api/wallet/boost/route.ts`

**Suggested Rate Limits:**
- Search: 30 req/min
- Trending: 60 req/min
- Sync: 10 req/min
- Boost: 20 req/min

## Acceptance Criteria

- [ ] All public API endpoints have rate limiting
- [ ] Rate limits work across serverless instances
- [ ] Rate limit errors return 429 with helpful message
- [ ] Rate limits don't affect normal usage

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2024-02-08 | Identified during security review | In-memory state doesn't work in serverless |
