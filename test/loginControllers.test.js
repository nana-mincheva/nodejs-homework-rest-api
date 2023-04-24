const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");

const { DB_HOST, PORT = 3000 } = process.env;
/* eslint-disable */
describe("test for login controllers", () => {
    beforeAll(() => {
  mongoose
    .connect(DB_HOST)
    .then(() => {
      console.log("database connection successful");
      app.listen(PORT, () => {
        console.log(`Server running. Use our API on port: ${PORT}`);
      });
    })
    .catch((error) => {
      console.log(`Server is not running. Error message: ${error.message}`);
      process.exit(1);
    });
});
    test("login returns response status 200 and response body must contain a token ", async () => {
        const response = await request(app).post("/api/users/login").send({
            email: "nanamincheva@gmail.com",
            password: "111111",
        });
        expect(response.status).toBe(200);
        expect(typeof response.body.token).toBe("string");
    });
});
