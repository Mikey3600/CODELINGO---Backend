import request from "supertest";
import app from "../server.js";

describe("LeetCode Routes", () => {
  const testSlug = "two-sum";
  const testUsername = "testuser";

  it("should get problem by slug", async () => {
    const res = await request(app).get(`/api/leetcode/problem/${testSlug}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("title");
  });

  it("should get user submissions", async () => {
    const res = await request(app).get(`/api/leetcode/submissions/${testUsername}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
