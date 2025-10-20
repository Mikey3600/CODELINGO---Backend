import request from "supertest";
import app from "../server.js"; // your Express app

describe("DSA Routes", () => {
  let problemId;

  const sampleProblem = {
    title: "Sample Problem",
    description: "Test problem description",
    difficulty: "Easy",
    tags: ["array", "string"]
  };

  it("should create a new problem", async () => {
    const res = await request(app).post("/api/dsa").send(sampleProblem);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("title", sampleProblem.title);
    problemId = res.body.id;
  });

  it("should fetch all problems", async () => {
    const res = await request(app).get("/api/dsa");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("should fetch problem by ID", async () => {
    const res = await request(app).get(`/api/dsa/${problemId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("id", problemId);
  });

  it("should update a problem", async () => {
    const res = await request(app)
      .put(`/api/dsa/${problemId}`)
      .send({ title: "Updated Title" });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("title", "Updated Title");
  });

  it("should delete a problem", async () => {
    const res = await request(app).delete(`/api/dsa/${problemId}`);
    expect([204, 404]).toContain(res.statusCode);
  });

  it("should sync problems from source", async () => {
    const res = await request(app).post("/api/dsa/sync");
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Problems synced successfully");
  });
});
