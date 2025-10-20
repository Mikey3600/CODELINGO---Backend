import fetch from "node-fetch";

// Base URL of the hosted LeetCode API
const BASE_URL = "https://alfa-leetcode-api.onrender.com";

// Fetch problem by slug
export async function fetchProblemBySlug(slug) {
  try {
    const res = await fetch(`${BASE_URL}/problem/${slug}`);
    if (!res.ok) throw new Error(`LeetCode API returned ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("LeetCode Service Error:", err);
    throw new Error("Failed to fetch problem from LeetCode API");
  }
}

// Fetch recent submissions of a user
export async function fetchUserSubmissions(username) {
  try {
    const res = await fetch(`${BASE_URL}/submissions/${username}`);
    if (!res.ok) throw new Error(`LeetCode API returned ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("LeetCode Service Error:", err);
    throw new Error("Failed to fetch user submissions from LeetCode API");
  }
}
