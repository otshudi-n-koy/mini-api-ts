import { Pool } from "pg";
import fs from "fs";

const sql = fs.readFileSync("scripts/reset.sql", "utf8");

const pool = new Pool({
  host: "localhost",
  port: 5433,
  user: "miniapiuser",
  password: "miniapipass",
  database: "postgres",
});

(async () => {
  try {
    await pool.query(sql);
    console.log("✅ Base reset avec succès");
  } catch (err) {
    console.error("❌ Erreur lors du reset :", err);
  } finally {
    await pool.end();
  }
})();
