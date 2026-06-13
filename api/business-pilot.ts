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
        payload,
      }),
    });

    if (!webhookResponse.ok) {
      res
        .status(502)
        .json({ error: "Submission could not be saved right now. Please try again." });
      return;
    }
  }

  console.log("Tsa Kasi business pilot submission", payload);

  res.status(200).json({ success: true });
}
