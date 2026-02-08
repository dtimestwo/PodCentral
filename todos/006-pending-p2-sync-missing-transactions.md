---
status: pending
priority: p2
issue_id: "006"
tags: [code-review, data-integrity, performance]
dependencies: []
---

# Podcast Sync Lacks Database Transactions

## Problem Statement

The podcast sync operation performs many related database operations (podcast, episodes, chapters, persons, etc.) without a transaction wrapper. If the sync fails partway through, the database will be in an inconsistent state.

## Findings

**Location:** `src/lib/podcast-index/sync.ts:36-259`

The `syncPodcastFromIndex` function:
1. Upserts podcast (line 45)
2. Upserts podcast_funding (line 65)
3. Upserts value_configs (line 82)
4. Deletes then inserts value_recipients (line 97, 106)
5. Inserts/updates episodes (lines 127-172)
6. Syncs persons for each episode (line 277)
7. Syncs chapters (line 329)
8. Syncs transcript (line 432)

**Additional Issues:**
- Delete-then-insert patterns (lines 97-114, 344-357, 464-476) are not atomic
- Episode updates in a loop (lines 166-170) - N+1 pattern
- Missing unique constraints for upsert conflict columns

## Proposed Solutions

### Option A: Supabase RPC with transaction (Recommended)
- **Pros:** Full atomicity, single round trip
- **Cons:** Complex SQL function
- **Effort:** Large
- **Risk:** Medium

Create a PostgreSQL function that wraps all sync operations in a transaction.

### Option B: Use Supabase edge function with transaction
- **Pros:** Can use `supabase.rpc()` with transaction support
- **Cons:** Requires edge function deployment
- **Effort:** Medium
- **Risk:** Low

### Option C: Add compensation/rollback logic
- **Pros:** Works with current architecture
- **Cons:** Complex, not truly atomic
- **Effort:** Medium
- **Risk:** Medium

## Recommended Action

<!-- To be filled during triage -->

## Technical Details

**Affected Files:**
- `src/lib/podcast-index/sync.ts`
- `supabase/migrations/` (new migration for constraints)

**Missing Unique Constraints:**
- `podcast_funding`: needs `UNIQUE(podcast_id)`
- `value_configs`: needs `UNIQUE(podcast_id) WHERE episode_id IS NULL`
- `persons`: needs `UNIQUE(name, role)`

## Acceptance Criteria

- [ ] Sync operations are atomic (all or nothing)
- [ ] Failed syncs don't leave partial data
- [ ] Unique constraints prevent duplicate inserts
- [ ] Performance is acceptable (batch operations)

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2024-02-08 | Identified during data integrity review | Complex multi-table operations need transactions |
