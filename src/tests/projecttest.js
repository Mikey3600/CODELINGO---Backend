import request from "supertest";
import app from "../server.js";

describe("Project Routes", () => {
  let projectId;

  const sampleProject = {
    title: "Sample Project",
    description: "Project description",
  };

  it("should create a new project", async () => {
    const res = await request(app).post("/api/projects").send(sampleProject);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("title", sampleProject.title);
    projectId = res.body.id;
  });

  it("should fetch all projects", async () => {
    const res = await request(app).get("/api/projects");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("should fetch project by ID", async () => {
    const res = await request(app).get(`/api/projects/${projectId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("id", projectId);
  });

  it("should update project by ID", async () => {
    const res = await request(app)
      .put(`/api/projects/${projectId}`)
      .send({ title: "Updated Project" });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("title", "Updated Project");
  });

  it("should delete project by ID", async () => {
    const res = await request(app).delete(`/api/projects/${projectId}`);
    expect([204, 404]).toContain(res.statusCode);
  });
});
