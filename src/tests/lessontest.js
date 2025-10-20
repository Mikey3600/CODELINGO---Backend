import request from "supertest";
import app from "../server.js";

describe("Lesson Routes", () => {
  let lessonId;

  const sampleLesson = {
    title: "Sample Lesson",
    content: "Lesson content",
  };

  it("should create a new lesson", async () => {
    const res = await request(app).post("/api/lessons").send(sampleLesson);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("title", sampleLesson.title);
    lessonId = res.body.id;
  });

  it("should fetch all lessons", async () => {
    const res = await request(app).get("/api/lessons");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("should fetch lesson by ID", async () => {
    const res = await request(app).get(`/api/lessons/${lessonId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("id", lessonId);
  });

  it("should update lesson by ID", async () => {
    const res = await request(app)
      .put(`/api/lessons/${lessonId}`)
      .send({ title: "Updated Lesson" });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("title", "Updated Lesson");
  });

  it("should delete lesson by ID", async () => {
    const res = await request(app).delete(`/api/lessons/${lessonId}`);
    expect([204, 404]).toContain(res.statusCode);
  });
});
