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
    (value.tracking === undefined ||
      typeof value.tracking === "boolean")
  );
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      error: "METHOD_NOT_ALLOWED"
    });
  }

  const expectedToken = process.env.CHILD_API_TOKEN;
  const receivedToken = req.headers["x-device-token"];

  if (
    !expectedToken ||
    typeof receivedToken !== "string" ||
    receivedToken !== expectedToken
  ) {
    return res.status(401).json({
      ok: false,
      error: "UNAUTHORIZED"
    });
  }

  if (!isValidPayload(req.body)) {
    return res.status(400).json({
      ok: false,
      error: "INVALID_LOCATION_PAYLOAD"
    });
  }

  return res.status(202).json({
    ok: true,
    received: req.body
  });
}
