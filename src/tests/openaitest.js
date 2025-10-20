import request from "supertest";
import app from "../server.js";

describe("OpenAI Routes", () => {
  it("should return AI response for a prompt", async () => {
    const res = await request(app)
      .post("/api/openai/chat")
      .send({ prompt: "Hello AI", context: "Test context" });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("response");
  });

  it("should fail if prompt is missing", async () => {
    const res = await request(app).post("/api/openai/chat").send({});
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message", "Prompt is required");
  });
});
