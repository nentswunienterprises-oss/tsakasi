import { createClient } from "@supabase/supabase-js";

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
] as const;

type BusinessPilotPayload = Record<string, string>;

type VercelLikeRequest = {
  method?: string;
  body?: BusinessPilotPayload;
};

type VercelLikeResponse = {
  status: (code: number) => VercelLikeResponse;
  json: (body: unknown) => void;
};

const supabaseUrl = process.env.VITE_SUPABASE_URL?.trim();
const supabaseKey = process.env.SUPABASE_SERVICE_KEY?.trim();
const resendApiKey = process.env.RESEND_API_KEY?.trim();
const pilotNotificationFrom = process.env.PILOT_NOTIFICATION_FROM_EMAIL?.trim();
const pilotNotificationTo = process.env.PILOT_NOTIFICATION_TO_EMAIL?.trim();

function normalizeSupabaseUrl(url: string) {
  return url.replace(/\/rest\/v1\/?$/, "");
}

function parseEmailList(value?: string) {
  return (value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildNotificationRows(submission: BusinessPilotPayload) {
  return [
    ["Business name", submission.businessName],
    ["Contact person", submission.contactPerson],
    ["Business type", submission.businessType],
    ["Town", submission.town],
    ["Currently offer delivery", submission.currentlyOfferDelivery],
    ["Current delivery method", submission.currentDeliveryMethod],
    ["Average deliveries per week", submission.averageDeliveriesPerWeek],
    ["Main delivery pain", submission.mainDeliveryPain],
    ["Local delivery partner interest", submission.localDeliveryPartnerInterest],
    ["Short interview interest", submission.shortInterviewInterest],
    ["WhatsApp number", submission.whatsappNumber],
    ["Email", submission.email],
  ];
}

async function sendPilotNotificationEmail(submission: BusinessPilotPayload) {
  const recipients = parseEmailList(pilotNotificationTo);

  if (!resendApiKey || !pilotNotificationFrom || recipients.length === 0) {
    return;
  }

  const rows = buildNotificationRows(submission);
  const subject = `New business pilot submission: ${submission.businessName}`;
  const text = [
    "A new Tsa Kasi business pilot submission was received.",
    "",
    ...rows.map(([label, value]) => `${label}: ${value}`),
  ].join("\n");
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
      <h2 style="margin: 0 0 16px;">New Tsa Kasi business pilot submission</h2>
      <table style="border-collapse: collapse; width: 100%; max-width: 720px;">
        <tbody>
          ${rows
            .map(
              ([label, value]) => `
                <tr>
                  <td style="padding: 8px 12px; border: 1px solid #e5e7eb; font-weight: 700; background: #f9fafb; width: 220px;">
                    ${escapeHtml(label)}
                  </td>
                  <td style="padding: 8px 12px; border: 1px solid #e5e7eb;">
                    ${escapeHtml(value)}
                  </td>
                </tr>`,
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: pilotNotificationFrom,
      to: recipients,
      subject,
      html,
      text,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Resend notification failed: ${response.status} ${errorText}`);
  }
}

// Initialize Supabase if credentials are available
const supabase =
  supabaseUrl && supabaseKey
    ? createClient(normalizeSupabaseUrl(supabaseUrl), supabaseKey)
    : null;

export default async function handler(
  req: VercelLikeRequest,
  res: VercelLikeResponse,
) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed." });
    return;
  }

  const payload = req.body;

  for (const field of requiredFields) {
    if (!payload?.[field]?.trim()) {
      res
        .status(400)
        .json({ error: "Please complete every field before submitting." });
      return;
    }
  }

  const submission = payload as BusinessPilotPayload;

  // Save to Supabase if configured
  if (supabase) {
    try {
      const { error: dbError } = await supabase
        .from("business_pilot_submissions")
        .insert([
          {
            business_name: submission.businessName,
            contact_person: submission.contactPerson,
            business_type: submission.businessType,
            town: submission.town,
            currently_offer_delivery: submission.currentlyOfferDelivery,
            current_delivery_method: submission.currentDeliveryMethod,
            average_deliveries_per_week: submission.averageDeliveriesPerWeek,
            main_delivery_pain: submission.mainDeliveryPain,
            local_delivery_partner_interest:
              submission.localDeliveryPartnerInterest,
            short_interview_interest: submission.shortInterviewInterest,
            whatsapp_number: submission.whatsappNumber,
            email: submission.email,
            source: "tsa-kasi-logistics-site",
          },
        ]);

      if (dbError) {
        console.error("Supabase error:", dbError);
        res
          .status(500)
          .json({
            error: "Submission could not be saved right now. Please try again.",
          });
        return;
      }
    } catch (err) {
      console.error("Database submission error:", err);
      res
        .status(500)
        .json({
          error: "Submission could not be saved right now. Please try again.",
        });
      return;
    }
  }

  // Also send to external webhook if configured
  const webhookUrl = process.env.PILOT_WEBHOOK_URL;

  if (webhookUrl) {
    const webhookResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source: "tsa-kasi-logistics-site",
        submittedAt: new Date().toISOString(),
        payload: submission,
      }),
    });

    if (!webhookResponse.ok) {
      res
        .status(502)
        .json({
          error: "Submission could not be saved right now. Please try again.",
        });
      return;
    }
  }

  try {
    await sendPilotNotificationEmail(submission);
  } catch (error) {
    console.error("Pilot notification email error:", error);
  }

  console.log("Tsa Kasi business pilot submission", submission);

  res.status(200).json({ success: true });
}
