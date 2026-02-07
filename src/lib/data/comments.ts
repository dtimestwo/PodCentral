import { createClient } from "@/lib/supabase/server";
import type { Comment } from "@/lib/types";

export async function getCommentsByEpisodeId(episodeId: string): Promise<Comment[]> {
  const supabase = await createClient();

  // Fetch all comments for the episode (both top-level and replies)
  const { data: allComments, error } = await supabase
    .from("comments")
    .select("*")
    .eq("episode_id", episodeId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching comments:", error);
    return [];
  }

  // Build comment tree
  const commentMap = new Map<string, Comment>();
  const topLevelComments: Comment[] = [];

  // First pass: create all comment objects
  for (const c of allComments) {
    const comment: Comment = {
      id: c.id,
      author: c.author,
      authorAvatar: c.author_avatar,
      text: c.text,
      timestamp: c.created_at,
      platform: c.platform as Comment["platform"],
      boostAmount: c.boost_amount ?? undefined,
      replies: [],
    };
    commentMap.set(c.id, comment);
  }

  // Second pass: build the tree
  for (const c of allComments) {
    const comment = commentMap.get(c.id)!;
    if (c.parent_id) {
      const parent = commentMap.get(c.parent_id);
      if (parent) {
        parent.replies.push(comment);
      }
    } else {
      topLevelComments.push(comment);
    }
  }

  return topLevelComments;
}

export async function addComment(
  episodeId: string,
  text: string,
  author: string,
  authorAvatar: string,
  platform: Comment["platform"],
  parentId?: string,
  userId?: string,
  boostAmount?: number
): Promise<Comment | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("comments")
    .insert({
      episode_id: episodeId,
      parent_id: parentId,
      user_id: userId,
      author,
      author_avatar: authorAvatar,
      text,
      platform,
      boost_amount: boostAmount,
    })
    .select()
    .single();

  if (error) {
    console.error("Error adding comment:", error);
    return null;
  }

  return {
    id: data.id,
    author: data.author,
    authorAvatar: data.author_avatar,
    text: data.text,
    timestamp: data.created_at,
    platform: data.platform as Comment["platform"],
    boostAmount: data.boost_amount ?? undefined,
    replies: [],
  };
}
