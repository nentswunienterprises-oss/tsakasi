import { createClient } from "@supabase/supabase-js";

type VercelLikeRequest = {
  method?: string;
  headers?: Record<string, string>;
};

type VercelLikeResponse = {
  status: (code: number) => VercelLikeResponse;
  json: (body: unknown) => void;
};

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

function normalizeSupabaseUrl(url: string) {
  return url.replace(/\/rest\/v1\/?$/, "");
}

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Missing Supabase configuration (VITE_SUPABASE_URL and SUPABASE_SERVICE_KEY)",
  );
}

const supabase = createClient(normalizeSupabaseUrl(supabaseUrl), supabaseKey);

export default async function handler(
  req: VercelLikeRequest,
  res: VercelLikeResponse,
) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed." });
    return;
  }

  // Simple token validation
  const authHeader = req.headers?.["authorization"];
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    res.status(401).json({ error: "Unauthorized." });
    return;
  }

  // In production, validate token properly (JWT verification, session lookup, etc.)
  // For now, just check it's not empty
  if (token.length < 16) {
    res.status(401).json({ error: "Invalid token." });
    return;
  }

  try {
    const { data, error } = await supabase
      .from("business_pilot_submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      res.status(500).json({ error: `Database error: ${error.message}` });
      return;
    }

    res.status(200).json({ submissions: data || [] });
  } catch (err) {
    res.status(500).json({
      error: `Server error: ${err instanceof Error ? err.message : "Unknown error"}`,
    });
  }
}
