import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("wallet_transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  interface DbTransaction {
    id: string;
    type: string;
    amount: number;
    recipient: string | null;
    message: string | null;
    created_at: string;
    episode_title: string | null;
  }
  const transactions = (data || []).map((tx: DbTransaction) => ({
    id: tx.id,
    type: tx.type,
    amount: tx.amount,
    recipient: tx.recipient,
    message: tx.message,
    timestamp: tx.created_at,
    episodeTitle: tx.episode_title,
  }));

  return NextResponse.json({ transactions });
}
