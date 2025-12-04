import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import usersRouter from "./routes/users.js";
import pool from "./db.js";

const app = express();
app.use(express.json());

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Mini API TS",
      version: "1.0.0",
      description: "API de démonstration avec TypeScript et Swagger",
    },
    servers: [{ url: "http://localhost:3000" }],
  },
  apis: ["./src/routes/*.ts"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/users", usersRouter);

// Health check endpoint for Kubernetes probes
app.get("/health", (_req, res) => {
  res.status(200).send({ status: "ok" });
});

// Readiness endpoint that checks DB connectivity
app.get("/ready", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.status(200).send({ status: "ready" });
  } catch (err) {
    res.status(503).send({ status: "unavailable", error: (err as Error).message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
  console.log(`Swagger docs on http://localhost:${port}/docs`);
});
