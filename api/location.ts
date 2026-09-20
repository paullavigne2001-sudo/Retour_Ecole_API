import type { VercelRequest, VercelResponse } from "@vercel/node";

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

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      error: "METHOD_NOT_ALLOWED"
    });
  }

  if (!isValidPayload(req.body)) {
    return res.status(400).json({
      ok: false,
      error: "INVALID_LOCATION_PAYLOAD"
    });
  }

  // Étape 1 : validation et accusé de réception.
  // Le stockage persistant sera ajouté à l'étape suivante.
  return res.status(202).json({
    ok: true,
    received: {
      deviceId: req.body.deviceId,
      latitude: req.body.latitude,
      longitude: req.body.longitude,
      timestamp: req.body.timestamp,
      battery: req.body.battery ?? null,
      tracking: req.body.tracking ?? true
    }
  });
}
