import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import bodyParser from "body-parser";
import { drizzlePool } from "../db/conn";

const port = process.env.BACKEND_PORT; //6977

const app = express();
app.use(bodyParser.json());
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

app.listen(port, () => {
  console.log(`listening on port ${port}...`);
});
