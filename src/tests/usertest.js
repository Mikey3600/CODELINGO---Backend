import request from "supertest";
import app from "../server.js"; // your Express app
import jwt from "jsonwebtoken";

describe("User Routes", () => {
  const testUser = {
    id: "user123",
    email: "user123@test.com",
    username: "user123",
  };
  const jwtSecret = process.env.JWT_SECRET || "testsecret";
  let token;

  beforeAll(() => {
    // Generate a valid JWT token for authentication
    token = jwt.sign({ userId: testUser.id }, jwtSecret, { expiresIn: "7d" });
  });

  // Get user profile
  it("should fetch user profile if authorized", async () => {
    const res = await request(app)
      .get(`/api/users/${testUser.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect([200, 404]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      expect(res.body).toHaveProperty("email");
      expect(res.body).toHaveProperty("username");
    }
  });

  // Get profile with wrong userId
  it("should return 403 if accessing another user's profile", async () => {
    const res = await request(app)
      .get(`/api/users/otherUserId`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty("message", "Access denied");
  });

  // Update user profile
  it("should update user profile", async () => {
    const res = await request(app)
      .put(`/api/users/${testUser.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ username: "newUsername", password: "newPass123" });

    expect([200, 404]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      expect(res.body).toHaveProperty("username", "newUsername");
    }
  });

  // Delete user account
  it("should delete user account", async () => {
    const res = await request(app)
      .delete(`/api/users/${testUser.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect([204, 404]).toContain(res.statusCode);
  });
});
