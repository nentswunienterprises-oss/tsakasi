import { createClient } from "@supabase/supabase-js";

const supabaseUrl = (process.env.VITE_SUPABASE_URL || "").trim();
const supabaseKey = (process.env.SUPABASE_SERVICE_KEY || "").trim();

function normalizeSupabaseUrl(url) {
  return url.replace(/\/rest\/v1\/?$/, "");
}

const supabase =
  supabaseUrl && supabaseKey
    ? createClient(normalizeSupabaseUrl(supabaseUrl), supabaseKey)
    : null;

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed." });
    return;
  }

  const authHeader = req.headers?.authorization;
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    res.status(401).json({ error: "Unauthorized." });
    return;
  }

  if (token.length < 16) {
    res.status(401).json({ error: "Invalid token." });
    return;
  }

  if (!supabase) {
    res.status(500).json({
      error: "Missing Supabase configuration (VITE_SUPABASE_URL and SUPABASE_SERVICE_KEY).",
    });
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
