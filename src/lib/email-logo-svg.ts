const DEFAULT_EMAIL_LOGO_URL =
  "https://www.tsakasilogistics.co.za/brand/tsa-kasi-logo.png";

export const EMAIL_LOGO_SVG = buildEmailLogoImage();

function buildEmailLogoImage() {
  const configuredLogoUrl = import.meta.env.VITE_EMAIL_LOGO_URL;
  const logoUrl =
    typeof configuredLogoUrl === "string" && configuredLogoUrl.trim()
      ? configuredLogoUrl.trim()
      : DEFAULT_EMAIL_LOGO_URL;

  return `<img src="${logoUrl}" alt="Tsa Kasi Logistics logo" width="260" style="display:block;width:260px;max-width:100%;height:auto;margin:0 auto;border:0;outline:none;text-decoration:none;" />`;
}
