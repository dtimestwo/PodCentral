---
status: pending
priority: p2
issue_id: "005"
tags: [code-review, security, authentication]
dependencies: []
---

# Open Redirect Vulnerability in Auth Callback

## Problem Statement

The auth callback route accepts a `next` parameter for post-login redirect without validating it against an allowlist. This could be exploited for phishing attacks.

## Findings

**Location:** `src/app/auth/callback/route.ts:7,14`

```typescript
const next = searchParams.get("next") ?? "/";
// ...
return NextResponse.redirect(`${origin}${next}`);
```

While the redirect uses the request's origin (preventing cross-origin redirects), an attacker could still redirect to malicious paths within the app or use path traversal.

**Example attack:**
```
/auth/callback?next=/login%3Fredirect%3Dhttps://evil.com
```

## Proposed Solutions

### Option A: Allowlist valid paths (Recommended)
- **Pros:** Most secure
- **Cons:** Must maintain list
- **Effort:** Small
- **Risk:** Low

```typescript
const ALLOWED_REDIRECTS = ['/', '/library', '/settings', '/search'];

const next = searchParams.get("next") ?? "/";
const safePath = ALLOWED_REDIRECTS.includes(next) ? next : "/";
return NextResponse.redirect(`${origin}${safePath}`);
```

### Option B: Validate path format
- **Pros:** Flexible
- **Cons:** Could miss edge cases
- **Effort:** Small
- **Risk:** Medium

```typescript
const next = searchParams.get("next") ?? "/";
// Must start with / and not contain protocol indicators
const isValid = next.startsWith('/') &&
                !next.includes('//') &&
                !next.includes(':');
const safePath = isValid ? next : "/";
```

## Recommended Action

<!-- To be filled during triage -->

## Technical Details

**Affected Files:**
- `src/app/auth/callback/route.ts`

## Acceptance Criteria

- [ ] Only valid internal paths are allowed as redirects
- [ ] Invalid paths redirect to home
- [ ] Login flow still works correctly
- [ ] OAuth callbacks work correctly

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2024-02-08 | Identified during security review | Always validate redirect parameters |
