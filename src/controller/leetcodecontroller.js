import { fetchProblemBySlug, fetchUserSubmissions } from "../services/leetcodeservices.js";

// GET /api/leetcode/problem/:slug
export const getProblemController = async (req, res) => {
  try {
    const { slug } = req.params;
    if (!slug) return res.status(400).json({ message: "Problem slug is required" });

    const problem = await fetchProblemBySlug(slug);
    res.json(problem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/leetcode/submissions/:username
export const getUserSubmissionsController = async (req, res) => {
  try {
    const { username } = req.params;
    if (!username) return res.status(400).json({ message: "Username is required" });

    const submissions = await fetchUserSubmissions(username);
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
