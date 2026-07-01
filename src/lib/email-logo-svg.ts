import rawEmailLogoSvg from "@/assets/tsa-kasi-logo-email.svg?raw";

export const EMAIL_LOGO_SVG = buildEmailLogoSvgImage(rawEmailLogoSvg);

function buildEmailLogoSvgImage(rawSvg: string) {
  const svgContent = rawSvg.replace(/<\?xml[\s\S]*?\?>\s*/i, "").trim();
  const svgBase64 = base64EncodeUnicode(svgContent);
  const dataUri = `data:image/svg+xml;base64,${svgBase64}`;

  return `<img src="${dataUri}" alt="Tsa Kasi Logistics logo" style="display:block;width:260px;max-width:100%;height:auto;margin:0 auto;" />`;
}

function base64EncodeUnicode(value: string) {
  // btoa only handles binary strings, so convert from UTF-8 first.
  return globalThis.btoa(
    unescape(encodeURIComponent(value)),
  );
}
