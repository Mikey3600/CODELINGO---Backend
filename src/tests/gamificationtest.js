import request from "supertest";
import app from "../server.js"; // your Express app

describe("Gamification Routes", () => {
  const testUserId = "test-user-1";
  const pointsToAdd = 50;

  it("should get user points", async () => {
    const res = await request(app).get(`/api/gamification/points/${testUserId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("points");
  });

  it("should add points to user", async () => {
    const res = await request(app)
      .post(`/api/gamification/points/${testUserId}/add`)
      .send({ points: pointsToAdd });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("points");
    expect(res.body.points).toBeGreaterThanOrEqual(pointsToAdd);
  });

  it("should get leaderboard", async () => {
    const res = await request(app).get("/api/gamification/leaderboard");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("should redeem reward", async () => {
    const res = await request(app)
      .post("/api/gamification/redeem")
      .send({ userId: testUserId, rewardId: "reward-1" });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Reward redeemed");
  });
});
