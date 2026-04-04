#!/usr/bin/env node

import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..");
const envFilePath = path.join(repoRoot, ".env");

function stripWrappedQuotes(value) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

function parseDotEnvFile() {
  if (!fs.existsSync(envFilePath)) {
    return {};
  }

  const content = fs.readFileSync(envFilePath, "utf8");
  const parsed = {};
  const lines = content.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separator = trimmed.indexOf("=");
    if (separator < 0) {
      continue;
    }

    const key = trimmed.slice(0, separator).trim();
    if (!key) {
      continue;
    }

    const rawValue = trimmed.slice(separator + 1);
    parsed[key] = stripWrappedQuotes(rawValue);
  }

  return parsed;
}

const dotenvValues = parseDotEnvFile();

function readEnv(name, fallback = "") {
  const value = process.env[name];
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }
  const dotEnvValue = dotenvValues[name];
  if (typeof dotEnvValue === "string" && dotEnvValue.trim().length > 0) {
    return dotEnvValue.trim();
  }
  return fallback;
}

function readPositiveInt(name, fallback) {
  const raw = readEnv(name, "");
  if (!raw) {
    return fallback;
  }

  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${name} must be a positive integer, got: ${raw}`);
  }
  return parsed;
}

const config = {
  engineUrl: readEnv("UNLINK_ENGINE_URL", ""),
  apiKey: readEnv("UNLINK_API_KEY", ""),
  token: readEnv("UNLINK_TOKEN", ""),
  pollIntervalMs: readPositiveInt("UNLINK_POLL_INTERVAL_MS", 4000),
  pollTimeoutMs: readPositiveInt("UNLINK_POLL_TIMEOUT_MS", 180000),
};

const outFile = path.join(repoRoot, "extension/background/unlink-exec.bundle.js");

await build({
  entryPoints: [path.join(__dirname, "src/index.js")],
  outfile: outFile,
  bundle: true,
  format: "esm",
  platform: "browser",
  target: ["chrome120"],
  minify: true,
  sourcemap: false,
  alias: {
    module: path.join(__dirname, "src/module-shim.js"),
  },
  define: {
    __HECATE_UNLINK_ENGINE_URL__: JSON.stringify(config.engineUrl),
    __HECATE_UNLINK_API_KEY__: JSON.stringify(config.apiKey),
    __HECATE_UNLINK_TOKEN__: JSON.stringify(config.token),
    __HECATE_UNLINK_POLL_INTERVAL_MS__: String(config.pollIntervalMs),
    __HECATE_UNLINK_POLL_TIMEOUT_MS__: String(config.pollTimeoutMs),
  },
});

console.log(`[unlink-exec] Built bundle: ${outFile}`);
