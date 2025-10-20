import { supabase } from '../config/supabaseClient.js';

const USER_STATS_TABLE = 'user_stats';

// 🔹 Get all user stats
export async function getUserStats(userId) {
  const { data, error } = await supabase
    .from(USER_STATS_TABLE)
    .select('*')
    .eq('userId', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data || { userId, xp: 0, streak: 0, points: 0 };
}

// 🔹 Get only user points
export async function getUserPoints(userId) {
  const stats = await getUserStats(userId);
  return stats.points || 0;
}

// 🔹 Add points to user
export async function addPointsToUser(userId, points) {
  const current = await getUserStats(userId);
  const newPoints = (current.points || 0) + points;

  const { data, error } = await supabase
    .from(USER_STATS_TABLE)
    .upsert({ userId, points: newPoints }, { onConflict: 'userId' })
    .single();

  if (error) throw error;
  return data.points;
}

// 🔹 Update any user stats (XP, streak, etc.)
export async function updateUserStats(userId, updates) {
  const { data, error } = await supabase
    .from(USER_STATS_TABLE)
    .upsert({ userId, ...updates }, { onConflict: 'userId' })
    .single();

  if (error) throw error;
  return data;
}

// 🔹 Increment XP and streak
export async function incrementUserXP(userId, xp) {
  const current = await getUserStats(userId);
  const newXP = (current.xp || 0) + xp;
  const newStreak = (current.streak || 0) + 1;

  return updateUserStats(userId, { xp: newXP, streak: newStreak });
}

// 🔹 Reset streak
export async function resetUserStreak(userId) {
  return updateUserStats(userId, { streak: 0 });
}

// 🔹 Leaderboard (Top 10 by XP)
export async function getLeaderboard(limit = 10) {
  const { data, error } = await supabase
    .from(USER_STATS_TABLE)
    .select('userId, xp, streak, points')
    .order('xp', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

// 🔹 Redeem reward example (just demo logic)
export async function redeemReward(userId, rewardId) {
  const user = await getUserStats(userId);
  if (user.points < 100) throw new Error('Not enough points to redeem this reward.');
  const remaining = user.points - 100;
  await updateUserStats(userId, { points: remaining });
  return { userId, rewardId, remainingPoints: remaining };
}
