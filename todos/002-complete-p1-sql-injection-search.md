---
status: complete
priority: p1
issue_id: "002"
tags: [code-review, security, sql-injection]
dependencies: []
---

# SQL Injection Risk in Search Functions

## Problem Statement

User search input is directly interpolated into Supabase `.or()` filter strings without sanitization. While Supabase/PostgREST may provide some protection, this is a risky pattern that could lead to filter manipulation.

## Findings

**Location 1:** `src/lib/data/podcasts.ts:96`
```typescript
.or(`title.ilike.%${query}%,author.ilike.%${query}%,description.ilike.%${query}%`)
```

**Location 2:** `src/lib/data/episodes.ts:109`
```typescript
.or(`title.ilike.%${query}%,description.ilike.%${query}%`)
```

**Location 3:** `src/app/search/page.tsx:122-124`
```typescript
podcastQuery = podcastQuery.or(
  `title.ilike.%${debouncedQuery}%,author.ilike.%${debouncedQuery}%,description.ilike.%${debouncedQuery}%`
);
```

A malicious query like `%,id.eq.secret-id,title.ilike.%` could potentially manipulate the filter logic.

## Proposed Solutions

### Option A: Sanitize input before interpolation (Recommended)
- **Pros:** Simple, minimal code changes
- **Cons:** Need to identify all special characters
- **Effort:** Small
- **Risk:** Low

```typescript
function sanitizeSearchQuery(query: string): string {
  // Escape PostgREST filter special characters
  return query
    .replace(/[%_]/g, '\\$&')  // Escape LIKE wildcards
    .replace(/[,().]/g, '')     // Remove filter syntax chars
    .slice(0, 100);             // Limit length
}

// Usage
const safeQuery = sanitizeSearchQuery(query);
.or(`title.ilike.%${safeQuery}%,author.ilike.%${safeQuery}%`)
```

### Option B: Use parameterized full-text search
- **Pros:** Most secure, better search quality
- **Cons:** Requires schema changes (tsvector columns)
- **Effort:** Large
- **Risk:** Medium

```typescript
// Use Postgres full-text search
const { data } = await supabase
  .from('podcasts')
  .select('*')
  .textSearch('search_vector', query, { type: 'websearch' });
```

## Recommended Action

<!-- To be filled during triage -->

## Technical Details

**Affected Files:**
- `src/lib/data/podcasts.ts`
- `src/lib/data/episodes.ts`
- `src/app/search/page.tsx`
- `src/app/library/page.tsx` (similar pattern)

## Acceptance Criteria

- [ ] Search queries are sanitized before use in filters
- [ ] Special characters in search don't break queries
- [ ] Search functionality still works correctly
- [ ] Unit tests cover edge cases

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2024-02-08 | Identified during code review | Always sanitize user input even with ORMs |

## Resources

- [PostgREST Operators](https://postgrest.org/en/stable/api.html#operators)
