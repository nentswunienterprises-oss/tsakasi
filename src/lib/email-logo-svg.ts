import rawEmailLogoSvg from "@/assets/tsa-kasi-logo-email.svg?raw";

export const EMAIL_LOGO_SVG = decorateEmailLogoSvg(rawEmailLogoSvg);

function decorateEmailLogoSvg(rawSvg: string) {
  return rawSvg
    .replace(/<\?xml[\s\S]*?\?>\s*/i, "")
    .replace(
      /<svg\b([^>]*)>/i,
      `<svg$1 style="display:block;width:260px;max-width:100%;height:auto;margin:0 auto;">`,
    )
    .trim();
}
