import express from "express";
import swaggerUi from "swagger-ui-express";
import usersRouter from "./routes/users.js";
import pool from "./db.js";
import swaggerDocument from "./swagger.json" with { type: "json" };

const app = express();
app.use(express.json());

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/users", usersRouter);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/ready", async (_req, res) => {
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
