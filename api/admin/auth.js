const crypto = require("crypto");

module.exports = async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed." });
      return;
    }

    const parsedBody =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const password = parsedBody.password;
    const adminPassword = (process.env.ADMIN_PASSWORD || "").replace(/\r?\n$/, "");

    if (!adminPassword) {
      res.status(500).json({ error: "Admin password not configured on server." });
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

    res.status(200).json({ token: crypto.randomBytes(32).toString("hex") });
  } catch (error) {
    res.status(500).json({
      error:
        error instanceof Error
          ? `Admin auth failed: ${error.message}`
          : "Admin auth failed.",
    });
  }
};
