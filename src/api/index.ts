import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { drizzlePool } from "../db/conn";
import { testTable } from "../db/schema";

const port = process.env.BACKEND_PORT; //6977

const app = express();
app.use([
  cors({
    origin: `http://localhost:${process.env.FRONTEND_PORT}`,
    credentials: true,
  }),
  helmet(),
]);

app.get("/", async (req, res) => {
  res.json({ success: true, msg: "hello world" });
});

app.post("/", async (req, res) => {
  await drizzlePool.insert(testTable).values({ name: "LMAO" });
  res.json({ success: true, msg: "inserted!" });
});

app.listen(port, () => {
  console.log(`listening on port ${port}...`);
});
