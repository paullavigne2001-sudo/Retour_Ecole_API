import type { VercelRequest, VercelResponse } from "@vercel/node";

type HistoryRow = {
  id: number;
  device_id: string;
  latitude: number;
  longitude: number;
  timestamp: number;
  battery: number | null;
  tracking: boolean;
  created_at: string;
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({
      ok: false,
      error: "METHOD_NOT_ALLOWED"
    });
  }

  const expectedToken = process.env.PARENT_API_TOKEN;
  const receivedToken = req.headers["x-parent-token"];

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

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({
      ok: false,
      error: "SUPABASE_NOT_CONFIGURED"
    });
  }

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/child_location_history?device_id=eq.child-01&select=id,device_id,latitude,longitude,timestamp,battery,tracking,created_at&order=timestamp.desc&limit=1000`,
      {
        method: "GET",
        headers: {
          apikey: supabaseKey
        }
      }
    );

    if (!response.ok) {
      return res.status(502).json({
        ok: false,
        error: "SUPABASE_HISTORY_READ_FAILED"
      });
    }

    const data = (await response.json()) as HistoryRow[];

    // The database query returns the newest points first.
    // Reverse them so the parent map receives the route chronologically.
    data.reverse();

    return res.status(200).json({
      ok: true,
      history: data
    });
  } catch (_error) {
    return res.status(502).json({
      ok: false,
      error: "SUPABASE_CONNECTION_FAILED"
    });
  }
}
