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

function normalizeSupabaseUrl(url: string) {
  return url.replace(/\/rest\/v1\/?$/, "");
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

  console.log("Tsa Kasi business pilot submission", submission);

  res.status(200).json({ success: true });
}
