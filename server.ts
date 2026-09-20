import { createServer } from "node:http";

type LocationPayload = {
  deviceId: string;
  latitude: number;
  longitude: number;
  timestamp: number;
  battery?: number;
  tracking?: boolean;
};

function isValidPayload(body: unknown): body is LocationPayload {
  if (!body || typeof body !== "object") return false;
  const value = body as Record<string, unknown>;

  return (
    typeof value.deviceId === "string" &&
    value.deviceId.length > 0 &&
    value.deviceId.length <= 100 &&
    typeof value.latitude === "number" &&
    Number.isFinite(value.latitude) &&
    value.latitude >= -90 &&
    value.latitude <= 90 &&
    typeof value.longitude === "number" &&
    Number.isFinite(value.longitude) &&
    value.longitude >= -180 &&
    value.longitude <= 180 &&
    typeof value.timestamp === "number" &&
    Number.isFinite(value.timestamp) &&
    (value.battery === undefined ||
      (typeof value.battery === "number" &&
        Number.isFinite(value.battery) &&
        value.battery >= 0 &&
        value.battery <= 100)) &&
    (value.tracking === undefined || typeof value.tracking === "boolean")
  );
}

async function readJson(req: import("node:http").IncomingMessage): Promise<unknown> {
  let raw = "";
  for await (const chunk of req) raw += chunk.toString();
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

const server = createServer(async (req, res) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method === "GET" && req.url === "/api/health") {
    res.statusCode = 200;
    res.end(JSON.stringify({
      ok: true,
      service: "retour-ecole-api",
      version: "0.1.0"
    }));
    return;
  }

  if (req.method === "POST" && req.url === "/api/location") {
    const body = await readJson(req);

    if (!isValidPayload(body)) {
      res.statusCode = 400;
      res.end(JSON.stringify({
        ok: false,
        error: "INVALID_LOCATION_PAYLOAD"
      }));
      return;
    }

    res.statusCode = 202;
    res.end(JSON.stringify({
      ok: true,
      received: body
    }));
    return;
  }

  res.statusCode = 404;
  res.end(JSON.stringify({
    ok: false,
    error: "NOT_FOUND"
  }));
});

server.listen(process.env.PORT || 3000);
