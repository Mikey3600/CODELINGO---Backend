import request from "supertest";
import app from "../server.js"; // your Express app

describe("Challenge Routes", () => {
  let createdChallengeId;

  const sampleChallenge = {
    title: "Sample Challenge",
    description: "This is a test challenge",
    difficulty: "Easy",
  };

  // Create a new challenge
  it("should create a new challenge", async () => {
    const res = await request(app)
      .post("/api/challenges")
      .send(sampleChallenge);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("title", sampleChallenge.title);
    createdChallengeId = res.body.id; // store for later tests
  });

  // Get all challenges
  it("should fetch all challenges", async () => {
    const res = await request(app).get("/api/challenges");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // Get challenge by ID
  it("should fetch challenge by ID", async () => {
    const res = await request(app).get(`/api/challenges/${createdChallengeId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("id", createdChallengeId);
  });

  // Get non-existing challenge
  it("should return 404 for non-existing challenge", async () => {
    const res = await request(app).get("/api/challenges/nonexistentid");
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("message", "Challenge not found");
  });

  // Update challenge
  it("should update challenge by ID", async () => {
    const res = await request(app)
      .put(`/api/challenges/${createdChallengeId}`)
      .send({ title: "Updated Challenge Title" });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("title", "Updated Challenge Title");
  });

  // Delete challenge
  it("should delete challenge by ID", async () => {
    const res = await request(app).delete(`/api/challenges/${createdChallengeId}`);
    expect([204, 404]).toContain(res.statusCode); // 204 if deleted, 404 if already deleted
  });
});
