import request from "supertest";
import app from "../server.js"; // your Express app

describe("Auth Routes", () => {
  let token;
  const testEmail = "auth@test.com";
  const testUsername = "testuser";
  const testPassword = "123456";

  // Register user
  it("should register a new user", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: testEmail, username: testUsername, password: testPassword });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("email", testEmail);
  });

  // Prevent duplicate registration
  it("should return 409 for existing user", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: testEmail, username: testUsername, password: testPassword });

    expect(res.statusCode).toBe(409);
    expect(res.body).toHaveProperty("message", "User already exists");
  });

  // Login user
  it("should login a user and return token", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: testEmail, password: testPassword });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
    token = res.body.token;
  });

  // Get profile with token
  it("should fetch user profile", async () => {
    const res = await request(app)
      .get("/api/auth/profile")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("email", testEmail);
  });

  // Logout
  it("should logout successfully", async () => {
    const res = await request(app).post("/api/auth/logout");
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Logged out successfully");
  });
});
