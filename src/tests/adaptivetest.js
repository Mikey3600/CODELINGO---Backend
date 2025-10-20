import request from "supertest";
import app from "../server.js"; // your Express app

describe("Adaptive Test Routes", () => {
  let testId;

  // Create a new adaptive test
  it("should create a new adaptive test", async () => {
    const res = await request(app)
      .post("/api/adaptive-tests")
      .send({
        userId: "test-user-1",
        testData: { questions: ["Q1", "Q2"] },
        currentLevel: 1,
        score: 0,
        startedAt: new Date().toISOString(),
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("id");
    testId = res.body.id;
  });

  // Get all adaptive tests
  it("should fetch all adaptive tests", async () => {
    const res = await request(app).get("/api/adaptive-tests");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // Get adaptive test by ID
  it("should fetch adaptive test by ID", async () => {
    const res = await request(app).get(`/api/adaptive-tests/${testId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("id", testId);
  });

  // Update adaptive test by ID
  it("should update adaptive test", async () => {
    const res = await request(app)
      .put(`/api/adaptive-tests/${testId}`)
      .send({ score: 5 });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("score", 5);
  });

  // Submit answer for adaptive test
  it("should submit an answer", async () => {
    const res = await request(app)
      .post(`/api/adaptive-tests/${testId}/submit`)
      .send({ answer: "A" });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("submitted", true);
  });

  // Get results for adaptive test
  it("should fetch adaptive test results", async () => {
    const res = await request(app).get(`/api/adaptive-tests/${testId}/results`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("results");
  });

  // Delete adaptive test by ID
  it("should delete adaptive test", async () => {
    const res = await request(app).delete(`/api/adaptive-tests/${testId}`);
    expect([200, 204]).toContain(res.statusCode); // 204 No Content
  });
});
