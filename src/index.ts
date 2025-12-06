import express from "express";
import swaggerUi from "swagger-ui-express";
import usersRouter from "./routes/users.js";
import pool from "./db.js";
import swaggerDocument from "./swagger.json" with { type: "json" };
import promClient from "prom-client";

const app = express();
app.use(express.json());

// Prometheus metrics setup
const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

const httpRequestTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

const dbQueryDuration = new promClient.Histogram({
  name: 'db_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['query_type'],
  registers: [register]
});

// Middleware to track metrics
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path || req.path;
    
    httpRequestDuration.observe(
      { method: req.method, route, status_code: res.statusCode },
      duration
    );
    
    httpRequestTotal.inc({
      method: req.method,
      route,
      status_code: res.statusCode
    });
  });
  
  next();
});

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

// Prometheus metrics endpoint
app.get("/metrics", async (_req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

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
  console.log("Metrics on http://0.0.0.0:3000/metrics");
});

export { dbQueryDuration };
