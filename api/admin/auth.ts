import crypto from "crypto";

type VercelLikeRequest = {
  method?: string;
  body?: { password?: string };
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

  const { password } = req.body || {};
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    res
      .status(500)
      .json({ error: "Admin password not configured on server." });
    return;
  }

  if (!password) {
    res.status(400).json({ error: "Password required." });
    return;
  }

  const passwordBuffer = Buffer.from(password);
  const adminPasswordBuffer = Buffer.from(adminPassword);

  if (passwordBuffer.length !== adminPasswordBuffer.length) {
    res.status(401).json({ error: "Invalid password." });
    return;
  }

  const isValid = crypto.timingSafeEqual(passwordBuffer, adminPasswordBuffer);

  if (!isValid) {
    res.status(401).json({ error: "Invalid password." });
    return;
  }

  // Generate a simple session token (in production, use proper JWT)
  const token = crypto.randomBytes(32).toString("hex");

  res.status(200).json({ token });
}
