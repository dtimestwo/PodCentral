---
status: complete
priority: p2
issue_id: "004"
tags: [code-review, security, authentication]
dependencies: []
---

# Podcast Sync Endpoint Lacks Authentication

## Problem Statement

The `/api/podcast-index/sync` endpoint uses the admin Supabase client (service role key) to write to the database but does not require user authentication. Any unauthenticated user can trigger database writes.

## Findings

**Location:** `src/app/api/podcast-index/sync/route.ts:41-93`

The endpoint has:
- CSRF protection (origin check)
- IP-based rate limiting (10 req/min)

But missing:
- Authentication check

**Risk:** Unauthenticated users can:
- Sync arbitrary podcasts to the database
- Exhaust Podcast Index API quota
- Fill database with unwanted content

## Proposed Solutions

### Option A: Require authentication (Recommended)
- **Pros:** Prevents abuse, tracks who added what
- **Cons:** Logged-out users can't add podcasts
- **Effort:** Small
- **Risk:** Low

```typescript
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  // ... rest of sync logic
}
```

### Option B: Allow anonymous but with stricter rate limiting
- **Pros:** Better UX for new users
- **Cons:** Still open to abuse
- **Effort:** Small
- **Risk:** Medium

## Recommended Action

<!-- To be filled during triage -->

## Technical Details

**Affected Files:**
- `src/app/api/podcast-index/sync/route.ts`

## Acceptance Criteria

- [ ] Unauthenticated requests return 401
- [ ] Authenticated users can sync podcasts
- [ ] Rate limiting still applies
- [ ] Error message is user-friendly

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2024-02-08 | Identified during security review | Admin client endpoints need auth checks |
