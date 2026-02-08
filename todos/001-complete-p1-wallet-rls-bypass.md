---
status: complete
priority: p1
issue_id: "001"
tags: [code-review, security, supabase, critical]
dependencies: []
---

# Wallet RLS Allows Direct Balance Updates

## Problem Statement

The wallet table's Row Level Security policy allows authenticated users to directly UPDATE their own wallet balance to any value. This bypasses all application-level balance validation and could allow users to give themselves unlimited funds.

## Findings

**Location:** `supabase/migrations/001_initial_schema.sql:345-351`

```sql
CREATE POLICY "Users can update own wallet"
  ON user_wallets FOR UPDATE
  USING (auth.uid() = user_id);
```

This policy allows ANY authenticated user to execute:
```sql
UPDATE user_wallets SET balance = 999999999 WHERE user_id = auth.uid();
```

**Related Issue:** The `deduct_wallet_balance` RPC function referenced in `/src/app/api/wallet/boost/route.ts:51` does not exist in the schema. The code will fail at runtime.

## Proposed Solutions

### Option A: Remove UPDATE policy, use RPC only (Recommended)
- **Pros:** Most secure, forces all balance changes through controlled functions
- **Cons:** Requires creating RPC functions for all wallet operations
- **Effort:** Medium
- **Risk:** Low

```sql
-- Remove the UPDATE policy
DROP POLICY "Users can update own wallet" ON user_wallets;

-- Create atomic balance deduction function
CREATE OR REPLACE FUNCTION deduct_wallet_balance(
  p_user_id UUID,
  p_amount INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
  v_current_balance INTEGER;
BEGIN
  SELECT balance INTO v_current_balance
  FROM user_wallets
  WHERE user_id = p_user_id
  FOR UPDATE;  -- Lock the row

  IF v_current_balance >= p_amount THEN
    UPDATE user_wallets
    SET balance = balance - p_amount
    WHERE user_id = p_user_id;
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Option B: Restrict UPDATE to specific columns
- **Pros:** Allows client-side updates for non-sensitive fields (streaming_rate)
- **Cons:** Still requires RPC for balance changes
- **Effort:** Small
- **Risk:** Medium

```sql
CREATE POLICY "Users can update own wallet settings"
  ON user_wallets FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (balance = (SELECT balance FROM user_wallets WHERE user_id = auth.uid()));
```

## Recommended Action

<!-- To be filled during triage -->

## Technical Details

**Affected Files:**
- `supabase/migrations/001_initial_schema.sql`
- `src/app/api/wallet/boost/route.ts`
- `src/stores/wallet-store.ts`

**Database Changes Required:** Yes - new migration to fix RLS and add RPC function

## Acceptance Criteria

- [ ] Users cannot directly UPDATE wallet balance via Supabase client
- [ ] `deduct_wallet_balance` RPC function exists and works atomically
- [ ] Balance deductions are atomic (no race conditions)
- [ ] Wallet boost API route works correctly
- [ ] Existing wallet functionality not broken

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2024-02-08 | Identified during code review | RLS policies need careful review for financial data |

## Resources

- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- PR: feat/supabase-integration
