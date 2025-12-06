import express from "express";
import swaggerUi from "swagger-ui-express";
import usersRouter from "./routes/users.js";
import pool from "./db.js";
import swaggerDocument from "./swagger.json" with { type: "json" };

const app = express();
app.use(express.json());

// Swagger Basic Auth middleware
function swaggerAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const user = process.env.SWAGGER_USER || "admin";
  const pass = process.env.SWAGGER_PASS || "secret";

  const b64auth = (req.headers.authorization || "").split(" ")[1] || "";
  const [login, password] = Buffer.from(b64auth, "base64").toString().split(":");

  if (login === user && password === pass) {
    return next();
  }

  res.set("WWW-Authenticate", 'Basic realm="Swagger Docs"');
  res.status(401).send("Authentication required.");
}

app.use("/docs", swaggerAuth, swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// API v1 routes
app.use("/api/v1/users", usersRouter);

app.get("/api/v1/health", (req, res) => {
  res.json({ status: "ok", version: "1.0.0" });
});

app.get("/api/v1/ready", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.status(200).send({ status: "ready" });
  } catch (err) {
    res.status(503).send({ status: "unavailable", error: (err as Error).message });
  }
});

app.listen(3000, "0.0.0.0", () => {
  console.log("API running on http://0.0.0.0:3000");
  console.log("Swagger docs on http://0.0.0.0:3000/docs");
});
