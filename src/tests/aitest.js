import request from "supertest";
import app from "../server.js"; // your Express app

describe("AI Routes", () => {
  it("should return an AI response for a valid prompt", async () => {
    const res = await request(app)
      .post("/api/ai/query")
      .send({ prompt: "Hello AI", context: "Test context" });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("response");
  });

  it("should return 400 if prompt is missing", async () => {
    const res = await request(app)
      .post("/api/ai/query")
      .send({ context: "Test context" });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message", "Prompt is required");
  });
});
