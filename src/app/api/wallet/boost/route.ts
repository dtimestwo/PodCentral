import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isValidOrigin } from "@/lib/api/middleware";

const MAX_MESSAGE_LENGTH = 500;

export async function POST(request: NextRequest) {
  // CSRF protection
  if (!isValidOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { amount, recipient, message, episodeTitle } = body;

    if (typeof amount !== "number" || amount <= 0 || !Number.isInteger(amount)) {
      return NextResponse.json(
        { error: "amount must be a positive integer" },
        { status: 400 }
      );
    }

    if (!recipient || typeof recipient !== "string") {
      return NextResponse.json(
        { error: "recipient is required" },
        { status: 400 }
      );
    }

    // Validate message length
    if (message && (typeof message !== "string" || message.length > MAX_MESSAGE_LENGTH)) {
      return NextResponse.json(
        { error: `message must be a string with max ${MAX_MESSAGE_LENGTH} characters` },
        { status: 400 }
      );
    }

    // Use atomic RPC function to prevent race conditions
    const { data: results, error: rpcError } = await supabase
      .rpc("deduct_wallet_balance", {
        p_user_id: user.id,
        p_amount: amount,
      });

    if (rpcError) {
      console.error("Wallet deduction error:", rpcError);
      return NextResponse.json({ error: "Failed to process transaction" }, { status: 500 });
    }

    // RPC returns an array with one row
    const result = results?.[0];

    if (!result?.success) {
      return NextResponse.json(
        { error: "Insufficient balance" },
        { status: 400 }
      );
    }

    // Record transaction
    const { error: txError } = await supabase.from("wallet_transactions").insert({
      user_id: user.id,
      type: "boost",
      amount: -amount,
      recipient,
      message: message || null,
      episode_title: episodeTitle || null,
    });

    if (txError) {
      // Log error but don't fail - balance was already deducted atomically
      console.error("Transaction record error:", txError);
    }

    return NextResponse.json({
      success: true,
      newBalance: result.new_balance,
    });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
