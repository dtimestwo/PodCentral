-- Migration: Fix wallet security vulnerabilities
-- Issues addressed:
-- 1. RLS allows direct balance updates (P1)
-- 2. Missing deduct_wallet_balance RPC function (P1)
-- 3. Race conditions in wallet operations (P1)

-- Drop the insecure UPDATE policy that allows direct balance changes
DROP POLICY IF EXISTS "Users can update own wallet" ON user_wallets;

-- Create a more restrictive policy that only allows updating streaming_rate
CREATE POLICY "Users can update own wallet settings"
  ON user_wallets FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    -- Only allow updating streaming_rate, not balance
    -- The balance column must remain unchanged
    balance = (SELECT balance FROM user_wallets WHERE user_id = auth.uid())
  );

-- Create atomic balance deduction function
-- This function safely deducts balance and prevents overdrafts
CREATE OR REPLACE FUNCTION deduct_wallet_balance(
  p_user_id UUID,
  p_amount INTEGER
) RETURNS TABLE(success BOOLEAN, new_balance INTEGER) AS $$
DECLARE
  v_current_balance INTEGER;
  v_new_balance INTEGER;
BEGIN
  -- Lock the row and get current balance
  SELECT balance INTO v_current_balance
  FROM user_wallets
  WHERE user_id = p_user_id
  FOR UPDATE;

  -- Check if user has wallet
  IF v_current_balance IS NULL THEN
    RETURN QUERY SELECT FALSE, 0;
    RETURN;
  END IF;

  -- Check if sufficient balance
  IF v_current_balance < p_amount THEN
    RETURN QUERY SELECT FALSE, v_current_balance;
    RETURN;
  END IF;

  -- Deduct balance atomically
  v_new_balance := v_current_balance - p_amount;

  UPDATE user_wallets
  SET balance = v_new_balance
  WHERE user_id = p_user_id;

  RETURN QUERY SELECT TRUE, v_new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create atomic balance addition function (for top-ups)
CREATE OR REPLACE FUNCTION add_wallet_balance(
  p_user_id UUID,
  p_amount INTEGER
) RETURNS TABLE(success BOOLEAN, new_balance INTEGER) AS $$
DECLARE
  v_new_balance INTEGER;
BEGIN
  UPDATE user_wallets
  SET balance = balance + p_amount
  WHERE user_id = p_user_id
  RETURNING balance INTO v_new_balance;

  IF v_new_balance IS NULL THEN
    RETURN QUERY SELECT FALSE, 0;
  ELSE
    RETURN QUERY SELECT TRUE, v_new_balance;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION deduct_wallet_balance(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION add_wallet_balance(UUID, INTEGER) TO authenticated;
