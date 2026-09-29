import app from "./app.js";
import { logger } from "./lib/logger.js";

const rawPort = process.env["PORT"] || "3000";
const port = Number(rawPort);
const host = process.env["HOST"] || "0.0.0.0";

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, host, () => {
  logger.info({ host, port }, "Server listening");
});
