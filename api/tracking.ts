import type { VercelRequest, VercelResponse } from "@vercel/node";

type TrackingPayload = {
  deviceId: string;
  event: "start" | "stop";
  timestamp: number;
};

function isValidPayload(body: unknown): body is TrackingPayload {
  if (!body || typeof body !== "object") return false;

  const value = body as Record<string, unknown>;

  return (
    typeof value.deviceId === "string" &&
    value.deviceId.length > 0 &&
    value.deviceId.length <= 100 &&
    (value.event === "start" || value.event === "stop") &&
    typeof value.timestamp === "number" &&
    Number.isFinite(value.timestamp)
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
      error: "INVALID_TRACKING_PAYLOAD"
    });
  }

  return res.status(202).json({
    ok: true,
    received: req.body
  });
}
