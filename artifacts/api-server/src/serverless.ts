import serverlessHttp from "serverless-http";
import express from "express";
import cors from "cors";
import router from "./routes";
import { seedDemoAccounts } from "./seed";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", router);

let seeded = false;
const httpHandler = serverlessHttp(app);

export default async function handler(req: any, res: any) {
  if (!seeded) {
    seeded = true;
    try {
      await seedDemoAccounts();
    } catch {}
  }
  return httpHandler(req, res);
}
