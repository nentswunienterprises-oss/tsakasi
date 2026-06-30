import crypto from "node:crypto";
import { createServer } from "node:http";
import { URL } from "node:url";
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const PORT = Number(process.env.LOCAL_API_PORT || 3001);

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const equalIndex = trimmed.indexOf("=");
    if (equalIndex < 1) {
      continue;
    }

    const key = trimmed.slice(0, equalIndex).trim();
    const value = trimmed.slice(equalIndex + 1).trim();
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(path.resolve(process.cwd(), ".env"));
loadEnvFile(path.resolve(process.cwd(), ".env.local"));

const rawSupabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || "";
const adminPassword = (process.env.ADMIN_PASSWORD || "").replace(/\r?\n$/, "");
const pilotWebhookUrl = process.env.PILOT_WEBHOOK_URL || "";

function normalizeSupabaseUrl(url) {
  return url.replace(/\/rest\/v1\/?$/, "");
}

const supabase =
  rawSupabaseUrl && supabaseServiceKey
    ? createClient(normalizeSupabaseUrl(rawSupabaseUrl), supabaseServiceKey)
    : null;

function sendJson(res, statusCode, body) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
  });
  res.end(JSON.stringify(body));
}

function sendBinary(res, statusCode, buffer, fileName, contentType) {
  res.writeHead(statusCode, {
    "Content-Type": contentType,
    "Content-Length": buffer.length,
    "Content-Disposition": `attachment; filename="${fileName}"`,
    "Cache-Control": "no-store",
  });
  res.end(buffer);
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
    });
    req.on("end", () => {
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", (error) => reject(error));
  });
}

const requiredFields = [
  "businessName",
  "contactPerson",
  "businessType",
  "town",
  "currentlyOfferDelivery",
  "currentDeliveryMethod",
  "averageDeliveriesPerWeek",
  "mainDeliveryPain",
  "localDeliveryPartnerInterest",
  "shortInterviewInterest",
  "whatsappNumber",
  "email",
];

const server = createServer(async (req, res) => {
  const requestUrl = new URL(req.url || "/", `http://localhost:${PORT}`);
  
  console.log(`[${new Date().toISOString()}] ${req.method} ${requestUrl.pathname}`);

  if (req.method === "POST" && requestUrl.pathname === "/api/admin/auth") {
    const body = await parseBody(req).catch(() => null);
    if (!body || typeof body.password !== "string") {
      sendJson(res, 400, { error: "Password required." });
      return;
    }

    if (!adminPassword) {
      sendJson(res, 500, { error: "Admin password not configured on server." });
      return;
    }

    const passwordBuffer = Buffer.from(body.password);
    const adminPasswordBuffer = Buffer.from(adminPassword);

    if (passwordBuffer.length !== adminPasswordBuffer.length) {
      sendJson(res, 401, { error: "Invalid password." });
      return;
    }

    const isValid = crypto.timingSafeEqual(passwordBuffer, adminPasswordBuffer);
    if (!isValid) {
      sendJson(res, 401, { error: "Invalid password." });
      return;
    }

    sendJson(res, 200, { token: crypto.randomBytes(32).toString("hex") });
    return;
  }

  if (req.method === "GET" && requestUrl.pathname === "/api/admin/submissions") {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.replace("Bearer ", "");

    if (!token || token.length < 16) {
      sendJson(res, 401, { error: "Unauthorized." });
      return;
    }

    if (!supabase) {
      sendJson(res, 500, {
        error:
          "Missing Supabase configuration. Set VITE_SUPABASE_URL and SUPABASE_SERVICE_KEY.",
      });
      return;
    }

    const { data, error } = await supabase
      .from("business_pilot_submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      sendJson(res, 500, { error: error.message });
      return;
    }

    sendJson(res, 200, { submissions: data || [] });
    return;
  }

  if (req.method === "POST" && requestUrl.pathname === "/api/business-pilot") {
    const body = await parseBody(req).catch(() => null);
    if (!body || typeof body !== "object") {
      sendJson(res, 400, { error: "Invalid payload." });
      return;
    }

    for (const field of requiredFields) {
      const value = body[field];
      if (typeof value !== "string" || !value.trim()) {
        console.error(`Validation failed for field '${field}': received ${typeof value} = ${JSON.stringify(value)}`);
        sendJson(res, 400, {
          error: `Please complete every field before submitting. Missing: ${field}`,
        });
        return;
      }
    }

    if (supabase) {
      try {
        const { error } = await supabase.from("business_pilot_submissions").insert([
          {
            business_name: body.businessName,
            contact_person: body.contactPerson,
            business_type: body.businessType,
            town: body.town,
            currently_offer_delivery: body.currentlyOfferDelivery,
            current_delivery_method: body.currentDeliveryMethod,
            average_deliveries_per_week: body.averageDeliveriesPerWeek,
            main_delivery_pain: body.mainDeliveryPain,
            local_delivery_partner_interest: body.localDeliveryPartnerInterest,
            short_interview_interest: body.shortInterviewInterest,
            whatsapp_number: body.whatsappNumber,
            email: body.email,
            source: "tsa-kasi-logistics-site",
          },
        ]);

        if (error) {
          console.error("Supabase insert error:", error);
          sendJson(res, 500, {
            error: `Database error: ${error.message}`,
          });
          return;
        }
      } catch (err) {
        console.error("Supabase submission exception:", err);
        sendJson(res, 500, {
          error: "Submission could not be saved right now. Please try again.",
        });
        return;
      }
    }

    if (pilotWebhookUrl) {
      const webhookResponse = await fetch(pilotWebhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source: "tsa-kasi-logistics-site",
          submittedAt: new Date().toISOString(),
          payload: body,
        }),
      });

      if (!webhookResponse.ok) {
        sendJson(res, 502, {
          error: "Submission could not be saved right now. Please try again.",
        });
        return;
      }
    }

    sendJson(res, 200, { success: true });
    return;
  }

  if (req.method === "POST" && requestUrl.pathname === "/api/generate-pdf") {
    const body = await parseBody(req).catch(() => null);

    if (!body || typeof body.markdown !== "string" || !body.markdown.trim()) {
      sendJson(res, 400, { error: "Markdown content is required." });
      return;
    }

    try {
      const { generatePdfDocument } = await import("./tsa-kasi-letterhead-system/pdf-service.js");
      const result = await generatePdfDocument({
        markdownSource: body.markdown,
        fileBaseName: sanitizeBaseName(body.fileName),
        overrides:
          body.overrides && typeof body.overrides === "object"
            ? body.overrides
            : {},
        useReferenceBackground: body.useReferenceBackground === true,
      });

      sendBinary(
        res,
        200,
        result.pdfBuffer,
        result.fileName,
        "application/pdf",
      );
    } catch (error) {
      console.error("PDF generation failed:", error);
      sendJson(res, 500, {
        error: "PDF generation failed. Please confirm the local PDF service dependencies are installed.",
      });
    }
    return;
  }

  sendJson(res, 404, { error: "Not found." });
});

server.listen(PORT, () => {
  console.log(`Local API server listening on http://localhost:${PORT}`);
});

function sanitizeBaseName(value) {
  if (typeof value !== "string" || !value.trim()) {
    return "tsa-kasi-document";
  }

  return value.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9-_ ]+/g, "").trim() || "tsa-kasi-document";
}
