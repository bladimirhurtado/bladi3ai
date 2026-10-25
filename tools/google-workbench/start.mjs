import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const clients = [
  { name: "Gmail Workbench", cwd: path.join(root, "gmail-client"), port: "8787" },
  { name: "Drive Workbench", cwd: path.join(root, "drive-client"), port: "8788" },
];
const children = clients.map((client) => {
  const child = spawn(process.execPath, ["server.mjs"], {
    cwd: client.cwd,
    env: process.env,
    stdio: "inherit",
  });
  console.log(`[${client.name}] iniciado en http://127.0.0.1:${client.port}`);
  child.on("exit", (code, signal) => {
    if (code !== 0 && code !== null) console.error(`[${client.name}] terminó con código ${code}`);
    if (signal) console.log(`[${client.name}] terminó por señal ${signal}`);
  });
  return child;
});
function stop(signal = "SIGINT") {
  for (const child of children) if (!child.killed) child.kill(signal);
}
process.on("SIGINT", () => stop("SIGINT"));
process.on("SIGTERM", () => stop("SIGTERM"));
