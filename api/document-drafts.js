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

const TABLE_NAME = "document_composer_drafts";

export default async function handler(req, res) {
  if (!supabase) {
    res.status(500).json({
      error: "Missing Supabase configuration (VITE_SUPABASE_URL and SUPABASE_SERVICE_KEY).",
    });
    return;
  }

  try {
    if (req.method === "GET") {
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select("id, name, updated_at, state")
        .order("updated_at", { ascending: false });

      if (error) {
        res.status(500).json({ error: `Database error: ${error.message}` });
        return;
      }

      res.status(200).json({
        drafts: (data || []).map((row) => ({
          id: row.id,
          name: row.name,
          updatedAt: row.updated_at,
          state: row.state,
        })),
      });
      return;
    }

    if (req.method === "POST") {
      const parsedBody =
        typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
      const draft = parsedBody?.draft || {};

      if (
        typeof draft.id !== "string" ||
        typeof draft.name !== "string" ||
        typeof draft.updatedAt !== "string" ||
        typeof draft.state !== "object" ||
        !draft.state
      ) {
        res.status(400).json({ error: "Invalid draft payload." });
        return;
      }

      const { error } = await supabase.from(TABLE_NAME).upsert(
        {
          id: draft.id,
          name: draft.name,
          updated_at: draft.updatedAt,
          state: draft.state,
        },
        {
          onConflict: "id",
        },
      );

      if (error) {
        res.status(500).json({ error: `Database error: ${error.message}` });
        return;
      }

      res.status(200).json({ ok: true });
      return;
    }

    if (req.method === "DELETE") {
      const parsedBody =
        typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
      const draftId = parsedBody?.draftId;

      if (typeof draftId !== "string" || !draftId) {
        res.status(400).json({ error: "Draft id is required." });
        return;
      }

      const { error } = await supabase.from(TABLE_NAME).delete().eq("id", draftId);

      if (error) {
        res.status(500).json({ error: `Database error: ${error.message}` });
        return;
      }

      res.status(200).json({ ok: true });
      return;
    }

    res.status(405).json({ error: "Method not allowed." });
  } catch (error) {
    res.status(500).json({
      error:
        error instanceof Error
          ? `Draft API failed: ${error.message}`
          : "Draft API failed.",
    });
  }
}