---
status: complete
priority: p1
issue_id: "003"
tags: [code-review, security, race-condition, data-integrity]
dependencies: ["001"]
---

# Client-Side Wallet Balance Race Conditions

## Problem Statement

The wallet store performs optimistic balance updates on the client without atomic server-side validation. Between checking the balance and deducting it, concurrent requests could cause overdrafts or lost transactions.

## Findings

**Location 1:** `src/stores/wallet-store.ts:33-37`
```typescript
sendBoost: (amount, recipient, message, episodeTitle) => {
  const { balance, userId } = get();
  if (amount <= 0 || amount > balance) return;  // Check
  set((state) => ({
    balance: Math.max(0, state.balance - amount),  // Deduct (not atomic with check)
```

**Location 2:** `src/stores/wallet-store.ts:66-69`
Same pattern in `streamSats`.

**Location 3:** `src/lib/data/user.ts:326-343`
```typescript
export async function sendBoost(...) {
  const wallet = await getUserWallet(userId);
  if (!wallet || wallet.balance < amount) return false;  // Check
  const newBalance = wallet.balance - amount;
  const balanceUpdated = await updateWalletBalance(userId, newBalance);  // Update (race!)
```

**Impact:** Two concurrent boost requests of 50 sats each on a 75 sat balance could both succeed, resulting in a -25 balance.

## Proposed Solutions

### Option A: Atomic RPC function (Recommended)
- **Pros:** Guarantees atomicity at database level
- **Cons:** Requires database function
- **Effort:** Medium
- **Risk:** Low

See todo #001 for the `deduct_wallet_balance` RPC function.

Then update the store:
```typescript
sendBoost: async (amount, recipient, message, episodeTitle) => {
  const { userId } = get();
  if (!userId) return;

  // Call API which uses atomic RPC
  const response = await fetch('/api/wallet/boost', {
    method: 'POST',
    body: JSON.stringify({ amount, recipient, message, episodeTitle })
  });

  if (response.ok) {
    // Only update local state after server confirms
    const { newBalance } = await response.json();
    set({ balance: newBalance });
  }
};
```

### Option B: Pessimistic updates only
- **Pros:** Simple, always consistent
- **Cons:** Slower UX, requires loading states
- **Effort:** Small
- **Risk:** Low

## Recommended Action

<!-- To be filled during triage -->

## Technical Details

**Affected Files:**
- `src/stores/wallet-store.ts`
- `src/lib/data/user.ts`
- `src/app/api/wallet/boost/route.ts`

## Acceptance Criteria

- [ ] Concurrent boost requests cannot overdraft balance
- [ ] Balance is validated atomically on server
- [ ] Failed transactions don't show in UI
- [ ] Successful transactions update UI correctly

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2024-02-08 | Identified during code review | Financial operations need atomic database operations |

## Resources

- Depends on: #001 (Wallet RLS and RPC function)
